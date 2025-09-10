import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import './PowerChart.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-date">{`2025-09-09`}</p>
        <p className="tooltip-time-range">{`${label}:00-${parseInt(label, 10) + 1}:00 用电量`}</p>
        <p className="tooltip-value">{`● 114_空调水机主机: ${payload[0].value} kWh`}</p>
      </div>
    );
  }
  return null;
};

function PowerChart({ data, yAxisLabel }) {
  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="1 5" stroke="rgba(0, 212, 255, 0.1)" />
          <XAxis 
            dataKey="time" 
            stroke="rgba(255, 255, 255, 0.7)" 
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }} 
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
            tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.7)" 
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }} 
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
            tickLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: 'rgba(255, 255, 255, 0.7)', dy: 40, dx: -10, fontSize: 14 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#00d4ff', strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Legend 
             verticalAlign="top" 
             align="center"
             iconType="circle"
             wrapperStyle={{ top: -5, color: '#ffffff' }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#00d4ff" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#chartGradient)" 
            name="114_空调水机主机"
            dot={{ stroke: '#00d4ff', strokeWidth: 1, r: 4, fill: '#0a1929' }}
            activeDot={{ r: 6, fill: '#fff', stroke: '#00d4ff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PowerChart;
