import { buildRegionContract, buildRegionContracts } from "@/lib/region-contract";

export const dynamic = "force-dynamic";

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");
  const intent = searchParams.get("intent") || "first-trip";
  const date = validDate(searchParams.get("date"));
  const payload = area
    ? buildRegionContract(area, { intent, date })
    : { schemaVersion: 1, regions: buildRegionContracts({ intent, date }) };

  if (!payload) {
    return Response.json({ error: "unknown_region" }, {
      status: 404,
      headers: { "X-Robots-Tag": "noindex, follow" },
    });
  }
  return Response.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=300, s-maxage=1800",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
