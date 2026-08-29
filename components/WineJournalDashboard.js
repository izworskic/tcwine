"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import venues from "@/data/venues.json";
import { readWineJournal, removeWineJournalEntry, saveWineJournalEntry, wineJournalCounts } from "@/lib/wine-journal";
import { trackWineEvent } from "@/lib/wine-analytics";

const WINERIES=venues.filter(v=>v.category==="winery").sort((a,b)=>a.name.localeCompare(b.name));

function pretty(v){return String(v||"").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());}

export default function WineJournalDashboard(){
  const [journal,setJournal]=useState({version:1,entries:{}});
  const [filter,setFilter]=useState("all");
  const [quickId,setQuickId]=useState(WINERIES[0]?.id||"");

  function refresh(){setJournal(readWineJournal());}
  useEffect(()=>{
    refresh();
    const fn=()=>refresh();
    window.addEventListener("tcwine:journal-changed",fn);
    return ()=>window.removeEventListener("tcwine:journal-changed",fn);
  },[]);

  const counts=wineJournalCounts(journal);
  const entries=useMemo(()=>{
    const all=Object.values(journal.entries||{}).map(e=>({
      ...e,
      venue:WINERIES.find(v=>v.id===e.wineryId)
    })).filter(e=>e.venue);
    if(filter==="visited") return all.filter(e=>e.status==="visited");
    if(filter==="want") return all.filter(e=>e.status==="want");
    if(filter==="favorites") return all.filter(e=>e.favorite);
    return all;
  },[journal,filter]);

  function quickAdd(){
    if(!quickId) return;
    saveWineJournalEntry(quickId,{status:"want",favorite:false,favoriteWine:"",note:"",visitedDate:""});
    refresh();
    trackWineEvent("wine_journal_quick_added",{winery:quickId});
  }

  function remove(id){
    removeWineJournalEntry(id); refresh();
    trackWineEvent("wine_journal_removed",{winery:id,from:"dashboard"});
  }

  function copySummary(){
    const lines=Object.values(journal.entries||{}).map(e=>{
      const v=WINERIES.find(x=>x.id===e.wineryId);
      if(!v) return null;
      const bits=[v.name,e.status==="visited"?"visited":"want to taste"];
      if(e.favorite) bits.push("favorite");
      if(e.favoriteWine) bits.push(e.favoriteWine);
      if(e.note) bits.push(e.note);
      return bits.join(" — ");
    }).filter(Boolean);
    navigator.clipboard?.writeText(lines.join("\n"));
    trackWineEvent("wine_journal_summary_copied",{entries:lines.length});
  }

  return (
    <section className="wine-journal-dashboard">
      <div className="journal-dashboard-proof">
        <div><strong>{counts.visited}</strong><span>visited</span></div>
        <div><strong>{counts.want}</strong><span>want to taste</span></div>
        <div><strong>{counts.favorites}</strong><span>favorites</span></div>
        <div><strong>{WINERIES.length}</strong><span>wineries in planner</span></div>
      </div>

      <div className="journal-quick">
        <label>Add a winery to your list
          <select value={quickId} onChange={e=>setQuickId(e.target.value)}>
            {WINERIES.map(v=><option value={v.id} key={v.id}>{v.name}</option>)}
          </select>
        </label>
        <button type="button" onClick={quickAdd}>Want to taste</button>
      </div>

      <div className="journal-filterbar">
        {[
          ["all","All"],["visited","Visited"],["want","Want to taste"],["favorites","Favorites"]
        ].map(([value,label])=><button type="button" key={value} className={filter===value?"on":""} onClick={()=>setFilter(value)}>{label}</button>)}
        {counts.total>0&&<button type="button" className="journal-copy" onClick={copySummary}>Copy journal summary</button>}
      </div>

      {!entries.length?(
        <div className="journal-empty">
          <h2>{counts.total?"Nothing in this filter yet":"Your wine journal is empty."}</h2>
          <p>Open any winery guide to save a tasting note, mark it visited, or add it to your want-to-taste list.</p>
          <Link href="/wine/first-trip">Find a first wine day</Link>
        </div>
      ):(
        <div className="journal-entry-grid">
          {entries.sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||"")).map(e=>(
            <article key={e.wineryId} className="journal-entry">
              <div className="journal-entry-top">
                <span className={"journal-entry-status "+e.status}>{e.status==="visited"?"Visited":"Want to taste"}</span>
                {e.favorite&&<span className="journal-heart">Favorite</span>}
              </div>
              <h2><Link href={"/winery/"+e.wineryId}>{e.venue.name}</Link></h2>
              <p className="journal-entry-meta">{e.venue.town} · {e.venue.area==="old-mission"?"Old Mission":e.venue.area==="leelanau"?"Leelanau":"Traverse City"}{e.visitedDate?" · "+e.visitedDate:""}</p>
              {e.favoriteWine&&<div className="journal-memory"><strong>Remember:</strong> {e.favoriteWine}</div>}
              {e.note&&<p className="journal-note">{e.note}</p>}
              <div className="journal-entry-tags">{(e.venue.tags||[]).slice(0,5).map(t=><span key={t}>{pretty(t)}</span>)}</div>
              <div className="journal-entry-actions">
                <Link href={"/winery/"+e.wineryId}>Open winery</Link>
                <button type="button" onClick={()=>remove(e.wineryId)}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="journal-local-note">This journal is stored only in this browser using local storage. Clearing browser storage clears the journal; there is no account sync yet.</p>
    </section>
  );
}
