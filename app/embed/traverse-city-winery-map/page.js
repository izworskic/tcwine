import PublisherMapMount from "@/components/PublisherMapMount";

export const metadata = {
  title: "Traverse City Winery Map Embed",
  robots: { index: false, follow: true },
};

export default function EmbedTraverseCityWineryMap() {
  return (
    <main className="publisher-embed-page">
      <PublisherMapMount />
    </main>
  );
}
