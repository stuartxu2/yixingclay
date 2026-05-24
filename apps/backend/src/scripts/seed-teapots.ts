import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Seed the 24 PO/ET teapots into Medusa as purchasable products.
 *
 * The storefront renders teapot pages from static data in
 * `apps/web/lib/teapots.ts`, but checkout maps each handle to a Medusa
 * variant — so the catalogue needs matching products here. Product handles
 * equal the storefront slugs (`s0103`…), USD prices are in cents to match
 * `medusaToProduct`, and each variant manages inventory at its own stock
 * level.
 *
 * Run from apps/backend:  npx medusa exec ./src/scripts/seed-teapots.ts
 * Safe to re-run — teapots whose handle already exists are skipped.
 */

const STORE_ORIGIN = "https://yixingclay.com";

interface SeedTeapot {
  slug: string;
  name: string;
  zh: string;
  artist: string;
  clay: string;
  shape: string;
  capacity: number;
  dimensions: string;
  weight: number;
  /** Price in USD cents. */
  price: number;
  stock: number;
  poem: string;
  blurb: string;
  featured?: boolean;
}

const TEAPOTS: SeedTeapot[] = [
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
];

export default async function seedTeapots({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const productService = container.resolve(Modules.PRODUCT);
  const salesChannelService = container.resolve(Modules.SALES_CHANNEL);
  const stockLocationService = container.resolve(Modules.STOCK_LOCATION);

  // 1. Resolve the shared store context — teapots must land in the same
  //    sales channel as the tea pets so the storefront key can see them.
  const [salesChannel] = await salesChannelService.listSalesChannels({});
  if (!salesChannel) throw new Error("No sales channel found — seed the store first.");

  const [stockLocation] = await stockLocationService.listStockLocations({});
  if (!stockLocation) throw new Error("No stock location found — seed the store first.");

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfileId = shippingProfiles[0]?.id;
  if (!shippingProfileId) throw new Error("No shipping profile found.");

  logger.info(
    `Seeding teapots into sales channel "${salesChannel.name}" / location "${stockLocation.name}".`,
  );

  // 2. Ensure a "Teapots" category exists (idempotent).
  let teapotCategoryId: string;
  const existingCats = await productService.listProductCategories({
    name: "Teapots",
  });
  if (existingCats.length > 0) {
    teapotCategoryId = existingCats[0].id;
    logger.info("Category 'Teapots' already exists.");
  } else {
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: { product_categories: [{ name: "Teapots", is_active: true }] },
    });
    teapotCategoryId = result[0].id;
    logger.info("Created category 'Teapots'.");
  }

  // 3. Skip teapots whose handle already exists — keeps the script re-runnable.
  const existing = await productService.listProducts(
    { handle: TEAPOTS.map((t) => t.slug) },
    { take: 1000 },
  );
  const existingHandles = new Set(existing.map((p) => p.handle));
  const toCreate = TEAPOTS.filter((t) => !existingHandles.has(t.slug));

  if (toCreate.length === 0) {
    logger.info("All 24 teapots already seeded — nothing to do.");
    return;
  }
  logger.info(`Creating ${toCreate.length} teapot product(s)...`);

  // 4. Create the products. Variant SKUs are the upper-cased handle, and
  //    `manage_inventory: true` makes the workflow mint an inventory item.
  await createProductsWorkflow(container).run({
    input: {
      products: toCreate.map((t) => ({
        title: t.name,
        handle: t.slug,
        description: t.blurb,
        status: ProductStatus.PUBLISHED,
        category_ids: [teapotCategoryId],
        shipping_profile_id: shippingProfileId,
        weight: t.weight,
        thumbnail: `${STORE_ORIGIN}/teapots/${t.slug}/1.jpg`,
        images: [1, 2, 3, 4, 5].map((n) => ({
          url: `${STORE_ORIGIN}/teapots/${t.slug}/${n}.jpg`,
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
        options: [{ title: "Title", values: ["Default"] }],
        variants: [
          {
            title: "Default",
            sku: t.slug.toUpperCase(),
            manage_inventory: true,
            options: { Title: "Default" },
            prices: [{ amount: t.price, currency_code: "usd" }],
          },
        ],
        sales_channels: [{ id: salesChannel.id }],
      })),
    },
  });
  logger.info(`Created ${toCreate.length} teapot product(s).`);

  // 5. Stock each new variant at its own inventory level.
  const stockBySku = new Map(
    toCreate.map((t) => [t.slug.toUpperCase(), t.stock]),
  );
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
    filters: { sku: [...stockBySku.keys()] },
  });

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryItems.map((item: { id: string; sku?: string | null }) => ({
        location_id: stockLocation.id,
        inventory_item_id: item.id,
        stocked_quantity: stockBySku.get(item.sku ?? "") ?? 0,
      })),
    },
  });
  logger.info(
    `Stocked ${inventoryItems.length} teapot variant(s) at "${stockLocation.name}".`,
  );

  logger.info("Done — teapots are live in Medusa.");
}
