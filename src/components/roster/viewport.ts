/**
 * Everything the Roster knows about the browser viewport lives here, behind one interface, so that a real-device
 * fix for iOS Safari (address-bar collapse, rubber-band overscroll, fixed-position repaint) is a change to this
 * file only. The frame loop and the layouts never read `innerHeight`, `visualViewport` or the canvas size directly.
 *
 * Current strategy: size the canvas from `innerWidth`/`innerHeight` (the layout viewport, which is what
 * `position: fixed` tracks), back the buffer at `min(devicePixelRatio, 2)`, and re-measure on `resize`
 * (rAF-throttled — iOS fires it continuously during the toolbar transition). Scroll position is read from
 * `window.scrollY`. If a device shows the fixed layer lagging the toolbar, the candidates are: reading
 * `visualViewport.height` instead of `innerHeight`, or sizing to the *large* viewport (`100lvh`) and letting
 * the bottom strip sit under the toolbar.
 */
export interface ViewportSize {
  width: number;
  height: number;
  dpr: number;
}

export interface ViewportHandle {
  /** Current CSS-pixel size and the DPR the buffer is backed at. */
  size: () => ViewportSize;
  scrollY: () => number;
  /** Apply the current size to the canvas and its context. Call after `resize` and on mount. */
  apply: () => ViewportSize;
  detach: () => void;
}

export function attachViewport(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  onResize: () => void,
): ViewportHandle {
  let current: ViewportSize = read();

  function read(): ViewportSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
    };
  }

  function apply(): ViewportSize {
    current = read();
    canvas.style.width = `${current.width}px`;
    canvas.style.height = `${current.height}px`;
    canvas.width = Math.round(current.width * current.dpr);
    canvas.height = Math.round(current.height * current.dpr);
    ctx.setTransform(current.dpr, 0, 0, current.dpr, 0, 0);
    return current;
  }

  let raf = 0;
  function scheduled() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      onResize();
    });
  }
  window.addEventListener("resize", scheduled);
  window.addEventListener("orientationchange", scheduled);

  return {
    size: () => current,
    scrollY: () => window.scrollY,
    apply,
    detach: () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", scheduled);
      window.removeEventListener("orientationchange", scheduled);
    },
  };
}
