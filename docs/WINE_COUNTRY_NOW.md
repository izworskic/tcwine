# Wine Country Now + My Wine Journal

## Why this layer exists

The map and Wine Country Truth Engine answer where to go. The next competitive problem is staying relevant between planning sessions and after the tasting day.

Wine Country Now adds a source-verified current layer for official trail events, winery workshops, and useful wine-scene experiences. It does not scrape arbitrary event text into the product. Each record carries a source, verification date, geography, wine intent, and a planning-truth note that changes how the day should be built.

The current fall 2026 board begins with the Leelanau Peninsula Wine Trail's September Harvest Club, October red-wine event, and two November Toast The Season weekends. Old Mission's Mac & Cheese event remains a watch because its official trail page says details are coming in September rather than publishing a date now.

## Freshness behavior

- ended events disappear from the current board
- recurring event series advances to the next remaining date
- event blackout rules affect the live state
- event pages retain direct source links
- source verification date is visible to users
- no event is invented from social chatter or stale third-party copy

## My Wine Journal

The journal is intentionally account-free for this version. It stores entries in local storage under `tcwine:wine-journal:v1`.

Each winery can store:

- Want to Taste or Visited
- Favorite
- visit date
- wine to remember
- tasting note

The dashboard summarizes visited, want-to-taste, and favorites across the current winery inventory.

Tasting-note text and favorite-wine text stay in the browser and are not sent to analytics. Analytics records only coarse interaction events needed to understand whether the feature creates repeat utility.
