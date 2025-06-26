import React from 'react';
import GraphContainer from './GraphContainer';
import ShareButton from './ShareButton';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

const AnalysisResult: React.FC = () => {
  const { currentAnalysis } = useAnalysisStore();

  if (!currentAnalysis) {
    return null;
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Analysis Result for {currentAnalysis.username}</h3>
        <ShareButton />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <p>Total Repositories: {currentAnalysis.total_repositories}</p>
        <p>Total Commits: {currentAnalysis.total_commits}</p>
        <p>Analysis Period: {currentAnalysis.analysis_period_months} months</p>
      </div>
      
      <GraphContainer />
    </div>
  );
};

export default AnalysisResult;