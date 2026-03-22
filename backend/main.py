from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from collections import deque
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- MEMORY ----------------
live_systemic_history = deque(maxlen=120)
tick_counter = 0

# ---------------- GLOBAL SIGNALS ----------------
def get_global_signals():
    try:
        vix = yf.Ticker("^VIX").history(period="1d")["Close"].iloc[-1]
        tnx = yf.Ticker("^TNX").history(period="1d")["Close"].iloc[-1]

        return {
            "vix": float(vix),
            "vix_norm": min(float(vix) / 40, 1),
            "rate_norm": min(float(tnx) / 5, 1),
        }
    except:
        return {"vix": 20, "vix_norm": 0.5, "rate_norm": 0.5}

# ---------------- SECTOR SIGNALS ----------------
def get_sector_signals():
    try:
        nvda = yf.Ticker("NVDA").history(period="5d")["Close"]
        btc = yf.Ticker("BTC-USD").history(period="5d")["Close"]
        aapl = yf.Ticker("AAPL").history(period="5d")["Close"]

        def vol(x):
            return float(x.pct_change().dropna().std())

        return {
            "Semiconductors": vol(nvda),
            "Crypto": vol(btc),
            "Megacap": vol(aapl),
        }
    except:
        return {"Semiconductors": 0.02, "Crypto": 0.05, "Megacap": 0.03}

# ---------------- GLOBAL ----------------
def calculate_global():
    s = get_global_signals()

    state = round(0.015 + 0.02 * s["vix_norm"] + 0.01 * s["rate_norm"], 4)
    threshold = 0.03

    return {
        "value": round((state / threshold) * 100, 1),
        "state": state,
        "threshold": threshold,
        "status": "Critical" if state > threshold else "Calm",
        "vix": s["vix"],
    }

# ---------------- SECTORS ----------------
def calculate_sectors():
    signals = get_sector_signals()

    thresholds = {
        "Semiconductors": 0.03,
        "Crypto": 0.04,
        "Megacap": 0.035,
    }

    out = []
    for name, state in signals.items():
        th = thresholds[name]
        out.append({
            "name": name,
            "value": round((state / th) * 100, 1),
            "state": round(state, 4),
            "threshold": th,
            "status": "Critical" if state > th else "Watch"
        })
    return out

# ---------------- HISTORY UPDATE ----------------
def update_history(state):
    global tick_counter
    tick_counter += 1
    live_systemic_history.append({
        "date": f"L{tick_counter}",
        "state": round(state, 4)
    })

# ---------------- VELOCITY ----------------
def compute_velocity():
    if len(live_systemic_history) < 3:
        return 0.0

    s1 = live_systemic_history[-1]["state"]
    s2 = live_systemic_history[-2]["state"]
    s3 = live_systemic_history[-3]["state"]

    return round((s1 - s2) * 0.7 + (s2 - s3) * 0.3, 4)

# ---------------- ACCELERATION ----------------
def compute_acceleration():
    if len(live_systemic_history) < 4:
        return 0.0

    s = [x["state"] for x in list(live_systemic_history)[-4:]]
    v1 = s[3] - s[2]
    v2 = s[2] - s[1]
    v3 = s[1] - s[0]

    recent = 0.7 * v1 + 0.3 * v2
    prior = 0.7 * v2 + 0.3 * v3

    return round(recent - prior, 4)

# ---------------- TIME TO THRESHOLD ----------------
def time_to_threshold(state, threshold, velocity):
    if velocity <= 0:
        return None
    gap = threshold - state
    if gap <= 0:
        return 0
    return round(gap / velocity, 2)

# ---------------- HELPERS ----------------
def classify(systemic_state, threshold, velocity, acceleration):
    if systemic_state >= threshold:
        return "Systemic Crisis"
    if acceleration > 0.002 and velocity > 0:
        return "Shock Acceleration"
    if systemic_state >= threshold * 0.85 and velocity > 0:
        return "Pre-Crisis Warning"
    if velocity > 0:
        return "Escalating"
    return "Contained"

def trend_from_motion(velocity):
    if velocity > 0.001:
        return "Rising"
    if velocity < -0.001:
        return "Falling"
    return "Plateau"

def latent_instability(systemic_state, threshold, velocity, acceleration):
    if systemic_state >= threshold * 0.95 and abs(velocity) < 0.001:
        return {
            "flag": True,
            "level": "High",
            "message": "System is critically poised near instability boundary"
        }
    if systemic_state >= threshold * 0.85:
        return {
            "flag": True,
            "level": "Moderate",
            "message": "System is elevated and storing stress"
        }
    return {
        "flag": False,
        "level": "Low",
        "message": "No latent instability detected"
    }

def compare_to_2008(systemic_state, threshold, acceleration):
    if acceleration > 0.002:
        return "Crisis acceleration (Lehman-like)"
    if systemic_state >= threshold * 0.9:
        return "Late-cycle stress (pre-Lehman)"
    return "No crisis-like acceleration"

