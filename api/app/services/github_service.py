"""
GitHub Service - GitHub API Communication and Data Retrieval

Design Reference: CLAUDE.md - External Dependencies, Security Considerations
Purpose: Handles all GitHub API interactions with proper authentication and rate limiting

Related Classes:
- AnalysisService: Consumes repository and commit data for analysis
- AuthService: Provides access tokens for authenticated API calls
- CacheService: Caches API responses to reduce rate limit usage

API Usage: REST API v3 for repositories/commits, GraphQL planned for complex queries
Security: Token-based authentication, no sensitive data exposure to frontend
"""

from typing import List, Dict, Optional
import httpx
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.api_base_url = "https://api.github.com"
        self.graphql_url = "https://api.github.com/graphql"
        self.timeout = httpx.Timeout(30.0)
    
    def _get_headers(self, access_token: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "Skill-Piler/1.0"
        }
        if access_token:
            headers["Authorization"] = f"token {access_token}"
        return headers
    
    async def get_user_repositories(self, username: str, access_token: str = None) -> List[Dict]:
        """
        Get user's public repositories from GitHub API
        """
        try:
            headers = self._get_headers(access_token)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.api_base_url}/users/{username}/repos"
                params = {
                    "type": "public",
                    "sort": "updated",
                    "per_page": 100
                }
                
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                
                repos = response.json()
                logger.info(f"Retrieved {len(repos)} repositories for user {username}")
                
                return [
                    {
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "description": repo.get("description", ""),
                        "language": repo.get("language"),
                        "size": repo["size"],
                        "stargazers_count": repo["stargazers_count"],
                        "forks_count": repo["forks_count"],
                        "updated_at": repo["updated_at"],
                        "created_at": repo["created_at"],
                        "clone_url": repo["clone_url"],
                        "languages_url": repo["languages_url"]
                    }
                    for repo in repos
                    if not repo["fork"]  # Exclude forked repositories
                ]
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting repositories for {username}: {e}")
            if e.response.status_code == 404:
                raise ValueError(f"User {username} not found")
            elif e.response.status_code == 403:
                raise ValueError("Rate limit exceeded or access denied")
            else:
                raise ValueError(f"GitHub API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error getting repositories for {username}: {e}")
            raise ValueError(f"Failed to get repositories: {str(e)}")
    
    async def get_repository_languages(self, owner: str, repo: str, access_token: str = None) -> Dict:
        """
        Get programming languages used in a repository with byte counts
        """
        try:
            headers = self._get_headers(access_token)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.api_base_url}/repos/{owner}/{repo}/languages"
                
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                languages = response.json()
                logger.debug(f"Retrieved languages for {owner}/{repo}: {list(languages.keys())}")
                
                return languages
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting languages for {owner}/{repo}: {e}")
            if e.response.status_code == 404:
                raise ValueError(f"Repository {owner}/{repo} not found")
            elif e.response.status_code == 403:
                raise ValueError("Rate limit exceeded or access denied")
            else:
                raise ValueError(f"GitHub API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error getting languages for {owner}/{repo}: {e}")
            raise ValueError(f"Failed to get languages: {str(e)}")
    
    async def get_commit_history(self, owner: str, repo: str, access_token: str = None) -> List[Dict]:
        """
        Get commit history for intensity calculation (last 100 commits)
        """
        try:
            headers = self._get_headers(access_token)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.api_base_url}/repos/{owner}/{repo}/commits"
                params = {
                    "per_page": 100,
                    "page": 1
                }
                
                response = await client.get(url, headers=headers, params=params)
                response.raise_for_status()
                
                commits = response.json()
                logger.debug(f"Retrieved {len(commits)} commits for {owner}/{repo}")
                
                return [
                    {
                        "sha": commit["sha"],
                        "message": commit["commit"]["message"],
                        "author": {
                            "name": commit["commit"]["author"]["name"],
                            "email": commit["commit"]["author"]["email"],
                            "date": commit["commit"]["author"]["date"]
                        },
                        "committer": {
                            "name": commit["commit"]["committer"]["name"],
                            "email": commit["commit"]["committer"]["email"],
                            "date": commit["commit"]["committer"]["date"]
                        },
                        "stats_url": commit["url"]
                    }
                    for commit in commits
                ]
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error getting commits for {owner}/{repo}: {e}")
            if e.response.status_code == 404:
                raise ValueError(f"Repository {owner}/{repo} not found")
            elif e.response.status_code == 403:
                raise ValueError("Rate limit exceeded or access denied")
            else:
                raise ValueError(f"GitHub API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error getting commits for {owner}/{repo}: {e}")
            raise ValueError(f"Failed to get commits: {str(e)}")
    
    async def validate_access_token(self, access_token: str) -> Dict:
        """
        Validate GitHub access token and get user info
        """
        try:
            headers = self._get_headers(access_token)
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                url = f"{self.api_base_url}/user"
                
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                user = response.json()
                logger.info(f"Validated access token for user {user['login']}")
                
                return {
                    "login": user["login"],
                    "name": user.get("name"),
                    "email": user.get("email"),
                    "avatar_url": user["avatar_url"],
                    "public_repos": user["public_repos"],
                    "private_repos": user.get("total_private_repos", 0)
                }
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error validating token: {e}")
            if e.response.status_code == 401:
                raise ValueError("Invalid access token")
            elif e.response.status_code == 403:
                raise ValueError("Rate limit exceeded")
            else:
                raise ValueError(f"GitHub API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error validating token: {e}")
            raise ValueError(f"Failed to validate token: {str(e)}")