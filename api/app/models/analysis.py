from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime

class AnalysisRequest(BaseModel):
    github_username: str
    include_private: bool = False
    access_token: Optional[str] = None

class LanguageIntensity(BaseModel):
    language: str
    intensity: float
    commit_count: int
    line_count: int
    repository_count: int

class AnalysisResult(BaseModel):
    username: str
    analysis_date: datetime
    languages: List[LanguageIntensity]
    total_repositories: int
    total_commits: int
    analysis_period_months: int

class AnalysisJob(BaseModel):
    job_id: str
    status: str  # "pending", "processing", "completed", "failed"
    created_at: datetime
    completed_at: Optional[datetime] = None
    result: Optional[AnalysisResult] = None
    error_message: Optional[str] = None