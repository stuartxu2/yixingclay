/**
 * PO/ET teapot showcase data.
 *
 * Teapots are the "pot" half of the brand (PO/ET — pots + pets). Unlike the
 * tea pets, these are made-to-order showcase pieces and are not yet sold
 * through checkout, so this is a lightweight local catalogue with no Medusa
 * backing. Wire to Medusa later if teapots become a purchasable line.
 */

export interface Teapot {
  slug: string;
  name: string;
  zh: string;
  clay: string;
  shape: string;
  capacity: string;
  poem: string;
  blurb: string;
  image: string;
}

export const TEAPOTS: Teapot[] = [
  {
    slug: "xishi",
    name: "The Xishi",
    zh: "西施壶",
    clay: "Zhu Ni · 朱泥",
    shape: "Xishi — the classic rounded form",
    capacity: "180 ml",
    poem: "All soft curves, named for a beauty.",
    blurb:
      "The Xishi is full, low, and round — a body that pours in one clean arc. Fired from bright Zhu Ni cinnabar clay, it warms to a deeper red with every brewing.",
    image: "/images/teapot2.png",
  },
  {
    slug: "shipiao",
    name: "The Shi Piao",
    zh: "石瓢壶",
    clay: "Lao Zi Ni · 老紫泥",
    shape: "Shi Piao — the stone ladle",
    capacity: "220 ml",
    poem: "A scholar's pot, steady on the tray.",
    blurb:
      "A broad-shouldered, near-triangular pot drawn from the shape of an old stone ladle. Aged purple clay gives it a quiet matte depth that asks for slow, considered tea.",
    image: "/images/teapot3.png",
  },
  {
    slug: "julunzhu",
    name: "The Ju Lun Zhu",
    zh: "巨轮珠",
    clay: "Zi Ni · 紫泥",
    shape: "Ju Lun Zhu — the great wheel pearl",
    capacity: "110 ml",
    poem: "Small enough to close a hand around.",
    blurb:
      "A compact, near-spherical pot for solo gongfu sessions. Dense Zi Ni clay holds heat well and rounds the bitterness from young, brash tea.",
    image: "/images/teapot4.png",
  },
];
