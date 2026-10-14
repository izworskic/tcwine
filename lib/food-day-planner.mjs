import {assessFoodService} from "./food-truth.mjs";
import {legPlanningMinutes} from "./wine-itinerary-gates.mjs";
// Pure meal-first route planning: no unverified lunch stops or invented road ETAs.
const min=s=>{if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(s||""))return null;
  const [h,m]=s.split(":").map(Number);return h*60+m;};
const fmt=n=>String(Math.floor(n/60)%24).padStart(2,"0")+":"+String(n%60).padStart(2,"0");
const validDate=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&
  !Number.isNaN(Date.parse(d+"T12:00:00Z"))&&new Date(d+"T12:00:00Z").toISOString().slice(0,10)===d;
const point=p=>p&&Number.isFinite(p.lat)&&Number.isFinite(p.lng);
const distance=(a,b)=>Math.hypot(a.lat-b.lat,(a.lng-b.lng)*0.73);
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const route=(origin,meal,winery)=>winery?[origin,meal,winery,origin]:[origin,meal,origin];
const estimated=points=>points.slice(1).map((p,i)=>legPlanningMinutes(points[i],p));
export function wineryHoursFit(venue,date,arrival,duration){
  if(!venue||venue.status&&venue.status!=="open")return false;
  if(venue.needsHours)return true; // distinguish call-ahead from confirmed when displaying
  if(!validDate(date))return false;
  const h=venue.hours?.[DAYS[new Date(date+"T12:00:00Z").getUTCDay()]];
  return !!h&&!h.closed&&min(h.open)!==null&&min(h.close)!==null&&
    arrival>=min(h.open)&&arrival+duration<=min(h.close);
}
export function itinerarySchedule(points,legs,dayStart,budget,winery){
  if(!Array.isArray(legs)||legs.length!==points.length-1||
    legs.some(x=>!Number.isFinite(x)||x<0))return null;
  const dr=legs.map(x=>Math.ceil(x)),arrive=dayStart+dr[0],leave=arrive+75;
  const tastingArrive=winery?leave+dr[1]:null;
  const tastingLeave=winery?tastingArrive+(winery.dwellMinutes||45):null;
  const end=winery?tastingLeave+dr[2]:leave+dr[1];
  return {mealArrive:fmt(arrive),mealLeave:fmt(leave),tastingArrive:tastingArrive===null?null:fmt(tastingArrive),
    tastingLeave:tastingLeave===null?null:fmt(tastingLeave),finish:fmt(end),
    driveMinutes:dr.reduce((a,b)=>a+b,0),elapsedMinutes:end-dayStart,
    fits:end-dayStart<=budget,mealArriveMinutes:arrive,tastingArriveMinutes:tastingArrive,driveLegs:dr};
}
function score(service,food,schedule,location,winery){
  const meal=service.mealType==="FULL_MEAL"?35:33;
  const timing=food.state==="PUBLISHED_SERVICE_FITS"?20:food.state==="SOURCE_CONFLICT"?2:11;
  const travel=Math.max(0,20-Math.floor(schedule.driveMinutes/6));
  const wine=location.kind==="winery"?10:winery?9:4;
  const booking=service.reservation==="REQUIRED"?2:service.reservation==="UNKNOWN"?5:
    service.reservation==="RECOMMENDED"?7:9;
  return meal+timing+travel+wine+booking+(location.kind==="winery"?5:3);
}
const directions=(origin,location,winery)=>{
  const stops=[origin.address||"Traverse City, MI",location.address,
    ...(winery?[winery.address||winery.name+", Traverse City, MI"]:[]),origin.address||"Traverse City, MI"];
  return "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(stops[0])+
    "&destination="+encodeURIComponent(stops[stops.length-1])+
    "&waypoints="+encodeURIComponent(stops.slice(1,-1).join("|"))+"&travelmode=driving";
};
export function planFoodDay({data,venues,origin,date,startTime,windowMinutes=210,partySize=2,
  region="old-mission",strictWinery=false,asOf}={}){
  const begin=min(startTime);
  if(!validDate(date)||begin===null||!point(origin)||!Number.isInteger(partySize)||partySize<1||
    !Number.isInteger(windowMinutes)||windowMinutes<120||windowMinutes>480)
    return {state:"NEEDS_DATE_TIME",reason:"Choose a real date, local start time, party size and time window.",candidates:[]};
  const locations=(data?.locations||[]).filter(l=>l.region===region&&(!strictWinery||l.kind==="winery"));
  const wineries=(venues||[]).filter(v=>v.category==="winery"&&v.area===region&&point(v));
  const candidates=[],excluded=[];
  for(const loc of locations){
    const mealPoint=loc.venueId?(venues||[]).find(v=>v.id===loc.venueId):loc;
    if(!point(mealPoint)){excluded.push({locationId:loc.locationId,reason:"Meal location is not yet geolocated."});continue;}
    for(const svc of loc.services){
      if(!["FULL_MEAL","SUBSTANTIAL"].includes(svc.mealType))continue;
      const nearby=wineries.filter(v=>v.id!==loc.venueId)
        .sort((a,b)=>distance(mealPoint,a)-distance(mealPoint,b)).slice(0,6);
      for(const winery of [null,...nearby]){
        const pts=route(origin,mealPoint,winery);
        const schedule=itinerarySchedule(pts,estimated(pts),begin,windowMinutes,winery);
        if(!schedule||!schedule.fits)continue;
        if(winery&&!wineryHoursFit(winery,date,schedule.tastingArriveMinutes,winery.dwellMinutes||45))continue;
        const food=assessFoodService({data,locationId:loc.locationId,serviceId:svc.serviceId,date,
          startTime:schedule.mealArrive,durationMinutes:75,partySize,requestedMeal:"FULL_LUNCH",strictWinery,asOf});
        if(food.fit==="REJECT"){excluded.push({locationId:loc.locationId,state:food.state,reason:food.reason});continue;}
        candidates.push({id:svc.serviceId+(winery?"--"+winery.id:""),
          locationId:loc.locationId,locationName:loc.name,kind:loc.kind,
          meal:mealPoint,winery:winery||null,wineryIds:winery?[winery.id]:(loc.venueId?[loc.venueId]:[]),
          serviceId:svc.serviceId,mealType:svc.mealType,sourceUrl:svc.sourceUrl,menuUrl:svc.menuUrl,
          reservationUrl:svc.reservationUrl||null,reservationPolicy:svc.reservation,
          evidence:svc.evidence,note:svc.note,status:food.state,fit:food.fit,reason:food.reason,
          sourceVerifiedAt:svc.verifiedAt,reviewDue:svc.reviewDue,
          schedule,points:pts.map(v=>({lat:v.lat,lng:v.lng,name:v.name||"Traverse City"})),
          routeType:"PLANNING_ESTIMATE",drivingUrl:directions(origin,loc,winery),
          score:score(svc,food,schedule,loc,winery)});
      }
    }
  }
  const sorted=candidates.sort((a,b)=>(a.fit==="CANDIDATE"?0:1)-(b.fit==="CANDIDATE"?0:1)||
    b.score-a.score||a.schedule.driveMinutes-b.schedule.driveMinutes);
  const best=sorted.find(x=>x.winery||x.kind==="winery")||sorted[0]||null;
  const alternate=sorted.find(x=>best&&x.locationId!==best.locationId)||null;
  if(!best)return {state:"NO_VERIFIED_FULL_MEAL",
    reason:"No source-reviewed full meal fits the requested time and area. Try a different window or confirm directly with an operator.",
    candidates:[],excluded};
  return {state:best.fit==="CANDIDATE"?"PUBLISHED_SERVICE_FITS":"CALL_TO_CONFIRM",
    reason:best.reason,best,alternate,candidates:sorted,excluded,bookingAvailability:"NOT_CHECKED"};
}
// Replace planning-buffer legs with actual driving legs; veto window and kitchen conflicts.
export function evaluateRouteLegs(candidate,legs,{date,venues,windowMinutes=210,startTime="12:00",
  partySize=2,data,asOf}={}){
  if(!candidate||!Array.isArray(legs)||legs.length!==candidate.points.length-1)
    return {state:"ROUTE_UNAVAILABLE",reason:"Road routing was unavailable; times remain planning estimates."};
  const begin=min(startTime);
  if(begin===null)return {state:"NEEDS_DATE_TIME",reason:"Choose a start time."};
  const winery=candidate.winery?(venues||[]).find(v=>v.id===candidate.winery.id):null;
  const times=legs.map(x=>typeof x==="number"?x:x?.durationMin);
  const schedule=itinerarySchedule(candidate.points,times,begin,windowMinutes,winery);
  if(!schedule)return {state:"ROUTE_UNAVAILABLE",reason:"Road-route leg data is incomplete."};
  if(!schedule.fits)return {state:"TIME_CONFLICT",reason:"Road travel pushes the day beyond the selected time window.",schedule};
  if(winery&&!wineryHoursFit(winery,date,schedule.tastingArriveMinutes,winery.dwellMinutes||45))
    return {state:"HOURS_CONFLICT",reason:"The later winery visit conflicts with published tasting-room hours.",schedule};
  const food=assessFoodService({data,locationId:candidate.locationId,serviceId:candidate.serviceId,date,
    startTime:schedule.mealArrive,durationMinutes:75,partySize,asOf});
  if(food.fit==="REJECT")return {state:food.state,reason:food.reason,schedule};
  return {state:food.state,reason:food.reason,schedule,routeType:"ROAD_PROVIDER_ESTIMATE",
    bookingAvailability:"NOT_CHECKED"};
}
