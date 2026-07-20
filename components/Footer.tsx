import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">Birken Lofts</div>
          <div className="footer-meta">
            S. Birkenstein &amp; Sons Building · Built 1905
            <br />
            401 W. Ontario Street, Chicago, IL 60654
          </div>
        </div>
        <div className="footer-links">
          <Link href="/#plans">Residences</Link>
          <Link href="/history/">History</Link>
          <Link href="/blog/">Journal</Link>
          <Link href="/#contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
