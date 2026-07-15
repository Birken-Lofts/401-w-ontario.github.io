import type { Metadata } from 'next';
import Hero from '@/components/home/Hero';
import StatsBand from '@/components/home/StatsBand';
import FloorPlans from '@/components/home/FloorPlans';
import FinishesTeaser from '@/components/home/FinishesTeaser';
import HistoryBand from '@/components/home/HistoryBand';
import Amenities from '@/components/home/Amenities';
import Neighborhood from '@/components/home/Neighborhood';
import Schedule from '@/components/home/Schedule';
import Contact from '@/components/home/Contact';

export const metadata: Metadata = {
  title: 'Birken Lofts | Historic Loft Living in River North',
  description:
    '57 residences within the historic 1905 S. Birkenstein & Sons Building in River North, Chicago. Construction begins October 2026.',
  alternates: { canonical: 'https://birkenlofts.com' },
  openGraph: {
    title: 'Birken Lofts | Historic Loft Living in River North',
    description:
      '57 residences within the historic 1905 S. Birkenstein & Sons Building in River North, Chicago.',
    type: 'website',
    url: 'https://birkenlofts.com',
    images: ['https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ApartmentComplex',
  name: 'Birken Lofts',
  description:
    '57 residences within the historic 1905 S. Birkenstein & Sons Building in River North, Chicago. A thoughtful adaptive reuse preserving exposed heavy timber beams, original masonry walls, and distinctive arched window openings.',
  url: 'https://birkenlofts.com',
  image: 'https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '401 W. Ontario Street',
    addressLocality: 'Chicago',
    addressRegion: 'IL',
    postalCode: '60654',
    addressCountry: 'US',
  },
  geo: { '@type': 'GeoCoordinates', latitude: 41.8935, longitude: -87.6388 },
  numberOfAvailableAccommodation: 57,
  amenityFeature: [
    { '@type': 'LocationFeatureSpecification', name: 'Exposed Brick & Heavy Timber' },
    { '@type': 'LocationFeatureSpecification', name: 'Oversized Windows' },
    { '@type': 'LocationFeatureSpecification', name: 'In-Unit Laundry' },
    { '@type': 'LocationFeatureSpecification', name: 'Fitness Center' },
    { '@type': 'LocationFeatureSpecification', name: 'Garage Parking' },
    { '@type': 'LocationFeatureSpecification', name: 'Pet Friendly' },
  ],
  developer: {
    '@type': 'Organization',
    name: 'Monroe Residential Partners',
    url: 'https://monroeresidential.com',
  },
};

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <StatsBand />
      <FloorPlans />
      <FinishesTeaser />
      <HistoryBand />
      <Amenities />
      <Neighborhood />
      <Schedule />
      <Contact />
    </main>
  );
}
