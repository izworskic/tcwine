# Michigan wine region contract

This repository remains the source of truth for Old Mission and Leelanau winery detail, hours, wine truth, POIs and routing.

The statewide Michigan Wine Day orchestration layer consumes only `/api/region-contract`. The adapter deliberately exposes a small comparison contract: inventory coverage, positive intent evidence, local-drive characteristics, freshness, truth rules and a three-stop starter handoff produced by the existing regional wine-day engine.

It does **not** export or duplicate the full winery database into the statewide product.

Important semantics:

- missing hours are unknown, not closed;
- positive wine-style evidence can improve regional fit, but missing style evidence is not a negative;
- fit is calculated by the statewide decision engine; evidence completeness is reported separately as confidence;
- the regional planner remains authoritative for actual stop routing and posted-hours feasibility after handoff.

Example:

`/api/region-contract?area=old-mission&intent=riesling&date=2026-10-10`
