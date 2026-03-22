"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function Home() {
  const [systemic, setSystemic] = useState<any>(null);
  const [global, setGlobal] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [liveHistory, setLiveHistory] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const load = () => {
    fetch("http://127.0.0.1:8000/systemic").then(r => r.json()).then(setSystemic);
    fetch("http://127.0.0.1:8000/global").then(r => r.json()).then(setGlobal);
    fetch("http://127.0.0.1:8000/sectors").then(r => r.json()).then(setSectors);
    fetch("http://127.0.0.1:8000/live_history").then(r => r.json()).then(setLiveHistory);
    fetch("http://127.0.0.1:8000/history").then(r => r.json()).then(setHistory);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!systemic || !global) return <div>Loading...</div>;

  const color =
    systemic.status === "Systemic Crisis"
      ? "#ef4444"
      : systemic.status === "Shock Acceleration"
      ? "#dc2626"
      : systemic.status === "Pre-Crisis Warning"
      ? "#f59e0b"
      : "#22c55e";

  return (
    <main style={{ padding: 20, background: "#030712", color: "white" }}>
      <h1 style={{ fontSize: 32 }}>Recursive Instability Engine</h1>

      {/* ALERT */}
      <div style={{ marginTop: 20, padding: 15, borderRadius: 10, background: color }}>
        🚨 {systemic.status}
      </div>

      {/* SYSTEMIC */}
      <h2 style={{ marginTop: 20 }}>Systemic Risk</h2>

      <div style={{ fontSize: 30 }}>
        {systemic.value}% — {systemic.status}
      </div>

      <div>State: {systemic.state}</div>
      <div>Threshold: {systemic.threshold}</div>

      <div>⚡ Velocity: {systemic.velocity}</div>
      <div>🚀 Acceleration: {systemic.acceleration}</div>
      <div>⏱ Time to Threshold: {systemic.time_to_threshold ?? "N/A"}</div>

      {/* LIVE */}
      <h2 style={{ marginTop: 30 }}>Live Systemic Trend</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={liveHistory}>
            <CartesianGrid stroke="#1f2937" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={0.05} stroke="#f59e0b" />
            <Line type="monotone" dataKey="state" stroke={color} strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* GLOBAL */}
      <h2 style={{ marginTop: 30 }}>Global</h2>
      <div>{global.value}% — {global.status}</div>
      <div>VIX: {global.vix}</div>

      {/* SECTORS */}
      <h2 style={{ marginTop: 30 }}>Sectors</h2>
      <div style={{ display: "flex", gap: 20 }}>
        {sectors.map(s => (
          <div key={s.name}>
            <strong>{s.name}</strong>
            <div>{s.value}%</div>
            <div>{s.status}</div>
          </div>
        ))}
      </div>

      {/* HISTORICAL */}
      <h2 style={{ marginTop: 40 }}>Historical Crisis Reference</h2>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid stroke="#1f2937" />
            <XAxis dataKey="date" angle={-30} textAnchor="end" interval="preserveStartEnd" />
            <YAxis />
            <Tooltip />

            <ReferenceLine y={0.03} stroke="#f59e0b" strokeDasharray="4 4" />

            <ReferenceLine x="2007-08" stroke="#8884d8" label="Stress" />
            <ReferenceLine x="2008-03" stroke="#ef4444" label="Bear" />
            <ReferenceLine x="2008-09" stroke="#dc2626" label="Lehman" />
            <ReferenceLine x="2008-10" stroke="#991b1b" label="Panic" />

            <Line type="monotone" dataKey="state" stroke="#60a5fa" strokeWidth={3} />
            <Line type="monotone" dataKey="threshold" stroke="#f59e0b" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
}