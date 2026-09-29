'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CustomTooltip } from './CustomTooltip';
import { DailyChartData } from '../types/weather';

interface DailyPrecipitationChartProps {
  data: DailyChartData[];
}

export const DailyPrecipitationChart: React.FC<DailyPrecipitationChartProps> = ({ data }) => {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#94a3b8" 
            fontSize={10} 
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis 
            stroke="#94a3b8" 
            fontSize={12} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value}%`} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
          <Bar 
            dataKey="precipProb" 
            name="Precipitation Chance" 
            fill="#8b5cf6" 
            radius={[4, 4, 0, 0]} 
            unit="%" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};