#!/usr/bin/env node
// Convert image(s) to AVIF using sharp.
// Usage: node tools/to_avif.mjs <input> [input2 ...] [--quality 55] [--max-edge N] [--keep]
//   --quality N    AVIF quality 1-100 (default 55, good balance for photos)
//   --max-edge N   downscale so the long edge is <= N px (no upscaling). Off by default.
//   --keep         do not delete source files after successful conversion
import sharp from "sharp";
import { stat, unlink } from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);
let quality = 55;
let maxEdge = 0;
let keep = false;
const inputs = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === "--quality") quality = parseInt(args[++i], 10);
  else if (a === "--max-edge") maxEdge = parseInt(args[++i], 10);
  else if (a === "--keep") keep = true;
  else inputs.push(a);
}
if (inputs.length === 0) {
  console.error("usage: node tools/to_avif.mjs <input> [..] [--quality 55] [--max-edge N] [--keep]");
  process.exit(1);
}

for (const inp of inputs) {
  const ext = path.extname(inp);
  const out = inp.slice(0, -ext.length) + ".avif";
  const before = (await stat(inp)).size;
  let pipeline = sharp(inp).rotate();
  if (maxEdge > 0) {
    pipeline = pipeline.resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    });
  }
  await pipeline
    .avif({ quality, effort: 6, chromaSubsampling: "4:2:0" })
    .toFile(out);
  const after = (await stat(out)).size;
  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(`${inp} -> ${out}  ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB  (-${pct}%)`);
  if (!keep && ext.toLowerCase() !== ".avif") await unlink(inp);
}
