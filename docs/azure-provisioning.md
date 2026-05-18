# Azure provisioning runbook — yixingclay.com (PO/ET)

One-time setup of the Azure infrastructure that
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) deploys into.
Run these `az` commands once from a machine with the Azure CLI
(`az login` first). After this runbook the GitHub Actions pipeline owns all
subsequent deploys.

Architecture: two **Azure Container Apps** (`poet-backend` MedusaJS,
`poet-web` Next.js) on a shared environment, backed by **Azure Database for
PostgreSQL Flexible Server**, images stored in **Azure Container Registry**.

---

## 0. Shell variables

```bash
# Edit these, then paste the whole block into your shell.
export RG=poet-rg
export LOCATION=eastus
export ACR=poetacr                       # must be globally unique, 5-50 alphanumerics
export PG=poet-pg-$RANDOM                 # Postgres server name, globally unique
export PG_ADMIN=poetadmin
export PG_PASSWORD='CHANGE-ME-strong-password'
export ENV=poet-env                       # Container Apps environment
export DB_NAME=medusa

# Generated app secrets — keep these somewhere safe.
export JWT_SECRET=$(openssl rand -hex 32)
export COOKIE_SECRET=$(openssl rand -hex 32)
```

---

## 1. Resource group

```bash
az group create --name "$RG" --location "$LOCATION"
```

## 2. Container Registry

```bash
az acr create --resource-group "$RG" --name "$ACR" --sku Basic
```

## 3. PostgreSQL Flexible Server

```bash
az postgres flexible-server create \
  --resource-group "$RG" --name "$PG" --location "$LOCATION" \
  --admin-user "$PG_ADMIN" --admin-password "$PG_PASSWORD" \
  --tier Burstable --sku-name Standard_B1ms \
  --storage-size 32 --version 16 \
  --database-name "$DB_NAME" \
  --public-access 0.0.0.0   # allow Azure services; tighten later if using VNet

# Connection string used by the backend and by the CI migrate step.
export DATABASE_URL="postgresql://$PG_ADMIN:$PG_PASSWORD@$PG.postgres.database.azure.com:5432/$DB_NAME?sslmode=require"
echo "$DATABASE_URL"
```

## 4. Container Apps environment

```bash
az extension add --name containerapp --upgrade
az provider register --namespace Microsoft.App --wait
az provider register --namespace Microsoft.OperationalInsights --wait

az containerapp env create \
  --name "$ENV" --resource-group "$RG" --location "$LOCATION"
```

## 5. First image build

The container apps need an image to start from. Build both images in ACR once
(the CI pipeline does this on every push thereafter):

```bash
# from the monorepo root
az acr build --registry "$ACR" --image poet-backend:latest \
  -f apps/backend/Dockerfile ./apps/backend

az acr build --registry "$ACR" --image poet-web:latest \
  -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yixingclay.com \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_... \
  --build-arg NEXT_PUBLIC_MEDUSA_REGION_ID=reg_... \
  --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... \
  .
```

> The web image inlines `NEXT_PUBLIC_*` at build time. The publishable key and
> region id come from the backend — if you don't have them yet, deploy the
> backend first (steps 6–7), create them in the Medusa admin, then rebuild web.

## 6. Backend container app (`poet-backend`)

```bash
az containerapp create \
  --name poet-backend --resource-group "$RG" --environment "$ENV" \
  --image "$ACR.azurecr.io/poet-backend:latest" \
  --registry-server "$ACR.azurecr.io" \
  --ingress external --target-port 9000 \
  --min-replicas 1 --max-replicas 1 \
  --cpu 1 --memory 2Gi \
  --secrets \
      database-url="$DATABASE_URL" \
      jwt-secret="$JWT_SECRET" \
      cookie-secret="$COOKIE_SECRET" \
      stripe-secret-key="sk_live_..." \
      stripe-webhook-secret="whsec_..." \
      resend-api-key="re_..." \
  --env-vars \
      NODE_ENV=production \
      DATABASE_URL=secretref:database-url \
      JWT_SECRET=secretref:jwt-secret \
      COOKIE_SECRET=secretref:cookie-secret \
      STRIPE_SECRET_KEY=secretref:stripe-secret-key \
      STRIPE_WEBHOOK_SECRET=secretref:stripe-webhook-secret \
      RESEND_API_KEY=secretref:resend-api-key \
      RESEND_FROM="PO/ET <orders@yixingclay.com>" \
      ORDER_NOTIFICATION_EMAIL=xutsiang@gmail.com \
      STORE_CORS=https://yixingclay.com \
      ADMIN_CORS=https://api.yixingclay.com \
      AUTH_CORS="https://yixingclay.com,https://api.yixingclay.com"
```

