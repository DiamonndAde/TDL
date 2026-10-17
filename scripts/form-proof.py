"""
Enquiry form proof: /become-a-client end to end, asserting the real submission path (rewritten 2026-10-17 — the
previous version printed what it saw and failed only on a crash, so it proved nothing about delivery).

Runs a local webhook stand-in on :3133 and expects the server on :3131 to have been started with
FORM_WEBHOOK_URL=http://127.0.0.1:3133/hook (scripts/form-proof.sh does both). Asserts:
  - validation, keyboard operation and step focus;
  - a valid submission reaches the webhook ONCE as JSON with the fields the visitor entered, and the visitor sees
    the success screen;
  - when the webhook fails (500), the visitor sees the delivery error, the form stays, and nothing claims success;
  - the honeypot: a filled hidden field is acknowledged and delivers nothing;
  - no page errors.
Alerts are read inside <main>: Next's route announcer is an empty role=alert in a shadow root, which Playwright's
locators reach.

Usage: python scripts/form-proof.py <screenshot-dir> [w h dpr]
"""
import json, sys, threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from playwright.sync_api import sync_playwright

CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
out = sys.argv[1]
w, h, dpr = (int(sys.argv[2]), int(sys.argv[3]), float(sys.argv[4])) if len(sys.argv) > 4 else (1280, 900, 1)
fails = []
def check(ok, msg):
    print(("ok    " if ok else "FAIL  ") + msg)
    if not ok: fails.append(msg)

# ---- webhook stand-in
received = []
mode = {"status": 204}
class Hook(BaseHTTPRequestHandler):
    def do_POST(self):
        body = self.rfile.read(int(self.headers.get("content-length", 0)))
        received.append({"path": self.path, "type": self.headers.get("content-type", ""), "body": body})
        self.send_response(mode["status"]); self.end_headers()
    def log_message(self, *a): pass
hook = ThreadingHTTPServer(("127.0.0.1", 3133), Hook)
threading.Thread(target=hook.serve_forever, daemon=True).start()

SUCCESS = "Received. Here is what happens next."

def fill_to_step3(pg, errs_label=""):
    pg.goto("http://localhost:3131/become-a-client?service=payroll-management"); pg.wait_for_load_state("load"); pg.wait_for_timeout(800)
    pg.locator("input[name=headcount]").first.focus(); pg.keyboard.press("Space"); pg.keyboard.press("ArrowDown")
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(400)
    pg.fill("#organisation", "Example Foods Nigeria"); pg.fill("#industry", "Food manufacturing"); pg.fill("#location", "Agbara, Ogun")
    pg.select_option("#arrangement", "provider")
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(400)
    pg.fill("#name", "A. Buyer"); pg.fill("#role", "Head of HR"); pg.fill("#email", "buyer@example.com"); pg.fill("#phone", "0801 234 5678")
    pg.select_option("#contactTime", "morning"); pg.check("input[name=consent]")

