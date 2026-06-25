import "./globals.css";

export const metadata = {
  title: "Traverse City Wine Country: Plan a Tasting Loop",
  description:
    "Plan a routed, time-aware day across the wineries, cideries, breweries, and distilleries of Leelanau, Old Mission, and Traverse City, with beaches, hikes, and overlooks woven in.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
