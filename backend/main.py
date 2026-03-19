from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "running"}

@app.get("/global")
def global_instability():
    return {
        "value": 71,
        "state": 0.0244,
        "threshold": 0.0343,
        "status": "Critical"
    }

@app.get("/sectors")
def sectors():
    return {
        "semiconductors": {"value": 100, "status": "Critical"},
        "crypto": {"value": 12.7, "status": "Calm"},
        "megacap": {"value": 100, "status": "Critical"}
    }
