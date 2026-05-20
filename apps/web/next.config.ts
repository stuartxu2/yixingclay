import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP fallback. Project standard: all source images are
    // pre-encoded AVIF at ≤2000px long edge (see CLAUDE.md §2.A), so the
    // optimizer stays inside per-request encoding budgets.
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 24 h so repeated visits skip re-encoding.
    minimumCacheTTL: 86400,
    // Product images uploaded through the Medusa admin are served from Azure
    // Blob Storage (see apps/backend/src/modules/file-azure).
    remotePatterns: [
      { protocol: "https", hostname: "*.blob.core.windows.net" },
    ],
  },
  // Compile workspace packages shipped as TypeScript source.
  transpilePackages: ["@yixingclay/ts-types"],
  // Trace from the monorepo root so workspace deps are bundled correctly.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Emit a self-contained server bundle (.next/standalone) for a minimal
  // production container — see apps/web/Dockerfile.
  output: "standalone",
  poweredByHeader: false,
  // Proxy PostHog ingestion through our own origin so the browser only ever
  // talks to yixingclay.com/ingest — first-party requests survive ad-blockers.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // PostHog ingestion paths must not be trailing-slash-redirected.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
