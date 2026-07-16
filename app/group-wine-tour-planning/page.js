import Link from "next/link";
import venues from "@/data/venues.json";
import shuttle from "@/data/shuttle.json";

const GROUP_INTRO = "A few things make a tasting day go smoothly. Decide on a designated driver before you set out, or plan around one of the area shuttle services, since the loops cross open country roads. Most tasting rooms open late morning and close in the late afternoon or early evening, and hours shift with the season, so it is worth confirming with any room you are set on, especially in spring and late fall. Weekends in summer and during fall color are busy, and larger groups should call ahead for reservations. Build in a real meal rather than tasting on an empty stomach, and leave room for the views, which are a large part of why people come here.";
const dwells = venues.map((v) => v.dwellMinutes || 60).sort((a, b) => a - b);
const med = dwells[Math.floor(dwells.length / 2)];
const lo = dwells[0];
const hi = dwells[dwells.length - 1];
const digits = shuttle.phone.replace(/\D/g, "").slice(-10);
const PHONE_FMT = "(" + digits.slice(0, 3) + ") " + digits.slice(3, 6) + "-" + digits.slice(6);
const dogs = venues.filter((v) => v.dogFriendly).map((v) => v.name).sort();
const food = venues.filter((v) => v.food);

export const metadata = {
  title: "Group and Bachelorette Wine Tour Planning for Traverse City",
  description:
    "The logistics that make a group tasting day work: the designated-driver question, shuttle options, honest pacing math, reservations, and the dog-friendly rooms.",
  alternates: { canonical: "/group-wine-tour-planning" },
};

const CRUMBS = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://tcwine.chrisizworski.com" },
    { "@type": "ListItem", position: 2, name: "Group wine tour planning", item: "https://tcwine.chrisizworski.com/group-wine-tour-planning" },
  ],
};

export default function Page() {
  return (
    <main className="tc-page">
      <h1>Group and Bachelorette Planning</h1>
      <p>{GROUP_INTRO}</p>
      <h2>The driving question</h2>
      <p>
        {"If nobody in the group wants to skip tasting, book a shuttle. " + shuttle.name + " runs group tours in the area: "}
        <a href={"tel:" + shuttle.phone}>{PHONE_FMT}</a>
        {". Otherwise, decide on the designated driver before the day starts, not at the second stop."}
      </p>
      <h2>Pacing math</h2>
      <p>{"Across all " + venues.length + " venues, suggested tasting stops run from " + lo + " to " + hi + " minutes, with a typical stop around " + med + " minutes. With drives between rooms, four stops is a full, unhurried day for a group; five is pushing it. Larger groups move slower than they think."}</p>
      <h2>Reservations</h2>
      <p>
        {"Weekends in summer and during fall color are busy, and larger groups should call ahead. Hours shift with the season, so confirm with any room you are set on. Every venue\u2019s phone number is in the "}
        <Link href="/venues">hours directory</Link>
        {"."}
      </p>
      <h2>{"Bringing the dog (" + dogs.length + " rooms)"}</h2>
      <p>{dogs.join(", ") + "."}</p>
      <h2>{"Food on site (" + food.length + " venues)"}</h2>
      <p>{"Build in a real meal rather than tasting on an empty stomach. Rooms with food on site include " + food.slice(0, 10).map((v) => v.name + " (" + v.food + ")").join(", ") + ", with the rest in the directory."}</p>
      <nav className="morelinks">{"More guides: "}<Link href="/">Planner home</Link>{" \u00b7 "}<Link href="/venues">All tasting room hours</Link>{" \u00b7 "}<Link href="/one-day-itineraries">One-day itineraries</Link>{" \u00b7 "}<Link href="/traverse-city-breweries-and-distilleries">TC breweries and distilleries</Link></nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(CRUMBS) }} />
    </main>
  );
}
