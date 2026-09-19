"""Viewport screenshots of each home section with the Roster settled. python scripts/home-shots.py <outdir> [width height dpr]"""
import sys
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
out = sys.argv[1]
w, h, dpr = (int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (1280, 900, 1)
tag = f"{w}"
sections = ["top", "proof", "coverage", "services", "lifecycle", "work", "testimonials", "clients", "close"]
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    pg = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, is_mobile=w < 640, has_touch=w < 640).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type in ("error", "warning") and "404" not in m.text else None)
    pg.goto("http://localhost:3131/"); pg.wait_for_load_state("load"); pg.wait_for_timeout(2200)
    for s in sections:
        if s == "top":
            pg.evaluate("window.scrollTo(0,0)")
        elif s == "proof":
            pg.evaluate("window.scrollTo(0, document.querySelector('[data-roster-slot=grid]').getBoundingClientRect().top + window.scrollY - window.innerHeight*0.3)")
        else:
            pg.evaluate(f"window.scrollTo(0, document.getElementById('{s}').getBoundingClientRect().top + window.scrollY - 64)")
        pg.wait_for_timeout(1600)
        pg.screenshot(path=f"{out}/m4-{tag}-{s}.png")
    print("errors:", errs or "none")
    b.close()
