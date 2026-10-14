// Shared POST /api/route
// Body: { coordinates: [[lng,lat], ...] } (origin, stops, return)
// This endpoint is used by both the winery map and the meal-first V8 planner.
import {checkRouteCoordinates,ROUTE_LIMITS} from "@/lib/route-guard.mjs";
export const runtime = "nodejs";
export async function POST(req) {
  const declared=Number(req.headers.get("content-length")||0);
  if(Number.isFinite(declared)&&declared>ROUTE_LIMITS.maxBodyBytes)
    return Response.json({ok:false,error:"route request too large"},{status:413});
  let body;
  try{
    body=await req.json();
    if(JSON.stringify(body).length>ROUTE_LIMITS.maxBodyBytes)
      return Response.json({ok:false,error:"route request too large"},{status:413});
  }catch{
    return Response.json({ok:false,error:"bad JSON"},{status:400});
  }
  const checked=checkRouteCoordinates(body?.coordinates);
  if(!checked.ok)return Response.json({ok:false,error:checked.error},{status:400});
  const coords=checked.points;
  const coordStr=coords.map(([lon,lat])=>lon+","+lat).join(";");
  const token=process.env.MAPBOX_TOKEN;
  const url=token
    ? "https://api.mapbox.com/directions/v5/mapbox/driving/"+coordStr+"?geometries=geojson&overview=full&access_token="+encodeURIComponent(token)
    : "https://router.project-osrm.org/route/v1/driving/"+coordStr+"?geometries=geojson&overview=full";
  try {
    const res=await fetch(url,{headers:{"User-Agent":"tcwine-planner"},
      signal:AbortSignal.timeout(6500)});
    if(!res.ok)return Response.json({ok:false,error:"routing provider unavailable"},{status:502});
    const json=await res.json();
    const route=json?.routes?.[0];
    if(!route||!Array.isArray(route?.geometry?.coordinates)||
      !Array.isArray(route.legs)||route.legs.length!==coords.length-1)
      return Response.json({ok:false,error:"routing response incomplete"},{status:502});
    const lines=route.geometry.coordinates;
    if(lines.length<2||lines.length>15000||
      !lines.every(c=>Array.isArray(c)&&c.length>=2&&
        typeof c[0]==="number"&&Number.isFinite(c[0])&&
        typeof c[1]==="number"&&Number.isFinite(c[1])))
      return Response.json({ok:false,error:"invalid road geometry"},{status:502});
    if(!route.legs.every(l=>Number.isFinite(l?.duration)&&l.duration>=0&&
      Number.isFinite(l?.distance)&&l.distance>=0))
      return Response.json({ok:false,error:"invalid travel legs"},{status:502});
    const legs=route.legs.map(l=>({
      durationMin:l.duration/60,distanceMi:l.distance/1609.34
    }));
    return Response.json({ok:true,geometry:lines.map(c=>[c[1],c[0]]),
      legs,provider:token?"mapbox":"osrm"},
      {headers:{"Cache-Control":"private, no-store"}});
  }catch{
    return Response.json({ok:false,error:"road routing unavailable or timed out"},{status:502});
  }
}
