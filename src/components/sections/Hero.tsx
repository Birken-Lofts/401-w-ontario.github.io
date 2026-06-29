import { motion } from 'framer-motion';

const stats = [
  { value: '57', label: 'Residences' },
  { value: '564–819', label: 'Square feet' },
  { value: '1–2', label: 'Bedrooms' },
];

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-end overflow-hidden bg-charcoal"
    >
      <picture className="absolute inset-0">
        <source
          srcSet="/images/elevations/401-W-Ontario-No-Signs-640w.webp 640w, /images/elevations/401-W-Ontario-No-Signs-1024w.webp 1024w, /images/elevations/401-W-Ontario-No-Signs-1920w.webp 1920w"
          sizes="100vw"
          type="image/webp"
        />
        <img
          src="/images/elevations/401-W-Ontario-No-Signs-1920w.webp"
          alt="Birken Lofts, 401 W. Ontario Street, River North Chicago"
          className="w-full h-full object-cover"
          fetchPriority="high"
        />
      </picture>
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(22,18,15,.72) 0%, rgba(22,18,15,.28) 32%, rgba(22,18,15,.5) 68%, rgba(22,18,15,.95) 100%)',
        }}
      />

      <div className="relative max-w-[1320px] w-full mx-auto px-[clamp(20px,5vw,56px)] pt-[100px] pb-[clamp(40px,6vw,76px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-[14px] mb-[22px]"
        >
          <span className="h-px w-[38px] bg-terracotta" />
          <span className="font-body text-xs font-semibold uppercase tracking-[0.34em] text-terracotta-soft">
            River North · Chicago · Est. 1905
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="m-0 font-display text-[clamp(44px,13vw,196px)] leading-[0.9] tracking-[-0.01em] text-cream"
        >
          Birken Lofts
        </motion.h1>

        <div className="flex flex-wrap items-end justify-between gap-8 mt-[30px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="max-w-[560px]"
          >
            <p className="m-0 mb-[10px] font-display italic text-[clamp(22px,3vw,32px)] leading-[1.2] text-paper">
              Historic loft living, reimagined.
            </p>
            <p className="m-0 mb-[26px] font-body text-base leading-[1.6] text-sand max-w-[440px]">
              57 residences carved from the heavy-timber bones of the 1905 S. Birkenstein &amp; Sons
              Building.
            </p>
            <div className="flex flex-wrap gap-[14px]">
              <a
                href="#contact"
                className="inline-flex items-center gap-[10px] bg-terracotta text-white font-body text-[13px] font-semibold uppercase tracking-[0.08em] px-[26px] py-4 rounded-[2px] hover:brightness-110 transition"
              >
                Stay informed <span className="text-[15px]">→</span>
              </a>
              <a
                href="#residences"
                className="inline-flex items-center gap-[10px] border border-paper/45 text-paper font-body text-[13px] font-semibold uppercase tracking-[0.08em] px-[26px] py-4 rounded-[2px] backdrop-blur-[3px] hover:bg-white/10 transition"
              >
                Floor plans
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center gap-[10px] bg-charcoal/50 border border-paper/20 backdrop-blur-[6px] px-4 py-[11px] rounded-[2px]"
          >
            <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_0_4px_rgba(127,174,127,0.2)]" />
            <span className="font-body text-xs font-medium tracking-[0.06em] text-paper">
              Now registering interest&nbsp;·&nbsp;First deliveries Oct 2027
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-3 gap-px bg-paper/15 border border-paper/15 mt-[42px]"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-charcoal/45 px-[22px] py-[18px]">
              <div className="font-display text-[34px] leading-none text-paper">{stat.value}</div>
              <div className="font-body text-[11px] font-medium uppercase tracking-[0.16em] text-taupe mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
