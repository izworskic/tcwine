"use client";

import { useMemo, useState } from "react";
import venues from "@/data/venues.json";
import truth from "@/data/wine-truth.json";
import { scoreWinery, WINE_INTENTS } from "@/lib/wine-day-engine";
import { trackWineEvent } from "@/lib/wine-analytics";

const WINERIES=venues.filter(v=>v.category==="winery").sort((a,b)=>a.name.localeCompare(b.name));
const TRUTH=new Map(truth.records.map(r=>[r.id,r]));
const INTENTS=["first-trip","serious-wine","riesling","sparkling","reds","whites","cabernet-franc","pinot-noir","chardonnay","sauvignon-blanc","gewurztraminer","merlot","pinot-gris","food","views","quiet"];

function label(v){
  return String(v||"").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());
}
function formatHours(v){
  if(v.needsHours) return "Call ahead";
  const entries=Object.entries(v.hours||{}).filter(([,h])=>h&&!h.closed);
  if(!entries.length) return "Hours not verified";
  const unique=[...new Set(entries.map(([,h])=>`${h.open}–${h.close}`))];
  return unique.length===1?unique[0]:"Hours vary by day";
}
function Row({name,a,b,render=(x)=>x||"—"}){
  return <div className="compare-row">
    <div className="compare-label">{name}</div>
    <div>{render(a)}</div>
    <div>{render(b)}</div>
  </div>;
}

export default function WineryCompare(){
  const [left,setLeft]=useState("mari-vineyards");
  const [right,setRight]=useState("mawby");
  const [intent,setIntent]=useState("serious-wine");

  const a=WINERIES.find(v=>v.id===left)||WINERIES[0];
  const b=WINERIES.find(v=>v.id===right)||WINERIES[1];
  const aTruth=TRUTH.get(a.id)||{};
  const bTruth=TRUTH.get(b.id)||{};
  const aScore=useMemo(()=>scoreWinery(a,intent),[a,intent]);
  const bScore=useMemo(()=>scoreWinery(b,intent),[b,intent]);

  function change(side,value){
    if(side==="left") setLeft(value); else setRight(value);
    trackWineEvent("wine_compare_changed",{side,winery:value,intent});
  }

  return (
    <section className="winery-compare" aria-labelledby="compare-title">
      <div className="compare-head">
        <p className="wine-world-eyebrow">Winery vs. winery</p>
        <h2 id="compare-title">Compare what actually matters before you drive there.</h2>
        <p>Choose two wineries and a wine-day intent. The comparison uses wine-style fit, tasting character, setting, food, hours, and official trail membership—not a generic popularity rank.</p>
      </div>

      <div className="compare-controls">
        <label>First winery
          <select value={left} onChange={e=>change("left",e.target.value)}>
            {WINERIES.map(v=><option key={v.id} value={v.id} disabled={v.id===right}>{v.name}</option>)}
          </select>
        </label>
        <label>Second winery
          <select value={right} onChange={e=>change("right",e.target.value)}>
            {WINERIES.map(v=><option key={v.id} value={v.id} disabled={v.id===left}>{v.name}</option>)}
          </select>
        </label>
        <label>Compare for
          <select value={intent} onChange={e=>{setIntent(e.target.value);trackWineEvent("wine_compare_intent_changed",{intent:e.target.value});}}>
            {INTENTS.map(i=><option key={i} value={i}>{WINE_INTENTS[i].label}</option>)}
          </select>
        </label>
      </div>

      <div className="compare-grid" role="table" aria-label="Winery comparison">
        <div className="compare-row compare-wineries" role="row">
          <div className="compare-label"></div>
          {[a,b].map(v=><div key={v.id}>
            <strong>{v.name}</strong>
            <span>{v.town} · {v.area==="old-mission"?"Old Mission":v.area==="leelanau"?"Leelanau":"Traverse City"}</span>
          </div>)}
        </div>
        <Row name="Wine Day Fit" a={aScore.score} b={bScore.score} render={x=><strong className="compare-fit">{x}/100</strong>} />
        <Row name="Why it fits" a={aTruth.signature} b={bTruth.signature} />
        <Row name="Verified varietals / styles" a={a.varietals?.length?a.varietals:aTruth.styleStrengths} b={b.varietals?.length?b.varietals:bTruth.styleStrengths} render={x=><div className="truth-tags">{(x||[]).slice(0,10).map(t=><span key={t}>{label(t)}</span>)}</div>} />
        <Row name="Best for" a={aTruth.bestFor} b={bTruth.bestFor} render={x=><div className="truth-tags">{(x||[]).slice(0,7).map(t=><span key={t}>{label(t)}</span>)}</div>} />
        <Row name="Setting" a={`${label(a.vibe)} · ${label(a.view)} view`} b={`${label(b.vibe)} · ${label(b.view)} view`} />
        <Row name="Food" a={label(a.food)||"No on-site food noted"} b={label(b.food)||"No on-site food noted"} />
        <Row name="Hours" a={formatHours(a)} b={formatHours(b)} />
        <Row name="Trail status" a={a.officialTrail?.name||"Independent / not listed as a current trail member"} b={b.officialTrail?.name||"Independent / not listed as a current trail member"} />
        <Row name="Watch for" a={(aTruth.avoidIf||[]).join("; ")} b={(bTruth.avoidIf||[]).join("; ")} />
        <div className="compare-row compare-actions">
          <div className="compare-label">Open</div>
          {[a,b].map(v=><div key={v.id}>
            <a href={`/winery/${v.id}`}>Full winery guide</a>
            <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer">Map</a>
            {v.website&&<a href={v.website} target="_blank" rel="noopener noreferrer">Winery site</a>}
          </div>)}
        </div>
      </div>
      <p className="compare-note">Wine Day Fit measures how well each winery matches the selected intent. It is not a critic score and does not claim one winery makes objectively better wine.</p>
    </section>
  );
}
