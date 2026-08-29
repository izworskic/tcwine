import Link from "next/link";
import venues from "@/data/venues.json";
import VenueHours from "@/components/VenueHours";
import PlannerMount from "@/components/PlannerMount";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";

const OMP_SPAN = "Old Mission Peninsula is the narrow finger of land that splits Grand Traverse Bay into its east and west arms. It runs about nineteen miles north from Traverse City and is never more than three miles wide, with water visible on both sides along most of Center Road. It became Michigan's fourth federally recognized wine appellation in 1987 and is the smallest of the state's growing regions, which makes it the easier of the two peninsulas to cover in a single day. Mission Point Lighthouse stands at the tip, right on the 45th parallel, and there are public beaches and bay overlooks along the way.";
const allStops = venues.filter((v) => v.area === "old-mission");
const list = allStops.filter((v) => v.category === "winery");
const extras = allStops.filter((v) => v.category !== "winery");
const N = list.length;
const OFFICIAL = list.filter((v) => v.officialTrail?.name === "Old Mission Peninsula Wine Trail").length;

export const metadata = {
  title: "Old Mission Peninsula Winery Map: " + N + " Wineries & Route Planner",
  description:
    "Interactive Old Mission Peninsula winery map with all " + N + " wineries, real-road route planning, tasting-room hours, food notes, and Grand Traverse Bay stops.",
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
      <h1>Old Mission Peninsula Winery Map: {N} Wineries</h1>
      <p className="search-lede">
        {N} mapped wineries on Old Mission Peninsula in one interactive map, including {OFFICIAL} current official Old Mission Peninsula Wine Trail members. Start with wine, choose the wineries you want,
        then route the day up Center Road around real drive times and posted tasting-room hours.
      </p>
      <PlannerMount
        embedded
        preset={{ area: "old-mission", beverages: ["wine"], origin: "Traverse City", analyticsContext: "old_mission_map" }}
        title="Old Mission Peninsula winery map"
        description={"Showing the " + N + " wineries first. Add other tasting rooms or sights only if you want them."}
      />
      <div className="quick-answer" aria-label="Old Mission winery inventory">
        <div><strong>{N} mapped wineries</strong><span>Wine-first planning inventory</span></div>
        <div><strong>{OFFICIAL} official members</strong><span>Current Old Mission Peninsula Wine Trail membership</span></div>
        <div><strong>{N - OFFICIAL} additional producer</strong><span>Active winery outside the current official member list</span></div>
      </div>
      <RegionalPhoto kind="oldMission" />
      <p>{OMP_SPAN}</p>
      <h2>{"The " + N + " wineries"}</h2>
      <ul>
        {list.map((v) => (
          <li key={v.id}>
            <strong><Link href={`/winery/${v.id}`}>{v.name}</Link></strong>
            {v.officialTrail ? <span className="inline-trail-badge">Official trail member</span> : null}
            {v.note ? ": " + v.note : ""}
            {v.specialties && v.specialties.length ? " Known for " + v.specialties.join(", ") + "." : ""}
            {v.food ? " Food on site: " + v.food + "." : ""}
          </li>
        ))}
      </ul>
      {extras.length ? (
        <>
          <h2>Other tasting stops on Old Mission</h2>
          <p>
            The peninsula also has {extras.map((v) => v.name + " (" + v.category + ")").join(", ")}.
            They stay available in the planner, but they are not counted as wineries.
          </p>
        </>
      ) : null}
      <p>
        {"Timing a trip for the leaves? See the "}
        <Link href="/fall-color-wine-tour">fall color wine tour</Link>
        {" guide, or load a ready-made loop from the "}
        <Link href="/compare-wineries">winery comparator</Link>
        {", or load a ready-made loop from the "}<Link href="/one-day-itineraries">one-day itineraries</Link>
        {"."}
      </p>
      <VenueHours title="Old Mission Peninsula hours" areas={["old-mission"]} categories={["winery"]} />
      <AuthorNote context="Old Mission Peninsula wine country" />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/leelanau-peninsula-wine-trail">Leelanau wine trail</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link>{" \u00b7 "}<Link href="/fall-color-wine-tour">Fall color tour</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
