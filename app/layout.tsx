import type { Metadata } from 'next';
import Script from 'next/script';
import { Libre_Franklin } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import './site.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// Self-hosted via next/font: no render-blocking Google Fonts CSS request,
// and size-adjusted fallbacks keep font swap from shifting layout.
// Big Shoulders Display is a local file — Google consolidated the family into
// "Big Shoulders", so next/font/google no longer knows the Display cut.
const heading = localFont({
  src: 'fonts/big-shoulders-display-latin.woff2',
  weight: '500 800',
  variable: '--font-heading-gf',
  display: 'swap',
});

const body = Libre_Franklin({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-body-gf',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://birkenlofts.com'),
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-YVPGP24V3P" strategy="lazyOnload" />
        <Script id="ga" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-YVPGP24V3P');
        `}</Script>
      </body>
    </html>
  );
}
