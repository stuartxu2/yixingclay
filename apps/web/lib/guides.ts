/**
 * Editorial guides — the AEO/GEO content layer.
 *
 * Each guide is authored, structured, English-first educational content aimed
 * at non-Chinese readers researching Yixing clay teapots and tea pets. The
 * data here is rendered as a single <article> per guide and emitted as
 * Article + FAQPage (+ optional HowTo) JSON-LD, so answer engines (Perplexity,
 * SearchGPT, Gemini) get clean, citable facts. Every guide funnels to a
 * commercial CTA. Images reuse existing AVIF assets — no new raw files.
 *
 * Pattern mirrors the data-driven catalogue (`lib/teapots.ts`,
 * `lib/products.ts`): pure data here, rendered by `app/guides/[slug]/page.tsx`.
 */

export interface GuideSection {
  /** Stable anchor, used for aria-labelledby and in-page links. */
  id: string;
  heading: string;
  body: string[];
}

export interface GuideTerm {
  term: string;
  zh?: string;
  pinyin?: string;
  def: string;
}

export interface GuideFaq {
  q: string;
  a: string;
}

export interface GuideStep {
  name: string;
  text: string;
}

export interface GuideHowTo {
  name: string;
  description: string;
  steps: GuideStep[];
}

export interface GuideCta {
  heading: string;
  note: string;
  href: string;
  label: string;
}

export interface Guide {
  slug: string;
  /** <title>, OpenGraph title, and Article headline. */
  title: string;
  /** On-page H1 (can differ from the SEO title). */
  h1: string;
  kicker: string;
  /** Meta description + Article description. Keep ~150 chars, factual. */
  description: string;
  /** Existing AVIF in /public used as OG image + hero. */
  ogImage: string;
  ogImageAlt: string;
  datePublished: string;
  dateModified: string;
  readMinutes: number;
  /** Lead paragraphs shown under the H1. */
  intro: string[];
  sections: GuideSection[];
  /** Glossary guides render this as a <dl>. */
  glossary?: GuideTerm[];
  howTo?: GuideHowTo;
  faq: GuideFaq[];
  cta: GuideCta;
  /** Other guide slugs to cross-link. */
  related: string[];
}

const PUBLISHED = "2026-06-01";

