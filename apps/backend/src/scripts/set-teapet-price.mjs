/**
 * Set every published tea-pet's USD price.
 *
 * Tea-pets are products without `metadata.kind === "teapot"`. Teapots are left
 * untouched. Only the variant's base USD price is changed; any existing EUR
 * base price is preserved (deduped — some variants carry corrupt duplicate
 * entries from earlier test edits), and wholesale price-list prices live in a
 * separate price list and are not affected.
 *
 *   node src/scripts/set-teapet-price.mjs            # set $7.99 (default)
 *   node src/scripts/set-teapet-price.mjs 9.99       # set a different price
 *   node src/scripts/set-teapet-price.mjs --dry-run
 *   node src/scripts/set-teapet-price.mjs --only wukong
 *
 * Medusa stores amounts in minor units (cents): $7.99 → 799.
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
const dollarArg = args.find((a) => /^\d+(\.\d+)?$/.test(a));
const DOLLARS = dollarArg ? parseFloat(dollarArg) : 7.99;
const AMOUNT = Math.round(DOLLARS * 100); // cents

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

/** Build the new base price array: usd → AMOUNT, other currencies preserved (deduped). */
function nextPrices(variant) {
  const byCurrency = new Map();
  for (const pr of variant.prices ?? []) {
    const cc = pr.currency_code;
    if (cc === "usd") continue; // replaced below
    if (!byCurrency.has(cc)) byCurrency.set(cc, { amount: pr.amount, currency_code: cc });
  }
  return [{ amount: AMOUNT, currency_code: "usd" }, ...byCurrency.values()];
}

async function main() {
  console.log(
    `${DRY_RUN ? "[DRY RUN] " : ""}Set tea-pet USD price → $${DOLLARS.toFixed(2)} (amount ${AMOUNT}) on ${MEDUSA_URL}` +
      (ONLY ? ` (only ${ONLY})` : ""),
  );
  const token = await login();

  const { products } = await api(
    "GET",
    "/admin/products?limit=100&status[]=published&fields=id,handle,status,metadata,*variants,*variants.prices",
    token,
  );
  const teapets = products.filter((p) => !isTeapot(p) && (!ONLY || p.handle === ONLY));
  console.log(`${teapets.length} published tea-pet(s) to update.`);

  let updated = 0;
  for (const p of teapets) {
    const variants = (p.variants ?? []).map((v) => ({ id: v.id, prices: nextPrices(v) }));
    const before = (p.variants?.[0]?.prices ?? [])
      .filter((pr) => pr.currency_code === "usd")
      .map((pr) => pr.amount);
    if (DRY_RUN) {
      console.log(`  → ${p.handle}: usd ${JSON.stringify(before)} → [${AMOUNT}]  (${variants.length} variant)`);
      continue;
    }
    await api("POST", `/admin/products/${p.id}`, token, { variants });
    console.log(`  ✓ ${p.handle}: usd → ${AMOUNT}`);
    updated++;
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Done — ${DRY_RUN ? teapets.length + " would update" : updated + " updated"}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
