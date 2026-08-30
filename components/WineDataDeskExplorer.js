"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { trackWineEvent } from "@/lib/wine-analytics";

export default function WineDataDeskExplorer({ records, grapes }) {
  const [area, setArea] = useState("all");
  const [grape, setGrape] = useState("all");
  const [feature, setFeature] = useState("all");

  const filtered = useMemo(() => {
    return records
      .filter((v) => area === "all" || v.area === area)
      .filter((v) => grape === "all" || v.varietals.includes(grape))
      .filter((v) => {
        if (feature === "all") return true;
        if (feature === "food") return Boolean(v.food);
        if (feature === "view") return Boolean(v.view && !["indoor"].includes(v.view));
        if (feature === "trail") return Boolean(v.officialTrail);
        if (feature === "verified") return Boolean(v.varietalsVerifiedAt);
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [records, area, grape, feature]);

  function trackFilter(kind, value) {
    trackWineEvent("wine_data_filter_changed", { kind, value });
  }

  return (
    <section className="data-explorer" aria-labelledby="data-explorer-title">
      <div className="data-section-head">
        <div>
          <p className="data-kicker">Explore the records</p>
          <h2 id="data-explorer-title">Filter the winery directory</h2>
        </div>
        <strong>{filtered.length} wineries</strong>
      </div>

      <div className="data-filter-row">
        <label>
          Area
          <select
            value={area}
            onChange={(event) => {
              setArea(event.target.value);
              trackFilter("area", event.target.value);
            }}
          >
            <option value="all">All areas</option>
            <option value="old-mission">Old Mission Peninsula</option>
            <option value="leelanau">Leelanau Peninsula</option>
            <option value="traverse-city">Traverse City</option>
          </select>
        </label>

        <label>
          Verified grape
          <select
            value={grape}
            onChange={(event) => {
              setGrape(event.target.value);
              trackFilter("grape", event.target.value);
            }}
          >
            <option value="all">Any grape / not required</option>
            {grapes.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name} ({item.count})
              </option>
            ))}
          </select>
        </label>

        <label>
          Planning signal
          <select
            value={feature}
            onChange={(event) => {
              setFeature(event.target.value);
              trackFilter("feature", event.target.value);
            }}
          >
            <option value="all">Any</option>
            <option value="verified">Source-backed varietals</option>
            <option value="trail">Official trail member</option>
            <option value="food">Any food signal</option>
            <option value="view">Outdoor / scenic view tag</option>
          </select>
        </label>
      </div>

      <div className="data-record-grid">
        {filtered.map((v) => (
          <article key={v.id} className="data-record-card">
            <div>
              <h3><Link href={"/winery/" + v.id}>{v.name}</Link></h3>
              <p>{v.town} · {v.areaLabel}</p>
            </div>
            <div className="data-record-tags">
              {v.officialTrail && <span>Official trail</span>}
              {v.food && <span>{v.food}</span>}
              {v.view && <span>{v.view} view</span>}
            </div>
            {v.varietals.length ? (
              <>
                <p className="data-varietals">{v.varietals.join(" · ")}</p>
                <p className="data-record-source">
                  Verified {v.varietalsVerifiedAt}
                  {v.varietalsSourceUrl && (
                    <> · <a href={v.varietalsSourceUrl} target="_blank" rel="noopener noreferrer">{v.varietalsSourceLabel || "source"}</a></>
                  )}
                </p>
              </>
            ) : (
              <p className="data-record-source">No source-backed varietal list in the structured dataset yet.</p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
