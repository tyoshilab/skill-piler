import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

interface BubbleChartProps {
  timePoint: number;
}

const BubbleChart: React.FC<BubbleChartProps> = ({ timePoint }) => {
  const { currentAnalysis } = useAnalysisStore();

  if (!currentAnalysis) {
    return <div>No data available</div>;
  }

  // TODO: Implement time-based filtering based on timePoint
  const data = currentAnalysis.languages.map((lang, index) => ({
    x: lang.commit_count,
    y: lang.line_count,
    z: lang.intensity * 100, // bubble size
    name: lang.language,
    color: `hsl(${(index * 360) / currentAnalysis.languages.length}, 70%, 50%)`
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ 
          background: 'white', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <p><strong>{data.name}</strong></p>
          <p>Commits: {data.x}</p>
          <p>Lines of Code: {data.y}</p>
          <p>Intensity: {(data.z / 100).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h4>Programming Language Intensity (Bubble Chart)</h4>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name="Commits" />
          <YAxis type="number" dataKey="y" name="Lines of Code" />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={data}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BubbleChart;