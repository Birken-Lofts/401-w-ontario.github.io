import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../ui/Logo';
import useScrollSpy from '../../hooks/useScrollSpy';

const links = [
  { id: 'about', label: 'About' },
  { id: 'residences', label: 'Residences' },
  { id: 'features', label: 'Features' },
  { id: 'location', label: 'Location' },
  { id: 'timeline', label: 'Timeline' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useScrollSpy();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] h-[74px]">
      {/* Charcoal bar fades in once scrolled past the hero */}
      <div
        className={`absolute inset-0 bg-charcoal border-b border-line-dark transition-opacity duration-300 ${
          scrolled ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div className="relative max-w-[1320px] mx-auto h-full px-[clamp(20px,5vw,56px)] flex items-center justify-between">
        <Logo markHeight={48} wordmarkSize={27} />

        {/* Desktop links */}
        <div className="hidden min-[860px]:flex items-center gap-[30px]">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`font-body text-[13px] font-medium tracking-[0.08em] transition-colors ${
                active === link.id ? 'text-terracotta' : 'text-sand hover:text-cream'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className="font-body text-xs font-semibold uppercase tracking-[0.1em] text-charcoal bg-paper px-[18px] py-[11px] rounded-[2px] hover:bg-cream transition-colors"
          >
            Register
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="min-[860px]:hidden text-cream"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="min-[860px]:hidden bg-charcoal border-t border-line-dark px-[clamp(20px,5vw,56px)] pb-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setMenuOpen(false)}
              className={`block py-3 font-body text-sm tracking-[0.08em] ${
                active === link.id ? 'text-terracotta' : 'text-sand'
              }`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="inline-block mt-3 font-body text-xs font-semibold uppercase tracking-[0.1em] text-charcoal bg-paper px-[18px] py-[11px] rounded-[2px]"
          >
            Register
          </a>
        </div>
      )}
    </nav>
  );
}
