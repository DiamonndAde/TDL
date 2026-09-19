"""Drive /become-a-client end to end: validation, keyboard, steps, submission. python scripts/form-proof.py <outdir> [w h dpr]"""
import sys
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
out = sys.argv[1]
w, h, dpr = (int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (1280, 900, 1)
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    pg = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, is_mobile=w < 640).new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.goto("http://localhost:3131/become-a-client?service=payroll-management"); pg.wait_for_load_state("load"); pg.wait_for_timeout(800)
    print("preselected:", pg.evaluate("Array.from(document.querySelectorAll('input[name=services]:checked')).map(i=>i.value)"))
    pg.screenshot(path=f"{out}/m5-{w}-step1.png")
    # 1. validation: continue with nothing else chosen
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(300)
    print("step1 errors:", pg.locator("[role=alert]").all_inner_texts())
    pg.screenshot(path=f"{out}/m5-{w}-step1-error.png")
    # keyboard: focus the headcount radio group and pick with keys
    pg.locator("input[name=headcount]").first.focus(); pg.keyboard.press("Space"); pg.keyboard.press("ArrowDown")
    print("headcount via keyboard:", pg.evaluate("document.querySelector('input[name=headcount]:checked')?.value"))
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(400)
    print("step 2 heading focused:", pg.evaluate("document.activeElement?.id"), "|", pg.locator("#enquiry-title").inner_text())
    # 2. organisation
    pg.fill("#organisation", "Example Foods Nigeria"); pg.fill("#industry", "Food manufacturing"); pg.fill("#location", "Agbara, Ogun")
    pg.select_option("#arrangement", "provider")
    pg.screenshot(path=f"{out}/m5-{w}-step2.png")
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(400)
    # 3. you — bad email first
    pg.fill("#name", "A. Buyer"); pg.fill("#role", "Head of HR"); pg.fill("#email", "not-an-email"); pg.fill("#phone", "0801 234 5678")
    pg.select_option("#contactTime", "morning")
    pg.get_by_role("button", name="Send the enquiry").click(); pg.wait_for_timeout(400)
    print("step3 errors:", pg.locator("[role=alert]").all_inner_texts())
    pg.screenshot(path=f"{out}/m5-{w}-step3-error.png")
    pg.fill("#email", "buyer@example.com"); pg.check("input[name=consent]")
    pg.get_by_role("button", name="Send the enquiry").click(); pg.wait_for_timeout(2500)
    print("after submit:", pg.locator("h2").first.inner_text(), "|", pg.locator("[role=alert]").all_inner_texts())
    pg.screenshot(path=f"{out}/m5-{w}-result.png")
    print("errors:", errs or "none")
    b.close()
