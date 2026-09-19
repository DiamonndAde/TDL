"""List every LCP candidate the browser records under slow-4G + 4x CPU throttling. python scripts/lcp-trace.py"""
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
INIT = """
window.__lcp = [];
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp.push({t: Math.round(e.startTime), size: e.size, el: e.element ? (e.element.tagName + '#' + e.element.id + '.' + String(e.element.className).slice(0,40)) : null, url: e.url}); }).observe({type: 'largest-contentful-paint', buffered: true});
new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__fcp = Math.round(e.startTime); }).observe({type: 'paint', buffered: true});
"""
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    ctx = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2.6, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg)
    cdp.send("Network.enable")
    cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150, "downloadThroughput": 1.6*1024*1024/8, "uploadThroughput": 750*1024/8})
    cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    pg.add_init_script(INIT)
    pg.goto("http://localhost:3131/")
    pg.wait_for_timeout(6000)
    fcp = pg.evaluate("window.__fcp")
    entries = pg.evaluate("window.__lcp")
    print("FCP", fcp, "ms")
    for e in entries: print("  LCP candidate @", e["t"], "ms  size", e["size"], " ", e["el"], e["url"] or "")
    # font readiness for the record
    print("fonts:", pg.evaluate("Array.from(document.fonts).map(f => f.family + ' ' + f.weight + ' ' + f.status).join(' | ')"))
    b.close()
