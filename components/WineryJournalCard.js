"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { readWineJournal, removeWineJournalEntry, saveWineJournalEntry } from "@/lib/wine-journal";
import { trackWineEvent } from "@/lib/wine-analytics";

export default function WineryJournalCard({wineryId,wineryName}){
  const [entry,setEntry]=useState(null);
  const [status,setStatus]=useState("");
  const [favorite,setFavorite]=useState(false);
  const [favoriteWine,setFavoriteWine]=useState("");
  const [note,setNote]=useState("");
  const [visitedDate,setVisitedDate]=useState("");
  const [saved,setSaved]=useState(false);

  useEffect(()=>{
    const e=readWineJournal().entries[wineryId]||null;
    setEntry(e);
    setStatus(e?.status||"");
    setFavorite(Boolean(e?.favorite));
    setFavoriteWine(e?.favoriteWine||"");
    setNote(e?.note||"");
    setVisitedDate(e?.visitedDate||"");
  },[wineryId]);

  function save(){
    const next=saveWineJournalEntry(wineryId,{
      status:status||"want",
      favorite,
      favoriteWine:favoriteWine.slice(0,120),
      note:note.slice(0,1000),
      visitedDate:status==="visited"?visitedDate:"",
    });
    setEntry(next);
    setSaved(true);
    setTimeout(()=>setSaved(false),1400);
    trackWineEvent("wine_journal_saved",{winery:wineryId,status:next.status,favorite:Boolean(next.favorite)});
  }

  function clear(){
    removeWineJournalEntry(wineryId);
    setEntry(null); setStatus(""); setFavorite(false); setFavoriteWine(""); setNote(""); setVisitedDate("");
    trackWineEvent("wine_journal_removed",{winery:wineryId});
  }

  return (
    <section className="winery-journal-card" aria-labelledby={"journal-"+wineryId}>
      <div className="journal-card-head">
        <div>
          <p className="wine-world-eyebrow">My Wine Journal</p>
          <h2 id={"journal-"+wineryId}>Remember {wineryName}</h2>
        </div>
        <Link href="/my-wine-journal">Open full journal</Link>
      </div>
      <p className="journal-privacy">Saved only in this browser. Tasting notes are not sent with analytics.</p>

      <div className="journal-status">
        <button type="button" className={status==="want"?"on":""} onClick={()=>setStatus("want")}>Want to taste</button>
        <button type="button" className={status==="visited"?"on":""} onClick={()=>setStatus("visited")}>Visited</button>
        <label className="journal-favorite"><input type="checkbox" checked={favorite} onChange={e=>setFavorite(e.target.checked)} /> Favorite</label>
      </div>

      {status==="visited"&&(
        <label className="journal-field">Visit date
          <input type="date" value={visitedDate} onChange={e=>setVisitedDate(e.target.value)} />
        </label>
      )}
      <label className="journal-field">Wine I want to remember
        <input value={favoriteWine} maxLength={120} placeholder="e.g. dry Riesling, Cabernet Franc…" onChange={e=>setFavoriteWine(e.target.value)} />
      </label>
      <label className="journal-field">Tasting note
        <textarea value={note} maxLength={1000} rows={3} placeholder="What stood out? What would you order again?" onChange={e=>setNote(e.target.value)} />
      </label>
      <div className="journal-actions">
        <button type="button" className="journal-save" onClick={save}>{saved?"Saved":"Save to journal"}</button>
        {entry&&<button type="button" className="journal-clear" onClick={clear}>Remove</button>}
      </div>
    </section>
  );
}
