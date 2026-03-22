"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmt = (n: number) => n?.toFixed(4);

export default function Home() {
  const [global, setGlobal] = useState<any>(null);
  const [sectors, setSectors] = useState<any[]>([]);
  const [systemic, setSystemic] = useState<any>(null);
  const [live, setLive] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [simulation, setSimulation] = useState<any>(null);

  const [vixShock, setVixShock] = useState(0);
  const [rateShock, setRateShock] = useState(0);
  const [sectorShock, setSectorShock] = useState(0);

  const load = async () => {
    const [s, g, sec, l, h] = await Promise.all([
      fetch("http://localhost:8000/systemic").then(r => r.json()),
      fetch("http://localhost:8000/global").then(r => r.json()),
      fetch("http://localhost:8000/sectors").then(r => r.json()),
      fetch("http://localhost:8000/live_history").then(r => r.json()),
      fetch("http://localhost:8000/history").then(r => r.json()),
    ]);

    setSystemic(s);
    setGlobal(g);
    setSectors(sec);
    setLive(l);
    setHistory(h);
  };

  const runSimulation = async () => {
    const url = `http://localhost:8000/simulate?vix_shock=${vixShock}&rate_shock=${rateShock}&sector_shock=${sectorShock}`;
    const result = await fetch(url).then(r => r.json());
    setSimulation(result);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  const liveWindow = useMemo(() => live.slice(-30), [live]);

  if (!global || !systemic) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 20, background: "#0a0a0a", color: "white", minHeight: "100vh" }}>
      <h1>Recursive Instability Engine — V2</h1>

      {/* SUMMARY */}
      <div style={{ marginTop: 20, padding: 15, background: "#111", borderRadius: 8 }}>
        <div><b>Status:</b> {systemic.status}</div>
        <div><b>Instability:</b> {fmt(systemic.state)} / {fmt(systemic.threshold)}</div>
        <div><b>Trend:</b> {systemic.trend}</div>
        <div><b>Risk:</b> {systemic.latent?.level}</div>
      </div>

      {/* GLOBAL */}
      <h3>Global</h3>
      <div>
        {global.value}% — {global.status}<br />
        State: {fmt(global.state)} | Threshold: {fmt(global.threshold)}
      </div>

      {/* SECTORS */}
      <h3>Sectors</h3>
      {sectors.map((s) => (
        <div key={s.name}>
          {s.name} — {s.value}% ({s.status}) | state {fmt(s.state)}
        </div>
      ))}

      {/* SYSTEMIC */}
      <h3>🚨 {systemic.status}</h3>
      <div>
        State: {fmt(systemic.state)} / {fmt(systemic.threshold)}<br />
        Velocity: {fmt(systemic.velocity)}<br />
        Acceleration: {fmt(systemic.acceleration)}<br />
        Time Signal: {systemic.time_signal}<br />
        2008 Comparison: {systemic.comparison_2008}
      </div>

      {/* LIVE CHART */}
      <h3 style={{ marginTop: 30 }}>Live Instability</h3>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={liveWindow}>
            <CartesianGrid stroke="#333" />
            <XAxis tick={false} />

            <YAxis
              domain={[
                systemic.threshold * 0.9,
                systemic.threshold * 1.1,
              ]}
            />

            <Tooltip formatter={(v: any) => Number(v).toFixed(4)} />

            <ReferenceLine
              y={systemic.threshold}
              stroke="red"
              strokeDasharray="4 4"
              label={{ value: "Threshold", fill: "red" }}
            />

            <ReferenceLine
              y={systemic.state}
              stroke="#22c55e"
              label={{ value: "Current", fill: "#22c55e" }}
            />

            <Line
              type="monotone"
              dataKey="state"
              stroke="#00ffcc"
              strokeWidth={3}
              dot={false}
            />

            {simulation && (
              <Line
                type="monotone"
                data={liveWindow.map(d => ({
                  ...d,
                  sim: simulation.state,
                }))}
                dataKey="sim"
                stroke="#a855f7"
                strokeWidth={3}
                strokeDasharray="6 4"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* HISTORICAL CHART */}
      <h3 style={{ marginTop: 30 }}>Historical (2008)</h3>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <LineChart data={history}>
            <CartesianGrid stroke="#333" />

            <XAxis
              dataKey="date"
              interval={0}
              angle={-30}
              textAnchor="end"
              height={60}
            />

            <YAxis
              domain={[0, 0.12]}
              ticks={[0, 0.03, 0.05, 0.07, 0.1]}
              tickFormatter={(v) => Number(v).toFixed(2)}
            />

            <Tooltip formatter={(v: any) => Number(v).toFixed(4)} />

            <ReferenceLine
              y={0.03}
              stroke="red"
              strokeDasharray="4 4"
              label={{ value: "Boundary", fill: "red" }}
            />

            {/* 🔥 STABLE EVENT LABELS */}
            {history.map((d, i) =>
              d.event ? (
                <ReferenceDot
                  key={i}
                  x={d.date}
                  y={d.state}
                  r={4}
                  fill="#f59e0b"
                  label={{
                    value: d.event,
                    position: "top",
                    fill: "#f59e0b",
                    fontSize: 10,
                  }}
                />
              ) : null
            )}

            <Line
              type="monotone"
              dataKey="state"
              stroke="#ff4d4d"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* SIMULATION */}
      <h2 style={{ marginTop: 36 }}>Shock Simulation</h2>

      <div style={{ background: "#111", padding: 15, borderRadius: 8 }}>
        <div>
          VIX Shock: {vixShock}
          <input type="range" min="-5" max="10" value={vixShock} onChange={e => setVixShock(Number(e.target.value))} />
        </div>

        <div>
          Rate Shock: {rateShock}
          <input type="range" min="-5" max="10" value={rateShock} onChange={e => setRateShock(Number(e.target.value))} />
        </div>

        <div>
          Sector Shock: {sectorShock}
          <input type="range" min="-5" max="10" value={sectorShock} onChange={e => setSectorShock(Number(e.target.value))} />
        </div>

        <button onClick={runSimulation} style={{ marginTop: 10 }}>
          Run Simulation
        </button>

        {simulation && (
          <div style={{ marginTop: 15 }}>
            <div>Simulated Status: {simulation.status}</div>
            <div>State: {fmt(simulation.state)}</div>
            <div>Trend: {simulation.trend}</div>
            <div>2008 Comparison: {simulation.comparison_2008}</div>
          </div>
        )}
      </div>
    </div>
  );
}