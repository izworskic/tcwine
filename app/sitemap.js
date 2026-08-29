import wineEventData from "@/data/wine-events.json";
import venues from "@/data/venues.json";

const BASE = "https://tcwine.chrisizworski.com";
const ROUTES = [
  "",
  "old-mission-peninsula-wineries",
  "leelanau-peninsula-wine-trail",
  "old-mission-vs-leelanau-wineries",
  "traverse-city-wineries-with-food",
  "best-traverse-city-wineries-with-views",
  "traverse-city-breweries-and-distilleries",
  "one-day-itineraries",
  "group-wine-tour-planning",
  "fall-color-wine-tour",
  "suttons-bay-tasting-rooms",
  "venues",
  "compare-wineries",
  "wine-country-now",
  "my-wine-journal",
  "wine/riesling",
  "wine/sparkling",
  "wine/reds",
  "wine/whites",
  "wine/serious-wine",
  "wine/first-trip",
];

export default function sitemap() {
  const now = new Date();
  const staticRoutes = ROUTES.map((p) => ({
    url: p ? BASE + "/" + p : BASE + "/",
    lastModified: now,
    changeFrequency: "weekly",
    priority: p ? 0.82 : 1,
  }));
  const wineryRoutes = venues
    .filter((v) => v.category === "winery")
    .map((v) => ({
      url: BASE + "/winery/" + v.id,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.78,
    }));
  const eventRoutes = wineEventData.events.map((event) => ({
    url: BASE + "/events/" + event.id,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));
  return [...staticRoutes, ...wineryRoutes, ...eventRoutes];
}
