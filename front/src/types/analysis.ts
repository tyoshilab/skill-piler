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

export interface TimeSeriesDataPoint {
  date: string; // YYYY-MM format
  [language: string]: string | number; // Dynamic language properties
}

export interface LanguageIntensityTimeSeries {
  language: string;
  intensity: number;
  commit_count: number;
  line_count: number;
  repository_count: number;
  time_series?: TimeSeriesDataPoint[]; // Monthly intensity data
}

export interface AnalysisResult {
  username: string;
  analysis_date: string;
  languages: LanguageIntensity[];
  total_repositories: number;
  total_commits: number;
  analysis_period_months: number;
  time_series_data?: TimeSeriesDataPoint[]; // 時系列データ
}

export interface AnalysisJob {
  job_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  result?: AnalysisResult;
  error_message?: string;
}