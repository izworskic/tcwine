"use client";

import dynamic from "next/dynamic";

const PublisherMap = dynamic(() => import("@/components/PublisherMap"), {
  ssr: false,
  loading: () => (
    <div className="publisher-map publisher-map-loading">
      <div className="publisher-map-loading-copy">
        <strong>Traverse City Winery Map</strong>
        <span>43 mapped winery/tasting-room locations</span>
      </div>
    </div>
  ),
});

export default function PublisherMapMount(props) {
  return <PublisherMap {...props} />;
}
