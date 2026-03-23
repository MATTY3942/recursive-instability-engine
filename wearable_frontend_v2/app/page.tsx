"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [userA, setUserA] = useState<any[]>([]);
  const [userB, setUserB] = useState<any[]>([]);
  const [simA, setSimA] = useState<any[]>([]);
  const [simB, setSimB] = useState<any[]>([]);
  const [shock, setShock] = useState(0);

  useEffect(() => {
    fetch("http://127.0.0.1:8010/users/A")
      .then((r) => r.json())
      .then(setUserA);

    fetch("http://127.0.0.1:8010/users/B")
      .then((r) => r.json())
      .then(setUserB);
  }, []);

  const runSimulation = () => {
    const simulate = (data: any[]) =>
      data.map((d, i) => ({
        entropy: Math.max(0, Math.min(1, d.entropy - shock * 0.01 * i)),
      }));

    setSimA(simulate(userA));
    setSimB(simulate(userB));
  };

  function analyze(data: any[]) {
    if (data.length < 3) return { velocity: 0, trend: "N/A", ttd: null };

    const s1 = data[data.length - 1].entropy;
    const s2 = data[data.length - 2].entropy;
    const s3 = data[data.length - 3].entropy;

    const velocity = 0.7 * (s1 - s2) + 0.3 * (s2 - s3);

    let trend = "Stable";
    let ttd: any = null;

    if (velocity < -0.002) {
      trend = "⚠️ Pre-decline detected";

      const critical = 0.1;

      if (s1 > critical) {
        const gap = s1 - critical;
        ttd = Math.abs(gap / velocity).toFixed(1);
      } else {
        trend = "Critical";
        ttd = "Immediate";
      }
    }

    return { velocity, trend, ttd };
  }

  const a = analyze(userA);
  const b = analyze(userB);

  // SVG chart helpers
  const width = 700;
  const height = 300;

  const scaleX = (i: number, len: number) =>
    len > 1 ? (i / (len - 1)) * width : 0;

  const scaleY = (v: number) => height - v * height;

  const path = (data: any[]) =>
    data.length > 0
      ? data
          .map((d, i) => {
            const x = scaleX(i, data.length);
            const y = scaleY(d.entropy);
            return `${i === 0 ? "M" : "L"} ${x} ${y}`;
          })
          .join(" ")
      : "";

  return (
    <div style={{ padding: 40, background: "#0a0a0a", color: "white", minHeight: "100vh" }}>
      <h1>Wearable Entropy Engine — Predictive View</h1>

      {/* CHART */}
      <svg width={width} height={height} style={{ background: "#111", marginTop: 20 }}>
        {/* real */}
        <path d={path(userA)} stroke="#00ff88" fill="none" strokeWidth="2" />
        <path d={path(userB)} stroke="#ff4444" fill="none" strokeWidth="2" />

        {/* simulation */}
        <path d={path(simA)} stroke="#00ff88" strokeDasharray="5 5" fill="none" />
        <path d={path(simB)} stroke="#ff4444" strokeDasharray="5 5" fill="none" />
      </svg>

      <div style={{ marginTop: 10 }}>
        <span style={{ color: "#00ff88" }}>User A (Improving)</span> |{" "}
        <span style={{ color: "#ff4444" }}>User B (Declining)</span> | Dashed = Simulation
      </div>

      {/* SIMULATION */}
      <div style={{ marginTop: 30 }}>
        <h3>Shock Simulation</h3>
        <div>Shock Level: {shock}</div>

        <input
          type="range"
          min="0"
          max="10"
          value={shock}
          onChange={(e) => setShock(Number(e.target.value))}
        />

        <br />

        <button onClick={runSimulation} style={{ marginTop: 10 }}>
          Run Simulation
        </button>
      </div>

      {/* CURRENT STATE */}
      <div style={{ marginTop: 30 }}>
        <h3>Latest State</h3>
        <div>
          <b>User A:</b>{" "}
          {userA[userA.length - 1]?.entropy?.toFixed(3)} —{" "}
          {userA[userA.length - 1]?.state}
        </div>
        <div>
          <b>User B:</b>{" "}
          {userB[userB.length - 1]?.entropy?.toFixed(3)} —{" "}
          {userB[userB.length - 1]?.state}
        </div>
      </div>

      {/* PREDICTIVE */}
      <div style={{ marginTop: 30 }}>
        <h3>Predictive Signals</h3>

        <div>
          <b>User A:</b><br />
          Velocity: {a.velocity.toFixed(4)}<br />
          Trend: {a.trend}<br />
          Time to Decline: {a.ttd ? `${a.ttd} days` : "No decline trajectory"}
        </div>

        <br />

        <div>
          <b>User B:</b><br />
          Velocity: {b.velocity.toFixed(4)}<br />
          Trend: {b.trend}<br />
          Time to Decline: {b.ttd ? `${b.ttd} days` : "No decline trajectory"}
        </div>
      </div>
    </div>
  );
}