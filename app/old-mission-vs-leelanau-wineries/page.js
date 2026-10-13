import Link from "next/link";
import venues from "@/data/venues.json";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";
import DrivingReality from "@/components/DrivingReality";

const oldMission = venues.filter((v) => v.area === "old-mission" && v.category === "winery");
const leelanau = venues.filter((v) => v.area === "leelanau" && v.category === "winery");

export const metadata = {
  title: "Old Mission vs Leelanau Wineries: Which Peninsula Should You Pick?",
  description:
    "Compare Old Mission and Leelanau wineries by count, driving shape, towns, scenery, and day-planning difficulty, with direct links into each interactive winery map.",
  alternates: { canonical: "/old-mission-vs-leelanau-wineries" },
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Old Mission vs. Leelanau Wineries: Which Peninsula Fits Your Day?</h1>
      <p className="search-lede">
        Pick Old Mission when you want a compact, easy-to-sequence winery day from Traverse City. Pick Leelanau when the villages,
        shoreline, and a broader road trip matter as much as the tasting rooms.
      </p>
      <div className="quick-answer">
        <div><strong>{oldMission.length} wineries</strong><span>Old Mission · narrow peninsula · simplest one-day loop</span></div>
        <div><strong>{leelanau.length} wineries</strong><span>Leelanau · larger region · best by town or sub-loop</span></div>
        <div><strong>One rule</strong><span>Do not try to cover both peninsulas in one tasting day</span></div>
      </div>
      <RegionalPhoto kind="chateau" compact />
      <h2>Old Mission Peninsula</h2>
      <p>
        Old Mission runs north from Traverse City along a narrow ridge between East and West Grand Traverse Bay.
        The wineries are comparatively close together, so drive time is easier to control and a first-time visitor can build a coherent
        half-day or full-day route without much backtracking.
      </p>
      <p><Link className="page-cta" href="/old-mission-peninsula-wineries">Open the Old Mission winery map →</Link></p>
      <h2>Leelanau Peninsula</h2>
      <p>
        Leelanau is a much larger landscape. The wineries spread through Suttons Bay, Lake Leelanau, Leland, Omena, Northport,
        Cedar, Glen Arbor, and the inland hills. The practical move is to choose a town cluster or one side of the peninsula rather
        than chase a greatest-hits list across the whole region.
      </p>
      <RegionalPhoto kind="leelanau" compact />
      <p><Link className="page-cta" href="/leelanau-peninsula-wine-trail">Open the Leelanau winery map →</Link></p>
      <DrivingReality />
      <section className="wine-v5" aria-labelledby="visit-choice">
        <p className="wine-v5-kicker">A frequent Michigan wine visitor's perspective</p>
        <h2 id="visit-choice">How we'd choose for a real day</h2>
        <p>When we visit Michigan wine country, we want the wine to lead, but we leave room for a good meal and the unexpected stop that makes a trip memorable. The wrong choice is rarely a bad winery. It's usually a beautiful destination paired with a day that spends too much time in the car.</p>
        <h3>If you have a short afternoon from Traverse City</h3>
        <p>Choose Old Mission. Stay on the peninsula, visit two or three tasting rooms, and save the lighthouse or an overlook for the end if time allows. The small geographic footprint is the advantage, not a claim that its wines are better.</p>
        <h3>If you are staying around Suttons Bay or Lake Leelanau</h3>
        <p>Choose Leelanau. This is where a village, a lakeshore road, and a favorite wine style can shape the day. Don't assume that a winery near Northport and another near Glen Arbor are a short hop because both are labeled “Leelanau.”</p>
        <h3>If the wine style matters more than the map</h3>
        <p>Start with the <Link href="/wine/riesling">Riesling evidence guide</Link>, <Link href="/wine/sparkling">sparkling-wine guide</Link>, or <Link href="/wine/cabernet-franc">Cabernet Franc guide</Link>. Build your route around the actual producing wineries, not a generic “best wineries” list.</p>
        <p><strong>Inventory distinction:</strong> The <a href="https://www.ompwinetrail.com/wineries/">official Old Mission trail</a> currently lists ten members; this independent map includes {oldMission.length} mapped wineries. Trail membership and geographic inventory are not interchangeable. Verify the date and operating hours in the planner.</p>
      </section>
      <p>
        Want the full underlying research? <Link href="/wine-country-data">Open the Wine Country Data Desk</Link> for downloadable
        winery records, source-backed grape counts, methodology, and the complete geographic comparison.
      </p>
      <h2>Quick decision</h2>
      <ul>
        <li><strong>First wine day:</strong> Old Mission.</li>
        <li><strong>Most variety and exploration:</strong> Leelanau.</li>
        <li><strong>Shortest driving:</strong> Old Mission.</li>
        <li><strong>Harbor towns and M-22:</strong> Leelanau.</li>
        <li><strong>Trying to do both:</strong> split them into separate days.</li>
      </ul>
      <AuthorNote context="Old Mission and Leelanau wine-trip planning" />
      <nav className="morelinks">
        More guides: <Link href="/">Traverse City winery map</Link>{" · "}
        <Link href="/one-day-itineraries">One-day itineraries</Link>{" · "}
        <Link href="/fall-color-wine-tour">Fall color wine tour</Link>{" · "}\n        <Link href="/wine-country-data">Wine Country Data Desk</Link>
      </nav>
    </main>
  );
}
