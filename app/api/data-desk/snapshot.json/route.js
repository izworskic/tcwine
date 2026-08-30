import { getWineDataDesk } from "@/lib/wine-data-desk";

export const dynamic = "force-static";

export async function GET() {
  const data = getWineDataDesk();
  const payload = {
    name: "Traverse City Wine Country Data Desk",
    url: "https://tcwine.chrisizworski.com/wine-country-data",
    creator: "Chris Izworski",
    updated: data.updated,
    definitions: {
      directory: data.directoryDefinition,
      varietals: data.varietalDefinition,
      geography: data.geographyDefinition,
    },
    summary: data.summary,
    areas: data.areas,
    towns: data.towns,
    verifiedGrapes: data.grapes,
    trails: data.trails,
    views: data.views,
    food: data.food,
    geography: data.geography,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
