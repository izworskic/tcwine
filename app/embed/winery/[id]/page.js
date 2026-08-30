import { notFound } from "next/navigation";
import PublisherMapMount from "@/components/PublisherMapMount";
import venues from "@/data/venues.json";

const wineries = venues.filter((v) => v.category === "winery");
export const dynamicParams = false;

export function generateStaticParams() {
  return wineries.map((winery) => ({ id: winery.id }));
}

export function generateMetadata({ params }) {
  const winery = wineries.find((item) => item.id === params.id);
  return {
    title: winery ? `Wineries Near ${winery.name} Map` : "Nearby Winery Map",
    robots: { index: false, follow: true },
  };
}

export default function WineryEmbedPage({ params }) {
  const winery = wineries.find((item) => item.id === params.id);
  if (!winery) notFound();

  return (
    <main className="publisher-embed-page">
      <div className="publisher-partner-heading">
        <strong>{winery.name} + nearby wineries</strong>
        <span>Use this mini map to orient visitors, then open the full route planner.</span>
      </div>
      <PublisherMapMount focusId={winery.id} nearbyCount={9} />
    </main>
  );
}
