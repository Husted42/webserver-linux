from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from api.analytics import router as analytics_router
from api.beers import router as beers_router
from api.breweries import router as breweries_router

app = FastAPI()

allowed_origins = ["http://localhost:3000"]
frontend_origin = os.getenv("FRONTEND_ORIGIN")
if frontend_origin:
    allowed_origins.append(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(breweries_router)
app.include_router(beers_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {
        "message": "Hello from the backend"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }