# Wine Country Data Desk

Updated: August 30, 2026

## Purpose

The Wine Country Data Desk turns the same structured dataset that powers the Traverse City winery planner into an original research and citation surface.

Canonical page:

`/wine-country-data`

This is not a second winery directory and not a generic "best wineries" article. Its job is to make the site's unique data legible, reusable, and citable by journalists, hotels, local publishers, researchers, AI systems, and other trip-planning sites.

## Core research layers

The page derives all headline metrics from production data at build time:

- mapped winery/tasting-room inventory;
- winery counts by wine area;
- listed town distribution;
- source-backed winery varietals;
- official wine-trail metadata;
- food and view planning signals;
- Old Mission vs. Leelanau geographic measures.

The geographic analysis reuses `lib/driving-reality.js` so the same deterministic calculations power both the trip-planning comparison and the research surface.

## Definitions

### Directory count

A directory record is a mapped winery/tasting-room location in the planner.

It is not the same thing as association membership. A producer can be geographically active without being a member of a current trail organization, and a trail can include a business whose primary planner category is not winery.

### Verified grape count

A winery enters the structured grape denominator only when its record contains:

- a non-empty `varietals` array;
- `varietalsSourceUrl`;
- `varietalsSourceLabel`;
- `varietalsVerifiedAt`.

No grape is inferred merely because it is common in the Traverse Wine Coast.

### Geography

Distance measures are straight-line geographic measures from production coordinates. They are not road miles and are labeled as such.

### Food and view

Food and view fields are route-planning descriptors. They are not guarantees of current restaurant service, accessibility, or independent quality ratings.

## Reuse surfaces

The Data Desk provides:

- citation copy;
- a short copyable stat line;
- detailed CSV;
- detailed GeoJSON;
- JSON summary snapshot;
- interactive filters by area, verified grape, trail membership, food, view, and varietal-source coverage.

Downloads remain noindex. The canonical research page is the indexable citation target.

## Schema

The page publishes:

- `Dataset`;
- `Article`;
- `DataDownload`;
- canonical `Person` creator relation for Chris Izworski.

## Distribution

Internal discovery comes from:

1. the homepage's high-use planning links;
2. the Old Mission vs. Leelanau comparison, where the geographic research is directly relevant;
3. the noindex publisher kit, where external publishers are already evaluating map and data reuse.

This avoids sitewide boilerplate links while placing the Data Desk where citation intent is strongest.

## Analytics

Tracked events:

- `wine_data_filter_changed`;
- `wine_data_download_opened`;
- `wine_data_citation_copied`.

The page also has a dedicated landing key: `wine_country_data`.

## Authority strategy

The Data Desk is designed to support the existing publisher flywheel:

**original data → publisher/research reuse → independent editorial citation → referring-domain authority → stronger winery/grape rankings → more discovery and use**

The machine-readable assets do not require a dofollow link. Editorial citation remains voluntary and independent.

## Release guard

`scripts/check-data-desk.mjs` verifies:

- minimum production inventory and verified varietal coverage;
- Dataset/DataDownload schema;
- canonical and methodology;
- provenance rules;
- all three exports;
- noindex download behavior;
- internal distribution;
- analytics;
- integration with the full npm test suite.
