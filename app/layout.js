import Script from "next/script";
import "./globals.css";
import WineAnalytics from "@/components/WineAnalytics";

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
      </head>
      <body>
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
