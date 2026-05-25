/**
 * Upload teapot photography into Medusa (→ Azure Blob via the file-azure
 * module) and attach the blob URLs to each teapot product.
 *
 * After this runs, teapot images live in Medusa storage — store managers can
 * reorder/replace them in the admin, and the storefront reads them straight
 * off the product record.
 *
 * Source images: apps/web/public/teapots/<slug>/{1..5}.avif
 *
 *   node src/scripts/upload-teapot-images.mjs
 *
 * Safe to re-run — products that already carry blob-hosted images are skipped.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const MEDUSA_URL = process.env.MEDUSA_URL ?? "https://api.yixingclay.com";
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL ?? "admin@yixingclay.com";
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD ?? "PoetAdmin2026!";

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../../../..");
const IMAGES_DIR = path.join(REPO_ROOT, "apps/web/public/teapots");

async function api(method, pathname, token, body) {
  const res = await fetch(`${MEDUSA_URL}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    throw new Error(`${method} ${pathname} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** Upload a list of local files to Medusa, returning their blob URLs. */
async function uploadFiles(token, files) {
  const form = new FormData();
  for (const file of files) {
    const buf = readFileSync(file);
    form.append("files", new Blob([buf], { type: "image/avif" }), path.basename(file));
  }
  const res = await fetch(`${MEDUSA_URL}/admin/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`POST /admin/uploads → ${res.status}: ${await res.text()}`);
  }
  const { files: uploaded } = await res.json();
  return uploaded.map((f) => f.url);
}

async function main() {
  console.log(`Uploading teapot images to ${MEDUSA_URL} ...`);
  const { token } = await api("POST", "/auth/user/emailpass", null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  }).catch(async () => {
    // /auth path takes no token; retry without the Authorization header.
    const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    return res.json();
  });

  const slugs = readdirSync(IMAGES_DIR).filter((s) =>
    existsSync(path.join(IMAGES_DIR, s)),
  );
  console.log(`Found ${slugs.length} teapot image folders.`);

  let updated = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const { products } = await api(
      "GET",
      `/admin/products?handle=${slug}&fields=id,thumbnail,*images&limit=1`,
      token,
    );
    const product = products[0];
    if (!product) {
      console.log(`  ? ${slug} — no Medusa product, skipping`);
      skipped++;
      continue;
    }
    // Already migrated — every image is blob-hosted.
    const imgs = product.images ?? [];
    if (
      imgs.length > 0 &&
      imgs.every((i) => i.url.includes("blob.core.windows.net"))
    ) {
      console.log(`  ~ ${slug} — already on blob storage, skipping`);
      skipped++;
      continue;
    }

    const dir = path.join(IMAGES_DIR, slug);
    const files = readdirSync(dir)
      .filter((f) => /\.avif$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => path.join(dir, f));
    if (files.length === 0) {
      console.log(`  ? ${slug} — no local images, skipping`);
      skipped++;
      continue;
    }

    const urls = await uploadFiles(token, files);
    await api("POST", `/admin/products/${product.id}`, token, {
      thumbnail: urls[0],
      images: urls.map((url) => ({ url })),
    });
    console.log(`  ✓ ${slug} — ${urls.length} image(s) on blob storage`);
    updated++;
  }

  console.log(`\nDone — ${updated} updated, ${skipped} skipped.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
