import Link from "next/link";
import venues from "@/data/venues.json";
import PlannerMount from "@/components/PlannerMount";
import { buildVenueItemList } from "@/lib/venue-schema";
import { HOURS_VERIFIED } from "@/components/VenueHours";

const BASE = "https://tcwine.chrisizworski.com";
const INTRO = "Free tasting-day planner for Traverse City wine country. Covers 74 venues on the Old Mission and Leelanau peninsulas, routed and timed to real hours.";
const TAIL = "A few things make a tasting day go smoothly. Decide on a designated driver before you set out, or plan around one of the area shuttle services, since the loops cross open country roads.";
const REST = ["Most tasting rooms open late morning and close in the late afternoon or early evening, and hours shift with the season, so it is worth confirming with any room you are set on, especially in spring and late fall. Weekends in summer and during fall color are busy, and larger groups should call ahead for reservations. Build in a real meal rather than tasting on an empty stomach, and leave room for the views, which are a large part of why people come here. This planner maps 40 wineries along with 22 breweries, 7 distilleries, and 5 cideries, for 74 tasting venues in total across the Old Mission and Leelanau peninsulas and the Traverse City area. Late summer through fall is the classic window, when the weather is warm, the harvest is underway, and the color comes in. Summer is the busiest and liveliest stretch. Spring and early winter are quieter, with some rooms on reduced hours, which the planner accounts for when it checks each place against your date.", "Built by Chris Izworski, this is a free day planner for tasting your way across Traverse City wine country in Northern Michigan. Pick the rooms you want to visit across the Old Mission and Leelanau peninsulas, add a beach or an overlook if you like, and the planner routes your choices into one efficient loop that is timed against each place's real hours and the drive between stops. The map currently covers 74 verified venues: 40 wineries, 22 breweries, 7 distilleries, and 5 cideries. Traverse City sits near the 45th parallel, the same latitude that runs through Bordeaux, Burgundy, and the Willamette Valley. Two deep arms of Grand Traverse Bay and the broad presence of Lake Michigan moderate the climate here, which lets cool-climate grapes like Riesling, Pinot Gris, Chardonnay, and Pinot Noir ripen slowly and hold their acidity. Most visitors base themselves in Traverse City and spend a day on each peninsula.", "Old Mission Peninsula is the narrow finger of land that splits Grand Traverse Bay into its east and west arms. It runs about nineteen miles north from Traverse City and is never more than three miles wide, with water visible on both sides along most of Center Road. It became Michigan's fourth federally recognized wine appellation in 1987 and is the smallest of the state's growing regions, which makes it the easier of the two peninsulas to cover in a single day. Mission Point Lighthouse stands at the tip, right on the 45th parallel, and there are public beaches and bay overlooks along the way. Leelanau Peninsula is the larger region to the northwest, the little finger of the mitten, bounded by Lake Michigan on one side and the bay on the other. It was recognized as Michigan's second wine appellation in 1982 and its rooms are spread out among villages like Suttons Bay, Lake Leelanau, Leland, Omena, and Northport."];
const GUIDES = [{"href": "/old-mission-peninsula-wineries", "title": "Old Mission Peninsula wineries", "blurb": "all 13 rooms on the compact 1987 appellation, with food and view notes"}, {"href": "/leelanau-peninsula-wine-trail", "title": "Leelanau Peninsula wine trail", "blurb": "33 venues grouped by harbor town, plus the sparkling wine picks"}, {"href": "/traverse-city-breweries-and-distilleries", "title": "Traverse City breweries and distilleries", "blurb": "the city tasting day for mixed groups"}, {"href": "/one-day-itineraries", "title": "One-day itineraries", "blurb": "four ready-made loops you can load into the planner"}, {"href": "/group-wine-tour-planning", "title": "Group and bachelorette planning", "blurb": "shuttles, reservations, pacing, and the designated-driver question"}, {"href": "/fall-color-wine-tour", "title": "Fall color wine tour", "blurb": "peak timing, the three drives, and the rooms with bay and vineyard views"}, {"href": "/suttons-bay-tasting-rooms", "title": "Suttons Bay tasting rooms", "blurb": "all 13 with real distances from the village, the walkable two, and the Leelanau Trail arrival"}];

