import Link from "next/link";
import venues from "@/data/venues.json";
import PlannerMount from "@/components/PlannerMount";
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
  title: "Traverse City Wineries With Food: Lunch, Pizza & Map",
  description:
    "Map Traverse City-area wineries with food on site, from kitchens and pizza to bistro meals and tasting snacks, then route a realistic wine day around current hours.",
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
      name: "Traverse City-area wineries with food on site",
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
      <h1>Traverse City Wineries With Food: Map & Meal Facts</h1>
      <p className="search-lede">
        The map has {wineries.length} wineries whose older directory records mention food, but those labels are not confirmations of a full lunch. V7 is auditing each menu and kitchen schedule separately; the source-checked Old Mission examples appear below.
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
      <PlannerMount
        embedded
        preset={{ beverages: ["wine"], selected: [], origin: "Traverse City", analyticsContext: "wineries_food" }}
        title="Wineries With Food: Interactive Map"
        description="Choose your own winery stops. The unobstructed map sits above the route controls; it does not preselect five locations merely because they have food tags."
      />
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
