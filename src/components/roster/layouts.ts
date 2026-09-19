/**
 * Pure layout math for The Roster. Each layout returns N target points in DOCUMENT coordinates (px from the
 * top-left of the page) for a given slot rect, plus a tone per mark (0 = signal, 1 = ink-light). No DOM here.
 *
 * Every layout is sorted in reading order (y, then x) before it is returned, so mark i in one state and
 * mark i in the next are spatial neighbours: transitions read as a population relocating in sheets rather
 * than a tangle of 5,000 crossings.
 */
import mapOutline from "./map-outline.json";
import markMask from "./mark-mask.json";
import type { RosterState } from "./states";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  /** x0,y0,x1,y1,... document px */
  pos: Float32Array;
  /** 0 = signal, 1 = ink-light */
  tone: Uint8Array;
  /** 0..6 service column for the columns layout; 255 otherwise */
  column: Uint8Array;
}

// Deterministic so a layout is identical across recomputes (resize) and marks don't reshuffle.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function finish(points: { x: number; y: number; tone: number; column: number }[]): Layout {
  points.sort((a, b) => a.y - b.y || a.x - b.x);
  const n = points.length;
  const pos = new Float32Array(n * 2);
  const tone = new Uint8Array(n);
  const column = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    pos[i * 2] = points[i].x;
    pos[i * 2 + 1] = points[i].y;
    tone[i] = points[i].tone;
    column[i] = points[i].column;
  }
  return { pos, tone, column };
}

/** Hero: a loose population filling the slot, denser toward the right so copy on the left stays clear. */
export function driftLayout(n: number, r: Rect, seed = 1): Layout {
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const u = Math.sqrt(rnd()); // bias right
    pts.push({ x: r.x + r.w * u, y: r.y + r.h * rnd(), tone: 0, column: 255 });
  }
  return finish(pts);
}

/** Proof: a tabular grid that exactly fills the slot, row-major. Cell size derives from N and the slot area. */
export function gridLayout(n: number, r: Rect): Layout {
  const cell = Math.max(3, Math.sqrt((r.w * r.h) / n));
  const cols = Math.max(1, Math.floor(r.w / cell));
  const rows = Math.ceil(n / cols);
  const cw = r.w / cols;
  const ch = Math.min(cell, r.h / rows);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const row = Math.floor(i / cols);
    pts.push({ x: r.x + (c + 0.5) * cw, y: r.y + (row + 0.5) * ch, tone: 0, column: 255 });
  }
  return finish(pts);
}

type Poly = [number, number][];
const NGA: Poly[] = (mapOutline as unknown as Record<string, Poly[]>).NGA;
const BEN: Poly[] = (mapOutline as unknown as Record<string, Poly[]>).BEN;

/** Both country outlines in projected units (equirectangular, cos(9°N) width correction), origin top-left. */
export function mapGeometry() {
  const polys = [...NGA, ...BEN].filter((p) => p.length > 20); // drop the islet
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of polys) for (const [lng, lat] of p) {
    minX = Math.min(minX, lng); maxX = Math.max(maxX, lng);
    minY = Math.min(minY, lat); maxY = Math.max(maxY, lat);
  }
  const kx = Math.cos((9 * Math.PI) / 180);
  const project = ([lng, lat]: [number, number]) => [(lng - minX) * kx, maxY - lat] as [number, number];
  return {
    width: (maxX - minX) * kx,
    height: maxY - minY,
    nigeria: NGA.filter((p) => p.length > 20).map((p) => p.map(project)),
    benin: BEN.filter((p) => p.length > 20).map((p) => p.map(project)),
    polys,
    bounds: { minX, minY, maxX, maxY },
    kx,
  };
}

