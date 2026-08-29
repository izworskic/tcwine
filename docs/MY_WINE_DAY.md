# My Wine Day

Updated: August 29, 2026

## Why this exists

The winery map already helps a visitor discover stops and build a time-aware route. The missing repeat-use layer was continuity: a group-planning user could copy a summary, but could not return to the exact plan or send an exact restorable route to somebody else.

My Wine Day adds continuity without creating accounts, server profiles, or indexable user-plan pages.

## Product behavior

After a route is built:

- the most recent valid plan is remembered locally in the browser;
- the user can explicitly save up to six wine days;
- saved plans can be reopened and rebuilt against the current route service and current venue-hours dataset;
- the user can share the exact plan using the native mobile share sheet when available;
- browsers without native sharing receive a clipboard-ready summary plus the exact plan link;
- the existing plain-text summary remains available separately.

A returning visitor sees a compact **Resume last wine day** action only when the remembered plan differs from the current planner state.

The saved-plan drawer is intentionally compact. It must never displace the winery map or become a new hero.

## Exact share links

Plans are encoded in the URL fragment:

`#plan=<base64url payload>`

The fragment contains:

- origin from the existing finite origin list;
- date;
- start time;
- optional done-by time;
- pace;
- designated-driver toggle;
- map area;
- beverage/style/sight filters;
- selected dataset IDs.

The fragment is decoded entirely in the browser and then rebuilt through the existing planner.

URL fragments are not sent to the application server as part of the HTTP request, so this design preserves the map-first indexed URL while still allowing exact group sharing.

There are no generated user-plan routes and no user-plan pages in the sitemap.

## Local persistence

Keys:

- `tcwine:my-wine-day:last:v1`
- `tcwine:my-wine-day:saved:v1`

Storage is browser-local only.

Saved plans are bounded to six. Selected stops are bounded to twelve. Incoming shared data is normalized against the current known origin and destination IDs before it is accepted.

No account, cookie identity graph, database, or cross-device sync is created.

## Truth and freshness

A saved or shared plan stores the user's decision state, not a frozen schedule.

When reopened, the planner:

1. restores the selected stops and controls;
2. requests the current real-road route;
3. runs the current hours/timing scheduler;
4. shows current conflicts or overflow.

This prevents a plan shared days or weeks earlier from pretending its original timing is still current.

## Analytics

Fixed-label events:

- `wine_plan_saved`
- `wine_plan_removed`
- `wine_plan_resumed`
- `wine_plan_shared`
- `wine_summary_copied`

Allowed dimensions:

- landing context;
- area;
- share method;
- resume source;
- stop-count bucket.

Forbidden analytics:

- selected venue IDs;
- selected venue names;
- exact plan URL or hash;
- date;
- exact start/end time;
- free text;
- precise user location;
- personal identifiers.

The fragment itself is a user-controlled sharing mechanism and is never included in analytics payloads.

## Success criteria

The continuity layer is successful when it creates meaningful downstream behavior, not merely button clicks.

Measure:

- route builds → save rate;
- route builds → share rate;
- return/resume rate;
- shared-plan restores;
- route builds after resume;
- route builds per landing family.

Initial product targets after a meaningful sample:

- >= 8% of route builders save a plan;
- >= 5% of route builders share an exact plan;
- >= 20% of resumed/shared plans rebuild a usable route;
- no measurable regression in map load or route-build rates.

If sharing is strong but restoring is weak, repair restore fidelity before adding collaboration features.

If save use is weak, keep the feature compact and do not promote it into primary map hierarchy.

## Search boundary

My Wine Day is a product/retention layer. It does not change the active 28-day map-first SEO hypothesis.

During the current search window, do not use this feature as justification to change:

- canonical URLs;
- search titles;
- H1s;
- core meta descriptions;
- winery counts;
- indexability.

Do not create crawlable saved-plan pages.

## Likely next step if this works

If exact-plan sharing produces meaningful use, the next product layer should be lightweight **group decision support** on the client side, such as comparing two saved route variants or making it easier to decide which stop to drop. It should still avoid accounts and public user-generated pages unless usage proves that collaboration is a genuine bottleneck.
