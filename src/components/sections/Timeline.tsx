import type { CSSProperties } from 'react';
import { milestones, type MilestoneState } from '../../data/timeline';
import { Eyebrow } from '../ui/SectionHeading';

const GREY = '#ddd3c4';
const TERRACOTTA = '#bf5e34';

// Connector leading into the NEXT milestone, colored by that milestone's state.
function connectorBackground(nextState: MilestoneState): string {
  if (nextState === 'complete') return TERRACOTTA;
  if (nextState === 'next') return `linear-gradient(90deg,${TERRACOTTA} 0%,${TERRACOTTA} 60%,${GREY} 60%,${GREY} 100%)`;
  return GREY;
}

const dotStyle: Record<MilestoneState, CSSProperties> = {
  complete: { background: TERRACOTTA, border: '3px solid #f4efe7', boxShadow: `0 0 0 1px ${TERRACOTTA}` },
  next: { background: '#f4efe7', border: `3px solid ${TERRACOTTA}` },
  upcoming: { background: '#f4efe7', border: '3px solid #c9bca9' },
};

const labelColor: Record<MilestoneState, string> = {
  complete: 'text-terracotta',
  next: 'text-[#9a8164]',
  upcoming: 'text-taupe',
};

export default function Timeline() {
  return (
    <section id="timeline" className="bg-paper py-[clamp(80px,11vw,150px)]">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)]">
        <div className="max-w-[680px] mb-[58px]">
          <Eyebrow className="mb-5">The journey</Eyebrow>
          <h2 className="m-0 font-display text-[clamp(40px,5.5vw,72px)] leading-none text-ink">
            From blueprint to home
          </h2>
        </div>

        <div className="flex min-[660px]:grid min-[660px]:grid-cols-4 gap-6 overflow-x-auto min-[660px]:overflow-visible snap-x pb-1 min-[660px]:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {milestones.map((ms, i) => {
            const next = milestones[i + 1];
            return (
              <div key={ms.title} className="w-[260px] shrink-0 min-[660px]:w-auto snap-start">
                <div className="relative h-5 mb-[22px]">
                  {next && (
                    <div
                      className="absolute left-[10px] right-[-24px] top-[9px] h-[2px]"
                      style={{ background: connectorBackground(next.state) }}
                    />
                  )}
                  <span
                    className="absolute left-0 top-0 w-5 h-5 rounded-full z-[1]"
                    style={dotStyle[ms.state]}
                  />
                </div>
                <div
                  className={`font-body text-[11px] font-semibold uppercase tracking-[0.14em] ${labelColor[ms.state]}`}
                >
                  {ms.label}
                </div>
                <h3 className="mt-[9px] mb-2 font-display text-[26px] text-ink">{ms.title}</h3>
                <p className="m-0 font-body text-sm leading-[1.65] text-stone">{ms.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
