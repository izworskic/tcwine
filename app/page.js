"use client";
import dynamic from "next/dynamic";

const Planner = dynamic(() => import("@/components/Planner"), {
  ssr: false,
  loading: () => <div style={{ padding: 28 }}>Loading the map…</div>,
});

export default function Page() {
  return <Planner />;
}
