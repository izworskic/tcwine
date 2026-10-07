import venues from "@/data/venues.json";
import truth from "@/data/wine-truth.json";
import { buildWineDays, rankWineries, WINE_INTENTS } from "@/lib/wine-day-engine";

const WINERIES = venues.filter((venue) => venue.category === "winery");
const TRUTH = new Map(truth.records.map((record) => [record.id, record]));
const AREA_CONFIG = {
  "old-mission": {
    id: "old-mission",
    label: "Old Mission Peninsula",
    publicLabel: "Old Mission Peninsula",
    plannerUrl: "https://tcwine.chrisizworski.com/",
    plannerOrigin: "Traverse City",
    officialGeography: [
      { type: "AVA", name: "Old Mission Peninsula AVA", authority: "TTB" },
      { type: "wine-trail", name: "Old Mission Peninsula Wine Trail", authority: "official association" },
    ],
    anchor: { lat: 44.956, lng: -85.515 },
    experience: {
      compactness: "high",
      scenery: "high",
      villages: "low",
      variety: "medium",
      relaxedPace: "high",
      firstTripAppeal: "high",
    },
  },
  leelanau: {
    id: "leelanau",
    label: "Leelanau Peninsula",
    publicLabel: "Leelanau Peninsula",
    plannerUrl: "https://tcwine.chrisizworski.com/",
    plannerOrigin: "Traverse City",
    officialGeography: [
      { type: "AVA", name: "Leelanau Peninsula AVA", authority: "TTB" },
      { type: "wine-trail", name: "Leelanau Peninsula Wine Trail", authority: "official association" },
    ],
    anchor: { lat: 44.993, lng: -85.755 },
    experience: {
      compactness: "medium",
      scenery: "high",
      villages: "high",
      variety: "high",
      relaxedPace: "medium",
      firstTripAppeal: "high",
    },
  },
};

const INTENT_TAGS = {
  riesling: ["riesling"],
  sparkling: ["sparkling"],
  reds: ["cabernet-franc", "pinot-noir", "merlot", "dry-reds", "italian-reds", "nebbiolo"],
  whites: ["dry-whites", "chardonnay", "pinot-gris", "pinot-blanc", "sauvignon-blanc", "albarino", "gruner", "aromatic-whites", "gewurztraminer"],
};

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function miles(a, b) {
  const R = 3958.8;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const la1 = a.lat * rad;
  const la2 = b.lat * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function localDriveProfile(list) {
  if (list.length < 2) return { medianNearestNeighborMiles: null, spreadMiles: null };
  const nearest = list.map((venue) => {
    const other = list
      .filter((candidate) => candidate.id !== venue.id)
      .map((candidate) => miles(venue, candidate));
    return Math.min(...other);
  });
  let spread = 0;
  for (let i = 0; i < list.length; i += 1) {
    for (let j = i + 1; j < list.length; j += 1) spread = Math.max(spread, miles(list[i], list[j]));
  }
  return {
    medianNearestNeighborMiles: Number(median(nearest).toFixed(1)),
    spreadMiles: Number(spread.toFixed(1)),
  };
}

function positiveIntentEvidence(list, intent) {
  const tags = INTENT_TAGS[intent] || [];
  if (tags.length) return list.filter((venue) => (venue.tags || []).some((tag) => tags.includes(tag))).length;
  if (intent === "food") return list.filter((venue) => Boolean(venue.food)).length;
  if (intent === "views") return list.filter((venue) => Boolean(venue.view)).length;
  if (intent === "quiet") {
    return list.filter((venue) => /quiet|intimate|homey|low-key|cabin/i.test(venue.vibe || "")).length;
  }
  return list.filter((venue) => (TRUTH.get(venue.id)?.bestFor || []).includes(intent)).length;
}

function operatingByWeekday(list) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return Object.fromEntries(days.map((day) => {
    let knownOpen = 0;
    let knownClosed = 0;
    let unknown = 0;
    for (const venue of list) {
      if (venue.needsHours) { unknown += 1; continue; }
      const hours = venue.hours?.[day];
      if (!hours) { knownClosed += 1; continue; }
      if (hours.closed) knownClosed += 1;
      else knownOpen += 1;
    }
    return [day, { knownOpen, knownClosed, unknown }];
  }));
}

function buildHandoff(area, intent, date) {
  const normalizedIntent = WINE_INTENTS[intent] ? intent : "first-trip";
  const days = buildWineDays({ area, intent: normalizedIntent, date, addPlace: false });
  const best = days[0];
  if (best?.wineries?.length >= 3) {
    return {
      intent: normalizedIntent,
      selected: best.wineries.map((winery) => winery.id),
      localRouteMilesEstimate: best.routeMiles,
      source: "regional-wine-day-engine",
    };
  }
  return {
    intent: normalizedIntent,
    selected: rankWineries({ area, intent: normalizedIntent, date }).slice(0, 3).map((row) => row.venue.id),
    localRouteMilesEstimate: null,
    source: "regional-ranked-fallback",
  };
}

export function buildRegionContract(area, { intent = "first-trip", date } = {}) {
  const config = AREA_CONFIG[area];
  if (!config) return null;
  const list = WINERIES.filter((venue) => venue.area === area);
  const trail = list.filter((venue) => venue.officialTrail);
  const knownHours = list.filter((venue) => !venue.needsHours && venue.hours && Object.keys(venue.hours).length);
  const verifiedDates = trail.map((venue) => venue.officialTrail?.verifiedAt).filter(Boolean).sort();
  const intentEvidence = Object.fromEntries(
    Object.keys(WINE_INTENTS).map((key) => [key, positiveIntentEvidence(list, key)])
  );

  return {
    schemaVersion: 1,
    adapter: "tcwine",
    region: config,
    inventory: {
      wineryCount: list.length,
      officialTrailMemberCount: trail.length,
      knownHoursCount: knownHours.length,
      unknownHoursCount: list.length - knownHours.length,
      foodSignalCount: list.filter((venue) => Boolean(venue.food)).length,
      viewSignalCount: list.filter((venue) => Boolean(venue.view)).length,
    },
    intentEvidence,
    localDrive: localDriveProfile(list),
    operatingByWeekday: operatingByWeekday(list),
    freshness: {
      wineryTruthReviewedAt: "2026-08-29",
      hoursReviewedLabel: "July 2026",
      officialMembershipVerifiedAt: verifiedDates.at(-1) || null,
    },
    truthRules: {
      unknownIsFalse: false,
      unknownHoursMeaning: "call-ahead / not verified, never treated as closed",
      reservationAvailabilityKnown: false,
      tastingFeesKnown: false,
    },
    handoff: {
      plannerUrl: config.plannerUrl,
      plannerOrigin: config.plannerOrigin,
      area,
      ...buildHandoff(area, intent, date),
    },
  };
}

export function buildRegionContracts(options = {}) {
  return Object.keys(AREA_CONFIG).map((area) => buildRegionContract(area, options));
}
