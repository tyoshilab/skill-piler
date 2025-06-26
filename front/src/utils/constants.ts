export const API_ENDPOINTS = {
  ANALYZE: '/analyze',
  AUTH_LOGIN: '/login',
  AUTH_CALLBACK: '/callback',
  AUTH_STATUS: '/status',
} as const;

export const GITHUB_SCOPES = [
  'public_repo',
  'repo', // for private repositories
] as const;

export const CHART_COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#ff7300',
  '#8dd1e1',
  '#d084d0',
  '#82d982',
] as const;

export const POLLING_INTERVAL = 2000; // 2 seconds for job status polling