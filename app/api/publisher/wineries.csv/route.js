import venues from "@/data/venues.json";
import wineTruth from "@/data/wine-truth.json";

export const dynamic = "force-static";

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

export async function GET() {
  const wineries = venues.filter((v) => v.category === "winery");
  const rows = [
    ["id", "name", "area", "town", "latitude", "longitude", "website", "planner_url", "dataset_updated"],
    ...wineries.map((v) => [
      v.id,
      v.name,
      v.area,
      v.town,
      v.lat,
      v.lng,
      v.website || "",
      "https://tcwine.chrisizworski.com/winery/" + v.id,
      wineTruth.updated,
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");

  return new Response(csv + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="traverse-city-wineries.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
