from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REAL SIGNALS ---
def get_real_signals():
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

# --- GLOBAL ---
@app.get("/global")
def get_global():
    signals = get_real_signals()

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

# --- SECTORS (still mock for now) ---
@app.get("/sectors")
def get_sectors():
    return [
        {"name": "Semiconductors", "value": 60, "status": "Watch", "state": 0.02, "threshold": 0.0324},
        {"name": "Crypto", "value": 90, "status": "Critical", "state": 0.05, "threshold": 0.0408},
        {"name": "Megacap", "value": 95, "status": "Critical", "state": 0.047, "threshold": 0.0497},
    ]

# --- HISTORY (still mock for now) ---
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
