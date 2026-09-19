"""Crops of every reserved photo frame in context, for critique. Usage:
   python scripts/frame-crops.py <base-url> <outdir> <tag> [width] [dpr]
Each [data-todo] block (and, for a section-level view, its enclosing <section>) is captured with 160 px of context."""
import sys
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
base, out, tag = sys.argv[1], sys.argv[2], sys.argv[3]
w = int(sys.argv[4]) if len(sys.argv) > 4 else 1280
dpr = float(sys.argv[5]) if len(sys.argv) > 5 else 1
routes = {"home": "/", "about": "/about-us", "careers": "/careers"}
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(viewport={"width": w, "height": 900}, device_scale_factor=dpr, reduced_motion="reduce")
    pg = ctx.new_page()
    for name, route in routes.items():
        pg.goto(base + route); pg.wait_for_load_state("load"); pg.wait_for_timeout(800)
        boxes = pg.evaluate("""() => [...document.querySelectorAll('section')]
            .filter(s => s.querySelector('[data-todo]') || s.id === 'office')
            .map(s => { const r = s.getBoundingClientRect(); return {id: s.id || s.getAttribute('aria-labelledby') || 'section', x: r.x, y: r.y + scrollY, w: r.width, h: r.height}; })""")
        for i, bx in enumerate(boxes):
            if bx["h"] > 2200: continue  # the hero/whole-page wrappers
            f = f"{out}/frames-{tag}-{name}-{bx['id'] or i}-{w}.png"
            pg.screenshot(path=f, full_page=True, clip={"x": 0, "y": max(0, bx["y"] - 40), "width": w, "height": bx["h"] + 80})
            print("saved", f, int(bx["h"]))
    b.close()
