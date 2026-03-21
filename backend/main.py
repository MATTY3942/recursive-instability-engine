from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from collections import deque

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MEMORY ---
live_systemic_history = deque(maxlen=120)
tick_counter = 0


# --- GLOBAL SIGNALS ---
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


# --- SECTOR SIGNALS ---
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


# --- GLOBAL ---
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


# --- SECTORS ---
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


# --- HISTORY UPDATE ---
def update_history(state):
    global tick_counter
    tick_counter += 1
    live_systemic_history.append({
        "date": f"L{tick_counter}",
        "state": round(state, 4)
    })


# --- VELOCITY ---
def compute_velocity():
    if len(live_systemic_history) < 3:
        return 0.0

    s1 = live_systemic_history[-1]["state"]
    s2 = live_systemic_history[-2]["state"]
    s3 = live_systemic_history[-3]["state"]

    v1 = s1 - s2
    v2 = s2 - s3

    return round((0.7 * v1 + 0.3 * v2), 4)


# --- ACCELERATION ---
def compute_acceleration():
    if len(live_systemic_history) < 4:
        return 0.0

    s1 = live_systemic_history[-1]["state"]
    s2 = live_systemic_history[-2]["state"]
    s3 = live_systemic_history[-3]["state"]
    s4 = live_systemic_history[-4]["state"]

    v1 = s1 - s2
    v2 = s2 - s3
    v3 = s3 - s4

    recent = (0.7 * v1 + 0.3 * v2)
    prior = (0.7 * v2 + 0.3 * v3)

    return round(recent - prior, 4)


# --- TIME TO THRESHOLD ---
def time_to_threshold(state, threshold, velocity):
    if velocity <= 0:
        return None
    gap = threshold - state
    if gap <= 0:
        return 0
    return round(gap / velocity, 2)


# --- ALERT CLASSIFICATION ---
def classify(state, threshold, velocity, acceleration):
    if state >= threshold:
        return "Systemic Crisis"
    if acceleration > 0.002 and velocity > 0:
        return "Shock Acceleration"
    if state >= threshold * 0.85 and velocity > 0:
        return "Pre-Crisis Warning"
    if velocity > 0:
        return "Escalating"
    return "Contained"


# --- SYSTEMIC ---
def calculate_systemic():
    g = calculate_global()
    s = calculate_sectors()

    global_state = g["state"]
    avg_sector = sum(x["state"] for x in s) / len(s)

    alignment = avg_sector / global_state if global_state > 0 else 0
    systemic_state = round(global_state * (1 + alignment), 4)

    threshold = 0.05

    update_history(systemic_state)

    velocity = compute_velocity()
    acceleration = compute_acceleration()
    ttt = time_to_threshold(systemic_state, threshold, velocity)

    status = classify(systemic_state, threshold, velocity, acceleration)

    return {
        "value": round((systemic_state / threshold) * 100, 1),
        "state": systemic_state,
        "threshold": threshold,
        "status": status,
        "velocity": velocity,
        "acceleration": acceleration,
        "time_to_threshold": ttt,
        "alignment": round(alignment, 2),
    }


# --- API ---
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
        {"date": "2007-07", "state": 0.02, "threshold": 0.03},
        {"date": "2007-08", "state": 0.03, "threshold": 0.03},
        {"date": "2008-01", "state": 0.035, "threshold": 0.03},
        {"date": "2008-03", "state": 0.05, "threshold": 0.03},
        {"date": "2008-09", "state": 0.09, "threshold": 0.03},
        {"date": "2008-10", "state": 0.1, "threshold": 0.03},
        {"date": "2009-01", "state": 0.04, "threshold": 0.03},
    ]


@app.get("/")
def root():
    return {"message": "Recursive Instability Engine running"}
