# syntax=docker/dockerfile:1
#
# PO/ET storefront (Next.js 15, standalone output).
# Build from the MONOREPO ROOT as context so the @yixingclay/* workspace
# packages resolve:
#
#   docker build -f apps/web/Dockerfile -t poet-web \
#     --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yixingclay.com \
#     --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_... \
#     --build-arg NEXT_PUBLIC_MEDUSA_REGION_ID=reg_... \
#     --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_... \
#     .

# ── deps: install workspace dependencies (cached until a manifest changes) ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ts-types/package.json ./packages/ts-types/
COPY packages/ui-theme/package.json ./packages/ui-theme/
RUN npm ci

# ── builder: compile the Next.js standalone output ─────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# they must be present during `next build` — passed in as build args.
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_REGION_ID
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_MEDUSA_REGION_ID=$NEXT_PUBLIC_MEDUSA_REGION_ID \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_TELEMETRY_DISABLED=1
# Bring the whole installed tree from `deps` — npm workspaces place some
# packages in per-workspace node_modules, not just the hoisted root.
COPY --from=deps /app ./
# Overlay the source (node_modules excluded by .dockerignore).
COPY . .
RUN npm run build --workspace=@yixingclay/web

# ── runner: minimal image, just the standalone server ─────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
# Standalone output mirrors the monorepo layout under apps/web/.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
