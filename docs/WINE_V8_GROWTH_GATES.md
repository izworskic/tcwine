# Traverse City Wine V8 – connected-journey release contract

Baseline: Google Search Console, September 12 to October 10, 2026 (sc-domain:chrisizworski.com).
- tcwine home: 202 impressions, 3 clicks, position 10.8663
- Leelanau winery trail: 166 impressions, 1 click, position 21.8976
- Wineries with food: 23 impressions, 1 click, position 12.1304
- Old Mission winery map: 22 impressions, zero clicks, position 52.8182

The site-wide goals are **1,000,000 impressions and 5% CTR**, neither achieved nor guaranteed. These are four small-page baselines only. Do not equate page-scoped growth with a million impressions across the whole site. These numbers predate V7 deployments.

## Release architecture
- Discover: TC winery homepage and Old Mission page answer real route problems, linking with intent-first anchor text to meal planning.
- Understand: source-backed food offerings for five audited Old Mission sites, seven distinct food services. Leelanau directory food tags are not independently verified.
- Decide: date, departure time, 3–4h window, party size, strict on-site winery meal filter.
- Prove: known closures/conflicts take precedence over stale records; trust rank outranks score; unknown service cannot be a live booking.
- Route: one substantial meal protected for 75 min, at most one additional wine stop, automatic road-leg check; veto impossible road/time service combinations.
- Act: official source, Tock reservation page where officially linked, map directions, short route alternative.
- Continue: copy a shareable scenario and hand off exact winery IDs to the regular Old Mission planner, explicitly warning that the meal and reservation do not transfer.
- Learn: analytics only on non-sensitive categorical events and aggregate date-window/duration measures.

## Product loss and value functions
| Component | Severe loss | Value created |
| --- | --- | --- |
| Intake | Form implies date/booking confirmed | Complete usable scenario in one submission |
| Venue truth | Snacks sold as a full lunch | Correct meal type with source and freshness |
| Freshness/conflict | Contradiction hidden by expiry | Conflict surfaced until explicitly resolved |
| Scoring | Beautiful winery outranks failed lunch gate | Trust before preference ranking |
| Route | Estimated miles labeled actual drive / time overflow | Successful within-budget real-road itinerary |
| Map | Side controls obscure points / fictional road line | Route and markers legible on phone and tablet |
| Handoff | Drop lunch silently during full planner transfer | Explicit meal-not-transferred warning |
| Copy and content | Generic listicle / duplicated pages | Search intent and verified action aligned |
| Instrumentation | Private party details or free text tracked | Aggregated action funnel, no PII |

## Acceptance requirements
- All CI checks + Next production build pass.
- Original Old Mission, Leelanau, views, fall-color winners and author Person identity remain stable.
- Known weekday source conflict survives after source review deadline.
- Never emit SOURCE_CONFLICT as a green plan; expiry remains research-only.
- Date and time required; late-night route cannot cross midnight unnoticed.
- No imaginary lunch pause. Winery handoff preserves winery IDs and explicitly warns the separate meal does not carry over.
- Real-road check auto-runs once after an explicit submit or alternate selection; failures leave geographic estimate labeled.
- No invented live reservations or table times.
- Search growth: monitor 28-day GSC non-branded queries, impressions, position and CTR plus meal-start / verdict / route-check / operator-click outcomes. Favor query-led content improvement over mass publishing.
- Future expansion gate: Leelanau meal recommender requires official menu/hours reviews and fail-closed tests first.


## Low-cost operational safeguards
- Weekly GitHub Actions audit in .github/workflows/food-source-freshness.yml checks each official-service review deadline and lists unresolved venue-hour conflicts in its job logs. A stale record fails the audit; it **does not** automatically refresh verification timestamps, claim kitchen availability or trigger a Vercel build.
- The existing analytics helper now duplicates only anonymized, allowlisted wine_food_* funnel events into the site's existing GA4 gtag. Individual visit dates, addresses, coordinates, copied plan notes and raw form content never flow to GA4 from this helper.
- A source-deadline failure requires a person to verify operator pages and update evidence records. GitHub workflow alerts depend on repository notification settings; no notification is promised from ChatGPT.
