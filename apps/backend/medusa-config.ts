import { loadEnv, defineConfig, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const REDIS_URL = process.env.REDIS_URL

// Redis-backed infrastructure. Azure Container Apps runs multiple replicas, so
// the in-memory defaults are unsafe in production: the local event bus only
// fires handlers on the replica that emitted the event, in-memory locking is
// not shared across replicas (oversell / double-charge risk), and the
// in-memory workflow engine loses running workflows on restart or scale-in.
// Registered only when REDIS_URL is set so local dev without Redis still boots
// on the in-memory defaults.
const redisModules = REDIS_URL
  ? [
      {
        // 2.15 caching module (providers pattern), not the legacy cache module.
        key: Modules.CACHING,
        resolve: "@medusajs/caching",
        options: {
          providers: [
            {
              resolve: "@medusajs/caching-redis",
              id: "caching-redis",
              options: { redisUrl: REDIS_URL },
            },
          ],
        },
      },
      {
        key: Modules.EVENT_BUS,
        resolve: "@medusajs/event-bus-redis",
        options: { redisUrl: REDIS_URL },
      },
      {
        key: Modules.WORKFLOW_ENGINE,
        resolve: "@medusajs/workflow-engine-redis",
        // Connection URL is nested under `redis.redisUrl` for this module
        // (top-level `redisUrl` is ignored; `redis.url` is deprecated).
        options: { redis: { redisUrl: REDIS_URL } },
      },
      {
        key: Modules.LOCKING,
        resolve: "@medusajs/locking",
        options: {
          providers: [
            {
              resolve: "@medusajs/locking-redis",
              id: "locking-redis",
              is_default: true,
              options: { redisUrl: REDIS_URL },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "@medusajs/payment-stripe",
            id: "stripe",
            options: {
              apiKey: process.env.STRIPE_SECRET_KEY,
              // Capture funds immediately on a successful payment instead of
              // only authorising. Without this, orders sit at "authorized"
              // and the customer's card is never actually charged.
              capture: true,
              // Verifies inbound Stripe webhooks (delivered to
              // POST /hooks/payment/stripe_stripe) so refunds, disputes, and
              // async payment events stay in sync with Medusa.
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    {
      // File storage on Azure Blob. Containers are stateless, so the default
      // local-disk provider loses admin-uploaded images on every redeploy —
      // see src/modules/file-azure.
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "./src/modules/file-azure",
            id: "azure-blob",
            options: {
              connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
              containerName: process.env.AZURE_STORAGE_CONTAINER || "media",
            },
          },
        ],
      },
    },
    {
      // Server-side analytics. Medusa core does not auto-emit analytics
      // events — see src/subscribers/order-placed.ts for the order event.
      resolve: "@medusajs/medusa/analytics",
      options: {
        providers: [
          {
            resolve: "@medusajs/analytics-posthog",
            id: "posthog",
            options: {
              posthogEventsKey: process.env.POSTHOG_EVENTS_API_KEY,
              posthogHost: process.env.POSTHOG_HOST,
            },
          },
        ],
      },
    },
    ...redisModules,
  ],
  plugins: [
    {
      resolve: "@rokmohar/medusa-plugin-meilisearch",
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST ?? "",
          apiKey: process.env.MEILISEARCH_API_KEY ?? "",
        },
        settings: {
          // The key `products` is the Meilisearch index name.
          products: {
            type: "products",
            enabled: true,
            // description is indexed for search but intentionally not returned in results
            fields: ["id", "title", "description", "handle", "thumbnail"],
            indexSettings: {
              searchableAttributes: ["title", "description"],
              displayedAttributes: ["id", "title", "handle", "thumbnail"],
              filterableAttributes: ["id", "handle"],
            },
            primaryKey: "id",
          },
        },
      },
    },
  ],
})
