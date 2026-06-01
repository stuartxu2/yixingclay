/**
 * Re-encode every product's blob-hosted photography to AVIF.
 *
 * Live products were seeded with JPG blobs (…/media/<ts>-N.jpg) before the
 * file-azure module learned to re-encode uploads to AVIF. This script
 * re-uploads the local AVIF sources through /admin/uploads — the module emits
 * fresh `.avif` blobs — and re-points each product's thumbnail + images.
 *
 * Source images:
 *   teapots  → apps/web/public/teapots/<handle>/{1..5}.avif   (numeric order)
 *   tea-pets → apps/web/public/products/<handle>/<role>.avif  (STANDARD_ROLES order)
 *
 * Old JPG blobs are left in the container (orphaned, not deleted) so the
 * migration is reversible by restoring the previous product image URLs.
 *
 *   node src/scripts/migrate-blob-to-avif.mjs --dry-run       # audit only
 *   node src/scripts/migrate-blob-to-avif.mjs --only s0103    # one product
 *   node src/scripts/migrate-blob-to-avif.mjs                 # migrate all
 *
 * Idempotent — products whose images are already all `.avif` are skipped.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const MEDUSA_URL = process.env.MEDUSA_URL ?? "https://api.yixingclay.com";
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL ?? "admin@yixingclay.com";
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("Set MEDUSA_ADMIN_PASSWORD (admin credential) before running.");
  process.exit(1);
}

const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "../../../../..");
const TEAPOTS_DIR = path.join(REPO_ROOT, "apps/web/public/teapots");
const TEAPETS_DIR = path.join(REPO_ROOT, "apps/web/public/products");

// Mirror apps/web/lib/products.ts so the re-uploaded order keeps the storefront's
// positional role labels intact.
const STANDARD_ROLES = ["front", "left", "right", "back", "hand", "tray", "pottery"];
const HULK_ROLES = ["front", "left", "right", "back", "size", "pottery"];

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const onlyIdx = args.indexOf("--only");
const ONLY = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

async function api(method, pathname, token, body) {
  const res = await fetch(`${MEDUSA_URL}${pathname}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    throw new Error(`${method} ${pathname} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** Upload local files to Medusa; the file-azure module re-encodes them to AVIF. */
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

/** Ordered local AVIF source files for a product, or [] if no local source. */
function localSources(handle) {
  const teapotDir = path.join(TEAPOTS_DIR, handle);
  if (existsSync(teapotDir)) {
    return readdirSync(teapotDir)
      .filter((f) => /\.avif$/i.test(f))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((f) => path.join(teapotDir, f));
  }
  const teapetDir = path.join(TEAPETS_DIR, handle);
  if (existsSync(teapetDir)) {
    const roles = handle === "hulk" ? HULK_ROLES : STANDARD_ROLES;
    return roles
      .map((role) => path.join(teapetDir, `${role}.avif`))
      .filter((p) => existsSync(p));
  }
  return [];
}

const isAvif = (url) => /\.avif(\?|$)/i.test(url);

async function login() {
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`auth → ${res.status}: ${await res.text()}`);
  return (await res.json()).token;
}

async function* allProducts(token) {
  const limit = 100;
  for (let offset = 0; ; offset += limit) {
    const { products, count } = await api(
      "GET",
      `/admin/products?limit=${limit}&offset=${offset}&fields=id,handle,thumbnail,*images`,
      token,
    );
    for (const p of products) yield p;
    if (offset + limit >= count) break;
  }
}

async function main() {
  console.log(
    `${DRY_RUN ? "[DRY RUN] " : ""}Migrating blob photos → AVIF on ${MEDUSA_URL}` +
      (ONLY ? ` (only ${ONLY})` : ""),
  );
  const token = await login();

  let migrated = 0;
  let skippedDone = 0;
  let skippedNoSource = 0;
  let needWork = 0;

  for await (const p of allProducts(token)) {
    if (ONLY && p.handle !== ONLY) continue;

    const imgs = p.images ?? [];
    const allAvif =
      imgs.length > 0 &&
      imgs.every((i) => isAvif(i.url)) &&
      (!p.thumbnail || isAvif(p.thumbnail));
    if (allAvif) {
      skippedDone++;
      continue;
    }

    const files = localSources(p.handle);
    if (files.length === 0) {
      console.log(`  ? ${p.handle} — ${imgs.length} blob img(s), no local AVIF source, SKIP`);
      skippedNoSource++;
      continue;
    }

    needWork++;
    if (DRY_RUN) {
      console.log(
        `  → ${p.handle} — ${imgs.length} blob img(s) → would re-upload ${files.length} AVIF ` +
          `(${files.map((f) => path.basename(f)).join(", ")})`,
      );
      continue;
    }

    const urls = await uploadFiles(token, files);
    await api("POST", `/admin/products/${p.id}`, token, {
      thumbnail: urls[0],
      images: urls.map((url) => ({ url })),
    });
    console.log(`  ✓ ${p.handle} — ${urls.length} AVIF blob(s) attached`);
    migrated++;
  }

  console.log(
    `\n${DRY_RUN ? "[DRY RUN] " : ""}Done — ` +
      (DRY_RUN
        ? `${needWork} would migrate, `
        : `${migrated} migrated, `) +
      `${skippedDone} already AVIF, ${skippedNoSource} no local source.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
