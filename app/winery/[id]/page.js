import Link from "next/link";
import { notFound } from "next/navigation";
import venues from "@/data/venues.json";
import truth from "@/data/wine-truth.json";
import PlannerMount from "@/components/PlannerMount";
import AuthorNote from "@/components/AuthorNote";
import WineryJournalCard from "@/components/WineryJournalCard";
import { miles } from "@/lib/wine-day-engine";

const BASE="https://tcwine.chrisizworski.com";
const WINERIES=venues.filter(v=>v.category==="winery");
const TRUTH=new Map(truth.records.map(r=>[r.id,r]));
const DAYS=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const RED=new Set(["cabernet-franc","pinot-noir","merlot","dry-reds","italian-reds","nebbiolo"]);
const WHITE=new Set(["dry-whites","riesling","chardonnay","pinot-gris","pinot-blanc","sauvignon-blanc","albarino","gruner","aromatic-whites","gewurztraminer"]);

function pretty(v){return String(v||"").replace(/-/g," ").replace(/\b\w/g,c=>c.toUpperCase());}
function areaName(v){
  return v.area==="old-mission"?"Old Mission Peninsula":v.area==="leelanau"?"Leelanau Peninsula":"Traverse City";
}
function nearby(v){
  return WINERIES.filter(x=>x.id!==v.id&&x.area===v.area)
    .map(x=>({v:x,d:miles(v,x)}))
    .sort((a,b)=>a.d-b.d)
    .slice(0,6);
}
function routePartners(v){
  const candidates=nearby(v);
  const own=new Set(v.tags||[]);
  return candidates
    .map(({v:x,d})=>{
      const novelty=(x.tags||[]).filter(t=>!own.has(t)).length;
      return {v:x,d,score:d-Math.min(novelty,3)*1.4};
    })
    .sort((a,b)=>a.score-b.score)
    .slice(0,2);
}
function styleLinks(tags=[]){
  const links=[];
  const specific=[
    ["cabernet-franc","/wine/cabernet-franc","Cabernet Franc"],
    ["pinot-noir","/wine/pinot-noir","Pinot Noir"],
    ["chardonnay","/wine/chardonnay","Chardonnay"],
    ["pinot-gris","/wine/pinot-gris","Pinot Gris"],
    ["sauvignon-blanc","/wine/sauvignon-blanc","Sauvignon Blanc"],
    ["gewurztraminer","/wine/gewurztraminer","Gewürztraminer"],
    ["merlot","/wine/merlot","Merlot"],
    ["riesling","/wine/riesling","Riesling"],
    ["sparkling","/wine/sparkling","Sparkling wine"],
  ];
  specific.forEach(([tag,href,label])=>{ if(tags.includes(tag)) links.push([href,label]); });
  if(tags.some(t=>RED.has(t))) links.push(["/wine/reds","Cool-climate reds"]);
  if(tags.some(t=>WHITE.has(t))) links.push(["/wine/whites","Dry & aromatic whites"]);
  return links.slice(0,8);
}
function openSummary(v){
  if(v.needsHours) return "Call ahead before making this a must-hit stop.";
  const open=DAYS.filter(d=>v.hours?.[d]&&!v.hours[d].closed);
  return open.length===7?"Posted open seven days a week; confirm seasonal or holiday changes before driving.":`Posted open ${open.join(", ")}; confirm seasonal or holiday changes before driving.`;
}

export function generateStaticParams(){
  return WINERIES.map(v=>({id:v.id}));
}

export function generateMetadata({params}){
  const v=WINERIES.find(x=>x.id===params.id);
  if(!v) return {};
  const t=TRUTH.get(v.id);
  const title=`${v.name}: Wine, Hours, Map & What It Does Best`;
  const description=(t?.signature||v.note).slice(0,155);
  return {
    title,
    description,
    alternates:{canonical:`/winery/${v.id}`},
    openGraph:{title,description,url:`${BASE}/winery/${v.id}`,type:"article"}
  };
}

