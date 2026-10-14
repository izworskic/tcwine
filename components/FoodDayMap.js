"use client";
import {useEffect,useRef} from "react";
import "leaflet/dist/leaflet.css";
import origins from "@/data/origins.json";
import food from "@/data/food-offerings.json";
// The map uses genuine venue points; straight dashed lines are NOT road routes.
// When /api/route succeeds, replace them with road geometry.
export default function FoodDayMap({candidate,geometry,roadVerified=false}){
  const root=useRef(null);
  useEffect(()=>{
    let live=true,instance=null;
    async function draw(){
      const {default:L}=await import("leaflet");
      if(!live||!root.current)return;
      instance=L.map(root.current,{scrollWheelZoom:false,zoomControl:true});
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{
        attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
        maxZoom:19
      }).addTo(instance);
      const origin=origins["Traverse City"];
      const pins=candidate?[
        {name:"Traverse City start",lat:origin.lat,lng:origin.lng,role:"start"},
        {name:candidate.locationName,lat:candidate.meal.lat,lng:candidate.meal.lng,role:"meal"},
        ...(candidate.winery?[{name:candidate.winery.name,lat:candidate.winery.lat,lng:candidate.winery.lng,role:"wine"}]:[])
      ]:food.locations.map(loc=>({name:loc.name,lat:loc.lat,lng:loc.lng,role:"reviewed"}));
      for(const p of pins){
        const color=p.role==="meal"?"#743b4a":p.role==="wine"?"#2f5a66":p.role==="start"?"#2f5a66":"#9d7858";
        L.circleMarker([p.lat,p.lng],{radius:p.role==="meal"?10:7,
          weight:2,color:"#fff",fillColor:color,fillOpacity:1})
          .bindTooltip(p.name,{direction:"top",offset:[0,-8]}).addTo(instance);
      }
      const coords=(candidate?.points||[]).map(p=>[p.lat,p.lng]);
      const line=roadVerified&&Array.isArray(geometry)&&geometry.length>1?geometry:coords;
      if(line.length>1)L.polyline(line,{color:"#805261",weight:3,opacity:.8,
        dashArray:roadVerified?undefined:"6 9"}).addTo(instance);
      const bounds=L.latLngBounds([...pins.map(p=>[p.lat,p.lng]),...line]);
      if(bounds.isValid())instance.fitBounds(bounds.pad(.18),{maxZoom:12});
      else instance.setView([44.88,-85.53],10);
      // Leaflet needs one size pass after the editorial card changes height.
      requestAnimationFrame(()=>{if(live&&instance)instance.invalidateSize();});
    }
    draw().catch(()=>{if(root.current)root.current.textContent="Map unavailable. Directions remain available below.";});
    return ()=>{live=false;if(instance)instance.remove();};
  },[candidate?.id,geometry,roadVerified]);
  return <div className="wine-food-route-map" ref={root} role="region" aria-label="Interactive Old Mission meal and wine map"/>;
}
