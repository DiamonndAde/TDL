"use client";

import { useEffect, useRef } from "react";
import { useMotionPreference } from "@/lib/motion-preference";
import { getLenis, onLenis } from "@/lib/lenis";
import { emitRoster } from "./events";
import { layoutFor, type Layout, type Rect } from "./layouts";
import { useRoster } from "./roster-context";
import { rosterStates, type RosterState } from "./states";

/**
 * The Roster. One fixed canvas behind the page, one array of marks (one per managed employee) that
 * reconfigures on scroll between the slots the page lays out, and never re-enters.
 *
 * Positions are a pure function of scroll: for the transition between slot k and k+1, progress runs from
 * 0 to 1 as slot k+1 travels from 90% to 35% of the viewport height. Each mark starts its move at its own
 * stagger offset so a reconfiguration reads as a population relocating, not a morph. A short follow lerp
 * smooths wheel steps. Nothing is tweened through intermediate states: a scroll fling above the velocity
 * threshold reads Lenis's *target* scroll instead of the animated one, so the marks head straight for the
 * destination state while the page catches up (AGENTS.md, scroll-fling).
 *
 * Reduced motion: progress is quantised to 0/1, follow is instant, there is no drift and no loop —
 * the canvas redraws only on scroll and resize. Save-Data: this component is never loaded at all.
 */

const STAGGER = 0.45; // fraction of the transition over which marks start moving
const FOLLOW = 0.32; // per-frame follow toward the target position
const FLING_VH_PER_S = 2.5; // above this scroll speed (viewport heights / s) snap to the destination state
const FRAME_BUDGET_MS = 12;
const BUDGET_STRIKES = 30;
const FLOOR = 800;

const TONE_ALPHA = { ink: 0.92, paper: 0.55 };

function chooseCount() {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;
  const dpr = window.devicePixelRatio || 1;
  let n = w < 640 ? 1100 : w < 1024 ? 2600 : 5000;
  if (cores <= 4) n *= 0.7;
  if (dpr > 2) n *= 0.85;
  return Math.max(FLOOR, Math.round(n));
}

/**
 * Marks are drawn as batched path fills, grouped by colour and quantised alpha: one beginPath/arc.../fill per
 * group instead of one drawImage per mark. Measured 2026-09-18 at 5,000 marks, 1280×900 @2×: drawImage
 * 17–28 ms per frame, batched arcs ~2 ms. ALPHA_STEPS × 3 colours is the maximum number of fills per frame.
 */
const ALPHA_STEPS = 8;
const TAU = Math.PI * 2;

interface Slot {
  state: RosterState;
  el: HTMLElement;
  tone: "ink" | "paper";
  rect: Rect;
}

const smooth = (t: number) => t * t * (3 - 2 * t);

