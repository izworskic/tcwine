import { ImageResponse } from "next/og";

export const alt = "Traverse City winery map with 40 wineries and route planner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 82px",
          color: "#fffdf8",
          background: "linear-gradient(135deg, #2f1026 0%, #6b1f3f 58%, #b56a3b 100%)",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#f3d9b1" }}>
          Northern Michigan · built by Chris Izworski
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", maxWidth: 1000, fontSize: 72, fontWeight: 700, lineHeight: 1.02 }}>
            Traverse City Winery Map
          </div>
          <div style={{ display: "flex", maxWidth: 940, fontSize: 34, lineHeight: 1.25, color: "#fff2df" }}>
            40 wineries · Old Mission + Leelanau · real-road route planner
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 25, color: "#f3d9b1" }}>
          tcwine.chrisizworski.com
        </div>
      </div>
    ),
    size
  );
}
