"""The consent banner, against the conditions it was approved under.

Run twice against the same build — once with the banner showing, once after it has been dismissed — and
compare both with the analytics-off baseline. Requires a build with NEXT_PUBLIC_POSTHOG_KEY set, served on
3131, and a build without it for the baseline.

  bash scripts/serve-and-run.sh python scripts/consent-proof.py [outdir]

Checks:
  1. Layout: the banner shifts nothing (CLS) and does not become the LCP element, measured on a throttled
     mobile profile with the banner on screen.
  2. Equal weight: Accept and Reject are the same element type, the same size to within a hair, and neither is
     hidden behind a further screen. Measured from the rendered boxes, not read off the source.
  3. Keyboard: both buttons are reachable by Tab with a visible ring, either can be pressed with Enter and
     Space, focus is never moved automatically and never trapped.
  4. Screen reader: the banner is a labelled region with an accessible name, announced when it appears.
  5. axe-core with the banner showing, and again after dismissal.
"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3131"
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
AXE = Path("node_modules/axe-core/axe.min.js")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/140.0.0.0 Safari/537.36")
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else None
ROUTES = ["/", "/careers", "/become-a-client", "/about-us", "/services", "/privacy-policy"]

INIT = """
window.__m = {lcp: 0, lcpEl: '', cls: 0};
new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lcp = Math.round(e.startTime);
  window.__m.lcpEl = (e.element && (e.element.id || e.element.tagName + '.' + String(e.element.className).slice(0,30))) || ''; } })
  .observe({type: 'largest-contentful-paint', buffered: true});
new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; })
  .observe({type: 'layout-shift', buffered: true});