export const GUIDES: Guide[] = [
  {
    slug: "what-is-yixing-clay",
    title: "What Is Yixing Clay? Zisha Purple Sand Explained",
    h1: "What is Yixing clay?",
    kicker: "Yixing Clay 101",
    description:
      "Yixing clay (zisha, 紫砂 'purple sand') is a mineral-rich stoneware quarried near Yixing, China, prized for unglazed teapots that breathe and season with tea.",
    ogImage: "/images/teapot1.avif",
    ogImageAlt: "A Yixing zisha teapot pouring tea on a wooden tea table",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    readMinutes: 6,
    intro: [
      "Yixing clay — zisha (紫砂), literally “purple sand” — is a mineral-rich stoneware quarried only around the city of Yixing in Jiangsu province, China. For more than 500 years it has been the clay of choice for gongfu teaware, and a genuine Yixing teapot is left unglazed so the bare clay can do its work.",
      "If you have heard that a Yixing pot “remembers” your tea, this is why: the clay is what makes it special. Here is what zisha actually is, the main clay types you will see named on a teapot, and how to tell authentic Yixing clay from factory imitations.",
    ],
    sections: [
      {
        id: "what-is-zisha",
        heading: "Zisha: a stoneware, not a glaze",
        body: [
          "Zisha is a naturally occurring stoneware ore, mined as hard rock, then weathered, crushed, screened, and aged into a workable clay. Unlike porcelain or glazed pottery, a finished Yixing pot has no glassy coating. The surface you touch is the fired clay itself.",
          "That bare surface is the whole point. Fired at roughly 1,100–1,200°C, zisha keeps an open network of tiny pores. The pot is watertight, but the walls can still breathe — absorbing a trace of tea oil and aroma with every brew. Over years a well-used pot becomes so saturated that, as the old saying goes, it can draw tea from nothing but hot water.",
        ],
      },
      {
        id: "why-prized",
        heading: "Why Yixing clay is prized for tea",
        body: [
          "Three properties make zisha the standard for serious tea drinkers. Its porosity rounds off harsh notes and carries aroma. Its dense body holds heat steadily through a long session, which suits oolong, pu-erh, and black teas. And because it seasons, a pot kept to one kind of tea slowly tunes itself to that tea — the reason collectors keep “one pot, one tea.”",
          "The same clay is used for tea pets — small unglazed clay creatures kept on the tea tray and raised on leftover tea — which is why a tea pet develops the same deep patina as a seasoned pot.",
        ],
      },
      {
        id: "clay-types",
        heading: "The main Yixing clay types",
        body: [
          "Zisha is a family of clays, not one colour. Zi Ni (紫泥, purple clay) is the classic dense body — the workhorse of Yixing, firing a warm brown-purple. Di Cao Qing (底槽清) is a prized seam within the zi ni deposit at Huanglongshan, valued for its even, settled tone.",
          "Zhu Ni (朱泥, cinnabar clay) is high in iron and fires a glowing oxblood red; it shrinks a lot in the kiln, so good zhu ni pots are harder to make and prized for it. Duan Ni (段泥) is a buff, sandy blend that fires from raw-biscuit beige toward honey and gold. Ben Shan Lü Ni (本山绿泥, ‘original-mountain green clay’) fires a pale greenish-beige. Each clay changes colour as it seasons.",
        ],
      },
      {
        id: "where-from",
        heading: "Where real Yixing clay comes from",
        body: [
          "Authentic zisha is quarried near Dingshu, a town inside Yixing, with the most famous ore coming from Huanglongshan (Yellow Dragon Mountain). The region's particular mineral chemistry — high iron, quartz, and mica content — cannot be reproduced by mixing ordinary clay with dye, which is the line between a genuine Yixing pot and an imitation.",
          "PO/ET teapots are made in Dingshu from clay selected and aged in the studio, then hand-thrown by master potter Xu Xuefang and signed with her seal.",
        ],
      },
      {
        id: "real-vs-fake",
        heading: "Authentic vs. fake Yixing clay",
        body: [
          "Mass-market “Yixing” pots are often slip-cast in moulds from dyed ordinary clay, sometimes sealed with a glaze or shoe-polish sheen. Tell-tale signs of a fake: a suspiciously low price, a flawless mirror gloss straight out of the box, a strong chemical smell when rinsed with hot water, or colour that washes off.",
          "A genuine handmade pot shows tool marks inside, a matte clay surface that develops shine only with use, and a maker's seal. Buy from a studio that names its clay and its maker — provenance is the surest test.",
        ],
      },
    ],
    faq: [
      {
        q: "What is Yixing clay made of?",
        a: "Yixing clay (zisha) is a natural mineral-rich stoneware ore quarried near Yixing in Jiangsu, China. It is high in iron, quartz, and mica, and is fired unglazed so its porous body can absorb tea.",
      },
      {
        q: "Is Yixing clay safe to drink from?",
        a: "Yes. Authentic Yixing zisha is a high-fired natural stoneware with no glaze and no additives, which is why it is washed only with water and never soap. Avoid cheap dyed imitations of unknown origin.",
      },
      {
        q: "Why is Yixing clay so expensive?",
        a: "Genuine zisha comes from a single small region, is aged for years, and is shaped by hand by named masters. Price reflects authentic clay and hand work — factory-moulded pots are cheap precisely because they are neither.",
      },
      {
        q: "What is the difference between zi ni, zhu ni, and duan ni?",
        a: "They are the main zisha clay types: zi ni (purple clay) fires warm brown-purple, zhu ni (cinnabar) fires oxblood red and is high in iron, and duan ni is a sandy buff blend that fires beige to gold.",
      },
    ],
    cta: {
      heading: "See zisha clay in the hand.",
      note: "Browse handmade Yixing teapots, each one named for the clay it is thrown from.",
      href: "/teapots",
      label: "Shop Yixing teapots",
    },
    related: ["how-to-season-a-yixing-teapot", "yixing-tea-glossary", "tea-pets-explained"],
  },

  {
    slug: "how-to-season-a-yixing-teapot",
    title: "How to Season a Yixing Teapot: A Step-by-Step Guide",
    h1: "How to season a Yixing teapot",
    kicker: "Care Guide",
    description:
      "Season a new Yixing zisha teapot in six steps: clean it, dedicate it to one tea, brew regularly, rinse without soap, and build a lasting patina over time.",
    ogImage: "/images/teapot2.avif",
    ogImageAlt: "A seasoned Yixing zisha teapot on a tea tray",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    readMinutes: 5,
    intro: [
      "A new Yixing teapot leaves the studio half-made. Seasoning — “raising” the pot — is the slow process of letting the unglazed zisha clay absorb tea until it develops a soft, deep sheen called a patina (包浆, bāojiāng) and starts to round and enrich every cup.",
      "It takes no special tools and only a few minutes per session. Here is how to season a Yixing teapot properly, and the few rules that protect the clay.",
    ],
    sections: [
      {
        id: "before-you-start",
        heading: "Before you start: one pot, one tea",
        body: [
          "Because zisha absorbs aroma, a Yixing pot should be kept to a single category of tea — one pot for ripe pu-erh, another for roasted oolong, and so on. Mixing teas in one pot muddies the flavour it has stored. Choose the tea this pot will live with before you season it.",
          "Never use soap or detergent on a Yixing pot, ever. Soap soaks into the pores and ruins the tea. The pot is cleaned with hot water alone.",
        ],
      },
      {
        id: "after-seasoning",
        heading: "How long does seasoning take?",
        body: [
          "There is no fixed date. A pot used daily will show a visible glow in a few months; the deep, glassy patina collectors prize is the work of years. The colour also shifts — zhu ni deepens toward oxblood, duan ni warms toward honey, zi ni settles into a richer brown.",
          "Slow is normal and good. Seasoning cannot be rushed with oils, waxes, or polish — those clog the clay. The only real ingredient is tea, poured patiently over time.",
        ],
      },
    ],
    howTo: {
      name: "How to season a Yixing teapot",
      description:
        "Prepare and season a new unglazed Yixing zisha teapot so it develops a patina and improves your tea over time.",
      steps: [
        {
          name: "Rinse and inspect",
          text: "Rinse the new pot inside and out with hot water to clear any kiln dust. Use no soap. Check the lid fit and the pour.",
        },
        {
          name: "Give it a first tea bath",
          text: "Warm the pot, then brew a strong batch of the tea you have chosen for it. Fill the pot, sit it in a bowl, and pour the same tea over the outside. Let it soak as it cools, then rinse with hot water.",
        },
        {
          name: "Dedicate it to one tea",
          text: "From now on, brew only that one category of tea in this pot so the clay stores a single, clean flavour.",
        },
        {
          name: "Brew regularly",
          text: "Use the pot often. During each session pour the first rinse and a little leftover tea over the outside, then brush it gently with a soft tea brush to spread the tea evenly.",
        },
        {
          name: "Rinse, never scrub with soap",
          text: "After brewing, empty the leaves and rinse with hot water only. Never use detergent. Leave the lid off so the inside dries fully between sessions.",
        },
        {
          name: "Wipe, air-dry, and repeat",
          text: "Wipe the outside dry with a soft cloth and let the pot air. Repeated over months and years, the clay darkens and takes on the patina that is unique to your tea.",
        },
      ],
    },
    faq: [
      {
        q: "How long does it take to season a Yixing teapot?",
        a: "With daily use a Yixing teapot shows a soft sheen within a few months, while the deep patina collectors prize develops over years. Seasoning cannot be safely rushed.",
      },
      {
        q: "Can I use soap to clean a Yixing teapot?",
        a: "No. Soap and detergent soak into the porous zisha clay and spoil the tea. Clean a Yixing teapot with hot water only, then wipe it dry.",
      },
      {
        q: "Can I brew different teas in one Yixing teapot?",
        a: "It is best not to. Because the clay absorbs aroma, keep one pot to one category of tea — one for pu-erh, one for roasted oolong — so the stored flavour stays clean.",
      },
      {
        q: "Do I need to boil a new Yixing teapot first?",
        a: "A thorough hot-water rinse and a first tea bath are enough for a quality handmade pot. Some people simmer a new pot gently in tea, but never boil it in plain hard water or with soap.",
      },
    ],
    cta: {
      heading: "Choose a pot worth seasoning.",
      note: "Hand-thrown Yixing teapots, each one unglazed and ready to raise with your tea.",
      href: "/teapots",
      label: "Shop Yixing teapots",
    },
    related: ["what-is-yixing-clay", "how-to-care-for-a-tea-pet", "yixing-tea-glossary"],
  },

  {
    slug: "tea-pets-explained",
    title: "What Is a Tea Pet? 茶宠 Meaning, Culture & Journey to the West",
    h1: "What is a tea pet?",
    kicker: "Tea Pet Culture",
    description:
      "A tea pet (茶宠) is a small unglazed clay figure kept on the gongfu tea tray and ‘raised’ on leftover tea. Learn the meanings, the lucky forms, and the Journey to the West cast.",
    ogImage: "/products/wukong/tray.avif",
    ogImageAlt: "A Yixing zisha tea pet resting on a wooden gongfu tea tray",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    readMinutes: 6,
    intro: [
      "A tea pet — 茶宠, chá chǒng, literally “tea pet” — is a small unglazed clay figure that lives on the gongfu tea tray beside the pot. Sculpted from the same Yixing zisha clay as a teapot, it has no practical function. It is a companion you raise with the tea you pour.",
      "Tea pets have shared the Chinese tea table for centuries. Here is what they are, how you “feed” one, what the common forms mean, and why so many of them come from the classic novel Journey to the West.",
    ],
    sections: [
      {
        id: "how-you-raise-it",
        heading: "How you raise a tea pet",
        body: [
          "You raise a tea pet the way you season a pot. During a gongfu session, the first rinse of the leaves and the last drops in the cup are poured over the pet, and it is brushed gently with a soft tea brush. Its open zisha clay drinks the tea in.",
          "Over months the surface darkens and takes on a soft glow — a patina that records how often, and with what, you brew. No two tea pets age alike; the colour a pet reaches is a record of your own tea.",
        ],
      },
      {
        id: "lucky-forms",
        heading: "Common tea pets and what they mean",
        body: [
          "Many tea pets carry old wishes. The three-legged money toad (jin chan, 金蟾) is an emblem of prosperity. The pixiu (貔貅), a winged mythical beast, is said to draw in wealth. Zodiac animals mark the year of your birth. A cicada stands for rebirth, a cat for fortune and quiet company.",
          "Because the pet is a personal object, people often choose a form that means something to them — their zodiac sign, a blessing they want at the table, or simply a creature they like to watch change with the tea.",
        ],
      },
      {
        id: "journey-to-the-west",
        heading: "The Journey to the West pilgrims",
        body: [
          "One of the most beloved tea-pet themes is Journey to the West (西游记, Xīyóujì), the 16th-century novel that is one of the four great classics of Chinese literature. It follows the monk Tang Sanzang and three disciples on a pilgrimage west to fetch Buddhist scriptures.",
          "The star is Sun Wukong (孙悟空), the Monkey King — born from stone, quick, and mischievous — often sculpted mid-leap with a hand shading his eyes. He travels with Zhu Bajie, the pig, and Sha Wujing, the sand monk. As tea pets the pilgrims stand for the road and for steadfastness, which is why a Monkey King is such a popular companion on the tray.",
        ],
      },
      {
        id: "tea-pet-vs-teapot",
        heading: "Tea pet or teapot — do you need both?",
        body: [
          "They are made from the same clay and age the same way, but they play different roles: the teapot brews, the tea pet keeps you company and soaks up the overflow. Many tea drinkers start with a pot and add a pet later, or give a tea pet as a gift — it is an inexpensive, lasting way into the ritual.",
        ],
      },
    ],
    faq: [
      {
        q: "What is a tea pet?",
        a: "A tea pet (茶宠) is a small unglazed Yixing clay figure kept on the gongfu tea tray. It has no functional use; it is ‘raised’ by pouring leftover tea over it until the clay develops a deep patina.",
      },
      {
        q: "How do you use a tea pet?",
        a: "During a tea session, pour the first rinse and leftover tea over the pet and brush it gently with a soft tea brush. Over time the porous clay darkens into a glossy patina unique to your brewing. Never use soap.",
      },
      {
        q: "What do tea pet figures mean?",
        a: "Many tea pets carry blessings: the three-legged money toad means prosperity, the pixiu draws wealth, zodiac animals mark your birth year, and Journey to the West figures like the Monkey King stand for the road and perseverance.",
      },
      {
        q: "Are tea pets made from the same clay as teapots?",
        a: "Yes. Tea pets are sculpted from the same Yixing zisha (purple sand) clay as teapots, which is why they season and change colour the same way with use.",
      },
    ],
    cta: {
      heading: "Find a creature to raise.",
      note: "Cats, lucky beasts, and the pilgrims of Journey to the West — each cast from a different Yixing clay.",
      href: "/tea-pets",
      label: "Shop tea pets",
    },
    related: ["how-to-care-for-a-tea-pet", "what-is-yixing-clay", "yixing-tea-glossary"],
  },

  {
    slug: "how-to-care-for-a-tea-pet",
    title: "How to Care for a Tea Pet: Feeding & Seasoning Guide",
    h1: "How to care for a tea pet",
    kicker: "Care Guide",
    description:
      "Caring for a tea pet (茶宠) takes five simple steps: give it a tea bath, brush it, skip the soap, dry it, and let the Yixing clay build a patina over time.",
    ogImage: "/products/wukong/front.avif",
    ogImageAlt: "A hand-sculpted Yixing zisha tea pet",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    readMinutes: 4,
    intro: [
      "Caring for a tea pet — sometimes called “feeding” or “raising” it — is simple and pleasant, and it is what turns a plain clay figure into a glossy, personal companion. The unglazed Yixing zisha clay slowly drinks the tea you give it and deepens into a patina.",
      "Here is the routine, step by step, plus the one thing you must never do.",
    ],
    sections: [
      {
        id: "why-care",
        heading: "Why a tea pet needs ‘feeding’",
        body: [
          "A tea pet is made of the same porous zisha clay as a Yixing teapot. Pour tea over it regularly and the clay absorbs colour and aroma, darkening over months into a soft sheen. Leave it dry and it simply stays raw — the changing surface is the reward of use.",
          "There is no rush and no trick. The colour a pet reaches comes only from real tea over real time; oils and polishes clog the clay and should never be used.",
        ],
      },
    ],
    howTo: {
      name: "How to care for and season a tea pet",
      description:
        "Feed and season an unglazed Yixing clay tea pet so it develops a deep, even patina over time.",
      steps: [
        {
          name: "Give it a tea bath",
          text: "During each gongfu session, pour the first rinse of the leaves and a little leftover tea over the pet. Use warm tea, not boiling water straight from the kettle.",
        },
        {
          name: "Brush it evenly",
          text: "Sweep a soft tea brush over the whole figure so the tea spreads into every crevice. Even brushing prevents blotches and gives a uniform patina.",
        },
        {
          name: "Never use soap",
          text: "Clean the pet with tea and water only. Soap, detergent, and oils soak into the clay and ruin the surface for good.",
        },
        {
          name: "Let it dry between sessions",
          text: "Wipe off pooled tea and let the pet air-dry so it does not grow mould or sour. A dry pet between brews ages cleanly.",
        },
        {
          name: "Keep it on the tray",
          text: "Display the pet on your tea tray and feed it consistently. Months of regular tea baths build the deep, glossy colour that is unique to your brewing.",
        },
      ],
    },
    faq: [
      {
        q: "How do you feed a tea pet?",
        a: "‘Feeding’ a tea pet means pouring leftover tea over it during each session and brushing it with a soft tea brush, so the porous clay absorbs the tea and slowly develops a patina.",
      },
      {
        q: "How long until a tea pet changes colour?",
        a: "With regular use a tea pet begins to deepen within weeks and shows a clear glow in a few months. The richest patina takes years of consistent tea baths.",
      },
      {
        q: "Can I use any tea on my tea pet?",
        a: "Yes, though darker teas like ripe pu-erh and roasted oolong build colour fastest. Whatever you use, give the pet tea consistently and never clean it with soap.",
      },
      {
        q: "Why is my tea pet developing uneven spots?",
        a: "Uneven colour usually means tea is pooling in one place. Brush the whole figure evenly after each tea bath and let it dry fully between sessions for a uniform patina.",
      },
    ],
    cta: {
      heading: "Adopt a tea pet to raise.",
      note: "Hand-sculpted Yixing zisha creatures, ready for their first tea bath.",
      href: "/tea-pets",
      label: "Shop tea pets",
    },
    related: ["tea-pets-explained", "how-to-season-a-yixing-teapot", "yixing-tea-glossary"],
  },

  {
    slug: "yixing-tea-glossary",
    title: "Yixing Teapot & Gongfu Tea Glossary",
    h1: "Yixing & gongfu tea glossary",
    kicker: "Reference",
    description:
      "A plain-English glossary of Yixing teapot and gongfu tea terms — zisha, zi ni, zhu ni, duan ni, di cao qing, gongfu cha, gaiwan, patina, and more.",
    ogImage: "/images/getty_pots.avif",
    ogImageAlt: "A shelf of handmade Yixing clay teaware",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    readMinutes: 5,
    intro: [
      "Yixing teaware comes wrapped in Chinese terms — clay names, pot forms, and tea-ritual words that rarely get translated. This glossary defines the ones you will meet on our product pages and across the gongfu tea world, in plain English.",
    ],
    sections: [
      {
        id: "how-to-use",
        heading: "Reading the names on a pot",
        body: [
          "Most Yixing pots are named for two things: the clay they are thrown from and the classic form they follow. “Zhu Ni Xishi,” for example, is an Xishi-form pot in cinnabar clay. The glossary below splits the vocabulary into clay types, pot forms, and tea-ritual terms.",
        ],
      },
    ],
    glossary: [
      {
        term: "Yixing",
        zh: "宜兴",
        pinyin: "yí xīng",
        def: "A city in Jiangsu province, China, and the only source of true zisha clay. ‘Yixing teapot’ means a teapot made from this regional clay.",
      },
      {
        term: "Zisha",
        zh: "紫砂",
        pinyin: "zǐ shā",
        def: "‘Purple sand’ — the family of mineral-rich, iron-bearing stoneware clays from Yixing, fired unglazed so the pot can breathe and season.",
      },
      {
        term: "Zi Ni",
        zh: "紫泥",
        pinyin: "zǐ ní",
        def: "Purple clay, the classic and most common zisha body. Dense and forgiving, it fires a warm brown-purple and deepens with tea.",
      },
      {
        term: "Di Cao Qing",
        zh: "底槽清",
        pinyin: "dǐ cáo qīng",
        def: "A prized seam of zi ni from the bottom layer of the Huanglongshan ore, valued for its even, settled brown-red tone.",
      },
      {
        term: "Zhu Ni",
        zh: "朱泥",
        pinyin: "zhū ní",
        def: "Cinnabar clay — high in iron, fires a glowing oxblood red. It shrinks heavily in the kiln, so well-made zhu ni pots are difficult and prized.",
      },
      {
        term: "Duan Ni",
        zh: "段泥",
        pinyin: "duàn ní",
        def: "A sandy, buff-coloured zisha blend that fires from raw-biscuit beige toward honey and gold; includes variants like Golden Duan (黄金段).",
      },
      {
        term: "Ben Shan Lü Ni",
        zh: "本山绿泥",
        pinyin: "běn shān lǜ ní",
        def: "‘Original-mountain green clay,’ a rarer zisha that fires a pale greenish-beige. Despite the name it is not bright green.",
      },
      {
        term: "Gongfu cha",
        zh: "功夫茶",
        pinyin: "gōng fu chá",
        def: "The Chinese ‘skill tea’ method: small pot, many short infusions, and full attention — the style of brewing Yixing pots are built for.",
      },
      {
        term: "Gaiwan",
        zh: "盖碗",
        pinyin: "gài wǎn",
        def: "A lidded brewing cup used in gongfu tea as an alternative to a teapot, letting you brew, steep, and pour from one vessel.",
      },
      {
        term: "Wen xiang bei",
        zh: "闻香杯",
        pinyin: "wén xiāng bēi",
        def: "The tall ‘aroma cup.’ Tea is poured in, tipped into the drinking cup, and the empty cup is cupped to the nose to read the lingering scent.",
      },
      {
        term: "Patina",
        zh: "包浆",
        pinyin: "bāo jiāng",
        def: "The soft, deepening sheen that unglazed zisha develops as it absorbs tea over months and years — the goal of seasoning a pot or tea pet.",
      },
      {
        term: "Ti liang",
        zh: "提梁",
        pinyin: "tí liáng",
        def: "An ‘overhead-handle’ teapot, where the handle vaults across the top in a bridge rather than sitting at the side.",
      },
      {
        term: "Shi Piao",
        zh: "石瓢",
        pinyin: "shí piáo",
        def: "The ‘stone-ladle’ form — a near-triangular classic pot prized by Qing-dynasty scholars for its honest, unornamented geometry.",
      },
      {
        term: "Xishi",
        zh: "西施",
        pinyin: "xī shī",
        def: "A round, full-bodied teapot form named for a legendary Chinese beauty; one of the most popular classic Yixing shapes.",
      },
      {
        term: "Tea pet",
        zh: "茶宠",
        pinyin: "chá chǒng",
        def: "A small unglazed Yixing clay figure kept on the tea tray and ‘raised’ on leftover tea until it develops a patina.",
      },
    ],
    faq: [
      {
        q: "What does zisha mean?",
        a: "Zisha (紫砂) means ‘purple sand.’ It is the family of mineral-rich stoneware clays from Yixing, China, used unglazed for teapots and tea pets so they can breathe and season.",
      },
      {
        q: "What is gongfu tea?",
        a: "Gongfu cha (功夫茶) is the Chinese ‘skill tea’ method of brewing: a small pot, a high leaf-to-water ratio, and many short infusions — the style Yixing teapots are designed for.",
      },
      {
        q: "What is the difference between a gaiwan and a Yixing teapot?",
        a: "A gaiwan is a lidded brewing cup that suits any tea and shows off aroma, while a seasoned Yixing teapot is kept to one tea and rounds its flavour over time. Many drinkers use both.",
      },
    ],
    cta: {
      heading: "Put the words to the pots.",
      note: "Browse the full catalogue of Yixing teapots and tea pets, each named for its clay and form.",
      href: "/shop",
      label: "Shop the catalogue",
    },
    related: ["what-is-yixing-clay", "how-to-season-a-yixing-teapot", "tea-pets-explained"],
  },
];

const GUIDE_INDEX: Record<string, Guide> = Object.fromEntries(
  GUIDES.map((g) => [g.slug, g]),
);

export function getGuide(slug: string): Guide | undefined {
  return GUIDE_INDEX[slug];
}

export function relatedGuides(slug: string): Guide[] {
  const guide = GUIDE_INDEX[slug];
  if (!guide) return [];
  return guide.related
    .map((s) => GUIDE_INDEX[s])
    .filter((g): g is Guide => Boolean(g));
}
