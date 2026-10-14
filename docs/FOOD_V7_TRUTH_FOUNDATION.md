# Food V7 truth foundation

Phase P0: operator-sourced food classifications, separate kitchen vs venue hours, conflicting operator sources, evidence review deadlines, booking warnings, and deterministic gates. This is not yet the full V7 itinerary interface.

## Rules
- Full-meal claims require an operator-supported substantial food offering.
- Tasting-room and venue opening hours do not establish kitchen service times.
- Contradictory official sources trigger SOURCE_CONFLICT, never a confident green recommendation.
- Seasonal or appointment-only food offerings stay CALL_TO_CONFIRM or BOOKING_REQUIRED.
- Source records with expired review deadlines trigger SOURCE_STALE.
- Every evaluation explicitly returns bookingAvailability: NOT_CHECKED, reserved: false.

## Sources checked 2026-10-13
- Brys: https://brysestate.com/visit_tastingroom/ and https://brysestate.com/lawn-bar-menu/
- Bonobo: https://www.bonobowinery.com/faq
- Jolly Pumpkin homepage/menu: https://traversecity.jollypumpkin.com/ and https://traversecity.jollypumpkin.com/menu/
- Peninsula Grill main/menu/locations: https://www.tcpeninsulagrill.com/ and https://www.tcpeninsulagrill.com/menu and https://www.tcpeninsulagrill.com/locations
- Chateau Chantal: https://www.chateauchantal.com/visit-us/

The data layer audits five locations and seven food services. The other existing food labels are still unaudited. Brys has substantial seated-service food but not independently verified kitchen hours. Bonobo's published kitchen schedule is for small plates, not a full lunch. Jolly Pumpkin and Peninsula Grill publish conflicting weekday hours.

## Developer
- lib/food-truth.mjs: pure validation and meal-service evaluation.
- data/food-offerings.json: operator-linked food evidence, independent of venue data.
- scripts/check-food-v7.mjs: deterministic date, party and adversarial fixtures.
- npm run test:food-v7; npm run check.

## Not in this P0 delivery
Date/time decision UI, live booking integration, meal-anchored routing, full regional data audit, or automated external source refresh. This is the correct first prerequisite.