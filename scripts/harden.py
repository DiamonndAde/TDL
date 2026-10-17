"""Milestone 8 hardening pass, run against a production server. Usage:
   bash scripts/serve-and-run.sh python scripts/harden.py [outdir]
Checks, each printed as ok/FAIL with the evidence:
  1. Redirects: every URL on the current site is served (200) or 308'd to its successor, trailing slashes included.
  2. Sitemap and robots: sitemap lists exactly the indexable routes; /insights and /dev are out; robots points at it.
  3. JSON-LD: every ld+json block parses, carries the expected @type, and contains no raw "<".
  4. axe-core on every route at 1280 and 390 px: no serious or critical violations; moderate/minor listed.
  5. Keyboard: services rows, testimonial cards and the three-step form are operable by keyboard with a visible
     focus ring on every stop.
  6. Reduced motion: final values in the proof bar at t=0, the headline fully visible, no running animations,
     no Lenis; the Roster status line still tracks the section after a scroll.
Exit code 1 on any FAIL."""
import json, re, sys, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3131"
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
AXE = Path(__file__).resolve().parents[1] / "node_modules" / "axe-core" / "axe.min.js"
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else None
fails: list[str] = []


def check(ok: bool, label: str, detail: str = ""):
    print(("  ok   " if ok else "  FAIL ") + label + (f": {detail}" if detail else ""))
    if not ok:
        fails.append(label)


def chain(path: str, limit: int = 5):
    """Follow redirects by hand: ([(status, location), ...], final_status, final_path). A chain that is not all
    308s loses the SEO equivalence the brief asks for, so the hops are checked, not just the destination."""
    hops, cur = [], path
    for _ in range(limit):
        st, loc = status_only(cur)
        if st in (301, 302, 307, 308) and loc:
            hops.append((st, loc.replace(BASE, "")))
            cur = loc.replace(BASE, "")
            continue
        return hops, st, cur
    return hops, None, cur


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *a, **k):
        return None


def status_only(path: str):
    opener = urllib.request.build_opener(NoRedirect)
    try:
        with opener.open(BASE + path) as r:
            return r.status, r.headers.get("location", "")
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("location", "")


SERVICES = ["human-resources-outsourcing", "business-process-outsourcing", "recruitment-background-check",
            "learning-and-development", "payroll-management", "business-advisory", "technology-solutions"]
INDEXABLE = ["/", "/services", "/work", "/about-us", "/careers", "/contact-us", "/become-a-client", "/certifications",
             "/privacy-policy", "/cookies-policy"] + [f"/services/{s}" for s in SERVICES]

# ---------------------------------------------------------------- 1. redirects
print("\n1. Redirect map — every URL on the current site")
preserved = ["/", "/about-us", "/careers", "/contact-us", "/cookies-policy", "/privacy-policy", "/services"] + [f"/services/{s}" for s in SERVICES]
for p in preserved:
    st, loc = status_only(p)
    check(st == 200, f"{p} served", f"{st}")
    if p != "/":
        st, loc = status_only(p + "/")
        check(st == 308 and loc.endswith(p), f"{p}/ (trailing slash, as linked on the current site) → {p}", f"{st} {loc}")
for src, dst in [("/new-client", "/become-a-client"), ("/new-client/", "/become-a-client"), ("/Blog", "/insights"), ("/index.html", "/")]:
    hops, st, final = chain(src)
    check(all(h[0] == 308 for h in hops) and final == dst and st == 200, f"{src} → {dst} by 308s only", f"{' → '.join(f'{s} {l}' for s, l in hops)} then {st}")
for junk in ["/sample-page/", "/2025/04/22/hello-world/", "/category/uncategorized/", "/author/admin_4qzhav2h/"]:
    hops, st, final = chain(junk)
    check(st == 404, f"WordPress leftover {junk} ends in a clean 404", f"{len(hops)} hop(s) then {st}")

