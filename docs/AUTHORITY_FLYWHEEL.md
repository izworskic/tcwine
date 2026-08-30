# TC Wine Authority Flywheel

Updated: August 29, 2026

## Problem

The product now has enough on-site depth. Ranking breakthrough is constrained by authority, referral demand, and external citations more than by another round of indexable pages.

Current search competitors include:

- official Old Mission and Leelanau wine-trail organizations with institutional authority;
- Guided Wino with a broad wine-content graph around interactive maps;
- newer regional wine-guide sites publishing dense winery clusters.

The response is not to out-publish them with thin pages. It is to create a useful asset other publishers want to place on their own pages.

## Flywheel

**useful publisher asset → embed/referral use → independent editorial citations → stronger referring-domain graph → improved rankings → more discovery → more use/citations**

The core asset is the free Traverse City Winery Map embed.

## Publisher offer

The publisher kit at `/for-publishers` provides:

- a lightweight embeddable winery map;
- a nofollow utility link to the canonical planner inside the distributed embed;
- current GeoJSON;
- current CSV;
- count methodology;
- official-trail reference links;
- a simple attribution format: **Traverse City Winery Map by Chris Izworski**.

Publisher surfaces are noindex. They exist to earn links and referrals, not to compete with the active search cluster.

## Link-policy boundary

The distributed embed contains a branded utility link to the planner, but that link is explicitly `rel="nofollow"`.

This matters because Google treats widely distributed widget links that pass ranking credit as a potential link-spam pattern. The embed exists for visitor utility and referral traffic, not to manufacture PageRank.

Authority should come from **independent editorial citations**. A publisher that genuinely uses the map or data may choose to cite:

**Chris Izworski's Traverse City Winery Map**

in its own surrounding copy. That editorial link is not required by the embed, not exchanged for payment or services, and not generated automatically.

Do not ask publishers to remove `nofollow` from the widget link. Do not require a dofollow link as a condition of use.

## Priority outreach targets

### Tier 1 — strongest fit

1. **Grand Traverse Resort & Spa**
   - Current page: https://www.grandtraverseresort.com/blog/wineries-near-grand-traverse-resort
   - Why: already publishes a Traverse City winery map but explicitly limits it to wineries near the resort.
   - Pitch: add the free full-region embed below the existing nearby-winery section so guests can extend into Old Mission, Leelanau, and Traverse City.
   - Public media contact: https://www.grandtraverseresort.com/media/
   - Angle: better guest planning, no booking commission, no affiliate requirement.

2. **Traverse City Tourism**
   - Current page: https://www.traversecity.com/hotels/winery-lodging/
   - Why: winery-lodging page already uses embedded content and is a major institutional authority.
   - Pitch: optional planning map for visitors choosing lodging around wine country.
   - Public contact: https://www.traversecity.com/about-traverse-city-tourism/contact-us/
   - Media contact: https://www.traversecity.com/plan/about-traverse-city-tourism/media/
   - Angle: free visitor utility, current geographic directory, official trail links preserved.

3. **Cabin Rentals Michigan**
   - Current page: https://www.cabinrentalsmichigan.com/blog/traverse-city-wineries-guide
   - Why: fresh 2026 winery guide with strong trip-planning intent.
   - Pitch: embed the current map directly inside the winery guide.
   - Angle: readers can turn the article into an actionable route without leaving the guide first.

4. **Cherry Tree Inn & Suites**
   - Current page: https://www.cherrytreeinn.com/blog/your-guide-to-a-classic-traverse-city-summer/
   - Why: current local-area content specifically sends guests toward wineries and itineraries.
   - Public contact: https://www.cherrytreeinn.com/contact/
   - Angle: free guest-planning map, ideal for pre-arrival content and group stays.

5. **Northland Vacation Rentals**
   - Current page: https://northlandvacationrentals.com/list-with-us
   - Why: guest-services content already promotes wine tours.
   - Angle: add a free independent winery map beside paid tour options so guests can plan before choosing transportation.

### Tier 2 — editorial/link targets

6. **My Michigan Beach & Travel**
   - Winery guide: https://mymichiganbeach.com/traverse-city-wineries/
   - Angle: add an interactive route map to a strong editorial guide.

7. **Inside Michigan**
   - Old Mission winery guide: https://insidemichigan.com/things-to-do/wineries/best-old-mission-peninsula-wineries/
   - Angle: replace/augment a generic map with a current route-capable map.

8. **Awesome Mitten**
   - Winery guide: https://www.awesomemitten.com/traverse-city-wineries/
   - Angle: map utility for a high-intent Michigan travel audience.

9. **MyNorth**
   - Existing self-guided wine-tour content.
   - Angle: cite the current directory or embed the map in itinerary content where routing matters.

10. **Northern Express / Traverse Ticker**
   - Angle: data citation rather than generic embed.
   - Story hook: how the current geographic winery/tasting-room directory differs from association membership counts, plus route-planning realities across the two peninsulas.

## Do not target first

Do not spend initial outreach on direct search competitors whose business model is already the wine-map/wine-guide product:

- Guided Wino;
- TraverseCityWineTour.com;
- TC Wine Guide.

They are benchmark competitors, not first-wave link partners.

## Outreach message

Subject direction:

**Free Traverse City winery map for your guest/reader guide**

Core pitch:

> I built a free Traverse City winery map that covers the current Old Mission, Leelanau, and Traverse City winery/tasting-room directory and lets visitors jump into a real-road wine-day planner. I made a lightweight embed specifically for hotels, vacation-rental companies, and local publishers. There is no booking commission or affiliate requirement. If it improves your wine-country page, you can use it free. The built-in planner link is nofollow; if you independently reference the map or dataset in your article, a normal editorial citation is welcome but not required.

For Grand Traverse Resort:

> Your current winery article already does a good job with the wineries nearest the resort. The embed could sit beneath that section as the "explore the full wine country" layer without replacing what you already built.

For lodging/vacation rentals:

> The value is pre-arrival planning. Guests can see the region quickly, then open the full planner when they want to choose stops and route the day.

## Measurement

New product events:

- `wine_embed_loaded`
- `wine_embed_planner_opened`
- `wine_publisher_embed_copied`
- `wine_publisher_data_opened`

External success metrics:

- new referring domains;
- referral sessions;
- referral → map-load rate;
- referral → route-build rate;
- publisher embed loads;
- Search Console position change for winery-map query families;
- branded co-citations of Chris Izworski + Traverse City Winery Map.

## 30-day authority targets

Initial target:

- 5 legitimate new referring domains;
- 2 live publisher embeds;
- 100 qualified referral sessions;
- 20 referral-origin route builds;
- at least one external citation using the Chris Izworski attribution.

These are traction thresholds, not guarantees.

## Search boundary

Do not change the current search-facing title/H1/canonical treatment merely because outreach is underway.

The publisher kit, embed, and exports remain noindex and outside the sitemap.

Authority acquisition should compound the active search cluster, not reset it.
