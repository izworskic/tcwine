"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import venues from "@/data/venues.json";
import pois from "@/data/pois.json";
import { trackWineEvent } from "@/lib/wine-analytics";

const AREAS = [
  ["any", "Anywhere"],
  ["leelanau", "Leelanau"],
  ["old-mission", "Old Mission"],
  ["traverse-city", "Traverse City"],
];

const DRINKS = [
  ["wine", "Wine"],
  ["cider", "Cider"],
  ["spirits", "Spirits"],
  ["beer", "Beer"],
];

const PLACES = [
  ["hike", "Hike"],
  ["beach", "Beach"],
  ["lighthouse", "Lighthouse"],
  ["scenic", "Scenic stop"],
  ["town", "Harbor town"],
];

const AREA_NAMES = {
  leelanau: "Leelanau Peninsula",
  "old-mission": "Old Mission Peninsula",
  "traverse-city": "Traverse City",
  outer: "Farther out",
};

const PLACE_NAMES = Object.fromEntries(PLACES);

function miles(a, b) {
  const r = 3958.8;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const la1 = a.lat * rad;
  const la2 = b.lat * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

function pretty(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function describeVenue(v) {
  const details = [];
  if (v.view) details.push(v.view === "bay" ? "bay view" : pretty(v.view));
  if (v.food) details.push(v.food === "snacks" ? "small bites" : pretty(v.food));
  if (v.vibe) details.push(pretty(v.vibe));
  return details.slice(0, 3).join(" · ");
}

function countArea(area, beverage) {
  return venues.filter(
    (v) => (area === "any" || v.area === area) && v.beverages?.includes(beverage)
  ).length;
}

export default function WineCountryWorld() {
  const [area, setArea] = useState("leelanau");
  const [drink, setDrink] = useState("wine");
  const [place, setPlace] = useState("hike");

  const pairings = useMemo(() => {
    const tastingStops = venues.filter(
      (v) =>
        (area === "any" || v.area === area) &&
        Array.isArray(v.beverages) &&
        v.beverages.includes(drink)
    );
    let outside = pois.filter(
      (p) => p.kind === place && (area === "any" || p.area === area)
    );

    if (!outside.length && area !== "any") {
      outside = pois.filter((p) => p.kind === place);
    }

    return outside
      .map((poi) => {
        const nearby = tastingStops
          .map((venue) => ({ venue, gap: miles(poi, venue) }))
          .sort((a, b) => a.gap - b.gap)[0];
        return nearby ? { poi, venue: nearby.venue, gap: nearby.gap } : null;
      })
      .filter(Boolean)
      .sort((a, b) => a.gap - b.gap)
      .slice(0, 4);
  }, [area, drink, place]);

  function choose(setter, value, dimension) {
    setter(value);
    trackWineEvent("wine_world_filter_changed", { dimension, value });
  }

  return (
    <section className="wine-world" aria-labelledby="wine-world-title">
      <div className="wine-world-intro">
        <div>
          <p className="wine-world-eyebrow">Open up the peninsula</p>
          <h2 id="wine-world-title">Wine country is more than a row of winery pins.</h2>
          <p>
            Build a day that moves through vineyards, cider, spirits, Lake Michigan,
            short hikes, lighthouses and harbor towns. Use the map for the full route,
            or start with one of the small tools below.
          </p>
        </div>
        <div className="wine-world-counts" aria-label="Wine country coverage">
          <span><strong>{venues.length}</strong> tasting places</span>
          <span><strong>{pois.length}</strong> special places</span>
          <span><strong>{countArea("leelanau", "wine")}</strong> Leelanau wine stops</span>
        </div>
      </div>

      <div className="wine-world-grid">
        <article className="world-card world-card-wide">
          <div className="world-card-head">
            <div>
              <p className="world-kicker">Mini-tool 1</p>
              <h3>Pair a tasting stop with somewhere worth going.</h3>
            </div>
            <span className="world-status">Uses the same map data</span>
          </div>

          <div className="world-controls">
            <fieldset>
              <legend>Area</legend>
              <div className="world-chips">
                {AREAS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={area === value ? "world-chip on" : "world-chip"}
                    onClick={() => choose(setArea, value, "area")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Drink</legend>
              <div className="world-chips">
                {DRINKS.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={drink === value ? "world-chip on" : "world-chip"}
                    onClick={() => choose(setDrink, value, "drink")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Add one place</legend>
              <div className="world-chips">
                {PLACES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={place === value ? "world-chip on leaf" : "world-chip leaf"}
                    onClick={() => choose(setPlace, value, "place")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="world-pairings" aria-live="polite">
            {pairings.length ? (
              pairings.map(({ poi, venue, gap }) => (
                <div className="world-pair" key={poi.id + venue.id}>
                  <div className="world-pair-copy">
                    <span className="world-pair-type">{PLACE_NAMES[poi.kind]}</span>
                    <strong>{poi.name}</strong>
                    <p>{poi.note}</p>
                    <span className="world-plus">Pair with</span>
                    <strong>{venue.name}</strong>
                    <small>
                      {venue.town} · {AREA_NAMES[venue.area] || venue.area}
                      {describeVenue(venue) ? " · " + describeVenue(venue) : ""}
                    </small>
                  </div>
                  <div className="world-pair-actions">
                    <a
                      href={poi.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackWineEvent("wine_world_pair_opened", {
                          target: "place",
                          place_kind: poi.kind,
                          beverage: drink,
                        })
                      }
                    >
                      Map the {PLACE_NAMES[poi.kind].toLowerCase()}
                    </a>
                    <a
                      href={venue.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackWineEvent("wine_world_pair_opened", {
                          target: "tasting",
                          place_kind: poi.kind,
                          beverage: drink,
                        })
                      }
                    >
                      Map the tasting stop
                    </a>
                    <span>Closest match in this view · about {gap.toFixed(1)} mi as the crow flies</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="world-empty">
                No clean pairing in this view. Try Anywhere or another type of stop.
              </div>
            )}
          </div>
        </article>

        <article className="world-card">
          <p className="world-kicker">Mini-tool 2</p>
          <h3>Choose the peninsula before you choose the wineries.</h3>
          <div className="peninsula-choice">
            <div>
              <strong>Old Mission</strong>
              <span>Compact. Bay on both sides. Easier to make feel unhurried in one day.</span>
              <Link href="/old-mission-peninsula-wineries">Open Old Mission</Link>
            </div>
            <div>
              <strong>Leelanau</strong>
              <span>Bigger. More villages, more detours, more ways to turn wine into a whole day.</span>
              <Link href="/leelanau-peninsula-wine-trail">Open Leelanau</Link>
            </div>
          </div>
          <Link className="world-text-link" href="/old-mission-vs-leelanau-wineries">
            Compare the two peninsulas
          </Link>
        </article>

        <article className="world-card">
          <p className="world-kicker">Mini-tool 3</p>
          <h3>Change the day without leaving wine country.</h3>
          <div className="world-link-stack">
            <Link href="/traverse-city-wineries-with-food">Find wine + a real meal</Link>
            <Link href="/best-traverse-city-wineries-with-views">Find the best vineyard and bay views</Link>
            <Link href="/traverse-city-breweries-and-distilleries">Build a cider, beer or spirits day</Link>
            <Link href="/fall-color-wine-tour">Turn it into a fall-color drive</Link>
          </div>
        </article>
      </div>

      <div className="world-handoff">
        <div>
          <p className="world-kicker">Go farther outside</p>
          <h3>Want the hike to lead instead of the wine?</h3>
          <p>
            Open Michigan Outdoors Now for the full trail and outdoor atlas, then bring the
            place you find back here and build the tasting route around it.
          </p>
        </div>
        <a
          href="https://michiganoutdoorsnow.chrisizworski.com/"
          onClick={() => trackWineEvent("wine_world_outdoors_handoff", { source: "home" })}
        >
          Open Michigan Outdoors Now
        </a>
      </div>
    </section>
  );
}
