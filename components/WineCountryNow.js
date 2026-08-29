"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { activeAndUpcomingEvents, formatEventDate, wineEventWatches, WINE_EVENTS_UPDATED } from "@/lib/wine-events";
import { trackWineEvent } from "@/lib/wine-analytics";

function stateLabel(state){
  if(state==="active") return "Happening now";
  if(state==="today") return "Today";
  return "Upcoming";
}

export default function WineCountryNow({compact=false}){
  const [now]=useState(()=>Date.now());
  const items=useMemo(()=>activeAndUpcomingEvents(now),[now]);
  const visible=compact?items.slice(0,2):items;

  if(compact){
    const first=visible[0];
    if(!first) return null;
    return (
      <aside className="wine-now-strip" aria-label="Wine country now">
        <div>
          <span className="wine-now-kicker">{stateLabel(first.state)} · verified {WINE_EVENTS_UPDATED}</span>
          <strong>{first.event.title}</strong>
          <span>{formatEventDate(first.event)} · {first.event.area==="leelanau"?"Leelanau":first.event.area==="old-mission"?"Old Mission":"Traverse City"}</span>
        </div>
        <Link href="/wine-country-now" onClick={()=>trackWineEvent("wine_now_opened",{from:"home_strip"})}>See what’s happening</Link>
      </aside>
    );
  }

  return (
    <section className="wine-now" aria-labelledby="wine-now-title">
      <div className="wine-now-head">
        <div>
          <p className="wine-world-eyebrow">Wine Country Now</p>
          <h2 id="wine-now-title">What is actually happening in wine country?</h2>
          <p>Only dated events with a named source make this board. Past events disappear automatically. Unpublished rumors stay in the watch list until an official source posts real details.</p>
        </div>
        <div className="wine-now-verified">Sources checked <strong>{WINE_EVENTS_UPDATED}</strong></div>
      </div>

      <div className="wine-now-grid">
        {visible.map(({event,state,next})=>(
          <article className="wine-now-card" key={event.id}>
            <div className="wine-now-card-top">
              <span className={"wine-now-state "+state}>{stateLabel(state)}</span>
              <span>{event.area==="leelanau"?"Leelanau":event.area==="old-mission"?"Old Mission":"Traverse City"}</span>
            </div>
            <h3><Link href={"/events/"+event.id}>{event.title}</Link></h3>
            <p className="wine-now-date">{formatEventDate(event)}</p>
            <p>{event.summary}</p>
            <div className="wine-now-truth"><strong>Planning truth:</strong> {event.planningTruth}</div>
            <div className="wine-now-actions">
              <Link href={"/events/"+event.id}>Plan around it</Link>
              <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer"
                onClick={()=>trackWineEvent("wine_event_source_opened",{event:event.id})}>Official / source details</a>
            </div>
          </article>
        ))}
      </div>

      {wineEventWatches.length>0&&(
        <div className="wine-watch">
          <span className="wine-world-eyebrow">Watching, not guessing</span>
          {wineEventWatches.map(w=>(
            <div key={w.id}>
              <strong>{w.title}</strong>
              <p>{w.note}</p>
              <a href={w.sourceUrl} target="_blank" rel="noopener noreferrer">Check official trail</a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
