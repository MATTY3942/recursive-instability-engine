"use client";

import { useEffect, useState } from "react";
import SystemInsight from "@/components/SystemInsight";

function Gauge({ label, value, status }: any) {
  return (
    <div
      style={{
        flex: 1,
        padding: 20,
        background: "#111",
        borderRadius: 12,
        border: "1px solid #333",
        color: "white",
      }}
    >
      <h3>{label}</h3>
      <div style={{ fontSize: 32 }}>{value}%</div>
      <div style={{ color: status === "Critical" ? "red" : "lightgreen" }}>
        {status}
      </div>
    </div>
  );
}

export default function Page() {
  const [global, setGlobal] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/global")
      .then((res) => res.json())
      .then(setGlobal);

    fetch("http://127.0.0.1:8000/sectors")
      .then((res) => res.json())
      .then(setSectors);
  }, []);

  if (!global) return <div style={{ color: "white" }}>Loading...</div>;

  return (
    <div style={{ padding: 20, background: "#000", minHeight: "100vh" }}>
      <h1 style={{ color: "white" }}>Recursive Instability Engine</h1>

      {/* GLOBAL */}
      <div style={{ marginBottom: 20 }}>
        <Gauge label="Global" value={global.value} status={global.status} />
        <div style={{ color: "white", marginTop: 10 }}>
          State: {global.state} | Threshold: {global.threshold}
        </div>
      </div>

      {/* SECTORS */}
      <div style={{ display: "flex", gap: 10 }}>
        {sectors.map((s, i) => (
          <Gauge key={i} label={s.name} value={s.value} status={s.status} />
        ))}
      </div>

      {/* INSIGHT */}
      <SystemInsight />
    </div>
  );
}