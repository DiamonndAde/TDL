import { Register } from "@/components/layout/register";
import { mapGeometry, polygonsToPath } from "@/components/roster/layouts";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { coverage } from "@/content/facts";

/**
 * Coverage. Graphic concept: the two national outlines the population fills — the marks are the people, the
 * outline says which country. Information carried: Nigeria and Benin Republic as two distinct territories and
 * their relative size and position. Same projection as the Roster's map layout, so the marks sit exactly inside
 * the line. No density hotspots and no state count until Q7/Q8 are confirmed.
 */
export function Coverage() {
  const g = mapGeometry();
  return (
    <Register id="coverage" title="Coverage" note={rosterStatusText.map}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,24rem)_1fr] lg:gap-14">
        <div>
          <h3 className="display text-[1.75rem] md:text-[2rem]">{coverage.line}</h3>
          <p className="mt-5 text-[1.0625rem] text-olive">
            One firm runs the payroll calendar, the statutory remittances and the employment records wherever your
            people are, in both countries. A Lagos-only arrangement stops at the state line; this one doesn&rsquo;t.
          </p>
        </div>
        <RosterSlot state="map" tone="paper" className="h-[280px] lg:h-[400px]">
          <svg
            viewBox={`0 0 ${g.width.toFixed(3)} ${g.height.toFixed(3)}`}
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path d={polygonsToPath(g.nigeria)} fill="none" stroke="var(--olive)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <path d={polygonsToPath(g.benin)} fill="none" stroke="var(--olive)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </svg>
          <MapLabel text="Nigeria" style={{ left: "58%", top: "6%" }} />
          <MapLabel text="Benin Republic" style={{ left: "1%", top: "84%" }} />
        </RosterSlot>
      </div>
    </Register>
  );
}

function MapLabel({ text, style }: { text: string; style: React.CSSProperties }) {
  return (
    <span className="data absolute text-olive" style={style}>
      {text}
    </span>
  );
}
