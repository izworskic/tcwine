// Sweeps every "kind of day" intent across dates, start times and origins and asserts the picker's
// invariants. Mirrors the planner's own window/drive helpers (components/Planner.js).
import fs from "node:fs";
import { INTENTS, pickStops, passesNeeds, ceil15 } from "../lib/wine-intents.mjs";

const venues = JSON.parse(fs.readFileSync(new URL("../data/venues.json", import.meta.url)));
const origins = JSON.parse(fs.readFileSync(new URL("../data/origins.json", import.meta.url)));
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMin = (s) => { if (s === "24:00") return 1440; const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const miles = (a, b) => { const R = 3958.8, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r; const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2; return 2 * 3958.8 * Math.asin(Math.sqrt(h)); };
const legMin = (a, b) => Math.round(miles(a, b) * 2.108);
const available = (v, date) => {
  if (v.status && v.status !== "open") return false;
  if (v.season) { if (v.season.year && date.slice(0, 4) !== String(v.season.year)) return false; if (v.season.start && date < v.season.start) return false; if (v.season.end && date > v.season.end) return false; }
  return true;
};
const windowFor = (v, date) => { if (!available(v, date)) return null; const day = DAYS[new Date(date + "T12:00:00").getDay()]; if (v.needsHours) return { open: 660, close: 1080, callAhead: true }; const h = v.hours?.[day]; if (!h || h.closed) return null; return { open: toMin(h.open), close: toMin(h.close), callAhead: false }; };

const dates = ["2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17", "2026-10-18", "2026-10-19", "2026-10-20"];
const starts = [600, 660, 750, 840, 900, 960];
let runs = 0, thin = 0, failures = [];
const stats = {};
for (const intent of INTENTS) {
  stats[intent.id] = { runs: 0, full: 0 };
  const wineOnly = !intent.beverages;
  for (const date of dates) for (const [oname, o] of Object.entries(origins)) for (const startMin of starts) for (const must of [intent.must || {}, { ...(intent.must || {}), dog: true }]) {
    const pool = venues.filter((v) => {
      if (v.area === "outer") return false;
      if (intent.area && v.area !== intent.area) return false;
      if (intent.beverages ? ![...v.beverages].some((b) => intent.beverages.includes(b)) : !v.beverages.includes("wine")) return false;
      if (!passesNeeds(v, must)) return false;
      return !!windowFor(v, date);
    });
    const r = pickStops({ pool, windowFor: (v) => windowFor(v, date), legMin, origin: o, startMin, finishMin: 18 * 60, n: intent.n, area: intent.area || "any", bonus: intent.bonus, wineOnly });
    runs++; stats[intent.id].runs++;
    if (r.ids.length >= intent.n) stats[intent.id].full++; else thin++;
    const chosen = r.ids.map((id) => venues.find((v) => v.id === id));
    const tag = `${intent.id} ${date} ${oname} start ${startMin} ${must.dog ? "dog" : ""}`;
    if (new Set(r.ids).size !== r.ids.length) failures.push(`${tag}: duplicate stop`);
    if (new Set(chosen.map((v) => v.area)).size > 1) failures.push(`${tag}: spans areas`);
    let clock = startMin, cur = o;
    for (const v of chosen) {
      const w = windowFor(v, date);
      if (!w) { failures.push(`${tag}: ${v.id} closed`); continue; }
      let arrive = clock + legMin(cur, v);
      if (w.open - arrive > 45) failures.push(`${tag}: ${v.id} waits ${w.open - arrive} min`);
      arrive = Math.max(arrive, w.open);
      if (w.close - arrive < (v.dwellMinutes || 45) + 15) failures.push(`${tag}: ${v.id} closes before the visit ends`);
      if (arrive + (v.dwellMinutes || 45) > 18 * 60) failures.push(`${tag}: ${v.id} runs past 6 PM`);
      if (!passesNeeds(v, must)) failures.push(`${tag}: ${v.id} fails needs`);
      if (v.needsHours && chosen.filter((x) => !x.needsHours).length >= intent.n) failures.push(`${tag}: unknown-hours ${v.id} chosen although enough known-hours stops fit`);
      clock = arrive + (v.dwellMinutes || 45); cur = v;
    }
  }
}
if (ceil15(601) !== 615 || ceil15(600) !== 600) failures.push("ceil15 broken");
if (failures.length) { console.error(failures.slice(0, 15).join("\n")); console.error(`${failures.length} invariant failures in ${runs} runs`); process.exit(1); }
const line = Object.entries(stats).map(([k, s]) => `${k} ${Math.round((100 * s.full) / s.runs)}% full`).join(", ");
console.log(`Wine intents: ${runs} picks across 7 dates x ${Object.keys(origins).length} origins x ${starts.length} starts held every invariant. Full-size days: ${line}.`);
