import { act } from '@testing-library/react';
import { useAnalysisStore } from './useAnalysisStore';
import { ApiService } from '../services/apiService';

// ApiServiceをモック
jest.mock('../services/apiService');
// タイマーをモック
jest.useFakeTimers();

const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

describe('useAnalysisStore', () => {
  beforeEach(() => {
    // ストアを初期状態にリセット
    useAnalysisStore.setState({
      currentAnalysis: null,
      currentJob: null,
      timeSeriesData: null,
      isLoading: false,
      isLoadingTimeSeries: false,
      error: null,
    });
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('startAnalysis', () => {
    it('分析開始時に状態が正しく更新される', async () => {
      const mockJob = {
        job_id: 'job-123',
        status: 'pending' as const,
        created_at: new Date(),
      };

      mockApiService.startAnalysis.mockResolvedValue(mockJob);
      mockApiService.getAnalysisStatus.mockResolvedValue({
        ...mockJob,
        status: 'completed' as const,
        completed_at: new Date(),
      });
      mockApiService.getAnalysisResult.mockResolvedValue({
        username: 'testuser',
        analysis_date: new Date(),
        languages: [],
        total_repositories: 5,
        total_commits: 100,
        analysis_period_months: 12,
      });

      const request = { github_username: 'testuser', include_private: false };

      // startAnalysisを実行
      await act(async () => {
        await useAnalysisStore.getState().startAnalysis(request);
      });

      // 初期状態の確認
      expect(useAnalysisStore.getState().currentJob).toEqual(mockJob);
      expect(mockApiService.startAnalysis).toHaveBeenCalledWith(request);
    });

    it('分析開始時にエラーが発生した場合の状態更新', async () => {
      const error = new Error('API Error');
      mockApiService.startAnalysis.mockRejectedValue(error);

      const request = { github_username: 'testuser', include_private: false };

      await act(async () => {
        await useAnalysisStore.getState().startAnalysis(request);
      });

      const state = useAnalysisStore.getState();
      expect(state.error).toBe('API Error');
      expect(state.isLoading).toBe(false);
      expect(state.currentAnalysis).toBeNull();
    });
  });

  describe('pollJobStatus', () => {
    it('ジョブが成功するまでポーリングし、成功後に結果を取得する', async () => {
      const jobId = 'job-123';
      const mockResult = {
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

      // ポーリングの段階的レスポンス設定
      mockApiService.getAnalysisStatus
        .mockResolvedValueOnce({
          job_id: jobId,
          status: 'processing',
          created_at: new Date(),
        })
        .mockResolvedValueOnce({
          job_id: jobId,
          status: 'completed',
          created_at: new Date(),
          completed_at: new Date(),
        });

      mockApiService.getAnalysisResult.mockResolvedValue(mockResult);

      // ポーリング開始
      await act(async () => {
        useAnalysisStore.getState().pollJobStatus(jobId);
      });

      // 1回目のポーリング (processing)
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve(); // マイクロタスクの処理を待つ
      });

      expect(mockApiService.getAnalysisStatus).toHaveBeenCalledTimes(1);
      expect(useAnalysisStore.getState().currentJob?.status).toBe('processing');

      // 2回目のポーリング (completed)
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      expect(mockApiService.getAnalysisStatus).toHaveBeenCalledTimes(2);
      expect(mockApiService.getAnalysisResult).toHaveBeenCalledWith(jobId);
      
      const finalState = useAnalysisStore.getState();
      expect(finalState.currentAnalysis).toEqual(mockResult);
      expect(finalState.isLoading).toBe(false);
    });

    it('ジョブが失敗した場合のエラーハンドリング', async () => {
      const jobId = 'job-123';
      const failedJob = {
        job_id: jobId,
        status: 'failed' as const,
        created_at: new Date(),
        completed_at: new Date(),
        error_message: 'Analysis failed due to invalid repository',
      };

      mockApiService.getAnalysisStatus.mockResolvedValue(failedJob);

      await act(async () => {
        useAnalysisStore.getState().pollJobStatus(jobId);
      });

      // ポーリング実行
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      const state = useAnalysisStore.getState();
      expect(state.error).toBe('Analysis failed due to invalid repository');
      expect(state.isLoading).toBe(false);
    });

    it('ポーリングがタイムアウトした場合のエラーハンドリング', async () => {
      const jobId = 'job-123';
      
      mockApiService.getAnalysisStatus.mockResolvedValue({
        job_id: jobId,
        status: 'processing',
        created_at: new Date(),
      });

      await act(async () => {
        useAnalysisStore.getState().pollJobStatus(jobId);
      });

      // 最大試行回数まで時間を進める (60回 * 5秒 = 300秒)
      await act(async () => {
        jest.advanceTimersByTime(300000);
        await Promise.resolve();
      });

      const state = useAnalysisStore.getState();
      expect(state.error).toBe('Analysis timeout - please try again');
      expect(state.isLoading).toBe(false);
    });

    it('ポーリング中にAPIエラーが発生した場合のエラーハンドリング', async () => {
      const jobId = 'job-123';
      const error = new Error('Network Error');
      
      mockApiService.getAnalysisStatus.mockRejectedValue(error);

      await act(async () => {
        useAnalysisStore.getState().pollJobStatus(jobId);
      });

      // ポーリング実行
      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      const state = useAnalysisStore.getState();
      expect(state.error).toBe('Network Error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadTimeSeriesData', () => {
    it('時系列データを正常に読み込む', async () => {
      const mockTimeSeriesData = [
        {
          date: '2023-01',
          languages: [
            { language: 'Python', intensity: 80 },
            { language: 'JavaScript', intensity: 60 },
          ],
        },
      ];

      mockApiService.getTimeSeriesData.mockResolvedValue(mockTimeSeriesData);

      await act(async () => {
        await useAnalysisStore.getState().loadTimeSeriesData('testuser', 6);
      });

      const state = useAnalysisStore.getState();
      expect(state.timeSeriesData).toEqual(mockTimeSeriesData);
      expect(state.isLoadingTimeSeries).toBe(false);
      expect(mockApiService.getTimeSeriesData).toHaveBeenCalledWith('testuser', 6);
    });

    it('時系列データ読み込み時のエラーハンドリング', async () => {
      const error = new Error('Time series data not found');
      mockApiService.getTimeSeriesData.mockRejectedValue(error);

      await act(async () => {
        await useAnalysisStore.getState().loadTimeSeriesData('testuser', 12);
      });

      const state = useAnalysisStore.getState();
      expect(state.error).toBe('Time series data not found');
      expect(state.isLoadingTimeSeries).toBe(false);
      expect(state.timeSeriesData).toBeNull();
    });
  });

  describe('clearAnalysis', () => {
    it('分析データをクリアする', () => {
      // 初期状態をセット
      useAnalysisStore.setState({
        currentAnalysis: { username: 'test' } as any,
        currentJob: { job_id: '123' } as any,
        timeSeriesData: [{ date: '2023-01' }] as any,
        error: 'Some error',
        isLoading: true,
        isLoadingTimeSeries: true,
      });

      act(() => {
        useAnalysisStore.getState().clearAnalysis();
      });

      const state = useAnalysisStore.getState();
      expect(state.currentAnalysis).toBeNull();
      expect(state.currentJob).toBeNull();
      expect(state.timeSeriesData).toBeNull();
      expect(state.error).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isLoadingTimeSeries).toBe(false);
    });
  });

  describe('setError', () => {
    it('エラーメッセージを設定する', () => {
      act(() => {
        useAnalysisStore.getState().setError('Custom error message');
      });

      expect(useAnalysisStore.getState().error).toBe('Custom error message');
    });

    it('エラーメッセージをクリアする', () => {
      // エラーをセット
      useAnalysisStore.setState({ error: 'Some error' });

      act(() => {
        useAnalysisStore.getState().setError(null);
      });

      expect(useAnalysisStore.getState().error).toBeNull();
    });
  });
});