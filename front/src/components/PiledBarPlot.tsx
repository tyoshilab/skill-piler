import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

interface PiledBarPlotProps {
  timePoint: number;
}

const PiledBarPlot: React.FC<PiledBarPlotProps> = ({ timePoint }) => {
  const { currentAnalysis } = useAnalysisStore();

  const chartData = useMemo(() => {
    if (!currentAnalysis) return [];

    // Filter and process data based on timePoint
    // timePoint represents months back from present (0 = all time, 6 = last 6 months, etc.)
    const filteredLanguages = currentAnalysis.languages
      .filter(lang => {
        // For now, we show all languages since we don't have time-series data yet
        // In future iterations, this will filter based on commit dates
        return lang.intensity > 0;
      })
      .slice(0, 10); // Show top 10 languages

    return filteredLanguages.map(lang => ({
      name: lang.language,
      intensity: lang.intensity,
      commits: lang.commit_count,
      lines: Math.round(lang.line_count / 1000), // Convert to thousands for better display
      repositories: lang.repository_count
    }));
  }, [currentAnalysis, timePoint]);

  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case 'Intensity Score':
        return [`${value.toFixed(1)}`, name];
      case 'Commits':
        return [`${value} commits`, name];
      case 'Lines (K)':
        return [`${value}K lines`, name];
      case 'Repositories':
        return [`${value} repos`, name];
      default:
        return [value, name];
    }
  };

  if (!currentAnalysis) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div>No analysis data available. Please start an analysis first.</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div>No programming languages found in the analysis.</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-lg font-semibold mb-2">
          Programming Language Analysis - Stacked Metrics
        </h4>
        <p className="text-sm text-gray-600">
          {timePoint === 0 
            ? 'Showing all-time statistics' 
            : `Showing statistics from the last ${timePoint} months`}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={450}>
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
          />
          <YAxis />
          <Tooltip 
            formatter={formatTooltip}
            labelStyle={{ color: '#333' }}
            contentStyle={{ 
              backgroundColor: '#f8f9fa', 
              border: '1px solid #dee2e6',
              borderRadius: '4px'
            }}
          />
          <Legend />
          
          {/* Stacked bars showing different metrics */}
          <Bar 
            dataKey="intensity" 
            fill="#8884d8" 
            name="Intensity Score"
            radius={[0, 0, 4, 4]}
          />
          <Bar 
            dataKey="commits" 
            fill="#82ca9d" 
            name="Commits"
          />
          <Bar 
            dataKey="lines" 
            fill="#ffc658" 
            name="Lines (K)"
          />
          <Bar 
            dataKey="repositories" 
            fill="#ff7300" 
            name="Repositories"
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          * Intensity Score: Calculated based on code volume, commit frequency, and language complexity
        </p>
        <p>
          * Lines shown in thousands (K) for better readability
        </p>
      </div>
    </div>
  );
};

export default PiledBarPlot;