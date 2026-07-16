"use client";
import dynamic from "next/dynamic";

const Planner = dynamic(() => import("@/components/Planner"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", padding: 28 }}>Loading the map…</div>,
});

export default function PlannerMount() {
  return (
    <div className="planner-shell">
      <Planner />
    </div>
  );
}
