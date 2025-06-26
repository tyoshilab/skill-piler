import React from 'react';
import UserInput from '../components/UserInput';
import AnalysisResult from '../components/AnalysisResult';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

const MainPage: React.FC = () => {
  const { currentAnalysis } = useAnalysisStore();

  return (
    <div>
      <h2>GitHub スキル分析</h2>
      <p>GitHubのリポジトリを分析して、プログラミング言語の経験値を可視化します。</p>
      
      <UserInput />
      
      {currentAnalysis && <AnalysisResult />}
    </div>
  );
};

export default MainPage;