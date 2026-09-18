"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { RosterState } from "./states";

interface RosterContextValue {
  /** True while a Roster canvas is mounted on the page; the header only shows the status line then. */
  active: boolean;
  setActive: (a: boolean) => void;
  state: RosterState;
  setState: (s: RosterState) => void;
  /** Which service column is active (hover/focus/open), or null. */
  activeColumn: number | null;
  setActiveColumn: (i: number | null) => void;
}

const RosterContext = createContext<RosterContextValue | null>(null);

export function RosterProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [state, setState] = useState<RosterState>("drift");
  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  return (
    <RosterContext.Provider value={{ active, setActive, state, setState, activeColumn, setActiveColumn }}>
      {children}
    </RosterContext.Provider>
  );
}

export function useRoster() {
  const ctx = useContext(RosterContext);
  if (!ctx) throw new Error("useRoster must be used inside <RosterProvider>");
  return ctx;
}

/** Same hook, but tolerant of pages that have no Roster (every route except home). */
export function useRosterOptional() {
  return useContext(RosterContext);
}
