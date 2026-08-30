"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import venues from "@/data/venues.json";
import { trackWineEvent } from "@/lib/wine-analytics";

const WINERIES = venues.filter((v) => v.category === "winery");

function miles(a, b) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
const AREA_LABEL = {
  "old-mission": "Old Mission",
  leelanau: "Leelanau",
  "traverse-city": "Traverse City",
};

export default function PublisherMap({ focusId = "", partner = null, nearbyCount = 12 }) {
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

    const focusWinery = focusId ? WINERIES.find((v) => v.id === focusId) : null;
    const anchor = partner || focusWinery || null;
    const visibleWineries = anchor
      ? [...WINERIES]
          .sort((a, b) => miles(anchor, a) - miles(anchor, b))
          .slice(0, Math.max(4, Math.min(20, Number(nearbyCount) || 12)))
      : WINERIES;

    const points = [];
    visibleWineries.forEach((winery) => {
      points.push([winery.lat, winery.lng]);
      const isFocus = winery.id === focusId;
      const marker = L.circleMarker([winery.lat, winery.lng], {
        radius: isFocus ? 9 : 6,
        weight: isFocus ? 3 : 2,
        color: "#7B3B4A",
        fillColor: isFocus ? "#7B3B4A" : "#ffffff",
        fillOpacity: 0.96,
      }).addTo(map);
      marker.bindPopup(
        `<div class="publisher-pop"><strong>${winery.name}</strong><span>${winery.town} · ${AREA_LABEL[winery.area] || winery.area}</span></div>`
      );
    });

    if (partner) {
      points.push([partner.lat, partner.lng]);
      L.circleMarker([partner.lat, partner.lng], {
        radius: 10,
        weight: 3,
        color: "#244C5A",
        fillColor: "#244C5A",
        fillOpacity: 0.98,
      }).addTo(map).bindPopup(
        `<div class="publisher-pop"><strong>${partner.name}</strong><span>Start here</span></div>`
      );
    }

    if (points.length) {
      map.fitBounds(L.latLngBounds(points), { padding: [24, 24], maxZoom: 9 });
    } else {
      map.setView([44.95, -85.65], 9);
    }

    trackWineEvent("wine_embed_loaded", {
      surface: partner ? "partner_map" : focusWinery ? "winery_map" : "publisher_map",
      context: partner ? partner.slug : focusWinery ? "winery_focus" : "regional",
    });

    return () => {
      map.remove();
      instanceRef.current = null;
    };
  }, [focusId, partner, nearbyCount]);

  return (
    <div className="publisher-map">
      <div ref={mapRef} className="publisher-map-canvas" aria-label="Map of Traverse City-area winery and tasting-room locations" />
      <div className="publisher-map-credit">
        <span>
          {partner
            ? `Wine country from ${partner.shortName || partner.name}`
            : focusId
              ? "Nearby wineries from this tasting room"
              : `${WINERIES.length} mapped winery/tasting-room locations`}
        </span>
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
