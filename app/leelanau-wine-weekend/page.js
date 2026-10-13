import Link from "next/link";
import RegionalPhoto from "@/components/RegionalPhoto";
import AuthorNote from "@/components/AuthorNote";

const BASE = "https://tcwine.chrisizworski.com";
const URL = BASE + "/leelanau-wine-weekend";

export const metadata = {
  title: "A Real Leelanau Wine Weekend: MAWBY, Good Harbor Beach & Lake Leelanau",
  description: "A firsthand early-October Leelanau wine weekend: Bonobo, sunset at Good Harbor Beach, Lake Leelanau as a home base, MAWBY, Laurentide and Amoritas. What we learned about pacing.",
  alternates: { canonical: "/leelanau-wine-weekend" },
  authors: [{ name: "Chris Izworski", url: "https://chrisizworski.com/chris-izworski/" }],
  openGraph: {
    title: "The Leelanau wine weekend we actually took",
    description: "A relaxed Friday arrival, one protected sunset and a Saturday built around sparkling wine, old favorites and one new vineyard.",
    url: URL, type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "A Real Leelanau Wine Weekend: MAWBY, Good Harbor Beach & Lake Leelanau",
    description: "A firsthand trip and a better way to plan an unhurried wine-country weekend.",
  },
};

const article = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": URL + "#article",
      headline: "The Leelanau wine weekend we actually took",
      description: "Firsthand reflections on a relaxed early-October wine weekend from Traverse City to Lake Leelanau.",
      mainEntityOfPage: { "@id": URL + "#webpage" },
      author: { "@id": "https://chrisizworski.com/#person" },
      publisher: { "@id": "https://chrisizworski.com/#person" },
      datePublished: "2026-10-13",
      dateModified: "2026-10-13",
      about: [
        { "@type": "Place", name: "Leelanau Peninsula", address: { "@type": "PostalAddress", addressRegion: "MI", addressCountry: "US" } },
        { "@type": "Place", name: "Lake Leelanau, Michigan" },
        { "@type": "Place", name: "Good Harbor Beach" },
      ],
    },
    {
      "@type": "WebPage",
      "@id": URL + "#webpage",
      url: URL,
      name: "A Real Leelanau Wine Weekend",
      isPartOf: { "@id": BASE + "/#site" },
      mainEntity: { "@id": URL + "#article" },
      creator: { "@id": "https://chrisizworski.com/#person" },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Traverse City wine country", item: BASE + "/" },
        { "@type": "ListItem", position: 2, name: "A real Leelanau wine weekend", item: URL },
      ],
    },
  ],
};

const variations = [
  {
    title: "A Friday sunset without the winery marathon",
    who: "For a couple arriving from out of town",
    plan: "Get north without rushing, choose one early wine-and-food stop, arrange dinner to go and protect the last light on Good Harbor Bay. Sleep near Lake Leelanau rather than immediately turning for home.",
    caution: "Do not promise yourself another tasting after an already-full drive. Check sunset, driving time, park rules and the season.",
    href: "/old-mission-vs-leelanau-wineries",
    link: "Choose your first peninsula",
  },
  {
    title: "A sparkling-focused Saturday",
    who: "For someone who knows what belongs in the glass",
    plan: "Start with a reservation at MAWBY, then decide whether the rest of the afternoon is another tasting room or a village meal and a longer conversation. The bubbles, not the stop count, are the point.",
    caution: "MAWBY strongly recommends reservations but does not require them. Verify the policy and your chosen time.",
    href: "/wine/sparkling",
    link: "Find sparkling-wine producers",
  },
  {
    title: "One old favorite, one new discovery",
    who: "For visitors returning to Leelanau",
    plan: "Go back to a place you know, as we did at Laurentide. Then give a new-to-you winery time to explain its wines, as Amoritas did for us. You get familiarity and the chance to be surprised.",
    caution: "Book guided experiences when available; do not assume a walk-in tasting includes a tour.",
    href: "/wine/riesling",
    link: "Explore the Riesling evidence",
  },
  {
    title: "A beach-first, village-centered day",
    who: "For people who prefer a whole weekend to a tasting checklist",
    plan: "Make breakfast where you are staying, walk Good Harbor late in the morning, enjoy a proper lunch in Lake Leelanau, and leave only the afternoon for wineries. Two good tastings can be enough.",
    caution: "Respect park access rules, protect time for meals, and organize a designated driver or other transportation.",
    href: "/leelanau-peninsula-wine-trail",
    link: "See the wineries by town",
  },
];

