import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Finishes | Birken Lofts',
  description:
    'Interior finish selections for Birken Lofts: Silestone charcoal soapstone counters, warm Egger flat-panel cabinetry, satin nickel hardware, and wide-plank oak floors against original brick and heavy timber.',
  alternates: { canonical: 'https://birkenlofts.com/finishes/' },
  openGraph: {
    title: 'Finishes at Birken Lofts',
    description:
      'Charcoal stone, warm cabinetry, satin nickel — the interior finish selections for Birken Lofts.',
    type: 'website',
    url: 'https://birkenlofts.com/finishes/',
    images: ['https://birkenlofts.com/images/finishes/kitchen-render.webp'],
  },
};

interface SelectionRow {
  item: string;
  product: string;
  spec?: string;
}

const kitchenRows: SelectionRow[] = [
  { item: 'Backsplash', product: 'Daltile Artigiano — Venice Statue', spec: '3" × 6"' },
  { item: 'Countertop', product: 'Silestone — Charcoal Soapstone Eternal', spec: 'Suede finish' },
  { item: 'Cabinets', product: 'Egger — Pebble Grey', spec: 'Flat-panel; handle-less uppers' },
  { item: 'Hardware', product: 'Amwell bar pulls', spec: 'Brushed satin nickel' },
  { item: 'Floor', product: 'Evolux Whisper Woods — Sevilla Oak', spec: '9" × 60" plank' },
];

const bathRows: SelectionRow[] = [
  { item: 'Countertop', product: 'MSI — Carrara Trigato', spec: 'Polished' },
  { item: 'Cabinets', product: 'Egger — Cashmere Gray' },
  { item: 'Hardware', product: 'Amwell Lawrence pulls', spec: 'Brushed satin nickel, set vertically' },
  { item: 'Floor', product: 'Roca — Limestone Blanco', spec: '12" × 24"' },
  { item: 'Wall tile', product: 'Being finalized' },
];

const fixtures = [
  {
    kicker: 'Kitchen',
    name: 'CFG Aluma',
    body: 'One-handle high-arc pulldown faucet · polished chrome',
    img: '/images/finishes/faucet-kitchen.webp',
    alt: 'CFG Aluma high-arc pulldown kitchen faucet in polished chrome',
    width: 400,
    height: 400,
  },
  {
    kicker: 'Bath',
    name: 'CFG Ember',
    body: 'One-handle low-arc bathroom faucet · polished chrome',
    img: '/images/finishes/faucet-bath.webp',
    alt: 'CFG Ember low-arc bathroom faucet in polished chrome',
    width: 514,
    height: 514,
  },
  {
    kicker: 'Bath',
    name: 'CFG showerhead',
    body: 'Four-function eco-performance showerhead · polished chrome',
    img: '/images/finishes/showerhead.webp',
    alt: 'CFG four-function eco-performance showerhead in polished chrome',
    width: 400,
    height: 400,
  },
];

function Selections({ rows }: { rows: SelectionRow[] }) {
  return (
    <ul className="fin-selections">
      {rows.map((r) => (
        <li key={r.item}>
          <span className="fin-item">{r.item}</span>
          <span className="fin-product">{r.product}</span>
          {r.spec && <span className="fin-spec">{r.spec}</span>}
        </li>
      ))}
    </ul>
  );
}

