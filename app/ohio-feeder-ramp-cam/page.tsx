import type { Metadata } from 'next';

import CamFacade from '@/components/CamFacade';

export const metadata: Metadata = {
  title: 'Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera | Birken Lofts',
  description:
    'Live 24/7 traffic camera view of the Ohio Street feeder ramp connecting the Kennedy Expressway (I-90/94) to downtown Chicago. Streamed from River North at 401 W. Ontario Street.',
  alternates: { canonical: 'https://birkenlofts.com/ohio-feeder-ramp-cam/' },
  openGraph: {
    title: 'Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera',
    description:
      'Live 24/7 traffic camera view of the Ohio Street feeder ramp connecting the Kennedy Expressway (I-90/94) to downtown Chicago.',
    type: 'video.other',
    url: 'https://birkenlofts.com/ohio-feeder-ramp-cam/',
    images: ['https://i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg'],
    videos: ['https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ'],
  },
};

const faqs = [
  {
    q: 'Is this traffic camera live?',
    a: 'Yes. The camera streams 24/7 via YouTube Live. The stream may occasionally restart for maintenance; if it appears offline, check back in a few minutes.',
  },
  {
    q: 'What does this camera show?',
    a: 'The Ohio Street feeder ramp, the elevated roadway that carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood.',
  },
  {
    q: 'Where is the camera located?',
    a: "The camera streams from near 401 W. Ontario Street in Chicago's River North neighborhood, the site of Birken Lofts, overlooking the Ohio and Ontario Street feeder corridor.",
  },
];

const videoJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Ohio Street Feeder Ramp Live Cam — Chicago I-90/94 Traffic Camera',
  description:
    'Live 24/7 streaming traffic camera showing the Ohio Street feeder ramp, which carries traffic between the Kennedy Expressway (I-90/94) and downtown Chicago through the River North neighborhood.',
  thumbnailUrl: 'https://i.ytimg.com/vi/DdyWM2B-FYQ/maxresdefault.jpg',
  uploadDate: '2026-07-14',
  embedUrl: 'https://www.youtube-nocookie.com/embed/DdyWM2B-FYQ',
  contentUrl: 'https://www.youtube.com/live/DdyWM2B-FYQ',
  publication: {
    '@type': 'BroadcastEvent',
    isLiveBroadcast: true,
    startDate: '2026-07-14T00:00:00-05:00',
  },
  publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  contentLocation: {
    '@type': 'Place',
    name: 'Ohio Street Feeder Ramp, River North, Chicago',
    geo: { '@type': 'GeoCoordinates', latitude: 41.8935, longitude: -87.6388 },
  },
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function TrafficCamPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="cam-header container">
        <span className="tag tag-accent-2">Live · 24/7</span>
        <h1>Ohio Feeder Ramp Cam</h1>
      </header>
      <div className="container">
        <div className="cam-player">
          <CamFacade />
        </div>
      </div>
      <section className="cam-notes container">
        <p className="cam-note-1">
          Live view of the Ohio Street feeder ramp to the Kennedy Expressway, looking west from
          the south elevation of the S. Birkenstein &amp; Sons Building.
        </p>
        <p className="cam-note-2">The camera streams 24/7. Refresh the page if the stream stalls.</p>
        <p className="cam-note-3">
          Stream provided for neighborhood traffic awareness. Footage is not recorded.
        </p>
      </section>
      <section className="cam-faq container">
        <h2>Frequently asked questions</h2>
        {faqs.map((f) => (
          <div key={f.q} className="faq-item">
            <h3 className="faq-q">{f.q}</h3>
            <p className="faq-a">{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
