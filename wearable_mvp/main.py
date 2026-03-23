from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

random.seed(42)

def daterange(start, days):
    return [(start + timedelta(days=i)).isoformat() for i in range(days)]

def entropy_export(hr, hrv, sleep, activity, resp):
    score = (
        0.35 * (hrv / 100)
        + 0.25 * (sleep / 10)
        + 0.2 * (activity / 1000)
        - 0.12 * (hr / 200)
        - 0.08 * (resp / 40)
    )
    return round(max(0, min(score, 1)), 4)

def classify(e):
    if e >= 0.4:
        return "Adaptive"
    if e >= 0.25:
        return "Neutral"
    return "Declining"

def generate(user_id, mode):
    start = date(2026, 3, 1)
    dates = daterange(start, 30)

    data = []

    hr = 64
    hrv = 48
    sleep = 6.5
    activity = 400
    resp = 15

    for d in dates:
        if mode == "improving":
            hr -= random.uniform(0.05, 0.2)
            hrv += random.uniform(0.5, 1.2)
            sleep += random.uniform(0.02, 0.08)
            activity += random.uniform(5, 15)
            resp -= random.uniform(0.02, 0.08)
        else:
            hr += random.uniform(0.1, 0.4)
            hrv -= random.uniform(0.5, 1.2)
            sleep -= random.uniform(0.05, 0.12)
            activity -= random.uniform(5, 15)
            resp += random.uniform(0.02, 0.1)

        e = entropy_export(hr, hrv, sleep, activity, resp)

        data.append({
            "user": user_id,
            "date": d,
            "entropy": e,
            "state": classify(e)
        })

    return data

USER_A = generate("A", "improving")
USER_B = generate("B", "declining")

@app.get("/")
def root():
    return {"status": "wearable mvp running"}

@app.get("/users/A")
def user_a():
    return USER_A

@app.get("/users/B")
def user_b():
    return USER_B