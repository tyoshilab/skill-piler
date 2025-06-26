import { create } from 'zustand';
import { AnalysisRequest, AnalysisResult, AnalysisJob } from '../types/analysis';
import { ApiService } from '../services/apiService';

interface AnalysisStore {
  currentAnalysis: AnalysisResult | null;
  currentJob: AnalysisJob | null;
  isLoading: boolean;
  error: string | null;
  
  startAnalysis: (request: AnalysisRequest) => Promise<void>;
  clearAnalysis: () => void;
  setError: (error: string | null) => void;
  pollJobStatus: (jobId: string) => Promise<void>;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  currentAnalysis: null,
  currentJob: null,
  isLoading: false,
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
  
  clearAnalysis: () => {
    set({ 
      currentAnalysis: null, 
      currentJob: null, 
      error: null,
      isLoading: false
    });
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));