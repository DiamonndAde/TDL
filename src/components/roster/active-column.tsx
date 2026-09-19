"use client";

import { useEffect } from "react";
import { useRoster } from "./roster-context";

/** Sets which service column the Roster lifts for as long as this is mounted (service pages). */
export function ActiveColumn({ index }: { index: number | null }) {
  const { setActiveColumn } = useRoster();
  useEffect(() => {
    setActiveColumn(index);
    return () => setActiveColumn(null);
  }, [index, setActiveColumn]);
  return null;
}
