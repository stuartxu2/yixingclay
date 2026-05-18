# syntax=docker/dockerfile:1
#
# PO/ET commerce backend (MedusaJS v2).
# Build from apps/backend as the context:
#
#   docker build -f apps/backend/Dockerfile -t poet-backend ./apps/backend
#
# Debian-slim base (glibc): Medusa's migration / DB pooling stack hangs on an
# alpine/musl base, so this image deliberately avoids alpine.
#
# Runtime env (DATABASE_URL, REDIS_URL, STRIPE_*, RESEND_*, *_CORS, JWT_SECRET,
# COOKIE_SECRET) is supplied by the container platform, not baked in.

# ── builder: install deps and run `medusa build` ──────────────────────────
FROM node:22-slim AS builder
WORKDIR /app
# Toolchain for native modules (argon2 and friends).
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
# .npmrc carries `legacy-peer-deps=true`, required to resolve Medusa's deps.
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
# `medusa build` emits a self-contained server into .medusa/server
RUN npm run build
WORKDIR /app/.medusa/server
RUN npm install --omit=dev --legacy-peer-deps

# ── runner ────────────────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Native modules were compiled in the builder for this same platform.
COPY --from=builder /app/.medusa/server ./
EXPOSE 9000
# Start the server only. Database migrations are a release-step concern — run
# `npx medusa db:migrate` from the CI/CD pipeline against the target database
# before rolling out a new image, not on every container start.
CMD ["npm", "run", "start"]
