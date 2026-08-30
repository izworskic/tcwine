import { getWineDataDesk } from "@/lib/wine-data-desk";

export const dynamic = "force-static";

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return '"' + text.replace(/"/g, '""') + '"';
}

export async function GET() {
  const data = getWineDataDesk();
  const rows = [
    [
      "id",
      "name",
      "area",
      "town",
      "latitude",
      "longitude",
      "verified_varietals",
      "varietals_source",
      "varietals_source_url",
      "varietals_verified_at",
      "food_signal",
      "view_signal",
      "official_trail",
      "official_trail_url",
      "website",
      "planner_url",
      "dataset_updated",
    ],
    ...data.records.map((v) => [
      v.id,
      v.name,
      v.areaLabel,
      v.town,
      v.lat,
      v.lng,
      v.varietals.join("|"),
      v.varietalsSourceLabel || "",
      v.varietalsSourceUrl || "",
      v.varietalsVerifiedAt || "",
      v.food || "",
      v.view || "",
      v.officialTrail || "",
      v.officialTrailUrl || "",
      v.website || "",
      v.plannerUrl,
      data.updated,
    ]),
  ];

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n") + "\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="traverse-city-wine-country-research.csv"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
