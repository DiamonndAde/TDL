"use client";

import { useSyncExternalStore } from "react";
import { analyticsConfigured } from "./config";

/**
 * The visitor's analytics choice. Three states: `pending` (never answered — the banner shows), `granted`,
 * `denied`. Stored in `localStorage`, deliberately **not** a cookie: declining must set nothing at all, and a
 * consent cookie written before consent is the thing the rule exists to prevent.
 *
 * The choice is re-openable from the Cookies link in the footer, so "denied" is a decision the visitor can
 * revisit rather than a dead end.
 */
export type Consent = "pending" | "granted" | "denied";

const KEY = "tdl.analytics-consent";
const listeners = new Set<() => void>();

/** Cached so `getSnapshot` returns a stable value; `localStorage` reads can also throw in private windows. */
let cached: Consent | null = null;

function read(): Consent {
  if (cached !== null) return cached;
  try {
    const raw = window.localStorage.getItem(KEY);
    cached = raw === "granted" || raw === "denied" ? raw : "pending";
  } catch {
    // Private window, blocked storage: treat as unanswered, which means nothing loads.
    cached = "pending";
  }
  return cached;
}

function write(value: Consent) {
  cached = value;
  try {
    if (value === "pending") window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    // Unstorable choice still applies for this page view; it simply will not be remembered.
  }
  for (const l of listeners) l();
}

export const grantConsent = () => write("granted");
export const denyConsent = () => write("denied");
/** Footer "Cookies" link: reopen the choice without changing what is currently in force until they answer. */
export const reopenConsent = () => write("pending");

function subscribe(cb: () => void) {
  listeners.add(cb);
  // Another tab answering the banner should settle this one too.
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cached = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * Server snapshot is always `pending`: the server cannot know, and `pending` is the state in which nothing
 * loads. Hydration therefore starts from the safe answer and corrects on the client.
 */
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, read, () => "pending");
}

/** Whether the banner should be on screen: only when analytics exists at all and the visitor has not answered. */
export function useShouldAskConsent(): boolean {
  return useConsent() === "pending" && analyticsConfigured;
}
