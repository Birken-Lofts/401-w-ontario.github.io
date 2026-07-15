import { milestones, type MilestoneState } from '@/data/timeline';

const tagFor: Record<MilestoneState, { cls: string; text: string }> = {
  complete: { cls: 'tag-accent-2', text: 'Complete' },
  next: { cls: 'tag-accent', text: 'Next' },
  upcoming: { cls: 'tag-neutral', text: 'Planned' },
};

const dotCls: Record<MilestoneState, string> = {
  complete: 'tl-dot-complete',
  next: 'tl-dot-next',
  upcoming: 'tl-dot-upcoming',
};

const ACCENT = '#c67139'; /* --color-accent */
const NEUTRAL = '#dcd3c4'; /* --color-neutral-300 */

// Connector leading into the NEXT milestone, colored by that milestone's state.
function connectorBackground(nextState: MilestoneState): string {
  if (nextState === 'complete') return ACCENT;
  if (nextState === 'next')
    return `linear-gradient(90deg,${ACCENT} 0%,${ACCENT} 60%,${NEUTRAL} 60%,${NEUTRAL} 100%)`;
  return NEUTRAL;
}

export default function Schedule() {
  return (
    <section id="schedule" className="section container">
      <h2>Construction schedule</h2>
      <p className="section-intro">
        The building&rsquo;s conversion to residences is underway. Here&rsquo;s where things stand.
      </p>
      <div className="timeline">
        {milestones.map((ms, i) => {
          const next = milestones[i + 1];
          const date = ms.label.split(' · ')[0];
          return (
            <div key={ms.title} className="tl-item">
              <div className="tl-track">
                {next && (
                  <div className="tl-connector" style={{ background: connectorBackground(next.state) }} />
                )}
                <span className={`tl-dot ${dotCls[ms.state]}`} />
              </div>
              <span className={`tag ${tagFor[ms.state].cls}`}>{tagFor[ms.state].text}</span>
              <div className="tl-date">{date}</div>
              <h3 className="tl-title">{ms.title}</h3>
              <p className="tl-body">{ms.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
