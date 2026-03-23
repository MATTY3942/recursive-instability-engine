"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function Home() {
  const [userA, setUserA] = useState<any[]>([]);
  const [userB, setUserB] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8010/users/A")
      .then((r) => r.json())
      .then(setUserA);

    fetch("http://127.0.0.1:8010/users/B")
      .then((r) => r.json())
      .then(setUserB);
  }, []);

  const merged = userA.map((a, i) => ({
    date: a.date.slice(5),
    A: a.entropy,
    B: userB[i]?.entropy ?? null,
  }));

  // --- METRICS ---
  const velocity = (data: any[]) => {
    if (data.length < 2) return 0;
    return (data.at(-1).entropy - data.at(-2).entropy).toFixed(4);
  };

  const earlyWarning = (data: any[]) => {
    if (data.length < 5) return "Insufficient data";
    const recent = data.slice(-5);
    const declining = recent.every(
      (d, i) => i === 0 || d.entropy < recent[i - 1].entropy
    );
    return declining ? "⚠️ Pre-decline detected" : "Stable";
  };

  const timeToFailure = (data: any[]) => {
    if (data.length < 2) return "N/A";
    const v = data.at(-1).entropy - data.at(-2).entropy;
    if (v >= 0) return "No decline trajectory";
    const current = data.at(-1).entropy;
    const threshold = 0.1;
    const days = (current - threshold) / Math.abs(v);
    return days.toFixed(1) + " days";
  };

  return (
    <div style={{ padding: 20, background: "#0a0a0a", color: "white", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, marginBottom: 20 }}>
        Wearable Entropy Engine — Predictive View
      </h1>

      {/* CHART */}
      <div style={{ marginBottom: 40 }}>
        <h2>User Trajectories</h2>

        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={merged}>
              <CartesianGrid stroke="#333" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Legend />

              {/* ZONES */}
              <ReferenceLine y={0.4} stroke="#00ff88" label="Adaptive" />
              <ReferenceLine y={0.25} stroke="#ffaa00" label="Neutral" />
              <ReferenceLine y={0.1} stroke="#ff4444" label="Decline" />

              <Line
                type="monotone"
                dataKey="A"
                name="User A (Improving)"
                stroke="#00ff88"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="B"
                name="User B (Declining)"
                stroke="#ff4444"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* METRICS */}
      <div style={{ display: "flex", gap: 40 }}>
        <div style={{ background: "#111", padding: 20, borderRadius: 10 }}>
          <h3>User A</h3>
          <p>Entropy: {userA.at(-1)?.entropy}</p>
          <p>Status: {userA.at(-1)?.state}</p>
          <p>Velocity: {velocity(userA)}</p>
          <p>Trend: {earlyWarning(userA)}</p>
          <p>Time to Decline: {timeToFailure(userA)}</p>
        </div>

        <div style={{ background: "#111", padding: 20, borderRadius: 10 }}>
          <h3>User B</h3>
          <p>Entropy: {userB.at(-1)?.entropy}</p>
          <p>Status: {userB.at(-1)?.state}</p>
          <p>Velocity: {velocity(userB)}</p>
          <p>Trend: {earlyWarning(userB)}</p>
          <p>Time to Decline: {timeToFailure(userB)}</p>
        </div>
      </div>
    </div>
  );
}