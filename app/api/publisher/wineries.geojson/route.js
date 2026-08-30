import venues from "@/data/venues.json";
import wineTruth from "@/data/wine-truth.json";

export const dynamic = "force-static";

export async function GET() {
  const wineries = venues.filter((v) => v.category === "winery");
  const payload = {
    type: "FeatureCollection",
    name: "Traverse City Winery Map directory",
    updated: wineTruth.updated,
    attribution: "Traverse City Winery Map by Chris Izworski — https://tcwine.chrisizworski.com/",
    note: "Geographic directory locations; official wine-trail association membership counts may differ.",
    features: wineries.map((v) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [v.lng, v.lat] },
      properties: {
        id: v.id,
        name: v.name,
        area: v.area,
        town: v.town,
        website: v.website || null,
        plannerUrl: "https://tcwine.chrisizworski.com/winery/" + v.id,
      },
    })),
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/geo+json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="traverse-city-wineries.geojson"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
