// V7 Food Truth Engine. Pure and deterministic: never infers kitchen hours, booking
// availability or a restaurant from an unverified venue.food label.
export const MEAL_TYPES = Object.freeze(["FULL_MEAL","SUBSTANTIAL","SMALL_PLATES","SNACKS","PAIRING","EVENT_ONLY","UNKNOWN"]);
export const FOOD_STATES = Object.freeze([
  "NEEDS_INPUT","UNKNOWN_SERVICE","NOT_FULL_MEAL","VENUE_TYPE_MISMATCH",
  "KITCHEN_CLOSED","SOURCE_CONFLICT","SOURCE_STALE","CALL_TO_CONFIRM",
  "BOOKING_REQUIRED","PUBLISHED_SERVICE_FITS","PARTY_LIMIT","DATE_EXCEPTION"
]);
const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const hhmm=s=>{
  if(typeof s!=="string"||!/^([01]\d|2[0-3]):[0-5]\d$/.test(s))return null;
  const [h,m]=s.split(":").map(Number);return h*60+m;
};
const dateParts=d=>{
  if(typeof d!=="string"||! /^\d{4}-\d{2}-\d{2}$/.test(d))return null;
  const t=new Date(d+"T12:00:00Z");
  return !Number.isNaN(t.getTime())&&t.toISOString().slice(0,10)===d
    ? {day:DAYS[t.getUTCDay()],date:d} : null;
};
const isHttps=url=>typeof url==="string"&&url.startsWith("https://");
const usableForFullMeal=s=>["FULL_MEAL","SUBSTANTIAL"].includes(s.mealType)||
  s.mealType==="PAIRING"&&s.fullMealEvidence===true;
export const findFoodLocation=(data,id)=>data?.locations?.find(l=>l.locationId===id||l.venueId===id)||null;
export const findFoodService=(data,id)=>data?.locations?.flatMap(l=>l.services).find(s=>s.serviceId===id)||null;

export function validateFoodDataset(data,{venueIds}={}){
  const issues=[],locations=new Set(),services=new Set();
  if(!data||!Array.isArray(data.locations))return ["locations array is required"];
  if(!dateParts(data.reviewedAt))issues.push("invalid reviewedAt");
  for(const l of data.locations){
    if(!l.locationId||locations.has(l.locationId))issues.push("duplicate/missing locationId "+l.locationId);
    locations.add(l.locationId);
    if(!["winery","restaurant","restaurant_brewery"].includes(l.kind))issues.push(l.locationId+": invalid kind");
    if(!l.name||!l.address||!l.region)issues.push(l.locationId+": missing identity/geography");
    if(venueIds&&l.venueId&&!venueIds.has(l.venueId))issues.push(l.locationId+": venue ID absent from venues.json");
    if(!Array.isArray(l.services)||!l.services.length)issues.push(l.locationId+": missing services");
    for(const s of l.services||[]){
      if(!s.serviceId||services.has(s.serviceId))issues.push("duplicate/missing serviceId "+s.serviceId);
      services.add(s.serviceId);
      if(!MEAL_TYPES.includes(s.mealType))issues.push(s.serviceId+": invalid meal type");
      if(!isHttps(s.sourceUrl)||!isHttps(s.menuUrl))issues.push(s.serviceId+": operator source URLs required");
      if(!dateParts(s.verifiedAt)||!dateParts(s.reviewDue)||s.verifiedAt>s.reviewDue)issues.push(s.serviceId+": invalid review dates");
      if(!["UNKNOWN","KITCHEN_EXPLICIT","VENUE_HOURS_ONLY","RESERVATION_ONLY"].includes(s.hoursBasis))issues.push(s.serviceId+": invalid hoursBasis");
      if(!["REQUIRED","RECOMMENDED","NOT_REQUIRED","WALK_IN","UNKNOWN"].includes(s.reservation))issues.push(s.serviceId+": invalid reservation");
      if(!Array.isArray(s.menuItems))issues.push(s.serviceId+": menuItems not array");
      for(const item of s.menuItems||[])
        if(!item.name||item.priceUsd!==null&&(!Number.isFinite(item.priceUsd)||item.priceUsd<0))
          issues.push(s.serviceId+": invalid item/price");
      if(s.foodHours!==null){
        if(!s.foodHours||typeof s.foodHours!=="object")issues.push(s.serviceId+": invalid foodHours");
        else for(const [day,h] of Object.entries(s.foodHours))
          if(!DAYS.includes(day)||!Array.isArray(h)||h.length!==2||
            hhmm(h[0])===null||hhmm(h[1])===null||hhmm(h[0])>=hhmm(h[1]))
            issues.push(s.serviceId+": invalid food hours "+day);
      }
      if(!Array.isArray(s.conflicts))issues.push(s.serviceId+": missing conflicts");
      for(const conflict of s.conflicts||[]){
        if(!conflict.field||!Array.isArray(conflict.days)||!conflict.days.every(d=>DAYS.includes(d))||
          !Array.isArray(conflict.sources)||conflict.sources.length<2||
          !conflict.sources.every(isHttps)||!conflict.reason)
          issues.push(s.serviceId+": malformed conflict");
      }
    }
  }
  return issues;
}