/** SVG path data for a list of projected polygons. */
export function polygonsToPath(polys: [number, number][][]) {
  return polys
    .map((p) => p.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(3)},${y.toFixed(3)}`).join(" ") + " Z")
    .join(" ");
}

/**
 * Rasterise the projected polygons once into a cell mask by even-odd scanline fill: O(rows × edges) instead of
 * millions of point-in-polygon tests. Cached at module level; the geometry never changes.
 */
let maskCache: { cols: number; rows: number; cells: Uint8Array; filled: number[] } | null = null;
function mapMask() {
  if (maskCache) return maskCache;
  const g = mapGeometry();
  const cols = 220;
  const rows = Math.max(1, Math.round((cols * g.height) / g.width));
  const cells = new Uint8Array(cols * rows);
  const sx = cols / g.width, sy = rows / g.height;
  for (const poly of [...g.nigeria, ...g.benin]) {
    const pts = poly.map(([x, y]) => [x * sx, y * sy] as [number, number]);
    for (let r = 0; r < rows; r++) {
      const y = r + 0.5;
      const xs: number[] = [];
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const [xi, yi] = pts[i], [xj, yj] = pts[j];
        if (yi > y !== yj > y) xs.push(xi + ((y - yi) * (xj - xi)) / (yj - yi));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const c0 = Math.max(0, Math.ceil(xs[k] - 0.5)), c1 = Math.min(cols - 1, Math.floor(xs[k + 1] - 0.5));
        for (let c = c0; c <= c1; c++) cells[r * cols + c] = 1;
      }
    }
  }
  const filled: number[] = [];
  for (let i = 0; i < cells.length; i++) if (cells[i]) filled.push(i);
  maskCache = { cols, rows, cells, filled };
  return maskCache;
}

/**
 * Coverage: Nigeria and Benin Republic, even density (CLIENT-QUESTIONS.md Q8 — no hotspots until confirmed).
 * The geometry is fitted to the slot exactly as an SVG with `preserveAspectRatio="xMidYMid meet"` would be, so
 * the page's outline graphic and the marks coincide.
 */
export function mapLayout(n: number, r: Rect, seed = 2): Layout {
  const g = mapGeometry();
  const m = mapMask();
  const scale = Math.min(r.w / g.width, r.h / g.height);
  const ox = r.x + (r.w - g.width * scale) / 2, oy = r.y + (r.h - g.height * scale) / 2;
  const cw = (g.width * scale) / m.cols, ch = (g.height * scale) / m.rows;
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const idx = m.filled[Math.floor(rnd() * m.filled.length)];
    const c = idx % m.cols, row = Math.floor(idx / m.cols);
    pts.push({ x: ox + (c + rnd()) * cw, y: oy + (row + rnd()) * ch, tone: 0, column: 255 });
  }
  return finish(pts);
}

/** Services: seven columns, one per service line, in the brief's order. Each column is a narrow grid. */
export function columnsLayout(n: number, r: Rect, columns = 7, gapRatio = 0.35): Layout {
  const per = Math.floor(n / columns);
  const colW = r.w / columns;
  const inner = colW * (1 - gapRatio);
  const cell = Math.max(3, Math.sqrt((inner * r.h) / per));
  const cols = Math.max(1, Math.floor(inner / cell));
  const pts = [];
  for (let c = 0; c < columns; c++) {
    const x0 = r.x + c * colW + (colW - inner) / 2;
    const count = c === columns - 1 ? n - per * (columns - 1) : per;
    const rows = Math.ceil(count / cols);
    const ch = Math.min(cell, r.h / rows);
    for (let i = 0; i < count; i++) {
      pts.push({ x: x0 + ((i % cols) + 0.5) * (inner / cols), y: r.y + (Math.floor(i / cols) + 0.5) * ch, tone: 0, column: c });
    }
  }
  return finish(pts);
}

/** Five stops of the lifecycle path in slot space, horizontal on wide slots and vertical on tall ones. */
export function pathStops(r: Rect): { x: number; y: number }[] {
  const vertical = r.h > r.w;
  const stops = [];
  for (let i = 0; i < 5; i++) {
    const t = 0.06 + (i / 4) * 0.88;
    const wave = (i % 2 === 0 ? -1 : 1) * 0.22;
    stops.push(
      vertical
        ? { x: r.x + r.w * (0.5 + wave), y: r.y + r.h * t }
        : { x: r.x + r.w * t, y: r.y + r.h * (0.5 + wave) },
    );
  }
  return stops;
}

/** Catmull-Rom point on the polyline of stops at t ∈ [0,1]. */
export function pathPoint(stops: { x: number; y: number }[], t: number) {
  const segs = stops.length - 1;
  const s = Math.min(segs - 1e-6, Math.max(0, t * segs));
  const i = Math.floor(s);
  const u = s - i;
  const p0 = stops[Math.max(0, i - 1)], p1 = stops[i], p2 = stops[i + 1], p3 = stops[Math.min(stops.length - 1, i + 2)];
  const u2 = u * u, u3 = u2 * u;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
}

/** SVG `d` for the same path, so the drawn line and the stream agree exactly. */
export function pathD(stops: { x: number; y: number }[], offsetX = 0, offsetY = 0, samples = 64) {
  const parts = [];
  for (let i = 0; i <= samples; i++) {
    const p = pathPoint(stops, i / samples);
    parts.push(`${i === 0 ? "M" : "L"}${(p.x - offsetX).toFixed(1)},${(p.y - offsetY).toFixed(1)}`);
  }
  return parts.join(" ");
}

/** Lifecycle: marks spread along the path as a stream; `phase` (0..1) advances them along it over time. */
export function pathLayout(n: number, r: Rect, seed = 3, phase = 0): Layout {
  const stops = pathStops(r);
  const rnd = mulberry32(seed);
  const width = Math.min(r.w, r.h) * 0.09;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n + phase) % 1;
    const p = pathPoint(stops, t);
    const q = pathPoint(stops, Math.min(1, t + 0.002));
    const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
    const off = (rnd() - 0.5) * 2 * width;
    pts.push({ x: p.x + (-dy / len) * off, y: p.y + (dx / len) * off, tone: 0, column: 255 });
  }
  // Keep path order (not reading order) so the stream advances coherently.
  const pos = new Float32Array(n * 2), tone = new Uint8Array(n), column = new Uint8Array(n).fill(255);
  for (let i = 0; i < n; i++) { pos[i * 2] = pts[i].x; pos[i * 2 + 1] = pts[i].y; }
  return { pos, tone, column };
}

/** Close: the TDL mark from the sampled logo mask. Heads are signal; bodies and arc are ink-light. */
export function markLayout(n: number, r: Rect, seed = 4): Layout {
  const { cols, rows, rows_ } = markMask as { cell: number; cols: number; rows: number; rows_: string[] };
  const cells: { cx: number; cy: number; tone: number }[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const k = rows_[y][x];
    if (k && k !== ".") cells.push({ cx: x, cy: y, tone: k === "h" ? 0 : 1 });
  }
  const scale = Math.min(r.w / cols, r.h / rows) * 0.9;
  const ox = r.x + (r.w - cols * scale) / 2, oy = r.y + (r.h - rows * scale) / 2;
  const rnd = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const c = cells[Math.floor((i / n) * cells.length) % cells.length];
    pts.push({ x: ox + (c.cx + rnd()) * scale, y: oy + (c.cy + rnd()) * scale, tone: c.tone, column: 255 });
  }
  return finish(pts);
}

export function layoutFor(state: RosterState, n: number, r: Rect): Layout {
  switch (state) {
    case "drift": return driftLayout(n, r);
    case "grid": return gridLayout(n, r);
    case "map": return mapLayout(n, r);
    case "columns": return columnsLayout(n, r);
    case "path": return pathLayout(n, r);
    case "mark": return markLayout(n, r);
  }
}
