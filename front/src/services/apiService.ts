import axios from 'axios';
import { AnalysisRequest, AnalysisJob, AnalysisResult, TimeSeriesDataPoint } from '../types/analysis';
import { GitHubAuthRequest, GitHubAuthResponse, AuthStatus } from '../types/auth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4001/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export class ApiService {
  // Analysis endpoints
  static async startAnalysis(request: AnalysisRequest): Promise<AnalysisJob> {
    const response = await apiClient.post<AnalysisJob>('/analyze', request);
    return response.data;
  }

  static async getAnalysisStatus(jobId: string): Promise<AnalysisJob> {
    const response = await apiClient.get<AnalysisJob>(`/analyze/${jobId}`);
    return response.data;
  }

  static async getAnalysisResult(jobId: string): Promise<AnalysisResult> {
    const response = await apiClient.get<AnalysisResult>(`/analyze/${jobId}/result`);
    return response.data;
  }

  static async getTimeSeriesData(username: string, timePoint: number = 0): Promise<TimeSeriesDataPoint[]> {
    const params = new URLSearchParams();
    if (timePoint > 0) {
      params.append('months', timePoint.toString());
    }
    
    const response = await apiClient.get<{ time_series_data: TimeSeriesDataPoint[] }>(
      `/analyze/timeseries/${username}?${params.toString()}`
    );
    return response.data.time_series_data;
  }

  // Auth endpoints
  static async getGitHubLoginUrl(): Promise<string> {
    const response = await apiClient.get<{ login_url: string }>('/login');
    return response.data.login_url;
  }

  static async handleGitHubCallback(request: GitHubAuthRequest): Promise<GitHubAuthResponse> {
    const response = await apiClient.post<GitHubAuthResponse>('/callback', request);
    return response.data;
  }

  static async getAuthStatus(): Promise<AuthStatus> {
    const response = await apiClient.get<AuthStatus>('/status');
    return response.data;
  }
}