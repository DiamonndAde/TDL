import { Register } from "@/components/layout/register";
import { pathD, pathStops } from "@/components/roster/layouts";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { LifecycleDraw } from "./lifecycle-draw";

/**
 * Lifecycle. Graphic concept: one continuous line with five stops, and the population streams along it — "end to
 * end" made literal. Information carried: the sequence of the employment lifecycle and what TDL runs at each
 * stage. This is the one place numbering is legitimate; the content is sequential.
 *
 * The SVG is server-rendered in a 1000×300 box stretched to the slot (`preserveAspectRatio="none"`); the Roster's
 * path layout uses the same fractional stops and Catmull-Rom is affine-invariant, so the stream and the line
 * coincide at any slot size. DrawSVG scrubs the line on scroll after hydration (lifecycle-draw.tsx).
 */
const stages = [
  { name: "Hire", runs: "Sourcing, screening and pre-employment checks." },
  { name: "Onboard", runs: "Contracts, records and first-day readiness." },
  { name: "Perform", runs: "Payroll, statutory remittances and performance." },
  { name: "Develop", runs: "Learning, leadership and skills programmes." },
  { name: "Exit", runs: "Clean exits with records and obligations closed." },
] as const;

const BOX = { x: 0, y: 0, w: 1000, h: 300 };

export function Lifecycle() {
  const stops = pathStops(BOX);
  const d = pathD(stops);
  return (
    <Register id="lifecycle" title="Lifecycle" note={rosterStatusText.path}>
      <h3 className="display max-w-[22ch] text-[1.75rem] md:text-[2rem]">
        One employer, from the first interview to the last payslip.
      </h3>
      <div className="mt-8">
        <RosterSlot state="path" tone="paper" className="h-[180px] md:h-[240px] lg:h-[300px]">
          <svg
            viewBox={`0 0 ${BOX.w} ${BOX.h}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path id="lifecycle-path" d={d} fill="none" stroke="var(--olive)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
          {stops.map((s, i) => (
            <span
              key={stages[i].name}
              aria-hidden="true"
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-paper ring-2 ring-olive"
              style={{ left: `${(s.x / BOX.w) * 100}%`, top: `${(s.y / BOX.h) * 100}%` }}
            />
          ))}
        </RosterSlot>

        {/* Desktop: labels sit under their stops. Phones: the same content as a numbered list. */}
        <ol className="relative mt-4 hidden h-[6.5rem] md:block" aria-label="Lifecycle stages">
          {stops.map((s, i) => (
            <li
              key={stages[i].name}
              className="absolute w-[9.5rem] -translate-x-1/2 text-center"
              style={{ left: `${(s.x / BOX.w) * 100}%` }}
            >
              <span className="data text-olive">{i + 1}</span>
              <span className="mt-0.5 block text-[1.0625rem] font-medium">{stages[i].name}</span>
              <span className="data mt-1 block text-olive">{stages[i].runs}</span>
            </li>
          ))}
        </ol>
        <ol className="mt-6 border-t border-olive md:hidden" aria-label="Lifecycle stages">
          {stages.map((st, i) => (
            <li key={st.name} className="grid grid-cols-[2rem_1fr] border-b border-olive py-3">
              <span className="data text-olive">{i + 1}</span>
              <span>
                <span className="block text-[1.0625rem] font-medium">{st.name}</span>
                <span className="data block text-olive">{st.runs}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
      <LifecycleDraw pathId="lifecycle-path" />
    </Register>
  );
}
