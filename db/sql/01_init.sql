-- Database initialization for Skill Piler
-- Creates tables for user authentication and analysis caching

-- Users table for OAuth authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    github_username VARCHAR(255) UNIQUE NOT NULL,
    github_user_id INTEGER UNIQUE NOT NULL,
    access_token_encrypted TEXT,
    scopes TEXT[], -- Array of granted OAuth scopes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Analysis jobs table for tracking analysis status
CREATE TABLE IF NOT EXISTS analysis_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER REFERENCES users(id),
    github_username VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    include_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT
);

-- Analysis results table for storing computed skill data
CREATE TABLE IF NOT EXISTS analysis_results (
    id SERIAL PRIMARY KEY,
    job_id UUID REFERENCES analysis_jobs(id) ON DELETE CASCADE,
    username VARCHAR(255) NOT NULL,
    total_repositories INTEGER NOT NULL,
    total_commits INTEGER NOT NULL,
    analysis_period_months INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Language intensities table for detailed skill breakdown
CREATE TABLE IF NOT EXISTS language_intensities (
    id SERIAL PRIMARY KEY,
    result_id INTEGER REFERENCES analysis_results(id) ON DELETE CASCADE,
    language VARCHAR(100) NOT NULL,
    intensity DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    commit_count INTEGER NOT NULL,
    line_count INTEGER NOT NULL,
    repository_count INTEGER NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_github_username ON users(github_username);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_user_id ON analysis_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_language_intensities_result_id ON language_intensities(result_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR each ROW EXECUTE FUNCTION update_updated_at_column();