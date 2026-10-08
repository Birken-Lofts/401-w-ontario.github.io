import type { Metadata, Viewport } from 'next';
import { Libre_Franklin } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';
import './site.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';

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
  // Raster icons are generated from favicon.svg by scripts/build-icons.mjs.
  // Google Search ignores SVG-only favicons, hence the .ico/.png.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180' },
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#121110', // --color-bg
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <Nav />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