export default function Page() {
  return (
    <main className="tc-page wine-travel-story">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/">Traverse City wine country</Link><span>›</span>
        <span>A real Leelanau wine weekend</span>
      </nav>
      <header className="wine-trip-header">
        <p className="wine-v5-kicker">Firsthand trip journal · first weekend of October · two nights</p>
        <h1>The Leelanau wine weekend we actually took</h1>
        <p className="wine-trip-deck">A Friday afternoon at Bonobo. Pizza at sunset on Good Harbor Beach. A little sparkling wine, an old favorite and somewhere entirely new. And a place in Lake Leelanau to come back to when we were done.</p>
        <p className="wine-trip-byline">By <a href="https://chrisizworski.com/chris-izworski/" rel="author">Chris Izworski</a> · My wife and I made this trip together. The opinions and experiences below are ours; operating hours, current menus and reservations are separate facts to verify.</p>
      </header>

      <section className="wine-trip-intro" aria-label="Why we took this trip">
        <p className="wine-trip-drop">The best wine weekends are not always the ones with the most winery stops. I think they are the ones where you remember the food, the conversations, the lake, the sun going down — and what was actually in the glass.</p>
        <p>That was the idea when my wife and I headed north for an early-October weekend around October 3. We did not start at daybreak or try to squeeze a winery into every available hour. We left around noon on Friday, gave ourselves a comfortable drive to Traverse City and let the weekend take shape around a handful of places we genuinely wanted to spend time.</p>
      </section>

      <nav className="wine-trip-contents" aria-label="Read the weekend">
        <a href="#friday">Friday: the arrival and sunset</a>
        <a href="#saturday">Saturday: old and new</a>
        <a href="#sunday">Sunday: the slow drive home</a>
        <a href="#borrow">Four ways to borrow this weekend</a>
      </nav>

      <section id="friday" className="wine-trip-chapter">
        <div className="wine-trip-chapter-head"><span className="wine-trip-day">01 · Friday</span><h2>Leave at noon. Make room for the sunset.</h2></div>
        <p>We came through Traverse City and took our first detour up <Link href="/old-mission-peninsula-wineries">Old Mission Peninsula</Link> to <Link href="/winery/bonobo">Bonobo Winery</Link>. There is something about arriving in wine country without a schedule nipping at your heels. We sat with a wonderful view, enjoyed the wine and shared a cheese-and-tomato pairing — crisp on the outside, beautifully soft in the middle. I still owe you the exact menu name, but I remember how good it was and how easy it felt to sit there.</p>
        <p>Before we left, we called <a href="https://www.dickspourhouse.com/" target="_blank" rel="noopener noreferrer">Dick&apos;s Pour House</a> in Lake Leelanau to order pizza. On our way west, we made a little stop at a wine shop for chilled sparkling wine and some conversation. I like those stops. They may not have a place on an official wine trail, but they can make the whole afternoon feel more like a weekend.</p>
        <p>We picked up the pizza, then headed toward <a href="https://www.nps.gov/places/000/good-harbor-beach-651.htm" target="_blank" rel="noopener noreferrer">Good Harbor Beach</a>. October sunsets have a way of moving the schedule along whether you are ready or not. We were. We sat there with our pizza, a little sparkling wine and Lake Michigan spread out in front of us. It was simple, and it was terrific. It felt more memorable than squeezing in one more tasting room.</p>
        <p>Once the light went, we drove back into Lake Leelanau and settled into our Airbnb right downtown. That turned out to be one of the smartest decisions of the trip: a place to come home to, close to the village, with the peninsula spread around us instead of another long drive waiting at the end of the night.</p>
      </section>

      <figure className="wine-trip-photo">
        <RegionalPhoto kind="leelanau" />
        <figcaption>Regional vineyard imagery, independently credited above. This is a landscape reference, not a photograph from our weekend.</figcaption>
      </figure>

      <section id="saturday" className="wine-trip-chapter">
        <div className="wine-trip-chapter-head"><span className="wine-trip-day">02 · Saturday</span><h2>A beach walk, a proper lunch, and a little old with a little new.</h2></div>
        <p>We made breakfast at the Airbnb. No line, no hurry, just a normal start to a really good day. Then we went back to Good Harbor for a mid-morning walk. It is one of the things I like about the Leelanau Peninsula: you can be at a beach in the morning, surrounded by vineyards that afternoon and sitting in a village again by evening. None of those experiences needs to cancel out the others.</p>
        <p>We returned to Lake Leelanau for sandwiches from <a href="https://www.fiddleheadsleelanau.com/" target="_blank" rel="noopener noreferrer">Fiddleheads</a>, took them back to the Airbnb, enjoyed lunch and got ready for the afternoon. It was not a wasted morning before the wine. It was part of the reason the trip felt so good.</p>

        <h3>MAWBY: the reservation we made ahead</h3>
        <p>We had reserved a tasting at <Link href="/winery/mawby">MAWBY</Link>, which was absolutely the right move for a busy weekend. We love the atmosphere, the views and the fact that sparkling wine is the main event. We tasted, enjoyed being there and brought bottles home. If you are hoping for a particular time or table, <a href="https://mawby.wine/visit/" target="_blank" rel="noopener noreferrer">book ahead with MAWBY</a>. Reservations are strongly recommended, not universally required; that difference is worth knowing.</p>

        <h3>Laurentide: an old favorite</h3>
        <p>From there we went to <Link href="/winery/laurentide-winery">Laurentide</Link>, a smaller winery we already know and love. This is where I think returning visitors have an advantage. You do not need every stop to be new. Sometimes you want to see a familiar place, enjoy what you know and let the day feel personal.</p>

        <h3>Amoritas: something we had not done before</h3>
        <p>Then we tried <Link href="/winery/amoritas-vineyards">Amoritas Vineyards</Link> for the first time. This was the discovery of the weekend. Their team led us through a guided tasting, and the part I keep thinking about is Riesling. People sometimes hear that grape name and think only of sweet wine. We tasted one they called <em>Bone Dry</em> and talked about how a different level of residual sugar can reveal a very different side of the same grape. It was a lesson as much as a tasting, and I came away appreciating the range of Riesling even more.</p>
        <p>When we finished, we sat on their front porch in the evening sunshine and enjoyed the last of the afternoon. It was not a complicated moment. It was simply a good place to be, at the end of a day that had room for it.</p>
        <p>We headed back into town for dinner and returned to the Airbnb. No marathon, no frantic dash to another peninsula, no trying to win at wine tourism. Just a really good Saturday.</p>
      </section>

      <section id="sunday" className="wine-trip-chapter">
        <div className="wine-trip-chapter-head"><span className="wine-trip-day">03 · Sunday</span><h2>Breakfast, then home.</h2></div>
        <p>Sunday was another breakfast at the Airbnb and a drive home. We left with bottles we were excited to open later, a few new ideas about wine and a weekend that felt longer than the number of days on the calendar. That is what I want these tools to help other people find.</p>
      </section>

      <section className="wine-v5 wine-trip-principles" aria-labelledby="trip-judgment">
        <p className="wine-v5-kicker">What I would do again</p>
        <h2 id="trip-judgment">Five decisions that made this weekend work</h2>
        <ol className="wine-trip-lessons">
          <li><strong>Leave at a civilized hour.</strong> Friday at noon meant our arrival did not feel like a race.</li>
          <li><strong>Protect one memorable moment.</strong> We built around the early-October Good Harbor sunset, not an extra winery checkmark.</li>
          <li><strong>Make Lake Leelanau your home base.</strong> For this trip, a downtown rental let us move between the beach, villages and tasting rooms without constantly relocating.</li>
          <li><strong>Book the stop that matters.</strong> We reserved MAWBY rather than gambling on the exact experience we wanted. Confirm any guided tasting separately.</li>
          <li><strong>Mix the known with the unknown.</strong> Laurentide felt like coming back; Amoritas gave us a story we did not have when we arrived.</li>
        </ol>
        <p>That is the philosophy behind this wine planner: a great trip is not a mathematically full itinerary. It is the right wine, a manageable drive, a meal when you need one, and some room left for the place itself.</p>
      </section>

      <section className="wine-trip-important" aria-labelledby="wine-trip-practical">
        <h2 id="wine-trip-practical">A few real-world checks before copying our trip</h2>
        <p>This is our trip story, not a claim that every stop has the same menu, wine list, tours or hours now. <strong>MAWBY strongly recommends reservations</strong>; a guided winery tasting may need its own booking. Verify current hours, food and sunset timing for your date. Have a designated driver or arrange transport for wine tastings.</p>
        <p><strong>Good Harbor is part of Sleeping Bear Dunes National Lakeshore.</strong> The National Park Service <a href="https://www.nps.gov/slbe/planyourvisit/beaches.htm" target="_blank" rel="noopener noreferrer">prohibits glass containers on park beaches</a>. Check posted alcohol rules, use appropriate non-glass picnic supplies, pack out everything and respect park access requirements. What we experienced is not a reason to ignore current rules.</p>
      </section>

      <section id="borrow" className="wine-trip-variations" aria-labelledby="trip-variations-title">
        <p className="wine-v5-kicker">Borrow the idea, not the exact schedule</p>
        <h2 id="trip-variations-title">Four ways to build a weekend of your own</h2>
        <p>These are suggested variations inspired by our real weekend, <strong>not four additional trips I claim to have taken</strong>. Use them as a starting shape and then check actual travel, hours and booking availability in the planners.</p>
        <div className="wine-trip-variation-grid">
          {variations.map((v,i)=><article className="wine-trip-variation" key={v.title}>
            <span className="wine-trip-variation-index">Idea {i+1}</span>
            <h3>{v.title}</h3>
            <p className="wine-trip-variation-for">{v.who}</p>
            <p>{v.plan}</p>
            <p className="wine-trip-caution"><strong>Don't overlook:</strong> {v.caution}</p>
            <Link href={v.href}>{v.link} →</Link>
          </article>)}
        </div>
      </section>

      <nav className="wine-trip-next" aria-label="Continue planning">
        <h2>Now build your own day</h2>
        <p>You do not have to repeat our stops. Tell the wine-day engine where you want to go, which wines matter to you, when you will arrive and how much time you really have.</p>
        <div className="wine-trip-actions">
          <Link href="/#wine-truth-title">Open the wine-day planner →</Link>
          <Link href="/leelanau-peninsula-wine-trail">Explore Leelanau by town →</Link>
          <Link href="/one-day-itineraries">See shorter day itineraries →</Link>
        </div>
      </nav>
      <AuthorNote context="Leelanau wine-weekend" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
    </main>
  );
}
