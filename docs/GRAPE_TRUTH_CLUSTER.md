# Grape Truth Search Cluster

## Purpose

The wine planner now supports grape-level discovery with producer-level evidence instead of inferring that every winery pours every grape associated with the Traverse City region.

The seven new search and decision routes are:

- Cabernet Franc
- Pinot Noir
- Chardonnay
- Pinot Gris
- Sauvignon Blanc
- Gewürztraminer
- Merlot

Riesling remains the existing grape-specific route.

## Evidence model

Eighteen winery records now contain a structured `varietals` list plus:

- `varietalsSourceUrl`
- `varietalsSourceLabel`
- `varietalsVerifiedAt`

Current structured sources are Traverse City Tourism and the Leelanau Peninsula Wine Trail.

The source-backed verified subset contains at least:

- 14 Cabernet Franc producers
- 17 Pinot Noir producers
- 18 Chardonnay producers
- 9 Sauvignon Blanc producers
- 14 Gewürztraminer producers
- 15 Merlot producers
- 16 Pinot Gris producers
- 18 Riesling producers

The wider tag set can contain additional wine signals, but the verified counts above are intentionally based only on structured source-backed varietal lists.

## Product behavior

Each grape is a Wine Day intent. Wine fit carries roughly 78–80% of the ranking weight for these intents before route and experience tie-breakers.

The cluster connects:

search intent → grape guide → winery guide → comparator → route planner → journal.

Winery pages expose source-verified varietals where available and link back only to grape guides supported by that winery's tags.

## Search discipline

These pages are not generated simply because a grape exists in northern Michigan. A grape needs enough producer coverage to support a useful route and comparison experience. CI enforces minimum verified producer counts and the internal-distribution contract.
