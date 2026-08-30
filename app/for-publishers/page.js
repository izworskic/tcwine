import Link from "next/link";
import venues from "@/data/venues.json";
import wineTruth from "@/data/wine-truth.json";
import PublisherKit from "@/components/PublisherKit";
import partners from "@/data/publisher-partners.json";

const wineries = venues.filter((v) => v.category === "winery");
const oldMission = wineries.filter((v) => v.area === "old-mission").length;
const leelanau = wineries.filter((v) => v.area === "leelanau").length;
const traverseCity = wineries.filter((v) => v.area === "traverse-city").length;

export const metadata = {
  title: "Free Traverse City Winery Map Embed for Publishers",
  description: "Free embeddable Traverse City winery map and current machine-readable directory data for travel publishers, hotels, lodging sites, and trip planners.",
  robots: { index: false, follow: true },
};

export default function ForPublishersPage() {
  return (
    <main className="tc-page publisher-page">
      <p className="publisher-eyebrow">For publishers, hotels, lodging sites &amp; local guides</p>
      <h1>Use the Traverse City Winery Map on your site</h1>
      <p className="search-lede">
        A free embeddable map of {wineries.length} current winery/tasting-room locations across greater Traverse City wine country,
        maintained as part of the <Link href="/">Traverse City Winery Map &amp; Wine Tour Planner</Link>.
      </p>

      <div className="quick-answer">
        <div><strong>{oldMission} mapped locations</strong><span>Old Mission Peninsula</span></div>
        <div><strong>{leelanau} mapped locations</strong><span>Leelanau Peninsula</span></div>
        <div><strong>{traverseCity} mapped locations</strong><span>Traverse City</span></div>
      </div>

      <p>
        These are <strong>mapped winery/tasting-room locations in this directory</strong>, not association membership counts.
        The Old Mission Peninsula Wine Trail and Leelanau Peninsula Wine Trail publish their own member lists, which can differ from
        a geographic directory. The current editorial dataset was reviewed on {wineTruth.updated}.
      </p>

      <PublisherKit />

      <h2>Partner-specific map examples</h2>
      <p>
        Lodging and visitor organizations can use a version centered on their own starting point. These remain noindex utility embeds.
      </p>
      <div className="partner-embed-links">
        {partners.map((partner) => (
          <a key={partner.slug} href={"/embed/partner/" + partner.slug} target="_blank" rel="noopener">
            {partner.shortName}: preview guest wine map →
          </a>
        ))}
      </div>
      <p>
        Wineries can use a nearby-winery mini map centered on their tasting room. Example:{" "}
        <a href="/embed/winery/chateau-chantal" target="_blank" rel="noopener">Chateau Chantal + nearby wineries</a>.
      </p>

      <h2>Need citation-ready research?</h2>
      <p>
        The <Link href="/wine-country-data">Wine Country Data Desk</Link> publishes the directory counts, source-backed grape coverage,
        Old Mission-vs.-Leelanau geographic analysis, methodology, and richer CSV/GeoJSON/JSON research exports on one canonical page.
      </p>

      <h2>How to cite the map</h2>
      <p>
        Suggested credit: <strong>Traverse City Winery Map by Chris Izworski</strong>, with a link to
        {" "}<Link href="/">https://tcwine.chrisizworski.com/</Link>.
      </p>
      <p>
        The full planner adds real-road route ordering, tasting-room timing, winery comparison, current wine-country intelligence,
        and saved/shared wine days. The publisher embed intentionally stays simple and fast.
      </p>

      <h2>Directory methodology</h2>
      <ul>
        <li>Only records categorized as wineries are included in the publisher export.</li>
        <li>Each record uses the planner&apos;s current name, town, peninsula/area, coordinates, source website when available, and canonical winery page.</li>
        <li>The export is regenerated from the production dataset, so it stays aligned with the planner.</li>
        <li>Association membership and geographic directory inclusion are treated as different concepts.</li>
      </ul>

      <p className="publisher-official-links">
        Official trail references:{" "}
        <a href="https://www.ompwinetrail.com/" target="_blank" rel="noopener">Old Mission Peninsula Wine Trail</a>
        {" · "}
        <a href="https://lpwines.com/wine-trail-map/" target="_blank" rel="noopener">Leelanau Peninsula Wine Trail</a>
      </p>
    </main>
  );
}
