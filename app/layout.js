import Script from "next/script";
import "./globals.css";
import WineAnalytics from "@/components/WineAnalytics";

const GA_MEASUREMENT_ID = "G-Y5D2V2W7HN";

export const metadata = {
  metadataBase: new URL("https://tcwine.chrisizworski.com"),
  title: "Traverse City Winery Map & Wine Tour Planner | 40 Wineries",
  description:
    "Interactive Traverse City winery map with 40 wineries across Old Mission, Leelanau, and Traverse City. Pick stops, route real roads, and check the day against tasting-room hours.",
  authors: [{ name: "Chris Izworski", url: "https://chrisizworski.com/chris-izworski/" }],
  creator: "Chris Izworski",
  publisher: "Chris Izworski",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://upload.wikimedia.org" />
        <link rel="author" href="https://chrisizworski.com/chris-izworski/" />
      </head>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="wine-analytics-queue" strategy="beforeInteractive">
          {`window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};`}
        </Script>
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
        <WineAnalytics />
        {children}
      </body>
    </html>
  );
}
