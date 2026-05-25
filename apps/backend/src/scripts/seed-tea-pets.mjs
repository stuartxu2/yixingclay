/**
 * Seed the 18 PO/ET tea pets into Medusa.
 * Run once from apps/backend: node src/scripts/seed-tea-pets.mjs
 * Requires the backend to be running on localhost:9000.
 */

const MEDUSA_URL = "http://localhost:9000";
const ADMIN_EMAIL = "admin@yixingclay.com";
const ADMIN_PASSWORD = "PoetAdmin2026!";
const SALES_CHANNEL_ID = "sc_01KRSZ9W4RY5M7GB7D4PGFD729";

const PRODUCTS = [
  { slug: "wukong", name: "Wukong, the Stone Monkey", zh: "悟空", category: "legends", clay: "Lao Zi Ni · 老紫泥", price: 14500, poem: "Born of stone, steeped in mischief.", blurb: "The Monkey King mid-leap, hand shading his eyes. Sculpted from aged Zi Ni purple clay, his coat darkens with every pour of tea until the fur reads almost black.", height: 7.5, featured: true },
  { slug: "bajie", name: "Bajie, the Glutton", zh: "八戒", category: "legends", clay: "Duan Ni · 段泥", price: 9800, poem: "An appetite the size of a pilgrimage.", blurb: "Zhu Bajie at rest, belly forward, entirely unbothered. Pale Duan Ni clay gives him a warm sandy tone that drinks tea slowly and evenly.", height: 6.0 },
  { slug: "tangseng", name: "Tangseng, the Monk", zh: "唐僧", category: "legends", clay: "Zhu Ni · 朱泥", price: 11200, poem: "Calm at the centre of every storm.", blurb: "The pilgrim monk seated in stillness. Fired from bright Zhu Ni cinnabar clay — a high-shrinkage body prized for its bell-clear ring and deepening red.", height: 6.8, featured: true },
  { slug: "shaseng", name: "Sha Wujing", zh: "沙僧", category: "legends", clay: "Zi Ni · 紫泥", price: 9800, poem: "The quiet one who carries the load.", blurb: "Sandy Wujing, steady and broad-shouldered. Classic Zi Ni purple clay — the workhorse body of Yixing, dense and forgiving, a fine first pet to season.", height: 6.5 },
  { slug: "cat", name: "The White Cat", zh: "白猫", category: "cats", clay: "Duan Ni · 段泥", price: 6800, poem: "Sits where the sun lands.", blurb: "An upright cat with a watchful tilt. Pale Duan Ni starts the colour of raw biscuit and warms toward honey as the tea soaks in.", height: 5.2, featured: true },
  { slug: "standing-cat", name: "The Standing Cat", zh: "站立猫咪", category: "cats", clay: "Zi Ni · 紫泥", price: 7200, poem: "Tall enough to see the kettle.", blurb: "Caught on its hind legs, paws drawn in. Zi Ni purple clay holds detail crisply — every whisker and toe survives the kiln.", height: 6.4 },
  { slug: "sleeping-cat", name: "The Sleeping Cat", zh: "睡觉猫咪", category: "cats", clay: "Zhu Ni · 朱泥", price: 6800, poem: "Curled into a comma.", blurb: "A cat folded into sleep, nose to tail. Zhu Ni clay turns a glowing oxblood red the longer it lives at the tea table.", height: 3.8, featured: true },
  { slug: "lounging-cat", name: "The Lounging Cat", zh: "躺平猫", category: "cats", clay: "Duan Ni · 段泥", price: 7000, poem: "Flat out, and proud of it.", blurb: "The art of lying perfectly flat, in clay. Soft Duan Ni body with a matte, stone-like surface that loves to be rubbed with a tea brush.", height: 3.2 },
  { slug: "panda", name: "The Kung Fu Panda", zh: "功夫熊猫", category: "creatures", clay: "Zi Ni · 紫泥", price: 8800, poem: "Stillness, then a sudden stance.", blurb: "A panda mid-form, paws raised. Zi Ni purple clay — the two-tone sculpt keeps its contrast even as the whole piece deepens with tea.", height: 6.6, featured: true },
  { slug: "bear", name: "The Bear", zh: "熊", category: "creatures", clay: "Lao Zi Ni · 老紫泥", price: 8200, poem: "Heavy-footed, soft-hearted.", blurb: "A rounded bear, sitting back on its haunches. Aged Zi Ni gives a deep cocoa tone that grows richer with each tea session.", height: 6.0 },
  { slug: "whale", name: "The Whale", zh: "鲸", category: "creatures", clay: "Ben Shan Lü Ni · 本山绿泥", price: 9400, poem: "Carries an ocean, asks for nothing.", blurb: "A breaching whale, tail curled. Rare Ben Shan green clay fires a soft greyed-green and slowly takes on a sea-glass depth.", height: 4.5, featured: true },
  { slug: "horse", name: "The Foal", zh: "马驹", category: "creatures", clay: "Zhu Ni · 朱泥", price: 8600, poem: "New legs, old spirit.", blurb: "A young horse finding its footing. Bright Zhu Ni cinnabar clay — the high iron content fires a warm, living red.", height: 6.2 },
  { slug: "sheep", name: "The Ram", zh: "白羊", category: "creatures", clay: "Duan Ni · 段泥", price: 7600, poem: "Wool you can almost feel.", blurb: "A ram with a coiled fleece, head lowered. Pale Duan Ni clay carries the carved wool texture beautifully and warms to oat-gold.", height: 5.4 },
  { slug: "hedgehog", name: "Durian the Hedgehog", zh: "榴莲刺猬", category: "creatures", clay: "Zi Ni · 紫泥", price: 6400, poem: "Prickly outside, sweet within — a small joke in clay.", blurb: "Part hedgehog, part durian — a studio pun. Zi Ni purple clay holds each tiny spine sharp through the firing.", height: 3.6 },
  { slug: "hulk", name: "The Green Giant", zh: "绿巨人", category: "creatures", clay: "Ben Shan Lü Ni · 本山绿泥", price: 9200, poem: "Built like a boulder, calm as one.", blurb: "A heavy-set giant mid-stride. Fired from scarce Ben Shan green clay for a naturally muted, mineral green that no glaze could match.", height: 7.0 },
  { slug: "shin", name: "Little Shin", zh: "蜡笔小新", category: "creatures", clay: "Zhu Ni · 朱泥", price: 5800, poem: "Trouble, the cheerful kind.", blurb: "A small grinning troublemaker, hands on hips. Zhu Ni clay gives the smallest pieces a clean ring and a fast-developing shine.", height: 4.8 },
  { slug: "duck-pear", name: "The Pear", zh: "鸭梨山大", category: "creatures", clay: "Duan Ni · 段泥", price: 5400, poem: "All of the pressure, none of the worry.", blurb: "A pear with a face — another studio wordplay on bearing pressure lightly. Soft Duan Ni body, perfectly palm-sized.", height: 4.0 },
  { slug: "cicada", name: "The Golden Cicada", zh: "金蝉", category: "creatures", clay: "Zhu Ni · 朱泥", price: 6200, poem: "A long silence, then song.", blurb: "A cicada at rest, wings folded — an old Chinese emblem of rebirth. Zhu Ni clay fires a deep amber-red across the carved wings.", height: 3.0 },
];

