"use client";

import { trackWineEvent } from "@/lib/wine-analytics";

export default function WineDataDeskActions({ count, updated }) {
  const citation = `Traverse City Winery Map by Chris Izworski. "Traverse City Wine Country Data Desk." ${count} mapped winery/tasting-room locations. Dataset reviewed ${updated}. https://tcwine.chrisizworski.com/wine-country-data`;
  const statLine = `The Traverse City Wine Country Data Desk maps ${count} winery/tasting-room locations across Old Mission Peninsula, Leelanau Peninsula, and Traverse City. Dataset reviewed ${updated}.`;

  async function copy(text, type) {
    try {
      await navigator.clipboard.writeText(text);
      trackWineEvent("wine_data_citation_copied", { type });
    } catch {
      // Clipboard access can be unavailable in restricted browsers.
    }
  }

  function openDownload(type) {
    trackWineEvent("wine_data_download_opened", { type });
  }

  return (
    <div className="data-actions">
      <button type="button" onClick={() => copy(citation, "citation")}>Copy citation</button>
      <button type="button" onClick={() => copy(statLine, "stat_line")}>Copy stat line</button>
      <a href="/api/data-desk/wineries.csv" onClick={() => openDownload("csv")}>Download research CSV</a>
      <a href="/api/data-desk/wineries.geojson" onClick={() => openDownload("geojson")}>Download GeoJSON</a>
      <a href="/api/data-desk/snapshot.json" onClick={() => openDownload("json")}>Open JSON snapshot</a>
    </div>
  );
}
