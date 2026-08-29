import Link from "next/link";
import WineJournalDashboard from "@/components/WineJournalDashboard";
import AuthorNote from "@/components/AuthorNote";

export const metadata={
  title:"My Traverse City Wine Journal: Wineries, Notes & Favorites",
  description:"Keep an on-device Traverse City wine journal for Leelanau and Old Mission wineries: visited stops, wines to remember, favorites, and wineries you still want to taste.",
  alternates:{canonical:"/my-wine-journal"}
};

export default function Page(){
  return (
    <main className="tc-page">
      <h1>My Traverse City Wine Journal</h1>
      <p className="search-lede">
        Wine country is more useful when the planner remembers what mattered to you. Keep a lightweight list of wineries
        you want to taste, places you visited, bottles or pours you want to remember, and favorites worth returning to.
      </p>
      <WineJournalDashboard />
      <h2>Plan the next tasting day from what you learned</h2>
      <p>
        Use your notes as the starting point, then return to the <Link href="/">Wine Country Truth Engine</Link>,
        compare two candidates in the <Link href="/compare-wineries">winery comparator</Link>, or browse by{" "}
        <Link href="/wine/riesling">Riesling</Link>, <Link href="/wine/sparkling">sparkling</Link>,{" "}
        <Link href="/wine/reds">reds</Link>, and <Link href="/wine/whites">white wines</Link>.
      </p>
      <AuthorNote context="Traverse City wine journal" />
    </main>
  );
}
