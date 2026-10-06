from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import init_db
from .routes.api import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema on startup
    init_db()
    yield

app = FastAPI(
    title="VoiceShield API",
    description="AI-powered security incident investigation assistant backend for HackerHouse Goa",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend Vite dev server and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "service": "VoiceShield API",
        "status": "operational",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host=settings.HOST, port=settings.PORT, reload=True)
