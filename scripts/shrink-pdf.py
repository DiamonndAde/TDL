"""
Compress a PDF for the web without touching its text: resample each embedded JPEG to the size it is actually shown
at (PX_PER_PT pixels per PDF point), re-encode it, then subset the fonts. Text and vector art stay as they are, so
the result reads exactly as sharp; only photographs lose resolution they never displayed.

Used for TDL's brochure (2026-10-17): 2,543,741 → 1,098,492 bytes at 1.4 px/pt, quality 62 (a full-width image
on its 960 pt slide pages becomes 1,344 px), text identical on all 17 pages.

Needs PyMuPDF and fontTools, which the site does not depend on — install them somewhere disposable:
    python -m pip install --target /tmp/pdflib pymupdf fonttools
    python scripts/shrink-pdf.py /tmp/pdflib "TDL Profile.pdf" public/brochure.pdf [1.4] [62]
Check the result by eye at 100% before replacing the live file.
"""
import io, os, sys

lib, src, dst = sys.argv[1], sys.argv[2], sys.argv[3]
PX_PER_PT = float(sys.argv[4]) if len(sys.argv) > 4 else 1.4
QUALITY = int(sys.argv[5]) if len(sys.argv) > 5 else 62
sys.path.insert(0, lib)
import fitz  # noqa: E402  (PyMuPDF, from `lib`)
from PIL import Image  # noqa: E402

d = fitz.open(src)
shown = {}  # largest displayed size of each image, in points, across every page that shows it
for page in d:
    for img in page.get_images(full=True):
        for r in page.get_image_rects(img[0]):
            w, h = shown.get(img[0], (0, 0))
            shown[img[0]] = (max(w, r.width), max(h, r.height))

done, saved = set(), 0
for page in d:
    for img in page.get_images(full=True):
        x, smask = img[0], img[1]
        if x in done or x not in shown:
            continue
        done.add(x)
        info = d.extract_image(x)
        if info["ext"] not in ("jpeg", "jpg") or smask or len(info["image"]) < 30_000:
            continue  # PNGs, anything with transparency, and small images are left alone
        im = Image.open(io.BytesIO(info["image"]))
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        tw, th = shown[x][0] * PX_PER_PT, shown[x][1] * PX_PER_PT
        k = min(1.0, max(tw / im.width, th / im.height))
        if k < 1.0:
            im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True, subsampling=2)
        if buf.tell() < len(info["image"]):
            page.replace_image(x, stream=buf.getvalue())
            saved += len(info["image"]) - buf.tell()

d.subset_fonts()
d.save(dst, garbage=4, deflate=True, clean=True)
before, after = os.path.getsize(src), os.path.getsize(dst)
same = all(a.get_text() == b.get_text() for a, b in zip(fitz.open(src), fitz.open(dst)))
print(f"{before:,} -> {after:,} bytes ({100 * after / before:.0f}%); text identical on every page: {same}")
