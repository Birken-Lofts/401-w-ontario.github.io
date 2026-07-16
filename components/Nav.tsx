'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import useScrollSpy from '@/hooks/useScrollSpy';

export default function Nav() {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const onHome = pathname === '/';
  const active = useScrollSpy(onHome);
  const onCam = pathname.startsWith('/ohio-feeder-ramp-cam');
  const onHistory = pathname.startsWith('/history');
  const onFinishes = pathname.startsWith('/finishes');
  const onBlog = pathname.startsWith('/blog');

  const links = [
    { href: '/#plans', label: 'Residences', current: onHome && active === 'plans' },
    { href: '/finishes/', label: 'Finishes', current: onFinishes },
    { href: '/history/', label: 'History', current: onHistory },
    { href: '/blog/', label: 'Journal', current: onBlog },
    { href: '/#amenities', label: 'Amenities', current: onHome && active === 'amenities' },
    { href: '/#neighborhood', label: 'Neighborhood', current: onHome && active === 'neighborhood' },
    { href: '/ohio-feeder-ramp-cam/', label: 'Traffic Cam', current: onCam },
    { href: '/#contact', label: 'Contact', current: onHome && active === 'contact' },
  ];

  const close = () => setOpen(false);

  // Close the drawer on Escape or a tap outside the header/panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && !t.closest('.site-nav') && !t.closest('.nav-drawer')) setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    drawerRef.current?.querySelector('a')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

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
          ref={menuBtnRef}
          className="nav-menu-btn"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="nav-drawer"
        >
          {open ? <X size={26} strokeWidth={2.75} /> : <Menu size={26} strokeWidth={2.75} />}
        </button>
      </nav>
      {open && (
        <div className="nav-drawer" ref={drawerRef} id="nav-drawer">
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
