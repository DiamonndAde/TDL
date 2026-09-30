"""Canary masking proof: fill both forms with unique tokens, then inspect every byte the page tries to send.

This does not read a vendor dashboard. `scripts/posthog-stub.py` stands in for PostHog — it answers the SDK's
remote-config endpoints, serves the *real* session recorder out of node_modules so genuine rrweb output is
produced, and writes every POST body to a file. This script then decodes those bodies (PostHog sends
form-encoded, base64 and gzip payloads depending on size) and searches them for the canaries.

A token found anywhere means something a visitor typed left the machine, and analytics does not ship.

Two things this had to get right, both of which produced a silently-passing test first:
  - The recorder must actually run, or the replay stream — the payload that matters most — is never inspected.
  - PostHog drops traffic it thinks is automated: a bot-like user agent, or `navigator.webdriver === true`,
    which every automation driver sets. The browser is therefore given an ordinary desktop Chrome user agent
    and `navigator.webdriver` is masked, or the SDK captures nothing and the scan reads an empty file. (In
    production this is a feature: bot traffic will not pollute TDL's funnels.)

Both are asserted, so the test cannot pass by inspecting nothing.

Usage: python scripts/masking-proof.py <capture-file>    (the stub and the site must already be running)
"""
import base64, gzip, re, sys, urllib.parse, zlib
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3131"
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/140.0.0.0 Safari/537.36")
CAPTURE = Path(sys.argv[1] if len(sys.argv) > 1 else "posthog-capture.bin")

# Distinctive, unlikely to occur naturally, each tied to the field it was typed into.
CANARIES = {
    "name": "Zqxcanary Nametoken7",
    "email": "canary9email@zqxtoken.test",
    "phone": "08001234567",
    "location": "Canaryville Zqx",
    "message": "CANARYFREETEXT hidden sentence about my salary expectations zqx.",
    "organisation": "Zqx Canary Holdings",
    "industry": "Canary industry zqx",
}
TOKENS = ["Zqxcanary", "Nametoken7", "canary9email", "zqxtoken", "08001234567", "Canaryville",
          "CANARYFREETEXT", "salary expectations", "Zqx Canary", "Canary industry"]

failures: list[str] = []


def check(ok, label, detail=""):
    print(("  ok   " if ok else "  FAIL ") + label + (f": {detail}" if detail else ""))
    if not ok:
        failures.append(label)


def requests_from(blob: bytes):
    """Split the stub's capture file back into (url, body) pairs."""
    for chunk in re.split(rb"===URL ", blob)[1:]:
        head, _, rest = chunk.partition(b"\n")
        url = head.decode("utf-8", "ignore")
        m = re.match(rb"===LEN (\d+)\n", rest)
        if not m:
            continue
        length = int(m.group(1))
        body = rest[m.end():m.end() + length]
        yield url, body


def decodings(raw: bytes):
    """Every plausible reading of a payload, so a token cannot hide behind an encoding."""
    yield raw
    for fn in (gzip.decompress, zlib.decompress):
        try:
            yield fn(raw)
        except Exception:
            pass
    try:
        text = raw.decode("utf-8", "ignore")
    except Exception:
        return
    try:
        for _, values in urllib.parse.parse_qs(text).items():
            for v in values:
                yield v.encode("utf-8")
                try:
                    blob = base64.b64decode(v + "==", validate=False)
                    yield blob
                    try:
                        yield gzip.decompress(blob)
                    except Exception:
                        pass
                except Exception:
                    pass
    except Exception:
        pass
    try:
        blob = base64.b64decode(text + "==", validate=False)
        yield blob
        try:
            yield gzip.decompress(blob)
        except Exception:
            pass
    except Exception:
        pass


with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, user_agent=UA)
    # See the note above: without this the SDK classifies the run as automated and sends nothing.
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => false})")
    pg = ctx.new_page()

    print("Talent pool (/careers)")
    pg.goto(f"{BASE}/careers")
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(1200)
    check(pg.locator("section[aria-labelledby='consent-title']").count() == 1,
          "consent banner shows when a project key is configured")
    pg.get_by_role("button", name="Accept", exact=True).click()
    pg.wait_for_timeout(3000)

    for sel, value in [("#ap-name", CANARIES["name"]), ("#ap-email", CANARIES["email"]),
                       ("#ap-phone", CANARIES["phone"]), ("#ap-location", CANARIES["location"]),
                       ("#ap-message", CANARIES["message"])]:
        pg.fill(sel, value)
        pg.wait_for_timeout(150)
    pg.select_option("#ap-area", index=1)
    pg.locator("input[type=checkbox]").last.check()
    pg.wait_for_timeout(6000)

    print("\nEnquiry (/become-a-client)")
    pg.goto(f"{BASE}/become-a-client")
    pg.wait_for_load_state("load")
    pg.wait_for_timeout(1500)
    pg.locator("#services input[type=checkbox]").first.check()
    pg.locator("#headcount input[type=radio]").first.check()
    pg.get_by_role("button", name=re.compile("^Continue", re.I)).click()
    pg.wait_for_timeout(600)
    pg.fill("#organisation", CANARIES["organisation"])
    pg.wait_for_timeout(150)
    pg.fill("#industry", CANARIES["industry"])
    pg.wait_for_timeout(150)
    pg.fill("#location", CANARIES["location"])
    pg.wait_for_timeout(6000)
    # A real navigation, which fires a real pagehide and flushes both buffers.
    pg.goto(f"{BASE}/work")
    pg.wait_for_timeout(3000)

    # Control: the canary really was in the page, so a clean scan is not a scan of nothing.
    pg.goto(f"{BASE}/careers")
    pg.wait_for_timeout(800)
    pg.fill("#ap-name", CANARIES["name"])
    typed = pg.input_value("#ap-name")
    ctx.close()
    b.close()

blob = CAPTURE.read_bytes() if CAPTURE.exists() else b""
pairs = list(requests_from(blob))
events = [u for u, _ in pairs if "/e/" in u or "/i/v0/e" in u]
replay = [u for u, _ in pairs if u.split("?")[0].endswith("/s/")]

print(f"\nPayloads captured: {len(pairs)} ({len(blob)} bytes)")
check(len(pairs) > 0, "the SDK sent something (otherwise this proves nothing)", str(len(pairs)))
check(bool(events), "the event stream was produced and inspected", f"{len(events)} event payloads")
check(bool(replay), "the session replay stream was produced and inspected", f"{len(replay)} replay payloads")
check(CANARIES["name"] in typed, "control: the canary was genuinely typed into the form", typed[:40])

hits = []
for url, body in pairs:
    for form in decodings(body):
        text = form.decode("utf-8", "ignore")
        for token in TOKENS:
            i = text.lower().find(token.lower())
            if i != -1:
                hits.append((token, url.split("?")[0], text[max(0, i - 50): i + 80]))
check(not hits, "no canary token appears in any payload, under any decoding",
      " | ".join(f"{t} in {u} → …{c}…" for t, u, c in hits[:3]) if hits else "")

print("\nFAILURES:", ", ".join(failures) if failures else "none")
sys.exit(1 if failures else 0)