# ---------------------------------------------------------------- 2. sitemap, robots
print("\n2. Sitemap and robots")
with urllib.request.urlopen(BASE + "/sitemap.xml") as r:
    xml = r.read().decode()
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
locs = [el.text for el in ET.fromstring(xml).findall(".//s:loc", ns)]
paths = sorted(re.sub(r"^https?://[^/]+", "", u) or "/" for u in locs)
check(paths == sorted(INDEXABLE), "sitemap lists exactly the indexable routes", f"extra={sorted(set(paths)-set(INDEXABLE))} missing={sorted(set(INDEXABLE)-set(paths))}")
check(all(u.startswith("https://") for u in locs), "sitemap URLs are absolute https", locs[0])
with urllib.request.urlopen(BASE + "/robots.txt") as r:
    robots = r.read().decode()
check("Sitemap:" in robots and "sitemap.xml" in robots, "robots.txt points at the sitemap", robots.replace("\n", " | "))
check("Disallow: /dev/" in robots, "robots.txt disallows /dev/", "")
with urllib.request.urlopen(BASE + "/insights") as r:
    ins = r.read().decode()
check('name="robots"' in ins and "noindex" in ins, "/insights is noindex", "")

# ---------------------------------------------------------------- 3..6 in a browser
print("\n3. JSON-LD")
EXPECT_LD = {"/": {"Organization", "LocalBusiness"}, "/services": {"Service"}, "/about-us": set(), "/contact-us": set(), "/become-a-client": set()}
for s in SERVICES:
    EXPECT_LD[f"/services/{s}"] = {"Service"}
ROUTES = INDEXABLE + ["/insights"]

