export const WINE_JOURNAL_KEY="tcwine:wine-journal:v1";
export const WINE_JOURNAL_VERSION=1;

export function emptyJournal(){
  return {version:WINE_JOURNAL_VERSION,entries:{},updatedAt:null};
}

export function readWineJournal(){
  if(typeof window==="undefined") return emptyJournal();
  try{
    const raw=window.localStorage.getItem(WINE_JOURNAL_KEY);
    if(!raw) return emptyJournal();
    const parsed=JSON.parse(raw);
    if(!parsed||parsed.version!==WINE_JOURNAL_VERSION||typeof parsed.entries!=="object") return emptyJournal();
    return parsed;
  }catch{
    return emptyJournal();
  }
}

export function writeWineJournal(journal){
  if(typeof window==="undefined") return false;
  try{
    window.localStorage.setItem(WINE_JOURNAL_KEY,JSON.stringify(journal));
    window.dispatchEvent(new CustomEvent("tcwine:journal-changed"));
    return true;
  }catch{
    return false;
  }
}

export function saveWineJournalEntry(wineryId,patch){
  const journal=readWineJournal();
  const old=journal.entries[wineryId]||{};
  const entry={
    ...old,
    ...patch,
    wineryId,
    updatedAt:new Date().toISOString(),
  };
  journal.entries[wineryId]=entry;
  journal.updatedAt=entry.updatedAt;
  writeWineJournal(journal);
  return entry;
}

export function removeWineJournalEntry(wineryId){
  const journal=readWineJournal();
  delete journal.entries[wineryId];
  journal.updatedAt=new Date().toISOString();
  writeWineJournal(journal);
}

export function wineJournalCounts(journal){
  const entries=Object.values(journal?.entries||{});
  return {
    total:entries.length,
    visited:entries.filter(e=>e.status==="visited").length,
    want:entries.filter(e=>e.status==="want").length,
    favorites:entries.filter(e=>e.favorite).length,
    noted:entries.filter(e=>String(e.note||"").trim()).length,
  };
}
