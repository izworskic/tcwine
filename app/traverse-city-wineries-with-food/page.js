import Link from "next/link";
import venues from "@/data/venues.json";
import PlannerMount from "@/components/PlannerMount";
import AuthorNote from "@/components/AuthorNote";

const wineries = venues
  .filter((v) => v.category === "winery" && v.food)
  .sort((a, b) => {
    const rank = (value) => /restaurant|bistro|kitchen|pizza|raclette/i.test(value || "") ? 0 : 1;
    return rank(a.food) - rank(b.food) || (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name);
  });

const substantial = wineries.filter((v) => /restaurant|bistro|kitchen|pizza|raclette/i.test(v.food || ""));
const selected = substantial.slice(0, 5).map((v) => v.id);
const BASE = "https://tcwine.chrisizworski.com";

export const metadata = {
  title: "Traverse City Wineries With Food: Map, Meals & Tasting Stops",
  description:
    "Map Traverse City-area wineries with food on site, from kitchens and pizza to bistro meals and tasting snacks, then route a realistic wine day around current hours.",
  alternates: { canonical: "/traverse-city-wineries-with-food" },
};

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BASE + "/traverse-city-wineries-with-food/#page",
      url: BASE + "/traverse-city-wineries-with-food",
      name: "Traverse City Wineries With Food",
      author: { "@id": "https://chrisizworski.com/#person" },
      isPartOf: { "@id": BASE + "/#site" },
      about: { "@type": "Thing", name: "Traverse City wineries with food" },
    },
    {
      "@type": "ItemList",
      name: "Traverse City-area wineries with food on site",
      numberOfItems: wineries.length,
      itemListElement: wineries.map((v, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: v.name,
      })),
    },
  ],
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Traverse City Wineries With Food: {wineries.length} Mapped Stops</h1>
      <p className="search-lede">
        Looking for a wine day that includes an actual meal? This list separates wineries with kitchens, pizza,
        bistro-style food, raclette, and other substantial options from rooms that only offer tasting snacks.
      </p>
      <PlannerMount
        embedded
        preset={{ beverages: ["wine"], selected, origin: "Traverse City" }}
        title="Winery map with food-forward stops preloaded"
        description="Five food-forward wineries are selected as a starting point. Edit the stops, change peninsulas, or build the day around their current hours."
      />
      <h2>Best bets for more than a snack</h2>
      <ul>
        {substantial.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong> ({v.town}): {v.food}.
            {v.note ? " " + v.note : ""}
          </li>
        ))}
      </ul>
      <h2>Wineries with tasting snacks</h2>
      <p>
        {wineries.filter((v) => !substantial.includes(v)).map((v) => v.name + " (" + v.town + ")").join(", ")}.
      </p>
      <p>
        For a peninsula-first plan, open the <Link href="/old-mission-peninsula-wineries">Old Mission winery map</Link>
        {" or the "}<Link href="/leelanau-peninsula-wine-trail">Leelanau winery map</Link>.
      </p>
      <AuthorNote context="Traverse City winery and food planning" />
      <nav className="morelinks">
        More guides: <Link href="/">Winery map</Link>{" · "}
        <Link href="/best-traverse-city-wineries-with-views">Best winery views</Link>{" · "}
        <Link href="/old-mission-vs-leelanau-wineries">Old Mission vs. Leelanau</Link>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GRAPH) }} />
    </main>
  );
}
