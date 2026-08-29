import Link from "next/link";
import venues from "@/data/venues.json";
import PlannerMount from "@/components/PlannerMount";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";

const SEASON_SPAN = "Late summer through fall is the classic window, when the weather is warm, the harvest is underway, and the color comes in. Summer is the busiest and liveliest stretch. Spring and early winter are quieter, with some rooms on reduced hours, which the planner accounts for when it checks each place against your date.";
const byRating = (a, b) => (b.rating || 0) - (a.rating || 0);
const ompPicks = venues.filter((v) => v.area === "old-mission").sort(byRating).slice(0, 3);
const shorePicks = venues.filter((v) => ["Suttons Bay", "Omena", "Northport"].includes(v.town)).sort(byRating).slice(0, 3);
const inlandPicks = venues.filter((v) => ["Lake Leelanau", "Cedar", "Maple City"].includes(v.town)).sort(byRating).slice(0, 3);
const viewRooms = venues.filter((v) => /bay|view|overlook/i.test(v.note || ""));

export const metadata = {
  title: "Traverse City Fall Color Winery Map: 3 Scenic Wine Routes",
  description:
    "Traverse City fall color winery map with Old Mission, M-22 Leelanau, and inland wine routes, plus view-forward wineries and a routed day planner.",
  alternates: { canonical: "/fall-color-wine-tour" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "Fall color wine tour", item: "https://tcwine.chrisizworski.com/fall-color-wine-tour" },
  ],
};

const DRIVES = [
  { name: "Center Road, M-37, up Old Mission", blurb: "Water on both sides for most of the drive, vineyards and orchards turning along the ridge, and the lighthouse at the tip.", picks: ompPicks },
  { name: "M-22 along the Leelanau shore", blurb: "The bay-side run through Suttons Bay and Omena to Northport, with the water holding the light while the hardwoods turn.", picks: shorePicks },
  { name: "M-204 and the inland cut", blurb: "Through Lake Leelanau and the interior hills, where the maples go earliest and hardest.", picks: inlandPicks },
];

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Traverse City Fall Color Winery Map</h1>
      <p className="search-lede">
        Pair peak-color driving with wineries that actually fit the day. The three useful fall routes are Old Mission&apos;s Center Road,
        the M-22 Leelanau shore, and the inland Lake Leelanau cut.
      </p>
      <PlannerMount
        embedded
        preset={{ beverages: ["wine"], poiKinds: ["scenic"], origin: "Traverse City" }}
        title="Fall color winery map"
        description="Wine is on, scenic stops are on, and the map is ready to turn a fall-color drive into a realistic tasting loop."
      />
      <RegionalPhoto kind="chateau" />
      <p>{"Color in the Grand Traverse region typically peaks from late September into mid October, with the exact week shifting year to year. Harvest runs in the same window, which is why fall is the classic time to do this."}</p>
      <p>{SEASON_SPAN}</p>
      <h2>The three drives</h2>
      {DRIVES.map((d) => (
        <section key={d.name}>
          <h3>{d.name}</h3>
          <p>{d.blurb + " Worth a stop: " + d.picks.map((v) => v.name).join(", ") + "."}</p>
        </section>
      ))}
      <h2>{"Rooms with the view (" + viewRooms.length + ")"}</h2>
      <p>{"These rooms\u2019 own notes earn the view, bay water or an overlook from the tasting room: " + viewRooms.map((v) => v.name + " (" + v.town + ")").join(", ") + "."}</p>
      <p>
        {"Pair a drive with a ready-made loop from the "}
        <Link href="/one-day-itineraries">one-day itineraries</Link>
        {", and check "}
        <Link href="/venues">verified hours</Link>
        {" before you set out; fall hours shift."}
      </p>
      <AuthorNote context="Traverse City fall-color wine planning" />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/old-mission-peninsula-wineries">Old Mission wineries</Link>{" \u00b7 "}<Link href="/leelanau-peninsula-wine-trail">Leelanau wine trail</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
