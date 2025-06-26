from fastapi import APIRouter, HTTPException
from app.models.auth import GitHubAuthRequest, GitHubAuthResponse, AuthStatus
from app.services.auth_service import AuthService

router = APIRouter()

@router.get("/login")
async def github_login():
    """
    Initiate GitHub OAuth flow
    """
    # TODO: Implement GitHub OAuth redirect
    raise HTTPException(status_code=501, detail="GitHub OAuth not implemented")

@router.post("/callback", response_model=GitHubAuthResponse)
async def github_callback(request: GitHubAuthRequest):
    """
    Handle GitHub OAuth callback
    """
    # TODO: Implement OAuth callback handling
    raise HTTPException(status_code=501, detail="OAuth callback not implemented")

@router.get("/status", response_model=AuthStatus)
async def auth_status():
    """
    Get current authentication status
    """
    # TODO: Implement auth status check
    raise HTTPException(status_code=501, detail="Auth status check not implemented")