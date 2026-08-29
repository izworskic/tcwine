import Link from "next/link";
import venues from "@/data/venues.json";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";

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
        <Link href="/fall-color-wine-tour">Fall color wine tour</Link>
      </nav>
    </main>
  );
}
