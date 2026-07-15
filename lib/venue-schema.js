// Schema.org builders for the venue dataset.
// Mirrors the data the planner ships client-side so crawlers that do not
// execute JavaScript can read names, addresses, geo and opening hours.

const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const SCHEMA_TYPE = {
  winery: "Winery",
  brewery: "Brewery",
  distillery: "Distillery",
  cidery: "FoodEstablishment",
};

// Groups days that share identical open and close times into
// OpeningHoursSpecification entries. Venues flagged needsHours get null:
// we never publish hours we have not verified.
export function buildOpeningHoursSpecs(venue) {
  if (venue.needsHours || !venue.hours) return null;
  const byTimes = {};
  for (const day of DAY_ORDER) {
    const h = venue.hours[day];
    if (!h || !h.open || !h.close) continue;
    const key = h.open + "|" + h.close;
    if (!byTimes[key]) byTimes[key] = [];
    byTimes[key].push(day);
  }
  const specs = Object.entries(byTimes).map(([key, days]) => {
    const [opens, closes] = key.split("|");
    return {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    };
  });
  return specs.length ? specs : null;
}

export function buildVenueItemList(venues) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Traverse City area wineries, breweries, distilleries and cideries",
    numberOfItems: venues.length,
    itemListElement: venues.map((v, i) => {
      const specs = buildOpeningHoursSpecs(v);
      return {
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": SCHEMA_TYPE[v.category] || "LocalBusiness",
          name: v.name,
          ...(v.website ? { url: v.website } : {}),
          address: {
            "@type": "PostalAddress",
            addressLocality: v.town,
            addressRegion: "MI",
            addressCountry: "US",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: v.lat,
            longitude: v.lng,
          },
          ...(v.phone ? { telephone: v.phone } : {}),
          ...(specs ? { openingHoursSpecification: specs } : {}),
        },
      };
    }),
  };
}
