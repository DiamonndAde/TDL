"""
Home slider and brochure QR proof (TDL review, 2026-10-16, items 7 and 8), against a PRESENTATION build on :3131 —
the slider only renders where it has photographs, which before TDL's arrive means placeholders. Run it through
`npm run test:slider`, which builds that configuration and restores the shipping build afterwards.

The slider is the one thing outside the Roster that moves on its own (a logged client exception, AGENTS.md), so
every bound on that exception is asserted: 6 s per slide, Pause visible and effective, hover and focus pause it,
Play works with the pointer on it, nothing auto-advances and no Pause button under reduced motion, CLS, keyboard,
no horizontal page scroll on a phone. Then the QR: present, demo-marked, and /brochure is a 307.

Usage: python scripts/slider-proof.py [screenshot-dir]
"""
import sys, urllib.request
from playwright.sync_api import sync_playwright

OUT = sys.argv[1] if len(sys.argv) > 1 else None
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
BASE = "http://localhost:3131"
fails = []
def check(ok, msg):
    print(("ok    " if ok else "FAIL  ") + msg)
    if not ok: fails.append(msg)

def counter(page):
    return page.locator("#office [role=region] > div:last-child > p").inner_text()

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    # ---- desktop, motion allowed
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.add_init_script("""window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries()) if(!e.hadRecentInput) window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});""")
    page.goto(BASE + "/", wait_until="networkidle")
    region = page.locator("#office [role=region]")
    check(region.count() == 1, "slider rendered in demo build")
    slides = page.locator("#office [aria-roledescription=slide]")
    check(slides.count() == 5, f"five slides ({slides.count()})")
    page.locator("#office").scroll_into_view_if_needed()
    page.mouse.move(5, 5)
    page.wait_for_timeout(800)
    OUT and page.screenshot(path=f"{OUT}/slider-1280.png")
    c0 = counter(page)
    page.wait_for_timeout(6800)
    c1 = counter(page)
    check(c0 == "1 of 5" and c1 == "2 of 5", f"auto-advances after 6 s ({c0} -> {c1})")
    img_ok = page.evaluate("""() => { const im = document.querySelectorAll('#office [aria-roledescription=slide] img')[1]; return im.complete && im.naturalWidth > 0 }""")
    check(img_ok, "second slide's image has loaded when it arrives")
    # hover pauses
    rb = region.bounding_box()
    page.mouse.move(rb["x"] + rb["width"] / 2, rb["y"] + 100)
    page.wait_for_timeout(7000)
    check(counter(page) == c1, f"hover pauses ({counter(page)})")
    page.mouse.move(5, 5)
    page.wait_for_timeout(6700)
    c2 = counter(page)
    check(c2 == "3 of 5", f"resumes after hover leaves ({c2})")
    # focus pauses
    page.locator("#office button", has_text="Next").focus()
    page.wait_for_timeout(7000)
    check(counter(page) == c2, f"focus inside pauses ({counter(page)})")
    page.evaluate("document.activeElement.blur()")
    # pause button
    pause = page.get_by_role("button", name="Pause slideshow")
    check(pause.count() == 1, "visible Pause button")
    pause.click()
    page.mouse.move(5, 5)
    page.evaluate("document.activeElement.blur()")
    c3 = counter(page)
    page.wait_for_timeout(7000)
    check(counter(page) == c3, f"Pause holds ({c3} -> {counter(page)})")
    play = page.get_by_role("button", name="Play slideshow")
    check(play.count() == 1, "button becomes Play")
    play.click()  # pointer and focus now on the button: Play must still start it
    page.wait_for_timeout(6800)
    check(counter(page) != c3, f"Play restarts even with pointer/focus on the button ({c3} -> {counter(page)})")
    # buttons
    page.locator("#office button", has_text="Previous").click()
    page.wait_for_timeout(900)
    print("      after Previous:", counter(page))
    # wrap from last to first
    for _ in range(6):
        page.locator("#office button", has_text="Next").click(); page.wait_for_timeout(700)
    print("      after 6x Next:", counter(page))
    cls = page.evaluate("window.__cls")
    check(cls < 0.1, f"CLS {cls:.4f}")
    # keyboard: arrow keys scroll the viewport
    vp = page.locator("#office [role=region] > div[tabindex='0']")
    vp.focus()
    before = page.evaluate("document.querySelector(\"#office [role=region] > div[tabindex='0']\").scrollLeft")
    page.keyboard.press("ArrowRight"); page.wait_for_timeout(900)
    after = page.evaluate("document.querySelector(\"#office [role=region] > div[tabindex='0']\").scrollLeft")
    check(after != before, f"arrow keys move the slides ({before} -> {after})")
    OUT and page.screenshot(path=f"{OUT}/slider-focus-1280.png")
    # work section has no figure
    check(page.locator("#work figure").count() == 0 and page.locator("#work [data-placeholder]").count() == 0, "Work section photo folded out")
    # QR
    page.goto(BASE + "/contact-us", wait_until="networkidle")
    qr = page.locator("[role=img][aria-label^='QR code for']")
    check(qr.count() == 1, "QR on /contact-us")
    label = qr.get_attribute("aria-label")
    print("      QR label:", label)
    check(page.get_by_text("Do not print it").count() == 1, "demo build marks the QR do-not-print")
    qr.scroll_into_view_if_needed()
    OUT and page.screenshot(path=f"{OUT}/contact-1280.png", full_page=True)
    ctx.close()

    # ---- reduced motion
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    page = ctx.new_page()
    page.goto(BASE + "/", wait_until="networkidle")
    page.locator("#office").scroll_into_view_if_needed()
    page.wait_for_timeout(7500)
    check(counter(page) == "1 of 5", f"no auto-advance under reduced motion ({counter(page)})")
    check(page.get_by_role("button", name="Pause slideshow").count() == 0, "no Pause button under reduced motion")
    page.locator("#office button", has_text="Next").click(); page.wait_for_timeout(300)
    check(counter(page) == "2 of 5", f"Next still works under reduced motion ({counter(page)})")
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
    # swipe = native scroll of the snap container
    page.evaluate("const v=document.querySelector(\"#office [role=region] > div[tabindex='0']\"); v.scrollBy({left: v.clientWidth*0.7})")
    page.wait_for_timeout(1200)
    print("      after a 70% swipe:", counter(page))
    page.goto(BASE + "/contact-us", wait_until="networkidle")
    page.locator("[role=img][aria-label^='QR code for']").scroll_into_view_if_needed()
    OUT and page.screenshot(path=f"{OUT}/contact-390.png")
    ctx.close()
    b.close()

# /brochure redirect
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k): return None
op = urllib.request.build_opener(NoRedirect)
try:
    op.open(BASE + "/brochure")
    check(False, "/brochure redirects")
except urllib.error.HTTPError as e:
    check(e.code == 307 and e.headers.get("Location", "").endswith("/services"), f"/brochure -> {e.code} {e.headers.get('Location')}")

print("FAILURES:", "none" if not fails else fails)
sys.exit(1 if fails else 0)
