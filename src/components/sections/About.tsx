import ScrollReveal from '../ui/ScrollReveal';
import { Eyebrow } from '../ui/SectionHeading';

export default function About() {
  return (
    <section id="about" className="bg-paper py-[clamp(80px,11vw,150px)]">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)] grid grid-cols-1 min-[900px]:grid-cols-[0.85fr_1.1fr] gap-[clamp(40px,6vw,80px)]">
        <ScrollReveal>
          <img
            src="/images/elevations/401-W-Ontario-No-Signs-Black-White-800w.webp"
            srcSet="/images/elevations/401-W-Ontario-No-Signs-Black-White-400w.webp 400w, /images/elevations/401-W-Ontario-No-Signs-Black-White-600w.webp 600w, /images/elevations/401-W-Ontario-No-Signs-Black-White-800w.webp 800w"
            sizes="(max-width: 900px) 100vw, 40vw"
            alt="S. Birkenstein & Sons Building, 1905"
            width={800}
            height={603}
            className="w-full block rounded-[2px]"
            loading="lazy"
          />
          <p className="mt-[14px] font-body text-[11px] font-medium uppercase tracking-[0.18em] text-taupe-2">
            S. Birkenstein &amp; Sons Building · River North · 1905
          </p>
        </ScrollReveal>

        <ScrollReveal className="self-center">
          <Eyebrow className="mb-[22px]">Our story</Eyebrow>
          <h2 className="m-0 mb-7 font-display text-[clamp(40px,5.5vw,72px)] leading-none text-ink">
            A legacy renewed
          </h2>
          <p className="m-0 mb-[18px] font-body text-base leading-[1.75] text-stone-2">
            Built in 1905 as the headquarters of S. Birkenstein &amp; Sons, this heavy-timber loft is
            pure River North — red brick, arched openings, and an industrial soul that has anchored
            the block for over a century.
          </p>
          <p className="m-0 mb-[18px] font-body text-base leading-[1.75] text-stone-2">
            Our adaptive reuse preserves what makes it singular — the timber beams, masonry walls, and
            arched windows — while carving 57 modern residences into the structure.
          </p>
          <p className="m-0 mb-[30px] font-body text-base leading-[1.75] text-stone-2">
            Inside, everything is new: windows, HVAC, wide-plank floors, kitchens, in-unit laundry, a
            new elevator, and gigabit internet — plus a fitness center, co-working, and bike storage.
          </p>
          <p className="m-0 font-display italic text-[clamp(24px,3.4vw,40px)] leading-[1.25] text-ink">
            All-new living inside a building with{' '}
            <span className="text-terracotta">120 years of character.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
