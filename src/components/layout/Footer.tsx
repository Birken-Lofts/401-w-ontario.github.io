import Logo from '../ui/Logo';

const navLinks = ['About', 'Residences', 'Features', 'Location', 'Contact'];

export default function Footer() {
  return (
    <footer className="bg-charcoal-deep text-sand pt-[clamp(48px,7vw,80px)] pb-9">
      <div className="max-w-[1320px] mx-auto px-[clamp(20px,5vw,56px)]">
        <div className="flex flex-wrap justify-between items-start gap-6 border-b border-line-dark pb-[34px]">
          <div>
            <Logo markHeight={43} wordmarkSize={26} />
            <div className="font-body text-[13px] leading-[1.6] text-taupe-2 mt-2">
              401 W. Ontario Street, Chicago, IL 60654
            </div>
          </div>
          <div className="flex flex-wrap gap-[22px]">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="font-body text-[13px] font-medium tracking-[0.06em] text-sand hover:text-cream transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 pt-[22px]">
          <span className="font-body text-xs text-[#6f6457]">
            &copy; {new Date().getFullYear()} Birken Lofts. All rights reserved.
          </span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <a
              href="/ohio-feeder-ramp-cam/"
              className="font-body text-xs text-[#6f6457] hover:text-taupe-2 transition-colors"
            >
              Live Traffic Cam
            </a>
            <a
              href="https://monroeresidential.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-xs text-[#6f6457] hover:text-taupe-2 transition-colors"
            >
              A Monroe Residential Partners Development
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
