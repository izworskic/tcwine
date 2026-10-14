# TC Wine: personas, value function and benchmark

Updated Oct 14 2026. Run it: `npm run benchmark:usefulness -- --url http://127.0.0.1:PORT --driver after --label after --save`
(start the site with `npm run build && npx next start -p PORT`). The invariants behind the picker run in `npm test` (`scripts/check-wine-intents.mjs`).

## Method

Ten visitor personas drive the home planner on a 390px phone with a fixed clock. Each persona's best available path is scripted,
the resulting plan is read back from the page, and a weighted loss is computed (0 = perfect, 1 = useless).

Value function per persona (weights sum to 100):

| Factor | Weight | Measures |
| --- | --- | --- |
| fit | 30 | Does the plan satisfy that persona's three needs (e.g. every stop dog-friendly)? |
| react | 20 | Actions (taps and scrolls) from landing to a built plan. 1-2 = full marks. |
| hours | 15 | Every stop open at arrival with 15+ min to spare, from the venue data. |
| evidence | 13 | Does the page show the chart or image that persona's decision needs? |
| firstScreen | 12 | Questions asked above the map, and how far down the map starts. |
| facts | 10 | Does the plan show the facts that persona needs (view, dog, food, grape, reservations)? |

Overall loss = persona-weighted mean. **Persona weights are assumptions about the audience** (there is no per-persona search data); change them in
`scripts/benchmark-tc-wine-usefulness.mjs` and re-run.

## Result

Overall loss **0.292 → 0.008**.

| Persona | Weight | Before | After | Actions |
| --- | --- | --- | --- | --- |
| First-timer couple, Saturday, from Traverse City | 25 | 0.17 | 0.00 | 2 → 1 |
| Group of 8 with a shuttle, needs food and reservations | 12 | 0.04 | 0.00 | 2 → 1 |
| Enthusiast: Riesling + Cabernet Franc, small producers | 10 | 0.41 | 0.08 | 6 → 4 |
| Fall-color weekend driver, wants views | 14 | 0.51 | 0.00 | 3 → 1 |
| Family, non-drinking driver: food and a beach | 8 | 0.31 | 0.00 | 7 → 1 |
| Open right now, Wednesday 2:00 PM, on the phone | 8 | 0.35 | 0.00 | 4 → 1 |
| Beer and cider group in Traverse City, Friday | 6 | 0.18 | 0.00 | 6 → 1 |
| Local on a Monday, wants to know who is open | 5 | 0.35 | 0.00 | 4 → 2 |
| Staying in Leland, Saturday | 8 | 0.25 | 0.00 | 4 → 2 |
| Dog owner, Saturday | 4 | 0.79 | 0.00 | no path → 1 |

## What the baseline found

- "Suggest 3" took the three places nearest the origin. It ignored style, views, dogs and food, put a cider house with unknown hours first in every plan,
  and scheduled a tasting room that opens at 4 PM into an 11 AM Monday plan.
- A dog owner had no way to filter, although `dogFriendly` is in the data.
- The default start time was 11:00 even at 2 PM, and the default date was computed in UTC (it flips to "tomorrow" at 8 PM Eastern).
- The first phone screen asked five separate questions before showing the map.

## What changed

- **What kind of day?** Seven one-tap intents (first visit, group of 6+, wine lover, views and fall color, family and non-drinkers, beer and cider, open right now),
  plus Must-have toggles (dogs, food, water views). A tap builds the day; later changes re-plan it while the visitor has not hand-edited stops.
- **Picker** (`lib/wine-intents.mjs`): scores fit, refuses waits over 45 minutes and unknown hours when known-hours stops exist, and keeps the day on one peninsula.
- **Stop cards** show why a stop fits (water view, dogs welcome, food, matched grape) and "Open now".
- **Charts** (`components/GlanceLens.js`): who is open by hour, grapes by peninsula, drive time. Tapping a bar sets the start time, steers the picker, or adds a stop. Places without posted hours are never charted as open.
- **Images**: a credited regional photo banner that changes with the chosen day. Photos are the three already-licensed Commons images; no new sources were added.
- Date and default start now use local time; after 5 PM the default day is tomorrow.

## Limits of this benchmark

The "after" paths were scripted by the same person who built the flow, and the persona needs are written by me, so this proves that each need is reachable and that
the picker honors it, not that real visitors will behave this way. Drive times are straight-line estimates. Sandbox runs block map tiles and external images, so
the hero photo was not seen loading here. Next step with real data: add the privacy-safe `wine_intent_chosen` and `wine_need_toggled` events to the GA4 review
and re-weight personas from what visitors actually pick.