with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    axe_src = AXE.read_text(encoding="utf-8")

    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()
    for route, expect in EXPECT_LD.items():
        html = urllib.request.urlopen(BASE + route).read().decode()
        blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
        types: set[str] = set()
        bad = False
        for blk in blocks:
            if "<" in blk:
                bad = True
            try:
                data = json.loads(blk.replace("\\u003c", "<"))
            except json.JSONDecodeError:
                bad = True
                continue
            items = data.get("@graph", [data]) if isinstance(data, dict) else data
            for it in items:
                t = it.get("@type")
                types |= set(t if isinstance(t, list) else [t])
        check(not bad and expect <= types, f"{route} JSON-LD {sorted(types) or 'none'}", "unparsable or raw '<'" if bad else "")
    n_service = 0
    html = urllib.request.urlopen(BASE + "/services").read().decode()
    n_service = sum(json.dumps(json.loads(b)).count('"@type": "Service"') for b in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S))
    check(n_service == 7, "/services carries seven Service nodes", str(n_service))

    # ------------------------------------------------------------ 4. axe
    print("\n4. axe-core (serious/critical must be zero)")
    for width in (1280, 390):
        ctx = b.new_context(viewport={"width": width, "height": 900 if width > 400 else 800}, device_scale_factor=1 if width > 400 else 2)
        pg = ctx.new_page()
        for route in ROUTES:
            pg.goto(BASE + route)
            pg.wait_for_load_state("load")
            pg.wait_for_timeout(600)
            # The hero reveal fades an aria-hidden clone of the h1 from opacity 0; mid-fade it is legitimately
            # low-contrast, so wait for the clone to be removed rather than scanning a frame of the animation.
            pg.wait_for_function("() => document.querySelectorAll('h1[aria-hidden=\"true\"]').length === 0", timeout=5000)
            pg.add_script_tag(content=axe_src)
            res = pg.evaluate("async () => { const r = await axe.run(document, {resultTypes: ['violations']}); return r.violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, targets: v.nodes.slice(0,3).map(n => n.target.join(' '))})); }")
            severe = [v for v in res if v["impact"] in ("serious", "critical")]
            minor = [v for v in res if v["impact"] not in ("serious", "critical")]
            detail = "; ".join(f"{v['id']}({v['impact']}×{v['n']}) {v['targets'][0][:80]}" for v in res)
            check(not severe, f"{width}px {route}" + (f" — also {len(minor)} lesser" if minor else ""), detail)
        ctx.close()

    # ------------------------------------------------------------ 5. keyboard
    print("\n5. Keyboard")
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    pg = ctx.new_page()

    def focus_ring():
        return pg.evaluate("""() => { const el = document.activeElement; const cs = getComputedStyle(el);
            return {tag: el.tagName, text: (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0,40), id: el.id,
                    ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0, matches: el.matches(':focus-visible')}; }""")

    pg.goto(BASE + "/")
    pg.wait_for_load_state("load"); pg.wait_for_timeout(800)
    pg.keyboard.press("Tab")
    f = focus_ring()
    check(f["text"].startswith("Skip to content") and f["ring"], "first Tab lands on the skip link with a ring", json.dumps(f))
    pg.keyboard.press("Enter"); pg.wait_for_timeout(200)
    # services rows
    first = pg.locator("#services button[aria-expanded]").first
    first.focus()
    f = focus_ring()
    check(f["ring"] and f["matches"], "services row button shows :focus-visible ring", json.dumps(f))
    pg.keyboard.press("Enter"); pg.wait_for_timeout(300)
    check(first.get_attribute("aria-expanded") == "true", "Enter opens the service row", "")
    status_open = pg.locator("header").inner_text()
    pg.keyboard.press("ArrowDown"); pg.wait_for_timeout(100)
    f = focus_ring()
    check(f["text"] != "" and pg.evaluate("() => document.activeElement.getAttribute('aria-expanded') !== null") and f["ring"], "ArrowDown moves to the next service row", json.dumps(f))
    pg.keyboard.press("Space"); pg.wait_for_timeout(300)
    second = pg.locator("#services button[aria-expanded]").nth(1)
    check(second.get_attribute("aria-expanded") == "true" and first.get_attribute("aria-expanded") == "false", "Space opens the second row and closes the first", "")
    pg.keyboard.press("Tab"); pg.wait_for_timeout(100)
    f = focus_ring()
    check(f["tag"] == "A" and f["ring"], "Tab from an open row reaches its link inside the panel", json.dumps(f))
    # testimonial cards (since 2026-10-16; they replaced the tablist): each card's full-quote link is reachable by
    # Tab, in card order, with a visible ring, and goes to that person's section on /work.
    links = pg.locator("#testimonials a[href^='/work#']")
    check(links.count() == 3, "three testimonial cards, each linking to its full quote on /work", str(links.count()))
    links.first.focus(); pg.wait_for_timeout(100)
    hrefs = []
    for i in range(3):
        f = focus_ring()
        href = pg.evaluate("() => document.activeElement.getAttribute('href')")
        name = pg.evaluate("() => document.activeElement.getAttribute('aria-label') || ''")
        hrefs.append(href)
        check(f["ring"] and "Read the full quote" in name, f"testimonial link {i + 1} has a ring and names the person", json.dumps({**f, "href": href, "name": name}))
        if i < 2:
            pg.keyboard.press("Tab"); pg.wait_for_timeout(100)
    check(hrefs == ["/work#carlcare", "/work#chi", "/work#transsnet"], "Tab moves through the cards in order", str(hrefs))
    if OUT:
        pg.screenshot(path=str(OUT / "harden-keyboard-testimonials.png"), clip=None)

    # three-step form
    pg.goto(BASE + "/become-a-client")
    pg.wait_for_load_state("load"); pg.wait_for_timeout(800)
    pg.locator("#services input[type=checkbox]").first.focus()
    f = focus_ring()
    check(f["tag"] == "INPUT" and f["matches"], "form step 1: first service checkbox focusable", json.dumps(f))
    pg.keyboard.press("Space")
    pg.locator("#headcount input[type=radio]").first.focus(); pg.keyboard.press("Space")
    pg.wait_for_timeout(100)
    ok = pg.evaluate("() => document.querySelector('#services input:checked') && document.querySelector('#headcount input:checked')")
    check(bool(ok), "Space ticks a service and a headcount", "")
    # ring on a native control
    pg.locator("#headcount input[type=radio]").first.focus()
    ring = pg.evaluate("() => { const el = document.activeElement; const cs = getComputedStyle(el); return el.matches(':focus-visible') && cs.outlineStyle !== 'none'; }")
    check(bool(ring), "radio shows :focus-visible outline", "")
    pg.get_by_role("button", name=re.compile("^Next|Continue", re.I)).focus()
    pg.keyboard.press("Enter"); pg.wait_for_timeout(500)
    f = focus_ring()
    check(f["tag"] == "H2" and "organisation" in f["text"].lower(), "Enter on Next moves to step 2 and focus lands on its heading", json.dumps(f))
    pg.keyboard.press("Tab")
    f = focus_ring()
    check(f["id"] == "organisation" and f["ring"], "Tab from the heading reaches the first field of step 2", json.dumps(f))
    pg.get_by_role("button", name=re.compile("^Next|Continue", re.I)).focus(); pg.keyboard.press("Enter"); pg.wait_for_timeout(400)
    f = focus_ring()
    err = pg.locator("[role=alert], [aria-invalid=true]").count()
    check(f["id"] == "organisation" and err > 0, "Next with empty fields: focus goes to the first invalid field, error shown", json.dumps(f) + f" alerts={err}")
    pg.get_by_role("button", name="Back").focus(); pg.keyboard.press("Enter"); pg.wait_for_timeout(400)
    f = focus_ring()
    check(f["tag"] == "H2" and "need" in f["text"].lower(), "Back returns to step 1 with focus on its heading", json.dumps(f))
    ctx.close()

    # ------------------------------------------------------------ 6. reduced motion
    print("\n6. Reduced motion")
    ctx = b.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="reduce")
    pg = ctx.new_page()
    pg.goto(BASE + "/", wait_until="domcontentloaded")
    PROOF = "section[aria-label='Scale and standing'] dd"
    proof0 = pg.locator(PROOF).all_inner_texts()
    pg.wait_for_load_state("load"); pg.wait_for_timeout(1500)
    proof1 = pg.locator(PROOF).all_inner_texts()
    check(proof0 == proof1 and not any("0+" == v for v in proof1), "proof figures are final at t=0 and unchanged after 1.5 s", " | ".join(proof1))
    anims = pg.evaluate("() => document.getAnimations().filter(a => a.playState === 'running').length")
    check(anims == 0, "no running web animations at rest", str(anims))
    lenis = pg.evaluate("() => !!document.documentElement.classList.contains('lenis') || !!window.lenis")
    check(not lenis, "Lenis not mounted under reduced motion", "")
    h1 = pg.evaluate("""() => { const h = document.querySelector('h1'); const cs = getComputedStyle(h);
        const hidden = [...h.querySelectorAll('*')].filter(e => { const c = getComputedStyle(e); return c.opacity === '0' || c.visibility === 'hidden'; }).length;
        return {opacity: cs.opacity, visibility: cs.visibility, hiddenChildren: hidden, color: cs.color}; }""")
    check(h1["opacity"] == "1" and h1["visibility"] == "visible" and h1["hiddenChildren"] == 0, "headline fully visible, nothing split-hidden", json.dumps(h1))
    status_hero = pg.locator("header").inner_text()
    pg.evaluate("() => document.querySelector('#services').scrollIntoView()")
    pg.wait_for_timeout(600)
    status_services = pg.locator("header").inner_text()
    check(status_hero != status_services, "status line changes state after a scroll under reduced motion", f"{status_hero.splitlines()[-1][:60]!r} → {status_services.splitlines()[-1][:60]!r}")
    canvas = pg.evaluate("() => { const c = document.querySelector('canvas'); return c ? {hidden: c.getAttribute('aria-hidden'), w: c.width, h: c.height} : null; }")
    check(canvas is not None and canvas["hidden"] == "true", "canvas present and aria-hidden under reduced motion (static branch)", json.dumps(canvas))
    if OUT:
        pg.screenshot(path=str(OUT / "harden-reduced-motion-services.png"))
    ctx.close()

    # Save-Data: the Roster never loads
    ctx = b.new_context(viewport={"width": 390, "height": 800}, extra_http_headers={"Save-Data": "on"})
    pg = ctx.new_page()
    pg.add_init_script("Object.defineProperty(navigator, 'connection', {get: () => ({saveData: true, effectiveType: '4g'})})")
    pg.goto(BASE + "/"); pg.wait_for_load_state("load"); pg.wait_for_timeout(1500)
    n = pg.evaluate("() => document.querySelectorAll('canvas').length")
    check(n == 0, "Save-Data: no canvas mounted", str(n))
    ctx.close()
    b.close()

print("\nFAILURES:", ", ".join(fails) if fails else "none")
sys.exit(1 if fails else 0)
