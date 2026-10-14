// Persona value-function benchmark for the TC Wine home planner.
//
//   node scripts/benchmark-tc-wine-usefulness.mjs [--url http://127.0.0.1:8792] [--label baseline] [--save]
//
// Ten visitor personas drive the page on a 390px phone with a fixed clock. Each persona's best
// available path is scripted, the resulting plan is read back from the DOM, and a weighted loss
// is computed. 0 = perfect, 1 = useless. Persona weights are ASSUMPTIONS about the audience
// (there is no per-persona search data); they are stated here so they can be argued with.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("/home/claude/.npm-global/lib/node_modules/playwright");
const venues = JSON.parse(fs.readFileSync(new URL("../data/venues.json", import.meta.url)));
const byId = Object.fromEntries(venues.map((v) => [v.id, v]));

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const URL_ = arg("--url", "http://127.0.0.1:8792");
const LABEL = arg("--label", "run");
const SAVE = args.includes("--save");
const DRIVER = arg("--driver", "baseline"); // which scripted journeys to use

const FACTORS = { react: 20, fit: 30, hours: 15, firstScreen: 12, evidence: 13, facts: 10 };

const miles = (a, b) => {
  const R = 3958.8, r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const toMin = (s) => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
const parseClock = (t) => { const m = /(\d+):(\d+)\s*(AM|PM)/i.exec(t || ""); if (!m) return null; let h = +m[1] % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + +m[2]; };
const ORIGINS = { "Traverse City": { lat: 44.7631, lng: -85.6206 }, Leland: { lat: 45.0236, lng: -85.7584 } };

// ---------------------------------------------------------------- personas
// when: ISO local time the visit "happens"; need.fit: [label, (ctx)=>bool]; evidence: ids that persona's decision needs.
const PERSONAS = [
  { id: "first-timer-couple", w: 25, name: "First-timer couple, Saturday, from Traverse City", when: "2026-10-17T10:30:00", origin: "Traverse City",
    fit: [["3+ wineries", (c) => c.wineries.length >= 3], ["one peninsula", (c) => new Set(c.wineries.map((v) => v.area)).size === 1], ["under 100 min driving", (c) => c.driveMin <= 100]],
    evidence: ["image", "drive"], facts: [/closes/i] },
  { id: "group-of-8", w: 12, name: "Group of 8 with a shuttle, needs food and reservations", when: "2026-10-17T10:30:00", origin: "Traverse City",
    fit: [["3-4 stops", (c) => c.stops.length >= 3 && c.stops.length <= 4], ["a stop with food", (c) => c.stops.some((v) => v.food)], ["shuttle or driver advice", (c) => /shuttle|designated|chauffeur/i.test(c.text)]],
    evidence: [], facts: [/reserv|book/i] },
  { id: "wine-enthusiast", w: 10, name: "Enthusiast: Riesling + Cabernet Franc, small producers", when: "2026-10-17T10:30:00", origin: "Traverse City",
    fit: [["3+ wineries", (c) => c.wineries.length >= 3], ["every stop pours Riesling or Cab Franc", (c) => c.wineries.every((v) => v.tags.some((t) => /riesling|cabernet-franc/.test(t)))], ["not just the biggest labels", (c) => c.wineries.filter((v) => !v.tags.includes("broad-lineup")).length >= 2]],
    evidence: ["styles"], facts: [/riesling|cabernet franc/i] },
  { id: "fall-color", w: 14, name: "Fall-color weekend driver, wants views", when: "2026-10-17T10:30:00", origin: "Traverse City",
    fit: [["3+ wineries", (c) => c.wineries.length >= 3], ["2+ with bay or lake views", (c) => c.wineries.filter((v) => ["bay", "lake"].includes(v.view)).length >= 2], ["one peninsula", (c) => new Set(c.wineries.map((v) => v.area)).size === 1]],
    evidence: ["image"], facts: [/view/i] },
  { id: "family-non-drinker", w: 8, name: "Family, non-drinking driver: food and a beach", when: "2026-10-17T10:30:00", origin: "Traverse City",
    fit: [["has a sight stop", (c) => c.stops.some((v) => v.isPoi)], ["has a food stop", (c) => c.stops.some((v) => v.food) || /lunch/i.test(c.text)], ["4 stops or fewer", (c) => c.stops.length <= 4]],
    evidence: ["image"], facts: [/snack|pizza|kitchen|bistro|food|lunch/i] },
  { id: "open-now", w: 8, name: "Open right now, Wednesday 2:00 PM, on the phone", when: "2026-10-14T14:00:00", origin: "Traverse City",
    fit: [["nothing in the past", (c) => c.arrivals.every((a) => a >= 14 * 60)], ["2+ stops", (c) => c.stops.length >= 2], ["each open 45+ min after arrival", (c) => c.stops.every((v, i) => v.isPoi || (v.hoursClose[c.day] || 0) - c.arrivals[i] >= 45)]],
    evidence: ["hours"], facts: [/open now|closes/i] },
  { id: "beer-cider", w: 6, name: "Beer and cider group in Traverse City, Friday", when: "2026-10-16T13:00:00", origin: "Traverse City",
    fit: [["3+ stops", (c) => c.stops.length >= 3], ["all breweries or cideries", (c) => c.stops.every((v) => ["brewery", "cidery"].includes(v.category))], ["no wineries", (c) => c.wineries.length === 0]],
    evidence: [], facts: [/beer|cider/i] },
  { id: "local-weekday", w: 5, name: "Local on a Monday, wants to know who is open", when: "2026-10-19T11:00:00", origin: "Traverse City",
    fit: [["2+ stops", (c) => c.stops.length >= 2], ["all open Monday", (c) => c.stops.every((v) => v.isPoi || v.hoursClose.Monday)], ["no past times", (c) => c.arrivals.every((a) => a >= 11 * 60)]],
    evidence: ["hours"], facts: [/closes/i] },
  { id: "based-in-leland", w: 8, name: "Staying in Leland, Saturday", when: "2026-10-17T10:30:00", origin: "Leland",
    fit: [["3+ wineries", (c) => c.wineries.length >= 3], ["all within 15 mi of Leland", (c) => c.wineries.every((v) => miles(ORIGINS.Leland, v) <= 15)], ["says back to Leland", (c) => /back to Leland/i.test(c.text)]],
    evidence: ["drive"], facts: [/back to Leland/i] },
  { id: "dog-owner", w: 4, name: "Dog owner, Saturday", when: "2026-10-17T10:30:00", origin: "Traverse City",
    fit: [["3+ wineries", (c) => c.wineries.length >= 3], ["every stop dog-friendly", (c) => c.stops.length > 0 && c.stops.every((v) => v.dogFriendly)], ["says dog-friendly", (c) => /dog/i.test(c.text)]],
    evidence: [], facts: [/dog/i] },
];

// ---------------------------------------------------------------- drivers
// A driver returns { actions, ok } after leaving a built plan on screen, or null when no path exists.
const DRIVERS = {
  baseline: {
    "first-timer-couple": async (u) => { await u.tap('button:has-text("An Old Mission afternoon")'); },
    "group-of-8": async (u) => { await u.tap('button:has-text("An Old Mission afternoon")'); },
    "wine-enthusiast": async (u) => { await u.tap("#moreToggle"); await u.tap('#styleCloud button:has-text("Riesling")'); await u.tap('#styleCloud button:has-text("Cabernet Franc")'); await u.tap("#suggestBtn"); await u.tap("#buildBtn2"); },
    "fall-color": async (u) => { await u.tap("#suggestBtn"); await u.tap("#buildBtn2"); },
    "family-non-drinker": async (u) => { await u.tap("#moreToggle"); await u.tap('#sightChips button:has-text("Beaches")'); await u.tap("#suggestBtn"); await u.tap("#sightBtn"); await u.tap("#buildBtn2"); },
    "open-now": async (u) => { await u.fill("#timeInput", "14:00"); await u.tap("#suggestBtn"); await u.tap("#buildBtn2"); },
    "beer-cider": async (u) => { await u.tap('#bevChips button:has-text("Wine")'); await u.tap('#bevChips button:has-text("Beer")'); await u.tap('#bevChips button:has-text("Cider")'); await u.tap("#suggestBtn"); await u.tap("#buildBtn2"); },
    "local-weekday": async (u) => { await u.fill("#dateInput", "2026-10-19"); await u.tap("#suggestBtn"); await u.tap("#buildBtn2"); },
    "based-in-leland": async (u) => { await u.select("#originSelect", "Leland"); await u.tap("#suggestBtn"); await u.tap("#buildBtn2"); },
    "dog-owner": null, // no dog-friendly control exists; the data field is never exposed
  },
};
try { Object.assign(DRIVERS, (await import("./benchmark-tc-wine-drivers.mjs")).DRIVERS); } catch { /* only the baseline driver exists before the redesign */ }

// ---------------------------------------------------------------- harness
async function run() {
  const browser = await chromium.launch();
  const results = [];
  let firstScreen = null;
  for (const persona of PERSONAS) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, timezoneId: "America/Detroit" });
    const page = await ctx.newPage();
    await page.clock.install({ time: new Date(persona.when) });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (r) => r.abort());
    const t0 = Date.now();
    await page.goto(URL_ + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#plan, [data-tc-plan]", { timeout: 20000 });
    await page.waitForTimeout(800);
    if (!firstScreen) {
      firstScreen = await page.evaluate(() => {
        const vh = innerHeight, map = document.getElementById("map");
        const mapTop = map ? map.getBoundingClientRect().top : 9999;
        // A question group is one thing the visitor must decide (a chip row, a field, a toggle), not one tap target.
        const groups = [...document.querySelectorAll("#controls .grp, [data-qgroup], #controls .more-toggle")].filter((e) => {
          const r = e.getBoundingClientRect(); const s = getComputedStyle(e);
          if (e.closest("[data-qgroup]") && !e.hasAttribute("data-qgroup")) return false;
          return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden" && r.top < mapTop - 2 && r.top >= 0;
        }).length;
        const img = [...document.querySelectorAll("img:not(.leaflet-container img)")].some((i) => i.getBoundingClientRect().top < vh * 2 && i.getBoundingClientRect().width > 150);
        return { mapTop: Math.round(mapTop), vh, questionsBeforeMap: groups, imageInTwoScreens: img };
      });
    }
    const probe = await page.evaluate(() => ({
      hours: !!document.querySelector('[data-chart="hours"],[data-chart-tab="hours"]'), styles: !!document.querySelector('[data-chart="styles"],[data-chart-tab="styles"]'), drive: !!document.querySelector('[data-chart="drive"],[data-chart-tab="drive"]'),
      image: [...document.querySelectorAll("img:not(.leaflet-container img)")].some((i) => i.getBoundingClientRect().top + scrollY < innerHeight * 3 && i.width > 150),
    }));
    const driver = (DRIVERS[DRIVER] || DRIVERS.baseline)[persona.id];
    let actions = 0, reachable = !!driver, secs = null, plan = null;
    if (driver) {
      const u = {
        async tap(sel) {
          const el = page.locator(sel).first();
          await el.waitFor({ state: "attached", timeout: 8000 });
          const off = await el.evaluate((n) => { const r = n.getBoundingClientRect(); return r.bottom < 0 || r.top > innerHeight; });
          if (off) { actions++; await el.scrollIntoViewIfNeeded(); }
          if (!(await el.isVisible())) { actions++; } // would need to open something first
          await el.click({ force: true }); actions++; await page.waitForTimeout(250);
        },
        async fill(sel, val) { const el = page.locator(sel).first(); actions++; await el.evaluate((n, v) => { n.value = v; n.dispatchEvent(new Event("input", { bubbles: true })); n.dispatchEvent(new Event("change", { bubbles: true })); }, val); await page.waitForTimeout(250); },
        async select(sel, val) { const el = page.locator(sel).first(); actions++; await el.selectOption(val); await page.waitForTimeout(250); },
        page,
      };
      const t1 = Date.now();
      try { await driver(u); await page.waitForSelector("#plan .stops, [data-tc-plan] .stops", { timeout: 15000 }); secs = (Date.now() - t1) / 1000; } catch (e) { reachable = false; }
      await page.waitForTimeout(300);
      plan = await page.evaluate(() => {
        const root = document.getElementById("plan") || document.querySelector("[data-tc-plan]");
        const rows = [...root.querySelectorAll("[data-row]")].map((r) => ({ id: r.dataset.row, time: r.querySelector(".stop-time")?.textContent || "" }));
        return { rows, text: root.innerText };
      });
    }
    const day = new Date(persona.when).toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Detroit" });
    const pois = JSON.parse(fs.readFileSync(new URL("../data/pois.json", import.meta.url)));
    const all = { ...byId, ...Object.fromEntries(pois.map((p) => [p.id, { ...p, isPoi: true }])) };
    let s = { react: 0, fit: 0, hours: 0, facts: 0, fitDetail: [] };
    if (reachable && plan && plan.rows.length) {
      const stops = plan.rows.map((r) => all[r.id]).filter(Boolean).map((v) => ({ ...v, hoursClose: Object.fromEntries(Object.entries(v.hours || {}).filter(([, h]) => h && !h.closed).map(([d, h]) => [d, toMin(h.close)])) }));
      const arrivals = plan.rows.map((r) => parseClock((r.time.split("–")[0] || "").trim()));
      const wineries = stops.filter((v) => v.category === "winery");
      const driveMatch = /(\d+h )?(\d+)m\s*driving|(\d+)h (\d+)m\s*driving|·\s*(\d+)m\s*driving/.exec(plan.text);
      const dm = /(?:(\d+)h\s*)?(\d+)m\s*driving/.exec(plan.text);
      const driveMin = dm ? (+dm[1] || 0) * 60 + +dm[2] : 0;
      const c = { stops, wineries, arrivals, day, text: plan.text, driveMin };
      s.fitDetail = persona.fit.map(([label, fn]) => [label, !!fn(c)]);
      s.fit = s.fitDetail.filter(([, ok]) => ok).length / s.fitDetail.length;
      s.hours = stops.length && stops.every((v, i) => v.isPoi || v.needsHours || (v.hoursClose[day] != null && arrivals[i] != null && v.hours[day].open && arrivals[i] >= toMin(v.hours[day].open) && v.hoursClose[day] - arrivals[i] >= 15)) ? 1 : 0;
      s.facts = persona.facts.filter((re) => re.test(plan.text)).length / persona.facts.length;
      s.react = actions <= 2 ? 1 : actions === 3 ? 0.8 : actions === 4 ? 0.6 : actions === 5 ? 0.45 : actions <= 7 ? 0.3 : 0.1;
    }
    const needs = persona.evidence;
    s.evidence = needs.length ? needs.filter((id) => probe[id]).length / needs.length : 1;
    s.firstScreen = Math.max(0, Math.min(1, 1 - (firstScreen.questionsBeforeMap - 3) / 6)) * (firstScreen.mapTop < 844 * 0.75 ? 1 : 0.6);
    const loss = Object.entries(FACTORS).reduce((n, [k, w]) => n + w * (1 - s[k]), 0) / 100;
    results.push({ persona: persona.id, weight: persona.w, name: persona.name, reachable, actions, secs: secs && +secs.toFixed(1), stops: plan?.rows.map((r) => r.id) || [], scores: { react: s.react, fit: s.fit, hours: s.hours, firstScreen: +s.firstScreen.toFixed(2), evidence: s.evidence, facts: s.facts }, fitDetail: s.fitDetail, loss: +loss.toFixed(3) });
    await ctx.close();
  }
  await browser.close();
  const loss = results.reduce((n, r) => n + r.weight * r.loss, 0) / results.reduce((n, r) => n + r.weight, 0);
  return { label: LABEL, driver: DRIVER, factors: FACTORS, firstScreen, loss: +loss.toFixed(3), results };
}

const out = await run();
console.log(`\nTC Wine usefulness [${out.label}] weighted loss = ${out.loss}`);
console.log(`first screen: map starts ${out.firstScreen.mapTop}px down, ${out.firstScreen.questionsBeforeMap} questions above it, image within 2 screens: ${out.firstScreen.imageInTwoScreens}\n`);
for (const r of out.results) {
  const f = r.fitDetail.map(([l, ok]) => `${ok ? "✓" : "✗"} ${l}`).join("; ");
  console.log(`${r.loss.toFixed(2)}  ${r.persona.padEnd(20)} ${r.reachable ? `${r.actions} actions, ${r.stops.length} stops` : "NO PATH"}  ${f}`);
}
if (SAVE) {
  const file = new URL("../benchmarks/tc-wine-usefulness.json", import.meta.url);
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) : { runs: [] };
  prev.runs = prev.runs.filter((r) => r.label !== out.label).concat(out);
  fs.writeFileSync(file, JSON.stringify(prev, null, 2) + "\n");
}
