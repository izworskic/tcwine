import venues from "@/data/venues.json";
import wineTruth from "@/data/wine-truth.json";
import { getDrivingReality } from "@/lib/driving-reality";

const WINERIES = venues.filter((v) => v.category === "winery");

const AREA_LABELS = {
  "old-mission": "Old Mission Peninsula",
  leelanau: "Leelanau Peninsula",
  "traverse-city": "Traverse City",
  outer: "Farther out",
};

const MEAL_FOOD_TYPES = new Set(["pizza", "kitchen", "bistro", "raclette"]);

function round1(value) {
  return Math.round(value * 10) / 10;
}

function countBy(items, keyFn) {
  const counts = {};
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key) return;
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function sortedEntries(counts) {
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getWineDataDesk() {
  const byArea = countBy(WINERIES, (v) => v.area);
  const towns = sortedEntries(countBy(WINERIES, (v) => v.town));
  const views = sortedEntries(countBy(WINERIES, (v) => v.view || "No view tag"));
  const food = sortedEntries(countBy(WINERIES, (v) => v.food || "No food signal"));
  const trails = sortedEntries(countBy(WINERIES, (v) => v.officialTrail?.name));

  const varietalVerified = WINERIES.filter(
    (v) => Array.isArray(v.varietals) && v.varietals.length && v.varietalsSourceUrl && v.varietalsVerifiedAt
  );

  const grapeCounts = {};
  varietalVerified.forEach((v) => {
    v.varietals.forEach((grape) => {
      grapeCounts[grape] = (grapeCounts[grape] || 0) + 1;
    });
  });

  const grapeSources = sortedEntries(countBy(varietalVerified, (v) => v.varietalsSourceLabel));
  const anyFoodSignal = WINERIES.filter((v) => Boolean(v.food)).length;
  const mealPrograms = WINERIES.filter((v) => MEAL_FOOD_TYPES.has(v.food)).length;
  const withOfficialTrailMembership = WINERIES.filter((v) => Boolean(v.officialTrail)).length;

  const records = WINERIES.map((v) => ({
    id: v.id,
    name: v.name,
    area: v.area,
    areaLabel: AREA_LABELS[v.area] || v.area,
    town: v.town,
    lat: v.lat,
    lng: v.lng,
    website: v.website || null,
    plannerUrl: "https://tcwine.chrisizworski.com/winery/" + v.id,
    varietals: Array.isArray(v.varietals) ? v.varietals : [],
    varietalsVerifiedAt: v.varietalsVerifiedAt || null,
    varietalsSourceLabel: v.varietalsSourceLabel || null,
    varietalsSourceUrl: v.varietalsSourceUrl || null,
    view: v.view || null,
    food: v.food || null,
    officialTrail: v.officialTrail?.name || null,
    officialTrailUrl: v.officialTrail?.url || null,
    officialTrailVerifiedAt: v.officialTrail?.verifiedAt || null,
    sourceUrl: v.sourceUrl || v.website || null,
    verifiedAt: v.verifiedAt || null,
  }));

  const geography = getDrivingReality();

  return {
    updated: wineTruth.updated,
    directoryDefinition:
      "Mapped winery/tasting-room locations in the Traverse City Wine Country Planner. Geographic directory inclusion is not the same as wine-trail association membership.",
    varietalDefinition:
      "Grape counts use only winery records with an explicit source-backed varietal list, source URL, source label, and verification date. They do not infer a grape from regional prevalence.",
    geographyDefinition: geography.method,
    summary: {
      wineries: WINERIES.length,
      leelanau: byArea.leelanau || 0,
      oldMission: byArea["old-mission"] || 0,
      traverseCity: byArea["traverse-city"] || 0,
      officialTrailMembersMapped: withOfficialTrailMembership,
      varietalVerifiedWineries: varietalVerified.length,
      varietalCoveragePercent: round1((varietalVerified.length / WINERIES.length) * 100),
      anyFoodSignal,
      mealPrograms,
      towns: towns.length,
    },
    areaLabels: AREA_LABELS,
    areas: sortedEntries(
      Object.fromEntries(Object.entries(byArea).map(([key, value]) => [AREA_LABELS[key] || key, value]))
    ),
    towns,
    grapes: sortedEntries(grapeCounts),
    grapeSources,
    views,
    food,
    trails,
    geography,
    records,
  };
}
