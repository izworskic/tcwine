"use client";

import { useMemo, useState } from "react";

const REGIONS = {
  "old-mission": {
    label: "Old Mission Peninsula",
    mood: "A focused vineyard day on the narrow ridge between the two arms of Grand Traverse Bay.",
    action: "Plan Old Mission wineries",
    url: "https://tcwine.chrisizworski.com/old-mission-peninsula-wineries",
    tradeoff: "You give up the longer harbor-town road trip in exchange for a compact route.",
  },
  leelanau: {
    label: "Leelanau Peninsula",
    mood: "A rambling wine day with villages, vineyard hills, bay views, and room to linger.",
    action: "Plan Leelanau wineries",
    url: "https://tcwine.chrisizworski.com/leelanau-peninsula-wine-trail",
    tradeoff: "Distances between villages are real. Pick one sub-region rather than chasing every name.",
  },
  petoskey: {
    label: "Petoskey / Tip of the Mitt",
    mood: "Northern lake country: small tasting rooms, cold-hardy wine styles, and a slower day near Little Traverse Bay.",
    action: "Plan Petoskey wineries",
    url: "https://chrisizworski.com/petoskey-wine/",
    tradeoff: "This is not a Leelanau Riesling day. Expect a distinct cold-climate wine program and spread-out stops.",
  },
};

function decide(base, priority, time) {
  // The first gate is geography, not a fictitious wine-quality score.
  if (base === "petoskey") {
    return {
      winner: "petoskey",
      alternate: "leelanau",
      why: "You are already in the Little Traverse Bay area. A wine day works better when most of it is spent tasting and exploring, not driving to a distant peninsula.",
      caution: time === "short" ? "Keep this to a tight Walloon Lake or Petoskey cluster; do not attempt the whole trail." : "Even with a full day, choose a local cluster. The far ends of the trail are not one convenient loop.",
    };
  }
  if (base === "leelanau") {
    return {
      winner: "leelanau",
      alternate: "old-mission",
      why: priority === "wine" ? "Start where you are and build a wine-led route with the varietal filters, rather than crossing Traverse City just to reach a different peninsula." : "Suttons Bay and the Leelanau villages are your natural starting points. Keep this day on one side of the peninsula.",
      caution: time === "short" ? "Stay near Suttons Bay or Lake Leelanau, not the entire M-22 loop." : "A full day still benefits from one village cluster and a deliberate meal.",
    };
  }
  if (priority === "harbors" && time === "full" || priority === "sparkling" && time === "full") {
    return {
      winner: "leelanau",
      alternate: "old-mission",
      why: priority === "sparkling" ? "A dedicated sparkling-wine day deserves the larger Leelanau route, where you can build around a specialist instead of choosing by distance alone." : "You have time for the Suttons Bay and Leelanau village experience, rather than only the simplest drive out of Traverse City.",
      caution: "Do not mix far-north Leelanau stops and Old Mission into one ambitious itinerary. Confirm tasting reservations.",
    };
  }
  return {
    winner: "old-mission",
    alternate: "leelanau",
    why: priority === "sparkling" ? "For a shorter Traverse City day, a compact peninsula limits transit. For a sparkling specialist across the bay, allow more time and choose Leelanau instead." : "From Traverse City, the narrow Old Mission route is the simplest way to spend your available hours on wineries rather than transitions.",
    caution: time === "short" ? "Choose two, perhaps three nearby stops. This is not time to complete a trail checklist." : "Even with a full day, allow time for lunch and the bay; do not plan a race.",
  };
}

export default function WineRegionDecision() {
  const [base, setBase] = useState("traverse-city");
  const [priority, setPriority] = useState("wine");
  const [time, setTime] = useState("full");
  const choice = useMemo(() => decide(base, priority, time), [base, priority, time]);
  const region = REGIONS[choice.winner];
  const alternate = REGIONS[choice.alternate];
  return (
    <section className="wine-v5" aria-labelledby="wine-v5-title">
      <div className="wine-v5-intro">
        <p className="wine-v5-kicker">Michigan wine country · the day decision</p>
        <h2 id="wine-v5-title">Which wine country day feels right for you?</h2>
        <p>Not a list of the “best” wineries. A practical starting point based on where you are, what you want from the glass, and how much time you really have.</p>
      </div>
      <div className="wine-v5-controls">
        <label>Where will you start?
          <select value={base} onChange={e => setBase(e.target.value)}>
            <option value="traverse-city">Traverse City</option>
            <option value="leelanau">Suttons Bay / Leelanau</option>
            <option value="petoskey">Petoskey / Harbor Springs</option>
          </select>
        </label>
        <label>What matters most?
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="wine">A wine-led tasting day</option>
            <option value="sparkling">Sparkling wine</option>
            <option value="harbors">Harbor towns and scenery</option>
            <option value="easy">Less time driving</option>
          </select>
        </label>
        <fieldset>
          <legend>Time for this outing</legend>
          <div className="wine-v5-options">
            <button type="button" aria-pressed={time === "short"} className={time === "short" ? "on" : ""} onClick={() => setTime("short")}>3–4 hours</button>
            <button type="button" aria-pressed={time === "full"} className={time === "full" ? "on" : ""} onClick={() => setTime("full")}>A full day</button>
          </div>
        </fieldset>
      </div>
      <div className="wine-v5-verdict" aria-live="polite">
        <div>
          <span className="wine-v5-kicker">Your strongest starting fit</span>
          <h3>{region.label}</h3>
          <p className="wine-v5-mood">{region.mood}</p>
          <p><strong>Why:</strong> {choice.why}</p>
          <p><strong>What to watch:</strong> {choice.caution}</p>
          <a className="wine-v5-action" href={region.url}>{region.action} →</a>
        </div>
        <aside className="wine-v5-alternative">
          <span className="wine-v5-kicker">The worthwhile alternative</span>
          <h4>{alternate.label}</h4>
          <p>{alternate.mood}</p>
          <a href={alternate.url}>Explore this region →</a>
          <p className="wine-v5-fine">{region.tradeoff}</p>
        </aside>
      </div>
      <p className="wine-v5-disclosure">This is an editorial region match, <strong>not live winery availability</strong>. The regional planners check posted hours and routing where available; unknown hours mean call ahead. Trail membership is different from all mapped wineries. No winery pays for placement in this decision.</p>
    </section>
  );
}
