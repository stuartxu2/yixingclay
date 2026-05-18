/**
 * @yixingclay/ui-theme
 *
 * The PO/ET design tokens, shared by the web storefront and the Expo app so
 * both platforms render the same brand. Every colour is sourced from
 * nipponcolors.com — its name and hex are kept together on purpose.
 */

export interface NipponColor {
  /** Romanised traditional Japanese colour name. */
  name: string;
  /** Original kanji. */
  kanji: string;
  hex: string;
}

/** The brand palette, keyed by the semantic role each colour plays. */
export const palette = {
  paper: { name: "Shironeri", kanji: "白練", hex: "#FCFAF2" },
  surface: { name: "Gofun", kanji: "胡粉", hex: "#FFFFFB" },
  sand: { name: "Torinoko", kanji: "鳥の子", hex: "#DAC9A6" },
  ink: { name: "Sumi", kanji: "墨", hex: "#1C1C1C" },
  kogecha: { name: "Kogecha", kanji: "焦茶", hex: "#563F2E" },
  inkFaint: { name: "Rikyushiracha", kanji: "利休白茶", hex: "#B4A582" },
  clay: { name: "Bengara", kanji: "弁柄", hex: "#9A5034" },
  clayDeep: { name: "Ebicha", kanji: "海老茶", hex: "#734338" },
  jade: { name: "Byakuroku", kanji: "白緑", hex: "#A8D8B9" },
} as const satisfies Record<string, NipponColor>;

export type PaletteRole = keyof typeof palette;

/** Flat role → hex map, convenient for React Native / inline styles. */
export const colors = Object.fromEntries(
  Object.entries(palette).map(([role, c]) => [role, c.hex]),
) as Record<PaletteRole, string>;

/** Type ramp — Ekster is the single brand typeface. */
export const typography = {
  fontFamily: "Ekster",
  weights: { thin: 200, light: 300, regular: 400, medium: 500, bold: 700 },
} as const;

/** Shared easing curve for quiet, editorial motion. */
export const motion = {
  easeQuiet: "cubic-bezier(0.22, 0.61, 0.36, 1)",
} as const;
