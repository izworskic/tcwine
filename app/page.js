import Link from "next/link";
import venues from "@/data/venues.json";
import PlannerMount from "@/components/PlannerMount";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";
import WineCountryWorld from "@/components/WineCountryWorld";
import WineDayComposer from "@/components/WineDayComposer";
import { buildVenueItemList } from "@/lib/venue-schema";
import { HOURS_VERIFIED } from "@/components/VenueHours";

const BASE = "https://tcwine.chrisizworski.com";
const INTRO = "Interactive Traverse City winery map with 40 wineries across Old Mission Peninsula, Leelanau Peninsula, and Traverse City. Pick your stops on the map, then route the day on real roads and check it against posted hours.";
const TAIL = "A few things make a tasting day go smoothly. Decide on a designated driver before you set out, or plan around one of the area shuttle services, since the loops cross open country roads.";
const REST = ["Most tasting stops open late morning and close in the late afternoon or early evening, and hours shift with the season, so it is worth confirming any stop you are set on, especially in spring and late fall. Weekends in summer and during fall color are busy, and larger groups should call ahead for reservations. Build in a real meal rather than tasting on an empty stomach, and leave time for the views, which are a large part of why people come here. This planner maps 40 wineries along with 22 breweries, 7 distilleries, and 5 cideries, for 74 tasting venues in total across the Old Mission and Leelanau peninsulas and the Traverse City area. Late summer through fall is the classic window, when the weather is warm, the harvest is underway, and the color comes in. Summer is the busiest and liveliest stretch. Spring and early winter are quieter, with some places on reduced hours, which the planner accounts for when it checks each place against your date.", "Built by Chris Izworski, this is a free day planner for tasting your way across Traverse City wine country in Northern Michigan. Pick the places you want to visit across the Old Mission and Leelanau peninsulas, add a beach or an overlook if you like, and the planner routes your choices into one efficient loop that is timed against each place's real hours and the drive between stops. The map currently covers 74 verified venues: 40 wineries, 22 breweries, 7 distilleries, and 5 cideries. Traverse City sits near the 45th parallel, the same latitude that runs through Bordeaux, Burgundy, and the Willamette Valley. Two deep arms of Grand Traverse Bay and the broad presence of Lake Michigan moderate the climate here, which lets cool-climate grapes like Riesling, Pinot Gris, Chardonnay, and Pinot Noir ripen slowly and hold their acidity. Most visitors base themselves in Traverse City and spend a day on each peninsula.", "Old Mission Peninsula is the narrow finger of land that splits Grand Traverse Bay into its east and west arms. It runs about nineteen miles north from Traverse City and is never more than three miles wide, with water visible on both sides along most of Center Road. It became Michigan's fourth federally recognized wine appellation in 1987 and is the smallest of the state's growing regions, which makes it the easier of the two peninsulas to cover in a single day. Mission Point Lighthouse stands at the tip, right on the 45th parallel, and there are public beaches and bay overlooks along the way. Leelanau Peninsula is the larger region to the northwest, the little finger of the mitten, bounded by Lake Michigan on one side and the bay on the other. It was recognized as Michigan's second wine appellation in 1982 and its wineries and cideries are spread out among villages like Suttons Bay, Lake Leelanau, Leland, Omena, and Northport."];
const GUIDES = [{"href": "/old-mission-peninsula-wineries", "title": "Old Mission Peninsula winery map", "blurb": "all 11 wineries on the compact peninsula, prefiltered on the interactive map"}, {"href": "/leelanau-peninsula-wine-trail", "title": "Leelanau Peninsula winery map", "blurb": "27 wineries grouped by harbor town and loaded into the peninsula map"}, {"href": "/traverse-city-breweries-and-distilleries", "title": "Traverse City breweries and distilleries", "blurb": "the city tasting day for mixed groups"}, {"href": "/one-day-itineraries", "title": "One-day itineraries", "blurb": "four ready-made loops you can load into the planner"}, {"href": "/group-wine-tour-planning", "title": "Group and bachelorette planning", "blurb": "shuttles, reservations, pacing, and the designated-driver question"}, {"href": "/fall-color-wine-tour", "title": "Fall color wine tour", "blurb": "peak timing, the three drives, and the stops with bay and vineyard views"}, {"href": "/suttons-bay-tasting-rooms", "title": "Suttons Bay tasting stops", "blurb": "13 places to taste with real distances from the village, the walkable two, and the Leelanau Trail arrival"}, {"href": "/old-mission-vs-leelanau-wineries", "title": "Old Mission vs. Leelanau", "blurb": "which peninsula fits a first day, a scenic road trip, or the shortest drive"}, {"href": "/traverse-city-wineries-with-food", "title": "Wineries with food", "blurb": "28 wineries with on-site food, separated into meal-worthy stops and tasting snacks"}, {"href": "/best-traverse-city-wineries-with-views", "title": "Wineries with the best views", "blurb": "view-forward wineries with supported bay, hilltop, vineyard, or sunset notes"}];

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
    q: "Do wineries take reservations?",
    a: "Weekends in summer and during fall color are busy, and larger groups should call ahead. Hours shift with the season, so confirm any stop you are set on.",
  },
  {
    q: "Which peninsula should I visit first, Old Mission or Leelanau?",
    a: "Old Mission is the smaller 1987 appellation and the easier single-day loop. Leelanau is larger, with wineries and cideries spread among harbor villages. Most visitors base in Traverse City and spend a day on each.",
  },
];

