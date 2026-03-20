"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const events = [
  { date: "2007-08-09", label: "Credit Stress" },
  { date: "2008-03-16", label: "Bear Stearns" },
  { date: "2008-09-15", label: "Lehman Collapse" },
  { date: "2008-10-10", label: "Global Panic" },
];

export default function Home() {
  const [global, setGlobal] = useState<any>(null);
  const [sectors, setSectors] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/global")
      .then((res) => res.json())
      .then(setGlobal);

    fetch("http://127.0.0.1:8000/sectors")
      .then((res) => res.json())
      .then(setSectors);

    fetch("http://127.0.0.1:8000/history")
      .then((res) => res.json())
      .then(setHistory);
  }, []);

  if (!global || !sectors) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 30, fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ fontSize: 32, fontWeight: "bold" }}>
        Recursive Instability Engine
      </h1>

      {/* GAUGES */}
      <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
        <div>
          <h3>Global</h3>
          <p style={{ fontSize: 36 }}>{global.value}%</p>
          <p style={{ color: "red" }}>{global.status}</p>
          <p>State: {global.state}</p>
          <p>Threshold: {global.threshold}</p>
        </div>

        {Object.entries(sectors).map(([key, val]: any) => (
          <div key={key}>
            <h3>{key}</h3>
            <p style={{ fontSize: 32 }}>{val.value}%</p>
            <p style={{ color: val.status === "Critical" ? "red" : "green" }}>
              {val.status}
            </p>
          </div>
        ))}
      </div>

      {/* CHART */}
      <h2 style={{ marginTop: 40 }}>Historical Instability</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={history}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis domain={[0, 0.1]} />
          <Tooltip />

          {/* BREACH SHADING */}
          {history.map((d, i) =>
            d.state > d.threshold ? (
              <ReferenceLine
                key={`b-${i}`}
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
            name="Instability State"
          />

          {/* THRESHOLD */}
          <Line
            type="monotone"
            dataKey="threshold"
            stroke="#dc2626"
            strokeWidth={2}
            name="Critical Threshold"
          />

          {/* EVENTS */}
          {events.map((event, index) => (
            <ReferenceLine
              key={`e-${index}`}
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