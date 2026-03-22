"use client";
import { useState } from "react";

export default function QueryPanel() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    const res = await fetch("http://localhost:8000/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query }),
    });

    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Ask the System</h2>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about instability..."
        style={{ width: "100%", padding: 10 }}
      />

      <button onClick={handleSubmit} style={{ marginTop: 10 }}>
        Submit
      </button>

      <pre style={{ marginTop: 20 }}>{response}</pre>
    </div>
  );
}