export default function Page({params}){
  const v=WINERIES.find(x=>x.id===params.id);
  if(!v) notFound();
  const t=TRUTH.get(v.id)||{};
  const partners=routePartners(v);
  const preset=[v.id,...partners.map(x=>x.v.id)];
  const styleNav=styleLinks(v.tags||[]);

  const graph={
    "@context":"https://schema.org",
    "@type":"Winery",
    name:v.name,
    url:v.website||`${BASE}/winery/${v.id}`,
    telephone:v.phone||undefined,
    geo:{"@type":"GeoCoordinates",latitude:v.lat,longitude:v.lng},
    containedInPlace:{"@type":"Place",name:areaName(v)},
    sameAs:v.website?[v.website]:undefined
  };

  return (
    <main className="tc-page winery-guide">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Traverse City wine country</Link><span>›</span>
        <span>{v.name}</span>
      </nav>

      <h1>{v.name}</h1>
      <p className="search-lede">{t.signature||v.note}</p>

      <div className="winery-guide-facts">
        <div><strong>{areaName(v)}</strong><span>{v.town}</span></div>
        <div><strong>{pretty(t.role||"winery")}</strong><span>Best-fit role</span></div>
        <div><strong>{t.wineSignal||"—"} / 5</strong><span>Wine-specificity signal</span></div>
        <div><strong>{v.dwellMinutes} min</strong><span>Suggested tasting stop</span></div>
      </div>

      {v.officialTrail&&(
        <div className="trail-truth">
          <strong>Current official trail member</strong>
          <span>{v.officialTrail.name} · membership checked {v.officialTrail.verifiedAt}</span>
          <a href={v.officialTrail.url} target="_blank" rel="noopener noreferrer">Official trail listing</a>
        </div>
      )}

      <section className="winery-guide-grid">
        <div>
          <h2>Why choose {v.name}?</h2>
          <p>{v.note}</p>
          <div className="truth-tags">
            {(t.bestFor||[]).map(x=><span key={x}>{pretty(x)}</span>)}
          </div>

          <h2>{v.varietals?.length ? "Verified varietals" : "Wine signals"}</h2>
          {(v.varietals?.length || t.styleStrengths?.length)?(
            <>
              <div className="winery-style-list">
                {(v.varietals?.length ? v.varietals : t.styleStrengths).map(x=><span key={x}>{pretty(x)}</span>)}
              </div>
              {v.varietalsSourceUrl&&(
                <p className="varietal-source">
                  Varietal list checked {v.varietalsVerifiedAt} from{" "}
                  <a href={v.varietalsSourceUrl} target="_blank" rel="noopener noreferrer">{v.varietalsSourceLabel||"current source"}</a>.
                </p>
              )}
            </>
          ):<p>The current dataset does not support a strong varietal specialization claim, so this guide does not invent one.</p>}

          {(t.avoidIf||[]).length>0&&<>
            <h2>When it may not be your stop</h2>
            <ul>{t.avoidIf.map(x=><li key={x}>{x}</li>)}</ul>
          </>}
        </div>

        <aside className="winery-guide-aside">
          <h2>Planning facts</h2>
          <dl>
            <div><dt>Setting</dt><dd>{pretty(v.vibe)} · {pretty(v.view)} view</dd></div>
            <div><dt>Food</dt><dd>{v.food?pretty(v.food):"No on-site food noted"}</dd></div>
            <div><dt>Wine / drink</dt><dd>{(v.beverages||[]).map(pretty).join(", ")}</dd></div>
            <div><dt>Hours</dt><dd>{openSummary(v)}</dd></div>
            {v.statusNote&&<div><dt>Availability</dt><dd>{v.statusNote}</dd></div>}
          </dl>
          <div className="winery-guide-actions">
            <a href={v.mapsUrl} target="_blank" rel="noopener noreferrer">Map winery</a>
            {v.website&&<a href={v.website} target="_blank" rel="noopener noreferrer">Official winery site</a>}
            <Link href="/compare-wineries">Compare this winery</Link>
          </div>
        </aside>
      </section>

      <PlannerMount
        embedded
        preset={{beverages:["wine"],selected:preset,origin:"Traverse City",analyticsContext:"winery_detail"}}
        title={`Build a route around ${v.name}`}
        description={`${v.name} plus two nearby wineries with complementary wine signals are preselected. Change anything, then build the route against real roads and posted hours.`}
      />

      <WineryJournalCard wineryId={v.id} wineryName={v.name} />

      <section className="winery-pairings">
        <h2>Two nearby wineries that make sense with it</h2>
        <p>These are route-oriented companions, not claims that they are the two “best” wineries nearby.</p>
        <div className="wine-lens-grid">
          {partners.map(({v:x,d})=>{
            const xt=TRUTH.get(x.id)||{};
            return <article className="wine-lens-card" key={x.id}>
              <h3><Link href={`/winery/${x.id}`}>{x.name}</Link></h3>
              <p>{d.toFixed(1)} miles straight-line proximity · {xt.signature||x.note}</p>
            </article>;
          })}
        </div>
      </section>

      {styleNav.length>0&&(
        <section>
          <h2>Keep exploring by wine style</h2>
          <div className="intent-pills">
            {styleNav.map(([href,label])=><Link href={href} key={href}>{label}</Link>)}
            <Link href="/wine/serious-wine">Wine-first producers</Link>
          </div>
        </section>
      )}

      <AuthorNote context={`${v.name} winery planning`} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(graph)}} />
    </main>
  );
}
