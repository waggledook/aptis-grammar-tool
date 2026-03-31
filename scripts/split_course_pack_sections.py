from pathlib import Path
from pypdf import PdfReader, PdfWriter

SOURCE_PDF = Path("/Users/nicholasbeeson/Downloads/Seif Aptis Trainer pack March 26.pdf")
OUTPUT_DIR = Path("/Users/nicholasbeeson/aptis-grammar-tool/coursepack-sections")

SECTIONS = [
    {"id": "cover", "start": 1, "end": 1},
    {"id": "introduction", "start": 2, "end": 5},
    {"id": "core-grammar", "start": 6, "end": 15},
    {"id": "core-vocab", "start": 16, "end": 20},
    {"id": "reading-part-1", "start": 21, "end": 24},
    {"id": "reading-part-2", "start": 25, "end": 30},
    {"id": "reading-part-3", "start": 31, "end": 36},
    {"id": "reading-part-4", "start": 37, "end": 42},
    {"id": "speaking-part-1", "start": 43, "end": 46},
    {"id": "speaking-part-2", "start": 47, "end": 56},
    {"id": "speaking-part-3", "start": 57, "end": 63},
    {"id": "speaking-part-4", "start": 64, "end": 70},
    {"id": "writing-part-1", "start": 71, "end": 72},
    {"id": "writing-part-2", "start": 73, "end": 74},
    {"id": "writing-part-3", "start": 75, "end": 76},
    {"id": "writing-part-4", "start": 77, "end": 78},
]


def main():
    if not SOURCE_PDF.exists():
        raise FileNotFoundError(f"Missing source PDF: {SOURCE_PDF}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    reader = PdfReader(str(SOURCE_PDF))

    for section in SECTIONS:
        writer = PdfWriter()
        for page_num in range(section["start"], section["end"] + 1):
            writer.add_page(reader.pages[page_num - 1])

        out_path = OUTPUT_DIR / f"{section['id']}.pdf"
        with out_path.open("wb") as fp:
            writer.write(fp)
        print(f"Wrote {out_path.name}: pp. {section['start']}-{section['end']}")


if __name__ == "__main__":
    main()
