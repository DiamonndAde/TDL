/**
 * The six Roster states, in scroll order, and the text twin of each (AGENTS.md: every state the canvas depicts
 * is also stated in text — the header status line and the section captions read from here).
 */
export const rosterStates = ["drift", "grid", "map", "columns", "path", "mark"] as const;
export type RosterState = (typeof rosterStates)[number];

export const rosterStatusText: Record<RosterState, string> = {
  drift: "Showing 5,000 people, unassigned",
  grid: "Showing 5,000 people, counted",
  map: "Showing 5,000 people, by location",
  columns: "Showing 5,000 people, by service line",
  path: "Showing 5,000 people, through one employment lifecycle",
  mark: "Showing 5,000 people, as one firm",
};
