# Traverse City Wine Country: Loop Planner

A routed, time-aware day planner for the wineries, cideries, breweries, and distilleries of
Leelanau, Old Mission, and the Traverse City area, with beaches, dune and bluff hikes,
overlooks, and lighthouses woven in as non-drinking stops.

Built with Next.js 14 (App Router) and Leaflet, in the same shape as the other properties.

## What it does

- Filter by beverage (inclusive, so a winery that also makes cider shows under cider) and by
  multiple grape or beer/spirit styles at once.
- Hand-pick your stops from a list or straight off the map, and turn on sights (beaches,
  hikes, scenic spots, lighthouses, towns) to add along the way.
- Build the day from a start time and a "done by" time: stops are ordered into a loop and
  scheduled against each place's real hours, so nothing lands when it's closed, and anything
  that won't fit the window is called out rather than dropped silently.
- The map is road-legible (CARTO Voyager, with a Minimal/Positron toggle) and the route
  follows real roads with real drive times from a routing service.
- One-tap Navigate per stop, plus "open the whole loop in Google Maps" with waypoints.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

## Road routing

`POST /api/route` returns real driving geometry and per-leg times.

- Default: the public OSRM demo server, no key required. Fine for low volume, best-effort.
- Production: set `MAPBOX_TOKEN` (copy `.env.example` to `.env.local`) to use Mapbox
  Directions. The free tier is generous and far more reliable than the OSRM demo.
- If routing is unreachable, the planner degrades gracefully to straight-line drive estimates
  and labels them as estimated. The road-legible basemap still shows the road network either way.

## Deploy on Vercel

1. Push this folder to a new GitHub repo.
2. Import the repo in Vercel (framework auto-detects as Next.js).
3. Optional: add `MAPBOX_TOKEN` as an environment variable for production routing.
4. Point a subdomain (tcwine.chrisizworski.com) at the deployment.

## Data

- `data/venues.json`: 74 venues (40 wineries, 22 breweries, 7 distilleries, 5 cideries) with
  structured hours, beverages, style tags, dwell times, and Google Maps links.
- `data/pois.json`: 20 sights/hikes/beaches/lighthouses with kinds, visit times, hours, and links.
- `data/origins.json`, `data/shuttle.json`: start towns and the chauffeured-tour operator.

## Project layout

```
app/
  layout.js            metadata + globals
  page.js              loads the Planner (client-only, map needs the browser)
  globals.css          the full design system
  api/route/route.js   road routing (OSRM default, Mapbox if MAPBOX_TOKEN is set)
components/
  Planner.js           map + choose/build flow + scheduler
data/                  venues, pois, origins, shuttle
```

## Next increments (not yet built)

- Shareable `/loop/[slug]` links backed by Upstash Redis (same pattern as Lawn Advisor).
- SSG landing pages (`/leelanau`, `/old-mission`, town pages) for SEO, plus sitemap + IndexNow.
- OG image route and `sameAs` graph, network cross-links.
- Optional season layer (computed vintage progress, fall-color overlap), behind a clean seam.
