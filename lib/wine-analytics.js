export function trackWineEvent(name, data = {}) {
  if (typeof window === "undefined") return;
  try {
    if (typeof window.va === "function") {
      window.va("event", { name, data });
    }
  } catch {
    // Analytics must never interfere with trip planning.
  }
}

export const WINE_LANDING_KEYS = {
  "/": "winery_map_home",
  "/old-mission-peninsula-wineries": "old_mission_map",
  "/leelanau-peninsula-wine-trail": "leelanau_map",
  "/old-mission-vs-leelanau-wineries": "peninsula_compare",
  "/traverse-city-wineries-with-food": "wineries_food",
  "/best-traverse-city-wineries-with-views": "wineries_views",
  "/fall-color-wine-tour": "fall_color_map",
  "/one-day-itineraries": "one_day_itineraries",
  "/group-wine-tour-planning": "group_planning",
  "/suttons-bay-tasting-rooms": "suttons_bay",
  "/venues": "venue_hours",
  "/traverse-city-breweries-and-distilleries": "mixed_tasting",
  "/wine/riesling": "wine_riesling",
  "/wine/sparkling": "wine_sparkling",
  "/wine/reds": "wine_reds",
  "/wine/whites": "wine_whites",
  "/wine/serious-wine": "wine_serious",
  "/wine/first-trip": "wine_first_trip",
  "/compare-wineries": "wine_compare",
};


export const WINE_EVENT_NAMES = [
  "wine_landing_viewed",
  "wine_map_loaded",
  "wine_filter_changed",
  "wine_stop_toggled",
  "wine_starter_loaded",
  "wine_route_built",
  "wine_plan_saved",
  "wine_plan_removed",
  "wine_plan_resumed",
  "wine_plan_shared",
  "wine_summary_copied",
  "wine_world_filter_changed",
  "wine_world_pair_opened",
  "wine_world_outdoors_handoff",
  "wine_truth_filter_changed",
  "wine_truth_winery_opened",
  "wine_truth_day_copied",
  "wine_compare_changed",
  "wine_compare_intent_changed",
];