def build_systemic_payload(global_state, avg_sector, threshold=0.05, add_noise=True):
    alignment = avg_sector / global_state if global_state > 0 else 0
    base = global_state * (1 + alignment)
    noise = random.uniform(-0.0005, 0.0005) if add_noise else 0.0
    systemic_state = round(base + noise, 4)

    velocity = compute_velocity() if add_noise else 0.0
    acceleration = compute_acceleration() if add_noise else 0.0
    ttt = time_to_threshold(systemic_state, threshold, velocity)

    status = classify(systemic_state, threshold, velocity, acceleration)
    trend = trend_from_motion(velocity)
    latent = latent_instability(systemic_state, threshold, velocity, acceleration)

    drivers = {
        "volatility": round(global_state, 4),
        "concentration": round(alignment * 0.02, 4),
        "liquidity": round(0.01 + global_state * 0.3, 4),
        "divergence": round(abs(global_state - avg_sector), 4),
    }

    return {
        "value": round((systemic_state / threshold) * 100, 1),
        "state": systemic_state,
        "threshold": threshold,
        "status": status,
        "velocity": velocity,
        "acceleration": acceleration,
        "time_to_threshold": ttt,
        "time_signal": (
            "Already beyond threshold"
            if ttt == 0 else
            "No immediate breach trajectory"
            if ttt is None else
            f"Estimated breach in {ttt} ticks"
        ),
        "trend": trend,
        "comparison_2008": compare_to_2008(systemic_state, threshold, acceleration),
        "interpretation": "Instability driven by concentration (alignment) and volatility regime.",
        "drivers": drivers,
        "latent": latent,
        "alignment": round(alignment, 2),
    }

# ---------------- SYSTEMIC ----------------
def calculate_systemic():
    g = calculate_global()
    s = calculate_sectors()

    global_state = g["state"]
    avg_sector = sum(x["state"] for x in s) / len(s)

    payload = build_systemic_payload(global_state, avg_sector, threshold=0.05, add_noise=True)

    update_history(payload["state"])
    payload["velocity"] = compute_velocity()
    payload["acceleration"] = compute_acceleration()

    ttt = time_to_threshold(payload["state"], payload["threshold"], payload["velocity"])
    payload["time_to_threshold"] = ttt
    payload["time_signal"] = (
        "Already beyond threshold"
        if ttt == 0 else
        "No immediate breach trajectory"
        if ttt is None else
        f"Estimated breach in {ttt} ticks"
    )
    payload["status"] = classify(
        payload["state"], payload["threshold"], payload["velocity"], payload["acceleration"]
    )
    payload["trend"] = trend_from_motion(payload["velocity"])
    payload["comparison_2008"] = compare_to_2008(
        payload["state"], payload["threshold"], payload["acceleration"]
    )
    payload["latent"] = latent_instability(
        payload["state"], payload["threshold"], payload["velocity"], payload["acceleration"]
    )

    return payload

# ---------------- SHOCK SIMULATION ----------------
@app.get("/simulate")
def simulate(
    vix_shock: float = 0.0,
    rate_shock: float = 0.0,
    sector_shock: float = 0.0
):
    g = calculate_global()
    s = calculate_sectors()

    shocked_global_state = round(
        g["state"] + vix_shock * 0.01 + rate_shock * 0.005,
        4
    )

    shocked_sector_states = []
    for sec in s:
        shocked_sector_states.append(sec["state"] + sector_shock * 0.01)

    avg_sector = sum(shocked_sector_states) / len(shocked_sector_states)

    payload = build_systemic_payload(
        global_state=max(shocked_global_state, 0.0001),
        avg_sector=max(avg_sector, 0.0001),
        threshold=0.05,
        add_noise=False
    )

    payload["simulation"] = {
        "vix_shock": vix_shock,
        "rate_shock": rate_shock,
        "sector_shock": sector_shock,
    }
    payload["interpretation"] = "Simulated scenario based on user shock inputs."

    return payload

# ---------------- API ----------------
@app.get("/global")
def get_global():
    return calculate_global()

@app.get("/sectors")
def get_sectors():
    return calculate_sectors()

@app.get("/systemic")
def get_systemic():
    return calculate_systemic()

@app.get("/live_history")
def get_live_history():
    return list(live_systemic_history)

@app.get("/history")
def get_history():
    return [
        {"date": "2007-07", "state": 0.02, "event": "Pre-crisis calm"},
        {"date": "2007-08", "state": 0.03, "event": "Credit stress begins"},
        {"date": "2008-01", "state": 0.035, "event": "Subprime deterioration"},
        {"date": "2008-03", "state": 0.05, "event": "Bear Stearns collapse"},
        {"date": "2008-07", "state": 0.07, "event": "Systemic stress rising"},
        {"date": "2008-09", "state": 0.09, "event": "Lehman Brothers collapse"},
        {"date": "2008-10", "state": 0.1, "event": "Global panic peak"},
        {"date": "2009-01", "state": 0.04, "event": "Post-crisis stabilization"},
    ]

@app.get("/")
def root():
    return {"message": "Recursive Instability Engine running"}