export default function FinishesPage() {
  return (
    <main>
      <header className="fin-header container">
        <span className="tag tag-accent-2">Interior finish selections</span>
        <h1>Finishes</h1>
        <p className="fin-lede">
          Warm flat-panel cabinetry and dark stone against the building&rsquo;s original brick
          and heavy timber.
        </p>
      </header>
      <div className="container">
        <figure className="fin-hero">
          <Image
            src="/images/finishes/kitchen-render.webp"
            alt="Concept rendering of a Birken Lofts kitchen: taupe flat-panel cabinets and dark stone counters beneath original timber beams and exposed brick"
            width={992}
            height={1070}
            priority
          />
          <figcaption>Concept rendering &mdash; kitchen design direction.</figcaption>
        </figure>

        <section className="fin-section">
          <span className="tag tag-accent-2">01 · Kitchen</span>
          <h2>Kitchen</h2>
          <p className="fin-blurb">
            The kitchen sets the palette: pebble-grey cabinet fronts, charcoal stone counters,
            and warm oak plank floors, sampled together against the building&rsquo;s brick.
          </p>
          <div className="fin-row">
            <Selections rows={kitchenRows} />
            <figure className="fin-fig">
              <Image
                src="/images/finishes/kitchen-board.webp"
                alt="Kitchen material board: glazed tile, charcoal stone slab, knurled satin nickel pull, and oak plank samples"
                width={540}
                height={701}
              />
              <figcaption>Kitchen material board, as sampled.</figcaption>
            </figure>
          </div>
          <figure className="fin-fig fin-fig-wide">
            <Image
              src="/images/finishes/kitchen-renders-4up.webp"
              alt="Four concept rendering studies of the kitchen cabinetry, island, and open shelving"
              width={992}
              height={1086}
            />
            <figcaption>Concept renderings &mdash; cabinetry, island and shelving studies.</figcaption>
          </figure>
        </section>

        <section className="fin-section">
          <span className="tag tag-accent-2">02 · Bath</span>
          <h2>Bath</h2>
          <p className="fin-blurb">
            Calmer and lighter than the kitchen: polished Carrara-look counters over
            cashmere-gray cabinets, with pale limestone floors.
          </p>
          <div className="fin-row">
            <Selections rows={bathRows} />
            <figure className="fin-fig">
              <Image
                src="/images/finishes/bath-board.webp"
                alt="Bath material board: polished white stone chip over large-format pale limestone tile"
                width={440}
                height={706}
              />
              <figcaption>Bath material board, as sampled.</figcaption>
            </figure>
          </div>
        </section>

        <section className="fin-section">
          <span className="tag tag-accent-2">03 · Fixtures &amp; hardware</span>
          <h2>Fixtures &amp; hardware</h2>
          <p className="fin-blurb">CFG fixtures throughout, in polished chrome.</p>
          <div className="fin-cards">
            {fixtures.map((f) => (
              <div key={f.name} className="card elev-sm">
                <div className="fin-card-media">
                  <Image src={f.img} alt={f.alt} width={f.width} height={f.height} />
                </div>
                <div className="card-kicker">{f.kicker}</div>
                <div className="card-title">{f.name}</div>
                <div className="card-body">{f.body}</div>
              </div>
            ))}
          </div>
          <p className="fin-note">
            Door levers throughout in satin nickel &mdash; final selection in review.
          </p>
        </section>

        <section className="fin-section">
          <span className="tag tag-neutral">In progress</span>
          <h2>Corridors</h2>
          <p className="fin-blurb">
            The corridors keep the industrial register: woven wool runners underfoot and black
            barn pendants along the brick.
          </p>
          <div className="fin-gallery">
            <figure className="fin-fig">
              <Image
                src="/images/finishes/corridor-mood.webp"
                alt="Corridor atmosphere study: exposed brick, timber ceiling, pendants, and a concrete bench"
                width={736}
                height={1104}
              />
              <figcaption>Corridor atmosphere study.</figcaption>
            </figure>
            <figure className="fin-fig">
              <Image
                src="/images/finishes/pendant.webp"
                alt="Industrial black barn pendant light"
                width={922}
                height={924}
              />
              <figcaption>Industrial barn pendant.</figcaption>
            </figure>
            <figure className="fin-fig">
              <Image
                src="/images/finishes/runner-herringbone.webp"
                alt="Woven wool runner sample in a natural and charcoal herringbone"
                width={801}
                height={775}
              />
              <figcaption>Woven wool runner &mdash; herringbone colorway.</figcaption>
            </figure>
            <figure className="fin-fig">
              <Image
                src="/images/finishes/runner-stripe.webp"
                alt="Woven wool runner sample in a natural and charcoal stripe"
                width={798}
                height={805}
              />
              <figcaption>Woven wool runner &mdash; stripe colorway.</figcaption>
            </figure>
          </div>
        </section>

        <section className="fin-section">
          <span className="tag tag-neutral">In progress</span>
          <h2>Paint</h2>
          <p className="fin-blurb">Sheens are set; colors follow with the lighting package.</p>
          <table className="fin-sheen">
            <thead>
              <tr>
                <th>Surface</th>
                <th>Sheen</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Doors, base &amp; case</td>
                <td>Semi-gloss</td>
              </tr>
              <tr>
                <td>Bathroom walls</td>
                <td>Satin</td>
              </tr>
              <tr>
                <td>Unit walls</td>
                <td>Eggshell</td>
              </tr>
              <tr>
                <td>Ceilings</td>
                <td>Flat</td>
              </tr>
            </tbody>
          </table>
        </section>

        <p className="fin-disclaimer">
          Selections shown reflect the current design direction and are subject to change.
        </p>

        <section className="history-cta">
          <p>Want these finishes under your own timber beams?</p>
          <div className="history-cta-btns">
            <Link className="btn btn-primary" href="/#contact">Join the interest list</Link>
            <Link className="btn btn-secondary" href="/#plans">View floor plans</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
