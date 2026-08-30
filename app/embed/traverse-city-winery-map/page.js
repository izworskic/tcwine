import PublisherMap from "@/components/PublisherMap";

export const metadata = {
  title: "Traverse City Winery Map Embed",
  robots: { index: false, follow: true },
};

export default function EmbedTraverseCityWineryMap() {
  return (
    <main className="publisher-embed-page">
      <PublisherMap />
    </main>
  );
}
