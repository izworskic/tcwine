import Link from "next/link";
import AuthorNote from "@/components/AuthorNote";
import WineDataDeskExplorer from "@/components/WineDataDeskExplorer";
import WineDataDeskActions from "@/components/WineDataDeskActions";
import { getWineDataDesk } from "@/lib/wine-data-desk";

const BASE = "https://tcwine.chrisizworski.com";
const data = getWineDataDesk();
const topGrapes = data.grapes.slice(0, 8);
const maxGrapeCount = Math.max(...topGrapes.map((item) => item.count), 1);

export const metadata = {
  title: `Traverse City Wine Country Data: ${data.summary.wineries} Wineries, Grapes & Geography`,
  description: `Original Traverse City wine-country data covering ${data.summary.wineries} mapped winery/tasting-room locations, verified grape coverage, Old Mission vs. Leelanau geography, towns, food signals, and downloadable research data.`,
  alternates: { canonical: "/wine-country-data" },
  openGraph: {
    title: `Traverse City Wine Country Data: ${data.summary.wineries} Wineries, Grapes & Geography`,
    description: "Original, downloadable research from the production Traverse City Winery Map dataset.",
    url: BASE + "/wine-country-data",
    type: "article",
  },
};

function percent(value, total) {
  return Math.round((value / total) * 100);
}

function graph() {
  const pageUrl = BASE + "/wine-country-data";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Dataset",
        "@id": pageUrl + "#dataset",
        name: "Traverse City Wine Country Data Desk",
        description: data.directoryDefinition,
        url: pageUrl,
        dateModified: data.updated,
        creator: { "@id": "https://chrisizworski.com/#person" },
        publisher: { "@id": "https://chrisizworski.com/#person" },
        spatialCoverage: {
          "@type": "Place",
          name: "Traverse City wine country, Michigan",
        },
        variableMeasured: [
          "Mapped winery/tasting-room locations",
          "Winery area and town",
          "Source-backed winery varietals",
          "Official wine-trail metadata",
          "Planning food and view signals",
          "Straight-line winery geography",
        ],
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "text/csv",
            contentUrl: BASE + "/api/data-desk/wineries.csv",
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/geo+json",
            contentUrl: BASE + "/api/data-desk/wineries.geojson",
          },
          {
            "@type": "DataDownload",
            encodingFormat: "application/json",
            contentUrl: BASE + "/api/data-desk/snapshot.json",
          },
        ],
      },
      {
        "@type": "Article",
        "@id": pageUrl + "#article",
        headline: `Traverse City Wine Country Data: ${data.summary.wineries} Wineries, Grapes & Geography`,
        dateModified: data.updated,
        mainEntity: { "@id": pageUrl + "#dataset" },
        author: { "@id": "https://chrisizworski.com/#person" },
        publisher: { "@id": "https://chrisizworski.com/#person" },
        isAccessibleForFree: true,
      },
      {
        "@type": "Person",
        "@id": "https://chrisizworski.com/#person",
        name: "Chris Izworski",
        url: "https://chrisizworski.com/chris-izworski/",
      },
    ],
  };
}

