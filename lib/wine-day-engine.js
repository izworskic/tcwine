import venues from "@/data/venues.json";
import pois from "@/data/pois.json";
import truth from "@/data/wine-truth.json";

const TRUTH = new Map(truth.records.map((r)=>[r.id,r]));
const WINERIES = venues.filter((v)=>v.category==="winery");

export const WINE_INTENTS = {
  "first-trip": {
    label:"Best first wine day",
    description:"Strong wine identity, memorable settings, and a route that shows the region without turning into a checklist.",
    wineTags:[],
    bestFor:["first-trip"],
    wineWeight:0.62,
  },
  "serious-wine": {
    label:"Wine first",
    description:"Prioritize distinctive wine programs and style specificity. Scenery helps, but it cannot outrank the wine.",
    wineTags:[],
    bestFor:["serious-wine"],
    wineWeight:0.72,
  },
  "riesling": {
    label:"Riesling",
    description:"Build around wineries with explicit Riesling strength, then use route and setting as tie-breakers.",
    wineTags:["riesling"],
    bestFor:["riesling","aromatic-whites"],
    wineWeight:0.74,
  },
  "sparkling": {
    label:"Sparkling wine",
    description:"Lead with sparkling specialists and wineries where bubbly is a documented part of the lineup.",
    wineTags:["sparkling"],
    bestFor:["sparkling"],
    wineWeight:0.75,
  },
  "reds": {
    label:"Cool-climate reds",
    description:"Favor Cabernet Franc, Pinot Noir, Merlot, and other red-wine signals over broad-lineup sightseeing stops.",
    wineTags:["cabernet-franc","pinot-noir","merlot","dry-reds","italian-reds","nebbiolo"],
    bestFor:["reds"],
    wineWeight:0.72,
  },
  "whites": {
    label:"Whites beyond sweet",
    description:"Favor dry whites, Chardonnay, Pinot Gris, Sauvignon Blanc, Albariño, Grüner, and aromatic whites.",
    wineTags:["dry-whites","chardonnay","pinot-gris","pinot-blanc","sauvignon-blanc","albarino","gruner","aromatic-whites","gewurztraminer"],
    bestFor:["whites","aromatic-whites"],
    wineWeight:0.72,
  },
  "food": {
    label:"Wine + food",
    description:"Keep wine quality of fit high, but require useful on-site food so the day can breathe.",
    wineTags:[],
    bestFor:["food"],
    wineWeight:0.60,
  },
  "views": {
    label:"Wine + views",
    description:"Still wine-first, with bay, lake, hilltop, and vineyard settings rewarded after wine fit.",
    wineTags:[],
    bestFor:["views"],
    wineWeight:0.58,
  },
  "quiet": {
    label:"Quiet producers",
    description:"Favor intimate, low-key, and characterful wineries over the biggest destination stops.",
    wineTags:[],
    bestFor:["quiet","local-character"],
    wineWeight:0.66,
  },
};

const DAYS=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const RED_TAGS=new Set(["cabernet-franc","pinot-noir","merlot","dry-reds","italian-reds","nebbiolo"]);
const WHITE_TAGS=new Set(["dry-whites","riesling","chardonnay","pinot-gris","pinot-blanc","sauvignon-blanc","albarino","gruner","aromatic-whites","gewurztraminer"]);

function dayName(date){
  const d=new Date((date||new Date().toISOString().slice(0,10))+"T12:00:00");
  return DAYS[d.getDay()];
}

function isVenueOpen(v,date){
  if(v.needsHours) return true;
  const h=v.hours?.[dayName(date)];
  return !!h && !h.closed;
}

function poiAvailable(p,date){
  if(p.status && p.status!=="open") return false;
  if(p.season){
    const y=String(p.season.year||"");
    if(y && date?.slice(0,4)!==y) return false;
    if(p.season.start && date<p.season.start) return false;
    if(p.season.end && date>p.season.end) return false;
  }
  const h=p.hours?.[dayName(date)];
  return !h?.closed;
}

