"use client";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import venuesData from "@/data/venues.json";
import poisData from "@/data/pois.json";
import originsData from "@/data/origins.json";
import shuttleData from "@/data/shuttle.json";

export default function Planner() {
  useEffect(() => {
    const VENUES = venuesData;
    const POIS = poisData;
    const ORIGINS = originsData;
    const SHUTTLE = shuttleData;
    const ALL = VENUES.concat(POIS);
    const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const CAT_COLOR = { wine:"#7B3B4A", cider:"#B5762A", beer:"#8C7A2E", spirits:"#5C6770", mead:"#9A6A1F" };
    const POI_GREEN = "#3F7A52";
    const BEV_LABEL = { wine:"Wine", cider:"Cider", beer:"Beer", spirits:"Spirits", mead:"Mead" };
    const AREA_LABEL = { "leelanau":"Leelanau Peninsula", "old-mission":"Old Mission Peninsula", "traverse-city":"Traverse City area" };
    const AREA_ORDER = ["leelanau","old-mission","traverse-city"];
    const POI_KINDS = [["beach","Beaches"],["hike","Hikes & trails"],["scenic","Scenic spots"],["lighthouse","Lighthouses"],["town","Towns & landmarks"]];
    const POI_KIND_LABEL = Object.fromEntries(POI_KINDS);
    const STYLE_BEV = {};
    VENUES.forEach((v)=>{ const c=v.category==="winery"?"wine":v.category==="brewery"?"beer":v.category==="distillery"?"spirits":v.category==="cidery"?"cider":null; if(c) v.tags.forEach((t)=>{ if(!STYLE_BEV[t]) STYLE_BEV[t]=c; }); });
    const byId = (id) => ALL.find((v) => v.id === id);
    const accent = (v) => (v.isPoi ? POI_GREEN : (CAT_COLOR[v.beverages[0]] || "#5C6770"));

    function miles(a,b){ const R=3958.8,r=Math.PI/180; const dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r,la1=a.lat*r,la2=b.lat*r;
      const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
    const legMin = (a,b) => Math.round(miles(a,b)*2.108);
    function toMin(s){ if(!s) return null; if(s==="24:00") return 1440; const [h,m]=s.split(":").map(Number); return h*60+m; }
    function pretty(min){ if(min>=1440) return "midnight"; let h=Math.floor(min/60),m=min%60,ap=h>=12?"PM":"AM",hh=h%12; if(hh===0)hh=12; return `${hh}:${String(m).padStart(2,"0")} ${ap}`; }
    function dayName(s){ return DAYS[new Date(s+"T12:00:00").getDay()]; }
    function windowFor(v,day){ if(v.needsHours) return {open:660,close:1080,callAhead:true}; const h=v.hours[day]; if(!h||h.closed) return null; return {open:toMin(h.open),close:toMin(h.close),callAhead:false}; }
    const isOpen = (v,day) => windowFor(v,day)!==null;
    const coords = (id) => { const v=byId(id); return {lat:v.lat,lng:v.lng}; };
    const fmtDur = (m) => { const h=Math.floor(m/60),mm=m%60; return h?`${h}h ${mm}m`:`${mm}m`; };
    const prettyTag = (t) => t.replace(/-/g," ").replace(/\b\w/g,(c)=>c.toUpperCase());

    const state = {
      beverages:new Set(),
      styles:new Set(), poiKinds:new Set(), area:"any", origin:"Traverse City",
      date:new Date().toISOString().slice(0,10), start:"11:00", doneBy:"18:00",
      pace:"standard", dd:false, suggestN:3,
      selected:[], mode:"choose", scheduled:null
    };
    const originPt = () => ORIGINS[state.origin];

    // Curated starting points, each a real, geographically tight loop of well-rated,
    // open-most-days stops. Tapping one loads it and routes it; the user edits from there.
    const STARTERS = [
      { id:"old-mission", title:"An Old Mission afternoon", meta:"4 wineries · Old Mission",
        blurb:"Four hilltop tasting rooms strung up the narrow peninsula, with the bay on both sides the whole way. The easiest introduction to the area.",
        origin:"Traverse City", beverages:["wine"], poiKinds:[],
        stops:["peninsula-cellars","chateau-chantal","brys-estate","2-lads"] },
      { id:"leelanau-beach", title:"Leelanau, wine and a beach", meta:"3 wineries and a beach · Leelanau",
        blurb:"A western Leelanau loop through Lake Leelanau and Leland, with a stop at Van's Beach to put your feet in the water before the drive home.",
        origin:"Lake Leelanau", beverages:["wine"], poiKinds:["beach"],
        stops:["good-harbor","boathouse-vineyards","verterra-leland","vans-beach"] },
      { id:"tc-beer", title:"A Traverse City beer day", meta:"3 breweries · Traverse City",
        blurb:"Three of the town's most-loved breweries, from a downtown taproom to a farmhouse on the edge of the orchards. Bring a driver.",
        origin:"Traverse City", beverages:["beer"], poiKinds:[],
        stops:["right-brain","earthen-ales","brewery-terra-firma"] },
    ];
    function syncControlsFromState(){
      const bc=document.getElementById("bevChips"); if(bc)[...bc.children].forEach((c)=>c.classList.toggle("chip-on", state.beverages.has(c.dataset.bev)));
      const ac=document.getElementById("areaChips"); if(ac)[...ac.children].forEach((c)=>c.classList.toggle("chip-on", c.dataset.area===state.area));
      const gc=document.getElementById("sightChips"); if(gc)[...gc.children].forEach((c)=>c.classList.toggle("chip-on", state.poiKinds.has(c.dataset.sight)));
      const os=document.getElementById("originSelect"); if(os) os.value=state.origin;
      const di=document.getElementById("dateInput"); if(di) di.value=state.date;
      const ti=document.getElementById("timeInput"); if(ti) ti.value=state.start;
      const db=document.getElementById("doneByInput"); if(db) db.value=state.doneBy;
      buildStyleCloud();
    }
    function loadStarter(id){
      const p = STARTERS.find((s)=>s.id===id); if(!p) return;
      state.beverages = new Set(p.beverages||[]);
      state.poiKinds = new Set(p.poiKinds||[]);
      state.styles = new Set();
      state.area = "any";
      state.origin = p.origin || state.origin;
      state.selected = p.stops.filter((sid)=>byId(sid));
      syncControlsFromState();
      buildDay();
    }

    function candidates(){
      const day = dayName(state.date);
      return VENUES.filter((v)=>{
        if(v.area==="outer") return false;
        if(state.area!=="any" && v.area!==state.area) return false;
        if(state.beverages.size && ![...v.beverages].some((b)=>state.beverages.has(b))) return false;
        if(state.styles.size && !v.tags.some((t)=>state.styles.has(t))) return false;
        if(!isOpen(v,day)) return false;
        return true;
      });
    }
    function poiCandidates(){
      return POIS.filter((p)=>{
        if(state.area!=="any" && p.area!==state.area) return false;
        if(!state.poiKinds.has(p.kind)) return false;
        return true;
      });
    }
    const styleMatch = (v) => state.styles.size && v.tags.some((t)=>state.styles.has(t));
    function sortCands(list){
      return list.slice().sort((a,b)=>{
        if(state.styles.size){ const d=(styleMatch(b)?1:0)-(styleMatch(a)?1:0); if(d) return d; }
        return (b.rating||0)-(a.rating||0) || a.name.localeCompare(b.name);
      });
    }
    // Draft loop order + rough drive time for the live preview (real roads come at Build).
    function draftOrder(){ return state.selected.length>=2 ? twoOpt(state.selected) : state.selected.slice(); }
    function draftDriveMin(order){ if(!order.length) return 0; const pts=[originPt(),...order.map(coords),originPt()]; let m=0; for(let i=0;i<pts.length-1;i++) m+=legMin(pts[i],pts[i+1]); return m; }

    function toggleSelect(id){
      const wasIn = state.selected.includes(id);
      if(wasIn) state.selected = state.selected.filter((x)=>x!==id);
      else state.selected = [...state.selected, id];
      if(state.mode==="day"){ buildDay(); }
      else { renderPanel(); drawMap(); if(!wasIn){ const m=markerById[id]; if(m && m.openPopup) m.openPopup(); } }
    }
    function suggest(){
      const p = candidates();
      const have = state.selected.filter((id)=>p.find((v)=>v.id===id));
      const need = Math.max(state.suggestN, have.length);
      let sel=[...have], remaining=p.filter((v)=>!sel.includes(v.id));
      let cur = sel.length ? coords(sel[sel.length-1]) : originPt();
      while(sel.length<need && remaining.length){ remaining.sort((a,b)=>miles(cur,a)-miles(cur,b)); const pick=remaining.shift(); sel.push(pick.id); cur=coords(pick.id); }
      state.selected = sel; renderPanel(); drawMap();
    }
    function suggestSightFor(anchorIds){
      const kinds = state.poiKinds.size ? state.poiKinds : null;
      const anchors = (anchorIds && anchorIds.length ? anchorIds.map(coords) : [originPt()]);
      const cands = POIS.filter((p)=> !state.selected.includes(p.id)
        && (state.area==="any" || p.area===state.area)
        && (!kinds || kinds.has(p.kind)));
      let best=null, bestD=Infinity;
      cands.forEach((p)=>{ const d=Math.min(...anchors.map((a)=>miles(a,p))); if(d<bestD){ bestD=d; best=p; } });
      return best;
    }
    function addSightAlongWay(){
      const anchorIds = (state.scheduled && state.scheduled.fits && state.scheduled.fits.length) ? state.scheduled.fits.map((x)=>x.id) : state.selected;
      const p = suggestSightFor(anchorIds);
      if(p) toggleSelect(p.id);
    }

    function twoOpt(ids){
      const tourLen = (order) => { const pts=[originPt(),...order.map(coords),originPt()]; let d=0; for(let i=0;i<pts.length-1;i++) d+=miles(pts[i],pts[i+1]); return d; };
      let best=ids.slice(),improved=true;
      while(improved){ improved=false;
        for(let i=0;i<best.length-1;i++) for(let j=i+1;j<best.length;j++){
          const c=best.slice(0,i).concat(best.slice(i,j+1).reverse(),best.slice(j+1));
          if(tourLen(c)<tourLen(best)-1e-9){ best=c; improved=true; } } }
      return best;
    }

    async function fetchRoute(orderedIds){
      const pts = [[originPt().lng,originPt().lat], ...orderedIds.map((id)=>{ const c=coords(id); return [c.lng,c.lat]; }), [originPt().lng,originPt().lat]];
      try{
        const r = await fetch("/api/route",{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({coordinates:pts}) });
        if(!r.ok) return null;
        const j = await r.json();
        return j && j.ok ? j : null;
      }catch(e){ return null; }
    }

    function schedule(order, legDur){
      const day = dayName(state.date), budget = toMin(state.doneBy);
      const adj = state.pace==="leisurely"?15:(state.pace==="efficient"?-10:0);
      let clock = toMin(state.start), prev = originPt(), lunchDone=false, pending=0;
      const fits=[], conflicts=[], overflow=[]; let lunch=null;
      for(let i=0;i<order.length;i++){
        const id=order[i], v=byId(id);
        let drive;
        if(legDur){ pending += Math.round(legDur[i]); drive = pending; }
        else { drive = legMin(prev, coords(id)); }
        if(!lunchDone && clock>=12*60+30 && fits.length){ lunch={time:clock, beforeId:id}; clock+=45; lunchDone=true; }
        let arrive = clock + drive;
        const w = windowFor(v,day);
        if(!w){ conflicts.push({id,reason:"closed that day"}); continue; }
        if(arrive < w.open) arrive = w.open;
        const dwell = Math.max(20, v.dwellMinutes + (v.isPoi?Math.max(0,adj):adj));
        if(arrive >= w.close || arrive+dwell > w.close-(v.isPoi?5:15)){ conflicts.push({id,reason:`closes ${pretty(w.close)}`}); continue; }
        const depart = arrive + dwell;
        if(budget && depart > budget){ overflow.push({id, arrive, depart}); continue; }
        fits.push({id, drive, arrive, depart, callAhead:w.callAhead, close:w.close, isPoi:!!v.isPoi});
        clock = depart; prev = coords(id); if(legDur) pending=0;
      }
      let returnLeg;
      if(legDur){ returnLeg = fits.length ? (pending + Math.round(legDur[order.length])) : 0; }
      else { returnLeg = fits.length ? legMin(prev, originPt()) : 0; }
      const driveTotal = fits.reduce((s,x)=>s+x.drive,0);
      const tasteTotal = fits.filter((x)=>!x.isPoi).reduce((s,x)=>s+(x.depart-x.arrive),0);
      const sightTotal = fits.filter((x)=>x.isPoi).reduce((s,x)=>s+(x.depart-x.arrive),0);
      const endTime = fits.length ? fits[fits.length-1].depart : clock;
      return { fits, conflicts, overflow, lunch, returnLeg, driveTotal, tasteTotal, sightTotal, endTime };
    }

    async function buildDay(){
      readBuildControls();
      if(!state.selected.length) return;
      const ordered = twoOpt(state.selected);
      const route = await fetchRoute(ordered);
      let legDur=null, geometry=null;
      if(route && route.legs && route.legs.length === ordered.length+1){
        legDur = route.legs.map((l)=>l.durationMin);
        geometry = route.geometry;
      }
      state.scheduled = schedule(ordered, legDur);
      state.scheduled.geometry = geometry;
      state.scheduled.routed = !!geometry;
      state.mode = "day"; renderPanel(); drawMap();
    }
    function removeAndRebuild(id){ state.selected = state.selected.filter((x)=>x!==id); if(state.selected.length) buildDay(); else { state.mode="choose"; renderPanel(); drawMap(); } }

    function readBuildControls(){
      state.start = document.getElementById("timeInput").value || state.start;
      state.doneBy = document.getElementById("doneByInput").value || "";
      state.dd = document.getElementById("ddToggle").checked;
      state.suggestN = Math.min(6, Math.max(2, parseInt(document.getElementById("stopsInput").value||"3",10)));
    }

    let map, dotsLayer, routeLayer, markerById = {};
    function initMap(){
      map = L.map("map",{zoomControl:true}).setView([44.95,-85.65],10);
      const voyager = L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {attribution:"&copy; OpenStreetMap &copy; CARTO", subdomains:"abcd", maxZoom:20});
      const positron = L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        {attribution:"&copy; OpenStreetMap &copy; CARTO", subdomains:"abcd", maxZoom:20});
      voyager.addTo(map);
      L.control.layers({ "Roads": voyager, "Minimal": positron }, null, { position:"topright" }).addTo(map);
      L.polyline([[45.0,-86.10],[45.0,-85.38]],{color:"#23241F",weight:1,opacity:0.28,dashArray:"2 6",interactive:false}).addTo(map);
      L.marker([45.0,-85.40],{interactive:false,icon:L.divIcon({className:"par-label",html:"45th parallel",iconSize:[80,14]})}).addTo(map);
      dotsLayer = L.layerGroup().addTo(map);
      routeLayer = L.layerGroup().addTo(map);
      map.on("popupopen", (e)=>{ try{ const id=e.popup._source && e.popup._source._vid; if(id) flashRow(id); }catch(_){} });
      drawMap();
      setTimeout(() => { try { map.invalidateSize(); } catch (e) {} }, 60);
    }

    // Rich info bubble for ANY pin: identity, hours, match, note, and a clear add/remove.
    function popupHtml(v, extra){
      const day=dayName(state.date), w=windowFor(v,day);
      const inSel = state.selected.includes(v.id);
      const btn = `<button class="pop-add ${inSel?'on':''}" data-toggle="${v.id}">${inSel?"✓ In your day · remove":"Add to day"}</button>`;
      if(v.isPoi){
        const hrs = extra || (v.needsHours?"":(w?(w.open===420?"Open daily":`Open, closes ${pretty(w.close)}`):"Closed today"));
        return `<div class="pop"><strong>${v.name}</strong>
          <span class="pop-sub"><span class="kindtag">${POI_KIND_LABEL[v.kind]}</span> ${v.town}</span>
          <span class="pop-line">About ${v.dwellMinutes} min${v.fee?` · ${v.fee}`:""}</span>
          ${hrs?`<span class="pop-hrs">${hrs}</span>`:""}
          <span class="pop-note">${v.note}</span>${btn}</div>`;
      }
      const hrs = extra || (v.needsHours ? "Hours vary, call ahead" : (w?`Open today, closes ${pretty(w.close)}`:"Closed today"));
      const tags = v.tags.slice(0,5).map((t)=>`<span class="ptag ${state.styles.has(t)?'match':''}">${prettyTag(t)}</span>`).join("");
      return `<div class="pop"><strong>${v.name}</strong>
        <span class="pop-sub">${v.town} · ${v.beverages.map((b)=>`<span class="bev bev-${b}">${BEV_LABEL[b]}</span>`).join("")}</span>
        <span class="pop-hrs">${hrs}</span>
        ${tags?`<span class="pop-tags">${tags}</span>`:""}
        <span class="pop-note">${v.note}</span>${btn}</div>`;
    }
    function ringMarker(v, color){
      const m=L.circleMarker([v.lat,v.lng],{radius:8,color:color,weight:2.5,fillColor:"#fff",fillOpacity:.95});
      m._baseR=8; m._baseW=2.5; m._vid=v.id; return m;
    }
    function flashRow(id){
      const row=document.querySelector(`.cand[data-toggle="${id}"], .stop[data-row="${id}"]`);
      if(row){ row.classList.add("flash"); setTimeout(()=>row.classList.remove("flash"),900); }
    }
    function draftPin(v, n){
      return L.marker([v.lat,v.lng],{icon:L.divIcon({className:"num-pin draft"+(v.isPoi?" poi":""),html:`<span style="border-color:${accent(v)};color:${accent(v)}">${n}</span>`,iconSize:[26,26],iconAnchor:[13,13]})});
    }
    function drawMap(){
      dotsLayer.clearLayers(); routeLayer.clearLayers(); markerById = {};
      const cand = candidates(); const candIds=new Set(cand.map((v)=>v.id)); const selSet=new Set(state.selected);
      const poiC = poiCandidates(); const poiIds=new Set(poiC.map((p)=>p.id));
      const latlngs=[];
      const o = originPt();

      // show faint context dots only when NO filter is active, so applying a filter visibly thins the map
      const filterActive = state.styles.size>0 || state.beverages.size>0 || state.area!=="any";
      if(!filterActive){
        VENUES.filter((v)=>v.area!=="outer" && !candIds.has(v.id) && !selSet.has(v.id)).forEach((v)=>{
          const m=L.circleMarker([v.lat,v.lng],{radius:4,color:"#b8b0a0",weight:1,fillColor:"#fff",fillOpacity:.9,opacity:.7});
          m._baseR=4; m._baseW=1; m._vid=v.id; m.bindPopup(popupHtml(v)); m.addTo(dotsLayer); markerById[v.id]=m;
        });
      }

      if(state.mode==="choose"){
        // unselected matching venues -> category rings
        cand.filter((v)=>!selSet.has(v.id)).forEach((v)=>{
          const m=ringMarker(v, accent(v)); m.bindPopup(popupHtml(v)); m.addTo(dotsLayer); latlngs.push([v.lat,v.lng]); markerById[v.id]=m;
        });
        // unselected sight candidates -> green rings
        poiC.filter((p)=>!selSet.has(p.id)).forEach((p)=>{
          const m=ringMarker(p, POI_GREEN); m.bindPopup(popupHtml(p)); m.addTo(dotsLayer); latlngs.push([p.lat,p.lng]); markerById[p.id]=m;
        });
        // selected -> draft route line + numbered order pins (so picks line up with a loop)
        const ordered = draftOrder();
        if(ordered.length>=2){
          const line=[[o.lat,o.lng],...ordered.map((id)=>{const c=coords(id);return [c.lat,c.lng];}),[o.lat,o.lng]];
          L.polyline(line,{color:"#2F5A66",weight:2.5,opacity:.55,dashArray:"4 7"}).addTo(routeLayer);
          line.forEach((p)=>latlngs.push(p));
        }
        if(ordered.length>=1){
          L.marker([o.lat,o.lng],{icon:L.divIcon({className:"origin-pin",html:"●",iconSize:[16,16]})}).addTo(routeLayer);
          ordered.forEach((id,i)=>{ const v=byId(id); const m=draftPin(v,i+1); m.bindPopup(popupHtml(v)); m._vid=id; m.addTo(routeLayer); latlngs.push([v.lat,v.lng]); markerById[id]=m; });
        }
      } else {
        const s=state.scheduled;
        if(s && s.fits.length){
          if(s.geometry && s.geometry.length){
            L.polyline(s.geometry,{color:"#2F5A66",weight:4,opacity:.85}).addTo(routeLayer);
            s.geometry.forEach((p)=>latlngs.push(p));
          } else {
            const line=[[o.lat,o.lng],...s.fits.map((x)=>[coords(x.id).lat,coords(x.id).lng]),[o.lat,o.lng]];
            L.polyline(line,{color:"#2F5A66",weight:3,opacity:.85,dashArray:"5 6"}).addTo(routeLayer);
            line.forEach((p)=>latlngs.push(p));
          }
          L.marker([o.lat,o.lng],{icon:L.divIcon({className:"origin-pin",html:"●",iconSize:[16,16]})}).addTo(routeLayer);
          s.fits.forEach((x,i)=>{ const v=byId(x.id);
            const m=L.marker([v.lat,v.lng],{icon:L.divIcon({className:"num-pin"+(v.isPoi?" poi":""),html:`<span style="background:${accent(v)}">${i+1}</span>`,iconSize:[26,26],iconAnchor:[13,13]})});
            m.bindPopup(popupHtml(v)); m._vid=x.id; m.addTo(routeLayer); latlngs.push([v.lat,v.lng]); markerById[x.id]=m; });
        }
        const fitIds=new Set((s&&s.fits?s.fits:[]).map((x)=>x.id));
        state.selected.filter((id)=>!fitIds.has(id)).forEach((id)=>{ const v=byId(id);
          const m=L.circleMarker([v.lat,v.lng],{radius:6,color:v.isPoi?POI_GREEN:"#9c958a",weight:2,fillColor:"#fff",fillOpacity:1,dashArray:"2 3"});
          m._baseR=6; m._baseW=2; m._vid=id; m.bindPopup(popupHtml(v,"Not in the timed day")); m.addTo(routeLayer); latlngs.push([v.lat,v.lng]); markerById[id]=m; });
      }
      if(latlngs.length){ try{ map.fitBounds(L.latLngBounds(latlngs),{padding:[45,45],maxZoom:12}); }catch(e){} }
    }
    function locate(id){ const v=byId(id); if(!v) return; map.setView([v.lat,v.lng],12,{animate:true}); const m=markerById[id]; if(m && m.openPopup) m.openPopup(); }
    function emphasize(id,on){ const m=markerById[id]; if(m && m.setStyle){ m.setStyle(on?{radius:(m._baseR||5)+3,weight:(m._baseW||2)+1}:{radius:m._baseR||5,weight:m._baseW||2}); } }

    function renderPanel(){ state.mode==="day" ? renderDay() : renderChoose(); }
    function candRow(v, sel){
      if(v.isPoi){
        const fee = v.fee ? ` · ${v.fee}` : "";
        return `<div class="cand ${sel?'sel':''}" data-toggle="${v.id}"><span class="box poi">${sel?"✓":""}</span>
          <span class="cand-body"><span class="cand-name">${v.name}</span>
          <span class="cand-sub"><span class="kindtag">${POI_KIND_LABEL[v.kind]}</span> ${v.town} · about ${v.dwellMinutes} min${fee}</span>
          <span class="cand-note">${v.note}</span></span></div>`;
      }
      const day=dayName(state.date), w=windowFor(v,day);
      const hrs = v.needsHours ? "call ahead" : `closes ${pretty(w.close)}`;
      const tags = v.tags.map((t)=>`<span class="tag ${state.styles.has(t)?'match':''}">${prettyTag(t)}</span>`).slice(0,4).join("");
      return `<div class="cand ${sel?'sel':''}" data-toggle="${v.id}"><span class="box">${sel?"✓":""}</span>
        <span class="cand-body"><span class="cand-name">${v.name}</span>
        <span class="cand-sub">${v.town} · ${v.beverages.map((b)=>`<span class="bev bev-${b}">${BEV_LABEL[b]}</span>`).join("")} · ${hrs}</span>
        <span class="cand-tags">${tags}</span></span></div>`;
    }
    function renderChoose(){
      const plan = document.getElementById("plan");
      const cand = candidates(), poiC = poiCandidates(), selSet = new Set(state.selected);
      const ord = draftOrder(); const est = state.selected.length>=2 ? draftDriveMin(ord) : 0;
      let html = `<div class="choose-head"><h2>Choose your stops</h2>
        <p>Tap a pin to see what it is and add it. As you pick, a draft loop is drawn so your stops line up with a route. Then build it and we time everything against real hours.</p></div>`;
      if(!state.selected.length){
        html += `<div class="starters"><div class="starters-h">New to the area? Start with a day, then make it your own.</div>`;
        STARTERS.forEach((s)=>{ html += `<button class="starter" data-starter="${s.id}">
          <span class="starter-title">${s.title}</span>
          <span class="starter-meta">${s.meta}</span>
          <span class="starter-blurb">${s.blurb}</span></button>`; });
        html += `</div>`;
      }
      html += `<div class="picks-bar"><div class="picks-count">${state.selected.length} selected${est?` <span class="live-est">· ~${est}m driving</span>`:""}</div>
        <div class="picks-btns"><button id="suggestBtn" class="ghost sm">Suggest ${state.suggestN}</button>
        <button id="sightBtn" class="ghost sm leaf">+ a sight</button></div></div>`;
      if(state.selected.length){ const dwellSum=state.selected.reduce((a,id)=>a+(byId(id).dwellMinutes||45),0); const dayMin=est+dwellSum+(state.selected.filter((id)=>!byId(id).isPoi).length>=2?45:0); html += `<div class="day-est">Roughly ${fmtDur(dayMin)} out${est?`, about ${est} min of it driving`:""}</div>`; }
      if(state.selected.length){
        html += `<div class="picks">` + ord.map((id,i)=>{ const v=byId(id);
          return `<span class="pick ${v.isPoi?'poi':''}" data-locate="${id}" style="--a:${accent(v)}"><b>${i+1}</b> ${v.name}<button data-toggle="${id}" aria-label="remove">×</button></span>`; }).join("") + `</div>`;
      }
      html += `<button id="buildBtn2" class="build" ${state.selected.length?"":"disabled"}>Build my day${state.selected.length?` (${state.selected.length})`:""}</button>`;
      const total = cand.length + poiC.length;
      html += `<div class="match-count">${cand.length} tasting room${cand.length!==1?'s':''}${poiC.length?` · ${poiC.length} sight${poiC.length!==1?'s':''}`:''} match your filters</div>`;
      if(!state.poiKinds.size) html += `<p class="hint">Turn on Beaches, Hikes, or Scenic spots up top to add sights along the way, or tap “+ a sight” for a nearby pick.</p>`;
      if(!total){
        html += `<div class="empty"><p class="warn">Nothing matches those filters on ${dayName(state.date)}. Try another day or time, fewer styles, or more beverages.</p></div>`;
      } else {
        AREA_ORDER.forEach((area)=>{
          const group = sortCands(cand.filter((v)=>v.area===area));
          if(!group.length) return;
          html += `<h3 class="grp-h">${AREA_LABEL[area]} <span>${group.length}</span></h3>`;
          group.forEach((v)=> html += candRow(v, selSet.has(v.id)));
        });
        if(poiC.length){
          const sorted = poiC.slice().sort((a,b)=> a.area===b.area ? a.name.localeCompare(b.name) : AREA_ORDER.indexOf(a.area)-AREA_ORDER.indexOf(b.area));
          html += `<h3 class="grp-h leaf-h">Along the way · sights, hikes &amp; beaches <span>${poiC.length}</span></h3>`;
          sorted.forEach((p)=> html += candRow(p, selSet.has(p.id)));
        }
      }
      plan.innerHTML = html;
    }

    function renderDay(){
      const plan = document.getElementById("plan"), s = state.scheduled;
      let html = `<button id="backBtn" class="back">← Edit stops</button>`;
      if(!s || !s.fits.length){
        html += `<div class="empty"><p class="warn">None of your stops fit on ${dayName(state.date)} from ${pretty(toMin(state.start))}.</p>`;
        if(s && s.conflicts.length) html += `<p>Closed when you'd arrive: ${s.conflicts.map((c)=>byId(c.id).name).join(", ")}.</p>`;
        if(s && s.overflow.length) html += `<p>Past your finish time: ${s.overflow.map((c)=>byId(c.id).name).join(", ")}. Try a later finish or an earlier start.</p>`;
        html += `</div>`; plan.innerHTML = html; return;
      }
      const homeBy = s.endTime + s.returnLeg;
      const overBudget = state.doneBy && homeBy > toMin(state.doneBy);
      const nSights = s.fits.filter((x)=>x.isPoi).length;
      const nDrinks = s.fits.length - nSights;
      html += `<div class="summary">
        <div class="sum-line"><span class="sum-big">${s.fits.length}</span> stops
          <span class="dot-sep">·</span> ${fmtDur(s.tasteTotal+(s.lunch?45:0))} tasting & food
          <span class="dot-sep">·</span> ${fmtDur(s.driveTotal)} driving</div>
        <div class="sum-sub">Start ${pretty(toMin(state.start))} from ${state.origin} · back by about ${pretty(homeBy)}${nSights?` · ${nSights} stop${nSights>1?'s':''} on foot`:""}${s.routed?"":" · drive times estimated"}</div>
      </div>`;
      html += responsibleNote(s, nDrinks, nSights);
      html += `<ol class="stops">`;
      s.fits.forEach((x,i)=>{ const v=byId(x.id);
        if(s.lunch && s.lunch.beforeId===x.id) html += `<li class="lunch"><span>Lunch / food stop</span><span class="lunch-time">around ${pretty(s.lunch.time)}</span></li>`;
        html += `<li class="leg">${x.drive} min drive</li>`;
        if(v.isPoi){
          html += `<li class="stop poi" data-row="${v.id}">
            <div class="stop-num" style="color:${POI_GREEN}">${i+1}</div>
            <div class="stop-body">
              <div class="stop-head"><button class="stop-name" data-locate="${v.id}">${v.name}</button>
                <span class="stop-time">${pretty(x.arrive)} – ${pretty(x.depart)}</span></div>
              <div class="stop-meta"><span class="kindtag">${POI_KIND_LABEL[v.kind]}</span> ${v.town}${v.fee?` · ${v.fee}`:""}</div>
              <div class="stop-note">${v.note}</div>
              <div class="stop-actions"><a class="act go leaf" href="${v.directionsUrl}" target="_blank" rel="noopener">Navigate</a>
                <button class="act danger" data-remove="${v.id}">Remove</button></div></div></li>`;
        } else {
          const tags = v.tags.slice(0,3).map((t)=>`<span class="tag">${prettyTag(t)}</span>`).join("");
          html += `<li class="stop" data-row="${v.id}">
            <div class="stop-num" style="color:${accent(v)}">${i+1}</div>
            <div class="stop-body">
              <div class="stop-head"><button class="stop-name" data-locate="${v.id}">${v.name}</button>
                <span class="stop-time">${pretty(x.arrive)} – ${pretty(x.depart)}</span></div>
              <div class="stop-meta">${v.town} · ${v.beverages.map((b)=>`<span class="bev bev-${b}">${BEV_LABEL[b]}</span>`).join("")}</div>
              <div class="stop-tags">${tags}</div>
              <div class="stop-note">${v.note}</div>
              <div class="stop-hrs ${x.callAhead?'call':''}">${x.callAhead?"Hours vary, call ahead":`Open, closes ${pretty(x.close)}`}</div>
              <div class="stop-actions"><a class="act go" href="${v.directionsUrl}" target="_blank" rel="noopener">Navigate</a>
                ${v.website?`<a class="act" href="${v.website}" target="_blank" rel="noopener">Website</a>`:""}
                <button class="act danger" data-remove="${v.id}">Remove</button></div></div></li>`;
        }
      });
      html += `<li class="leg">${s.returnLeg} min back to ${state.origin}</li></ol>`;
      if(nDrinks>=2 && nSights===0){
        const sg = suggestSightFor(s.fits.map((x)=>x.id));
        if(sg) html += `<div class="suggest-sight"><span class="ss-eyebrow">Stretch your legs</span>
          <div class="ss-row"><div><strong>${sg.name}</strong><div class="ss-sub">${POI_KIND_LABEL[sg.kind]} · ${sg.town} · about ${sg.dwellMinutes} min</div></div>
          <button class="act go leaf" data-toggle="${sg.id}">Add</button></div><p class="ss-note">${sg.note}</p></div>`;
      }
      if(overBudget) html += `<div class="overflow">You finish a little after your ${pretty(toMin(state.doneBy))} target. Drop a stop or set a later finish.</div>`;
      if(s.conflicts.length) html += `<div class="dropped"><strong>Closed when you'd arrive:</strong> ${s.conflicts.map((c)=>`${byId(c.id).name} (${c.reason})`).join(", ")}.</div>`;
      if(s.overflow.length) html += `<div class="dropped"><strong>Past your ${pretty(toMin(state.doneBy))} finish:</strong> ${s.overflow.map((c)=>byId(c.id).name).join(", ")}. Extend your finish time or drop an earlier stop.</div>`;
      html += `<div class="plan-foot">
        <a class="open-maps" href="${gmapsLoop(s)}" target="_blank" rel="noopener">Open whole loop in Google Maps</a>
        <button class="ghost" id="shareBtn">Copy a shareable summary</button></div>`;
      plan.innerHTML = html;
    }
    function responsibleNote(s, nDrinks, nSights){
      const wt = s.fits.filter((x)=>!x.isPoi).reduce((a,x)=>{ const v=byId(x.id); return a+(v.category==="brewery"?1.3:(v.category==="distillery"?1.4:1.0)); },0);
      if(state.dd) return `<div class="note calm">Designated driver set. A midday food break is built in${nSights?" and you've got a stop on foot":""}. Enjoy the day.</div>`;
      if(nDrinks>=4 || wt>=4) return `<div class="note">A full day. ${nSights?"Good call adding a stop on foot. ":""}A food stop is built in; keep water between stops and pace the pours. No driver yet? <a href="tel:${SHUTTLE.phone}">${SHUTTLE.name}</a> runs chauffeured tours.</div>`;
      return `<div class="note soft">A food stop is built in. ${nSights?"Nice mix of tasting and time outside.":"Pace yourself with water between stops."}</div>`;
    }
    function gmapsLoop(s){ const o=`${originPt().lat},${originPt().lng}`; const pts=s.fits.map((x)=>`${coords(x.id).lat},${coords(x.id).lng}`); const dest=pts[pts.length-1]; const way=pts.slice(0,-1).map(encodeURIComponent).join("|");
      let u=`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(dest)}&travelmode=driving`; if(way) u+=`&waypoints=${way}`; return u; }
    function copyShare(){ const s=state.scheduled; if(!s) return; const lines=[`A day from ${state.origin}, ${dayName(state.date)}, start ${pretty(toMin(state.start))}`];
      s.fits.forEach((x,i)=>{ const v=byId(x.id); lines.push(`${i+1}. ${pretty(x.arrive)} ${v.name} (${v.isPoi?POI_KIND_LABEL[v.kind]:v.town})`); });
      lines.push(`Back by about ${pretty(s.endTime+s.returnLeg)}.`);
      if(navigator.clipboard) navigator.clipboard.writeText(lines.join("\n")); const b=document.getElementById("shareBtn"); if(b){ b.textContent="Copied"; setTimeout(()=>b.textContent="Copy a shareable summary",1500); } }

    function buildStyleCloud(){
      const sc=document.getElementById("styleCloud"); if(!sc) return; sc.innerHTML="";
      const show=(t)=>{ const bev=STYLE_BEV[t]; if(!bev) return false; return state.beverages.size ? state.beverages.has(bev) : true; };
      const tags=[...new Set(VENUES.flatMap((v)=>v.tags))].filter(show).sort();
      if(!tags.length){ sc.innerHTML=`<span class="cloud-hint">No specific styles for those drinks.</span>`; return; }
      tags.forEach((t)=>{ const el=document.createElement("button"); el.className="chip sty"+(state.styles.has(t)?" chip-on":""); el.dataset.style=t; el.textContent=prettyTag(t); sc.appendChild(el); });
    }
    function buildChips(){
      const bc=document.getElementById("bevChips"); bc.innerHTML="";
      Object.keys(BEV_LABEL).forEach((b)=>{ const el=document.createElement("button"); el.className="chip"; el.dataset.bev=b; el.textContent=BEV_LABEL[b]; el.style.setProperty("--accent",CAT_COLOR[b]); bc.appendChild(el); });
      const ac=document.getElementById("areaChips"); ac.innerHTML="";
      [["any","All areas"],["leelanau","Leelanau"],["old-mission","Old Mission"],["traverse-city","Traverse City"]].forEach(([k,lab],i)=>{ const el=document.createElement("button"); el.className="chip"+(i===0?" chip-on":""); el.dataset.area=k; el.textContent=lab; ac.appendChild(el); });
      const pc=document.getElementById("paceChips"); pc.innerHTML="";
      [["leisurely","Leisurely"],["standard","Standard"],["efficient","Efficient"]].forEach(([k,lab])=>{ const el=document.createElement("button"); el.className="chip"+(k==="standard"?" chip-on":""); el.dataset.pace=k; el.textContent=lab; pc.appendChild(el); });
      buildStyleCloud();
      const gc=document.getElementById("sightChips"); gc.innerHTML="";
      POI_KINDS.forEach(([k,lab])=>{ const el=document.createElement("button"); el.className="chip leaf"; el.dataset.sight=k; el.textContent=lab; gc.appendChild(el); });
      const os=document.getElementById("originSelect"); os.innerHTML="";
      Object.keys(ORIGINS).forEach((n)=>{ const op=document.createElement("option"); op.value=n; op.textContent=n; os.appendChild(op); }); os.value="Traverse City";
      document.getElementById("dateInput").value=state.date;
      document.getElementById("timeInput").value=state.start;
      document.getElementById("doneByInput").value=state.doneBy;
    }
    function refreshChoose(){ if(state.mode==="choose"){ renderPanel(); drawMap(); } else { drawMap(); } }
    function wireEvents(){
      document.getElementById("bevChips").onclick=(e)=>{ const b=e.target.dataset.bev; if(!b) return;
        if(state.beverages.has(b)){ state.beverages.delete(b); e.target.classList.remove("chip-on"); }
        else { state.beverages.add(b); e.target.classList.add("chip-on"); }
        [...state.styles].forEach((t)=>{ const bev=STYLE_BEV[t]; if(state.beverages.size && bev && !state.beverages.has(bev)) state.styles.delete(t); });
        buildStyleCloud(); refreshChoose(); };
      document.getElementById("styleCloud").onclick=(e)=>{ const s=e.target.dataset.style; if(!s) return;
        if(state.styles.has(s)){ state.styles.delete(s); e.target.classList.remove("chip-on"); } else { state.styles.add(s); e.target.classList.add("chip-on"); } refreshChoose(); };
      document.getElementById("sightChips").onclick=(e)=>{ const k=e.target.dataset.sight; if(!k) return;
        if(state.poiKinds.has(k)){ state.poiKinds.delete(k); e.target.classList.remove("chip-on"); } else { state.poiKinds.add(k); e.target.classList.add("chip-on"); } refreshChoose(); };
      document.getElementById("areaChips").onclick=(e)=>{ const a=e.target.dataset.area; if(!a) return; state.area=a;
        [...e.currentTarget.children].forEach((c)=>c.classList.toggle("chip-on",c.dataset.area===a)); refreshChoose(); };
      document.getElementById("paceChips").onclick=(e)=>{ const p=e.target.dataset.pace; if(!p) return; state.pace=p;
        [...e.currentTarget.children].forEach((c)=>c.classList.toggle("chip-on",c.dataset.pace===p)); if(state.mode==="day") buildDay(); };
      document.getElementById("originSelect").onchange=(e)=>{ state.origin=e.target.value; refreshChoose(); };
      document.getElementById("dateInput").onchange=(e)=>{ state.date=e.target.value||state.date; refreshChoose(); };
      document.getElementById("timeInput").onchange=(e)=>{ state.start=e.target.value||state.start; if(state.mode==="day") buildDay(); };
      document.getElementById("doneByInput").onchange=(e)=>{ state.doneBy=e.target.value; if(state.mode==="day") buildDay(); };
      document.getElementById("ddToggle").onchange=()=>{ if(state.mode==="day") renderDay(); };
      document.getElementById("stopsInput").onchange=(e)=>{ state.suggestN=Math.min(6,Math.max(2,parseInt(e.target.value||"3",10))); if(state.mode==="choose") renderPanel(); };
      const moreToggle=document.getElementById("moreToggle");
      if(moreToggle) moreToggle.onclick=()=>{ const c=document.getElementById("controls"); const open=c.classList.toggle("hide-adv")===false; moreToggle.setAttribute("aria-expanded", open?"true":"false"); moreToggle.textContent = open?"Fewer filters":"More filters"; };
      const plan=document.getElementById("plan");
      plan.onclick=(e)=>{ const t=e.target.closest("[data-toggle],[data-remove],[data-locate],button"); if(!t) return;
        if(t.dataset && t.dataset.starter) return loadStarter(t.dataset.starter);
        if(t.dataset && t.dataset.remove) return removeAndRebuild(t.dataset.remove);
        if(t.dataset && t.dataset.toggle) return toggleSelect(t.dataset.toggle);
        if(t.dataset && t.dataset.locate) return locate(t.dataset.locate);
        if(t.id==="buildBtn2") return buildDay();
        if(t.id==="suggestBtn") return suggest();
        if(t.id==="sightBtn") return addSightAlongWay();
        if(t.id==="backBtn"){ state.mode="choose"; renderPanel(); drawMap(); return; }
        if(t.id==="shareBtn") return copyShare();
      };
      plan.onmouseover=(e)=>{ const r=e.target.closest("[data-toggle],[data-row],[data-locate]"); if(!r) return; emphasize(r.dataset.toggle||r.dataset.row||r.dataset.locate,true); };
      plan.onmouseout=(e)=>{ const r=e.target.closest("[data-toggle],[data-row],[data-locate]"); if(!r) return; emphasize(r.dataset.toggle||r.dataset.row||r.dataset.locate,false); };
      document.getElementById("map").onclick=(e)=>{ if(e.target.dataset && e.target.dataset.toggle) toggleSelect(e.target.dataset.toggle); };
    }

    buildChips(); wireEvents(); initMap(); renderPanel();
    return () => { if (map) { map.remove(); map = null; } };
  }, []);

  return (
    <>
      <header>
        <h1>Traverse City Wine Country</h1>
        <p>Pick the styles you&apos;re after and the stops you want, add a beach or a trail along the way, then have your day routed into a loop and timed against each place&apos;s real hours.</p>
      </header>
      <section id="controls" className="hide-adv">
        <div className="grp"><label>Tasting</label><div id="bevChips" className="chips"></div></div>
        <div className="grp grow adv"><label>Styles (optional, pick any)</label><div id="styleCloud" className="chips style-cloud"></div></div>
        <div className="grp"><label>Add sights</label><div id="sightChips" className="chips"></div></div>
        <div className="grp"><label>Area</label><div id="areaChips" className="chips"></div></div>
        <div className="grp"><label>Starting from</label><select id="originSelect"></select></div>
        <div className="grp"><label>Date</label><input type="date" id="dateInput" /></div>
        <div className="grp"><label>Start time</label><input type="time" id="timeInput" /></div>
        <div className="grp adv"><label>Done by</label><input type="time" id="doneByInput" /></div>
        <div className="grp small adv"><label>Suggest size</label><input type="number" id="stopsInput" min="2" max="6" defaultValue="3" /></div>
        <div className="grp adv"><label>Pace</label><div id="paceChips" className="chips"></div></div>
        <div className="grp check adv"><label><input type="checkbox" id="ddToggle" /> I have a designated driver</label></div>
        <button type="button" id="moreToggle" className="more-toggle" aria-expanded="false">More filters</button>
      </section>
      <main id="main">
        <div id="map"></div>
        <aside id="plan"></aside>
      </main>
    </>
  );
}
