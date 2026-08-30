import Link from "next/link";
import PlannerMount from "@/components/PlannerMount";
import AuthorNote from "@/components/AuthorNote";
import { rankWineries, WINE_INTENTS } from "@/lib/wine-day-engine";

const BASE="https://tcwine.chrisizworski.com";
const INTENTS=["riesling","sparkling","reds","whites","cabernet-franc","pinot-noir","chardonnay","sauvignon-blanc","gewurztraminer","merlot","pinot-gris","serious-wine","first-trip"];

const SEO={
  riesling:{
    title:"Best Traverse City Riesling Wineries: Old Mission & Leelanau",
    h1:"Traverse City Riesling Wineries",
    description:"Find Traverse City wineries with explicit Riesling strength across Old Mission and Leelanau, then route the best-fit stops into a realistic wine day.",
    intro:"Riesling is one of the defining grapes of the Traverse Wine Coast. This page starts with wineries whose current venue data explicitly identifies Riesling, then ranks them for a Riesling-led day rather than sorting by general popularity."
  },
  sparkling:{
    title:"Traverse City Sparkling Wine: Wineries on Old Mission & Leelanau",
    h1:"Traverse City Sparkling Wine Wineries",
    description:"Find Traverse City wineries with sparkling-wine strength, from specialists to broader tasting rooms, and route them into a practical Old Mission or Leelanau day.",
    intro:"Sparkling wine deserves its own route here. The ranking favors wineries where sparkling is a documented part of the wine identity, with specialist signals outranking scenery-only stops."
  },
  reds:{
    title:"Traverse City Red Wine Wineries: Cabernet Franc, Pinot Noir & More",
    h1:"Traverse City Wineries for Cool-Climate Reds",
    description:"Find Traverse City wineries for Cabernet Franc, Pinot Noir, Merlot, Nebbiolo and other red-wine styles, then build a wine-first route.",
    intro:"Northern Michigan is not only Riesling. This lens looks for explicit Cabernet Franc, Pinot Noir, Merlot, dry-red, Italian-red, and Nebbiolo signals so red-wine drinkers can build a day around what they actually want in the glass."
  },
  whites:{
    title:"Traverse City White Wine Wineries: Chardonnay, Pinot Gris & More",
    h1:"Traverse City Wineries for Dry & Aromatic Whites",
    description:"Find Traverse City wineries for Chardonnay, Pinot Gris, Sauvignon Blanc, Albariño, Grüner, Gewürztraminer and dry whites, then route the day.",
    intro:"This is the broader white-wine lens: dry whites, Chardonnay, Pinot Gris, Sauvignon Blanc, Albariño, Grüner, Gewürztraminer and other aromatic styles. The ranking rewards explicit wine-style signals first."
  },
  "cabernet-franc":{
    title:"Traverse City Cabernet Franc Wineries: Old Mission & Leelanau",
    h1:"Traverse City Cabernet Franc Wineries",
    description:"Find Traverse City wineries with verified Cabernet Franc across Old Mission and Leelanau, compare their fit, and route a three-winery red-wine day.",
    intro:"Cabernet Franc is one of the core cool-climate reds of the Traverse Wine Coast. This ranking uses verified winery varietal data first, then route fit and tasting character, so a scenic stop cannot outrank a winery that actually documents Cabernet Franc."
  },
  "pinot-noir":{
    title:"Traverse City Pinot Noir Wineries: Old Mission & Leelanau",
    h1:"Traverse City Pinot Noir Wineries",
    description:"Find Traverse City wineries with verified Pinot Noir, compare Old Mission and Leelanau producers, and build a practical three-winery route.",
    intro:"Pinot Noir appears across both Traverse City wine peninsulas, but not every tasting room is equally useful for a Pinot-focused visitor. This lens starts with verified varietal coverage and uses geography only after the grape match."
  },
  "chardonnay":{
    title:"Traverse City Chardonnay Wineries: Old Mission & Leelanau",
    h1:"Traverse City Chardonnay Wineries",
    description:"Find Traverse City wineries with verified Chardonnay and route a wine-first Chardonnay day across Old Mission, Leelanau, or both.",
    intro:"Chardonnay is one of the region's most broadly represented vinifera grapes. The useful question is not whether Traverse City makes Chardonnay, but which documented producers make sense together in one tasting day."
  },
  "sauvignon-blanc":{
    title:"Traverse City Sauvignon Blanc Wineries: Leelanau & Old Mission",
    h1:"Traverse City Sauvignon Blanc Wineries",
    description:"Find wineries with verified Sauvignon Blanc in Traverse City wine country, including Leelanau and Old Mission producers, then build the route.",
    intro:"Sauvignon Blanc is less universal here than Riesling or Chardonnay, which makes verified producer coverage especially useful. This page excludes wineries where the current data does not support a Sauvignon Blanc claim."
  },
  "gewurztraminer":{
    title:"Traverse City Gewürztraminer Wineries: Leelanau & Old Mission",
    h1:"Traverse City Gewürztraminer Wineries",
    description:"Find Traverse City wineries with verified Gewürztraminer and build an aromatic-white route across Leelanau and Old Mission.",
    intro:"Gewürztraminer is a real part of northern Michigan's aromatic-white story. This ranking begins with wineries whose current varietal data explicitly includes it, then balances wine fit with route coherence."
  },
  merlot:{
    title:"Traverse City Merlot Wineries: Old Mission & Leelanau",
    h1:"Traverse City Merlot Wineries",
    description:"Find Traverse City wineries with verified Merlot, compare producer fit, and build a focused red-wine route across Old Mission and Leelanau.",
    intro:"Merlot is grown and poured by a meaningful set of Traverse City producers. This page treats it as a real wine-search intent rather than burying it inside a generic red-wine list."
  },
  "pinot-gris":{
    title:"Traverse City Pinot Gris Wineries: Old Mission & Leelanau",
    h1:"Traverse City Pinot Gris & Pinot Grigio Wineries",
    description:"Find Traverse City wineries with verified Pinot Gris or Pinot Grigio coverage and build a wine-first route across Old Mission and Leelanau.",
    intro:"Pinot Gris and Pinot Grigio are widely represented across the Traverse Wine Coast. The ranking uses verified varietal coverage, then route fit, so the page is useful for planning rather than just naming producers."
  },
  "serious-wine":{
    title:"Best Traverse City Wineries for Wine Lovers: A Wine-First Guide",
    h1:"Traverse City Wineries for Wine-First Visitors",
    description:"A wine-first Traverse City winery guide that prioritizes distinctive wine programs and varietal specificity before views, popularity, or tasting-room spectacle.",
    intro:"This list is deliberately different from a generic 'best wineries' ranking. It rewards wine specificity, documented varietal signals, and specialist roles. Views and atmosphere can improve a stop, but they cannot substitute for the wine."
  },
  "first-trip":{
    title:"Best Traverse City Wineries for a First Wine Day: Route & Map",
    h1:"Your First Traverse City Wine Day",
    description:"Build a first Traverse City wine day around strong wine identity, memorable settings, three-winery pacing, and a route that actually makes sense.",
    intro:"For a first visit, the goal is not to cram in the most wineries. It is to taste enough of the region to understand it. The ranking balances wine identity with memorable settings and route practicality."
  }
};

