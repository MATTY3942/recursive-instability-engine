from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL SIGNALS (VIX + Rates) ---
def get_global_signals():
    try:
        vix = yf.Ticker("^VIX").history(period="1d")["Close"].iloc[-1]
        tnx = yf.Ticker("^TNX").history(period="1d")["Close"].iloc[-1]

        vix_norm = min(vix / 40, 1)
        rate_norm = min(tnx / 5, 1)

        return {
            "vix": float(vix),
            "vix_norm": float(vix_norm),
            "rate_norm": float(rate_norm)
        }
    except:
        return {
            "vix": 20,
            "vix_norm": 0.5,
            "rate_norm": 0.5
        }

# --- SECTOR SIGNALS (REAL MARKET DATA) ---
def get_sector_signals():
    try:
        nvda = yf.Ticker("NVDA").history(period="5d")["Close"]
        btc = yf.Ticker("BTC-USD").history(period="5d")["Close"]
        aapl = yf.Ticker("AAPL").history(period="5d")["Close"]

        def compute_state(series):
            returns = series.pct_change().dropna()
            volatility = returns.std()
            return float(volatility)

        return {
            "Semiconductors": compute_state(nvda),
            "Crypto": compute_state(btc),
            "Megacap": compute_state(aapl)
        }
    except:
        return {
            "Semiconductors": 0.02,
            "Crypto": 0.05,
            "Megacap": 0.03
        }

# --- GLOBAL ENDPOINT ---
@app.get("/global")
def get_global():
    signals = get_global_signals()

    state = round(0.015 + 0.02 * signals["vix_norm"] + 0.01 * signals["rate_norm"], 4)
    threshold = 0.03

    value = round((state / threshold) * 100, 1)
    status = "Critical" if state > threshold else "Calm"

    return {
        "value": value,
        "state": state,
        "threshold": threshold,
        "status": status,
        "vix": signals["vix"]
    }

# --- SECTORS ENDPOINT ---
@app.get("/sectors")
def get_sectors():
    signals = get_sector_signals()

    thresholds = {
        "Semiconductors": 0.03,
        "Crypto": 0.04,
        "Megacap": 0.035
    }

    sectors = []

    for name, state in signals.items():
        threshold = thresholds[name]
        value = round((state / threshold) * 100, 1)
        status = "Critical" if state > threshold else "Watch"

        sectors.append({
            "name": name,
            "value": value,
            "state": round(state, 4),
            "threshold": threshold,
            "status": status
        })

    return sectors

# --- HISTORY (still simple for now) ---
@app.get("/history")
def get_history():
    return [
        {"date": "T1", "state": 0.02, "threshold": 0.03},
        {"date": "T2", "state": 0.025, "threshold": 0.03},
        {"date": "T3", "state": 0.028, "threshold": 0.03},
    ]

# --- ROOT ---
@app.get("/")
def root():
    return {"message": "Recursive Instability Engine running"}
