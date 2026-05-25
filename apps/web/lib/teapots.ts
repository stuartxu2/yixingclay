/**
 * PO/ET teapot catalogue.
 *
 * Teapots are the "pot" half of the brand (PO/ET — pots + pets). This is
 * hand-finished seed data: the specs (clay, capacity, dimensions, weight,
 * artist) come straight from the studio's product sheets via
 * `tools/import_teapots.py`; the English names and editorial copy are
 * written here. When the MedusaJS backend carries teapots, a thin adapter
 * maps Medusa products onto this same `Teapot` interface.
 */

export type ArtistKey = "yao-yun" | "yi-fou";

export interface Artist {
  key: ArtistKey;
  name: string;
  zh: string;
  /** Pinyin pronunciation aid. */
  pinyin: string;
  title: string;
  /** One-line studio credit shown on cards. */
  signature: string;
  bio: string[];
  /** A teapot slug used as the artist's portrait image on the Artists page. */
  portrait: string;
}

export const ARTISTS: Record<ArtistKey, Artist> = {
  "yao-yun": {
    key: "yao-yun",
    name: "Yao Yun",
    zh: "窑云",
    pinyin: "yáo yún — “kiln cloud”",
    title: "Master potter · zisha forms",
    signature: "Throws the round, full-bodied forms",
    bio: [
      "Yao Yun keeps to the classical Yixing repertoire — full, round bodies that pour in a single clean arc. Every pot is paddled by hand from a flat sheet of clay, never cast.",
      "Her work is unhurried. A single teapot moves through her bench a dozen times before firing: shaped, rested, trimmed, rested again, until the wall rings true when tapped.",
      "She signs the underside of each pot with the studio's kiln-cloud seal — the same mark stamped on PO/ET teaware since 1983.",
    ],
    portrait: "s0117",
  },
  "yi-fou": {
    key: "yi-fou",
    name: "Yi Fou",
    zh: "亦缶",
    pinyin: "yì fǒu — “also a vessel”",
    title: "Sculptor · botanical & figural work",
    signature: "Carves the botanical and figural pots",
    bio: [
      "Yi Fou took the studio name from 缶, an ancient clay vessel. He works where pottery meets sculpture — gourds, bamboo, hydrangea, door-god reliefs pressed into the clay while it is still soft.",
      "His pots wear their decoration as structure, not surface: a handle becomes a vine, a knob becomes a bud. Nothing is glued on after firing.",
      "He fires in small batches and rejects freely. A season at his bench yields perhaps thirty pots he is willing to sign.",
    ],
    portrait: "s0380",
  },
};

export interface Teapot {
  /** URL-safe identifier; also the Medusa product handle. */
  slug: string;
  /** Display SKU. */
  sku: string;
  name: string;
  /** Original Chinese form name (器型). */
  zh: string;
  artist: ArtistKey;
  /** Yixing clay body, e.g. "Purple Clay · 紫泥". */
  clay: string;
  /** Short clay token for filtering, e.g. "Zi Ni". */
  clayKey: string;
  /** The form family / shape this pot belongs to. */
  shape: string;
  /** Volume in millilitres. */
  capacity: number;
  /** Length × width × height in centimetres. */
  dimensions: string;
  /** Weight in grams. */
  weight: number;
  /** Price in cents, USD. */
  price: number;
  /** Units in stock — handmade, so counts are small. */
  stock: number;
  /** A single editorial line shown beneath the name. */
  poem: string;
  /** Long-form, AEO-friendly description. */
  blurb: string;
  featured?: boolean;
  /** Ordered white-background gallery photos. */
  images: string[];
}

