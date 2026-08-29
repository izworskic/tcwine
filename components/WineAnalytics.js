"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackWineEvent, WINE_LANDING_KEYS } from "@/lib/wine-analytics";

export default function WineAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    const landing =
      WINE_LANDING_KEYS[pathname] ??
      (pathname.startsWith("/winery/") ? "winery_detail" :
       pathname.startsWith("/events/") ? "wine_event_detail" :
       "other");
    trackWineEvent("wine_landing_viewed", { landing });
  }, [pathname]);

  return null;
}
