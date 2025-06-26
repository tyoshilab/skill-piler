from pydantic import BaseModel
from typing import Optional

class GitHubAuthRequest(BaseModel):
    code: str
    state: str

class GitHubAuthResponse(BaseModel):
    access_token: str
    token_type: str
    scope: str

class AuthStatus(BaseModel):
    is_authenticated: bool
    username: Optional[str] = None
    scopes: Optional[list] = None