def submit(pg):
    pg.get_by_role("button", name="Send the enquiry").click()
    pg.wait_for_function(f"""() => document.body.innerText.includes({json.dumps(SUCCESS)}) || [...document.querySelectorAll('main [role=alert]')].some(e => e.textContent.trim())""", timeout=10000)
    pg.wait_for_timeout(300)

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, is_mobile=w < 640)
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))

    # ---- 1. validation, keyboard, steps
    pg.goto("http://localhost:3131/become-a-client?service=payroll-management"); pg.wait_for_load_state("load"); pg.wait_for_timeout(800)
    pre = pg.evaluate("Array.from(document.querySelectorAll('input[name=services]:checked')).map(i=>i.value)")
    check(pre == ["payroll-management"], f"?service= preselects the service ({pre})")
    pg.screenshot(path=f"{out}/m5-{w}-step1.png")
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(300)
    alerts = pg.locator("main [role=alert]").all_inner_texts()
    check(len(alerts) > 0, f"step 1 refuses to continue without a headcount ({alerts})")
    pg.locator("input[name=headcount]").first.focus(); pg.keyboard.press("Space"); pg.keyboard.press("ArrowDown")
    hc = pg.evaluate("document.querySelector('input[name=headcount]:checked')?.value")
    check(bool(hc), f"headcount chosen by keyboard ({hc})")
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(400)
    check(pg.evaluate("document.activeElement?.id") == "enquiry-title", "step 2 moves focus to the step heading")
    pg.fill("#organisation", "Example Foods Nigeria"); pg.fill("#industry", "Food manufacturing"); pg.fill("#location", "Agbara, Ogun")
    pg.select_option("#arrangement", "provider")
    pg.get_by_role("button", name="Continue").click(); pg.wait_for_timeout(400)
    pg.fill("#name", "A. Buyer"); pg.fill("#role", "Head of HR"); pg.fill("#email", "not-an-email"); pg.fill("#phone", "0801 234 5678")
    pg.select_option("#contactTime", "morning")
    pg.get_by_role("button", name="Send the enquiry").click(); pg.wait_for_timeout(400)
    alerts = pg.locator("main [role=alert]").all_inner_texts()
    check(any("mail" in a.lower() for a in alerts) and not received, f"a bad email is refused before anything is sent ({alerts})")
    pg.screenshot(path=f"{out}/m5-{w}-step3-error.png")

    # ---- 2. a valid submission reaches the webhook, once, with what was entered
    pg.fill("#email", "buyer@example.com"); pg.check("input[name=consent]")
    submit(pg)
    check(len(received) == 1, f"the webhook received exactly one POST ({len(received)})")
    if received:
        r = received[0]
        try:
            j = json.loads(r["body"])
        except Exception:
            j = {}
        check(r["path"] == "/hook" and r["type"].startswith("application/json"), f"POSTed JSON to FORM_WEBHOOK_URL ({r['path']}, {r['type']})")
        check(j.get("services") == ["Payroll management"], f"services as names ({j.get('services')})")
        check(j.get("headcount") == hc, f"headcount carried ({j.get('headcount')} vs {hc})")
        check(j.get("organisation") == "Example Foods Nigeria" and j.get("location") == "Agbara, Ogun" and j.get("arrangement") == "provider", "organisation, location and arrangement carried")
        c = j.get("contact", {})
        check(c.get("name") == "A. Buyer" and c.get("email") == "buyer@example.com" and c.get("phone") == "0801 234 5678" and c.get("preferredTime") == "morning", f"contact details carried ({c})")
        check("website" not in json.dumps(j), "the honeypot field is never delivered")
    check(pg.get_by_text(SUCCESS).count() == 1 and pg.locator("main [role=alert]").count() == 0, "the visitor sees the success screen")
    pg.screenshot(path=f"{out}/m5-{w}-result.png")

    # ---- 3. the webhook fails: the visitor is told, nothing claims success
    mode["status"] = 500
    n0 = len(received)
    fill_to_step3(pg)
    submit(pg)
    alerts = pg.locator("main [role=alert]").all_inner_texts()
    check(len(received) == n0 + 1, "the failing webhook was actually called")
    check(any("could not send" in a for a in alerts) and pg.get_by_text(SUCCESS).count() == 0, f"a failed delivery shows the error and no success ({alerts})")
    check(pg.get_by_role("button", name="Send the enquiry").count() == 1, "the form stays, so the visitor can retry")
    pg.screenshot(path=f"{out}/m5-{w}-delivery-error.png")

    # ---- 4. honeypot: a bot that fills the hidden field is acknowledged and nothing is delivered
    mode["status"] = 204
    n0 = len(received)
    fill_to_step3(pg)
    pg.evaluate("""() => { const i = document.getElementById('website'); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        set.call(i, 'http://spam.example'); i.dispatchEvent(new Event('input', {bubbles: true})); }""")
    submit(pg)
    check(len(received) == n0 and pg.get_by_text(SUCCESS).count() == 1, f"a filled honeypot delivers nothing ({len(received) - n0} sent)")

    check(not errs, f"no page errors ({errs})")
    b.close()
hook.shutdown()
print("FAILURES:", ", ".join(fails) if fails else "none")
sys.exit(1 if fails else 0)
