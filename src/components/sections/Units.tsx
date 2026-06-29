import { units } from '../../data/units';
import ScrollReveal from '../ui/ScrollReveal';
import { Eyebrow } from '../ui/SectionHeading';

export default function Units() {
  return (
    <section id="residences" className="bg-charcoal text-paper py-[clamp(80px,11vw,150px)]">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)]">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-[54px]">
          <div>
            <Eyebrow className="mb-5">The residences</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(40px,5.5vw,72px)] leading-none text-cream">
              Find your loft
            </h2>
          </div>
          <p className="m-0 max-w-[380px] font-body text-[15px] leading-[1.7] text-sand-2">
            Fifty-seven residences — from efficient studios to corner two-bedrooms — each shaped by the
            building&rsquo;s original timber and light.
          </p>
        </div>

        <div className="grid grid-cols-1 min-[620px]:grid-cols-2 min-[900px]:grid-cols-3 gap-[22px]">
          {units.map((unit) => (
            <ScrollReveal key={unit.id}>
              <div className="bg-paper rounded-[3px] overflow-hidden flex flex-col h-full">
                <div className="bg-white px-[26px] pt-[26px] pb-2">
                  <img
                    src={unit.floorPlanImage}
                    alt={`${unit.name} floor plan`}
                    width={unit.floorPlanWidth}
                    height={unit.floorPlanHeight}
                    className="w-full h-[230px] object-contain block"
                    loading="lazy"
                  />
                </div>
                <div className="px-[26px] pt-[22px] pb-7 text-ink border-t border-line-2">
                  <div className="flex items-baseline justify-between gap-[10px]">
                    <span className="font-display text-[30px]">{unit.name}</span>
                    <span className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-terracotta">
                      {unit.bedrooms} Bed · {unit.bathrooms} Bath
                    </span>
                  </div>
                  <div className="font-body text-[13px] font-semibold tracking-[0.12em] text-taupe-2 mt-[6px] mb-[14px]">
                    {unit.sqft} SF
                  </div>
                  <p className="m-0 font-body text-sm leading-[1.6] text-stone">{unit.description}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
