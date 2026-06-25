// POST /api/route
// Body: { coordinates: [[lng,lat], ...] }  (origin, stops..., origin)
// Returns: { ok, geometry: [[lat,lng], ...], legs: [{ durationMin, distanceMi }], provider }
//
// Default provider is the public OSRM demo server (no key, fine for low volume).
// Set MAPBOX_TOKEN in the environment to use Mapbox Directions for production reliability.

export const runtime = "nodejs";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const coords = body && body.coordinates;
  if (!Array.isArray(coords) || coords.length < 2) {
    return Response.json({ ok: false, error: "need 2+ coordinates" }, { status: 400 });
  }

  const coordStr = coords.map((c) => `${c[0]},${c[1]}`).join(";");
  const token = process.env.MAPBOX_TOKEN;
  const url = token
    ? `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${token}`
    : `https://router.project-osrm.org/route/v1/driving/${coordStr}?geometries=geojson&overview=full`;

  try {
    const r = await fetch(url, { headers: { "User-Agent": "tcwine-planner" } });
    if (!r.ok) return Response.json({ ok: false, error: `routing ${r.status}` }, { status: 502 });
    const j = await r.json();
    const route = j.routes && j.routes[0];
    if (!route || !route.geometry) {
      return Response.json({ ok: false, error: "no route" }, { status: 502 });
    }
    const geometry = route.geometry.coordinates.map((c) => [c[1], c[0]]); // -> [lat,lng]
    const legs = (route.legs || []).map((l) => ({
      durationMin: (l.duration || 0) / 60,
      distanceMi: (l.distance || 0) / 1609.34,
    }));
    return Response.json({ ok: true, geometry, legs, provider: token ? "mapbox" : "osrm" });
  } catch (e) {
    return Response.json({ ok: false, error: "routing failed" }, { status: 502 });
  }
}
