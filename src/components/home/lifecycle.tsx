import { Register } from "@/components/layout/register";
import { flowGeometry } from "@/components/roster/layouts";
import { RosterSlot } from "@/components/roster/slot";
import { rosterStatusText } from "@/components/roster/states";
import { LifecycleDraw } from "./lifecycle-draw";

/**
 * Lifecycle. Graphic concept: a band the population flows through left to right, divided into five stages,
 * narrowing as it goes — every cohort thins a little at each stage, which is true of any employment lifecycle
 * without needing client data. Information carried: the order of the stages, what TDL runs at each, and that
 * the population thins toward the exit. Swap the labels and the graphic changes meaning; that is the test.
 * Numbering is legitimate here because the content is sequential.
 *
 * The band is straight-edged, so the same fractional geometry serves the server-rendered SVG (a 1000×300 box
 * stretched to the slot) and the Roster's flow layout (the slot rect). DrawSVG draws the edges left to right
 * on scroll after hydration (lifecycle-draw.tsx).
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
  const g = flowGeometry(BOX);
  return (
    <Register id="lifecycle" title="Lifecycle" note={rosterStatusText.path}>
      <h3 className="display max-w-[22ch] text-[1.75rem] md:text-[2rem]">
        One employer, from the first interview to the last payslip.
      </h3>
      <div className="mt-8">
        <RosterSlot state="path" tone="paper" className="h-[160px] md:h-[220px] lg:h-[280px]">
          <svg
            viewBox={`0 0 ${BOX.w} ${BOX.h}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              id="lifecycle-ticks"
              d={g.ticks}
              fill="none"
              stroke="var(--olive)"
              strokeWidth="1"
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
            <path id="lifecycle-path" d={g.edges} fill="none" stroke="var(--olive)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </RosterSlot>

        {/* One label per stage, centred under it. Phones: the same content as a numbered list. */}
        <ol className="relative mt-4 hidden h-[6.5rem] md:block" aria-label="Lifecycle stages">
          {g.centers.map((c, i) => (
            <li
              key={stages[i].name}
              className="absolute w-[9.5rem] -translate-x-1/2 text-center"
              style={{ left: `${c * 100}%` }}
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
        <p className="data mt-3 max-w-[60ch] text-olive">
          The band narrows because every cohort thins a little at each stage. It is not to scale.
        </p>
      </div>
      <LifecycleDraw pathId="lifecycle-path" />
    </Register>
  );
}
