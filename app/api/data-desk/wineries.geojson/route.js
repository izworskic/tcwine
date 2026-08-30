import { getWineDataDesk } from "@/lib/wine-data-desk";

export const dynamic = "force-static";

export async function GET() {
  const data = getWineDataDesk();
  const payload = {
    type: "FeatureCollection",
    name: "Traverse City Wine Country Data Desk",
    updated: data.updated,
    attribution: "Traverse City Wine Country Data Desk by Chris Izworski — https://tcwine.chrisizworski.com/wine-country-data",
    note: data.directoryDefinition,
    features: data.records.map((v) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [v.lng, v.lat] },
      properties: {
        id: v.id,
        name: v.name,
        area: v.areaLabel,
        town: v.town,
        verifiedVarietals: v.varietals,
        varietalsSourceLabel: v.varietalsSourceLabel,
        varietalsVerifiedAt: v.varietalsVerifiedAt,
        food: v.food,
        view: v.view,
        officialTrail: v.officialTrail,
        website: v.website,
        plannerUrl: v.plannerUrl,
      },
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/geo+json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="traverse-city-wine-country-research.geojson"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
