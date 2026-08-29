import data from "@/data/wine-events.json";

export const wineEvents=data.events;
export const wineEventWatches=data.watches;
export const WINE_EVENTS_UPDATED=data.updated;

function timestamps(event){
  if(Array.isArray(event.dates)) return event.dates.map(d=>new Date(d).getTime()).filter(Number.isFinite);
  const out=[];
  if(event.start) out.push(new Date(event.start).getTime());
  if(event.end) out.push(new Date(event.end).getTime());
  return out;
}

export function nextOccurrence(event,now=Date.now()){
  if(Array.isArray(event.dates)){
    const next=event.dates.map(d=>new Date(d)).filter(d=>!Number.isNaN(d.getTime())&&d.getTime()>=now).sort((a,b)=>a-b)[0];
    return next||null;
  }
  const start=event.start?new Date(event.start):null;
  const end=event.end?new Date(event.end):start;
  if(end && end.getTime()<now) return null;
  return start;
}

export function eventState(event,now=Date.now()){
  if(Array.isArray(event.dates)){
    const next=nextOccurrence(event,now);
    if(!next) return "past";
    const sameDay=new Date(now).toDateString()===next.toDateString();
    return sameDay?"today":"upcoming";
  }
  const start=event.start?new Date(event.start).getTime():null;
  const end=event.end?new Date(event.end).getTime():start;
  if(end && now>end) return "past";
  if(start && now>=start && (!end||now<=end)){
    if(Array.isArray(event.excludedWeekdays) && event.excludedWeekdays.includes(new Date(now).toLocaleDateString("en-US",{weekday:"long"}))) return "paused";
    return "active";
  }
  return "upcoming";
}

export function activeAndUpcomingEvents(now=Date.now()){
  return wineEvents
    .map(event=>({event,state:eventState(event,now),next:nextOccurrence(event,now)}))
    .filter(x=>x.state!=="past")
    .sort((a,b)=>{
      const ar=a.state==="active"?-1:0;
      const br=b.state==="active"?-1:0;
      if(ar!==br) return ar-br;
      return (a.next?.getTime()||Infinity)-(b.next?.getTime()||Infinity);
    });
}

export function formatEventDate(event,{all=false}={}){
  const fmt=new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric",year:"numeric"});
  if(Array.isArray(event.dates)){
    const ds=event.dates.map(d=>new Date(d)).filter(d=>!Number.isNaN(d.getTime()));
    if(!ds.length) return "";
    if(ds.length===1) return fmt.format(ds[0]);
    if(all || ds.length<=4) return ds.map(d=>fmt.format(d)).join(" · ");
    return `${fmt.format(ds[0])} + ${ds.length-1} more dates`;
  }
  const s=event.start?new Date(event.start):null;
  const e=event.end?new Date(event.end):null;
  if(!s) return "";
  if(!e||s.toDateString()===e.toDateString()) return fmt.format(s);
  return `${fmt.format(s)} – ${fmt.format(e)}`;
}

export function getWineEvent(id){
  return wineEvents.find(e=>e.id===id)||null;
}
