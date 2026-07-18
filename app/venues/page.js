import venues from "@/data/venues.json";
import VenueHours, { HOURS_VERIFIED } from "@/components/VenueHours";
import { buildVenueItemList } from "@/lib/venue-schema";

const counts = venues.reduce((acc, v) => {
  acc[v.category] = (acc[v.category] || 0) + 1;
  return acc;
}, {});

const BASE = "https://tcwine.chrisizworski.com";
const SOCIAL_IMAGE = `${BASE}/opengraph-image`;
const TITLE = `Traverse City Tasting Room Hours: ${venues.length} Verified Venues`;
const DESCRIPTION = `Current hours for ${venues.length} Traverse City tasting rooms across Leelanau and Old Mission: ${counts.winery} wineries, ${counts.brewery} breweries, ${counts.distillery} distilleries and ${counts.cidery} cideries.`;

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/venues" },
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
    url: `${BASE}/venues`,
    siteName: "Traverse City Wine Country Planner",
    images: [{ url: SOCIAL_IMAGE, width: 1200, height: 630, alt: "Traverse City Wine Country tasting-loop planner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

export default function VenuesPage() {
  const itemList = buildVenueItemList(venues);
  return (
    <main className="tc-page"
      style={{
        maxWidth: 860,
        margin: "0 auto",
        padding: "28px 20px",
        lineHeight: 1.55,
        fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <h1>
        Traverse City area tasting room hours: all {venues.length} venues
      </h1>
      <p>
        This directory lists current hours for all {venues.length} wineries,
        breweries, distilleries and cider houses across the Traverse City wine
        region: {counts.winery} wineries, {counts.brewery} breweries,{" "}
        {counts.distillery} distilleries and {counts.cidery} cideries spanning
        the Leelanau Peninsula, Old Mission Peninsula and downtown Traverse
        City. Hours were verified in {HOURS_VERIFIED}. Each listing includes a
        suggested visit length so you can pace a tasting day realistically.
      </p>
      <p>
        <a href="/">Open the interactive planner</a> to route a tasting day
        against these hours, with drive times and daylight built in.
      </p>
      <VenueHours title="Leelanau Peninsula" areas={["leelanau"]} />
      <VenueHours title="Old Mission Peninsula" areas={["old-mission"]} />
      <VenueHours
        title="Traverse City and beyond"
        areas={["traverse-city", "outer"]}
      />
      <p>
        Six venues above are marked call ahead because their posted schedules
        could not be verified in {HOURS_VERIFIED}. We list a phone number
        instead of guessing.
      </p>
    </main>
  );
}
