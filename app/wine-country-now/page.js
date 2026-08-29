import Link from "next/link";
import WineCountryNow from "@/components/WineCountryNow";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";
import { wineEvents, WINE_EVENTS_UPDATED } from "@/lib/wine-events";

const BASE="https://tcwine.chrisizworski.com";

export const metadata={
  title:"Traverse City Wine Events 2026: Leelanau & Old Mission Wine Country Now",
  description:"Current and upcoming Traverse City wine-country events for Leelanau and Old Mission, source-verified and connected directly to wine-first route planning.",
  alternates:{canonical:"/wine-country-now"},
  openGraph:{
    title:"Traverse City Wine Country Now",
    description:"Verified current and upcoming wine events plus wine-first route planning for Leelanau and Old Mission.",
    url:BASE+"/wine-country-now",
    type:"website"
  }
};

export default function Page(){
  const graph={
    "@context":"https://schema.org",
    "@type":"ItemList",
    name:"Traverse City wine-country events",
    numberOfItems:wineEvents.length,
    itemListElement:wineEvents.map((e,index)=>({
      "@type":"ListItem",
      position:index+1,
      item:{
        "@type":"Event",
        name:e.title,
        startDate:e.start||(e.dates&&e.dates[0]),
        endDate:e.end||undefined,
        url:BASE+"/events/"+e.id,
        eventStatus:"https://schema.org/EventScheduled",
        eventAttendanceMode:"https://schema.org/OfflineEventAttendanceMode",
        location:{"@type":"Place",name:e.area==="leelanau"?"Leelanau Peninsula wine country":e.area==="old-mission"?"Old Mission Peninsula wine country":"Traverse City wine country"}
      }
    }))
  };

  return (
    <main className="tc-page">
      <h1>Traverse City Wine Country Now: 2026 Events & What to Plan Around</h1>
      <p className="search-lede">
        A current wine-scene board for Leelanau, Old Mission, and Traverse City. Events are included only when a named trail,
        winery, or destination calendar has published dates. Source check: {WINE_EVENTS_UPDATED}.
      </p>
      <RegionalPhoto kind="leelanau" compact />
      <WineCountryNow />

      <h2>Why this is part of the planner</h2>
      <p>
        A wine event changes the best route. A month-long red-wine event should produce a red-wine itinerary, while an evening
        workshop should change when the daytime route ends. Each event page therefore connects back to the same winery-fit and
        route engine instead of becoming an isolated calendar listing.
      </p>
      <div className="intent-pills">
        <Link href="/wine/reds">Plan around red wine</Link>
        <Link href="/wine/serious-wine">Wine-first producers</Link>
        <Link href="/my-wine-journal">My Wine Journal</Link>
        <Link href="/">Full planner</Link>
      </div>
      <AuthorNote context="Traverse City wine events and current wine-country planning" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}} />
    </main>
  );
}
