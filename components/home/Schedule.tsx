import { milestones, type MilestoneState } from '@/data/timeline';

const statusFor: Record<MilestoneState, string> = {
  complete: 'Complete',
  next: 'Next',
  upcoming: 'Planned',
};

export default function Schedule() {
  return (
    <section id="schedule" className="section section-shell schedule-section">
      <div className="section-heading-row">
        <h2>Construction schedule</h2>
        <p className="section-intro">
          The building&rsquo;s conversion to residences is underway. Here&rsquo;s where things stand.
        </p>
      </div>
      <div className="schedule-grid">
        {milestones.map((ms) => {
          const date = ms.label.split(' · ')[0];
          return (
            <div key={ms.title} className="schedule-item">
              <span className="schedule-rail" aria-hidden="true">
                <span className={`schedule-dot schedule-dot--${ms.state}`} />
              </span>
              <div className="schedule-copy">
                <span className={`schedule-status schedule-status--${ms.state}`}>
                  {statusFor[ms.state]}
                </span>
                <div className="schedule-date">{date}</div>
                <h3>{ms.title}</h3>
                <p>{ms.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