export function assessFoodService({data,locationId,serviceId,date,startTime,durationMinutes=60,
  partySize=2,requestedMeal="FULL_LUNCH",strictWinery=false,asOf=new Date().toISOString().slice(0,10)}={}){
  const l=findFoodLocation(data,locationId);
  const s=l?(serviceId?l.services.find(s=>s.serviceId===serviceId):l.services[0]):null;
  const common={locationId:l?.locationId||locationId||null,serviceId:s?.serviceId||serviceId||null,
    bookingAvailability:"NOT_CHECKED",reserved:false,
    bookingPolicy:s?.reservation||"UNKNOWN",sources:s?[s.sourceUrl,s.menuUrl]:[]};
  const out=(state,reason,fit="REJECT")=>({state,reason,fit,mealType:s?.mealType||"UNKNOWN",...common});
  if(!l||!s)return out("UNKNOWN_SERVICE","This meal service is not source-reviewed.");
  const parsed=dateParts(date),checked=dateParts(asOf),start=hhmm(startTime);
  if(!parsed||!checked||start===null||!Number.isInteger(partySize)||partySize<1||
    !Number.isInteger(durationMinutes)||durationMinutes<20||durationMinutes>180||
    !["FULL_LUNCH","SMALL_PLATES","PAIRING"].includes(requestedMeal))
    return out("NEEDS_INPUT","Choose a valid date, local arrival time, party size and meal duration.");
  if(strictWinery&&l.kind!=="winery")
    return out("VENUE_TYPE_MISMATCH","This meal is at a separate restaurant, not inside a winery.");
  if(s.verifiedAt>asOf||asOf>s.reviewDue)
    return out("SOURCE_STALE","Menu or service-hours evidence is outside the reviewed window; reconfirm with the operator.","CONDITIONAL");
  if((s.dateExceptions||[]).some(x=>x.date===date&&x.closed))
    return out("DATE_EXCEPTION","Operator lists this date as closed.");
  const conflict=(s.conflicts||[]).find(c=>c.field==="foodHours"&&c.days.includes(parsed.day));
  if(conflict)return {...out("SOURCE_CONFLICT",conflict.reason,"CONDITIONAL"),conflictingSources:conflict.sources};
  if(s.foodHours){
    const hours=s.foodHours[parsed.day];
    if(!hours)return out("KITCHEN_CLOSED","No food service is published for this weekday.");
    const [open,close]=hours.map(hhmm);
    if(start<open||start+durationMinutes>close)
      return out("KITCHEN_CLOSED","The requested full meal interval does not fit the operator-published service window.");
  }
  const qualifies=requestedMeal==="FULL_LUNCH"?usableForFullMeal(s)
    :requestedMeal==="PAIRING"?s.mealType==="PAIRING"
    :["SMALL_PLATES","SUBSTANTIAL","FULL_MEAL"].includes(s.mealType);
  if(!qualifies)return out("NOT_FULL_MEAL","This source supports snacks or small plates, not the requested full lunch.");
  if(s.partyMaxRecommended&&partySize>s.partyMaxRecommended)
    return out("PARTY_LIMIT","Published booking process is limited to smaller groups; contact the venue.","CONDITIONAL");
  if(s.reservation==="REQUIRED")
    return out("BOOKING_REQUIRED","This service requires a booking. No table or experience availability has been checked.","CONDITIONAL");
  if(!s.foodHours||s.hoursBasis!=="KITCHEN_EXPLICIT"||s.hoursScope!=="PUBLISHED_CURRENT")
    return out("CALL_TO_CONFIRM","Food is documented, but kitchen timing or seasonal applicability is not confirmed for this date.","CONDITIONAL");
  return out("PUBLISHED_SERVICE_FITS","Published food service supports the request at this time; seating and reservations remain unchecked.","CANDIDATE");
}

export function evaluateFoodLocations({data,locationIds,date,startTime,durationMinutes=60,partySize=2,
  requestedMeal="FULL_LUNCH",strictWinery=false,asOf}={}){
  const results=(locationIds||data?.locations?.map(l=>l.locationId)||[])
    .flatMap(id=>(findFoodLocation(data,id)?.services||[]).map(service=>
      assessFoodService({data,locationId:id,serviceId:service.serviceId,date,startTime,
        durationMinutes,partySize,requestedMeal,strictWinery,asOf})));
  const rank={CANDIDATE:0,CONDITIONAL:1,REJECT:2};
  return results.sort((a,b)=>rank[a.fit]-rank[b.fit]||String(a.locationId).localeCompare(String(b.locationId)));
}
