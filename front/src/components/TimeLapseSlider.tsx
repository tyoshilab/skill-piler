import React from 'react';

interface TimeLapseSliderProps {
  value: number; // 0-100 percentage of timeline
  onChange: (value: number) => void;
}

const TimeLapseSlider: React.FC<TimeLapseSliderProps> = ({ value, onChange }) => {
  return (
    <div style={{ margin: '1rem 0' }}>
      <label htmlFor="time-slider">Time Period: </label>
      <input
        id="time-slider"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '300px', marginLeft: '10px' }}
      />
      <span style={{ marginLeft: '10px' }}>
        {value === 100 ? 'All Time' : `${value}% of Timeline`}
      </span>
    </div>
  );
};

export default TimeLapseSlider;