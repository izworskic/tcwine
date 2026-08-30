import venues from "@/data/venues.json";
import wineTruth from "@/data/wine-truth.json";
import { haversineMiles } from "@/lib/geo";

const TC = { lat: 44.7631, lng: -85.6206 };

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function percentile(values, q) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * q));
  return sorted[index];
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function areaStats(area) {
  const wineries = venues.filter((v) => v.category === "winery" && v.area === area);
  const pairDistances = [];
  const nearestDistances = [];

  for (let i = 0; i < wineries.length; i += 1) {
    let nearest = Infinity;
    for (let j = 0; j < wineries.length; j += 1) {
      if (i === j) continue;
      const distance = haversineMiles(wineries[i], wineries[j]);
      nearest = Math.min(nearest, distance);
      if (j > i) pairDistances.push(distance);
    }
    if (Number.isFinite(nearest)) nearestDistances.push(nearest);
  }

  const lats = wineries.map((v) => v.lat);
  const lngs = wineries.map((v) => v.lng);
  const center = {
    lat: lats.reduce((sum, value) => sum + value, 0) / lats.length,
    lng: lngs.reduce((sum, value) => sum + value, 0) / lngs.length,
  };

  const towns = {};
  wineries.forEach((v) => { towns[v.town] = (towns[v.town] || 0) + 1; });

  const northSouth = haversineMiles(
    { lat: Math.min(...lats), lng: center.lng },
    { lat: Math.max(...lats), lng: center.lng }
  );
  const eastWest = haversineMiles(
    { lat: center.lat, lng: Math.min(...lngs) },
    { lat: center.lat, lng: Math.max(...lngs) }
  );
  const fromTC = wineries.map((v) => haversineMiles(TC, v));

  return {
    count: wineries.length,
    townCount: Object.keys(towns).length,
    towns,
    northSouthMiles: round1(northSouth),
    eastWestMiles: round1(eastWest),
    medianPairMiles: round1(median(pairDistances)),
    p75PairMiles: round1(percentile(pairDistances, 0.75)),
    medianNearestMiles: round1(median(nearestDistances)),
    maxPairMiles: round1(Math.max(...pairDistances)),
    medianFromTraverseCityMiles: round1(median(fromTC)),
    minFromTraverseCityMiles: round1(Math.min(...fromTC)),
    maxFromTraverseCityMiles: round1(Math.max(...fromTC)),
  };
}

export function getDrivingReality() {
  const oldMission = areaStats("old-mission");
  const leelanau = areaStats("leelanau");
  return {
    updated: wineTruth.updated,
    method: "Straight-line geographic analysis of current production winery/tasting-room coordinates. These are not road miles; actual drive distance is longer and varies by route.",
    oldMission,
    leelanau,
    ratios: {
      northSouthSpread: round1(leelanau.northSouthMiles / oldMission.northSouthMiles),
      eastWestSpread: round1(leelanau.eastWestMiles / oldMission.eastWestMiles),
      medianPairSpread: round1(leelanau.medianPairMiles / oldMission.medianPairMiles),
      medianFromTraverseCity: round1(leelanau.medianFromTraverseCityMiles / oldMission.medianFromTraverseCityMiles),
    },
  };
}