export function miles(a,b){
  const R=3958.8,r=Math.PI/180;
  const dLat=(b.lat-a.lat)*r,dLng=(b.lng-a.lng)*r,la1=a.lat*r,la2=b.lat*r;
  const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

function routeMiles(order){
  let total=0;
  for(let i=1;i<order.length;i++) total+=miles(order[i-1],order[i]);
  return total;
}

function permutations3(a,b,c){
  return [[a,b,c],[a,c,b],[b,a,c],[b,c,a],[c,a,b],[c,b,a]];
}

function routeThree(a,b,c){
  return permutations3(a,b,c).sort((x,y)=>routeMiles(x)-routeMiles(y))[0];
}

function styleMatch(v,intent){
  const tags=v.tags||[];
  if(!intent.wineTags.length) return 0;
  return intent.wineTags.reduce((n,t)=>n+(tags.includes(t)?1:0),0);
}

export function scoreWinery(v,intentKey="first-trip"){
  const intent=WINE_INTENTS[intentKey]||WINE_INTENTS["first-trip"];
  const t=TRUTH.get(v.id)||{};
  let score=42;
  const reasons=[];
  const matches=styleMatch(v,intent);
  if(matches){
    score+=Math.min(30,16+matches*5);
    reasons.push(`${matches} direct wine-style match${matches>1?"es":""}`);
  } else if(intent.wineTags.length){
    score-=10;
  }
  const best=(t.bestFor||[]);
  const bestMatches=(intent.bestFor||[]).filter(x=>best.includes(x)).length;
  if(bestMatches){ score+=Math.min(20,bestMatches*10); reasons.push("fits this wine-day intent"); }
  score+=Math.max(0,Math.min(10,((t.wineSignal||3)-2.5)*4));
  if((v.rating||0)>=4.7) score+=4;
  if(intentKey==="food"){
    if(v.food && v.food!=="snacks"){score+=18;reasons.push("real on-site food");}
    else if(v.food){score+=8;reasons.push("food available");}
    else score-=12;
  }
  if(intentKey==="views"){
    if(["bay","lake"].includes(v.view)){score+=16;reasons.push(`${v.view} setting`);}
    else if(["vineyard"].includes(v.view)||v.vibe==="hilltop"){score+=9;reasons.push("vineyard setting");}
  }
  if(intentKey==="quiet"){
    const quiet=["quiet","intimate","homey","unpretentious","small and intimate","cabin in the woods","low-key and welcoming"];
    if(quiet.includes(v.vibe)){score+=18;reasons.push("smaller / quieter feel");}
    if(["grand","polished destination","lively","fun and touristy"].includes(v.vibe)) score-=10;
  }
  if(intentKey==="serious-wine"){
    if((t.styleStrengths||[]).filter(x=>x!=="broad-lineup").length>=2){score+=10;reasons.push("specific varietal signal");}
    if(t.role?.includes("specialist")) score+=7;
  }
  if(intentKey==="first-trip"){
    if(["destination-anchor","wine-and-place-anchor","classic-anchor","character-anchor"].includes(t.role)){score+=8;reasons.push("strong regional anchor");}
    if(["bay","lake"].includes(v.view)) score+=5;
  }
  return {
    score:Math.max(0,Math.min(100,Math.round(score))),
    reasons:reasons.slice(0,3),
    truth:t
  };
}

export function rankWineries({area="any",intent="first-trip",date}={}){
  return WINERIES
    .filter(v=>(area==="any"||v.area===area)&&(!date||isVenueOpen(v,date)))
    .map(v=>({venue:v,...scoreWinery(v,intent)}))
    .sort((a,b)=>b.score-a.score || (b.venue.rating||0)-(a.venue.rating||0));
}

function wineVarietyScore(stops){
  const tags=new Set(stops.flatMap(v=>v.tags||[]));
  const hasRed=stops.some(v=>(v.tags||[]).some(t=>RED_TAGS.has(t)));
  const hasWhite=stops.some(v=>(v.tags||[]).some(t=>WHITE_TAGS.has(t)));
  const sparkling=stops.some(v=>(v.tags||[]).includes("sparkling"));
  return Math.min(100,45+Math.min(tags.size,6)*6+(hasRed&&hasWhite?12:0)+(sparkling?7:0));
}

function experienceScore(stops){
  const views=new Set(stops.map(v=>v.view).filter(Boolean));
  const vibes=new Set(stops.map(v=>v.vibe).filter(Boolean));
  const food=stops.some(v=>v.food&&v.food!=="snacks");
  return Math.min(100,50+views.size*7+vibes.size*4+(food?12:0));
}

function bestPlaceFor(route,kind,date){
  const candidates=pois.filter(p=>p.kind===kind&&poiAvailable(p,date));
  if(!candidates.length) return null;
  return candidates
    .map(p=>({p,d:Math.min(...route.map(v=>miles(v,p)))}))
    .sort((a,b)=>a.d-b.d)[0]?.p||null;
}

function placeKindFor(intent){
  if(intent==="views") return "scenic";
  if(intent==="food") return "market";
  if(intent==="quiet") return "hike";
  return "town";
}

export function buildWineDays({
  area="leelanau",
  intent="first-trip",
  date=new Date().toISOString().slice(0,10),
  addPlace=false,
}={}){
  const ranked=rankWineries({area,intent,date}).slice(0,12);
  const days=[];
  for(let i=0;i<ranked.length;i++) for(let j=i+1;j<ranked.length;j++) for(let k=j+1;k<ranked.length;k++){
    const route=routeThree(ranked[i].venue,ranked[j].venue,ranked[k].venue);
    const wineScores=route.map(v=>scoreWinery(v,intent).score);
    const wineFit=wineScores.reduce((a,b)=>a+b,0)/wineScores.length;
    const rm=routeMiles(route);
    const routeFit=Math.max(25,100-rm*2.3);
    const variety=wineVarietyScore(route);
    const experience=experienceScore(route);
    const iw=WINE_INTENTS[intent]?.wineWeight||0.62;
    const rest=1-iw;
    let total=wineFit*iw+routeFit*(rest*.48)+variety*(rest*.27)+experience*(rest*.25);
    const place=addPlace?bestPlaceFor(route,placeKindFor(intent),date):null;
    if(place) total+=2;
    days.push({
      score:Math.max(45,Math.min(98,Math.round(total))),
      wineFit:Math.round(wineFit),
      routeFit:Math.round(routeFit),
      varietyFit:Math.round(variety),
      experienceFit:Math.round(experience),
      routeMiles:Number(rm.toFixed(1)),
      wineries:route.map(v=>({
        id:v.id,name:v.name,town:v.town,area:v.area,tags:v.tags||[],view:v.view,vibe:v.vibe,food:v.food,
        mapsUrl:v.mapsUrl,website:v.website,
        fit:scoreWinery(v,intent).score,
        signature:TRUTH.get(v.id)?.signature||"",
      })),
      place:place?{id:place.id,name:place.name,kind:place.kind,town:place.town,note:place.note,mapsUrl:place.mapsUrl}:null,
    });
  }
  days.sort((a,b)=>b.score-a.score||a.routeMiles-b.routeMiles);
  const chosen=[];
  for(const d of days){
    const ids=new Set(d.wineries.map(w=>w.id));
    const tooSimilar=chosen.some(c=>c.wineries.filter(w=>ids.has(w.id)).length>1);
    if(!tooSimilar) chosen.push(d);
    if(chosen.length===3) break;
  }
  return chosen.map((d,idx)=>({
    ...d,
    rank:idx+1,
    why:dayWhy(d,intent),
  }));
}

function dayWhy(day,intent){
  const top=day.wineries.slice().sort((a,b)=>b.fit-a.fit)[0];
  const bits=[`${top.name} is the wine anchor`];
  if(day.routeMiles<18) bits.push("the wineries cluster tightly");
  if(day.varietyFit>=80) bits.push("the lineup changes enough from stop to stop");
  if(intent==="views"&&day.experienceFit>=75) bits.push("the settings earn their place in the route");
  if(intent==="food"&&day.wineries.some(w=>w.food&&w.food!=="snacks")) bits.push("there is a real food stop");
  if(day.place) bits.push(`${day.place.name} adds one non-wine break without hijacking the day`);
  return bits.join("; ")+".";
}

export function intentWineCopy(intent){
  return WINE_INTENTS[intent]||WINE_INTENTS["first-trip"];
}
