"""Throttled mid-range Android pass (AGENTS.md, performance). Applied throttling via CDP, not Lighthouse's
Lantern model: 4x CPU slowdown and slow 4G (150 ms RTT, 1.6 Mbps down), 412x823 at DPR 2 — a Moto G Power
profile. Reports FCP, LCP and its element, CLS and long tasks per route, then drives each interactive control
and reports the event→paint latency that INP is measured from.

Usage: bash scripts/serve-and-run.sh python scripts/android-probe.py [outdir]
"""
import json, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3131"
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
OUT = sys.argv[1] if len(sys.argv) > 1 else None
ROUTES = ["/", "/services", "/services/payroll-management", "/about-us", "/careers", "/become-a-client", "/work"]

INIT = """
window.__m = {lcp: 0, lcpEl: '', cls: 0, long: [], inp: 0, events: []};
new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lcp = Math.round(e.startTime);
  window.__m.lcpEl = (e.element && (e.element.id || e.element.tagName + '.' + String(e.element.className).slice(0, 40))) || ''; } })
  .observe({type: 'largest-contentful-paint', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; })
  .observe({type: 'layout-shift', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) window.__m.long.push(Math.round(e.duration)); })
  .observe({type: 'longtask', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) { const d = Math.round(e.duration);
  window.__m.events.push([e.name, d]); if (d > window.__m.inp) window.__m.inp = d; } })
  .observe({type: 'event', durationThreshold: 16, buffered: true});
"""

fails = []


def check(ok, label, detail=""):
    print(("  ok   " if ok else "  FAIL ") + label + (f": {detail}" if detail else ""))
    if not ok:
        fails.append(label)


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2, is_mobile=True, has_touch=True)
    ctx.add_init_script(INIT)
    pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg)

    def throttle():
        cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150,
                 "downloadThroughput": int(1.6 * 1024 * 1024 / 8), "uploadThroughput": int(750 * 1024 / 8)})
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

    print("Load, 4x CPU + slow 4G, 412x823 DPR 2")
    loads = {}
    for route in ROUTES:
        throttle()
        pg.goto(BASE + route, wait_until="load")
        pg.wait_for_timeout(3500)
        m = pg.evaluate("window.__m")
        fcp = pg.evaluate("() => { const e = performance.getEntriesByName('first-contentful-paint')[0]; return e ? Math.round(e.startTime) : null; }")
        loads[route] = {"fcp": fcp, **m}
        longsum = sum(d - 50 for d in m["long"] if d > 50)
        print(f"  {route:31} FCP {fcp:5} ms  LCP {m['lcp']:5} ms ({m['lcpEl'][:34]})  CLS {m['cls']:.3f}  blocking {longsum} ms over {len(m['long'])} long tasks")
    print()
    for route, m in loads.items():
        check(m["lcp"] < 2500, f"{route} LCP < 2.5 s", f"{m['lcp']} ms")
    for route, m in loads.items():
        check(m["cls"] < 0.1, f"{route} CLS < 0.1", f"{m['cls']:.3f}")

    print("\nInteraction latency (event duration; INP is the worst of these)")

    def interact(route, steps):
        throttle()
        pg.goto(BASE + route, wait_until="load")
        pg.wait_for_timeout(2500)  # settle after hydration, as a real visitor would
        pg.evaluate("window.__m.inp = 0; window.__m.events = []")
        for fn in steps:
            fn()
            pg.wait_for_timeout(500)
        m = pg.evaluate("window.__m")
        worst = sorted(m["events"], key=lambda e: -e[1])[:3]
        check(m["inp"] < 200, f"{route} worst interaction < 200 ms", f"{m['inp']} ms; {worst}")

    interact("/", [
        lambda: pg.locator("#services button[aria-expanded]").nth(0).click(),
        lambda: pg.locator("#services button[aria-expanded]").nth(3).click(),
        # The testimonial tablist these steps used to click became static cards on 2026-10-16 (no JavaScript, nothing
        # to measure); the mobile menu is the other interactive control on the shipping home page.
        lambda: pg.locator("#services button[aria-expanded]").nth(5).click(),
        lambda: pg.get_by_role("button", name="Menu").click(),
        lambda: pg.get_by_role("button", name="Close").click(),
    ])
    interact("/become-a-client", [
        lambda: pg.locator("#services input[type=checkbox]").first.check(),
        lambda: pg.locator("#headcount input[type=radio]").first.check(),
        lambda: pg.get_by_role("button", name="Continue").click(),
        lambda: pg.locator("#organisation").fill("Test Ltd"),
        lambda: pg.get_by_role("button", name="Back").click(),
    ])
    interact("/careers", [
        lambda: pg.locator("#ap-name").fill("Ada"),
        lambda: pg.locator("#ap-area").select_option(index=1),
    ])

    # Scroll-fling: the marks must not tween through every state when the page is dragged end to end.
    print("\nScroll-fling (hero → footer in one gesture)")
    throttle()
    pg.goto(BASE + "/", wait_until="load")
    pg.wait_for_timeout(2500)
    pg.evaluate("window.__m.long = []")
    pg.evaluate("() => window.scrollTo(0, document.body.scrollHeight)")
    pg.wait_for_timeout(2500)
    m = pg.evaluate("window.__m")
    worst = max(m["long"], default=0)
    check(worst < 200, "longest task during a full-page fling < 200 ms", f"{worst} ms over {len(m['long'])} tasks")
    at_bottom = pg.evaluate("() => Math.abs(window.scrollY + innerHeight - document.body.scrollHeight) < 4")
    check(at_bottom, "page reaches the footer", "")
    if OUT:
        pg.screenshot(path=f"{OUT}/android-fling-footer.png")

    if OUT:
        throttle()
        pg.goto(BASE + "/", wait_until="load")
        pg.wait_for_timeout(2500)
        pg.screenshot(path=f"{OUT}/android-home-hero.png")
    b.close()

print("\nFAILURES:", ", ".join(fails) if fails else "none")
sys.exit(1 if fails else 0)
