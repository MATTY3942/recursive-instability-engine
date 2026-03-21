from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL INSTABILITY ---
@app.get("/global")
def get_global():
    state = round(random.uniform(0.02, 0.03), 4)
    threshold = 0.03

    value = round((state / threshold) * 100, 1)
    status = "Critical" if state > threshold else "Calm"

    return {
        "value": value,
        "state": state,
        "threshold": threshold,
        "status": status
    }

# --- SECTOR INSTABILITY ---
@app.get("/sectors")
def get_sectors():
    sectors = [
        {
            "name": "Semiconductors",
            "state": round(random.uniform(0.005, 0.02), 4),
            "threshold": 0.0324
        },
        {
            "name": "Crypto",
            "state": round(random.uniform(0.04, 0.07), 4),
            "threshold": 0.0408
        },
        {
            "name": "Megacap",
            "state": round(random.uniform(0.045, 0.065), 4),
            "threshold": 0.0497
        }
    ]

    for s in sectors:
        s["value"] = round((s["state"] / s["threshold"]) * 100, 1)
        s["status"] = "Critical" if s["state"] > s["threshold"] else "Watch"

    return sectors

# --- HISTORICAL DATA ---
@app.get("/history")
def get_history():
    data = []
    threshold = 0.03

    for i in range(50):
        state = round(0.02 + random.uniform(-0.01, 0.015), 4)
        data.append({
            "date": f"T{i}",
            "state": state,
            "threshold": threshold
        })

    return data

# --- ROOT ---
@app.get("/")
def root():
    return {"message": "Recursive Instability Engine running"}