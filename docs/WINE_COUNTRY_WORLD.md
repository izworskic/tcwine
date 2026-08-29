# Wine Country World benchmark

## Goal

The home page should feel like opening Traverse City and Leelanau wine country, not reading a winery directory. Wine remains the anchor, but the user can immediately widen the day to cider, spirits, food, beaches, short hikes, lighthouses, scenic stops, and harbor towns.

## External benchmark

Three patterns are worth combining rather than copying:

- **Leelanau Peninsula Wine Trail** is authoritative on the winery set and presents trip-planning categories, but its experience is still primarily directory/content driven: https://lpwines.com/
- **Traverse City Tourism** does a better job connecting Leelanau wine with M-22, trails, lighthouses, villages, and day-trip storytelling, but the pieces live on separate destination pages: https://www.traversecity.com/plan/trip-ideas-and-itineraries/day-trips/leelanau-county/
- **Visit Napa Valley** has the strongest map-first discovery benchmark: users can orient geographically and move into itinerary planning from the map: https://www.visitnapavalley.com/wineries/winery-map/

The opportunity for this tool is the intersection: **map + real routing + posted hours + non-wine places + peninsula decision support**.

## Product benchmark

A first-time visitor should be able to answer four questions from one surface:

1. Old Mission or Leelanau?
2. Wine, cider, spirits, or a mixed day?
3. What hike, beach, lighthouse, scenic stop, or town belongs with that choice?
4. Can the full day actually fit on the road and inside posted hours?

The page should avoid lodging-first language, generic destination filler, large empty headline areas, and link grids that make the user leave before making a decision.

## Implemented in this increment

- Tightened the planner header and reduced wasted text space.
- Reframed the home page from "rooms" to places/stops.
- Added an interactive tasting + special-place matcher using the same 74 venue and 20 POI records as the route planner.
- Added a peninsula chooser.
- Added direct mini-tool paths for food, views, mixed beverage days, and fall color.
- Added a handoff to Michigan Outdoors Now when the outdoor objective should lead the day.
- Preserved the existing canonical, title, H1, and core meta description while the map-first search measurement window is active.

## Measurement

Track:

- `wine_world_filter_changed`
- `wine_world_pair_opened`
- `wine_world_outdoors_handoff`

Initial product thresholds live in `benchmarks/wine-country-world.json`. Treat any map-load or route-build regression as a release blocker.
