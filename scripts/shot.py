"""Screenshot helper for self-critique. Usage:
   python scripts/shot.py <url> <out.png> [width] [height] [dpr] [--full] [--reduced-motion] [--scroll=N]
Assumes a server is already running at <url>."""
import sys
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
args = [a for a in sys.argv[1:] if not a.startswith("--")]
flags = [a for a in sys.argv[1:] if a.startswith("--")]
url, out = args[0], args[1]
w = int(args[2]) if len(args) > 2 else 1280
h = int(args[3]) if len(args) > 3 else 900
dpr = float(args[4]) if len(args) > 4 else 1
scroll = next((int(f.split("=")[1]) for f in flags if f.startswith("--scroll=")), 0)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(
        viewport={"width": w, "height": h},
        device_scale_factor=dpr,
        reduced_motion="reduce" if "--reduced-motion" in flags else "no-preference",
    )
    pg = ctx.new_page()
    logs = []
    pg.on("console", lambda m: logs.append(f"[{m.type}] {m.text}"))
    pg.on("pageerror", lambda e: logs.append(f"[pageerror] {e}"))
    pg.goto(url)
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(1200)
    if scroll:
        pg.evaluate(f"window.scrollTo(0, {scroll})")
        pg.wait_for_timeout(1500)
    pg.wait_for_timeout(600)
    pg.screenshot(path=out, full_page="--full" in flags)
    for l in logs:
        if "[error]" in l or "pageerror" in l or "[warning]" in l:
            print(l[:300])
    b.close()
print("saved", out)
