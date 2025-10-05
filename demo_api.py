from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to GenAI Health Platform Backend"}

@app.post("/api/analyze")
def analyze_patient(data: dict):
    return {
        "summary": "Glucose slightly high. Follow diet and exercise plan.",
        "alerts": ["High glucose detected"],
        "recommendations": [
            "Walk 30 minutes daily",
            "Eat high fiber breakfast",
            "Monitor blood pressure twice daily"
        ]
    }