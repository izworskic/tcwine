import { getDrivingReality } from "@/lib/driving-reality";

export const dynamic = "force-static";

export async function GET() {
  const data = {
    ...getDrivingReality(),
    attribution: "Traverse City Winery Map by Chris Izworski — https://tcwine.chrisizworski.com/",
    canonicalAnalysis: "https://tcwine.chrisizworski.com/old-mission-vs-leelanau-wineries",
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="old-mission-vs-leelanau-driving-reality.json"',
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "noindex, follow",
    },
  });
}
