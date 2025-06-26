import React, { useMemo } from 'react';

interface TimeLapseSliderProps {
  value: number; // Time period in months (0 = all time, 6 = last 6 months, etc.)
  onChange: (value: number) => void;
}

const TimeLapseSlider: React.FC<TimeLapseSliderProps> = ({ value, onChange }) => {
  const timeOptions = [
    { value: 0, label: 'All Time' },
    { value: 3, label: 'Last 3 Months' },
    { value: 6, label: 'Last 6 Months' },
    { value: 12, label: 'Last Year' },
    { value: 24, label: 'Last 2 Years' },
    { value: 36, label: 'Last 3 Years' }
  ];

  const currentLabel = useMemo(() => {
    const option = timeOptions.find(opt => opt.value === value);
    return option ? option.label : `Last ${value} Months`;
  }, [value, timeOptions]);

  const getSliderPosition = (monthValue: number) => {
    if (monthValue === 0) return 0;
    // Map months to slider position (0-100)
    // 3 months = 20, 6 months = 40, 12 months = 60, 24 months = 80, 36 months = 100
    const positions = { 3: 20, 6: 40, 12: 60, 24: 80, 36: 100 };
    return positions[monthValue as keyof typeof positions] || 
           Math.min(100, (monthValue / 36) * 100);
  };

  const getMonthsFromPosition = (position: number) => {
    if (position === 0) return 0;
    if (position <= 20) return 3;
    if (position <= 40) return 6;
    if (position <= 60) return 12;
    if (position <= 80) return 24;
    return 36;
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const position = Number(e.target.value);
    const months = getMonthsFromPosition(position);
    onChange(months);
  };

  return (
    <div className="flex flex-col space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <label htmlFor="time-slider" className="text-sm font-medium text-gray-700">
          Analysis Time Period:
        </label>
        <span className="text-sm font-semibold text-blue-600">
          {currentLabel}
        </span>
      </div>
      
      <div className="relative">
        <input
          id="time-slider"
          type="range"
          min="0"
          max="100"
          value={getSliderPosition(value)}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        
        {/* Time markers */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>All Time</span>
          <span>3M</span>
          <span>6M</span>
          <span>1Y</span>
          <span>2Y</span>
          <span>3Y</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-600">
        <p>
          {value === 0 
            ? 'Showing all available data from your GitHub repositories'
            : `Analyzing commits and activity from the last ${value} months`
          }
        </p>
      </div>
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider:focus {
          outline: none;
        }
        
        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  );
};

export default TimeLapseSlider;