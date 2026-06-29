import { features } from '../../data/features';
import { Eyebrow } from '../ui/SectionHeading';

export default function Features() {
  return (
    <section id="features" className="bg-paper py-[clamp(80px,11vw,150px)]">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)]">
        <div className="max-w-[680px] mb-[54px]">
          <Eyebrow className="mb-5">The building</Eyebrow>
          <h2 className="m-0 font-display text-[clamp(40px,5.5vw,72px)] leading-none text-ink">
            Where heritage meets modern living
          </h2>
        </div>

        <div className="grid grid-cols-1 min-[620px]:grid-cols-2 min-[980px]:grid-cols-3 border-t border-line">
          {features.map((f) => {
            const heritage = f.tag === 'Est. 1905';
            const pill = heritage ? 'text-taupe-2 border-taupe-2/30' : 'text-terracotta border-terracotta/30';
            return (
              <div
                key={f.n}
                className="flex flex-col gap-[10px] border-b border-r border-line px-[26px] pt-[26px] pb-7 min-h-[150px]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-2xl text-[#c9bca9]">{f.n}</span>
                  <span
                    className={`font-body text-[10px] font-semibold uppercase tracking-[0.14em] border rounded-[2px] px-2 py-[3px] ${pill}`}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="m-0 mt-[6px] font-display text-[25px] leading-[1.05] text-ink">{f.title}</h3>
                <p className="m-0 font-body text-sm leading-[1.6] text-stone">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
