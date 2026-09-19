"""Regression test: every Roster route must be scrollable top to bottom, at two speeds, with Lenis on and off,
including after a client-side navigation away and back. Exit 1 on any failure.
   python scripts/scroll-proof.py [base]"""
import sys
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
base = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3131"
ROUTES = ["/", "/services", "/services/payroll-management"]
failures = []

def max_scroll(pg):
    return pg.evaluate("document.documentElement.scrollHeight - window.innerHeight")

def wheel_to_bottom(pg, step, pause):
    """Real wheel events (Lenis intercepts them). Stops when scrollY stops moving for 6 ticks."""
    stuck = 0
    last = -1
    for _ in range(400):
        pg.mouse.wheel(0, step)
        pg.wait_for_timeout(pause)
        y = pg.evaluate("window.scrollY")
        if abs(y - last) < 1:
            stuck += 1
            if stuck >= 6:
                break
        else:
            stuck = 0
        last = y
    pg.wait_for_timeout(600)
    return pg.evaluate("window.scrollY")

def check(pg, label):
    footer_visible = pg.evaluate("(() => { const f = document.querySelector('footer'); const r = f.getBoundingClientRect(); return r.top < window.innerHeight; })()")
    y = pg.evaluate("window.scrollY"); mx = max_scroll(pg)
    ok = footer_visible and y >= mx - 4
    print(f"  {'ok  ' if ok else 'FAIL'} {label}: scrollY {y:.0f} of {mx:.0f}, footer visible {footer_visible}")
    if not ok:
        failures.append(label)

def run(b, width, height, dpr, reduced):
    ctx = b.new_context(viewport={"width": width, "height": height}, device_scale_factor=dpr, is_mobile=width < 640,
                        reduced_motion="reduce" if reduced else "no-preference")
    pg = ctx.new_page()
    mode = f"{width}px lenis={'off' if reduced else 'on'}"
    for route in ROUTES:
        for step, pause, speed in ((120, 30, "slow"), (900, 8, "fling")):
            pg.goto(base + route); pg.wait_for_load_state("load"); pg.wait_for_timeout(1200)
            pg.mouse.move(width // 2, height // 2)
            wheel_to_bottom(pg, step, pause)
            check(pg, f"{mode} {route} fresh load, {speed}")
    # Client-side navigation in both directions. The dangerous one is arriving at the LONG page (home) from a
    # SHORT page: anything that cached the document height on the short page traps the scroll on the long one.
    def go(label):
        if width < 640:
            pg.get_by_role("button", name="Menu").click(); pg.wait_for_timeout(200)
        if label == "home":
            pg.locator("header a[aria-label='Total Data Limited, home']").click()
        else:
            # phones: the desktop nav is display:none; the menu panel's link is the visible one
            pg.locator("header a:visible", has_text=label).first.click()
    def nav_and_check(start, click_label, expect_url, tag):
        pg.goto(base + start); pg.wait_for_load_state("load"); pg.wait_for_timeout(1000)
        go(click_label); pg.wait_for_url(expect_url); pg.wait_for_timeout(1200)
        pg.mouse.move(width // 2, height // 2)
        wheel_to_bottom(pg, 120, 30); check(pg, f"{mode} {tag}, slow")
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(400)
        wheel_to_bottom(pg, 900, 8); check(pg, f"{mode} {tag}, fling")
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(300)
        pg.keyboard.press("End"); pg.wait_for_timeout(1500); check(pg, f"{mode} {tag}, End key")
    nav_and_check("/", "Services", "**/services", "/services after arriving from /")
    nav_and_check("/services", "home", base + "/", "/ after arriving from /services (short → long)")
    nav_and_check("/become-a-client", "home", base + "/", "/ after arriving from /become-a-client (short → long)")
    ctx.close()

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME, args=["--headless=new"])
    for reduced in (False, True):
        run(b, 1280, 900, 1, reduced)
        run(b, 390, 844, 2, reduced)
    b.close()
print("\nFAILURES:", failures or "none")
sys.exit(1 if failures else 0)
