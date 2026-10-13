"use client";

import { useMemo, useState } from "react";
import { buildWineDays, intentWineCopy, WINE_INTENTS } from "@/lib/wine-day-engine";
import { trackWineEvent } from "@/lib/wine-analytics";

const AREAS=[
  ["leelanau","Leelanau"],
  ["old-mission","Old Mission"],
  ["any","Surprise me"],
];

const INTENTS=[
  "first-trip","serious-wine","riesling","sparkling","reds","whites","food","views","quiet"
];

function tagLabel(t){
  return String(t||"").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
}

export default function WineDayComposer({initialArea="leelanau",initialIntent="first-trip"}={}){
  const [area,setArea]=useState(AREAS.some(([v])=>v===initialArea)?initialArea:"leelanau");
  const [intent,setIntent]=useState(INTENTS.includes(initialIntent)?initialIntent:"first-trip");
  const [addPlace,setAddPlace]=useState(false);
  const [date,setDate]=useState(()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");});
  const [firstArrival,setFirstArrival]=useState("11:00");
  const [hoursAvailable,setHoursAvailable]=useState(6);

  const days=useMemo(
    ()=>buildWineDays({area,intent,date,addPlace,firstArrival,hoursAvailable}),
    [area,intent,date,addPlace,firstArrival,hoursAvailable]
  );
  const intentCopy=intentWineCopy(intent);

  function choose(kind,value,setter){
    setter(value);
    trackWineEvent("wine_truth_filter_changed",{kind,value});
  }

  return (
    <section className="wine-truth" aria-labelledby="wine-truth-title">
      <div className="wine-truth-head">
        <div>
          <p className="wine-world-eyebrow">Wine Country Truth Engine</p>
          <h2 id="wine-truth-title">Start with the wine. Then build the day around it.</h2>
          <p>
            Tell the planner what you actually care about in the glass. It scores winery fit,
            route coherence, lineup variety, and experience balance, then shows up to three feasible wine-led days.
            A high score means the itinerary fits your goal. It is not an objective rating of wine quality.
          </p>
        </div>
        <div className="wine-truth-proof">
          <span><strong>43</strong> wineries scored</span>
          <span><strong>3</strong> wineries per day</span>
          <span><strong>1</strong> optional non-wine break</span>
        </div>
      </div>

      <div className="wine-truth-controls">
        <fieldset>
          <legend>Where</legend>
          <div className="truth-chips">
            {AREAS.map(([value,label])=>(
              <button key={value} type="button" className={area===value?"truth-chip on":"truth-chip"}
                onClick={()=>choose("area",value,setArea)}>{label}</button>
            ))}
          </div>
        </fieldset>

        <fieldset className="truth-intent-field">
          <legend>What kind of wine day?</legend>
          <div className="truth-chips">
            {INTENTS.map(value=>(
              <button key={value} type="button" className={intent===value?"truth-chip on wine":"truth-chip"}
                onClick={()=>choose("intent",value,setIntent)}>
                {WINE_INTENTS[value].label}
              </button>
            ))}
          </div>
          <p className="truth-intent-copy">{intentCopy.description}</p>
        </fieldset>

        <fieldset>
          <legend>Date</legend>
          <input className="truth-date" type="date" value={date}
            onChange={(e)=>choose("date",e.target.value,setDate)} />
          <div className="wine-day-logistics">
            <label>First winery arrival
              <select aria-label="First winery arrival" value={firstArrival} onChange={e=>choose("first_arrival",e.target.value,setFirstArrival)}>
                {["10:00","11:00","12:00","13:00","14:00","15:00"].map(t=><option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>Time available after first arrival
              <select aria-label="Hours available" value={hoursAvailable} onChange={e=>choose("hours_available",e.target.value,v=>setHoursAvailable(Number(v)))}>
                <option value={3}>3 hours</option><option value={4}>4 hours</option><option value={6}>6 hours</option><option value={8}>8 hours</option>
              </select>
            </label>
          </div>
          <label className="truth-check">
            <input type="checkbox" checked={addPlace}
              onChange={(e)=>{
                setAddPlace(e.target.checked);
                trackWineEvent("wine_truth_filter_changed",{kind:"add_place",value:e.target.checked?"yes":"no"});
              }} />
            Add one worthwhile non-wine break
          </label>
        </fieldset>
      </div>

      <p className="wine-day-contract"><strong>Before you choose:</strong> This clock starts at arrival to your first winery, excluding your drive from lodging. Closed or over-budget trips are excluded; unknown hours stay conditional. Travel buffers are estimates, not live road routing. Check the road map before leaving.</p>
      <div className="truth-results" aria-live="polite">
        {!days.length&&<div className="wine-day-no-fit" role="status"><h3>No reliable three-stop day fits these inputs.</h3><p>Try a longer window, an earlier first arrival, or another date. We will not recommend a winery after its posted close.</p></div>}
        {days.map((day)=>(
          <article className="truth-day" key={day.wineries.map(w=>w.id).join("-")}>
            <div className="truth-day-top">
              <div>
                <span className="truth-rank">Option {day.rank}</span>
                <h3>{day.wineries.map(w=>w.name.replace(/ Winery.*| Vineyard.*| Vineyards.*/,"")).join(" → ")}</h3>
              </div>
              <div className="truth-score" aria-label={`Wine Day Fit ${day.score} out of 100`}>
                <strong>{day.score}</strong><span>Wine Day Fit</span>
              </div>
            </div>

            <div className="truth-metrics">
              <span><strong>{day.wineFit}</strong> wine fit</span>
              <span><strong>{day.routeFit}</strong> route fit</span>
              <span><strong>{day.varietyFit}</strong> lineup variety</span>
              <span><strong>{day.routeMiles} mi</strong> between wineries</span>
            </div>

            <p className="truth-why">{day.why}</p>
            <div className="wine-day-confidence" data-state={day.window.state}>
              <strong>{day.window.state==="CALL_AHEAD"?"Call-ahead required":"Fits posted weekly hours"}</strong>
              <span>{day.window.reason}</span>
            </div>
            <p className="wine-day-timing"><strong>First arrival:</strong> {day.window.firstArrival} · <strong>Last departure:</strong> {day.window.lastDeparture} · <strong>Estimated driving buffer between wineries:</strong> {day.window.estimatedDriveMinutes} minutes</p>

            <ol className="truth-stops">
              {day.wineries.map((w,i)=>(
                <li key={w.id}>
                  <div className="truth-stop-num">{i+1}</div>
                  <div className="truth-stop-body">
                    <p className="wine-day-stop-time">{day.window.schedule[i]?.arrive}–{day.window.schedule[i]?.leave} · {day.window.schedule[i]?.hoursState==="UNCONFIRMED"?"Hours unconfirmed: call ahead":"Based on posted weekly hours"}</p>
                    <div className="truth-stop-title">
                      <strong><a className="truth-winery-link" href={`/winery/${w.id}`}>{w.name}</a></strong>
                      <span>{w.fit} fit</span>
                    </div>
                    <p>{w.signature}</p>
                    <div className="truth-tags">
                      {(w.tags||[]).slice(0,5).map(t=><span key={t}>{tagLabel(t)}</span>)}
                      {w.view&&<span>{tagLabel(w.view)} view</span>}
                    </div>
                    <div className="truth-stop-actions">
                      <a href={`/winery/${w.id}`}>Full guide</a>
                      {w.website&&<a href={w.website} target="_blank" rel="noopener noreferrer">Winery site</a>}
                      <a href={w.mapsUrl} target="_blank" rel="noopener noreferrer"
                        onClick={()=>trackWineEvent("wine_truth_winery_opened",{winery:w.id,intent})}>Map it</a>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {day.place&&(
              <div className="truth-place">
                <span>One break, not the headline</span>
                <strong>{day.place.name}</strong>
                <p>{day.place.note}</p>
                <a href={day.place.mapsUrl} target="_blank" rel="noopener noreferrer">Map the break</a>
              </div>
            )}

            <p className="wine-day-contract">{day.window.disclaimer}{addPlace?" An additional 45-minute break is included, but travel to that place is not individually routed.":""} The distances above are straight-line miles, not road miles.</p>
            <div className="truth-day-foot">
              <span>Three wineries maximum, with time for the glass and the setting.</span>
              <a className="wine-day-road-link" target="_blank" rel="noopener noreferrer" href={"https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(day.wineries[0].lat+","+day.wineries[0].lng)+"&destination="+encodeURIComponent(day.wineries[2].lat+","+day.wineries[2].lng)+"&waypoints="+encodeURIComponent(day.wineries[1].lat+","+day.wineries[1].lng)+"&travelmode=driving"} onClick={()=>trackWineEvent("wine_truth_route_opened",{area,intent})}>Verify driving route</a>
              <button type="button" onClick={()=>{
                navigator.clipboard?.writeText(["Wine day "+date+" · first winery at "+firstArrival,...day.wineries.map((w,i)=>day.window.schedule[i]?.arrive+" "+w.name+(day.window.schedule[i]?.hoursState==="UNCONFIRMED"?" (call ahead)":"")),day.window.disclaimer].join("\n"));
                trackWineEvent("wine_truth_day_copied",{intent,area,score:day.score});
              }}>Copy winery order</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
