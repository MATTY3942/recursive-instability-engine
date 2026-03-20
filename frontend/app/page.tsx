"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/global")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  if (!data) {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  return (
    <main style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>Recursive Instability Engine</h1>

      <h2>Global</h2>

      <div style={{ fontSize: 40, fontWeight: "bold" }}>
        {data.value}%
      </div>

      <div style={{ color: "red", fontSize: 20 }}>
        {data.status}
      </div>

      <div>State: {data.state}</div>
      <div>Threshold: {data.threshold}</div>
    </main>
  );
}