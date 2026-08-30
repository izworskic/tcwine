"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import venues from "@/data/venues.json";
import { trackWineEvent } from "@/lib/wine-analytics";

const WINERIES = venues.filter((v) => v.category === "winery");
const AREA_LABEL = {
  "old-mission": "Old Mission",
  leelanau: "Leelanau",
  "traverse-city": "Traverse City",
};

export default function PublisherMap() {
  const mapRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || instanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,
      attributionControl: true,
    });
    instanceRef.current = map;

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: "&copy; OpenStreetMap &copy; CARTO",
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    const points = [];
    WINERIES.forEach((winery) => {
      points.push([winery.lat, winery.lng]);
      const marker = L.circleMarker([winery.lat, winery.lng], {
        radius: 6,
        weight: 2,
        color: "#7B3B4A",
        fillColor: "#ffffff",
        fillOpacity: 0.96,
      }).addTo(map);
      marker.bindPopup(
        `<div class="publisher-pop"><strong>${winery.name}</strong><span>${winery.town} · ${AREA_LABEL[winery.area] || winery.area}</span></div>`
      );
    });

    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 9 });
    } else {
      map.setView([44.95, -85.65], 9);
    }

    trackWineEvent("wine_embed_loaded", { surface: "publisher_map" });

    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div className="publisher-map">
      <div ref={mapRef} className="publisher-map-canvas" aria-label="Map of Traverse City-area winery and tasting-room locations" />
      <div className="publisher-map-credit">
        <span>{WINERIES.length} mapped winery/tasting-room locations</span>
        <a
          href="https://tcwine.chrisizworski.com/?utm_source=publisher_embed&utm_medium=embed&utm_campaign=winery_map"
          target="_blank"
          rel="noopener nofollow"
          onClick={() => trackWineEvent("wine_embed_planner_opened", { surface: "publisher_map" })}
        >
          Open the full winery planner →
        </a>
      </div>
    </div>
  );
}
