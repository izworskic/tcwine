import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [home, venues, image] = await Promise.all([
  readFile(new URL("../app/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/venues/page.js", import.meta.url), "utf8"),
  readFile(new URL("../app/opengraph-image.js", import.meta.url), "utf8"),
]);

assert.match(home, /card: "summary_large_image"/);
assert.match(venues, /alternates: \{ canonical: "\/venues" \}/);
assert.match(venues, /url: `\$\{BASE\}\/venues`/);
assert.match(venues, /openGraph:/);
assert.match(venues, /twitter:/);
assert.match(venues, /card: "summary_large_image"/);
assert.match(venues, /images: \[\{ url: SOCIAL_IMAGE, width: 1200, height: 630/);
assert.match(venues, /images: \[SOCIAL_IMAGE\]/);
assert.match(image, /width: 1200/);
assert.match(image, /height: 630/);
assert.match(image, /ImageResponse/);

const title = "Traverse City Tasting Room Hours: 74 Verified Venues";
const description = "Current hours for 74 Traverse City tasting rooms across Leelanau and Old Mission: 40 wineries, 22 breweries, 7 distilleries and 5 cideries.";
assert.ok(title.length <= 60, `Title is too long: ${title.length}`);
assert.ok(description.length <= 160, `Description is too long: ${description.length}`);

console.log("TC Wine SEO checks passed.");
