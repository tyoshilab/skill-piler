import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

interface PiledBarPlotProps {
  timePoint: number;
}

const PiledBarPlot: React.FC<PiledBarPlotProps> = ({ timePoint }) => {
  const { currentAnalysis } = useAnalysisStore();

  if (!currentAnalysis) {
    return <div>No data available</div>;
  }

  // TODO: Implement time-based filtering based on timePoint
  const data = currentAnalysis.languages.map(lang => ({
    name: lang.language,
    intensity: lang.intensity,
    commits: lang.commit_count,
    lines: lang.line_count
  }));

  return (
    <div>
      <h4>Programming Language Intensity (Stacked Bar Chart)</h4>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="intensity" fill="#8884d8" name="Intensity Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PiledBarPlot;