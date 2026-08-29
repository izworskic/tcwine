# Wine Country Truth Engine

## Competitive position

The region already has strong destination and winery discovery products. Traverse City Tourism currently markets 50+ wineries and explicitly helps visitors choose by views, vibes, and wine styles. The Leelanau Peninsula Wine Trail owns official member discovery and events. Tripadvisor owns review volume and bookable tours. TraverseCityWineTour.com is the closest product competitor because it combines a 40+ winery directory, planner, and editorial wine journal.

The product should not try to win by having more winery names.

It should win by answering a harder question:

**Which three wineries make the best wine day for what I actually want to drink, and can that day really work?**

## Product rules

1. Wine intent is scored before scenery.
2. A standard composed day contains three wineries.
3. Non-wine stops are optional and capped at one in the truth composer.
4. A Wine Day Fit score is an itinerary-fit score, not an objective wine-quality rating.
5. Varietal specificity matters for wine-first and style-led intents.
6. Route coherence is part of the score.
7. Existing map, posted-hour, and route truth remain authoritative constraints.

## Wine lenses

The first indexable wine-first lenses are Riesling, sparkling, cool-climate reds, dry/aromatic whites, serious-wine visitors, and first-time wine visitors.

## Winery acquisition cluster

The planner now carries 43 winery truth records. Every winery gets an indexable guide at `/winery/[id]` with a wine-role explanation, style signals, fit and non-fit guidance, planning facts, current official trail membership where applicable, two nearby route companions, and a preloaded planner.

Current official trail coverage is explicitly tracked rather than inferred from geography:

- 23 Leelanau Peninsula Wine Trail members
- 10 Old Mission Peninsula Wine Trail members

Active producers outside those current official member lists remain in the broader map and are labeled by omission rather than falsely presented as trail members.

The `/compare-wineries` tool lets users compare any two wineries by selected wine intent before opening the full guide or route.

## Measurement

Track truth-engine filter changes, winery opens, copied winery orders, winery-comparison changes, landing-page entry, route builds, winery-guide visits, and downstream map interactions. The primary product question is whether wine-intent users engage with the planner at a higher rate than generic winery-list users.