export default function WineCountryDataPage() {
  const oldMission = data.geography.oldMission;
  const leelanau = data.geography.leelanau;

  return (
    <main className="tc-page data-desk-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Traverse City Wine Country</Link><span>›</span><span>Data Desk</span>
      </nav>

      <p className="data-kicker">Wine Country Data Desk · original research</p>
      <h1>Traverse City Wine Country Data: {data.summary.wineries} Wineries, Grapes &amp; Geography</h1>
      <p className="search-lede">
        A citation-ready research view of the same production data that powers the winery map and route planner:
        current mapped winery locations, source-backed grape coverage, official-trail metadata, geography, food and view signals,
        plus downloadable CSV, GeoJSON, and JSON.
      </p>

      <div className="data-hero-stats" aria-label="Wine Country Data Desk headline statistics">
        <div><strong>{data.summary.wineries}</strong><span>mapped winery / tasting-room locations</span></div>
        <div><strong>{data.summary.leelanau} / {data.summary.oldMission}</strong><span>Leelanau / Old Mission records</span></div>
        <div><strong>{data.summary.varietalVerifiedWineries}</strong><span>wineries with source-backed varietal lists</span></div>
        <div><strong>{data.geography.ratios.northSouthSpread}×</strong><span>Leelanau vs. Old Mission north-south spread</span></div>
      </div>

      <WineDataDeskActions count={data.summary.wineries} updated={data.updated} />

      <p className="data-freshness">
        Dataset reviewed <strong>{data.updated}</strong>. Counts are derived from the live structured dataset at build time rather than copied into this page.
      </p>

      <section className="data-findings" aria-labelledby="findings-title">
        <div className="data-section-head">
          <div>
            <p className="data-kicker">What the dataset says</p>
            <h2 id="findings-title">Five findings worth citing</h2>
          </div>
        </div>

        <div className="data-finding-grid">
          <article>
            <span>01</span>
            <h3>Leelanau is a much larger geographic wine day</h3>
            <p>
              The mapped Leelanau winery set spans <strong>{leelanau.northSouthMiles} straight-line miles</strong> north to south,
              versus <strong>{oldMission.northSouthMiles} miles</strong> for Old Mission. Its median winery-pair separation is
              {" "}<strong>{leelanau.medianPairMiles} miles</strong> versus <strong>{oldMission.medianPairMiles} miles</strong>.
            </p>
          </article>

          <article>
            <span>02</span>
            <h3>Chardonnay and Riesling lead the verified grape set</h3>
            <p>
              Among the {data.summary.varietalVerifiedWineries} wineries with structured source-backed varietal lists,
              Chardonnay appears at <strong>{data.grapes.find((g) => g.name === "Chardonnay")?.count || 0}</strong> and Riesling at
              {" "}<strong>{data.grapes.find((g) => g.name === "Riesling")?.count || 0}</strong>, followed by Pinot Noir at
              {" "}<strong>{data.grapes.find((g) => g.name === "Pinot Noir")?.count || 0}</strong>.
            </p>
          </article>

          <article>
            <span>03</span>
            <h3>The winery directory is not the same thing as trail membership</h3>
            <p>
              <strong>{data.summary.officialTrailMembersMapped} of {data.summary.wineries}</strong> winery-category records currently carry
              official wine-trail metadata in this dataset. The rest can still be active geographic winery records. Association membership
              and directory inclusion answer different questions.
            </p>
          </article>

          <article>
            <span>04</span>
            <h3>Food is common, but a full meal is not</h3>
            <p>
              <strong>{data.summary.anyFoodSignal}</strong> winery records carry some food or pairing signal, while only
              {" "}<strong>{data.summary.mealPrograms}</strong> are tagged with a more meal-oriented pizza, kitchen, bistro, or raclette program.
              These are planning descriptors, not a guarantee of service on a specific date.
            </p>
          </article>

          <article>
            <span>05</span>
            <h3>Verified grape coverage is intentionally incomplete</h3>
            <p>
              The structured varietal layer currently covers <strong>{data.summary.varietalCoveragePercent}%</strong> of mapped wineries.
              That restraint is deliberate: a winery is not counted for a grape unless the dataset stores a producer-level source,
              source label, and verification date.
            </p>
          </article>
        </div>
      </section>

      <section className="data-grapes" aria-labelledby="grape-data-title">
        <div className="data-section-head">
          <div>
            <p className="data-kicker">Source-backed grape data</p>
            <h2 id="grape-data-title">Most represented verified varietals</h2>
          </div>
          <strong>{data.summary.varietalVerifiedWineries} verified winery lists</strong>
        </div>
        <p>
          This chart uses only the source-backed varietal subset. It does <strong>not</strong> imply that wineries without structured
          varietal records do not make these wines.
        </p>
        <div className="data-bar-list">
          {topGrapes.map((item) => (
            <div className="data-bar-row" key={item.name}>
              <div><span>{item.name}</span><strong>{item.count}</strong></div>
              <div className="data-bar-track" aria-label={item.name + ": " + item.count + " verified wineries"}>
                <span style={{ width: percent(item.count, maxGrapeCount) + "%" }} />
              </div>
            </div>
          ))}
        </div>
        <p className="data-method-note">
          Structured varietal sources currently represented: {data.grapeSources.map((item) => `${item.name} (${item.count})`).join(" · ")}.
        </p>
      </section>

      <section className="data-geography" aria-labelledby="geography-title">
        <div className="data-section-head">
          <div>
            <p className="data-kicker">Original geographic analysis</p>
            <h2 id="geography-title">Old Mission vs. Leelanau, measured</h2>
          </div>
          <Link href="/old-mission-vs-leelanau-wineries">Open the trip-planning comparison →</Link>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Measure</th><th>Old Mission</th><th>Leelanau</th></tr>
            </thead>
            <tbody>
              <tr><td>Mapped wineries</td><td>{oldMission.count}</td><td>{leelanau.count}</td></tr>
              <tr><td>North-south spread</td><td>{oldMission.northSouthMiles} mi</td><td>{leelanau.northSouthMiles} mi</td></tr>
              <tr><td>Median winery-pair separation</td><td>{oldMission.medianPairMiles} mi</td><td>{leelanau.medianPairMiles} mi</td></tr>
              <tr><td>Median nearest-neighbor separation</td><td>{oldMission.medianNearestMiles} mi</td><td>{leelanau.medianNearestMiles} mi</td></tr>
              <tr><td>Median distance from Traverse City</td><td>{oldMission.medianFromTraverseCityMiles} mi</td><td>{leelanau.medianFromTraverseCityMiles} mi</td></tr>
              <tr><td>Maximum winery-pair separation</td><td>{oldMission.maxPairMiles} mi</td><td>{leelanau.maxPairMiles} mi</td></tr>
            </tbody>
          </table>
        </div>
        <p className="data-method-note">{data.geographyDefinition}</p>
      </section>

      <section className="data-towns" aria-labelledby="town-title">
        <div className="data-section-head">
          <div>
            <p className="data-kicker">Directory distribution</p>
            <h2 id="town-title">Winery records by listed town</h2>
          </div>
          <strong>{data.summary.towns} town labels</strong>
        </div>
        <div className="data-town-grid">
          {data.towns.map((item) => (
            <div key={item.name}><strong>{item.count}</strong><span>{item.name}</span></div>
          ))}
        </div>
        <p className="data-method-note">
          Town is the venue&apos;s listed town/mailing locality. It should not be read as a precise measure of tasting-room clustering.
        </p>
      </section>

      <WineDataDeskExplorer records={data.records} grapes={data.grapes} />

      <section className="data-methodology" aria-labelledby="method-title">
        <div className="data-section-head">
          <div>
            <p className="data-kicker">Methodology</p>
            <h2 id="method-title">What these numbers mean</h2>
          </div>
        </div>

        <div className="data-method-grid">
          <div>
            <h3>Directory count</h3>
            <p>{data.directoryDefinition}</p>
          </div>
          <div>
            <h3>Varietal count</h3>
            <p>{data.varietalDefinition}</p>
          </div>
          <div>
            <h3>Geographic measures</h3>
            <p>{data.geographyDefinition}</p>
          </div>
          <div>
            <h3>Food and view signals</h3>
            <p>
              Food and view fields are route-planning descriptors maintained in the planner. They summarize the kind of stop a visitor
              can expect, but they are not restaurant-service promises, accessibility claims, or independent quality ratings.
            </p>
          </div>
        </div>

        <p>
          Official membership references are checked against the{" "}
          <a href="https://www.ompwinetrail.com/" target="_blank" rel="noopener noreferrer">Old Mission Peninsula Wine Trail</a>
          {" "}and{" "}
          <a href="https://lpwines.com/wine-trail-map/" target="_blank" rel="noopener noreferrer">Leelanau Peninsula Wine Trail</a>.
          Producer and regional sources are retained at record level where the structured dataset uses them.
        </p>
      </section>

      <section className="data-citation" aria-labelledby="citation-title">
        <p className="data-kicker">For journalists, publishers &amp; researchers</p>
        <h2 id="citation-title">Use the data, then cite the source</h2>
        <p>
          The CSV, GeoJSON, and JSON snapshot are free to inspect and use. Suggested attribution:
          {" "}<strong>Traverse City Wine Country Data Desk by Chris Izworski</strong>, linked to this page.
          The downloads remain noindex so the canonical research surface is this page rather than a machine-readable duplicate.
        </p>
        <WineDataDeskActions count={data.summary.wineries} updated={data.updated} />
        <p>
          Need an embeddable visitor map instead? <Link href="/for-publishers">Open the free publisher kit</Link>.
        </p>
      </section>

      <section className="data-deeper" aria-labelledby="deeper-title">
        <h2 id="deeper-title">Turn the research back into a wine day</h2>
        <div className="data-deeper-grid">
          <Link href="/">Interactive winery map &amp; route planner</Link>
          <Link href="/compare-wineries">Compare wineries</Link>
          <Link href="/wine/cabernet-franc">Cabernet Franc wineries</Link>
          <Link href="/wine/pinot-noir">Pinot Noir wineries</Link>
          <Link href="/wine/chardonnay">Chardonnay wineries</Link>
          <Link href="/wine/riesling">Riesling wineries</Link>
          <Link href="/wine-country-now">Wine Country Now</Link>
        </div>
      </section>

      <AuthorNote context="Traverse City wine-country data" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph()) }} />
    </main>
  );
}
