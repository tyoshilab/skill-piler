export interface AnalysisRequest {
  github_username: string;
  include_private: boolean;
  access_token?: string;
}

export interface LanguageIntensity {
  language: string;
  intensity: number;
  commit_count: number;
  line_count: number;
  repository_count: number;
}

export interface AnalysisResult {
  username: string;
  analysis_date: string;
  languages: LanguageIntensity[];
  total_repositories: number;
  total_commits: number;
  analysis_period_months: number;
}

export interface AnalysisJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  result?: AnalysisResult;
  error_message?: string;
}