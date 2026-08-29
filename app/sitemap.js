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
  "wine/riesling",
  "wine/sparkling",
  "wine/reds",
  "wine/whites",
  "wine/serious-wine",
  "wine/first-trip",
];

export default function sitemap() {
  const now = new Date();
  return ROUTES.map((p) => ({
    url: p ? BASE + "/" + p : BASE + "/",
    lastModified: now,
    changeFrequency: "weekly",
    priority: p ? 0.82 : 1,
  }));
}
