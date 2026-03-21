"use client";

import { useState } from "react";

export default function QueryPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);

  const runQuery = async () => {
    const res = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div style={{ padding: 20, background: "#000", minHeight: "100vh", color: "white" }}>
      <h1>Ask the System</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="nasdaq or sp500"
        style={{
          padding: 10,
          marginRight: 10,
          background: "#111",
          color: "white",
          border: "1px solid #333",
        }}
      />

      <button
        onClick={runQuery}
        style={{
          padding: 10,
          background: "#222",
          color: "white",
          border: "1px solid #333",
        }}
      >
        Submit
      </button>

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            background: "#111",
            borderRadius: 12,
            border: "1px solid #333",
          }}
        >
          <div><b>Index:</b> {result.index}</div>
          <div><b>Status:</b> {result.status}</div>
          <div><b>Regime:</b> {result.regime}</div>
          <div><b>Trend:</b> {result.trend}</div>
          <div><b>2008 Comparison:</b> {result["2008_comparison"]}</div>

          <p style={{ marginTop: 10 }}>{result.interpretation}</p>
        </div>
      )}
    </div>
  );
}