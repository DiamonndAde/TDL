"""Milestone-3 proofs against the Roster harness. Assumes a server at BASE (built with NEXT_PUBLIC_DEV_ROUTES=1).
   python scripts/roster-proofs.py <outdir> [base]"""
import sys, time, re
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
out = sys.argv[1]
base = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3131"
URL = base + "/dev/roster"
STATES = ["drift", "grid", "map", "columns", "path", "mark"]


def stats(pg):
    return pg.locator("output").inner_text()


def run(ctx, label):
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    pg.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    pg.goto(URL)
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(1500)
    print(f"\n== {label}: initial  {stats(pg)}")
    return pg, errors


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME, args=["--enable-gpu-rasterization"])

    # --- 1. every state, 2x DPR, instant jumps (shift-click) --------------------------------------------
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=2)
    pg, errors = run(ctx, "states @2x")
    for s in STATES:
        pg.locator(f"button:text-is('{s}')").click(modifiers=["Shift"])
        pg.wait_for_timeout(1400)
        pg.screenshot(path=f"{out}/m3-{s}.png")
        print(f"   {s:8s} {stats(pg)}")
    # column highlight
    pg.locator("button:text-is('columns')").click(modifiers=["Shift"])
    pg.wait_for_timeout(600)
    pg.select_option("select", "4")
    pg.wait_for_timeout(700)
    pg.screenshot(path=f"{out}/m3-columns-active.png")
    print("   column 4 active screenshot taken")
    print("   errors:", errors or "none")

    # --- 2. fling: smooth Lenis scroll from top to bottom; sample the readout ------------------------------
    pg.locator("button:text-is('drift')").click(modifiers=["Shift"])
    pg.wait_for_timeout(800)
    seen = []
    pg.locator("button:text-is('Fling to end')").click()
    t0 = time.time()
    while time.time() - t0 < 1.6:
        seen.append(stats(pg))
        pg.wait_for_timeout(40)
    pairs = []
    snapped = False
    for s in seen:
        m = re.match(r"(\w+)→(\w+) ([\d.]+)", s)
        if m and (not pairs or pairs[-1] != (m[1], m[2])):
            pairs.append((m[1], m[2]))
        if "SNAP" in s:
            snapped = True
    print(f"   fling: snapped={snapped}; state pairs seen during fling: {pairs}")
    pg.wait_for_timeout(800)
    print(f"   fling: settled  {stats(pg)}")
    pg.screenshot(path=f"{out}/m3-after-fling.png")

    # --- 3. scrollbar-drag equivalent: instant jump from top to the mark state ---------------------------
    pg.locator("button:text-is('drift')").click(modifiers=["Shift"])
    pg.wait_for_timeout(800)
    seen = []
    pg.locator("button:text-is('mark')").click(modifiers=["Shift"])
    t0 = time.time()
    while time.time() - t0 < 1.0:
        seen.append(stats(pg))
        pg.wait_for_timeout(40)
    pairs = []
    for s in seen:
        m = re.match(r"(\w+)→(\w+)", s)
        if m and (not pairs or pairs[-1] != (m[1], m[2])):
            pairs.append((m[1], m[2]))
    print(f"   instant jump: state pairs seen: {pairs}")
    ctx.close()

    # --- 4. viewport resize mid-scroll (address-bar collapse analogue) ------------------------------------
    ctx = b.new_context(viewport={"width": 390, "height": 664}, device_scale_factor=3, is_mobile=True, has_touch=True)
    pg, errors = run(ctx, "mobile resize")
    pg.locator("button:text-is('map')").click(modifiers=["Shift"])
    pg.wait_for_timeout(1000)
    before = pg.evaluate("() => { const c=document.querySelector('canvas'); return [c.style.height, c.height, window.innerHeight, window.scrollY] }")
    pg.set_viewport_size({"width": 390, "height": 744})  # toolbar collapses: +80px
    pg.wait_for_timeout(600)
    after = pg.evaluate("() => { const c=document.querySelector('canvas'); return [c.style.height, c.height, window.innerHeight, window.scrollY] }")
    print(f"   canvas [styleH, bufferH, innerH, scrollY] before {before} after {after}")
    pg.screenshot(path=f"{out}/m3-mobile-after-resize.png")
    pg.set_viewport_size({"width": 390, "height": 664})
    pg.wait_for_timeout(600)
    back = pg.evaluate("() => { const c=document.querySelector('canvas'); return [c.style.height, c.height, window.innerHeight] }")
    print(f"   back: {back}")
    print("   stats:", stats(pg))
    print("   errors:", errors or "none")
    ctx.close()

    # --- 5. reduced motion --------------------------------------------------------------------------------
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, device_scale_factor=1, reduced_motion="reduce")
    pg, errors = run(ctx, "reduced motion")
    pg.locator("button:text-is('columns')").click()
    pg.wait_for_timeout(1000)
    print("   after jump:", stats(pg))
    pg.screenshot(path=f"{out}/m3-reduced-columns.png")
    lenis = pg.evaluate("() => !!document.documentElement.classList.contains('lenis')")
    print("   lenis mounted under reduced motion:", lenis)
    print("   errors:", errors or "none")
    ctx.close()
    b.close()
