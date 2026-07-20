const stats = [
  { figure: '1905', label: 'Built for S. Birkenstein & Sons' },
  { figure: '57', label: 'Loft residences' },
  { figure: '4', label: 'Stories of brick & heavy timber', labelShort: 'Stories of brick & timber' },
  { figure: '0.2 mi', label: 'To the Chicago River' },
];

export default function StatsBand() {
  return (
    <section className="stats-band" aria-label="Building facts">
      <div className="stats-inner section-shell">
        {stats.map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-figure">{s.figure}</div>
            <div className="stat-label">
              {s.labelShort ? (
                <>
                  <span className="stat-label-long">{s.label}</span>
                  <span className="stat-label-short">{s.labelShort}</span>
                </>
              ) : (
                s.label
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
