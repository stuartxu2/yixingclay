#!/usr/bin/env python3
"""
import_teapots.py — WAT tool.

Parses the raw teapot product folders under `images/tea pots/`, selects a
curated subset with usable white-background photography, copies those photos
into `apps/web/public/teapots/<slug>/`, and emits parsed product data as JSON
for `apps/web/lib/teapots.ts` to be hand-finished with English copy.

Source `1.txt` schema (Chinese, full-width colons):
    器型 shape · 作者 artist · 泥料 clay · 容量ml capacity ·
    长宽高cm dimensions · 克重g weight · 价格/拿货价（元） price (yuan)

Run from the repo root:  python3 tools/import_teapots.py
"""

import json
import random
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "images" / "tea pots"
DEST = ROOT / "apps" / "web" / "public" / "teapots"
OUT = ROOT / ".tmp" / "teapots.json"

TARGET_COUNT = 24
IMG_EXTS = {".jpg", ".jpeg", ".png"}
random.seed(42)  # deterministic stock numbers + selection


def parse_txt(path: Path) -> dict:
    """Read a `1.txt` spec sheet into a flat dict keyed by Chinese label."""
    fields = {}
    text = path.read_text(encoding="utf-8", errors="ignore")
    for line in text.splitlines():
        if "：" not in line:
            continue
        key, _, value = line.partition("：")
        fields[key.strip()] = value.strip()
    return fields


def white_bg_images(folder: Path) -> list[Path]:
    """Return up to 5 white-background photos, preferring the 白背景 dir."""
    for sub in ("白背景", "1", "2"):
        d = folder / sub
        if d.is_dir():
            imgs = sorted(
                (f for f in d.iterdir() if f.suffix.lower() in IMG_EXTS),
                key=lambda f: f.name,
            )
            if len(imgs) >= 4:
                return imgs[:5]
    return []


def yuan(fields: dict) -> int:
    """Extract the yuan price from either 价格 or 拿货价（元）."""
    raw = fields.get("价格") or fields.get("拿货价（元）") or fields.get("拿货价") or "0"
    m = re.search(r"\d+(?:\.\d+)?", raw)
    return int(float(m.group())) if m else 0


def main() -> None:
    records = []
    for folder in sorted(SRC.rglob("*")):
        txt = folder / "1.txt"
        if not txt.is_file():
            continue
        imgs = white_bg_images(folder)
        if not imgs:
            continue
        f = parse_txt(txt)
        sku = re.sub(r"[^0-9a-zA-Z]", "", folder.name).lower()  # 窑云S0103 -> s0103
        slug = re.sub(r"^[a-z]+(?=s\d)", "", sku) or sku  # drop kiln prefix -> s0103
        records.append(
            {
                "slug": slug,
                "sku": folder.name,
                "shape_zh": f.get("器型", ""),
                "artist_zh": f.get("作者", ""),
                "clay_zh": f.get("泥料", ""),
                "capacity": int(re.sub(r"\D", "", f.get("容量ml", "0")) or 0),
                "dimensions": f.get("长宽高cm", ""),
                "weight": f.get("克重g", ""),
                "yuan": yuan(f),
                "_imgs": imgs,
            }
        )

    # Curate: balance the two artists, spread across clay bodies, require a price.
    usable = [r for r in records if r["yuan"] > 0 and r["artist_zh"]]
    by_clay: dict[str, list] = {}
    for r in usable:
        by_clay.setdefault(r["clay_zh"], []).append(r)
    for group in by_clay.values():
        group.sort(key=lambda r: r["slug"])

    selected, pools = [], list(by_clay.values())
    while len(selected) < TARGET_COUNT and any(pools):
        for group in pools:
            if group:
                selected.append(group.pop(0))
                if len(selected) >= TARGET_COUNT:
                    break

    # Copy photos and finalise records.
    if DEST.exists():
        shutil.rmtree(DEST)
    out = []
    for r in selected:
        slug = r["slug"]
        dest_dir = DEST / slug
        dest_dir.mkdir(parents=True, exist_ok=True)
        image_paths = []
        for i, img in enumerate(r["_imgs"], start=1):
            target = dest_dir / f"{i}.jpg"
            shutil.copy2(img, target)
            image_paths.append(f"/teapots/{slug}/{i}.jpg")
        r.pop("_imgs")
        r["images"] = image_paths
        r["stock"] = random.randint(2, 14)
        out.append(r)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"parsed {len(records)} folders, selected {len(out)}")
    print(f"clay bodies: {sorted({r['clay_zh'] for r in out})}")
    print(f"artists: {sorted({r['artist_zh'] for r in out})}")
    print(f"-> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
