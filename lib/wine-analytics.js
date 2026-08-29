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
};
