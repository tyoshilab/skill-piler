import { create } from 'zustand';
import { AnalysisRequest, AnalysisResult, AnalysisJob } from '../types/analysis';

interface AnalysisStore {
  currentAnalysis: AnalysisResult | null;
  currentJob: AnalysisJob | null;
  isLoading: boolean;
  error: string | null;
  
  startAnalysis: (request: AnalysisRequest) => Promise<void>;
  clearAnalysis: () => void;
  setError: (error: string | null) => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  currentAnalysis: null,
  currentJob: null,
  isLoading: false,
  error: null,
  
  startAnalysis: async (request: AnalysisRequest) => {
    set({ isLoading: true, error: null });
    
    try {
      // TODO: Implement actual API call
      // Mock data for now
      setTimeout(() => {
        const mockResult: AnalysisResult = {
          username: request.github_username,
          analysis_date: new Date().toISOString(),
          total_repositories: 10,
          total_commits: 150,
          analysis_period_months: 12,
          languages: [
            {
              language: 'JavaScript',
              intensity: 0.8,
              commit_count: 50,
              line_count: 2000,
              repository_count: 4
            },
            {
              language: 'Python',
              intensity: 0.6,
              commit_count: 30,
              line_count: 1500,
              repository_count: 3
            },
            {
              language: 'TypeScript',
              intensity: 0.4,
              commit_count: 20,
              line_count: 800,
              repository_count: 2
            }
          ]
        };
        
        set({ 
          currentAnalysis: mockResult,
          isLoading: false 
        });
      }, 2000);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      });
    }
  },
  
  clearAnalysis: () => {
    set({ 
      currentAnalysis: null, 
      currentJob: null, 
      error: null 
    });
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));