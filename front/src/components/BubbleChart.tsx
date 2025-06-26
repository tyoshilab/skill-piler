import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useAnalysisStore } from '../hooks/useAnalysisStore';

interface BubbleChartProps {
  timePoint: number;
}

interface BubbleDataPoint {
  x: number;
  y: number;
  z: number;
  name: string;
  intensity: number;
  repositories: number;
  color: string;
}

const BubbleChart: React.FC<BubbleChartProps> = ({ timePoint }) => {
  const { currentAnalysis } = useAnalysisStore();

  const chartData = useMemo(() => {
    if (!currentAnalysis) return [];

    // Filter and process data based on timePoint
    const filteredLanguages = currentAnalysis.languages
      .filter(lang => {
        // For now, we show all languages since we don't have time-series data yet
        // In future iterations, this will filter based on commit dates
        return lang.intensity > 0 && lang.commit_count > 0;
      })
      .slice(0, 15); // Show top 15 languages for better visibility

    return filteredLanguages.map((lang, index): BubbleDataPoint => {
      // Calculate bubble size based on intensity (min 50, max 800)
      const bubbleSize = Math.max(50, Math.min(800, lang.intensity * 8));
      
      // Generate colors based on intensity (cooler = lower, warmer = higher)
      const hue = Math.max(0, Math.min(120, 120 - (lang.intensity / 100) * 120)); // Green to Red scale
      const saturation = Math.max(40, Math.min(90, 40 + (lang.intensity / 100) * 50));
      const lightness = Math.max(45, Math.min(75, 75 - (lang.intensity / 100) * 30));
      
      return {
        x: lang.commit_count,
        y: Math.round(lang.line_count / 1000), // Convert to thousands
        z: bubbleSize,
        name: lang.language,
        intensity: lang.intensity,
        repositories: lang.repository_count,
        color: `hsl(${hue}, ${saturation}%, ${lightness}%)`
      };
    });
  }, [currentAnalysis, timePoint]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: BubbleDataPoint = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Commits:</span> {data.x.toLocaleString()}</p>
            <p><span className="font-medium">Lines of Code:</span> {(data.y * 1000).toLocaleString()}</p>
            <p><span className="font-medium">Repositories:</span> {data.repositories}</p>
            <p><span className="font-medium">Intensity Score:</span> {data.intensity.toFixed(1)}/100</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const LegendContent = () => (
    <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-400"></div>
        <span>Lower Intensity</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
        <span>Medium Intensity</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-red-400"></div>
        <span>Higher Intensity</span>
      </div>
    </div>
  );

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
          Programming Language Experience Bubble Chart
        </h4>
        <p className="text-sm text-gray-600 mb-2">
          {timePoint === 0 
            ? 'Showing all-time statistics' 
            : `Showing statistics from the last ${timePoint} months`}
        </p>
        <p className="text-xs text-gray-500">
          Bubble size and color intensity represent experience level. 
          X-axis: commit count, Y-axis: lines of code (thousands)
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={450}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Commits"
            label={{ value: 'Number of Commits', position: 'insideBottom', offset: -10 }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Lines (K)"
            label={{ value: 'Lines of Code (K)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={chartData}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      
      <LegendContent />
      
      <div className="mt-4 text-xs text-gray-500">
        <p>
          * Bubble size represents experience intensity (larger = more experienced)
        </p>
        <p>
          * Color intensity shows skill level (green = beginner, yellow = intermediate, red = advanced)
        </p>
        <p>
          * Position shows volume relationship between commits and code lines
        </p>
      </div>
    </div>
  );
};

export default BubbleChart;