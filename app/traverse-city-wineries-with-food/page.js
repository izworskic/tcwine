import Link from "next/link";
import venues from "@/data/venues.json";
import FoodDayDecision from "@/components/FoodDayDecision";
import AuthorNote from "@/components/AuthorNote";
import foodEvidence from "@/data/food-offerings.json";

const wineries = venues
  .filter((v) => v.category === "winery" && v.food)
  .sort((a, b) => {
    const rank = (value) => /restaurant|bistro|kitchen|pizza|raclette/i.test(value || "") ? 0 : 1;
    return rank(a.food) - rank(b.food) || (b.rating || 0) - (a.rating || 0) || a.name.localeCompare(b.name);
  });

const reviewedIds = new Set(foodEvidence.locations.map((item) => item.venueId).filter(Boolean));
const awaitingReview = wineries.filter((item) => !reviewedIds.has(item.id));
const BASE = "https://tcwine.chrisizworski.com";

export const metadata = {
  title: "Traverse City Wineries With Food: Lunch Map & Planner",
  description:
    "Where can you eat lunch at a Traverse City winery? Check source-backed Old Mission menus, choose a date and plan a 3–4 hour wine day with road-routing checks.",
  alternates: { canonical: "/traverse-city-wineries-with-food" },
};

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BASE + "/traverse-city-wineries-with-food/#page",
      url: BASE + "/traverse-city-wineries-with-food",
      name: "Traverse City Wineries With Food",
      author: { "@id": "https://chrisizworski.com/#person" },
      isPartOf: { "@id": BASE + "/#site" },
      about: { "@type": "Thing", name: "Traverse City wineries with food" },
    },
    {
      "@type": "ItemList",
      name: "Traverse City winery directory entries with historic food tags; service not all verified",
      numberOfItems: wineries.length,
      itemListElement: wineries.map((v, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: v.name,
      })),
    },
  ],
};

export default function Page() {
  return (
    <main className="tc-page wine-food-page">
      <h1>Traverse City Wineries With Food: Plan a Real Lunch</h1>
      <p className="search-lede">
        Choose a lunch date, time and party size. The meal-first engine protects time to actually eat, checks the published food evidence, and builds a practical Old Mission route. The broader directory still needs individual food-service verification.
      </p>
      <section className="wine-search-arrival" aria-label="Winery lunch planning">
        <h2>Can you eat lunch at a Traverse City winery?</h2>
        <p><strong>Yes, at some wineries, but not necessarily on the day you want.</strong> Brys Estate lists substantial seated-service food, while Bonobo and Chateau Chantal document small plates. Food-serving hours are not interchangeable with winery opening hours. Official webpages can disagree; a full lunch is never considered confirmed solely because a winery has food listed.</p>
        <p>We enjoyed a pairing at <Link href="/winery/bonobo">Bonobo</Link> on our own October trip but ordered a separate pizza for sunset. <Link href="/leelanau-wine-weekend">See what a well-paced food-and-wine weekend looks like</Link>.</p>
        <nav className="wine-search-actions" aria-label="Plan a winery meal">
          <Link href="/old-mission-peninsula-wineries">Old Mission wineries</Link>
          <Link href="/leelanau-peninsula-wine-trail">Leelanau wineries</Link>
          <Link href="/one-day-itineraries">Wine day itineraries</Link>
        </nav>
      </section>
      <FoodDayDecision />
      <section className="wine-food-questions" aria-label="Answers to common winery lunch questions">
        <h2>Can you actually eat lunch at a Traverse City winery?</h2>
        <p><strong>Yes, but food offerings are not equivalent.</strong> Brys Estate publishes sandwiches and salads as part of its seated tasting-room experience. Its winery opening hours alone cannot confirm kitchen service or a table; <a href="https://brysestate.com/visit_tastingroom/" rel="noopener noreferrer" target="_blank">check Brys' official information</a> before committing.</p>
        <h3>Does Bonobo Winery serve a full lunch?</h3>
        <p>Bonobo publishes seasonal small plates, not a guaranteed full lunch. Its listed kitchen begins at 1 p.m. Monday through Thursday; season and availability still need confirmation. <a href="https://www.bonobowinery.com/faq" rel="noopener noreferrer" target="_blank">Read the official Bonobo kitchen FAQ</a>.</p>
        <h3>How many wineries fit in three or four hours with lunch?</h3>
        <p>Plan around a protected 75-minute meal and at most one additional tasting. A route might fit fewer wineries than a tasting-only afternoon. Our planner checks actual road-leg estimates once you enter a date and starting time, and rejects a route that overruns your window.</p>
        <h3>What if the winery only serves snacks?</h3>
        <p>The planner can pair a separate restaurant lunch with a wine tasting if the published information and timing support it. You can also require an on-site winery meal. Operator hours can conflict; no meal, reservation or kitchen-service availability is presented as confirmed without appropriate evidence.</p>
      </section>
      <section className="wine-food-source-audit" aria-label="Source-checked wine and meal options">
        <h2>What the actual menus support</h2>
        <p>Operator sources reviewed {foodEvidence.reviewedAt}. These are researched meal types, not confirmed kitchen service or available reservations.</p>
        <ul>
          {foodEvidence.locations.map((location) => (
            <li key={location.locationId}>
              <strong>{location.venueId
                ? <Link href={"/winery/" + location.venueId}>{location.name}</Link>
                : location.name}</strong>
              <span>{location.kind === "winery" ? "Winery" : "Separate dining stop"}</span>
              {location.services.map((service) => (
                <p key={service.serviceId}>
                  <b>{service.mealType === "SUBSTANTIAL" || service.mealType === "FULL_MEAL" ? "Substantial meal documented" : service.mealType === "SMALL_PLATES" ? "Small plates, not proven lunch" : service.mealType === "PAIRING" ? "Reserved pairing, full meal unverified" : "Snacks only"}</b>.
                  {" "}{service.note}{" "}
                  <a href={service.sourceUrl} target="_blank" rel="noopener noreferrer">Official food information ↗</a>
                </p>
              ))}
            </li>
          ))}
        </ul>
        <p><strong>Old Mission lunch warning:</strong> Jolly Pumpkin and Peninsula Grill have conflicting posted weekday hours. Confirm directly before traveling; the map does not check live tables or bookings.</p>
      </section>
      <h2>Additional wineries with food mentioned in the directory</h2>
      <p>The entries below still need their menus, kitchens, dates and food types checked at the operator source. Their older food tags are <strong>not verified full-lunch recommendations</strong>.</p>
      <ul>
        {awaitingReview.map((v) => (
          <li key={v.id}>
            <strong><Link href={"/winery/" + v.id}>{v.name}</Link></strong> ({v.town}).
            Directory label: {v.food}. Check directly before depending on a meal.
          </li>
        ))}
      </ul>
      <p>
        For a peninsula-first plan, open the <Link href="/old-mission-peninsula-wineries">Old Mission winery map</Link>
        {" or the "}<Link href="/leelanau-peninsula-wine-trail">Leelanau winery map</Link>.
      </p>
      <AuthorNote context="Traverse City winery and food planning" />
      <nav className="morelinks">
        More guides: <Link href="/">Winery map</Link>{" · "}
        <Link href="/best-traverse-city-wineries-with-views">Best winery views</Link>{" · "}
        <Link href="/old-mission-vs-leelanau-wineries">Old Mission vs. Leelanau</Link>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(GRAPH) }} />
    </main>
  );
}
