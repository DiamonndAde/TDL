"""
Home slider and brochure QR proof (TDL review 2026-10-16 items 7–8; slider redesigned 2026-10-17), against a
PRESENTATION build on :3131 — the slider only renders where it has images, which before TDL's photographs arrive
means stand-ins. Run it through `npm run test:slider`, which builds that configuration and restores the shipping
build afterwards.

The slider is the one thing outside the Roster that moves on its own (a logged client exception, AGENTS.md), so
every bound on that exception is asserted: position after the proof bar, 6 s per image, crossfade not slide,
pause control visible and effective (and resuming where it stopped), hover and focus pause it, Play works with the
pointer on it, nothing auto-advances and no pause control under reduced motion, CLS, keyboard, swipe on a phone,
arrows only from `sm`, the one caption line and no per-image badges, and the Roster keep-out marker. Then the QR:
present, demo-marked, and /brochure is a 307 to the PDF when public/brochure.pdf exists, else to /services.

Usage: python scripts/slider-proof.py [screenshot-dir]
"""
import sys, urllib.request
from urllib.parse import unquote
from pathlib import Path
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else None
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
BASE = "http://localhost:3131"
CAPTION = "Generated stand-in images, not TDL\u2019s staff. TDL\u2019s own photographs to come."
fails = []
def check(ok, msg):
    print(("ok    " if ok else "FAIL  ") + msg)
    if not ok: fails.append(msg)

def current(page):
    """1-based index of the image shown, read from the indicator that carries aria-current."""
    return page.evaluate("""() => { const b = [...document.querySelectorAll('#office button[aria-label^="Show photograph"]')];
        return b.findIndex(x => x.getAttribute('aria-current') === 'true') + 1; }""")

