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

export default function WineDayComposer(){
  const [area,setArea]=useState("leelanau");
  const [intent,setIntent]=useState("first-trip");
  const [addPlace,setAddPlace]=useState(false);
  const [date,setDate]=useState(()=>new Date().toISOString().slice(0,10));

  const days=useMemo(
    ()=>buildWineDays({area,intent,date,addPlace}),
    [area,intent,date,addPlace]
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
            route coherence, lineup variety, and experience balance, then returns three wine-led days.
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

      <div className="truth-results" aria-live="polite">
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

            <ol className="truth-stops">
              {day.wineries.map((w,i)=>(
                <li key={w.id}>
                  <div className="truth-stop-num">{i+1}</div>
                  <div className="truth-stop-body">
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

            <div className="truth-day-foot">
              <span>Wine remains the anchor: three winery stops, deliberately capped to reduce palate fatigue.</span>
              <button type="button" onClick={()=>{
                navigator.clipboard?.writeText(day.wineries.map(w=>w.name).join(" → "));
                trackWineEvent("wine_truth_day_copied",{intent,area,score:day.score});
              }}>Copy winery order</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
