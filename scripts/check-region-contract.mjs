import assert from "node:assert/strict";
import { buildRegionContract } from "../lib/region-contract.js";

for (const area of ["old-mission", "leelanau"]) {
  const contract = buildRegionContract(area, { intent: "first-trip", date: "2026-10-10" });
  assert.equal(contract.schemaVersion, 1);
  assert.ok(contract.inventory.wineryCount >= 10, area + " winery count");
  assert.equal(
    contract.inventory.knownHoursCount + contract.inventory.unknownHoursCount,
    contract.inventory.wineryCount,
    area + " hours coverage must reconcile"
  );
  assert.equal(contract.truthRules.unknownIsFalse, false);
  assert.ok(contract.handoff.selected.length >= 3, area + " handoff needs a starter day");
  assert.ok(contract.localDrive.medianNearestNeighborMiles >= 0);
  assert.ok(contract.freshness.wineryTruthReviewedAt);
}
console.log("region contract checks passed");
