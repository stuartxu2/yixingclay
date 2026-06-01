/**
 * Clean up the 18 PO/ET tea-pets on the live backend.
 *
 * Tea-pets are products WITHOUT `metadata.kind === "teapot"` (teapots carry
 * that flag and live in the "teapots" category — left untouched here).
 *
 * For every tea-pet this script, in one pass:
 *   1. Sets the USD base price into the $11.99–$14.99 band (tiered by the
 *      piece's original value — see PRICE below). EUR/other base prices are
 *      preserved and de-duped; wholesale price-list prices are untouched.
 *   2. Assigns the single "teapets" product category (created if missing).
 *   3. Writes `metadata.group` (cats | legends | creatures) so the storefront
 *      filter chips keep working off one Medusa category.
 *   4. Fills SEO / AEO fields: `subtitle`, product `tags`, and
 *      `metadata.seo_title` / `seo_description` / `keywords`.
 *
 *   node src/scripts/cleanup-tea-pets.mjs --dry-run        # preview, no writes
 *   node src/scripts/cleanup-tea-pets.mjs                  # apply to prod
 *   node src/scripts/cleanup-tea-pets.mjs --only wukong    # one pet
 *
 * Medusa stores amounts in minor units (cents): $12.99 → 1299.
 */

const MEDUSA_URL = process.env.MEDUSA_URL ?? "https://api.yixingclay.com";
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL ?? "admin@yixingclay.com";
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("Set MEDUSA_ADMIN_PASSWORD (admin credential) before running.");
  process.exit(1);
}

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const onlyIdx = args.indexOf("--only");
const ONLY = onlyIdx !== -1 ? args[onlyIdx + 1] : null;

/* ── Per-pet data ──────────────────────────────────────────────────────────
 * group:  storefront filter family (cats | legends | creatures)
 * price:  tiered USD price in cents, $11.99–$14.99, ranked by original value
 */
const PETS = {
  // Journey to the West — the marquee pieces, top of the band
  wukong:       { group: "legends",   price: 1499 },
  tangseng:     { group: "legends",   price: 1499 },
  bajie:        { group: "legends",   price: 1499 },
  shaseng:      { group: "legends",   price: 1499 },
  // Creatures
  whale:        { group: "creatures", price: 1399 },
  hulk:         { group: "creatures", price: 1399 },
  panda:        { group: "creatures", price: 1399 },
  horse:        { group: "creatures", price: 1399 },
  bear:         { group: "creatures", price: 1299 },
  sheep:        { group: "creatures", price: 1299 },
  cicada:       { group: "creatures", price: 1199 },
  hedgehog:     { group: "creatures", price: 1199 },
  shin:         { group: "creatures", price: 1199 },
  "duck-pear":  { group: "creatures", price: 1199 },
  // Cats
  "standing-cat": { group: "cats", price: 1299 },
  cat:            { group: "cats", price: 1299 },
  "lounging-cat": { group: "cats", price: 1299 },
  "sleeping-cat": { group: "cats", price: 1199 },
};

const GROUP_LABEL = {
  cats: "cat",
  legends: "Journey to the West",
  creatures: "creature",
};

const GROUP_KEYWORDS = {
  cats: ["clay cat figurine", "Yixing cat tea pet"],
  legends: ["Journey to the West tea pet", "Sun Wukong tea figure"],
  creatures: ["zodiac tea pet", "clay creature figurine"],
};

/** First clay token, e.g. "Zi Ni · 紫泥" → "Zi Ni". */
const clayKey = (clay) => (clay ?? "").split(" · ")[0] || clay || "Yixing clay";

/** Cap a string to `n` chars on a word boundary (for meta description). */
function clamp(str, n) {
  if (str.length <= n) return str;
  const cut = str.slice(0, n);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:\s]+$/, "") + "…";
}

function buildSeo(p) {
  const meta = p.metadata ?? {};
  const zh = String(meta.zh ?? "");
  const clay = String(meta.clay ?? "");
  const group = PETS[p.handle].group;
  const blurb = p.description ?? "";

  const seo_title = clamp(`${p.title} — Yixing Zisha Tea Pet (茶宠)`, 60);
  const seo_description = clamp(
    `${blurb} Handmade Yixing zisha tea pet, single-fired ${clayKey(clay)} clay.`,
    160,
  );
  const keywords = [
    "Yixing tea pet",
    "zisha tea pet",
    "茶宠",
    "purple clay tea pet",
    "gongfu tea pet",
    "handmade tea pet",
    p.title,
    zh,
    clayKey(clay),
    ...(GROUP_KEYWORDS[group] ?? []),
  ].filter(Boolean);

  return { seo_title, seo_description, keywords, group };
}

function buildTags(p) {
  const meta = p.metadata ?? {};
  const group = PETS[p.handle].group;
  return [
    "Yixing tea pet",
    "zisha 紫砂",
    "茶宠",
    GROUP_LABEL[group],
    clayKey(String(meta.clay ?? "")),
  ].filter(Boolean);
}

function subtitleFor(p) {
  const zh = String((p.metadata ?? {}).zh ?? "");
  return `Handmade Yixing zisha tea pet · 茶宠${zh ? ` · ${zh}` : ""}`;
}

/* ── HTTP ──────────────────────────────────────────────────────────────────*/
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

