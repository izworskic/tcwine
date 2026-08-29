"use client";
import dynamic from "next/dynamic";

const Planner = dynamic(() => import("@/components/Planner"), {
  ssr: false,
  loading: () => <div style={{ minHeight: "100vh", padding: 28 }}>Loading the map…</div>,
});

export default function PlannerMount(props) {
  const embedded = Boolean(props?.embedded);
  return (
    <div className={embedded ? "planner-shell planner-shell-embedded" : "planner-shell"}>
      <Planner {...props} />
    </div>
  );
}