export const metadata = {
  title: "Traverse City Winery Map & Wine Tour Planner | 40 Wineries",
  description:
    "Interactive Traverse City winery map with 40 wineries across Old Mission and Leelanau. Pick stops, route real roads, and check the day against tasting-room hours.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Traverse City Winery Map & Wine Tour Planner | 40 Wineries",
    description: "Interactive map of 40 Traverse City-area wineries with real-road routing, tasting-room hours, and ready-made wine-tour loops.",
    url: BASE,
    siteName: "Traverse City Wine Country Planner",
  },
  twitter: {
    card: "summary_large_image",
    title: "Traverse City Winery Map & Wine Tour Planner | 40 Wineries",
    description: "Interactive map of 40 Traverse City-area wineries with real-road routing, tasting-room hours, and ready-made wine-tour loops.",
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
      { "@type": "WebSite", "@id": BASE + "/#site", name: "Traverse City Winery Map", url: BASE, publisher: { "@id": "https://chrisizworski.com/#person" } },
      {
        "@type": "WebApplication",
        "@id": BASE + "/#app",
        name: "Traverse City Winery Map & Wine Tour Planner",
        url: BASE,
        applicationCategory: "TravelApplication",
        author: { "@id": "https://chrisizworski.com/#person" },
        creator: { "@id": "https://chrisizworski.com/#person" },
        featureList: [
          "40 winery map",
          "Old Mission and Leelanau filters",
          "real-road route ordering",
          "posted venue hours",
          "ready-made wine-tour loops",
          "beaches, hikes, paddles, farm markets, local food, history, overlooks, and lighthouse stops"
        ],
        operatingSystem: "Web",
        description: INTRO,
      },
      {
        "@type": "Person",
        "@id": "https://chrisizworski.com/#person",
        name: "Chris Izworski",
        url: "https://chrisizworski.com/",
        workExample: { "@id": BASE + "/#app" },
        sameAs: [
          "https://github.com/izworskic",
          "https://www.wikidata.org/wiki/Q138283432"
        ]
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
      <PlannerMount
        title="Traverse City Wine Country"
        description="Start with wine, then open the day up: cider, spirits, beaches, hikes, lighthouses, food and harbor towns. Build the route around real roads and posted hours."
      />
      <main className="tc-page">
        <h1>Traverse City Winery Map: 40 Wineries on Old Mission & Leelanau</h1>
        <p className="search-lede">{INTRO}</p>
        <div className="quick-answer" aria-label="Winery map coverage">
          <div><strong>40 wineries</strong><span>Mapped across the Traverse City wine region</span></div>
          <div><strong>11 Old Mission</strong><span>Compact peninsula, easiest single-day route</span></div>
          <div><strong>27 Leelanau</strong><span>Larger peninsula, best planned by town or loop</span></div>
        </div>
        <div className="intent-pills" aria-label="Popular winery map views">
          <Link href="/old-mission-peninsula-wineries">Old Mission winery map</Link>
          <Link href="/leelanau-peninsula-wine-trail">Leelanau winery map</Link>
          <Link href="/one-day-itineraries">Ready-made wine routes</Link>
          <Link href="/fall-color-wine-tour">Fall color wine tour</Link>
          <Link href="/venues">Posted hours</Link>
        </div>
        <WineDayComposer />
        <WineCountryWorld />
        <RegionalPhoto kind="chateau" />
        <section className="wine-lens" aria-labelledby="wine-lens-title">
          <h2 id="wine-lens-title">Find wineries by what is in the glass</h2>
          <p>Most regional lists sort by geography or popularity. These wine-first lenses start with the style you want to taste, then use the planner to make the route practical.</p>
          <div className="wine-lens-grid">
            <div className="wine-lens-card"><h3>Riesling</h3><p>Dry, aromatic, off-dry, and classic cool-climate expressions across both peninsulas.</p><Link href="/wine/riesling">Find Riesling wineries</Link></div>
            <div className="wine-lens-card"><h3>Sparkling wine</h3><p>Start with true sparkling specialists, then add wineries where bubbly is a meaningful part of the lineup.</p><Link href="/wine/sparkling">Find sparkling-wine stops</Link></div>
            <div className="wine-lens-card"><h3>Cool-climate reds</h3><p>Cabernet Franc, Pinot Noir, Merlot, Nebbiolo, and other red-wine signals for visitors who do not want a white-only day.</p><Link href="/wine/reds">Find red-wine wineries</Link></div>
            <div className="wine-lens-card"><h3>Dry & aromatic whites</h3><p>Chardonnay, Pinot Gris, Sauvignon Blanc, Albariño, Grüner, Gewürztraminer, and more.</p><Link href="/wine/whites">Find white-wine wineries</Link></div>
            <div className="wine-lens-card"><h3>Wine-first producers</h3><p>For visitors who care more about distinctive wine programs than the biggest view or tasting-room spectacle.</p><Link href="/wine/serious-wine">Plan a wine-first day</Link></div>
            <div className="wine-lens-card"><h3>First Traverse City wine day</h3><p>A balanced entry point: strong wine identity, memorable settings, and a route that makes geographic sense.</p><Link href="/wine/first-trip">Build a first-timer wine day</Link></div>
          </div>
        </section>
        <h2>Why this map is different</h2>
        <p>
          Most winery maps stop at pins. This one lets you choose the stops you actually want, orders them into a practical loop,
          checks drive time and posted hours, and tells you when the day no longer fits. Wine is the default view; cider, beer,
          spirits, beaches, hikes, paddles, farm markets, local food, history, scenic stops, and lighthouses are optional layers for mixed groups.
        </p>
        <h2>Guides</h2>
        <ul className="guides">
          {GUIDES.map((g, i) => (
            <li key={i}>
              <Link href={g.href}>{g.title}</Link>
              {": " + g.blurb}
            </li>
          ))}
          <li>
            <Link href="/venues">Posted hours</Link>
            {": all " + T + " venues in one directory, verified " + HOURS_VERIFIED}
          </li>
        </ul>
        <p>{TAIL}</p>
        {REST.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <AuthorNote context="Traverse City wine country" />
        <h2>Common questions</h2>
        <dl className="faq">
          {FAQ.map((f, i) => (
            <div key={i}>
              <dt>{f.q}</dt>
              <dd>{f.a}</dd>
            </div>
          ))}
        </dl>
        <h2>Browse the places</h2>
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