const W = venues.filter((v) => v.category === "winery").length;
const B = venues.filter((v) => v.category === "brewery").length;
const D = venues.filter((v) => v.category === "distillery").length;
const C = venues.filter((v) => v.category === "cidery").length;
const T = venues.length;

const FAQ = [
  {
    q: "When is the best time to visit Traverse City wine country?",
    a: "Late summer through fall is the classic window, when the weather is warm, the harvest is underway, and the color comes in. Summer is the busiest and liveliest stretch.",
  },
  {
    q: "How many wineries are in the Traverse City area?",
    a: "This planner maps " + W + " wineries along with " + B + " breweries, " + D + " distilleries, and " + C + " cideries, for " + T + " tasting venues in total across the Old Mission and Leelanau peninsulas and the Traverse City area.",
  },
  {
    q: "Do I need a designated driver for a Traverse City wine tour?",
    a: "Plan on one. Decide on a designated driver before you set out, or plan around one of the area shuttle services, since the loops cross open country roads.",
  },
  {
    q: "Do tasting rooms take reservations?",
    a: "Weekends in summer and during fall color are busy, and larger groups should call ahead. Hours shift with the season, so confirm with any room you are set on.",
  },
  {
    q: "Which peninsula should I visit first, Old Mission or Leelanau?",
    a: "Old Mission is the smaller 1987 appellation and the easier single-day loop. Leelanau is larger, with rooms spread among harbor villages. Most visitors base in Traverse City and spend a day on each.",
  },
];

export const metadata = {
  description:
    "Free tasting-day planner for Traverse City wine country: " + T + " verified venues on the Old Mission and Leelanau peninsulas, routed and timed to real hours.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Traverse City Wine Country: Plan a Tasting Loop",
    description: "Free tasting-day planner covering " + T + " verified wineries, breweries, distilleries, and cideries, routed and timed to real hours.",
    url: BASE,
    siteName: "Traverse City Wine Country Planner",
  },
};

const AREAS = [
  ["old-mission", "Old Mission Peninsula"],
  ["leelanau", "Leelanau Peninsula"],
  ["traverse-city", "Traverse City"],
  ["outer", "Farther out"],
];

function graph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": BASE + "/#site", name: "Traverse City Wine Country Planner", url: BASE },
      {
        "@type": "WebApplication",
        "@id": BASE + "/#app",
        name: "Traverse City Wine Country Planner",
        url: BASE,
        applicationCategory: "TravelApplication",
        operatingSystem: "Web",
        description: INTRO,
      },
      {
        "@type": "Person",
        name: "Chris Izworski",
        url: "https://chrisizworski.com",
        workExample: { "@id": BASE + "/#app" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      buildVenueItemList(venues),
    ],
  };
}

export default function Page() {
  return (
    <>
      <PlannerMount />
      <main className="tc-page">
        <h1>Traverse City Wine Country: Plan a Tasting Loop</h1>
        <p>{INTRO}</p>
        <h2>Guides</h2>
        <ul className="guides">
          {GUIDES.map((g, i) => (
            <li key={i}>
              <Link href={g.href}>{g.title}</Link>
              {": " + g.blurb}
            </li>
          ))}
          <li>
            <Link href="/venues">Tasting room hours</Link>
            {": all " + T + " venues in one directory, verified " + HOURS_VERIFIED}
          </li>
        </ul>
        <p>{TAIL}</p>
        {REST.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <h2>Common questions</h2>
        <dl className="faq">
          {FAQ.map((f, i) => (
            <div key={i}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
        <h2>Browse the rooms</h2>
        {AREAS.map(([key, label]) => {
          const list = venues.filter((v) => v.area === key);
          if (!list.length) return null;
          return (
            <section key={key}>
              <h3>{label + " (" + list.length + ")"}</h3>
              <p>{list.map((v) => v.name).join(", ")}</p>
            </section>
          );
        })}
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph()) }} />
    </>
  );
}
