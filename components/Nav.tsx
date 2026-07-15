'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import useScrollSpy from '@/hooks/useScrollSpy';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useScrollSpy(onHome);
  const onCam = pathname.startsWith('/ohio-feeder-ramp-cam');
  const onHistory = pathname.startsWith('/history');

  const links = [
    { href: '/#plans', label: 'Residences', current: onHome && active === 'plans' },
    { href: '/history/', label: 'History', current: onHistory },
    { href: '/#amenities', label: 'Amenities', current: onHome && active === 'amenities' },
    { href: '/#neighborhood', label: 'Neighborhood', current: onHome && active === 'neighborhood' },
    { href: '/ohio-feeder-ramp-cam/', label: 'Traffic Cam', current: onCam },
    { href: '/#contact', label: 'Contact', current: onHome && active === 'contact' },
  ];

  const close = () => setOpen(false);

  return (
    <>
      <nav className="site-nav">
        <Link href="/" className="nav-brand">Birken Lofts</Link>
        <div className="nav-links">
          {links.map((l) => (
            <Link key={l.label} href={l.href} aria-current={l.current ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-primary" href="/#contact">Contact us</Link>
        </div>
        <button
          className="nav-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} strokeWidth={2.75} /> : <Menu size={24} strokeWidth={2.75} />}
        </button>
      </nav>
      {open && (
        <div className="nav-drawer">
          {links.map((l) => (
            <Link key={l.label} href={l.href} onClick={close} aria-current={l.current ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-primary" href="/#contact" onClick={close}>Contact us</Link>
        </div>
      )}
    </>
  );
}
