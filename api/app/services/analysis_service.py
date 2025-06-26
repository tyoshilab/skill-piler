from app.models.analysis import AnalysisRequest, AnalysisJob, AnalysisResult, LanguageIntensity
from app.services.github_service import GitHubService
from app.services.intency_service import IntencyService
from app.services.cache_service import CacheService
import uuid
import logging
import asyncio
from datetime import datetime
from typing import Dict, List
from collections import defaultdict

logger = logging.getLogger(__name__)

class AnalysisService:
    def __init__(self):
        self.github_service = GitHubService()
        self.intency_service = IntencyService()
        self.cache_service = CacheService()
        self.jobs: Dict[str, AnalysisJob] = {}
    
    async def start_analysis(self, request: AnalysisRequest) -> AnalysisJob:
        """
        Start GitHub repository analysis
        """
        job_id = str(uuid.uuid4())
        job = AnalysisJob(
            job_id=job_id,
            status="pending",
            created_at=datetime.now()
        )
        
        self.jobs[job_id] = job
        
        # Start analysis in background
        asyncio.create_task(self._perform_analysis(job_id, request))
        
        logger.info(f"Started analysis job {job_id} for user {request.github_username}")
        return job
    
    async def get_analysis_status(self, job_id: str) -> AnalysisJob:
        """
        Get analysis job status
        """
        if job_id not in self.jobs:
            raise ValueError(f"Job {job_id} not found")
        
        return self.jobs[job_id]
    
    async def get_analysis_result(self, job_id: str) -> AnalysisResult:
        """
        Get completed analysis result
        """
        if job_id not in self.jobs:
            raise ValueError(f"Job {job_id} not found")
        
        job = self.jobs[job_id]
        if job.status != "completed":
            raise ValueError(f"Job {job_id} is not completed (status: {job.status})")
        
        if job.result is None:
            raise ValueError(f"Job {job_id} has no result")
        
        return job.result
    
    async def _perform_analysis(self, job_id: str, request: AnalysisRequest):
        """
        Perform the actual analysis work
        """
        try:
            job = self.jobs[job_id]
            job.status = "processing"
            
            logger.info(f"Starting analysis for {request.github_username}")
            
            # Step 1: Get user repositories
            repos = await self.github_service.get_user_repositories(
                request.github_username, 
                request.access_token
            )
            
            logger.info(f"Found {len(repos)} repositories for {request.github_username}")
            
            # Step 2: Analyze each repository
            language_stats = defaultdict(lambda: {
                'total_bytes': 0,
                'repository_count': 0,
                'commit_count': 0
            })
            
            total_commits = 0
            
            for repo in repos:
                try:
                    # Get language information
                    languages = await self.github_service.get_repository_languages(
                        request.github_username,
                        repo['name'],
                        request.access_token
                    )
                    
                    # Get commit history for intensity calculation
                    commits = await self.github_service.get_commit_history(
                        request.github_username,
                        repo['name'],
                        request.access_token
                    )
                    
                    # Process languages
                    for language, bytes_count in languages.items():
                        language_stats[language]['total_bytes'] += bytes_count
                        language_stats[language]['repository_count'] += 1
                        language_stats[language]['commit_count'] += len(commits)
                    
                    total_commits += len(commits)
                    
                    logger.debug(f"Processed repo {repo['name']}: {len(languages)} languages, {len(commits)} commits")
                    
                except Exception as e:
                    logger.warning(f"Failed to analyze repository {repo['name']}: {e}")
                    continue
            
            # Step 3: Calculate intensities and create result
            language_intensities = []
            
            for language, stats in language_stats.items():
                intensity = self.intency_service.calculate_language_intensity(
                    language=language,
                    total_bytes=stats['total_bytes'],
                    commit_count=stats['commit_count'],
                    repository_count=stats['repository_count']
                )
                
                language_intensities.append(LanguageIntensity(
                    language=language,
                    intensity=intensity,
                    commit_count=stats['commit_count'],
                    line_count=stats['total_bytes'] // 50,  # Rough estimation: 50 bytes per line
                    repository_count=stats['repository_count']
                ))
            
            # Sort by intensity (highest first)
            language_intensities.sort(key=lambda x: x.intensity, reverse=True)
            
            # Step 4: Create analysis result
            result = AnalysisResult(
                username=request.github_username,
                analysis_date=datetime.now(),
                languages=language_intensities,
                total_repositories=len(repos),
                total_commits=total_commits,
                analysis_period_months=12  # Default analysis period
            )
            
            # Update job status
            job.status = "completed"
            job.completed_at = datetime.now()
            job.result = result
            
            logger.info(f"Completed analysis for {request.github_username}: {len(language_intensities)} languages")
            
        except Exception as e:
            logger.error(f"Analysis failed for job {job_id}: {e}")
            job = self.jobs[job_id]
            job.status = "failed"
            job.error_message = str(e)
            job.completed_at = datetime.now()