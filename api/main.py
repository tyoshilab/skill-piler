from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import analysis_router, auth_router

app = FastAPI(
    title="Skill Piler API",
    description="GitHub repository analysis and skill visualization API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis_router.router, prefix="/api/v1", tags=["analysis"])
app.include_router(auth_router.router, prefix="/api/v1", tags=["auth"])

@app.get("/")
async def root():
    return {"message": "Skill Piler API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}