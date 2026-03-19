"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// --------------------
// DATA
// --------------------
const data = [
  { date: "2007-07-01", state: 0.02, threshold: 0.03 },
  { date: "2007-08-09", state: 0.05, threshold: 0.03 },
  { date: "2007-10-01", state: 0.035, threshold: 0.03 },
  { date: "2008-01-01", state: 0.04, threshold: 0.03 },
  { date: "2008-03-16", state: 0.06, threshold: 0.03 },
  { date: "2008-06-01", state: 0.03, threshold: 0.03 },
  { date: "2008-09-15", state: 0.09, threshold: 0.03 },
  { date: "2008-10-10", state: 0.08, threshold: 0.03 },
  { date: "2008-12-01", state: 0.07, threshold: 0.03 },
];

// --------------------
// EVENTS
// --------------------
const events = [
  { date: "2007-08-09", label: "Credit Stress" },
  { date: "2008-03-16", label: "Bear Stearns" },
  { date: "2008-09-15", label: "Lehman Collapse" },
  { date: "2008-10-10", label: "Global Panic" },
];

// --------------------
// COMPONENT
// --------------------
export default function Home() {
  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      
      {/* TITLE */}
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Recursive Instability Engine
      </h1>

      {/* -------------------- */}
      {/* GAUGES */}
      {/* -------------------- */}
      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 30,
          marginBottom: 40,
        }}
      >
        <div>
          <h3>Global</h3>
          <p style={{ fontSize: 36, fontWeight: "bold" }}>71%</p>
          <p style={{ color: "red" }}>Critical</p>
          <p>State: 0.0244</p>
          <p>Threshold: 0.0343</p>
        </div>

        <div>
          <h3>Semiconductors</h3>
          <p style={{ fontSize: 32 }}>100%</p>
          <p style={{ color: "red" }}>Critical</p>
        </div>

        <div>
          <h3>Crypto</h3>
          <p style={{ fontSize: 32 }}>12.7%</p>
          <p style={{ color: "green" }}>Calm</p>
        </div>

        <div>
          <h3>Megacap</h3>
          <p style={{ fontSize: 32 }}>100%</p>
          <p style={{ color: "red" }}>Critical</p>
        </div>
      </div>

      {/* -------------------- */}
      {/* CHART */}
      {/* -------------------- */}
      <h2 style={{ marginBottom: 10 }}>Historical Instability</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          {/* 🔴 INSTABILITY BREACH SHADING */}
          {data.map((d, i) =>
            d.state > d.threshold ? (
              <ReferenceLine
                key={`breach-${i}`}
                x={d.date}
                stroke="rgba(255,0,0,0.15)"
                strokeWidth={12}
              />
            ) : null
          )}

          {/* STATE */}
          <Line
            type="monotone"
            dataKey="state"
            stroke="#2563eb"
            strokeWidth={3}
          />

          {/* THRESHOLD */}
          <Line
            type="monotone"
            dataKey="threshold"
            stroke="#dc2626"
            strokeWidth={2}
          />

          {/* EVENTS */}
          {events.map((event, index) => (
            <ReferenceLine
              key={`event-${index}`}
              x={event.date}
              stroke="red"
              strokeDasharray="3 3"
              label={{
                value: event.label,
                position: "top",
                angle: -45,
                fontSize: 10,
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}