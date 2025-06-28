import { create } from 'zustand';
import { AnalysisRequest, AnalysisResult, AnalysisJob, TimeSeriesDataPoint } from '../types/analysis';
import { ApiService } from '../services/apiService';

interface AnalysisStore {
  currentAnalysis: AnalysisResult | null;
  currentJob: AnalysisJob | null;
  timeSeriesData: TimeSeriesDataPoint[] | null;
  isLoading: boolean;
  isLoadingTimeSeries: boolean;
  error: string | null;
  
  startAnalysis: (request: AnalysisRequest) => Promise<void>;
  loadTimeSeriesData: (username: string, timePoint: number) => Promise<void>;
  clearAnalysis: () => void;
  setError: (error: string | null) => void;
  pollJobStatus: (jobId: string) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  currentAnalysis: null,
  currentJob: null,
  timeSeriesData: null,
  isLoading: false,
  isLoadingTimeSeries: false,
  error: null,
  
  startAnalysis: async (request: AnalysisRequest) => {
    set({ isLoading: true, error: null, currentAnalysis: null });
    
    try {
      // Start the analysis job
      const job = await ApiService.startAnalysis(request);
      set({ currentJob: job });
      
      // Start polling for job completion
      await get().pollJobStatus(job.job_id);
      
    } catch (error) {
      console.error('Analysis start failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to start analysis',
        isLoading: false 
      });
    }
  },
  
  pollJobStatus: async (jobId: string) => {
    const maxAttempts = 60; // Max 5 minutes (60 * 5 seconds)
    let attempts = 0;
    
    const pollInterval = setInterval(async () => {
      try {
        attempts++;
        
        // Get job status
        const job = await ApiService.getAnalysisStatus(jobId);
        set({ currentJob: job });
        
        if (job.status === 'completed') {
          // Get the result
          const result = await ApiService.getAnalysisResult(jobId);
          set({ 
            currentAnalysis: result, 
            isLoading: false 
          });
          clearInterval(pollInterval);
        } else if (job.status === 'failed') {
          set({ 
            error: job.error_message || 'Analysis failed',
            isLoading: false 
          });
          clearInterval(pollInterval);
        } else if (attempts >= maxAttempts) {
          set({ 
            error: 'Analysis timeout - please try again',
            isLoading: false 
          });
          clearInterval(pollInterval);
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        set({ 
          error: error instanceof Error ? error.message : 'Failed to check analysis status',
          isLoading: false 
        });
        clearInterval(pollInterval);
      }
    }, 5000); // Poll every 5 seconds
  },

  loadTimeSeriesData: async (username: string, timePoint: number) => {
    set({ isLoadingTimeSeries: true, error: null });
    
    try {
      const timeSeriesData = await ApiService.getTimeSeriesData(username, timePoint);
      set({ 
        timeSeriesData,
        isLoadingTimeSeries: false 
      });
    } catch (error) {
      console.error('Time series data loading failed:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load time series data',
        isLoadingTimeSeries: false 
      });
    }
  },
  
  clearAnalysis: () => {
    set({ 
      currentAnalysis: null, 
      currentJob: null, 
      timeSeriesData: null,
      error: null,
      isLoading: false,
      isLoadingTimeSeries: false
    });
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));