import { notFound } from "next/navigation";
import PublisherMapMount from "@/components/PublisherMapMount";
import partners from "@/data/publisher-partners.json";

export const dynamicParams = false;

export function generateStaticParams() {
  return partners.map((partner) => ({ slug: partner.slug }));
}

export function generateMetadata({ params }) {
  const partner = partners.find((item) => item.slug === params.slug);
  return {
    title: partner ? `Traverse City Winery Map from ${partner.shortName}` : "Partner Winery Map",
    robots: { index: false, follow: true },
  };
}

export default function PartnerEmbedPage({ params }) {
  const partner = partners.find((item) => item.slug === params.slug);
  if (!partner) notFound();

  return (
    <main className="publisher-embed-page">
      <div className="publisher-partner-heading">
        <strong>Plan wine country from {partner.shortName}</strong>
        <span>Nearby winery/tasting-room locations, then open the full route planner.</span>
      </div>
      <PublisherMapMount partner={partner} nearbyCount={12} />
    </main>
  );
}
