import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "./Histogram.css";

const Histogram = ({ Input = [], Output = [], bins = 100, style }) => {
  const data = useMemo(() => {
    const allValues = [...Input, ...Output].filter(v => typeof v === 'number');
    const min = allValues.length ? Math.min(...allValues) : -3;
    const max = allValues.length ? Math.max(...allValues) : 3;
    const range = max === min ? 1 : max - min;
    const step = range / bins;

    // Initialize bins
    const histogram = Array.from({ length: bins }, (_, i) => ({
      range: (min + i * step).toFixed(1),
      Input: 0,
      Output: 0,
    }));

    // Single-pass distribution (O(n) vs previous O(n*bins))
    const fillBins = (arr, key) => {
      arr.forEach(val => {
        const binIndex = Math.min(Math.floor((val - min) / step), bins - 1);
        if (binIndex >= 0) histogram[binIndex][key]++;
      });
    };

    fillBins(Input, 'Input');
    fillBins(Output, 'Output');

    return histogram;
  }, [Input, Output, bins]);

  return (
    <div className="histogram-wrapper" style={style}>
      <h3 className="histogram-title">NORMALIZATION TRANSFORMATION</h3>
      <div className="histogram-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="range" fontSize={10} tick={{ fill: '#888' }} />
            <YAxis fontSize={10} tick={{ fill: '#888' }} />
            <Tooltip />
            <Legend verticalAlign="top" align="right" height={30} />
            <Area 
              type="monotone" 
              dataKey="Input" 
              stroke="#3b82f6" 
              fill="url(#colorA)" 
              strokeWidth={2} 
              isAnimationActive={false}
            />
            <Area 
              type="monotone" 
              dataKey="Output" 
              stroke="#ef4444" 
              fill="url(#colorB)" 
              strokeWidth={2} 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Histogram;