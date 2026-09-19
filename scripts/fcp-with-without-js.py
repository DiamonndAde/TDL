"""Does script execution delay first paint? FCP/LCP with all /_next/static chunks allowed vs blocked, unthrottled and throttled."""
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
INIT = """
window.__paint = {};
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__paint[e.name] = Math.round(e.startTime); }).observe({type: 'paint', buffered: true});
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__paint.lcp = Math.round(e.startTime); }).observe({type: 'largest-contentful-paint', buffered: true});
window.__long = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({type: 'longtask', buffered: true});
"""
def run(b, block_js, throttle):
    ctx = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2.6, is_mobile=True)
    pg = ctx.new_page()
    if throttle:
        cdp = ctx.new_cdp_session(pg); cdp.send("Network.enable")
        cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": 150, "downloadThroughput": 1.6*1024*1024/8, "uploadThroughput": 750*1024/8})
        cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    if block_js:
        pg.route("**/_next/static/chunks/*.js", lambda r: r.abort())
    pg.add_init_script(INIT)
    pg.goto("http://localhost:3131/"); pg.wait_for_timeout(5000 if throttle else 2500)
    paint = pg.evaluate("window.__paint"); long = pg.evaluate("window.__long")
    print(f"  js={'blocked' if block_js else 'allowed':7s} throttle={throttle!s:5s}  FCP {paint.get('first-contentful-paint')} ms  LCP {paint.get('lcp')} ms  long tasks before FCP: {[t for t in long if t[0] < (paint.get('first-contentful-paint') or 0)]}")
    ctx.close()
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    for throttle in (False, True):
        for block in (False, True):
            run(b, block, throttle)
    b.close()
