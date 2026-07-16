import Link from "next/link";
import venues from "@/data/venues.json";
import VenueHours from "@/components/VenueHours";

const LEE_SPAN = "Leelanau Peninsula is the larger region to the northwest, the little finger of the mitten, bounded by Lake Michigan on one side and the bay on the other. It was recognized as Michigan's second wine appellation in 1982 and its rooms are spread out among villages like Suttons Bay, Lake Leelanau, Leland, Omena, and Northport.";
const list = venues.filter((v) => v.area === "leelanau");
const N = list.length;
const TOWN_ORDER = ["Suttons Bay", "Lake Leelanau", "Leland", "Omena", "Northport", "Cedar", "Glen Arbor", "Empire", "Maple City"];
const rank = (t) => { const i = TOWN_ORDER.indexOf(t); return i < 0 ? 99 : i; };
const towns = Array.from(new Set(list.map((v) => v.town))).sort((a, b) => rank(a) - rank(b));
const sparkling = list.filter((v) => (v.specialties || []).join(" ").toLowerCase().includes("sparkling"));

export const metadata = {
  title: "Leelanau Peninsula Wine Trail: " + N + " Tasting Rooms by Harbor Town",
  description:
    "The Leelanau Peninsula wine trail, grouped the way you actually drive it: every tasting room by harbor town, the sparkling wine picks, and verified hours.",
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
      <h1>Leelanau Peninsula Wine Trail</h1>
      <p>{"The Leelanau Peninsula holds " + N + " tasting rooms, and the practical way to plan them is by harbor town rather than as one long list. Pick a village or two, taste what is close, and save the rest for another day."}</p>
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
      <p>
        {"Staying near the village? The "}
        <Link href="/suttons-bay-tasting-rooms">Suttons Bay tasting rooms</Link>
        {" guide covers real distances and the walkable rooms, and the "}
        <Link href="/fall-color-wine-tour">fall color wine tour</Link>
        {" covers the M-22 shore drive at peak."}
      </p>
      <VenueHours title="Leelanau Peninsula hours" areas={["leelanau"]} />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/suttons-bay-tasting-rooms">Suttons Bay rooms</Link>{" \u00b7 "}<Link href="/old-mission-peninsula-wineries">Old Mission wineries</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
