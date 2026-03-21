"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [global, setGlobal] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/global")
      .then(res => res.json())
      .then(setGlobal);

    fetch("http://127.0.0.1:8000/sectors")
      .then(res => res.json())
      .then(setSectors);

    fetch("http://127.0.0.1:8000/history")
      .then(res => res.json())
      .then(setHistory);
  }, []);

  if (!global) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Recursive Instability Engine</h1>

      <h2>Global</h2>
      <div>{global.value}% - {global.status}</div>
      <div>State: {global.state}</div>
      <div>Threshold: {global.threshold}</div>

      <h2 style={{ marginTop: 30 }}>Sectors</h2>
      <div style={{ display: "flex", gap: 20 }}>
        {sectors.map((s, i) => (
          <div key={i} style={{ padding: 10, border: "1px solid #ccc" }}>
            <h3>{s.name}</h3>
            <div>{s.value}%</div>
            <div>{s.status}</div>
            <div>State: {s.state}</div>
            <div>Threshold: {s.threshold}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 30 }}>Historical Instability</h2>
      <pre style={{ fontSize: 10 }}>
        {JSON.stringify(history.slice(0, 10), null, 2)}
      </pre>
    </div>
  );
}