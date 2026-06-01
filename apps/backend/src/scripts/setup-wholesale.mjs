/**
 * Set up B2B wholesale pricing:
 *   1. A "Wholesale" customer group (trade accounts are added to it by an
 *      admin — see the FAQ: "Contact the studio to open a trade account").
 *   2. An "override" price list scoped to that group, giving every variant a
 *      trade price of 30% off retail.
 *
 * Run from apps/backend with the backend live:  node src/scripts/setup-wholesale.mjs
 * Safe to re-run — the group and price list are only created if missing.
 */

const MEDUSA_URL = "http://localhost:9000";
const ADMIN_EMAIL = "test-admin@yixingclay.com";
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("Set MEDUSA_ADMIN_PASSWORD (admin credential) before running.");
  process.exit(1);
}
const WHOLESALE_FACTOR = 0.7; // 30% trade discount

async function api(method, path, token, body) {
  const res = await fetch(`${MEDUSA_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const { token } = await api("POST", "/auth/user/emailpass", null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  // 1. Wholesale customer group
  const { customer_groups } = await api("GET", "/admin/customer-groups?limit=100", token);
  let group = customer_groups.find((g) => g.name === "Wholesale");
  if (group) {
    console.log(`~ Wholesale customer group already exists (${group.id})`);
  } else {
    const created = await api("POST", "/admin/customer-groups", token, {
      name: "Wholesale",
    });
    group = created.customer_group;
    console.log(`✓ Created Wholesale customer group (${group.id})`);
  }

  // 2. Bail if the price list is already there
  const { price_lists } = await api("GET", "/admin/price-lists?limit=100", token);
  if (price_lists.some((p) => p.title === "Wholesale Pricing")) {
    console.log("~ 'Wholesale Pricing' price list already exists — done.");
    return;
  }

  // 3. Read retail prices, derive wholesale prices
  const { products } = await api(
    "GET",
    "/admin/products?limit=100&fields=id,title,*variants,*variants.prices",
    token,
  );
  const prices = [];
  for (const product of products) {
    for (const variant of product.variants ?? []) {
      const usd = variant.prices?.find((pr) => pr.currency_code === "usd");
      if (!usd) continue;
      // 30% off, rounded to a whole dollar for clean trade invoicing
      const wholesale = Math.round((usd.amount * WHOLESALE_FACTOR) / 100) * 100;
      prices.push({
        currency_code: "usd",
        amount: wholesale,
        variant_id: variant.id,
      });
    }
  }

  // 4. Create the wholesale price list, scoped to the customer group
  await api("POST", "/admin/price-lists", token, {
    title: "Wholesale Pricing",
    description: "Trade pricing for approved wholesale accounts — 30% off retail.",
    type: "override",
    status: "active",
    rules: { "customer.groups.id": [group.id] },
    prices,
  });
  console.log(`✓ Created 'Wholesale Pricing' price list — ${prices.length} variant prices`);
  console.log("\nDone. Add trade customers to the Wholesale group to grant them pricing.");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
