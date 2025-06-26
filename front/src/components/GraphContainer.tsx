import React, { useState } from 'react';
import PiledBarPlot from './PiledBarPlot';
import BubbleChart from './BubbleChart';
import TimeLapseSlider from './TimeLapseSlider';

type GraphType = 'bar' | 'bubble';

const GraphContainer: React.FC = () => {
  const [graphType, setGraphType] = useState<GraphType>('bar');
  const [timePoint, setTimePoint] = useState(100); // percentage of timeline

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="graph-type">Graph Type: </label>
        <select
          id="graph-type"
          value={graphType}
          onChange={(e) => setGraphType(e.target.value as GraphType)}
        >
          <option value="bar">Stacked Bar Chart</option>
          <option value="bubble">Bubble Chart</option>
        </select>
      </div>
      
      <TimeLapseSlider 
        value={timePoint} 
        onChange={setTimePoint}
      />
      
      <div style={{ minHeight: '400px', marginTop: '1rem' }}>
        {graphType === 'bar' ? 
          <PiledBarPlot timePoint={timePoint} /> : 
          <BubbleChart timePoint={timePoint} />
        }
      </div>
    </div>
  );
};

export default GraphContainer;