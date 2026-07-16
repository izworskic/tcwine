import Link from "next/link";
import venues from "@/data/venues.json";

const usable = venues.filter((v) => !v.needsHours);
const byRating = (a, b) => (b.rating || 0) - (a.rating || 0);

const ompLoop = usable.filter((v) => v.area === "old-mission" && v.category === "winery").sort(byRating).slice(0, 5).sort((a, b) => a.lat - b.lat);
const harborLoop = [];
for (const t of ["Suttons Bay", "Lake Leelanau", "Leland", "Northport"]) {
  const picks = usable.filter((v) => v.area === "leelanau" && v.town === t).sort(byRating);
  harborLoop.push(...picks.slice(0, t === "Suttons Bay" ? 2 : 1));
}
const cityLoop = usable.filter((v) => v.area === "traverse-city" && ["brewery", "distillery"].includes(v.category)).sort(byRating).slice(0, 4);
const viewLoop = usable.filter((v) => /bay|view|overlook/i.test(v.note || "")).sort(byRating).slice(0, 4);

const LOOPS = [
  { name: "Old Mission classic", intro: "Five wineries in tasting order up Center Road, south to north, ending near Mission Point Lighthouse.", stops: ompLoop },
  { name: "Leelanau harbor towns", intro: "Village to village along the bay side: two rooms in Suttons Bay, then one each in Lake Leelanau, Leland, and Northport.", stops: harborLoop },
  { name: "Traverse City on foot", intro: "The in-town day: breweries and distilleries close enough that the car can stay parked.", stops: cityLoop },
  { name: "Bay views", intro: "Rooms whose own notes earn the view: bay water or an overlook from the tasting room.", stops: viewLoop },
];

export const metadata = {
  title: "One-Day Traverse City Wine Itineraries: Four Ready-Made Loops",
  description:
    "Four ready-made tasting loops with real venues and honest pacing: Old Mission in order, Leelanau by harbor town, the in-town day, and the bay-view rooms.",
  alternates: { canonical: "/one-day-itineraries" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "One-day itineraries", item: "https://tcwine.chrisizworski.com/one-day-itineraries" },
  ],
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>One-Day Itineraries</h1>
      <p>{"Four ready-made loops built from the same verified data the planner uses. Each stop lists its suggested tasting time; drives add to that, and the planner times the full day against each room\u2019s real hours when you load your own picks."}</p>
      {LOOPS.map((L) => {
        const mins = L.stops.reduce((s, v) => s + (v.dwellMinutes || 60), 0);
        const hrs = Math.round(mins / 6) / 10;
        return (
          <section key={L.name}>
            <h2>{L.name}</h2>
            <p>{L.intro}</p>
            <ol>
              {L.stops.map((v) => (
                <li key={v.id}>
                  <strong>{v.name}</strong>
                  {" (" + v.town + "): about " + (v.dwellMinutes || 60) + " minutes."}
                  {v.note ? " " + v.note.split(". ")[0] + "." : ""}
                </li>
              ))}
            </ol>
            <p>{"About " + hrs + " hours of tasting time before drives."}</p>
          </section>
        );
      })}
      <p>
        {"Chasing peak leaves? The "}
        <Link href="/fall-color-wine-tour">fall color wine tour</Link>
        {" pairs these loops with the three drives at their best."}
      </p>
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/old-mission-peninsula-wineries">Old Mission wineries</Link>{" \u00b7 "}<Link href="/leelanau-peninsula-wine-trail">Leelanau wine trail</Link>{" \u00b7 "}<Link href="/fall-color-wine-tour">Fall color tour</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
