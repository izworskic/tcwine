import Link from "next/link";
import venues from "@/data/venues.json";
import VenueHours from "@/components/VenueHours";
import PlannerMount from "@/components/PlannerMount";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";

const LEE_SPAN = "Leelanau Peninsula is the larger region to the northwest, the little finger of the mitten, bounded by Lake Michigan on one side and the bay on the other. It was recognized as Michigan's second wine appellation in 1982 and its rooms are spread out among villages like Suttons Bay, Lake Leelanau, Leland, Omena, and Northport.";
const allStops = venues.filter((v) => v.area === "leelanau");
const list = allStops.filter((v) => v.category === "winery");
const extras = allStops.filter((v) => v.category !== "winery");
const N = list.length;
const TOWN_ORDER = ["Suttons Bay", "Lake Leelanau", "Leland", "Omena", "Northport", "Cedar", "Glen Arbor", "Empire", "Maple City"];
const rank = (t) => { const i = TOWN_ORDER.indexOf(t); return i < 0 ? 99 : i; };
const towns = Array.from(new Set(list.map((v) => v.town))).sort((a, b) => rank(a) - rank(b));
const sparkling = list.filter((v) => (v.specialties || []).join(" ").toLowerCase().includes("sparkling"));

export const metadata = {
  title: "Leelanau Peninsula Winery Map: " + N + " Wineries by Town",
  description:
    "Interactive Leelanau Peninsula winery map with " + N + " wineries grouped by town, real-road route planning, tasting-room hours, and sparkling-wine picks.",
  alternates: { canonical: "/leelanau-peninsula-wine-trail" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "Leelanau Peninsula wine trail", item: "https://tcwine.chrisizworski.com/leelanau-peninsula-wine-trail" },
  ],
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Leelanau Peninsula Winery Map: {N} Wineries</h1>
      <p className="search-lede">
        Map all {N} Leelanau Peninsula wineries by town, then build a route that fits the day instead of treating the peninsula as one long list.
      </p>
      <PlannerMount
        embedded
        preset={{ area: "leelanau", beverages: ["wine"], origin: "Suttons Bay" }}
        title="Leelanau Peninsula winery map"
        description={"Showing " + N + " wineries first across Suttons Bay, Lake Leelanau, Leland, Omena, Northport, and the western peninsula."}
      />
      <RegionalPhoto kind="leelanau" />
      <p>{LEE_SPAN}</p>
      {towns.map((t) => {
        const tl = list.filter((v) => v.town === t);
        return (
          <section key={t}>
            <h2>{t + " (" + tl.length + ")"}</h2>
            <ul>
              {tl.map((v) => (
                <li key={v.id}>
                  <strong>{v.name}</strong>
                  {v.note ? ": " + v.note : ""}
                  {v.food ? " Food on site: " + v.food + "." : ""}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {sparkling.length ? <p>{"For sparkling wine, start with " + sparkling.map((v) => v.name).join(", ") + "."}</p> : null}
      {extras.length ? (
        <>
          <h2>Other tasting stops on Leelanau</h2>
          <p>
            Cider, beer, and spirits remain available as optional planner layers: {extras.map((v) => v.name + " (" + v.category + ")").join(", ")}.
          </p>
        </>
      ) : null}
      <p>
        {"Staying near the village? The "}
        <Link href="/suttons-bay-tasting-rooms">Suttons Bay tasting rooms</Link>
        {" guide covers real distances and the walkable rooms, and the "}
        <Link href="/fall-color-wine-tour">fall color wine tour</Link>
        {" covers the M-22 shore drive at peak."}
      </p>
      <VenueHours title="Leelanau Peninsula winery hours" areas={["leelanau"]} categories={["winery"]} />
      <AuthorNote context="Leelanau Peninsula wine country" />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/suttons-bay-tasting-rooms">Suttons Bay rooms</Link>{" \u00b7 "}<Link href="/old-mission-peninsula-wineries">Old Mission wineries</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
