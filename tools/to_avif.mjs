#!/usr/bin/env node
// Convert image(s) to AVIF using sharp.
// Usage: node tools/to_avif.mjs <input> [input2 ...] [--quality 55] [--keep]
//   --quality N   AVIF quality 1-100 (default 55, good balance for photos)
//   --keep        do not delete source files after successful conversion
import sharp from "sharp";
import { stat, unlink } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
let quality = 55;
let keep = false;
const inputs = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--quality") quality = parseInt(args[++i], 10);
  else if (a === "--keep") keep = true;
  else inputs.push(a);
}
if (inputs.length === 0) {
  console.error("usage: node tools/to_avif.mjs <input> [..] [--quality 55] [--keep]");
  process.exit(1);
}

for (const inp of inputs) {
  const ext = path.extname(inp);
  const out = inp.slice(0, -ext.length) + ".avif";
  const before = (await stat(inp)).size;
  await sharp(inp)
    .rotate()
    .avif({ quality, effort: 6, chromaSubsampling: "4:2:0" })
    .toFile(out);
  const after = (await stat(out)).size;
  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(`${inp} -> ${out}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB  (-${pct}%)`);
  if (!keep && ext.toLowerCase() !== ".avif") await unlink(inp);
}
