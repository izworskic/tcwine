import Link from "next/link";
import venues from "@/data/venues.json";
import PlannerMount from "@/components/PlannerMount";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";

const wineries = venues
  .filter((v) => v.category === "winery" && /bay|view|overlook|sunset/i.test(v.note || ""))
  .sort((a, b) => (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name));

const selected = wineries.slice(0, 5).map((v) => v.id);
const BASE = "https://tcwine.chrisizworski.com";

export const metadata = {
  title: "Best Traverse City Wineries With Views: Map & Bay Overlooks",
  description:
    "Map Traverse City wineries known for Grand Traverse Bay, vineyard, hilltop, and sunset views, then route the stops into a realistic Old Mission or Leelanau wine day.",
  alternates: { canonical: "/best-traverse-city-wineries-with-views" },
};

const GRAPH = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Traverse City wineries with notable views",
  numberOfItems: wineries.length,
  itemListElement: wineries.map((v, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: v.name,
  })),
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Best Traverse City Wineries With Views</h1>
      <p className="search-lede">
        These are the wineries whose venue notes specifically support a bay, hilltop, vineyard, overlook, or sunset-view claim.
        The map starts with five strong view-forward stops selected so you can see whether they actually fit one day.
      </p>
      <PlannerMount
        embedded
        preset={{ beverages: ["wine"], selected, origin: "Traverse City" }}
        title="Map the view-forward wineries"
        description="Five view-forward wineries are preselected. The planner will route them, check hours, and tell you if the day is too ambitious."
      />
      <RegionalPhoto kind="oldMission" compact />
      <h2>{wineries.length} wineries with a supported view note</h2>
      <ol>
        {wineries.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong> ({v.town}). {v.note}
          </li>
        ))}
      </ol>
      <p>
        Want the compact peninsula first? Use the <Link href="/old-mission-peninsula-wineries">Old Mission winery map</Link>.
        {" For a larger harbor-town day, use the "}<Link href="/leelanau-peninsula-wine-trail">Leelanau winery map</Link>.
      </p>
      <AuthorNote context="Traverse City winery-view planning" />
      <nav className="morelinks">
        More guides: <Link href="/">Winery map</Link>{" · "}
        <Link href="/traverse-city-wineries-with-food">Wineries with food</Link>{" · "}
        <Link href="/fall-color-wine-tour">Fall color wine tour</Link>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GRAPH) }} />
    </main>
  );
}
