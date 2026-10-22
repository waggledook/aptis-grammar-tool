#!/usr/bin/env python3
"""Create WebP siblings for vocabulary PNGs, preserving dimensions and alpha.

Requires Pillow. Originals are retained; activity data must select the .webp paths.
Usage: python3 scripts/convert-vocab-images-to-webp.py public/images/vocab/<folder>
"""
import argparse
from pathlib import Path
from PIL import Image

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("directories", type=Path, nargs="+")
args = parser.parse_args()
source_bytes = output_bytes = count = 0
for directory in args.directories:
    if not directory.is_dir():
        parser.error(f"Image directory not found: {directory}")
    for source in sorted(directory.glob("*.png")):
        target = source.with_suffix(".webp")
        with Image.open(source) as original:
            if not target.exists() or source.stat().st_mtime > target.stat().st_mtime:
                original.save(target, "WEBP", quality=90, method=6, alpha_quality=100, exact=True)
            with Image.open(target) as converted:
                assert converted.format == "WEBP" and converted.size == original.size, target
                # WebP may omit an entirely opaque alpha channel.
                assert original.convert("RGBA").getchannel("A").tobytes() == converted.convert("RGBA").getchannel("A").tobytes(), target
        source_bytes += source.stat().st_size
        output_bytes += target.stat().st_size
        count += 1
print(f"{count} images: {source_bytes / 1048576:.1f} MiB PNG → {output_bytes / 1048576:.1f} MiB WebP; dimensions and alpha verified.")
