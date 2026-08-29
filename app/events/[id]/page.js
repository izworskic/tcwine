import Link from "next/link";
import { notFound } from "next/navigation";
import WineDayComposer from "@/components/WineDayComposer";
import AuthorNote from "@/components/AuthorNote";
import venues from "@/data/venues.json";
import { formatEventDate, getWineEvent, wineEvents } from "@/lib/wine-events";

const BASE="https://tcwine.chrisizworski.com";

export function generateStaticParams(){
  return wineEvents.map(e=>({id:e.id}));
}

export function generateMetadata({params}){
  const e=getWineEvent(params.id);
  if(!e) return {};
  const title=`${e.title}: 2026 Dates & Wine-Day Planner`;
  const description=(e.summary||"").slice(0,158);
  return {
    title,
    description,
    alternates:{canonical:`/events/${e.id}`},
    openGraph:{title,description,url:`${BASE}/events/${e.id}`,type:"article"}
  };
}

function eventGraph(e){
  const locationVenue=e.venueId?venues.find(v=>v.id===e.venueId):null;
  const location={
    "@type":"Place",
    name:locationVenue?.name||(e.area==="leelanau"?"Leelanau Peninsula Wine Trail":e.area==="old-mission"?"Old Mission Peninsula wine country":"Traverse City wine country"),
    address:locationVenue?{ "@type":"PostalAddress", addressLocality:locationVenue.town, addressRegion:"MI", addressCountry:"US" }:undefined
  };
  if(Array.isArray(e.dates)){
    return {
      "@context":"https://schema.org",
      "@graph":e.dates.map((date,index)=>({
        "@type":"Event",
        "@id":`${BASE}/events/${e.id}#${index+1}`,
        name:e.title,
        startDate:date,
        eventStatus:"https://schema.org/EventScheduled",
        eventAttendanceMode:"https://schema.org/OfflineEventAttendanceMode",
        location,
        url:`${BASE}/events/${e.id}`,
        description:e.summary
      }))
    };
  }
  return {
    "@context":"https://schema.org",
    "@type":"Event",
    name:e.title,
    startDate:e.start,
    endDate:e.end,
    eventStatus:"https://schema.org/EventScheduled",
    eventAttendanceMode:"https://schema.org/OfflineEventAttendanceMode",
    location,
    url:`${BASE}/events/${e.id}`,
    description:e.summary
  };
}

export default function Page({params}){
  const e=getWineEvent(params.id);
  if(!e) notFound();
  const venue=e.venueId?venues.find(v=>v.id===e.venueId):null;

  return (
    <main className="tc-page wine-event-page">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Traverse City wine country</Link><span>›</span>
        <Link href="/wine-country-now">Wine Country Now</Link><span>›</span>
        <span>{e.title}</span>
      </nav>
      <h1>{e.title}</h1>
      <p className="search-lede">{e.summary}</p>

      <div className="wine-event-facts">
        <div><strong>{formatEventDate(e)}</strong><span>2026 dates</span></div>
        <div><strong>{e.area==="leelanau"?"Leelanau":e.area==="old-mission"?"Old Mission":"Traverse City"}</strong><span>Wine-country area</span></div>
        <div><strong>{e.price||"See source"}</strong><span>Published price / details</span></div>
        <div><strong>{e.verifiedAt}</strong><span>Source checked</span></div>
      </div>

      {e.excludedWeekdays?.length>0&&(
        <div className="event-warning"><strong>Important:</strong> this event excludes {e.excludedWeekdays.join(", ")}.</div>
      )}

      <section className="event-truth">
        <p className="wine-world-eyebrow">Planning truth</p>
        <h2>How to build the wine day around it</h2>
        <p>{e.planningTruth}</p>
        <div className="event-source">
          <span>Source: {e.sourceLabel} · verified {e.verifiedAt}</span>
          <a href={e.sourceUrl} target="_blank" rel="noopener noreferrer">Check current event details before buying or driving</a>
        </div>
      </section>

      {venue&&(
        <p className="event-venue-link">
          Winery anchor: <Link href={"/winery/"+venue.id}>{venue.name}</Link>. Open the winery guide for wine style, fit, hours, and nearby route partners.
        </p>
      )}

      <WineDayComposer initialArea={e.area==="traverse-city"?"any":e.area} initialIntent={e.wineIntent||"first-trip"} />

      <h2>Keep the event from taking over the wine day</h2>
      <p>
        An event ticket is not a reason to race between tasting rooms. The planner still defaults to three wineries because
        wine-style fit, palate fatigue, meal timing, and the drive between stops matter more than maximizing check-ins.
      </p>
      <div className="intent-pills">
        <Link href="/wine-country-now">All current wine events</Link>
        <Link href="/compare-wineries">Compare wineries</Link>
        <Link href="/my-wine-journal">My Wine Journal</Link>
        <Link href="/">Full winery map</Link>
      </div>

      <AuthorNote context={`${e.title} planning`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(eventGraph(e))}} />
    </main>
  );
}
