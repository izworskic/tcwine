import Link from "next/link";
import venues from "@/data/venues.json";
import VenueHours from "@/components/VenueHours";

const OMP_SPAN = "Old Mission Peninsula is the narrow finger of land that splits Grand Traverse Bay into its east and west arms. It runs about nineteen miles north from Traverse City and is never more than three miles wide, with water visible on both sides along most of Center Road. It became Michigan's fourth federally recognized wine appellation in 1987 and is the smallest of the state's growing regions, which makes it the easier of the two peninsulas to cover in a single day. Mission Point Lighthouse stands at the tip, right on the 45th parallel, and there are public beaches and bay overlooks along the way.";
const list = venues.filter((v) => v.area === "old-mission");
const N = list.length;

export const metadata = {
  title: "Old Mission Peninsula Wineries: All " + N + " Tasting Rooms, With Notes and Hours",
  description:
    "Every tasting room on Old Mission Peninsula, the compact 1987 appellation north of Traverse City: what each room does best, food on site, and verified hours.",
  alternates: { canonical: "/old-mission-peninsula-wineries" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "Old Mission Peninsula wineries", item: "https://tcwine.chrisizworski.com/old-mission-peninsula-wineries" },
  ],
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Old Mission Peninsula Wineries</h1>
      <p>{"All " + N + " tasting rooms on Old Mission Peninsula sit along one road. Center Road, M-37, runs the length of the peninsula from Traverse City to Mission Point Lighthouse, so an Old Mission day is a straight out-and-back you can taste in order."}</p>
      <p>{OMP_SPAN}</p>
      <h2>{"The " + N + " rooms"}</h2>
      <ul>
        {list.map((v) => (
          <li key={v.id}>
            <strong>{v.name}</strong>
            {v.note ? ": " + v.note : ""}
            {v.specialties && v.specialties.length ? " Known for " + v.specialties.join(", ") + "." : ""}
            {v.food ? " Food on site: " + v.food + "." : ""}
          </li>
        ))}
      </ul>
      <p>
        {"Timing a trip for the leaves? See the "}
        <Link href="/fall-color-wine-tour">fall color wine tour</Link>
        {" guide, or load a ready-made loop from the "}
        <Link href="/one-day-itineraries">one-day itineraries</Link>
        {"."}
      </p>
      <VenueHours title="Old Mission Peninsula hours" areas={["old-mission"]} />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/leelanau-peninsula-wine-trail">Leelanau wine trail</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link>{" \u00b7 "}<Link href="/fall-color-wine-tour">Fall color tour</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
