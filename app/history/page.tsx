import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The House of Birkenstein | Birken Lofts',
  description:
    'The story of 401 W. Ontario Street: built in 1905 for S. Birkenstein & Sons, one of Chicago’s largest scrap dealers, and home to a century of Smokey Hollow industry before becoming Birken Lofts.',
  alternates: { canonical: 'https://birkenlofts.com/history/' },
  openGraph: {
    title: 'The House of Birkenstein',
    description:
      'Built in 1905 for S. Birkenstein & Sons at the height of Smokey Hollow’s industrial boom — the story of the building that became Birken Lofts.',
    type: 'article',
    url: 'https://birkenlofts.com/history/',
    images: ['https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'The House of Birkenstein',
  description:
    'The history of the S. Birkenstein & Sons Building at 401 W. Ontario Street, Chicago — from 1905 scrap-trade headquarters to Birken Lofts.',
  image: 'https://birkenlofts.com/images/elevations/401-W-Ontario-No-Signs-1024w.webp',
  mainEntityOfPage: 'https://birkenlofts.com/history/',
  author: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  publisher: { '@type': 'Organization', name: 'Birken Lofts', url: 'https://birkenlofts.com' },
  about: {
    '@type': 'Place',
    name: 'S. Birkenstein & Sons Building',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '401 W. Ontario Street',
      addressLocality: 'Chicago',
      addressRegion: 'IL',
      postalCode: '60654',
      addressCountry: 'US',
    },
  },
};

