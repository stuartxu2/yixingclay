import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * PWA / install manifest. Kept minimal — the storefront is not an app, but a
 * valid manifest gives the brand a clean install card, themed address bar, and
 * removes the one missing piece of metadata infrastructure.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.legalName,
    short_name: SITE.name,
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fcfaf2",
    theme_color: "#fcfaf2",
    icons: [
      {
        src: "/brand/logo.avif",
        sizes: "512x512",
        type: "image/avif",
        purpose: "any",
      },
    ],
  };
}