export const TEAPOTS: Teapot[] = [
  {
    slug: "s0103",
    sku: "PO/ET · S0103",
    name: "The Coin Pot",
    zh: "钱多多",
    artist: "yao-yun",
    clay: "Purple Gold Sand · 紫玉金砂",
    clayKey: "Zi Yu Jin Sha",
    shape: "Round-bellied gongfu pot",
    capacity: 90,
    dimensions: "11.3 × 7.5 × 5.2 cm",
    weight: 110,
    price: 28000,
    stock: 12,
    poem: "A small pot named for abundance.",
    blurb:
      "A compact, low-shouldered pot thrown from purple gold sand — a zini variant flecked with mica that catches light like scattered grit of gold. At 90 ml it is built for solo gongfu sessions and warms to a deeper aubergine the longer it is brewed.",
    featured: true,
    images: [
      "/teapots/s0103/1.avif",
      "/teapots/s0103/2.avif",
      "/teapots/s0103/3.avif",
      "/teapots/s0103/4.avif",
      "/teapots/s0103/5.avif",
    ],
  },
  {
    slug: "s0119",
    sku: "PO/ET · S0119",
    name: "The Gourd of Fortune",
    zh: "福禄",
    artist: "yi-fou",
    clay: "Purple Clay · 紫泥",
    clayKey: "Zi Ni",
    shape: "Gourd form, double-stacked",
    capacity: 175,
    dimensions: "10.8 × 7.5 × 8.8 cm",
    weight: 116,
    price: 28000,
    stock: 3,
    poem: "Fu and Lu — fortune stacked on prosperity.",
    blurb:
      "A tall gourd pot, its body pinched into the twin swell of the fu-lu — the bottle-gourd that Chinese craft has carried as a blessing for centuries. Classic Zi Ni purple clay, dense and even, holds the carved waist crisply through the kiln.",
    images: [
      "/teapots/s0119/1.avif",
      "/teapots/s0119/2.avif",
      "/teapots/s0119/3.avif",
      "/teapots/s0119/4.avif",
      "/teapots/s0119/5.avif",
    ],
  },
  {
    slug: "s0136",
    sku: "PO/ET · S0136",
    name: "Door God — Peace",
    zh: "门神（平安）",
    artist: "yi-fou",
    clay: "Blended Purple Clay · 拼紫泥",
    clayKey: "Pin Zi Ni",
    shape: "Relief-carved figural pot",
    capacity: 160,
    dimensions: "9.5 × 6.3 × 9.7 cm",
    weight: 102,
    price: 33500,
    stock: 2,
    poem: "A guardian pressed into the clay.",
    blurb:
      "A tall pot carrying a low-relief door god — the painted guardian pasted to Chinese gates at New Year — modelled directly into the soft wall. Blended purple clay gives a warm, even brown that lets the carved figure read clearly without glaze.",
    images: [
      "/teapots/s0136/1.avif",
      "/teapots/s0136/2.avif",
      "/teapots/s0136/3.avif",
      "/teapots/s0136/4.avif",
      "/teapots/s0136/5.avif",
    ],
  },
  {
    slug: "s0117",
    sku: "PO/ET · S0117",
    name: "The Dragon Bridge",
    zh: "龙提梁",
    artist: "yi-fou",
    clay: "Aged Purple Clay · 老紫泥",
    clayKey: "Lao Zi Ni",
    shape: "Ti Liang — overhead bridge handle",
    capacity: 240,
    dimensions: "8.3 × 7.6 × 13.2 cm",
    weight: 210,
    price: 43500,
    stock: 13,
    poem: "A handle that arches like a dragon's spine.",
    blurb:
      "A ti-liang pot — the handle vaults overhead in a single bridge rather than sitting at the side — sculpted here into the curl of a dragon. Aged Zi Ni purple clay, mellowed for years before throwing, gives it a quiet matte depth. At 240 ml it is the studio's table pot.",
    featured: true,
    images: [
      "/teapots/s0117/1.avif",
      "/teapots/s0117/2.avif",
      "/teapots/s0117/3.avif",
      "/teapots/s0117/4.avif",
      "/teapots/s0117/5.avif",
    ],
  },
  {
    slug: "s0415",
    sku: "PO/ET · S0415",
    name: "Hydrangea Lidded Cup",
    zh: "绣球花盖杯",
    artist: "yao-yun",
    clay: "Black Gold Sand · 乌金砂",
    clayKey: "Wu Jin Sha",
    shape: "Gaiwan — lidded brewing cup",
    capacity: 175,
    dimensions: "9.5 × 6.5 × 10 cm",
    weight: 158,
    price: 31000,
    stock: 6,
    poem: "A gaiwan crowned with a clay bloom.",
    blurb:
      "A lidded brewing cup — the gaiwan — finished with a hand-built hydrangea where the knob would sit. Black gold sand fires the darkest body in the studio, a near-graphite brown shot with mica, so the pale bloom stands clear above it.",
    images: [
      "/teapots/s0415/1.avif",
      "/teapots/s0415/2.avif",
      "/teapots/s0415/3.avif",
      "/teapots/s0415/4.avif",
      "/teapots/s0415/5.avif",
    ],
  },
  {
    slug: "s0065",
    sku: "PO/ET · S0065",
    name: "Knowing Bamboo",
    zh: "知竹",
    artist: "yao-yun",
    clay: "Yellow Jade Duan · 黄玉段",
    clayKey: "Huang Yu Duan",
    shape: "Bamboo-segment pot",
    capacity: 100,
    dimensions: "15 × 9.8 × 5.8 cm",
    weight: 127,
    price: 28000,
    stock: 5,
    poem: "The spout a shoot, the handle a stem.",
    blurb:
      "A low, wide pot built on the bamboo motif scholars have loved for a thousand years — the spout pulled as a young shoot, the handle a node-marked stem. Yellow jade Duan clay fires a soft, warm gold that suits the green of the plant it borrows.",
    featured: true,
    images: [
      "/teapots/s0065/1.avif",
      "/teapots/s0065/2.avif",
      "/teapots/s0065/3.avif",
      "/teapots/s0065/4.avif",
      "/teapots/s0065/5.avif",
    ],
  },
  {
    slug: "s0070",
    sku: "PO/ET · S0070",
    name: "Knowing Bamboo, Side-Handle",
    zh: "知竹侧把",
    artist: "yi-fou",
    clay: "Peach Blossom Clay · 桃花泥",
    clayKey: "Tao Hua Ni",
    shape: "Ce Ba — side-handle pot",
    capacity: 82,
    dimensions: "16.2 × 10.1 × 5.3 cm",
    weight: 120,
    price: 39000,
    stock: 5,
    poem: "Poured from the side, like a ladle.",
    blurb:
      "A side-handle pot — ce ba — where the grip extends straight out from the body at a right angle to the spout, the way a wooden ladle is held. Peach blossom clay fires a gentle blushed pink-beige, rare and quietly warm, named for the colour of spring orchards.",
    images: [
      "/teapots/s0070/1.avif",
      "/teapots/s0070/2.avif",
      "/teapots/s0070/3.avif",
      "/teapots/s0070/4.avif",
      "/teapots/s0070/5.avif",
    ],
  },
  {
    slug: "s0080",
    sku: "PO/ET · S0080",
    name: "Yu — Carried Fragrance",
    zh: "钰 · 传香",
    artist: "yao-yun",
    clay: "Mid-Seam Purple · 中槽清",
    clayKey: "Zhong Cao Qing",
    shape: "Rounded high-shoulder pot",
    capacity: 150,
    dimensions: "10.5 × 9.1 × 8.2 cm",
    weight: 153,
    price: 29500,
    stock: 4,
    poem: "A pot that carries the scent forward.",
    blurb:
      "A full, high-shouldered pot from Yao Yun's Yu series — yu meaning fine jade. Thrown from Zhong Cao Qing, the prized middle seam of the zini deposit, which fires a clean and even purple-brown that potters reserve for their steadiest forms.",
    images: [
      "/teapots/s0080/1.avif",
      "/teapots/s0080/2.avif",
      "/teapots/s0080/3.avif",
      "/teapots/s0080/4.avif",
      "/teapots/s0080/5.avif",
    ],
  },
  {
    slug: "s0206",
    sku: "PO/ET · S0206",
    name: "Dawn Dream",
    zh: "晓梦",
    artist: "yao-yun",
    clay: "Morandi Green · 莫兰迪绿",
    clayKey: "Morandi Green",
    shape: "Tall pear-form pot",
    capacity: 110,
    dimensions: "8.3 × 6.5 × 9.8 cm",
    weight: 80,
    price: 35000,
    stock: 13,
    poem: "A green softened to the edge of grey.",
    blurb:
      "From the Morandi Green series — a tall pear-bodied pot in a clay tuned to the muted, dusty palette of the painter Giorgio Morandi. The body fires a soft greyed sage that no glaze could match, light and quiet on the tea tray.",
    featured: true,
    images: [
      "/teapots/s0206/1.avif",
      "/teapots/s0206/2.avif",
      "/teapots/s0206/3.avif",
      "/teapots/s0206/4.avif",
      "/teapots/s0206/5.avif",
    ],
  },
  {
    slug: "s0212",
    sku: "PO/ET · S0212",
    name: "Gathered Scent",
    zh: "拾香",
    artist: "yao-yun",
    clay: "Morandi Green · 莫兰迪绿泥",
    clayKey: "Morandi Green",
    shape: "Compact rounded pot",
    capacity: 100,
    dimensions: "9.2 × 6.5 × 7.2 cm",
    weight: 81,
    price: 35000,
    stock: 3,
    poem: "Small enough to gather warmth in one hand.",
    blurb:
      "A compact, softly rounded pot from the Morandi Green series — 100 ml, palm-sized, with a low centre of gravity that sits steady when poured. The greyed-green body grows a faint sheen as the tea oils settle into its pores.",
    images: [
      "/teapots/s0212/1.avif",
      "/teapots/s0212/2.avif",
      "/teapots/s0212/3.avif",
      "/teapots/s0212/4.avif",
      "/teapots/s0212/5.avif",
    ],
  },
  {
    slug: "s0241",
    sku: "PO/ET · S0241",
    name: "Wandering Bamboo",
    zh: "逍遥竹",
    artist: "yao-yun",
    clay: "Sand Clay · 段泥",
    clayKey: "Duan Ni",
    shape: "Bamboo-form pot",
    capacity: 104,
    dimensions: "9.8 × 6.6 × 7.4 cm",
    weight: 86,
    price: 29500,
    stock: 12,
    poem: "Bamboo at ease, bending with the wind.",
    blurb:
      "From the Xiang Consort series — a rounded pot wrapped in carved bamboo, the stalk knotted loosely around the body as though caught mid-sway. Pale Duan sand clay starts the colour of raw biscuit and warms slowly toward honey with use.",
    images: [
      "/teapots/s0241/1.avif",
      "/teapots/s0241/2.avif",
      "/teapots/s0241/3.avif",
      "/teapots/s0241/4.avif",
      "/teapots/s0241/5.avif",
    ],
  },
  {
    slug: "s0259",
    sku: "PO/ET · S0259",
    name: "Little Xishi — Ginkgo",
    zh: "小西施（银杏叶）",
    artist: "yi-fou",
    clay: "Slope Clay · 降坡泥",
    clayKey: "Jiang Po Ni",
    shape: "Xishi — the classic rounded form",
    capacity: 80,
    dimensions: "8.5 × 6.5 × 5.8 cm",
    weight: 66,
    price: 21500,
    stock: 13,
    poem: "All soft curves, named for a beauty.",
    blurb:
      "The Xishi is the most-loved Yixing form — full, low, and round, named for one of the four great beauties of ancient China. This small 80 ml version carries a carved ginkgo leaf at the lid. Slope clay fires a warm reddish-tan with fine sandy texture.",
    images: [
      "/teapots/s0259/1.avif",
      "/teapots/s0259/2.avif",
      "/teapots/s0259/3.avif",
      "/teapots/s0259/4.avif",
      "/teapots/s0259/5.avif",
    ],
  },
  {
    slug: "s0337",
    sku: "PO/ET · S0337",
    name: "Aroma Cup — Hydrangea",
    zh: "闻香杯（绣球花）",
    artist: "yao-yun",
    clay: "Cinnabar Clay · 朱泥",
    clayKey: "Zhu Ni",
    shape: "Wen Xiang — scent cup",
    capacity: 40,
    dimensions: "4.1 × 4.1 × 7.3 cm",
    weight: 41,
    price: 14000,
    stock: 10,
    poem: "A tall cup made only to be smelled.",
    blurb:
      "A wen xiang bei — the slender scent cup of gongfu tea. Tea is poured in, then tipped into the drinking cup, and the empty vessel is cupped to the nose to read the lingering aroma. Bright Zhu Ni cinnabar clay deepens to a glowing oxblood red.",
    images: [
      "/teapots/s0337/1.avif",
      "/teapots/s0337/2.avif",
      "/teapots/s0337/3.avif",
      "/teapots/s0337/4.avif",
    ],
  },
  {
    slug: "s0381",
    sku: "PO/ET · S0381",
    name: "The Little Gourd Stump",
    zh: "小葫墩",
    artist: "yao-yun",
    clay: "Golden Duan · 黄金段",
    clayKey: "Huang Jin Duan",
    shape: "Squat gourd-stump pot",
    capacity: 135,
    dimensions: "10.1 × 7.4 × 7.6 cm",
    weight: 87,
    price: 47500,
    stock: 3,
    poem: "A gourd set down to rest on its side.",
    blurb:
      "A squat, broad pot drawn from the look of a gourd cut and stood on end — full at the base, drawn in at the lid. Golden Duan clay fires the brightest of the sand bodies, a clean wheat-gold that lifts the whole tea tray.",
    images: [
      "/teapots/s0381/1.avif",
      "/teapots/s0381/2.avif",
      "/teapots/s0381/3.avif",
      "/teapots/s0381/4.avif",
      "/teapots/s0381/5.avif",
    ],
  },
  {
    slug: "s0108",
    sku: "PO/ET · S0108",
    name: "The Honest Ladle",
    zh: "憨瓢",
    artist: "yao-yun",
    clay: "Purple Gold Sand · 紫玉金砂",
    clayKey: "Zi Yu Jin Sha",
    shape: "Shi Piao — the stone ladle",
    capacity: 130,
    dimensions: "10.8 × 8.5 × 5.8 cm",
    weight: 94,
    price: 32000,
    stock: 11,
    poem: "A scholar's pot, plain and sure.",
    blurb:
      "A near-triangular pot in the Shi Piao lineage — the stone-ladle form prized by Qing scholars for its honest, unornamented geometry. Purple gold sand gives it a mica-flecked depth; the bridge knob and straight spout keep the pour clean and fast.",
    images: [
      "/teapots/s0108/1.avif",
      "/teapots/s0108/2.avif",
      "/teapots/s0108/3.avif",
      "/teapots/s0108/4.avif",
      "/teapots/s0108/5.avif",
    ],
  },
  {
    slug: "s0126",
    sku: "PO/ET · S0126",
    name: "Jade Hall",
    zh: "玉堂富贵",
    artist: "yi-fou",
    clay: "Purple Clay · 紫泥",
    clayKey: "Zi Ni",
    shape: "Rounded high-lid pot",
    capacity: 137,
    dimensions: "7.2 × 7.9 × 8 cm",
    weight: 94,
    price: 35000,
    stock: 8,
    poem: "Magnolia and peony — a wish for a flourishing house.",
    blurb:
      "Named for the classical motif yu tang fu gui — magnolia, crab-apple and peony, a painted wish for an honoured and prosperous home. A rounded pot with a tall domed lid, thrown from dense Zi Ni purple clay that holds its crisp shoulder line.",
    images: [
      "/teapots/s0126/1.avif",
      "/teapots/s0126/2.avif",
      "/teapots/s0126/3.avif",
      "/teapots/s0126/4.avif",
      "/teapots/s0126/5.avif",
    ],
  },
  {
    slug: "s0142",
    sku: "PO/ET · S0142",
    name: "Door God — Blessings",
    zh: "门神（多福）",
    artist: "yi-fou",
    clay: "Blended Purple Clay · 拼紫泥",
    clayKey: "Pin Zi Ni",
    shape: "Relief-carved figural pot",
    capacity: 160,
    dimensions: "9.5 × 6.3 × 9.7 cm",
    weight: 105,
    price: 33500,
    stock: 2,
    poem: "The guardian who keeps the blessings in.",
    blurb:
      "The companion to Door God — Peace: the second of the paired gate guardians, here carrying the wish for many blessings. The same tall figural body in blended purple clay, modelled in relief while the wall is still soft enough to take the line.",
    images: [
      "/teapots/s0142/1.avif",
      "/teapots/s0142/2.avif",
      "/teapots/s0142/3.avif",
      "/teapots/s0142/4.avif",
      "/teapots/s0142/5.avif",
    ],
  },
  {
    slug: "s0369",
    sku: "PO/ET · S0369",
    name: "The Little Aubergine",
    zh: "小茄瓜",
    artist: "yao-yun",
    clay: "Aged Purple Clay · 老紫泥",
    clayKey: "Lao Zi Ni",
    shape: "Aubergine-gourd form",
    capacity: 104,
    dimensions: "9.1 × 7 × 6.2 cm",
    weight: 70,
    price: 24000,
    stock: 2,
    poem: "A vegetable from the garden, kept in clay.",
    blurb:
      "A small pot pinched into the soft, lobed shape of an aubergine — one of the studio's garden-vegetable forms, where ordinary produce becomes teaware. Aged Zi Ni purple clay gives it a deep, settled brown with a quiet matte surface.",
    images: [
      "/teapots/s0369/1.avif",
      "/teapots/s0369/2.avif",
      "/teapots/s0369/3.avif",
      "/teapots/s0369/4.avif",
      "/teapots/s0369/5.avif",
    ],
  },
  {
    slug: "s0081",
    sku: "PO/ET · S0081",
    name: "Seeing the Mountain",
    zh: "见山",
    artist: "yi-fou",
    clay: "Yellow Jade Duan · 黄玉段",
    clayKey: "Huang Yu Duan",
    shape: "Low wide flat pot",
    capacity: 124,
    dimensions: "11.7 × 8.3 × 5.8 cm",
    weight: 130,
    price: 28000,
    stock: 3,
    poem: "Look up, and there is the mountain.",
    blurb:
      "A low, wide pot whose flat profile and ridged knob recall a distant mountain range — the line from Tao Yuanming's poem, jian nan shan, of looking up by chance and finding the southern hills. Yellow jade Duan clay fires a calm, warm gold.",
    images: [
      "/teapots/s0081/1.avif",
      "/teapots/s0081/2.avif",
      "/teapots/s0081/3.avif",
      "/teapots/s0081/4.avif",
      "/teapots/s0081/5.avif",
    ],
  },
  {
    slug: "s0071",
    sku: "PO/ET · S0071",
    name: "Yu — Born of Fragrance",
    zh: "钰 · 生香",
    artist: "yi-fou",
    clay: "Peach Blossom Clay · 桃花泥",
    clayKey: "Tao Hua Ni",
    shape: "Large round table pot",
    capacity: 220,
    dimensions: "11.5 × 10 × 10 cm",
    weight: 201,
    price: 42000,
    stock: 5,
    poem: "A pot wide enough to share.",
    blurb:
      "The largest pot in the Yu series — a generous 220 ml round body meant for the table, not the solo cup. Peach blossom clay fires a soft blushed beige; at this scale the rare body shows its full, gentle warmth.",
    images: [
      "/teapots/s0071/1.avif",
      "/teapots/s0071/2.avif",
      "/teapots/s0071/3.avif",
      "/teapots/s0071/4.avif",
      "/teapots/s0071/5.avif",
    ],
  },
  {
    slug: "s0209",
    sku: "PO/ET · S0209",
    name: "Gourd's Whisper",
    zh: "瓜语",
    artist: "yao-yun",
    clay: "Morandi Green · 莫兰迪绿",
    clayKey: "Morandi Green",
    shape: "Lobed gourd-form pot",
    capacity: 100,
    dimensions: "10.8 × 8 × 5.4 cm",
    weight: 97,
    price: 28000,
    stock: 5,
    poem: "A melon resting low in the leaves.",
    blurb:
      "From the Morandi Green series — a low, lobed pot pressed into the soft segments of a ripening melon, the lid a curled stem. The muted greyed-green clay suits the quiet, vegetal form, light at 100 ml and easy in the hand.",
    images: [
      "/teapots/s0209/1.avif",
      "/teapots/s0209/2.avif",
      "/teapots/s0209/3.avif",
      "/teapots/s0209/4.avif",
      "/teapots/s0209/5.avif",
    ],
  },
  {
    slug: "s0243",
    sku: "PO/ET · S0243",
    name: "Held Fragrance",
    zh: "凝香",
    artist: "yao-yun",
    clay: "Sand Clay · 段泥",
    clayKey: "Duan Ni",
    shape: "Rounded shoulder pot",
    capacity: 135,
    dimensions: "10 × 7.2 × 8.1 cm",
    weight: 87,
    price: 29500,
    stock: 10,
    poem: "The scent that stays after the pour.",
    blurb:
      "From the Xiang Consort series — a rounded, even-shouldered pot built to hold heat and aroma steady through a long session. Pale Duan sand clay, soft and matte, takes a tea brush beautifully and warms toward oat-gold over the months.",
    images: [
      "/teapots/s0243/1.avif",
      "/teapots/s0243/2.avif",
      "/teapots/s0243/3.avif",
      "/teapots/s0243/4.avif",
      "/teapots/s0243/5.avif",
    ],
  },
  {
    slug: "s0380",
    sku: "PO/ET · S0380",
    name: "The Aubergine — Hydrangea",
    zh: "茄瓜（绣球花）",
    artist: "yi-fou",
    clay: "Cinnabar Clay · 朱泥",
    clayKey: "Zhu Ni",
    shape: "Aubergine-gourd form",
    capacity: 92,
    dimensions: "8.8 × 6.8 × 5.9 cm",
    weight: 59,
    price: 53000,
    stock: 11,
    poem: "An aubergine crowned with a bloom.",
    blurb:
      "Yi Fou's finest small pot — the soft lobed aubergine form finished with a hand-built hydrangea at the lid. Fired from bright Zhu Ni cinnabar clay, a high-shrinkage body that few potters risk at this thinness; it rings clear and reddens with every brew.",
    featured: true,
    images: [
      "/teapots/s0380/1.avif",
      "/teapots/s0380/2.avif",
      "/teapots/s0380/3.avif",
      "/teapots/s0380/4.avif",
      "/teapots/s0380/5.avif",
    ],
  },
  {
    slug: "s0315",
    sku: "PO/ET · S0315",
    name: "The Ingot Vessel",
    zh: "元宝手抓宝瓶",
    artist: "yi-fou",
    clay: "Purple Gold Sand · 紫玉金砂",
    clayKey: "Zi Yu Jin Sha",
    shape: "Bao Ping — grip-top treasure pot",
    capacity: 126,
    dimensions: "9.5 × 8 × 7.1 cm",
    weight: 136,
    price: 40500,
    stock: 2,
    poem: "Shaped like the old gold ingot, lifted from the top.",
    blurb:
      "A bao ping — a treasure-vase pot lifted by a moulded grip across the top rather than a side handle, its silhouette drawn from the yuan bao, the boat-shaped gold ingot of imperial China. Purple gold sand gives the auspicious form a mica-bright body.",
    images: [
      "/teapots/s0315/1.avif",
      "/teapots/s0315/2.avif",
      "/teapots/s0315/3.avif",
      "/teapots/s0315/4.avif",
      "/teapots/s0315/5.avif",
    ],
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/**
 * Teapots are served from Medusa (`fetchTeapots`) so the admin is the source
 * of truth; `TEAPOTS` above is the build-time fallback used only when the
 * backend is unreachable. These helpers therefore operate on whatever list
 * the page was given — live or fallback — never a global.
 */

/** Distinct clay bodies in a teapot list, for filter UI. */
export function clayKeys(list: Teapot[]): string[] {
  return [...new Set(list.map((t) => t.clayKey))];
}

/** [lowest, highest] price across a teapot list, in cents. */
export function priceRange(list: Teapot[]): [number, number] {
  if (list.length === 0) return [0, 0];
  const prices = list.map((t) => t.price);
  return [Math.min(...prices), Math.max(...prices)];
}

/** First gallery photo — the card's resting image. */
export function teapotHero(t: Teapot): string {
  return t.images[0];
}

/** Second gallery photo, revealed on card hover. */
export function teapotAlt(t: Teapot): string {
  return t.images[1] ?? t.images[0];
}

export function getTeapot(list: Teapot[], slug: string): Teapot | undefined {
  return list.find((t) => t.slug === slug);
}

/** The featured teapots in a list. */
export function featuredTeapots(list: Teapot[]): Teapot[] {
  return list.filter((t) => t.featured);
}

/** Up to `n` other teapots, preferring the same maker. */
export function relatedTeapots(list: Teapot[], slug: string, n = 3): Teapot[] {
  const current = getTeapot(list, slug);
  if (!current) return list.filter((t) => t.slug !== slug).slice(0, n);
  const sameArtist = list.filter(
    (t) => t.slug !== slug && t.artist === current.artist,
  );
  const rest = list.filter(
    (t) => t.slug !== slug && t.artist !== current.artist,
  );
  return [...sameArtist, ...rest].slice(0, n);
}

/** Photographed-angle labels for the detail-page gallery. */
export function teapotGallery(t: Teapot): { src: string; label: string }[] {
  const labels = ["Full view", "Profile", "From above", "Spout & handle", "Base & seal"];
  return t.images.map((src, i) => ({ src, label: labels[i] ?? `View ${i + 1}` }));
}
