"use client";

import { useState } from "react";
import { trackWineEvent } from "@/lib/wine-analytics";

const EMBED = `<iframe
  src="https://tcwine.chrisizworski.com/embed/traverse-city-winery-map"
  title="Traverse City Winery Map"
  width="100%"
  height="460"
  loading="lazy"
  style="border:0;border-radius:12px;overflow:hidden"
></iframe>
<p style="font:14px/1.4 system-ui,sans-serif">
  Map by <a href="https://tcwine.chrisizworski.com/?utm_source=publisher_embed&utm_medium=embed&utm_campaign=winery_map" rel="nofollow">Chris Izworski's Traverse City Winery Map</a>
</p>`;

export default function PublisherKit() {
  const [copied, setCopied] = useState(false);

  async function copyEmbed() {
    try {
      await navigator.clipboard.writeText(EMBED);
      setCopied(true);
      trackWineEvent("wine_publisher_embed_copied", { asset: "winery_map" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="publisher-kit">
      <h2>Embed the map on your site</h2>
      <p>
        The embed is free to use. Its built-in planner link is marked nofollow. If you independently reference the map or dataset in your editorial copy, you can cite the planner normally.
      </p>
      <div className="publisher-preview">
        <iframe
          src="/embed/traverse-city-winery-map"
          title="Traverse City Winery Map preview"
          width="100%"
          height="460"
          loading="lazy"
        />
      </div>
      <button type="button" className="page-cta publisher-copy" onClick={copyEmbed}>
        {copied ? "Embed code copied" : "Copy embed code"}
      </button>
      <details className="publisher-code">
        <summary>View embed code</summary>
        <pre>{EMBED}</pre>
      </details>

      <h2>Download the current directory data</h2>
      <p>
        Use the exports for editorial research, trip-planning tools, maps, or fact checking. If you reference the compilation editorially,
        cite Chris Izworski&apos;s Traverse City Winery Map in the way that best fits your page.
      </p>
      <div className="publisher-downloads">
        <a
          href="/api/publisher/wineries.geojson"
          onClick={() => trackWineEvent("wine_publisher_data_opened", { format: "geojson" })}
        >
          Download GeoJSON
        </a>
        <a
          href="/api/publisher/wineries.csv"
          onClick={() => trackWineEvent("wine_publisher_data_opened", { format: "csv" })}
        >
          Download CSV
        </a>
      </div>
    </section>
  );
}
