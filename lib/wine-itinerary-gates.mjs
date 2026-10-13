const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const asMinutes=(s)=>{if(!/^\d{2}:\d{2}$/.test(s||""))return null;const [h,m]=s.split(":").map(Number);return h<24&&m<60?h*60+m:null;};
export const readableTime=(n)=>n==null?"Unknown":((Math.floor(n/60)%12)||12)+":"+String(n%60).padStart(2,"0")+(Math.floor(n/60)>=12?" PM":" AM");
const greatCircleMiles=(a,b)=>{const r=Math.PI/180,x=Math.sin((b.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin((b.lng-a.lng)*r/2)**2;return 3958.8*2*Math.asin(Math.sqrt(x));};
// Planning-only, conservative buffer; never present as road routing.
export const legPlanningMinutes=(a,b)=>Math.ceil(greatCircleMiles(a,b)*3.2+8);
export function evaluateWineWindow({stops,date,firstArrival="11:00",hoursAvailable=6,extraBreakMinutes=0}){
  const start=asMinutes(firstArrival);
  if(!stops?.length||!date||start==null||!(hoursAvailable>0))return {feasible:false,state:"NEEDS_INPUT",reason:"Choose a date, first arrival and time window.",schedule:[]};
  const day=DAYS[new Date(date+"T12:00:00").getDay()];
  if(!day)return {feasible:false,state:"NEEDS_INPUT",reason:"Date is not valid.",schedule:[]};
  let clock=start,drive=0,unknown=0;const schedule=[],limit=start+Number(hoursAvailable)*60;
  for(const [i,v] of stops.entries()){
    if(i){const leg=legPlanningMinutes(stops[i-1],v);drive+=leg;clock+=leg;if(i===2)clock+=extraBreakMinutes;}
    if(v.status&&v.status!=="open")return {feasible:false,state:"CLOSED",reason:v.name+" is marked unavailable.",schedule};
    const h=v.hours?.[day];
    if(!v.needsHours&&(!h||h.closed||!h.open||!h.close))return {feasible:false,state:"CLOSED",reason:v.name+" is not listed open on "+day+".",schedule};
    let hoursState="POSTED";
    if(v.needsHours||!h?.open||!h?.close){hoursState="UNCONFIRMED";unknown++;}
    else{
      const opening=asMinutes(h.open),closing=asMinutes(h.close);
      if(opening==null||closing==null||opening>=closing)return {feasible:false,state:"NEEDS_INPUT",reason:"Hours for "+v.name+" need verification.",schedule};
      clock=Math.max(clock,opening);
      if(clock+(v.dwellMinutes||60)>closing)return {feasible:false,state:"HOURS_CONFLICT",reason:v.name+" cannot fit before the posted "+readableTime(closing)+" closing.",schedule};
    }
    const arrival=clock;clock+=(v.dwellMinutes||60);
    schedule.push({id:v.id,name:v.name,arrive:readableTime(arrival),leave:readableTime(clock),hoursState});
    if(clock>limit)return {feasible:false,state:"TIME_CONFLICT",reason:"This route exceeds your "+hoursAvailable+"-hour window.",schedule};
  }
  return {feasible:true,state:unknown?"CALL_AHEAD":"POSTED_HOURS_FIT",reason:unknown?unknown+" stop(s) have unconfirmed hours: call before committing.":"Fits posted weekly hours; seasonal changes and bookings are not verified.",unknownHours:unknown,schedule,estimatedDriveMinutes:drive,firstArrival,lastDeparture:readableTime(clock),timeUsedMinutes:clock-start,disclaimer:"Travel is a planning buffer from geographic distance, NOT a road-route ETA. Travel to the first stop is excluded. Verify the road route, hours and reservations before leaving."};
}
