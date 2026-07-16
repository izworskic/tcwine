import Link from "next/link";
import venues from "@/data/venues.json";
import VenueHours from "@/components/VenueHours";

const CATS = ["brewery", "distillery", "cidery"];
const list = venues.filter((v) => v.area === "traverse-city" && CATS.includes(v.category));
const nb = list.filter((v) => v.category === "brewery").length;
const nd = list.filter((v) => v.category === "distillery").length;
const nc = list.filter((v) => v.category === "cidery").length;

export const metadata = {
  title: "Traverse City Breweries and Distilleries: The City Tasting Day",
  description:
    "The in-town tasting day for mixed groups: " + nb + " breweries, " + nd + " distilleries, and the city cideries, with what each pours, food on site, and verified hours.",
  alternates: { canonical: "/traverse-city-breweries-and-distilleries" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "Traverse City breweries and distilleries", item: "https://tcwine.chrisizworski.com/traverse-city-breweries-and-distilleries" },
  ],
};

const SECTIONS = [
  ["brewery", "Breweries"],
  ["distillery", "Distilleries"],
  ["cidery", "Cideries"],
];

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Traverse City Breweries and Distilleries</h1>
      <p>{"Not everyone in a group wants a wine day, and Traverse City itself is the answer: " + nb + " breweries, " + nd + " distilleries, and " + nc + " cideries in and around town, close enough together that nobody spends the day driving. This is the city tasting day for mixed groups."}</p>
      {SECTIONS.map(([cat, label]) => {
        const cl = list.filter((v) => v.category === cat);
        if (!cl.length) return null;
        return (
          <section key={cat}>
            <h2>{label + " (" + cl.length + ")"}</h2>
            <ul>
              {cl.map((v) => (
                <li key={v.id}>
                  <strong>{v.name}</strong>
                  {v.note ? ": " + v.note : ""}
                  {v.food ? " Food on site: " + v.food + "." : ""}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p>
        {"Mixing town stops with a peninsula? The "}
        <Link href="/one-day-itineraries">one-day itineraries</Link>
        {" include a city loop, and "}
        <Link href="/group-wine-tour-planning">group planning</Link>
        {" covers pacing and the designated-driver question."}
      </p>
      <VenueHours title="Traverse City hours" areas={["traverse-city"]} categories={CATS} />
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link>{" \u00b7 "}<Link href="/group-wine-tour-planning">Group planning</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