export function Roster() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, saveData } = useMotionPreference();
  const { setActive, setState, activeColumn } = useRoster();
  const activeColumnRef = useRef<number | null>(null);

  useEffect(() => {
    if (saveData) return; // the text twins carry the meaning; no canvas on metered connections
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    setActive(true);

    const css = getComputedStyle(document.documentElement);
    const colors = {
      signal: css.getPropertyValue("--signal").trim() || "#54c4d0",
      inkLight: css.getPropertyValue("--ink-light").trim() || "#8d97b0",
      signalDeep: css.getPropertyValue("--signal-deep").trim() || "#1c7580",
    };

    let n = chooseCount();
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let radius = window.innerWidth < 640 ? 1.35 : 1.6;
    const palette = [colors.signal, colors.inkLight, colors.signalDeep];
    // bucket index = colour * ALPHA_STEPS + alphaStep; each bucket holds mark indices for this frame
    const buckets: number[][] = Array.from({ length: palette.length * ALPHA_STEPS }, () => []);

    // --- slots and layouts -------------------------------------------------------------------------
    const slotEls = Array.from(document.querySelectorAll<HTMLElement>("[data-roster-slot]"));
    const slots: Slot[] = rosterStates
      .map((state) => {
        const el = slotEls.find((e) => e.dataset.rosterSlot === state);
        if (!el) return null;
        return { state, el, tone: (el.dataset.rosterTone as "ink" | "paper") || "ink", rect: { x: 0, y: 0, w: 0, h: 0 } };
      })
      .filter((s): s is Slot => s !== null);
    if (slots.length === 0) return;

    let layouts: Layout[] = [];
    let cur = new Float32Array(n * 2);
    let stagger = new Float32Array(n);
    let initialised = false;

    function measure() {
      const sy = window.scrollY;
      for (const s of slots) {
        const r = s.el.getBoundingClientRect();
        s.rect = { x: r.left, y: r.top + sy, w: r.width, h: r.height };
      }
      layouts = slots.map((s) => layoutFor(s.state, n, s.rect));
      if (!initialised) {
        cur = new Float32Array(layouts[0].pos);
        stagger = new Float32Array(n);
        for (let i = 0; i < n; i++) stagger[i] = ((i * 7919) % 1000) / 1000; // deterministic spread
        initialised = true;
      }
    }

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth, h = window.innerHeight;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      radius = w < 640 ? 1.35 : 1.6;
    }

    // --- scroll → state ---------------------------------------------------------------------------
    function stateAt(scroll: number) {
      const vh = window.innerHeight;
      let a = 0, p = 0;
      for (let k = 1; k < slots.length; k++) {
        const top = slots[k].rect.y;
        const start = top - vh * 0.9;
        const end = top - vh * 0.35;
        if (scroll >= end) { a = k; p = 0; continue; }
        if (scroll > start) { a = k - 1; p = (scroll - start) / (end - start); }
        break;
      }
      const b = Math.min(slots.length - 1, a + (p > 0 ? 1 : 0));
      return { a, b, p };
    }

    // --- frame loop ------------------------------------------------------------------------------
    let raf = 0;
    let running = false;
    let continuous = !reduced;
    let mode: "continuous" | "static" = continuous ? "continuous" : "static";
    let last = performance.now();
    let prevScroll = window.scrollY;
    let velocity = 0;
    let strikes = 0;
    let degradations = 0;
    let lastEmitted = "";
    let lastState: RosterState | null = null;
    let pathPhase = 0;
    let fpsAcc = 0, fpsN = 0, fps = 0;

    function frame(now: number) {
      raf = 0;
      const t0 = performance.now();
      const dt = Math.min(64, now - last) || 16;
      last = now;

      const lenis = getLenis();
      const scroll = window.scrollY;
      const inst = ((scroll - prevScroll) / dt) * 1000;
      velocity = velocity * 0.7 + inst * 0.3;
      prevScroll = scroll;
      const vh = window.innerHeight;
      const snapped = !!lenis && Math.abs(velocity) > FLING_VH_PER_S * vh;
      const effScroll = snapped && lenis ? lenis.targetScroll : scroll;

      const { a, b, p: rawP } = stateAt(effScroll);
      const p = reduced ? (rawP < 0.5 ? 0 : 1) : rawP;
      const la = layouts[a], lb = layouts[b];
      const toneA = TONE_ALPHA[slots[a].tone], toneB = TONE_ALPHA[slots[b].tone];
      const stateNow = p < 0.5 ? slots[a].state : slots[b].state;
      if (stateNow !== lastState) { lastState = stateNow; setState(stateNow); }

      // drift (hero only) and stream (lifecycle only) are the two time-based terms, both off under reduced motion
      const driftAmt = continuous && slots[a].state === "drift" ? 1 - p : 0;
      const time = now / 1000;
      const onPath = slots[a].state === "path" || slots[b].state === "path";
      if (continuous && onPath) pathPhase = (pathPhase + dt / 26000) % 1;
      const pathShift = Math.floor(pathPhase * n);

      // Settled on the path, the stream is an index rotation; follow must be instant or the wrap-around leaves strays.
      const follow = reduced || (slots[a].state === "path" && p === 0) ? 1 : FOLLOW;
      const active = activeColumnRef.current;
      const inColumns = slots[a].state === "columns" && p === 0;

      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      for (const bkt of buckets) bkt.length = 0;
      for (let i = 0; i < n; i++) {
        const s = stagger[i] * STAGGER;
        const e = p <= 0 ? 0 : p >= 1 ? 1 : smooth(Math.min(1, Math.max(0, (p - s) / (1 - STAGGER))));
        const ia = slots[a].state === "path" ? ((i + pathShift) % n) * 2 : i * 2;
        const ib = slots[b].state === "path" ? ((i + pathShift) % n) * 2 : i * 2;
        let tx = la.pos[ia] + (lb.pos[ib] - la.pos[ia]) * e;
        let ty = la.pos[ia + 1] + (lb.pos[ib + 1] - la.pos[ia + 1]) * e;
        if (driftAmt > 0) {
          tx += Math.sin(time * 0.7 + i * 0.37) * 6 * driftAmt;
          ty += Math.cos(time * 0.9 + i * 0.53) * 6 * driftAmt;
        }
        cur[i * 2] += (tx - cur[i * 2]) * follow;
        cur[i * 2 + 1] += (ty - cur[i * 2 + 1]) * follow;

        const y = cur[i * 2 + 1] - scroll;
        if (y < -4 || y > vh + 4) continue;

        const tone = e < 0.5 ? la.tone[i] : lb.tone[i];
        let alpha = toneA + (toneB - toneA) * e;
        let color = tone === 1 ? 1 : 0;
        if (inColumns && active !== null) {
          if (la.column[i] === active) { color = slots[a].tone === "paper" ? 2 : 0; alpha = 1; }
          else alpha *= 0.55;
        }
        const step = Math.min(ALPHA_STEPS - 1, Math.round(alpha * (ALPHA_STEPS - 1)));
        buckets[color * ALPHA_STEPS + step].push(i);
      }
      for (let bi = 0; bi < buckets.length; bi++) {
        const bkt = buckets[bi];
        if (bkt.length === 0) continue;
        ctx!.fillStyle = palette[Math.floor(bi / ALPHA_STEPS)];
        ctx!.globalAlpha = (bi % ALPHA_STEPS) / (ALPHA_STEPS - 1);
        ctx!.beginPath();
        for (let k = 0; k < bkt.length; k++) {
          const i = bkt[k];
          const x = cur[i * 2], y = cur[i * 2 + 1] - scroll;
          ctx!.moveTo(x + radius, y);
          ctx!.arc(x, y, radius, 0, TAU);
        }
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      // frame budget: halve the population after 30 consecutive over-budget frames; go static after a second run
      const work = performance.now() - t0;
      if (continuous) {
        if (work > FRAME_BUDGET_MS) {
          if (++strikes >= BUDGET_STRIKES) {
            strikes = 0;
            degradations++;
            if (degradations === 1 && n > FLOOR) {
              n = Math.max(FLOOR, Math.floor(n / 2));
              initialised = false;
              measure();
            } else {
              continuous = false;
              mode = "static";
            }
          }
        } else strikes = 0;
      }
      fpsAcc += dt; fpsN++;
      if (fpsAcc >= 500) { fps = Math.round((fpsN * 1000) / fpsAcc); fpsAcc = 0; fpsN = 0; }

      const key = `${a}-${b}-${p.toFixed(3)}-${snapped}-${n}-${mode}`;
      if (key !== lastEmitted) {
        lastEmitted = key;
        emitRoster({ from: slots[a].state, to: slots[b].state, progress: p, stats: { n, workMs: Math.round(work * 10) / 10, fps, snapped, mode } });
      }

      // keep looping while something is time-based or still settling
      const settling = !reduced && (p > 0 && p < 1);
      if (running && (continuous || settling)) raf = requestAnimationFrame(frame);
    }

    function requestFrame() {
      if (running && !raf) raf = requestAnimationFrame(frame);
    }

    // --- observers ---------------------------------------------------------------------------------
    let measureRaf = 0;
    function scheduleMeasure() {
      if (measureRaf) return;
      measureRaf = requestAnimationFrame(() => {
        measureRaf = 0;
        resizeCanvas();
        measure();
        requestFrame();
      });
    }
    const ro = new ResizeObserver(scheduleMeasure);
    slots.forEach((s) => ro.observe(s.el));
    ro.observe(document.body);
    window.addEventListener("resize", scheduleMeasure);
    window.addEventListener("scroll", requestFrame, { passive: true });
    const offLenis = onLenis(() => requestFrame());

    // Pause when no slot is anywhere near the viewport (footer, far past the close) and when the tab is hidden.
    const io = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries.some((e) => e.isIntersecting) || slots.some((s) => {
          const r = s.el.getBoundingClientRect();
          return r.bottom > -window.innerHeight && r.top < window.innerHeight * 2;
        });
        running = anyVisible && document.visibilityState === "visible";
        if (running) requestFrame();
        else if (raf) { cancelAnimationFrame(raf); raf = 0; }
      },
      { rootMargin: "100% 0px 100% 0px" },
    );
    slots.forEach((s) => io.observe(s.el));
    const onVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) { last = performance.now(); requestFrame(); }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    };
    document.addEventListener("visibilitychange", onVisibility);

    resizeCanvas();
    measure();
    running = true;
    requestFrame();

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      if (measureRaf) cancelAnimationFrame(measureRaf);
      ro.disconnect();
      io.disconnect();
      offLenis();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", requestFrame);
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [reduced, saveData, setActive, setState]);

  // A column change must repaint even when the loop is idle (reduced motion, settled).
  useEffect(() => {
    activeColumnRef.current = activeColumn;
    window.dispatchEvent(new Event("scroll"));
  }, [activeColumn]);

  if (saveData) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-20"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