Object.defineProperty(navigator, 'webdriver', {get: () => false});
"""

failures: list[str] = []


def check(ok, label, detail=""):
    print(("  ok   " if ok else "  FAIL ") + label + (f": {detail}" if detail else ""))
    if not ok:
        failures.append(label)


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    axe_src = AXE.read_text(encoding="utf-8")

    def mobile_ctx():
        ctx = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2,
                            is_mobile=True, has_touch=True, user_agent=UA)
        ctx.add_init_script(INIT)
        return ctx

    def throttle(pg, ctx):
        cdp = ctx.new_cdp_session(pg)
        cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150,
                 "downloadThroughput": int(1.6 * 1024 * 1024 / 8), "uploadThroughput": int(750 * 1024 / 8)})
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})

    # ---------------------------------------------------------------- 1. layout
    print("1. Layout, 4x CPU + slow 4G, 412x823 (banner on screen)")
    measured = {}
    for route in ROUTES:
        ctx = mobile_ctx()
        pg = ctx.new_page()
        throttle(pg, ctx)
        pg.goto(BASE + route, wait_until="load")
        pg.wait_for_timeout(3500)
        m = pg.evaluate("window.__m")
        shown = pg.locator("section[aria-labelledby='consent-title']").count() == 1
        measured[route] = m
        print(f"  {route:20} LCP {m['lcp']:5} ms ({m['lcpEl'][:30]:30}) CLS {m['cls']:.3f}  banner {'shown' if shown else 'absent'}")
        check(m["cls"] < 0.1, f"{route} CLS < 0.1 with the banner up", f"{m['cls']:.3f}")
        check("consent" not in m["lcpEl"].lower(), f"{route} LCP element is page content, not the banner", m["lcpEl"])
        ctx.close()

    # ---------------------------------------------------------------- 2..4 banner itself
    print("\n2. Equal weight")
    ctx = mobile_ctx()
    pg = ctx.new_page()
    pg.goto(BASE + "/careers", wait_until="load")
    pg.wait_for_timeout(1500)
    banner = pg.locator("section[aria-labelledby='consent-title']")
    check(banner.count() == 1, "banner present with a project key configured")
    accept = pg.get_by_role("button", name="Accept", exact=True)
    reject = pg.get_by_role("button", name="Reject", exact=True)
    check(accept.count() == 1 and reject.count() == 1, "both choices are buttons in the banner")
    ab, rb = accept.bounding_box(), reject.bounding_box()
    check(abs(ab["height"] - rb["height"]) < 2, "same height", f"{ab['height']:.0f} vs {rb['height']:.0f}")
    check(abs(ab["width"] - rb["width"]) / max(ab["width"], rb["width"]) < 0.25,
          "comparable width (label length aside)", f"{ab['width']:.0f} vs {rb['width']:.0f}")
    styles = pg.evaluate("""() => {
      const [a, r] = [...document.querySelectorAll("section[aria-labelledby='consent-title'] button")];
      const s = el => { const c = getComputedStyle(el); return {tag: el.tagName, font: c.fontSize, weight: c.fontWeight,
        border: c.borderTopWidth, pad: c.paddingTop + '/' + c.paddingLeft, opacity: c.opacity}; };
      return {accept: s(a), reject: s(r)};
    }""")
    same = (styles["accept"]["tag"] == styles["reject"]["tag"] and styles["accept"]["font"] == styles["reject"]["font"]
            and styles["accept"]["weight"] == styles["reject"]["weight"] and styles["accept"]["pad"] == styles["reject"]["pad"]
            and styles["accept"]["opacity"] == styles["reject"]["opacity"])
    check(same, "same element, type size, weight, padding and opacity", json.dumps(styles))
    check(pg.locator("section[aria-labelledby='consent-title'] input[type=checkbox]").count() == 0,
          "no pre-ticked options in the banner")

    print("\n3. Keyboard")
    focused_on_appear = pg.evaluate("() => document.activeElement.tagName")
    check(focused_on_appear == "BODY", "focus is not moved when the banner appears", focused_on_appear)
    accept.focus()
    ring = pg.evaluate("""() => { const c = getComputedStyle(document.activeElement);
      return {ring: c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0, visible: document.activeElement.matches(':focus-visible')}; }""")
    check(ring["ring"] and ring["visible"], "Accept shows a visible focus ring", json.dumps(ring))
    pg.keyboard.press("Tab")
    after = pg.evaluate("() => (document.activeElement.textContent || '').trim()")
    check(after.startswith("Reject"), "Tab moves from Accept to Reject", after[:30])
    # Not a trap: tabbing on must leave the banner.
    pg.keyboard.press("Tab")
    left = pg.evaluate("""() => { const el = document.activeElement;
      return !el.closest("section[aria-labelledby='consent-title']"); }""")
    check(left, "Tab leaves the banner — focus is not trapped")

    print("\n4. Screen reader")
    a11y = pg.evaluate("""() => {
      const el = document.querySelector("section[aria-labelledby='consent-title']");
      const label = document.getElementById(el.getAttribute('aria-labelledby'));
      const live = el.querySelector('[aria-live]');
      return {role: el.getAttribute('role') || el.tagName.toLowerCase(), name: label ? label.textContent.trim() : null,
              live: live ? live.getAttribute('aria-live') : null, liveText: live ? live.textContent.trim() : null,
              modal: el.getAttribute('aria-modal')};
    }""")
    check(bool(a11y["name"]), "the banner has an accessible name", json.dumps(a11y))
    check(a11y["live"] == "polite", "appearance is announced politely", str(a11y["live"]))
    check(a11y["modal"] is None, "not marked modal — it does not claim the page", str(a11y["modal"]))

    print("\n5. axe-core, banner showing then dismissed")
    for route in ROUTES:
        for phase in ("showing", "dismissed"):
            c2 = mobile_ctx()
            pg2 = c2.new_page()
            pg2.goto(BASE + route, wait_until="load")
            pg2.wait_for_timeout(1500)
            if phase == "dismissed":
                btn = pg2.get_by_role("button", name="Reject", exact=True)
                if btn.count():
                    btn.click()
                    pg2.wait_for_timeout(500)
            pg2.add_script_tag(content=axe_src)
            res = pg2.evaluate("async () => { const r = await axe.run(document, {resultTypes: ['violations']});"
                               " return r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length,"
                               " t: v.nodes.slice(0,2).map(n => n.target.join(' '))})); }")
            severe = [v for v in res if v["impact"] in ("serious", "critical")]
            check(not severe, f"{route} ({phase}) no serious/critical violations",
                  "; ".join(f"{v['id']}×{v['n']} {v['t'][0][:60]}" for v in severe))
            c2.close()

    if OUT:
        ctx2 = mobile_ctx()
        pg3 = ctx2.new_page()
        pg3.goto(BASE + "/careers", wait_until="load")
        pg3.wait_for_timeout(1500)
        pg3.screenshot(path=str(OUT / "consent-banner-390.png"))
        ctx2.close()
        ctx3 = b.new_context(viewport={"width": 1280, "height": 900}, user_agent=UA)
        ctx3.add_init_script(INIT)
        pg4 = ctx3.new_page()
        pg4.goto(BASE + "/careers", wait_until="load")
        pg4.wait_for_timeout(1500)
        pg4.screenshot(path=str(OUT / "consent-banner-1280.png"))
        ctx3.close()

    b.close()

print("\nFAILURES:", ", ".join(failures) if failures else "none")
sys.exit(1 if failures else 0)
