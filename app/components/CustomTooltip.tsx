'use client';

import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: string | number;
    color?: string;
    unit?: string;
  }>;
  label?: string;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-md shadow-xl backdrop-blur-md">
        {label && <p className="text-slate-300 text-sm mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" >
            {entry.name}: <span style={{ color: entry.color }}>{entry.value} {entry.unit || ''}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};