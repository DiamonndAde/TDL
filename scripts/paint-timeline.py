"""Timeline of resource ends, long tasks and paints for the home route, unthrottled."""
from playwright.sync_api import sync_playwright
CHROME = r"C:/Users/PC/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
INIT = """
window.__ev = [];
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ev.push([Math.round(e.startTime), 'paint:' + e.name]); }).observe({type: 'paint', buffered: true});
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ev.push([Math.round(e.startTime), 'lcp size=' + e.size]); }).observe({type: 'largest-contentful-paint', buffered: true});
new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__ev.push([Math.round(e.startTime), 'longtask ' + Math.round(e.duration) + 'ms']); }).observe({type: 'longtask', buffered: true});
document.addEventListener('DOMContentLoaded', () => window.__ev.push([Math.round(performance.now()), 'DOMContentLoaded']));
window.addEventListener('load', () => window.__ev.push([Math.round(performance.now()), 'load']));
document.fonts.ready.then(() => window.__ev.push([Math.round(performance.now()), 'fonts.ready']));
"""
with sync_playwright() as p:
    b = p.chromium.launch(headless=True, executable_path=CHROME)
    pg = b.new_context(viewport={"width": 412, "height": 823}, device_scale_factor=2.6, is_mobile=True).new_page()
    pg.add_init_script(INIT)
    pg.goto("http://localhost:3131/"); pg.wait_for_timeout(2500)
    ev = pg.evaluate("window.__ev")
    res = pg.evaluate("performance.getEntriesByType('resource').map(r => [Math.round(r.responseEnd), 'res:' + r.initiatorType + ' ' + r.name.split('/').pop().slice(0,34)])")
    for t, name in sorted(ev + res): print(f"  {t:6d} ms  {name}")
    b.close()
