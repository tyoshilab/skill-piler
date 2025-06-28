import axios from 'axios';
import { ApiService } from './apiService';
import { AnalysisRequest, AnalysisJob, AnalysisResult } from '../types/analysis';

// axiosをモック
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// axios.createのモック
const mockApiClient = {
  post: jest.fn(),
  get: jest.fn(),
};

// axios.createが呼ばれたときにモッククライアントを返す
mockedAxios.create.mockReturnValue(mockApiClient as any);

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startAnalysis', () => {
    it('正しいエンドポイントとデータでPOSTリクエストを送信する', async () => {
      const request: AnalysisRequest = {
        github_username: 'testuser',
        include_private: true,
      };
      
      const responseData: AnalysisJob = {
        job_id: 'job-123',
        status: 'pending',
        created_at: new Date(),
        completed_at: undefined,
        error_message: undefined,
        result: undefined,
      };

      mockApiClient.post.mockResolvedValue({ data: responseData });

      const result = await ApiService.startAnalysis(request);

      // axios.postが期待通りに呼ばれたか
      expect(mockApiClient.post).toHaveBeenCalledWith('/analyze', request);
      // 正しいレスポンスデータを返しているか
      expect(result).toEqual(responseData);
    });

    it('APIエラー時に例外をスローする', async () => {
      const request: AnalysisRequest = {
        github_username: 'testuser',
        include_private: false,
      };

      const error = new Error('Network Error');
      mockApiClient.post.mockRejectedValue(error);

      // エラーがスローされることをアサート
      await expect(ApiService.startAnalysis(request)).rejects.toThrow('Network Error');
    });
  });

  describe('getAnalysisStatus', () => {
    it('正しいエンドポイントでGETリクエストを送信する', async () => {
      const jobId = 'job-123';
      const responseData: AnalysisJob = {
        job_id: jobId,
        status: 'processing',
        created_at: new Date(),
        completed_at: undefined,
        error_message: undefined,
        result: undefined,
      };

      mockApiClient.get.mockResolvedValue({ data: responseData });

      const result = await ApiService.getAnalysisStatus(jobId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/analyze/${jobId}`);
      expect(result).toEqual(responseData);
    });

    it('存在しないジョブIDで404エラーが発生する', async () => {
      const jobId = 'nonexistent-job';
      const error = new Error('Not Found');
      
      mockApiClient.get.mockRejectedValue(error);

      await expect(ApiService.getAnalysisStatus(jobId)).rejects.toThrow('Not Found');
    });
  });

  describe('getAnalysisResult', () => {
    it('正しいエンドポイントでGETリクエストを送信する', async () => {
      const jobId = 'job-123';
      const responseData: AnalysisResult = {
        username: 'testuser',
        analysis_date: new Date(),
        languages: [
          {
            language: 'Python',
            intensity: 85.5,
            commit_count: 150,
            line_count: 25000,
            repository_count: 5,
          },
        ],
        total_repositories: 10,
        total_commits: 300,
        analysis_period_months: 12,
      };

      mockApiClient.get.mockResolvedValue({ data: responseData });

      const result = await ApiService.getAnalysisResult(jobId);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/analyze/${jobId}/result`);
      expect(result).toEqual(responseData);
    });

    it('未完了のジョブで結果取得時にエラーが発生する', async () => {
      const jobId = 'incomplete-job';
      const error = new Error('Analysis not completed');
      
      mockApiClient.get.mockRejectedValue(error);

      await expect(ApiService.getAnalysisResult(jobId)).rejects.toThrow('Analysis not completed');
    });
  });

  describe('getTimeSeriesData', () => {
    it('デフォルトパラメータでGETリクエストを送信する', async () => {
      const username = 'testuser';
      const responseData = {
        time_series_data: [
          {
            date: '2023-01',
            languages: [
              { language: 'Python', intensity: 80 },
              { language: 'JavaScript', intensity: 60 },
            ],
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({ data: responseData });

      const result = await ApiService.getTimeSeriesData(username);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/analyze/timeseries/${username}?`);
      expect(result).toEqual(responseData.time_series_data);
    });

    it('timePointパラメータ付きでGETリクエストを送信する', async () => {
      const username = 'testuser';
      const timePoint = 6;
      const responseData = {
        time_series_data: [
          {
            date: '2023-06',
            languages: [
              { language: 'Python', intensity: 75 },
            ],
          },
        ],
      };

      mockApiClient.get.mockResolvedValue({ data: responseData });

      const result = await ApiService.getTimeSeriesData(username, timePoint);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/analyze/timeseries/${username}?months=6`);
      expect(result).toEqual(responseData.time_series_data);
    });
  });

  describe('Auth endpoints', () => {
    it('getGitHubLoginUrl - ログインURLを取得する', async () => {
      const responseData = { login_url: 'https://github.com/login/oauth/authorize?...' };
      
      mockApiClient.get.mockResolvedValue({ data: responseData });

      const result = await ApiService.getGitHubLoginUrl();

      expect(mockApiClient.get).toHaveBeenCalledWith('/login');
      expect(result).toEqual(responseData.login_url);
    });

    it('handleGitHubCallback - コールバックを処理する', async () => {
      const request = { code: 'oauth-code', state: 'state-value' };
      const responseData = { 
        access_token: 'token', 
        user: { login: 'testuser', name: 'Test User' } 
      };
      
      mockApiClient.post.mockResolvedValue({ data: responseData });

      const result = await ApiService.handleGitHubCallback(request);

      expect(mockApiClient.post).toHaveBeenCalledWith('/callback', request);
      expect(result).toEqual(responseData);
    });

    it('getAuthStatus - 認証ステータスを取得する', async () => {
      const responseData = { 
        is_authenticated: true, 
        user: { login: 'testuser' } 
      };
      
      mockApiClient.get.mockResolvedValue({ data: responseData });

      const result = await ApiService.getAuthStatus();

      expect(mockApiClient.get).toHaveBeenCalledWith('/status');
      expect(result).toEqual(responseData);
    });
  });
});