> `--min-replicas 1 --max-replicas 1`: Medusa v2's event bus and workflow
> engine run in-memory by default. Pinning to a single replica keeps that
> correct. To scale out, add the Redis modules to `medusa-config.ts` and an
> Azure Cache for Redis first.

Run the initial migration (from a host, e.g. your machine or the CI runner —
**not** inside the container):

```bash
cd apps/backend && npm ci && npx medusa db:migrate
```

Then create the admin user:

```bash
cd apps/backend && npx medusa user --email you@yixingclay.com --password '...'
```

## 7. Web container app (`poet-web`)

```bash
az containerapp create \
  --name poet-web --resource-group "$RG" --environment "$ENV" \
  --image "$ACR.azurecr.io/poet-web:latest" \
  --registry-server "$ACR.azurecr.io" \
  --ingress external --target-port 3000 \
  --min-replicas 1 --max-replicas 3 \
  --cpu 0.5 --memory 1Gi \
  --env-vars NODE_ENV=production
```

> The web app needs no runtime secrets — every `NEXT_PUBLIC_*` value was baked
> into the image at build time. It can scale out freely.

## 8. Custom domains

Get the default app FQDNs, then bind the real domains:

```bash
az containerapp show -n poet-web -g "$RG" --query properties.configuration.ingress.fqdn -o tsv
az containerapp show -n poet-backend -g "$RG" --query properties.configuration.ingress.fqdn -o tsv
```

Add CNAME records at your DNS provider (`yixingclay.com` → web FQDN,
`api.yixingclay.com` → backend FQDN), then:

```bash
az containerapp hostname add --name poet-web -g "$RG" --hostname yixingclay.com
az containerapp hostname bind --name poet-web -g "$RG" --hostname yixingclay.com \
  --environment "$ENV" --validation-method CNAME

az containerapp hostname add --name poet-backend -g "$RG" --hostname api.yixingclay.com
az containerapp hostname bind --name poet-backend -g "$RG" --hostname api.yixingclay.com \
  --environment "$ENV" --validation-method CNAME
```

## 9. Blob Storage for product images (optional but recommended)

Heavy teapot images should bypass container storage and serve from Blob CDN.

```bash
az storage account create --name poetassets$RANDOM --resource-group "$RG" \
  --location "$LOCATION" --sku Standard_LRS --kind StorageV2 --allow-blob-public-access true
```

Create a `media` container, then wire a Medusa file-storage provider for Azure
Blob into `medusa-config.ts` (`modules` → `@medusajs/file`). That change ships
through the normal CI pipeline.

## 10. Service principal for GitHub Actions

```bash
SUBSCRIPTION=$(az account show --query id -o tsv)

az ad sp create-for-rbac \
  --name poet-github-deploy \
  --role contributor \
  --scopes "/subscriptions/$SUBSCRIPTION/resourceGroups/$RG" \
  --sdk-auth
```

Copy the entire JSON output — it becomes the `AZURE_CREDENTIALS` secret.

---

## 11. GitHub repository configuration

In **Settings → Secrets and variables → Actions**:

| Kind     | Name                                  | Value |
|----------|---------------------------------------|-------|
| Secret   | `AZURE_CREDENTIALS`                   | the `--sdk-auth` JSON from step 10 |
| Secret   | `DATABASE_URL`                        | `$DATABASE_URL` from step 3 |
| Variable | `ACR_NAME`                            | `$ACR` (e.g. `poetacr`) |
| Variable | `AZURE_RESOURCE_GROUP`                | `$RG` (e.g. `poet-rg`) |
| Variable | `NEXT_PUBLIC_MEDUSA_BACKEND_URL`      | `https://api.yixingclay.com` |
| Variable | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`  | `pk_...` from Medusa admin |
| Variable | `NEXT_PUBLIC_MEDUSA_REGION_ID`        | `reg_...` from Medusa admin |
| Variable | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`  | `pk_live_...` |

Once set, every push to `main` builds, migrates, and deploys automatically.

---

## Post-deploy checklist

- [ ] `https://api.yixingclay.com/health` returns 200
- [ ] `https://api.yixingclay.com/app` loads the Medusa admin
- [ ] `https://yixingclay.com` renders the storefront
- [ ] Stripe webhook endpoint points to
      `https://api.yixingclay.com/hooks/payment/stripe_stripe`
- [ ] Resend domain `yixingclay.com` is verified
- [ ] A test order sends customer + staff emails
