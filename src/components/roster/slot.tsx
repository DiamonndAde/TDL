import type { ReactNode } from "react";
import type { RosterState } from "./states";

/**
 * A slot reserves the space one Roster state is drawn into. It is a real box in the layout (so there is no
 * CLS when the canvas mounts) and the canvas reads its rect. `tone` tells the Roster which ground it sits on
 * so mark alpha is right. Content can be layered inside (e.g. the lifecycle's SVG path).
 */
export function RosterSlot({
  state,
  tone,
  className = "",
  children,
}: {
  state: RosterState;
  tone: "ink" | "paper";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div data-roster-slot={state} data-roster-tone={tone} className={`relative ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}
