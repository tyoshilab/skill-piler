"""
Analysis Router - GitHub Repository Analysis Endpoints

Design Reference: CLAUDE.md - Backend Architecture
Endpoints: /analyze (POST), /analyze/{job_id} (GET), /analyze/{job_id}/result (GET)

Related Classes:
- AnalysisService: Core analysis orchestration and job management
- GitHubService: GitHub API communication for repository data
- IntencyService: Custom skill intensity calculation algorithms
- CacheService: Redis caching for GitHub API responses
- Models: AnalysisRequest, AnalysisJob, AnalysisResult
"""

from fastapi import APIRouter, HTTPException, Depends
from app.models.analysis import AnalysisRequest, AnalysisJob, AnalysisResult
from app.services.analysis_service import AnalysisService
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# Singleton instance for analysis service
_analysis_service_instance = None

def get_analysis_service() -> AnalysisService:
    global _analysis_service_instance
    if _analysis_service_instance is None:
        _analysis_service_instance = AnalysisService()
    return _analysis_service_instance

@router.post("/analyze", response_model=AnalysisJob)
async def start_analysis(
    request: AnalysisRequest,
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Start GitHub repository analysis for a user
    """
    try:
        logger.info(f"Starting analysis for user: {request.github_username}")
        job = await analysis_service.start_analysis(request)
        return job
    except ValueError as e:
        logger.error(f"Validation error in start_analysis: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in start_analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analyze/{job_id}", response_model=AnalysisJob)
async def get_analysis_status(
    job_id: str,
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Get analysis job status by job ID
    """
    try:
        logger.debug(f"Getting status for job: {job_id}")
        job = await analysis_service.get_analysis_status(job_id)
        return job
    except ValueError as e:
        logger.error(f"Job not found: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_analysis_status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/analyze/{job_id}/result", response_model=AnalysisResult)
async def get_analysis_result(
    job_id: str,
    analysis_service: AnalysisService = Depends(get_analysis_service)
):
    """
    Get detailed analysis result data
    """
    try:
        logger.debug(f"Getting result for job: {job_id}")
        result = await analysis_service.get_analysis_result(job_id)
        return result
    except ValueError as e:
        logger.error(f"Job result error: {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in get_analysis_result: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")