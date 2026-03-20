from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# --------------------
# CORS (frontend connection)
# --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# ROOT
# --------------------
@app.get("/")
def root():
    return {"status": "running"}

# --------------------
# GLOBAL
# --------------------
@app.get("/global")
def get_global():
    return {
        "value": 71,
        "state": 0.0244,
        "threshold": 0.0343,
        "status": "Critical"
    }

# --------------------
# SECTORS
# --------------------
@app.get("/sectors")
def get_sectors():
    return {
        "semiconductors": {"value": 100, "status": "Critical"},
        "crypto": {"value": 12.7, "status": "Calm"},
        "megacap": {"value": 100, "status": "Critical"},
    }

# --------------------
# HISTORY (THIS FIXES EVERYTHING)
# --------------------
@app.get("/history")
def get_history():
    return [
        {"date": "2007-07-01", "state": 0.02, "threshold": 0.03},
        {"date": "2007-08-09", "state": 0.05, "threshold": 0.03},
        {"date": "2007-10-01", "state": 0.035, "threshold": 0.03},
        {"date": "2008-01-01", "state": 0.04, "threshold": 0.03},
        {"date": "2008-03-16", "state": 0.06, "threshold": 0.03},
        {"date": "2008-06-01", "state": 0.03, "threshold": 0.03},
        {"date": "2008-09-15", "state": 0.09, "threshold": 0.03},
        {"date": "2008-10-10", "state": 0.08, "threshold": 0.03},
        {"date": "2008-12-01", "state": 0.07, "threshold": 0.03},
    ]