const CATEGORIES = [
  { handle: "cats", name: "Cats" },
  { handle: "legends", name: "Journey West" },
  { handle: "creatures", name: "Creatures" },
];

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
    const text = await res.text();
    throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log("Authenticating...");
  const { token } = await api("POST", "/auth/user/emailpass", null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  // 1. Create categories
  console.log("\nCreating product categories...");
  const categoryMap = {};
  for (const cat of CATEGORIES) {
    try {
      const { product_category } = await api("POST", "/admin/product-categories", token, {
        name: cat.name,
        handle: cat.handle,
        is_active: true,
        is_internal: false,
      });
      categoryMap[cat.handle] = product_category.id;
      console.log(`  ✓ ${cat.name} (${product_category.id})`);
    } catch (e) {
      if (e.message.includes("409") || e.message.includes("already")) {
        // Fetch existing
        const { product_categories } = await api("GET", `/admin/product-categories?handle=${cat.handle}`, token);
        categoryMap[cat.handle] = product_categories[0].id;
        console.log(`  ~ ${cat.name} already exists`);
      } else {
        throw e;
      }
    }
  }

  // 2. Create products
  console.log("\nSeeding 18 tea pets...");
  for (const p of PRODUCTS) {
    try {
      const payload = {
        title: p.name,
        handle: p.slug,
        description: p.blurb,
        status: "published",
        thumbnail: `/products/${p.slug}/front.avif`,
        metadata: {
          zh: p.zh,
          clay: p.clay,
          poem: p.poem,
          height: p.height,
          ...(p.featured ? { featured: true } : {}),
        },
        categories: [{ id: categoryMap[p.category] }],
        sales_channels: [{ id: SALES_CHANNEL_ID }],
        options: [{ title: "Title", values: ["Default"] }],
        variants: [
          {
            title: "Default",
            manage_inventory: false,
            options: { Title: "Default" },
            prices: [{ amount: p.price, currency_code: "usd" }],
          },
        ],
      };
      await api("POST", "/admin/products", token, payload);
      console.log(`  ✓ ${p.name}`);
    } catch (e) {
      if (e.message.includes("409") || e.message.includes("unique")) {
        console.log(`  ~ ${p.name} already exists, skipping`);
      } else {
        console.error(`  ✗ ${p.name}: ${e.message}`);
      }
    }
  }

  console.log("\nDone! All tea pets seeded.");
  console.log(`Publishable API key: pk_a49bbf556cf59f5fcc7a7016ca1174c6ca8497e905c03d8f4dc91b98b977746f`);
}

main().catch((e) => { console.error(e); process.exit(1); });