async function login() {
  const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`auth → ${res.status}: ${await res.text()}`);
  return (await res.json()).token;
}

const isTeapot = (p) => (p.metadata?.kind ?? "") === "teapot";

/** USD → AMOUNT, other base currencies preserved (deduped). */
function nextPrices(variant, amount) {
  const byCurrency = new Map();
  for (const pr of variant.prices ?? []) {
    const cc = pr.currency_code;
    if (cc === "usd") continue;
    if (!byCurrency.has(cc)) byCurrency.set(cc, { amount: pr.amount, currency_code: cc });
  }
  return [{ amount, currency_code: "usd" }, ...byCurrency.values()];
}

/**
 * Resolve tag values → ids, creating any that don't exist. Medusa v2's product
 * update only accepts `tags: [{ id }]`, so values must be upserted first.
 * Returns null if the product-tags admin endpoint is unavailable (tags skipped).
 */
async function ensureTags(token, values, cache) {
  const ids = [];
  for (const value of values) {
    if (cache.has(value)) {
      ids.push(cache.get(value));
      continue;
    }
    try {
      const found = await api(
        "GET",
        `/admin/product-tags?value=${encodeURIComponent(value)}`,
        token,
      );
      let id = found.product_tags?.[0]?.id;
      if (!id) {
        const created = await api("POST", "/admin/product-tags", token, { value });
        id = created.product_tag.id;
      }
      cache.set(value, id);
      ids.push(id);
    } catch {
      return null; // endpoint missing / not permitted → skip tags
    }
  }
  return ids;
}

/** Find or create the "teapets" category, return its id. */
async function ensureCategory(token) {
  const { product_categories } = await api(
    "GET",
    "/admin/product-categories?handle=teapets",
    token,
  );
  if (product_categories?.length) return product_categories[0].id;
  if (DRY_RUN) return "(dry-run-new-teapets-category)";
  const { product_category } = await api("POST", "/admin/product-categories", token, {
    name: "Tea Pets",
    handle: "teapets",
    description: "Handmade Yixing zisha clay tea pets (茶宠) raised on years of tea.",
    is_active: true,
    is_internal: false,
  });
  return product_category.id;
}

async function main() {
  console.log(
    `${DRY_RUN ? "[DRY RUN] " : ""}Tea-pet cleanup on ${MEDUSA_URL}` +
      (ONLY ? ` (only ${ONLY})` : ""),
  );
  const token = await login();

  const categoryId = await ensureCategory(token);
  console.log(`teapets category → ${categoryId}\n`);

  const { products } = await api(
    "GET",
    "/admin/products?limit=100&status[]=published&fields=id,title,handle,subtitle,description,*metadata,*categories,*variants.prices",
    token,
  );
  const pets = products.filter(
    (p) => !isTeapot(p) && PETS[p.handle] && (!ONLY || p.handle === ONLY),
  );
  console.log(`${pets.length} tea-pet(s) to update.\n`);

  const unknown = products.filter((p) => !isTeapot(p) && !PETS[p.handle]);
  if (unknown.length) {
    console.log(
      `⚠ ${unknown.length} non-teapot product(s) not in PETS map (skipped): ${unknown
        .map((p) => p.handle)
        .join(", ")}\n`,
    );
  }

  const tagCache = new Map();
  let updated = 0;
  for (const p of pets) {
    const cfg = PETS[p.handle];
    const seo = buildSeo(p);
    const tags = buildTags(p);
    const variants = (p.variants ?? []).map((v) => ({
      id: v.id,
      prices: nextPrices(v, cfg.price),
    }));
    const body = {
      subtitle: subtitleFor(p),
      categories: [{ id: categoryId }],
      metadata: {
        ...(p.metadata ?? {}),
        group: seo.group,
        seo_title: seo.seo_title,
        seo_description: seo.seo_description,
        keywords: seo.keywords,
      },
      variants,
    };
    if (!DRY_RUN) {
      const tagIds = await ensureTags(token, tags, tagCache);
      if (tagIds) body.tags = tagIds.map((id) => ({ id }));
    }

    if (DRY_RUN) {
      const usdBefore = (p.variants?.[0]?.prices ?? [])
        .filter((pr) => pr.currency_code === "usd")
        .map((pr) => pr.amount);
      console.log(`→ ${p.handle}`);
      console.log(`    price   usd ${JSON.stringify(usdBefore)} → ${cfg.price}`);
      console.log(`    group   ${seo.group}`);
      console.log(`    title   ${seo.seo_title}`);
      console.log(`    desc    ${seo.seo_description}`);
      console.log(`    tags    ${tags.join(", ")}`);
      console.log("");
      continue;
    }

    try {
      await api("POST", `/admin/products/${p.id}`, token, body);
      const tagNote = body.tags ? `${body.tags.length} tags` : "tags skipped";
      console.log(`✓ ${p.handle}: $${(cfg.price / 100).toFixed(2)}, ${seo.group}, SEO + ${tagNote}`);
      updated++;
    } catch (e) {
      console.error(`✗ ${p.handle}: ${e.message}`);
    }
  }

  console.log(
    `\n${DRY_RUN ? "[DRY RUN] " : ""}Done — ${
      DRY_RUN ? pets.length + " would update" : updated + " updated"
    }.`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
