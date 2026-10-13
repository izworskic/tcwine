"use client";

import { useMemo, useState } from "react";
import { REGIONS, decide } from "@/lib/wine-region-choice.mjs";

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
