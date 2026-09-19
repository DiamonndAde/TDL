"""FCP under different blocking sets, unthrottled, 3 samples each."""
import re, statistics
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
INIT = "window.__p={};new PerformanceObserver((l)=>{for(const e of l.getEntries())window.__p[e.name]=Math.round(e.startTime)}).observe({type:'paint',buffered:true});"
LAZY = re.compile(r"(3nrw97bwi-rf0|2vjl-m4a6x7xt|1ba2v6avy8cbd|1swofonjvi13u|36zolb5iag_dx|1s54hkkk2yrqh|38yjnjvc90ox9)")
def sample(b, label, should_block):
    out = []
    for _ in range(3):
        pg = b.new_context(viewport={"width": 412, "height": 823}, is_mobile=True).new_page()
        pg.route("**/*", lambda r: r.abort() if should_block(r.request.url) else r.continue_())
        pg.add_init_script(INIT); pg.goto("http://localhost:3131/"); pg.wait_for_timeout(1500)
        out.append(pg.evaluate("window.__p['first-contentful-paint']") or -1); pg.context.close()
    print(f"  {label:34s} FCP median {statistics.median(out):5.0f} ms  samples {out}")
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME, args=["--headless=new"])
    sample(b, "nothing blocked", lambda u: False)
    sample(b, "lazy chunks blocked", lambda u: bool(LAZY.search(u)))
    sample(b, "all chunks blocked", lambda u: "/_next/static/chunks/" in u and u.endswith(".js"))
    sample(b, "fonts blocked", lambda u: u.endswith(".woff2"))
    sample(b, "logo image blocked", lambda u: "/_next/image" in u)
    sample(b, "RSC prefetches blocked", lambda u: "_rsc=" in u)
    b.close()
