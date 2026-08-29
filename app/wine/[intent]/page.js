import Link from "next/link";
import PlannerMount from "@/components/PlannerMount";
import AuthorNote from "@/components/AuthorNote";
import { rankWineries, WINE_INTENTS } from "@/lib/wine-day-engine";

const BASE="https://tcwine.chrisizworski.com";
const INTENTS=["riesling","sparkling","reds","whites","serious-wine","first-trip"];

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
        <Link href="/wine/sparkling">Sparkling</Link>{" · "}
        <Link href="/wine/reds">Reds</Link>{" · "}
        <Link href="/wine/whites">Whites</Link>{" · "}
        <Link href="/wine/serious-wine">Wine-first</Link>{" · "}
        <Link href="/">Full winery map</Link>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}} />
    </main>
  );
}