def fill(page):
    """How far the active indicator has filled, 0..1."""
    return page.evaluate("""() => { const f = document.querySelector('#office .slider-fill'); if (!f) return null;
        const m = new DOMMatrix(getComputedStyle(f).transform); return Math.round(m.a * 100) / 100; }""")

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    # ---- desktop, motion allowed
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.add_init_script("""window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});""")
    page.goto(BASE + "/", wait_until="networkidle")
    pos = page.evaluate("""() => { const o = document.getElementById('office');
        return { prevIsProof: !!o.previousElementSibling?.querySelector('[data-roster-slot=grid]'), next: o.nextElementSibling?.id }; }""")
    check(pos["prevIsProof"] and pos["next"] == "coverage", f"slider sits between the proof bar and Coverage ({pos})")
    region = page.locator("#office [role=region]")
    check(region.count() == 1, "slider rendered in demo build")
    N = page.locator("#office [aria-roledescription=slide]").count()
    check(N >= 4, f"four or more images ({N})")
    wide = page.evaluate("() => document.querySelectorAll('#office [aria-roledescription=slide]')[0].querySelector('img')?.currentSrc ?? ''")
    check("generated/gen-" in unquote(wide), f"the slider shows the generated stand-ins ({unquote(wide)[-60:]})")
    frame = page.locator("#office [data-roster-avoid]")
    check(frame.count() == 1, "frame is a Roster keep-out zone")
    page.locator("#office").scroll_into_view_if_needed()
    page.mouse.move(5, 5)
    page.wait_for_timeout(800)
    fb = frame.bounding_box()
    check(abs(fb["width"] / fb["height"] - 21 / 9) < 0.02, f"21:9 on desktop ({fb['width']:.0f}x{fb['height']:.0f})")
    text = page.locator("#office").inner_text()
    check(CAPTION in text and "Placeholder" not in text and "Photo:" not in text, "one caption line, no per-image badge or credit")
    check("The people behind the marks" in text and "At work" in text, "label and caption")
    OUT and page.screenshot(path=f"{OUT}/slider-1280.png")
    c0 = current(page)
    page.wait_for_timeout(6800)
    c1 = current(page)
    check(c0 == 1 and c1 == 2, f"auto-advances after 6 s ({c0} -> {c1})")
    fade = page.evaluate("""() => [...document.querySelectorAll('#office [aria-roledescription=slide]')].map(s => [getComputedStyle(s).opacity, getComputedStyle(s).transitionProperty, getComputedStyle(s).transitionDuration])""")
    check(fade[1][0] == "1" and fade[0][0] == "0" and fade[1][1] == "opacity" and fade[1][2] == "0.9s", f"crossfade, not a slide ({fade[:2]})")
    img_ok = page.evaluate("""() => { const im = document.querySelectorAll('#office [aria-roledescription=slide]')[1].querySelector('img'); return !!im && im.complete && im.naturalWidth > 0 }""")
    check(img_ok, "second image loaded by the time it shows")
    lazy = page.evaluate("() => [...document.querySelectorAll('#office [aria-roledescription=slide]')].map(s => !!s.querySelector('img'))")
    check(lazy[-1] is False, f"images load as needed, not all at once ({lazy})")
    # hover pauses and shows the arrows
    page.mouse.move(fb["x"] + fb["width"] / 2, fb["y"] + fb["height"] / 2)
    page.wait_for_timeout(400)
    arrows = page.evaluate("""() => ['Previous photograph','Next photograph'].map(n => getComputedStyle(document.querySelector(`#office button[aria-label="${n}"]`)).opacity)""")
    check(arrows == ["1", "1"], f"arrows appear on hover ({arrows})")
    f_hover = fill(page)
    page.wait_for_timeout(7000)
    check(current(page) == c1 and fill(page) == f_hover, f"hover pauses, the bar holds ({current(page)}, fill {f_hover} -> {fill(page)})")
    page.mouse.move(5, 5)
    page.wait_for_timeout(400)
    arrows = page.evaluate("""() => getComputedStyle(document.querySelector('#office button[aria-label="Next photograph"]')).opacity""")
    check(arrows == "0", f"arrows hide again without hover or focus ({arrows})")
    page.wait_for_timeout(6500)
    c2 = current(page)
    check(c2 == 3, f"resumes after hover leaves, from where it stopped ({c2})")
    # focus pauses
    page.locator('#office button[aria-label="Previous photograph"]').focus()
    page.keyboard.press("Tab")  # a keyboard move, so :focus-visible applies to the Next arrow
    page.wait_for_timeout(300)  # the arrows fade in over 150 ms
    op = page.evaluate("""() => getComputedStyle(document.querySelector('#office button[aria-label="Next photograph"]')).opacity""")
    check(op == "1", f"arrow visible on keyboard focus ({op})")
    page.wait_for_timeout(7000)
    check(current(page) == c2, f"focus inside pauses ({current(page)})")
    page.evaluate("document.activeElement.blur()")
    # pause control
    pause = page.get_by_role("button", name="Pause slideshow")
    check(pause.count() == 1 and pause.is_visible(), "visible pause control")
    pb = pause.bounding_box()
    check(pb["x"] + pb["width"] <= fb["x"] + fb["width"] and pb["y"] + pb["height"] <= fb["y"] + fb["height"] and pb["x"] > fb["x"] + fb["width"] / 2,
          "pause control sits over the image, bottom right")
    pause.click()
    page.mouse.move(5, 5)
    page.evaluate("document.activeElement.blur()")
    c3 = current(page); f3 = fill(page)
    page.wait_for_timeout(7000)
    check(current(page) == c3 and fill(page) == f3, f"Pause holds ({c3} -> {current(page)}, fill {f3} -> {fill(page)})")
    play = page.get_by_role("button", name="Play slideshow")
    check(play.count() == 1, "control becomes Play")
    play.click()  # pointer and focus now on the control: Play must still start it
    page.wait_for_timeout(6800)
    check(current(page) != c3, f"Play restarts even with pointer/focus on the control ({c3} -> {current(page)})")
    # indicators and arrows
    page.locator(f'#office button[aria-label="Show photograph {N} of {N}"]').click()
    check(current(page) == N, f"an indicator jumps to its image ({current(page)})")
    page.locator('#office button[aria-label="Next photograph"]').click()
    check(current(page) == 1, f"Next wraps from the last to the first ({current(page)})")
    page.locator('#office button[aria-label="Previous photograph"]').click()
    check(current(page) == N, f"Previous wraps back ({current(page)})")
    # keyboard: arrow keys anywhere inside the region
    page.locator('#office button[aria-label^="Show photograph 2 of"]').click()
    page.keyboard.press("ArrowRight")
    check(current(page) == 3, f"ArrowRight moves on ({current(page)})")
    page.keyboard.press("ArrowLeft"); page.keyboard.press("ArrowLeft")
    check(current(page) == 1, f"ArrowLeft moves back ({current(page)})")
    OUT and page.screenshot(path=f"{OUT}/slider-focus-1280.png")
    cls = page.evaluate("window.__cls")
    check(cls < 0.1, f"CLS {cls:.4f}")
    check(page.locator("#work figure").count() == 0 and page.locator("#work [data-placeholder]").count() == 0, "Work section has no photograph")
    # QR
    page.goto(BASE + "/contact-us", wait_until="networkidle")
    qr = page.locator("[role=img][aria-label^='QR code for']")
    check(qr.count() == 1, "QR on /contact-us")
    print("      QR label:", qr.get_attribute("aria-label"))
    check(page.get_by_text("Do not print it").count() == 1, "demo build marks the QR do-not-print")
    qr.scroll_into_view_if_needed()
    OUT and page.screenshot(path=f"{OUT}/contact-1280.png", full_page=True)
    ctx.close()

    # ---- reduced motion
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    page.goto(BASE + "/", wait_until="networkidle")
    page.locator("#office").scroll_into_view_if_needed()
    # Count every change of image, not just where it ends: a slider cycling fast can land back on image 1.
    page.evaluate("""() => { window.__moves = 0; new MutationObserver(m => { window.__moves += m.filter(r => r.target.getAttribute('aria-current') === 'true').length; })
        .observe(document.getElementById('office'), {subtree: true, attributes: true, attributeFilter: ['aria-current']}); }""")
    page.wait_for_timeout(7500)
    moves = page.evaluate("() => window.__moves")
    check(current(page) == 1 and moves == 0, f"no auto-advance under reduced motion (image {current(page)}, {moves} changes in 7.5 s)")
    check(page.get_by_role("button", name="Pause slideshow").count() == 0, "no pause control under reduced motion")
    page.locator('#office button[aria-label^="Show photograph 2 of"]').click()
    page.keyboard.press("ArrowRight")
    check(current(page) == 3, f"keyboard still works under reduced motion ({current(page)})")
    dur = page.evaluate("() => getComputedStyle(document.querySelectorAll('#office [aria-roledescription=slide]')[0]).transitionDuration")
    check(dur in ("1e-05s", "0.01ms", "0s") or dur.startswith("1e-05"), f"crossfade is instant under reduced motion ({dur})")
    ctx.close()

    # ---- phone
    ctx = b.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True, device_scale_factor=2)
    page = ctx.new_page()
    page.goto(BASE + "/", wait_until="networkidle")
    page.locator("#office").scroll_into_view_if_needed()
    page.wait_for_timeout(500)
    OUT and page.screenshot(path=f"{OUT}/slider-390.png")
    w = page.evaluate("document.documentElement.scrollWidth")
    check(w <= 390, f"no horizontal page scroll at 390 ({w})")
    fb = page.locator("#office [data-roster-avoid]").bounding_box()
    check(abs(fb["width"] / fb["height"] - 4 / 3) < 0.02, f"4:3 on a phone ({fb['width']:.0f}x{fb['height']:.0f})")
    check(not page.locator('#office button[aria-label="Next photograph"]').is_visible(), "no arrows on a phone: swipe and indicators")
    before = current(page)
    page.evaluate("""() => { const f = document.querySelector('#office [data-roster-avoid]'); const r = f.getBoundingClientRect(); const y = r.top + r.height / 2;
        const ev = (t, x) => f.dispatchEvent(new PointerEvent(t, {bubbles: true, pointerType: 'touch', clientX: x, clientY: y, pointerId: 7, isPrimary: true}));
        ev('pointerdown', r.right - 40); ev('pointerup', r.left + 60); }""")
    check(current(page) == before % N + 1, f"swipe left shows the next image ({before} -> {current(page)})")
    # Art direction: a slide with its own phone source must load that source below `sm`, not the wide one.
    page.locator('#office button[aria-label^="Show photograph 2 of"]').click()
    page.wait_for_timeout(1500)
    src = page.evaluate("() => document.querySelectorAll('#office [aria-roledescription=slide]')[1].querySelector('img')?.currentSrc ?? ''")
    check("phone" in src, f"the phone gets the slide's own phone crop ({src[-70:]})")
    page.goto(BASE + "/contact-us", wait_until="networkidle")
    page.locator("[role=img][aria-label^='QR code for']").scroll_into_view_if_needed()
    OUT and page.screenshot(path=f"{OUT}/contact-390.png")
    ctx.close()
    b.close()

# /brochure redirect: to the PDF once it is in public/, to /services until then.
expect = "/brochure.pdf" if (Path(__file__).resolve().parents[1] / "public" / "brochure.pdf").exists() else "/services"
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
op = urllib.request.build_opener(NoRedirect)
try:
    op.open(BASE + "/brochure")
    check(False, "/brochure redirects")
except urllib.error.HTTPError as e:
    check(e.code == 307 and e.headers.get("Location", "").endswith(expect), f"/brochure -> {e.code} {e.headers.get('Location')} (expected {expect})")

print("FAILURES:", "none" if not fails else fails)
sys.exit(1 if fails else 0)
