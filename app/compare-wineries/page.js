import Link from "next/link";
import WineryCompare from "@/components/WineryCompare";
import AuthorNote from "@/components/AuthorNote";

const BASE="https://tcwine.chrisizworski.com";
export const metadata={
  title:"Compare Traverse City Wineries: Old Mission & Leelanau",
  description:"Compare Traverse City wineries side by side by wine styles, wine-day fit, setting, food, hours, and official trail membership before building your route.",
  alternates:{canonical:"/compare-wineries"},
  openGraph:{
    title:"Compare Traverse City Wineries",
    description:"Side-by-side winery comparison for Old Mission, Leelanau, and Traverse City wine country.",
    url:BASE+"/compare-wineries",
    type:"website"
  }
};

export default function Page(){
  return (
    <main className="tc-page">
      <h1>Compare Traverse City Wineries</h1>
      <p className="search-lede">
        Two wineries can both be excellent stops and still be wrong for the same person. Compare wine styles,
        tasting character, food, setting, hours, and Wine Day Fit before you commit the drive.
      </p>
      <WineryCompare />
      <h2>Use comparison to build a better wine day</h2>
      <p>
        Start with the wine you care about, compare two likely stops, then return to the{" "}
        <Link href="/">Wine Country Truth Engine</Link> to build a three-winery day around the stronger fit.
        For style-first discovery, use the <Link href="/wine/riesling">Riesling</Link>,{" "}
        <Link href="/wine/sparkling">sparkling</Link>, <Link href="/wine/reds">red-wine</Link>, and{" "}
        <Link href="/wine/whites">white-wine</Link> guides.
      </p>
      <AuthorNote context="Traverse City winery comparison" />
    </main>
  );
}
