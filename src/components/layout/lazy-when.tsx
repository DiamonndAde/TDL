"use client";

import { Suspense, lazy, type ComponentType, type LazyExoticComponent } from "react";

/**
 * Render a component only when a build-time flag is on, loading its code in a separate chunk.
 *
 * Deliberately not `next/dynamic`: its loadable machinery costs ~1.6 KB of first-load JS on every route, which
 * is most of the saving when the flag is off. `React.lazy` is already in the bundle, and the two gates together
 * cost **0.5 KB** per route with analytics switched off (measured 2026-09-30). The lazy component is
 * created at module scope, so its identity is stable across renders — creating it inside a component would
 * remount the subtree on every render, which is what `react-hooks/static-components` guards against.
 */
export function lazyGate(load: () => Promise<{ default: ComponentType }>): LazyExoticComponent<ComponentType> {
  return lazy(load);
}

/** Renders `Component` when `enabled`, inside a Suspense boundary with no fallback (it has nothing to show). */
export function LazyWhen({ enabled, component: Component }: { enabled: boolean; component: LazyExoticComponent<ComponentType> }) {
  if (!enabled) return null;
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}
