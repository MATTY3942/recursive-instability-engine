"use client"

import { useState } from "react"

function computeState(hrv: number, sleep: number, load: number, recovery: number) {
  const base = 0.5

  const hrvEffect = (hrv / 100) * 0.08
  const sleepEffect = (sleep / 8) * 0.08
  const loadEffect = load * 0.035
  const recoveryEffect = recovery * 0.05

  const stateRaw = base + hrvEffect + sleepEffect + recoveryEffect - loadEffect
  const state = Math.max(0, Math.min(1, stateRaw))

  const velocityRaw =
    hrvEffect * 0.25 +
    sleepEffect * 0.25 +
    recoveryEffect * 0.6 -
    loadEffect * 0.7

  const velocity = Number(velocityRaw.toFixed(4))

  let trend = "Stable"
  if (velocity < -0.01) trend = "⚠️ Pre-decline detected"
  if (velocity > 0.01) trend = "Improving"

  let timeToDecline = "No decline trajectory"
  if (velocity < 0 && state > 0) {
    timeToDecline = `${(state / Math.abs(velocity)).toFixed(1)} days`
  }

  return {
    state: Number(state.toFixed(3)),
    velocity,
    trend,
    timeToDecline,
  }
}

function statusLabel(state: number) {
  if (state >= 0.7) return "Adaptive"
  if (state >= 0.4) return "Stable"
  if (state >= 0.2) return "Declining"
  return "High Risk"
}

export default function Home() {
  const [shock, setShock] = useState(0)
  const [recovery, setRecovery] = useState(0)

  const userA = computeState(70, 7.5, 3 + shock, 2 + recovery)
  const userB = computeState(35, 6, 7 + shock, 0.5 + recovery)

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Wearable Entropy Engine — Predictive View</h1>

      <h2>Shock Simulation</h2>
      <input
        type="range"
        min="0"
        max="5"
        value={shock}
        onChange={(e) => setShock(Number(e.target.value))}
      />
      <div>Shock Level: {shock}</div>

      <h2 style={{ marginTop: 20 }}>Recovery Simulation</h2>
      <input
        type="range"
        min="0"
        max="5"
        value={recovery}
        onChange={(e) => setRecovery(Number(e.target.value))}
      />
      <div>Recovery Level: {recovery}</div>

      <hr />

      <h2>Latest State</h2>

      <div style={{ display: "flex", gap: 40 }}>
        <div>
          <h3>User A</h3>
          <div>State: {userA.state} — {statusLabel(userA.state)}</div>
          <div>Velocity: {userA.velocity}</div>
          <div>{userA.trend}</div>
          <div>{userA.timeToDecline}</div>
        </div>

        <div>
          <h3>User B</h3>
          <div>State: {userB.state} — {statusLabel(userB.state)}</div>
          <div>Velocity: {userB.velocity}</div>
          <div>{userB.trend}</div>
          <div>{userB.timeToDecline}</div>
        </div>
      </div>
    </div>
  )
}