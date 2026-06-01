/**
 * Seed the 24 PO/ET teapots into Medusa as purchasable products.
 *
 * The storefront renders teapot pages from static data in
 * `apps/web/lib/teapots.ts`, but checkout maps each product handle to a
 * Medusa variant — so the catalogue needs matching products here. Handles
 * equal the storefront slugs (`s0103`…), USD prices are in cents, and each
 * variant manages inventory at its own stock level.
 *
 * This hits the Medusa admin REST API directly (the running backend), the
 * same approach as `seed-tea-pets.mjs` — no local module bootstrap needed.
 *
 *   node src/scripts/seed-teapots.mjs                 # → production
 *   MEDUSA_URL=http://localhost:9000 node src/scripts/seed-teapots.mjs
 *
 * Safe to re-run — teapots whose handle already exists are skipped.
 */

const MEDUSA_URL = process.env.MEDUSA_URL ?? "https://api.yixingclay.com";
const ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL ?? "admin@yixingclay.com";
const ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD;
if (!ADMIN_PASSWORD) {
  console.error("Set MEDUSA_ADMIN_PASSWORD (admin credential) before running.");
  process.exit(1);
}
const STORE_ORIGIN = "https://yixingclay.com";

const TEAPOTS = [
  { slug: "s0103", name: "The Coin Pot", zh: "钱多多", artist: "Yao Yun", clay: "Purple Gold Sand · 紫玉金砂", shape: "Round-bellied gongfu pot", capacity: 90, dimensions: "11.3 × 7.5 × 5.2 cm", weight: 110, price: 28000, stock: 12, poem: "A small pot named for abundance.", blurb: "A compact, low-shouldered pot thrown from purple gold sand — a zini variant flecked with mica that catches light like scattered grit of gold. At 90 ml it is built for solo gongfu sessions and warms to a deeper aubergine the longer it is brewed.", featured: true },
  { slug: "s0119", name: "The Gourd of Fortune", zh: "福禄", artist: "Yi Fou", clay: "Purple Clay · 紫泥", shape: "Gourd form, double-stacked", capacity: 175, dimensions: "10.8 × 7.5 × 8.8 cm", weight: 116, price: 28000, stock: 3, poem: "Fu and Lu — fortune stacked on prosperity.", blurb: "A tall gourd pot, its body pinched into the twin swell of the fu-lu — the bottle-gourd that Chinese craft has carried as a blessing for centuries. Classic Zi Ni purple clay, dense and even, holds the carved waist crisply through the kiln." },
  { slug: "s0136", name: "Door God — Peace", zh: "门神（平安）", artist: "Yi Fou", clay: "Blended Purple Clay · 拼紫泥", shape: "Relief-carved figural pot", capacity: 160, dimensions: "9.5 × 6.3 × 9.7 cm", weight: 102, price: 33500, stock: 2, poem: "A guardian pressed into the clay.", blurb: "A tall pot carrying a low-relief door god — the painted guardian pasted to Chinese gates at New Year — modelled directly into the soft wall. Blended purple clay gives a warm, even brown that lets the carved figure read clearly without glaze." },
  { slug: "s0117", name: "The Dragon Bridge", zh: "龙提梁", artist: "Yi Fou", clay: "Aged Purple Clay · 老紫泥", shape: "Ti Liang — overhead bridge handle", capacity: 240, dimensions: "8.3 × 7.6 × 13.2 cm", weight: 210, price: 43500, stock: 13, poem: "A handle that arches like a dragon's spine.", blurb: "A ti-liang pot — the handle vaults overhead in a single bridge rather than sitting at the side — sculpted here into the curl of a dragon. Aged Zi Ni purple clay, mellowed for years before throwing, gives it a quiet matte depth. At 240 ml it is the studio's table pot.", featured: true },
  { slug: "s0415", name: "Hydrangea Lidded Cup", zh: "绣球花盖杯", artist: "Yao Yun", clay: "Black Gold Sand · 乌金砂", shape: "Gaiwan — lidded brewing cup", capacity: 175, dimensions: "9.5 × 6.5 × 10 cm", weight: 158, price: 31000, stock: 6, poem: "A gaiwan crowned with a clay bloom.", blurb: "A lidded brewing cup — the gaiwan — finished with a hand-built hydrangea where the knob would sit. Black gold sand fires the darkest body in the studio, a near-graphite brown shot with mica, so the pale bloom stands clear above it." },
  { slug: "s0065", name: "Knowing Bamboo", zh: "知竹", artist: "Yao Yun", clay: "Yellow Jade Duan · 黄玉段", shape: "Bamboo-segment pot", capacity: 100, dimensions: "15 × 9.8 × 5.8 cm", weight: 127, price: 28000, stock: 5, poem: "The spout a shoot, the handle a stem.", blurb: "A low, wide pot built on the bamboo motif scholars have loved for a thousand years — the spout pulled as a young shoot, the handle a node-marked stem. Yellow jade Duan clay fires a soft, warm gold that suits the green of the plant it borrows.", featured: true },
  { slug: "s0070", name: "Knowing Bamboo, Side-Handle", zh: "知竹侧把", artist: "Yi Fou", clay: "Peach Blossom Clay · 桃花泥", shape: "Ce Ba — side-handle pot", capacity: 82, dimensions: "16.2 × 10.1 × 5.3 cm", weight: 120, price: 39000, stock: 5, poem: "Poured from the side, like a ladle.", blurb: "A side-handle pot — ce ba — where the grip extends straight out from the body at a right angle to the spout, the way a wooden ladle is held. Peach blossom clay fires a gentle blushed pink-beige, rare and quietly warm, named for the colour of spring orchards." },
  { slug: "s0080", name: "Yu — Carried Fragrance", zh: "钰 · 传香", artist: "Yao Yun", clay: "Mid-Seam Purple · 中槽清", shape: "Rounded high-shoulder pot", capacity: 150, dimensions: "10.5 × 9.1 × 8.2 cm", weight: 153, price: 29500, stock: 4, poem: "A pot that carries the scent forward.", blurb: "A full, high-shouldered pot from Yao Yun's Yu series — yu meaning fine jade. Thrown from Zhong Cao Qing, the prized middle seam of the zini deposit, which fires a clean and even purple-brown that potters reserve for their steadiest forms." },
  { slug: "s0206", name: "Dawn Dream", zh: "晓梦", artist: "Yao Yun", clay: "Morandi Green · 莫兰迪绿", shape: "Tall pear-form pot", capacity: 110, dimensions: "8.3 × 6.5 × 9.8 cm", weight: 80, price: 35000, stock: 13, poem: "A green softened to the edge of grey.", blurb: "From the Morandi Green series — a tall pear-bodied pot in a clay tuned to the muted, dusty palette of the painter Giorgio Morandi. The body fires a soft greyed sage that no glaze could match, light and quiet on the tea tray.", featured: true },
  { slug: "s0212", name: "Gathered Scent", zh: "拾香", artist: "Yao Yun", clay: "Morandi Green · 莫兰迪绿泥", shape: "Compact rounded pot", capacity: 100, dimensions: "9.2 × 6.5 × 7.2 cm", weight: 81, price: 35000, stock: 3, poem: "Small enough to gather warmth in one hand.", blurb: "A compact, softly rounded pot from the Morandi Green series — 100 ml, palm-sized, with a low centre of gravity that sits steady when poured. The greyed-green body grows a faint sheen as the tea oils settle into its pores." },
  { slug: "s0241", name: "Wandering Bamboo", zh: "逍遥竹", artist: "Yao Yun", clay: "Sand Clay · 段泥", shape: "Bamboo-form pot", capacity: 104, dimensions: "9.8 × 6.6 × 7.4 cm", weight: 86, price: 29500, stock: 12, poem: "Bamboo at ease, bending with the wind.", blurb: "From the Xiang Consort series — a rounded pot wrapped in carved bamboo, the stalk knotted loosely around the body as though caught mid-sway. Pale Duan sand clay starts the colour of raw biscuit and warms slowly toward honey with use." },
  { slug: "s0259", name: "Little Xishi — Ginkgo", zh: "小西施（银杏叶）", artist: "Yi Fou", clay: "Slope Clay · 降坡泥", shape: "Xishi — the classic rounded form", capacity: 80, dimensions: "8.5 × 6.5 × 5.8 cm", weight: 66, price: 21500, stock: 13, poem: "All soft curves, named for a beauty.", blurb: "The Xishi is the most-loved Yixing form — full, low, and round, named for one of the four great beauties of ancient China. This small 80 ml version carries a carved ginkgo leaf at the lid. Slope clay fires a warm reddish-tan with fine sandy texture." },
  { slug: "s0337", name: "Aroma Cup — Hydrangea", zh: "闻香杯（绣球花）", artist: "Yao Yun", clay: "Cinnabar Clay · 朱泥", shape: "Wen Xiang — scent cup", capacity: 40, dimensions: "4.1 × 4.1 × 7.3 cm", weight: 41, price: 14000, stock: 10, poem: "A tall cup made only to be smelled.", blurb: "A wen xiang bei — the slender scent cup of gongfu tea. Tea is poured in, then tipped into the drinking cup, and the empty vessel is cupped to the nose to read the lingering aroma. Bright Zhu Ni cinnabar clay deepens to a glowing oxblood red." },
  { slug: "s0381", name: "The Little Gourd Stump", zh: "小葫墩", artist: "Yao Yun", clay: "Golden Duan · 黄金段", shape: "Squat gourd-stump pot", capacity: 135, dimensions: "10.1 × 7.4 × 7.6 cm", weight: 87, price: 47500, stock: 3, poem: "A gourd set down to rest on its side.", blurb: "A squat, broad pot drawn from the look of a gourd cut and stood on end — full at the base, drawn in at the lid. Golden Duan clay fires the brightest of the sand bodies, a clean wheat-gold that lifts the whole tea tray." },
  { slug: "s0108", name: "The Honest Ladle", zh: "憨瓢", artist: "Yao Yun", clay: "Purple Gold Sand · 紫玉金砂", shape: "Shi Piao — the stone ladle", capacity: 130, dimensions: "10.8 × 8.5 × 5.8 cm", weight: 94, price: 32000, stock: 11, poem: "A scholar's pot, plain and sure.", blurb: "A near-triangular pot in the Shi Piao lineage — the stone-ladle form prized by Qing scholars for its honest, unornamented geometry. Purple gold sand gives it a mica-flecked depth; the bridge knob and straight spout keep the pour clean and fast." },
  { slug: "s0126", name: "Jade Hall", zh: "玉堂富贵", artist: "Yi Fou", clay: "Purple Clay · 紫泥", shape: "Rounded high-lid pot", capacity: 137, dimensions: "7.2 × 7.9 × 8 cm", weight: 94, price: 35000, stock: 8, poem: "Magnolia and peony — a wish for a flourishing house.", blurb: "Named for the classical motif yu tang fu gui — magnolia, crab-apple and peony, a painted wish for an honoured and prosperous home. A rounded pot with a tall domed lid, thrown from dense Zi Ni purple clay that holds its crisp shoulder line." },
  { slug: "s0142", name: "Door God — Blessings", zh: "门神（多福）", artist: "Yi Fou", clay: "Blended Purple Clay · 拼紫泥", shape: "Relief-carved figural pot", capacity: 160, dimensions: "9.5 × 6.3 × 9.7 cm", weight: 105, price: 33500, stock: 2, poem: "The guardian who keeps the blessings in.", blurb: "The companion to Door God — Peace: the second of the paired gate guardians, here carrying the wish for many blessings. The same tall figural body in blended purple clay, modelled in relief while the wall is still soft enough to take the line." },
  { slug: "s0369", name: "The Little Aubergine", zh: "小茄瓜", artist: "Yao Yun", clay: "Aged Purple Clay · 老紫泥", shape: "Aubergine-gourd form", capacity: 104, dimensions: "9.1 × 7 × 6.2 cm", weight: 70, price: 24000, stock: 2, poem: "A vegetable from the garden, kept in clay.", blurb: "A small pot pinched into the soft, lobed shape of an aubergine — one of the studio's garden-vegetable forms, where ordinary produce becomes teaware. Aged Zi Ni purple clay gives it a deep, settled brown with a quiet matte surface." },
  { slug: "s0081", name: "Seeing the Mountain", zh: "见山", artist: "Yi Fou", clay: "Yellow Jade Duan · 黄玉段", shape: "Low wide flat pot", capacity: 124, dimensions: "11.7 × 8.3 × 5.8 cm", weight: 130, price: 28000, stock: 3, poem: "Look up, and there is the mountain.", blurb: "A low, wide pot whose flat profile and ridged knob recall a distant mountain range — the line from Tao Yuanming's poem, jian nan shan, of looking up by chance and finding the southern hills. Yellow jade Duan clay fires a calm, warm gold." },
  { slug: "s0071", name: "Yu — Born of Fragrance", zh: "钰 · 生香", artist: "Yi Fou", clay: "Peach Blossom Clay · 桃花泥", shape: "Large round table pot", capacity: 220, dimensions: "11.5 × 10 × 10 cm", weight: 201, price: 42000, stock: 5, poem: "A pot wide enough to share.", blurb: "The largest pot in the Yu series — a generous 220 ml round body meant for the table, not the solo cup. Peach blossom clay fires a soft blushed beige; at this scale the rare body shows its full, gentle warmth." },
  { slug: "s0209", name: "Gourd's Whisper", zh: "瓜语", artist: "Yao Yun", clay: "Morandi Green · 莫兰迪绿", shape: "Lobed gourd-form pot", capacity: 100, dimensions: "10.8 × 8 × 5.4 cm", weight: 97, price: 28000, stock: 5, poem: "A melon resting low in the leaves.", blurb: "From the Morandi Green series — a low, lobed pot pressed into the soft segments of a ripening melon, the lid a curled stem. The muted greyed-green clay suits the quiet, vegetal form, light at 100 ml and easy in the hand." },
  { slug: "s0243", name: "Held Fragrance", zh: "凝香", artist: "Yao Yun", clay: "Sand Clay · 段泥", shape: "Rounded shoulder pot", capacity: 135, dimensions: "10 × 7.2 × 8.1 cm", weight: 87, price: 29500, stock: 10, poem: "The scent that stays after the pour.", blurb: "From the Xiang Consort series — a rounded, even-shouldered pot built to hold heat and aroma steady through a long session. Pale Duan sand clay, soft and matte, takes a tea brush beautifully and warms toward oat-gold over the months." },
  { slug: "s0380", name: "The Aubergine — Hydrangea", zh: "茄瓜（绣球花）", artist: "Yi Fou", clay: "Cinnabar Clay · 朱泥", shape: "Aubergine-gourd form", capacity: 92, dimensions: "8.8 × 6.8 × 5.9 cm", weight: 59, price: 53000, stock: 11, poem: "An aubergine crowned with a bloom.", blurb: "Yi Fou's finest small pot — the soft lobed aubergine form finished with a hand-built hydrangea at the lid. Fired from bright Zhu Ni cinnabar clay, a high-shrinkage body that few potters risk at this thinness; it rings clear and reddens with every brew.", featured: true },
  { slug: "s0315", name: "The Ingot Vessel", zh: "元宝手抓宝瓶", artist: "Yi Fou", clay: "Purple Gold Sand · 紫玉金砂", shape: "Bao Ping — grip-top treasure pot", capacity: 126, dimensions: "9.5 × 8 × 7.1 cm", weight: 136, price: 40500, stock: 2, poem: "Shaped like the old gold ingot, lifted from the top.", blurb: "A bao ping — a treasure-vase pot lifted by a moulded grip across the top rather than a side handle, its silhouette drawn from the yuan bao, the boat-shaped gold ingot of imperial China. Purple gold sand gives the auspicious form a mica-bright body." },
  { slug: "s0901", name: "All As You Wish", zh: "称心如意", artist: "Xu Xuefang", clay: "Di Cao Qing Purple Clay · 底槽清", shape: "Ti Liang — bridge-handle ruyi set", capacity: 450, dimensions: "15 × 11.5 × 16.5 cm", weight: 360, price: 88000, stock: 1, poem: "Cheng xin ru yi — all as the heart wishes.", blurb: "A presentation tea set by the Yixing master Xu Xuefang — one bridge-handle (ti-liang) pot with two matched cups, fully hand-paddled from a flat sheet of clay. The body is Di Cao Qing, the prized bottom-slot seam of Huanglongshan purple-sand ore, fired in the zi ni family to a warm, settled brown-red that grows more lustrous the longer it is brewed. A hand-applied band of gilt and the heart-curl knob carry the ruyi (如意) motif — the ancient Chinese emblem of good fortune, a wish that all go as the heart desires. At 450 ml the overhead handle sits comfortably in the hand for pouring; sold as the pot with its two cups.", featured: true },
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
    throw new Error(`${method} ${path} → ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  console.log(`Seeding teapots into ${MEDUSA_URL} ...`);
  const { token } = await api("POST", "/auth/user/emailpass", null, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  // Resolve the shared store context.
  const { sales_channels } = await api("GET", "/admin/sales-channels?limit=1", token);
  const salesChannelId = sales_channels[0]?.id;
  if (!salesChannelId) throw new Error("No sales channel found.");

  const { stock_locations } = await api("GET", "/admin/stock-locations?limit=100", token);
  const location =
    stock_locations.find((l) => /us/i.test(l.name)) ?? stock_locations[0];
  if (!location) throw new Error("No stock location found.");
  console.log(`Sales channel ${salesChannelId} · stock location "${location.name}"`);

  // Ensure a "Teapots" category exists.
  let teapotCategoryId;
  const { product_categories } = await api(
    "GET",
    "/admin/product-categories?q=Teapots&limit=10",
    token,
  );
  const existingCat = product_categories.find((c) => c.name === "Teapots");
  if (existingCat) {
    teapotCategoryId = existingCat.id;
    console.log("Category 'Teapots' already exists.");
  } else {
    const { product_category } = await api("POST", "/admin/product-categories", token, {
      name: "Teapots",
      is_active: true,
    });
    teapotCategoryId = product_category.id;
    console.log("Created category 'Teapots'.");
  }

  let created = 0;
  let skipped = 0;

  for (const t of TEAPOTS) {
    const sku = t.slug.toUpperCase();

    // Skip if the handle already exists — keeps the script re-runnable.
    const { products: found } = await api(
      "GET",
      `/admin/products?handle=${t.slug}&limit=1`,
      token,
    );
    if (found.length > 0) {
      console.log(`  ~ ${t.name} (${t.slug}) already exists, skipping`);
      skipped++;
      continue;
    }

    // 1. Create the product with an inventory-managed variant.
    const { product } = await api("POST", "/admin/products", token, {
      title: t.name,
      handle: t.slug,
      description: t.blurb,
      status: "published",
      weight: t.weight,
      thumbnail: `${STORE_ORIGIN}/teapots/${t.slug}/1.avif`,
      images: [1, 2, 3, 4, 5].map((n) => ({
        url: `${STORE_ORIGIN}/teapots/${t.slug}/${n}.avif`,
      })),
      metadata: {
        zh: t.zh,
        clay: t.clay,
        poem: t.poem,
        shape: t.shape,
        artist: t.artist,
        capacity_ml: t.capacity,
        dimensions: t.dimensions,
        weight_g: t.weight,
        kind: "teapot",
        ...(t.featured ? { featured: true } : {}),
      },
      categories: [{ id: teapotCategoryId }],
      sales_channels: [{ id: salesChannelId }],
      options: [{ title: "Title", values: ["Default"] }],
      variants: [
        {
          title: "Default",
          sku,
          manage_inventory: true,
          options: { Title: "Default" },
          prices: [{ amount: t.price, currency_code: "usd" }],
        },
      ],
    });

    // 2. Stock the variant. A managed-inventory variant gets an inventory
    //    item with a matching SKU; give it a level at the warehouse.
    const { inventory_items } = await api(
      "GET",
      `/admin/inventory-items?sku=${sku}&limit=1`,
      token,
    );
    const inventoryItemId = inventory_items[0]?.id;
    if (inventoryItemId) {
      await api(
        "POST",
        `/admin/inventory-items/${inventoryItemId}/location-levels`,
        token,
        { location_id: location.id, stocked_quantity: t.stock },
      );
      console.log(`  ✓ ${t.name} (${t.slug}) — ${t.stock} in stock`);
    } else {
      console.log(`  ✓ ${t.name} (${t.slug}) — created (no inventory item?)`);
    }
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
