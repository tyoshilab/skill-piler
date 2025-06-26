export interface GitHubAuthRequest {
  code: string;
  state: string;
}

export interface GitHubAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export interface AuthStatus {
  is_authenticated: boolean;
  username?: string;
  scopes?: string[];
}