export default function HistoryPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="history-header container">
        <span className="tag tag-accent">Since 1905</span>
        <h1>The House of Birkenstein</h1>
        <p className="history-lede">
          Before it held lofts, 401 W. Ontario held rags, rubber and iron &mdash; the
          headquarters of one of Chicago&rsquo;s largest scrap houses, run by a family that
          helped turn America&rsquo;s cast-offs into industry.
        </p>
      </header>
      <article className="container">
        <section className="history-row">
          <div className="history-prose">
            <h2>Smokey Hollow</h2>
            <p>
              The blocks west of Michigan Avenue weren&rsquo;t always galleries and riverwalks.
              The Near North Side grew up early as a working district: by the late 1850s the
              river and the rail lines had drawn heavy industry &mdash; the McCormick Reaper
              works among them &mdash; and Irish, German and Swedish immigrants settled the
              surrounding blocks in small frame cottages. The Great Fire of 1871 leveled it
              all; industry rebuilt along the same lines and pressed further west once the
              Northwestern railway arrived. By the turn of the century the district had a name
              that told you everything about it: Smokey Hollow, for the haze the riverside
              factories kept overhead.
            </p>
            <p>
              The east side of the neighborhood turned fashionable after Potter Palmer built
              his lakefront mansion in 1882, and the Michigan Avenue Bridge brought luxury
              shopping north in 1920. But Smokey Hollow stayed industrial deep into the
              twentieth century &mdash; until a real estate developer named Albert Friedman
              rechristened it &ldquo;River North&rdquo; in the late 1970s and began filling its
              old factories with artists and galleries.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/sanborn-map-1906.webp"
              alt="1906 Sanborn fire-insurance map showing the block bounded by Ontario and Ohio Streets"
              width={1087}
              height={1600}
            />
            <figcaption>
              The 1906 Sanborn fire-insurance map &mdash; the building at center, labeled
              &ldquo;J. Birkenstein &amp; Sons, Junk &amp; Rags.&rdquo;
            </figcaption>
          </figure>
        </section>
        <section className="history-row rev">
          <div className="history-prose">
            <h2>A rag peddler&rsquo;s empire</h2>
            <p>
              Sigmund Birkenstein was born in Kissingen, Germany, and came to America in 1857
              &mdash; Richmond first, then Hannibal, Missouri, then Chicago in 1866, where the
              city directories list him as a peddler in the rag trade. By the late 1870s he had
              a partner, Moses Kaufman, a firm &mdash; S. Birkenstein &amp; Co. &mdash; and a
              building on Kinzie Street west of the river. Within a decade he had bought
              Kaufman out. His son Louis joined in 1890, and Henry, Albert and Milton followed;
              by the time Sigmund died in 1900, the letterhead read S. Birkenstein &amp; Sons.
            </p>
            <p>
              It was a familiar arc, written large. Scrap collectors &mdash; many of them, like
              Birkenstein, Jewish immigrants from Europe &mdash; had long worked at a
              peddler&rsquo;s scale. Industrialization changed the math: America&rsquo;s mills
              wanted iron, rubber and cotton faster than the country could supply them new, and
              the dealers who could gather and grade the old stuff built substantial
              businesses.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/louis-birkenstein-1919.webp"
              alt="Portrait of Louis Birkenstein"
              width={497}
              height={741}
            />
            <figcaption>
              Louis Birkenstein, company president, in <em>The Rubber Age and Tire News</em>,
              1919.
            </figcaption>
          </figure>
        </section>
        <section className="history-row">
          <div className="history-prose">
            <h2>The house that Birkenstein built</h2>
            <p>
              Under Louis, the firm outgrew rags and paper stock and moved hard into scrap
              metal and rubber &mdash; the automobile and the modern steel industry saw to the
              demand. In 1905 the company put up a purpose-built headquarters at 401 W. Ontario
              Street: offices and shipping on the first floor, storage and baling on the
              second, sorting above. Business kept growing, and in 1912 architect H. M.
              Eichberg added a fourth story so seamlessly you have to squint to find the seam.
            </p>
            <p>
              It was a working warehouse with front-parlor manners: red face brick across eight
              bays, segmental-arch windows, a limestone sill course, brick piers trimmed with
              Prairie-style ornament and a corbeled frieze below the cornice &mdash; and inside,
              the heavy timber posts and beams that carry the building to this day.
            </p>
            <p>
              The trade press called it the House of Birkenstein, and the firm leaned into the
              name. &ldquo;Label that car to Birkenstein &amp; Sons, Chicago&rdquo; &mdash; a
              1916 advertisement claimed the phrase was in daily use among thousands of
              shippers across the country.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/hey-joe-ad-1916.webp"
              alt="1916 S. Birkenstein & Sons advertisement reading Hey Joe! Label that Car to S. Birkenstein & Sons, Chicago"
              width={392}
              height={721}
            />
            <figcaption>
              &ldquo;Hey Joe! Label that Car&rdquo; &mdash; <em>Hide and Leather</em>, February
              1916, with the building sketched at lower left.
            </figcaption>
          </figure>
        </section>
        <section className="history-row rev">
          <div className="history-prose">
            <h2>War and the scrap boom</h2>
            <p>
              America&rsquo;s entry into the First World War made scrap a strategic material,
              and by the late 1910s the waste trade was a billion-dollar industry. S.
              Birkenstein &amp; Sons opened offices in New York, Philadelphia and Minneapolis,
              and Louis Birkenstein became the industry&rsquo;s public face: tapped in 1917 to
              lead the Waste Materials Branch of the Quartermaster&rsquo;s salvage effort,
              appointed head of the Army&rsquo;s Surplus Property Division in 1919, and elected
              to four consecutive terms as president of the National Association of Waste
              Material Dealers.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/house-of-birkenstein-ad-1920.webp"
              alt="1920 advertisement showing the building above the script signature The House of Birkenstein"
              width={1087}
              height={1600}
            />
            <figcaption>
              &ldquo;The House of Birkenstein&rdquo; &mdash; <em>The Rubber Age and Tire
              News</em>, April 1920. This page takes its name from the signature.
            </figcaption>
          </figure>
        </section>
        <section className="history-solo">
          <h2>After Birkenstein</h2>
          <p>
            Success eventually moved the firm out. In 1920 S. Birkenstein &amp; Sons decamped
            to a new headquarters at North Avenue and Kingsbury Street and leased 401 W.
            Ontario to the Chicago Mill Paper Stock Company. Sanborn maps show the building as
            a cork-and-seal warehouse by mid-century, and late in the century it was carved
            into offices &mdash; its timber frame and brick walls left standing through every
            change of use.
          </p>
        </section>
        <section className="history-row">
          <div className="history-prose">
            <h2>Birken Lofts today</h2>
            <p>
              A century of industry left the building remarkably intact &mdash; its massing,
              roofline and window pattern are still the ones Smokey Hollow knew. The conversion
              to Birken Lofts carries that record forward: fifty-seven residences set among the
              original posts, beams and brick, a block from the river that started it all.
            </p>
          </div>
          <figure className="history-fig">
            <Image
              src="/images/history/timber-ceiling.webp"
              alt="Exposed heavy-timber beams and joists at the ceiling of an upper floor"
              width={1600}
              height={1143}
            />
            <figcaption>The original heavy-timber frame, still carrying the building.</figcaption>
          </figure>
        </section>
        <section className="history-cta">
          <p>See what the House of Birkenstein holds now.</p>
          <div className="history-cta-btns">
            <Link className="btn btn-primary" href="/#plans">View floor plans</Link>
            <Link className="btn btn-secondary" href="/#contact">Contact us</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
