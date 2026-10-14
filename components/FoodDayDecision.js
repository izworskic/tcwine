"use client";
import {useState} from "react";
import foodData from "@/data/food-offerings.json";
import venues from "@/data/venues.json";
import origins from "@/data/origins.json";
import {planFoodDay,evaluateRouteLegs} from "@/lib/food-day-planner.mjs";
import {trackWineEvent} from "@/lib/wine-analytics";
import FoodDayMap from "./FoodDayMap";

function localToday(){
  const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Detroit",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const item=t=>p.find(x=>x.type===t)?.value||"";
  return item("year")+"-"+item("month")+"-"+item("day");
}
function prettyClock(s){
  if(!s)return "";
  const [h,m]=s.split(":").map(Number);
  return (h%12||12)+":"+String(m).padStart(2,"0")+" "+(h>=12?"PM":"AM");
}
const labels={
  CALL_TO_CONFIRM:"Promising plan · call ahead",
  PUBLISHED_SERVICE_FITS:"Published service fits · booking unverified",
  SOURCE_CONFLICT:"Published hours conflict",
  SOURCE_STALE:"Menu or hours need refreshing",
  BOOKING_REQUIRED:"Booking required",
  KITCHEN_CLOSED:"Food service closed for this window",
  TIME_CONFLICT:"Trip exceeds the time available",
  HOURS_CONFLICT:"Tasting-room hours conflict",
  NO_VERIFIED_FULL_MEAL:"No supported full lunch found",
  NEEDS_DATE_TIME:"Choose a date and start time"
};
export default function FoodDayDecision(){
  const [date,setDate]=useState("");
  const [startTime,setStartTime]=useState("");
  const [minutes,setMinutes]=useState(210);
  const [party,setParty]=useState(2);
  const [strict,setStrict]=useState(false);
  const [result,setResult]=useState(null);
  const [choice,setChoice]=useState("best");
  const [road,setRoad]=useState(null);
  const [routeGeometry,setRouteGeometry]=useState(null);
  const [loading,setLoading]=useState(false);
  const chosen=result?(choice==="alternate"?result.alternate:result.best):null;
  const change=fn=>v=>{fn(v);setResult(null);setRoad(null);setRouteGeometry(null);};
  const submit=e=>{
    e.preventDefault();
    const next=planFoodDay({data:foodData,venues,origin:{...origins["Traverse City"],address:"Traverse City, MI"},
      date,startTime,windowMinutes:Number(minutes),partySize:Number(party),strictWinery:strict,
      asOf:localToday()});
    setResult(next);setChoice("best");setRoad(null);setRouteGeometry(null);
    trackWineEvent("wine_food_verdict_returned",{
      verdict:next.state,meal:"full_lunch",region:"old_mission",
      duration:Number(minutes),partyBucket:Number(party)>4?"5_plus":String(party)
    });
  };
  const pickAlternate=()=>{
    if(!result?.alternate)return;
    setChoice(choice==="best"?"alternate":"best");setRoad(null);setRouteGeometry(null);
  };
  async function checkRoad(){
    if(!chosen||loading)return;
    setLoading(true);setRoad(null);setRouteGeometry(null);
    try{
      const r=await fetch("/api/route",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({coordinates:chosen.points.map(p=>[p.lng,p.lat])}),
      });
      if(!r.ok)throw Error("road service unavailable");
      const body=await r.json();
      if(!body.ok||!Array.isArray(body.legs))throw Error("no verified route");
      const evaluated=evaluateRouteLegs(chosen,body.legs,{
        date,startTime,windowMinutes:Number(minutes),partySize:Number(party),
        venues,data:foodData,asOf:localToday()});
      setRoad(evaluated);
      if(evaluated.routeType==="ROAD_PROVIDER_ESTIMATE"&&Array.isArray(body.geometry)&&body.geometry.length>1)
        setRouteGeometry(body.geometry);
      trackWineEvent("wine_food_route_checked",{result:evaluated.state,context:"wineries_food"});
    }catch{
      setRoad({state:"ROUTE_UNAVAILABLE",reason:"The road service could not calculate a route. Displayed drive times are geographic planning buffers, not a live ETA."});
    }finally{setLoading(false)}
  }
  const schedule=road?.schedule||chosen?.schedule;
  const more=chosen?.winery;
  const routeGood=road?.routeType==="ROAD_PROVIDER_ESTIMATE";
  return (
    <section className="food-v7" aria-labelledby="food-v7-title">
      <div className="food-v7-intro">
        <span className="food-v7-kicker">Food & Wine Day · V7 decision preview</span>
        <h2 id="food-v7-title">A real lunch with wine. A day that fits.</h2>
        <p>Start with the meal—not a five-winery checklist. We protect 75 minutes for lunch, allow at most one extra tasting, and show which facts still need confirmation.</p>
      </div>
      <form className="food-v7-form" onSubmit={submit}>
        <div className="food-v7-static"><strong>Old Mission Peninsula</strong><span>Full lunch · start from Traverse City</span></div>
        <label>Visit date
          <input type="date" value={date} min={localToday()} required onChange={e=>change(setDate)(e.target.value)}/>
        </label>
        <label>Start your outing
          <input type="time" value={startTime} required onChange={e=>change(setStartTime)(e.target.value)}/>
        </label>
        <label>Time available
          <select value={minutes} onChange={e=>change(setMinutes)(Number(e.target.value))}>
            <option value={180}>3 hours</option>
            <option value={210}>3½ hours</option>
            <option value={240}>4 hours</option>
          </select>
        </label>
        <label>Party size
          <select value={party} onChange={e=>change(setParty)(Number(e.target.value))}>
            {[1,2,3,4,5,6,7,8].map(n=><option key={n} value={n}>{n} {n===1?"person":"people"}</option>)}
          </select>
        </label>
        <label className="food-v7-check"><input type="checkbox" checked={strict} onChange={e=>change(setStrict)(e.target.checked)}/>
          Lunch must be at a winery
        </label>
        <button type="submit" className="food-v7-primary">Find my food-and-wine day →</button>
      </form>
      {!result&&<p className="food-v7-help">Choose a date and start time to see a researched meal-first route. The map currently shows source-reviewed Old Mission locations; it does not indicate live openings.</p>}
      {result&&<div className="food-v7-verdict" aria-live="polite">
        {chosen?<>
          <span className="food-v7-kicker">{choice==="best"?"Suggested route":"Alternative route"} · {labels[road?.state||chosen.status]||"Check with operator"}</span>
          <h3>{chosen.locationName}{more?" + "+more.name:""}</h3>
          <p><strong>Why this works:</strong> {chosen.mealType==="SUBSTANTIAL"?"The operator publishes a substantial menu at this winery.":"The operator publishes full-meal food at this dining stop."} {more?"Then visit one nearby tasting room, if its posted hours hold.":"One wine-and-food stop is enough; there is no forced second appointment."}</p>
          <p className="food-v7-honesty"><strong>What still needs confirmation:</strong> {road?.reason||chosen.reason} No reservation or kitchen availability has been checked. {more&&more.needsHours?"The additional tasting-room hours are also unconfirmed.":""}</p>
          <div className="food-v7-timeline" aria-label="Provisional itinerary">
            <div><span>Meal</span><strong>{prettyClock(schedule.mealArrive)}–{prettyClock(schedule.mealLeave)}</strong><small>{chosen.locationName} · 75 minutes</small></div>
            {more&&<div><span>Wine</span><strong>{prettyClock(schedule.tastingArrive)}–{prettyClock(schedule.tastingLeave)}</strong><small>{more.name} · posted tasting-room hours only</small></div>}
            <div><span>Back in town</span><strong>{prettyClock(schedule.finish)}</strong><small>{schedule.driveMinutes} minutes total driving {routeGood?"· routing-service estimate":"· geographic planning buffer"}</small></div>
          </div>
          {(road?.state==="TIME_CONFLICT"||road?.state==="HOURS_CONFLICT"||road?.state==="KITCHEN_CLOSED")&&
            <p className="food-v7-alert">This route failed the road-time or service-window check. It is not a workable recommendation. Choose a longer window or different start time.</p>}
          <div className="food-v7-actions">
            <a href={chosen.menuUrl} target="_blank" rel="noopener noreferrer" onClick={()=>trackWineEvent("wine_food_menu_opened",{context:"wineries_food"})}>Official menu <span aria-hidden="true">↗</span></a>
            <a href={chosen.reservationUrl||chosen.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={()=>trackWineEvent("wine_food_operator_opened",{context:"wineries_food"})}>Booking & service details <span aria-hidden="true">↗</span></a>
            <button type="button" onClick={checkRoad} disabled={loading}>{loading?"Checking road route…":"Check real-road drive"}</button>
            <a href={chosen.drivingUrl} target="_blank" rel="noopener noreferrer" onClick={()=>trackWineEvent("wine_food_directions_opened",{context:"wineries_food"})}>Open directions ↗</a>
          </div>
          {result.alternate&&<button type="button" className="food-v7-alt" onClick={pickAlternate}>
            {choice==="best"?"See alternative: "+result.alternate.locationName:"Back to suggested route"}
          </button>}
          <p className="food-v7-fine">Menu/source reviewed {chosen.sourceVerifiedAt}; review due {chosen.reviewDue}. Plan does not check table availability, traffic or reservations. Arrange safe transportation for wine tastings.</p>
        </>:<>
          <h3>{labels[result.state]||"No verified option for this window"}</h3>
          <p>{result.reason} We will not substitute a snack board for a full lunch or invent a reservation.</p>
          <a href="https://tcwine.chrisizworski.com/old-mission-peninsula-wineries">Explore the Old Mission winery map →</a>
        </>}
      </div>}
      <div className="food-v7-map-head">
        <h3>{chosen?"Your meal-first map":"Source-reviewed food locations"}</h3>
        <p>{routeGood?"Road-route geometry from the routing provider. Times are estimates, not live traffic.":"Dashed connecting lines are geographic planning sketches, not road directions. Use Check real-road drive for routing-service estimates."}</p>
      </div>
      <FoodDayMap candidate={chosen} geometry={routeGeometry} roadVerified={routeGood}/>
      <p className="food-v7-map-footer">All locations come from published venue or geolocation sources. Need to customize every tasting stop? <a href="/old-mission-peninsula-wineries">Open the full Old Mission winery planner</a>.</p>
    </section>
  );
}