export function generateStaticParams(){
  return INTENTS.map(intent=>({intent}));
}

export function generateMetadata({params}){
  const cfg=SEO[params.intent];
  if(!cfg) return {};
  return {
    title:cfg.title,
    description:cfg.description,
    alternates:{canonical:`/wine/${params.intent}`},
    openGraph:{title:cfg.title,description:cfg.description,url:`${BASE}/wine/${params.intent}`,type:"website"},
  };
}

export default function Page({params}){
  const cfg=SEO[params.intent];
  if(!cfg) return null;
  const ranked=rankWineries({area:"any",intent:params.intent});
  const top=ranked.slice(0,12);
  const selected=top.slice(0,4).map(x=>x.venue.id);
  const intent=WINE_INTENTS[params.intent];

  const graph={
    "@context":"https://schema.org",
    "@type":"ItemList",
    name:cfg.h1,
    numberOfItems:top.length,
    itemListElement:top.map((x,index)=>({
      "@type":"ListItem",
      position:index+1,
      name:x.venue.name,
      url:x.venue.website||undefined,
    }))
  };

  return (
    <main className="tc-page">
      <h1>{cfg.h1}</h1>
      <p className="search-lede">{cfg.intro}</p>
      <div className="quick-answer" aria-label="Wine-first planning rule">
        <div><strong>Wine first</strong><span>Varietal and wine-program fit leads the ranking</span></div>
        <div><strong>3 wineries</strong><span>A deliberate day target to reduce palate fatigue</span></div>
        <div><strong>Fit, not quality</strong><span>The score measures match to this intent, not objective wine quality</span></div>
      </div>

      <PlannerMount
        embedded
        preset={{beverages:["wine"],selected,origin:"Traverse City",analyticsContext:`wine_${params.intent}`}}
        title={`Map four strong ${intent.label.toLowerCase()} candidates`}
        description="They are preselected so you can immediately see the geography, real-road order, and whether the stops actually fit your date and hours."
      />

      <h2>Wine-first ranking</h2>
      <p>{intent.description} Scores below are Wine Day Fit scores, not critic scores or claims that one producer makes objectively better wine than another.</p>
      <p className="wine-data-note">
        The Traverse Wine Coast is a lake-moderated cool-climate region. Traverse City Tourism identifies Riesling, Chardonnay,
        Pinot Gris, Pinot Noir, and Cabernet Franc among its defining varieties. This site's grape rankings use winery-level
        varietal evidence rather than assuming every winery pours every regional grape.{" "}
        <a href="https://www.traversecity.com/food-and-drink/wineries/" target="_blank" rel="noopener noreferrer">Regional wine context</a>
      </p>
      <ol className="wine-ranking">
        {top.map(({venue,score,reasons,truth},index)=>(
          <li key={venue.id}>
            <div className="wine-ranking-score">{score}</div>
            <div>
              <h3>{index+1}. <Link href={`/winery/${venue.id}`}>{venue.name}</Link></h3>
              <p>{truth.signature}</p>
              <div className="truth-tags">
                {(venue.tags||[]).slice(0,6).map(t=><span key={t}>{t.replace(/-/g," ")}</span>)}
                {venue.view&&<span>{venue.view} view</span>}
              </div>
              <p className="wine-ranking-reasons">{reasons.length?reasons.join(" · "):"Route and winery profile fit this wine-day lens."}</p>
              <div className="truth-stop-actions">
                {venue.website&&<a href={venue.website} target="_blank" rel="noopener noreferrer">Winery site</a>}
                <Link href={`/winery/${venue.id}`}>Full winery guide</Link>
                <a href={venue.mapsUrl} target="_blank" rel="noopener noreferrer">Map winery</a>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <h2>Build the day instead of collecting wineries</h2>
      <p>
        Three winery stops is the default because tasting fatigue is real and the region rewards time between pours.
        Use the <Link href="/">Wine Country Truth Engine</Link> to change peninsula, date, and wine intent, or add one worthwhile non-wine break without turning the day into a general sightseeing itinerary.
      </p>

      <AuthorNote context={cfg.h1} />
      <nav className="morelinks">
        Wine lenses: <Link href="/wine/riesling">Riesling</Link>{" · "}
        <Link href="/wine/cabernet-franc">Cabernet Franc</Link>{" · "}
        <Link href="/wine/pinot-noir">Pinot Noir</Link>{" · "}
        <Link href="/wine/chardonnay">Chardonnay</Link>{" · "}
        <Link href="/wine/pinot-gris">Pinot Gris</Link>{" · "}
        <Link href="/wine/sauvignon-blanc">Sauvignon Blanc</Link>{" · "}
        <Link href="/wine/gewurztraminer">Gewürztraminer</Link>{" · "}
        <Link href="/wine/merlot">Merlot</Link>{" · "}
        <Link href="/wine/sparkling">Sparkling</Link>{" · "}
        <Link href="/wine/serious-wine">Wine-first</Link>{" · "}
        <Link href="/">Full winery map</Link>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}} />
    </main>
  );
}
