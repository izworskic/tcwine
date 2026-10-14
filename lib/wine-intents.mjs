// "What kind of day?" intents and the stop picker behind them.
//
// Pure functions only (no DOM), so the same code runs in the browser planner and in
// scripts/check-wine-intents.mjs, which sweeps every intent across dates, starts and origins.
//
// Why this exists: the old "Suggest 3" took the three places nearest the origin. It ignored what
// the visitor cared about, put places with unknown hours first, and scheduled a tasting room that
// opens at 4 PM into an 11 AM plan. pickStops scores fit, refuses long waits and unknown hours when
// a better option exists, and keeps the whole day on one peninsula.

export const INTENTS = [
  { id: "first", label: "First visit", sub: "An easy, scenic loop", photo: "oldMission", n: 3,
    bonus: (v) => (v.officialTrail ? 4 : 0) + (v.view ? 2 : 0) },
  { id: "group", label: "Group of 6+", sub: "Food on site; call ahead", photo: "leelanau", n: 4, must: { food: true }, note: "group",
    bonus: () => 0 },
  { id: "lover", label: "Wine lover", sub: "Small producers; choose grapes", photo: "leelanau", n: 3, note: "lover",
    bonus: (v) => (v.tags.includes("broad-lineup") ? -14 : 10) },
  { id: "views", label: "Views & fall color", sub: "Bay and lake views", photo: "chateau", n: 3, must: { view: true },
    bonus: (v) => (v.view === "bay" ? 8 : 4) },
  { id: "family", label: "Family & non-drinkers", sub: "Food, a beach, easy stops", photo: "oldMission", n: 3, must: { food: true },
    sights: ["beach", "scenic"], note: "family", bonus: () => 0 },
  { id: "beer", label: "Beer & cider", sub: "Traverse City taprooms", n: 3, beverages: ["beer", "cider"], area: "traverse-city",
    bonus: () => 0 },
  { id: "now", label: "Open right now", sub: "Only what is open with time left", photo: "chateau", n: 3, now: true,
    bonus: () => 0 },
];
export const intentById = (id) => INTENTS.find((i) => i.id === id) || null;

export const VIEW_WATER = ["bay", "lake"];
export const passesNeeds = (v, must = {}) =>
  (!must.dog || v.dogFriendly === true) && (!must.food || !!v.food) && (!must.view || VIEW_WATER.includes(v.view));

/** Round a clock minute up to the next quarter hour. */
export const ceil15 = (m) => Math.ceil(m / 15) * 15;

/**
 * @param p.pool      venues already filtered by day/area/drink/needs
 * @param p.windowFor (venue) => {open, close, callAhead} | null   minutes since midnight
 * @param p.legMin    (a, b) => minutes of driving
 * @param p.coords    (id) => {lat, lng}
 * @returns {{ids: string[], driveMin: number, score: number}}
 */
export function pickStops(p) {
  const { pool, windowFor, legMin, origin, startMin, finishMin = 18 * 60, n = 3, area = "any", styles = new Set(),
    bonus = () => 0, keep = [], maxWait = 45, wineOnly = false } = p;
  const base = pool.filter((v) => !(wineOnly && v.category !== "winery") && v.area !== "outer");
  const areas = area === "any" ? [...new Set(base.map((v) => v.area))] : [area];

  const chain = (list, allowUnknown) => {
    const ids = []; let clock = startMin; let cur = origin; let score = 0; let drive = 0;
    const fixed = keep.map((id) => list.find((v) => v.id === id)).filter(Boolean);
    const place = (v) => {
      const w = windowFor(v); const d = legMin(cur, v);
      let arrive = clock + d; if (w && arrive < w.open) arrive = w.open;
      ids.push(v.id); drive += d; clock = arrive + (v.dwellMinutes || 45); cur = v;
    };
    fixed.forEach(place);
    while (ids.length < n) {
      let best = null, bestScore = -Infinity;
      for (const v of list) {
        if (ids.includes(v.id)) continue;
        if (v.needsHours && !allowUnknown) continue;
        const w = windowFor(v); if (!w) continue;
        const d = legMin(cur, v); let arrive = clock + d; const wait = Math.max(0, w.open - arrive);
        if (wait > maxWait) continue; arrive = Math.max(arrive, w.open);
        const dwell = v.dwellMinutes || 45;
        if (w.close - arrive < dwell + 15) continue;
        if (arrive + dwell > finishMin) continue;
        const hits = styles.size ? v.tags.filter((t) => styles.has(t)).length : 0;
        const s = 40 + (v.rating || 3.5) * 6 + 14 * Math.min(hits, 2) + bonus(v) - 0.9 * d - 0.5 * wait;
        if (s > bestScore) { bestScore = s; best = v; }
      }
      if (!best) break;
      const d = legMin(cur, best); score += bestScore; place(best);
    }
    return { ids, drive, score };
  };

  let best = { ids: [], driveMin: 0, score: -Infinity };
  for (const a of areas) {
    const list = base.filter((v) => v.area === a);
    let r = chain(list, false);
    if (r.ids.length < Math.min(n, 2)) r = chain(list, true);
    if (!r.ids.length) continue;
    const value = r.score - 0.35 * r.drive + (r.ids.length >= n ? 40 : 0);
    if (value > best.score) best = { ids: r.ids, driveMin: r.drive, score: value };
  }
  return best;
}
