import Link from "next/link";
import venues from "@/data/venues.json";
import origins from "@/data/origins.json";
import VenueHours from "@/components/VenueHours";
import { haversineMiles } from "@/lib/geo";

const center = origins["Suttons Bay"];
const list = venues
  .filter((v) => v.town === "Suttons Bay")
  .map((v) => ({ ...v, mi: Math.round(haversineMiles(center, { lat: v.lat, lng: v.lng }) * 10) / 10 }))
  .sort((a, b) => a.mi - b.mi);
const N = list.length;
const WALK_MI = 0.6;
const walkable = list.filter((v) => v.mi <= WALK_MI);

export const metadata = {
  title: "Suttons Bay Tasting Rooms: All " + N + " With Real Distances From the Village",
  description:
    "Every Suttons Bay tasting room with its straight-line distance from the village center, the " + walkable.length + " you can walk to, arriving by the Leelanau Trail, and verified hours.",
  alternates: { canonical: "/suttons-bay-tasting-rooms" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "Suttons Bay tasting rooms", item: "https://tcwine.chrisizworski.com/suttons-bay-tasting-rooms" },
  ],
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Suttons Bay Tasting Rooms</h1>
      <p>{walkable.length + " of Suttons Bay\u2019s " + N + " tasting rooms are a walkable " + WALK_MI + " mi or less from the village center: " + walkable.map((v) => v.name + " at " + v.mi + " mi").join(", ") + ". The rest are a short drive into the surrounding hills. Distances below are straight-line from the village center, so read them as a floor, not a route."}</p>
      <h2>{"All " + N + ", nearest first"}</h2>
      <ul>
        {list.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong>
            {": " + v.mi + " mi from the village center" + (v.mi <= WALK_MI ? " (walkable)" : "") + "."}
            {v.note ? " " + v.note.split(". ")[0] + "." : ""}
          </li>
        ))}
      </ul>
      <h2>Arriving by the Leelanau Trail</h2>
      <p>{"The Leelanau Trail runs from Traverse City to Suttons Bay, so you can ride up, taste the walkable rooms on foot, and skip the parking question entirely."}</p>
      <p>
        {"Doing the wider peninsula too? The "}
        <Link href="/leelanau-peninsula-wine-trail">Leelanau wine trail</Link>
        {" guide groups every room by harbor town."}
      </p>
      <VenueHours title="Suttons Bay hours" towns={["Suttons Bay"]} />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/leelanau-peninsula-wine-trail">Leelanau wine trail</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
