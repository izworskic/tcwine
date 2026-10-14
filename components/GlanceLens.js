"use client";
import { useEffect, useMemo, useState } from "react";
import venues from "@/data/venues.json";
import { trackWineEvent } from "@/lib/wine-analytics";

/* "See the day at a glance": three small interactive charts drawn from the same venue data as the
   map. It listens to the planner's state (date, start time, origin, picks) and talks back through
   window events, so tapping a bar plans the day: an hour sets the start time, a grape filters the
   suggestions, a place adds or removes a stop. Plain HTML/SVG, no chart library. */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AREAS = [["old-mission", "Old Mission", "var(--bay)"], ["leelanau", "Leelanau", "var(--wine)"], ["traverse-city", "Traverse City", "var(--brass, #B5762A)"]];
const GRAPE_SKIP = new Set(["broad-lineup", "small-batch", "dry-whites", "dry-reds", "aromatic-whites"]);
const toMin = (s) => { if (s === "24:00") return 1440; const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const miles = (a, b) => { const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2; return 2 * 3958.8 * Math.asin(Math.sqrt(h)); };
const pretty = (t) => String(t).replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const hourLabel = (h) => `${h % 12 === 0 ? 12 : h % 12}${h >= 12 ? "p" : "a"}`;
const fmtTime = (m) => { let h = Math.floor(m / 60) % 24; const mm = m % 60; return `${h % 12 === 0 ? 12 : h % 12}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${h >= 12 ? "PM" : "AM"}`; };
const WINERIES = venues.filter((v) => v.category === "winery");

function windowFor(v, day, date) {
  if (v.status && v.status !== "open") return null;
  if (v.needsHours) return null; // unknown hours are never charted as open
  const h = v.hours && v.hours[day];
  if (!h || h.closed) return null;
  return { open: toMin(h.open), close: toMin(h.close) };
}

export default function GlanceLens() {
  const [st, setSt] = useState(null);
  const [tab, setTab] = useState("hours");
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const on = (e) => setSt(e.detail);
    window.addEventListener("tcwine:state", on);
    return () => window.removeEventListener("tcwine:state", on);
  }, []);

  const date = st?.date || null;
  const day = date ? DAYS[new Date(date + "T12:00:00").getDay()] : null;
  const startMin = st?.start ? toMin(st.start) : 660;

  const open = useMemo(() => (day ? WINERIES.map((v) => ({ v, w: windowFor(v, day, date) })).filter((x) => x.w) : []), [day, date]);

  const hours = useMemo(() => {
    const lo = 10, hi = 21;
    const cols = [];
    for (let h = lo; h < hi; h++) {
      const by = { "old-mission": 0, leelanau: 0, "traverse-city": 0 };
      open.forEach(({ v, w }) => { if (w.open <= h * 60 && w.close > h * 60) by[v.area] = (by[v.area] || 0) + 1; });
      cols.push({ h, by, total: by["old-mission"] + by.leelanau + by["traverse-city"] });
    }
    return cols;
  }, [open]);

  const grapes = useMemo(() => {
    const c = {};
    open.forEach(({ v }) => v.tags.forEach((t) => { if (GRAPE_SKIP.has(t)) return; (c[t] = c[t] || { "old-mission": 0, leelanau: 0, "traverse-city": 0, total: 0 }); c[t][v.area]++; c[t].total++; }));
    return Object.entries(c).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
  }, [open]);

  const drives = useMemo(() => {
    if (!st?.originPt) return [];
    return open.map(({ v }) => ({ v, min: Math.round(miles(st.originPt, v) * 2.108) })).sort((a, b) => a.min - b.min);
  }, [open, st?.originPt]);

  if (!st) {
    return (
      <section className="glance" aria-labelledby="glance-title">
        <h2 id="glance-title">See the day at a glance</h2>
        <p className="glance-sub">Loading the map data…</p>
      </section>
    );
  }

  const selected = new Set(st.selected || []);
  const styles = new Set(st.styles || []);
  const maxTotal = Math.max(1, ...hours.map((c) => c.total));
  const latest = open.reduce((m, { w }) => Math.max(m, w.close), 0);
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const pickTab = (t) => { setTab(t); trackWineEvent("wine_lens_tab", { tab: t }); };
  const send = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));
  const shown = (list) => (showAll ? list : list.slice(0, 10));

  return (
    <section className="glance" aria-labelledby="glance-title">
      <h2 id="glance-title">See the day at a glance</h2>
      <p className="glance-sub">
        On <strong>{dateLabel}</strong>, {open.length} of {WINERIES.length} mapped wineries post hours{latest ? <> and the latest tasting room closes at {fmtTime(latest)}</> : null}. Tap any bar to plan with it.
      </p>
      <div className="glance-tabs" role="tablist" aria-label="Chart views">
        {[["hours", "Who is open when"], ["styles", "By grape"], ["drive", "Drive time"]].map(([id, label]) => (
          <button key={id} role="tab" type="button" data-chart-tab={id} aria-selected={tab === id} className={tab === id ? "on" : ""} onClick={() => pickTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "hours" && (
        <div role="tabpanel" data-chart="hours">
          <p className="glance-help">Wineries open at each hour. Tap an hour to start your day then. Your start time is outlined.</p>
          <div className="hour-chart" role="group" aria-label="Wineries open by hour">
            {hours.map((c) => (
              <button key={c.h} type="button" className={"hour-col" + (Math.floor(startMin / 60) === c.h ? " on" : "")}
                aria-label={`${c.total} wineries open at ${hourLabel(c.h)}. Start the day at ${fmtTime(c.h * 60)}`}
                onClick={() => send("tcwine:time", { time: String(c.h).padStart(2, "0") + ":00" })}>
                <span className="hour-n">{c.total}</span>
                <span className="hour-stack" style={{ height: `${Math.max(4, (c.total / maxTotal) * 100)}%` }}>
                  {AREAS.map(([k, , color]) => (c.by[k] ? <i key={k} style={{ flexGrow: c.by[k], background: color }} /> : null))}
                </span>
                <span className="hour-l">{hourLabel(c.h)}</span>
              </button>
            ))}
          </div>
          <Legend />
          <p className="glance-note">Places without posted hours are left out rather than guessed. Hours shift with the season, so confirm before you go.</p>
        </div>
      )}

      {tab === "styles" && (
        <div role="tabpanel" data-chart="styles">
          <p className="glance-help">Wineries pouring each grape or style open this day. Tap one to steer the suggestions toward it.</p>
          <ul className="bar-list">
            {grapes.map(([tag, c]) => (
              <li key={tag}>
                <button type="button" aria-pressed={styles.has(tag)} className={styles.has(tag) ? "on" : ""} onClick={() => send("tcwine:style", { tag })}>
                  <span className="bar-name">{pretty(tag)}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: `${(c.total / grapes[0][1].total) * 100}%` }}>
                    {AREAS.map(([k, , color]) => (c[k] ? <i key={k} style={{ flexGrow: c[k], background: color }} /> : null))}
                  </span></span>
                  <span className="bar-val">{c.total}</span>
                </button>
              </li>
            ))}
          </ul>
          <Legend />
        </div>
      )}

      {tab === "drive" && (
        <div role="tabpanel" data-chart="drive">
          <p className="glance-help">Estimated minutes of driving from <strong>{st.origin}</strong> (straight-line estimate, not live traffic). Tap to add a stop.</p>
          <ul className="bar-list">
            {shown(drives).map(({ v, min }) => (
              <li key={v.id}>
                <button type="button" aria-pressed={selected.has(v.id)} className={selected.has(v.id) ? "on" : ""} onClick={() => send("tcwine:toggle", { id: v.id })}>
                  <span className="bar-name">{v.name.replace(/ (Winery|Vineyards?|Estate).*$/, "")}</span>
                  <span className="bar-track"><span className="bar-fill" style={{ width: `${Math.max(6, (min / (drives[drives.length - 1]?.min || 1)) * 100)}%`, background: AREAS.find(([k]) => k === v.area)?.[2] }} /></span>
                  <span className="bar-val">{min}m</span>
                </button>
              </li>
            ))}
          </ul>
          {drives.length > 10 && <button type="button" className="glance-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Show fewer" : `Show all ${drives.length}`}</button>}
          <Legend />
        </div>
      )}
    </section>
  );
}

function Legend() {
  return (
    <p className="glance-legend" aria-hidden="true">
      {AREAS.map(([k, label, color]) => (<span key={k}><i style={{ background: color }} />{label}</span>))}
    </p>
  );
}
