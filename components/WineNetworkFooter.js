"use client";
import { usePathname } from "next/navigation";
export default function WineNetworkFooter() {
  const path = usePathname() || "/";
  if (path.includes("/embed/") || path.startsWith("/embed")) return null;
  return (
    <aside className="wine-network-footer" aria-label="The Michigan wine country network">
      <div className="wine-network-footer-inner">
        <div>
          <p className="wine-v5-kicker">From the people behind the planner</p>
          <h2>We return to Michigan wine country for more than a tasting flight.</h2>
          <p>We enjoy exploring Michigan wine country and visit often. A memorable day makes room for the wine, the countryside, a good meal, and the people you came with. We built these planners around that reality: sensible drives, honest hours, and enough breathing room to actually enjoy a place.</p>
          <p className="wine-network-disclosure">This is our editorial perspective, not a claim that we personally tasted at every listed winery. Location, hours, official trail membership, and varietal evidence are maintained separately from opinion.</p>
          <a href="https://chrisizworski.com/chris-izworski/" rel="author">Built by Chris Izworski</a>
        </div>
        <nav aria-label="Explore Michigan wine country">
          <h3>Keep exploring</h3>
          <a href="https://tcwine.chrisizworski.com/">Traverse City winery map &amp; planner →</a>
          <a href="https://tcwine.chrisizworski.com/old-mission-vs-leelanau-wineries">Old Mission or Leelanau? →</a>
          <a href="https://tcwine.chrisizworski.com/wine/sparkling">Where to taste sparkling wine →</a>
          <a href="https://chrisizworski.com/petoskey-wine/">Petoskey wine region planner →</a>
          <a href="https://chrisizworski.com/tools/">All the Michigan planning tools →</a>
        </nav>
      </div>
    </aside>
  );
}
