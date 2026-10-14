// Guard the shared Traverse City/Leelanau routing API before calling an
// upstream routing provider (including paid Mapbox when configured).
// Numeric GeoJSON order is [longitude, latitude], not [latitude, longitude].
export const ROUTE_LIMITS = Object.freeze({
  minPoints: 2,
  maxPoints: 18, // existing 12-stop planner + origin/return: 14
  maxBodyBytes: 4096,
  latMin: 44.30,
  latMax: 45.40,
  lonMin: -86.30,
  lonMax: -85.20,
});
export function checkRouteCoordinates(coords){
  if(!Array.isArray(coords)||coords.length<ROUTE_LIMITS.minPoints)
    return {ok:false,error:"need 2+ coordinates"};
  if(coords.length>ROUTE_LIMITS.maxPoints)
    return {ok:false,error:"too many route stops"};
  const points=[];
  for(const item of coords){
    if(!Array.isArray(item)||item.length!==2||
      !item.every(v=>typeof v==="number"&&Number.isFinite(v)))
      return {ok:false,error:"coordinates must be finite longitude/latitude numbers"};
    const [lon,lat]=item;
    if(lat<ROUTE_LIMITS.latMin||lat>ROUTE_LIMITS.latMax||
      lon<ROUTE_LIMITS.lonMin||lon>ROUTE_LIMITS.lonMax)
      return {ok:false,error:"coordinates outside Traverse City wine region"};
    points.push([Number(lon.toFixed(6)),Number(lat.toFixed(6))]);
  }
  return {ok:true,points};
}
