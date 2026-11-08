import React, { useState } from 'react';
import { PieChart, TrendingDown } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const COLORS = [
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#10b981', // Emerald
];

const ExpenseDistributionChart = ({ expenses, totalExpense }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!expenses || expenses.length === 0 || totalExpense <= 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 dark:border-white/[0.08] rounded-3xl">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
          <PieChart className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No expense distribution data</p>
        <p className="text-xs text-slate-400 mt-0.5">Add expense records to view 3D category charts</p>
      </div>
    );
  }

  // Calculate SVG donut segments
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;
  const segments = expenses.map((item, idx) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += item.percentage;
    const color = COLORS[idx % COLORS.length];

    return {
      ...item,
      color,
      strokeDasharray,
      strokeDashoffset,
      idx
    };
  });

  const activeItem = hoveredIdx !== null ? segments[hoveredIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* 3D SVG Donut Canvas */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center select-none">
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="w-full h-full transform -rotate-90"
        >
          {/* Base background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-white/[0.05]"
          />

          {/* Segment rings */}
          {segments.map((seg) => {
            const isHovered = hoveredIdx === seg.idx;
            return (
              <circle
                key={seg.idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(seg.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${seg.color})` : 'none'
                }}
              />
            );
          })}
        </svg>

        {/* Center Hole Information */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {activeItem ? activeItem.category : 'TOTAL EXP'}
          </p>
          <div className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            <AnimatedNumber value={activeItem ? activeItem.amount : totalExpense} prefix="৳" duration={450} />
          </div>
          <span className="text-[10px] font-bold font-mono text-rose-500">
            {activeItem ? `${activeItem.percentage}%` : '100%'}
          </span>
        </div>
      </div>

      {/* Category Legend List */}
      <div className="flex-1 w-full space-y-2">
        {segments.map((seg) => {
          const isHovered = hoveredIdx === seg.idx;
          return (
            <div
              key={seg.idx}
              onMouseEnter={() => setHoveredIdx(seg.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2 rounded-2xl flex items-center justify-between text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isHovered 
                  ? 'bg-slate-100 dark:bg-white/[0.07] scale-[1.02]' 
                  : 'hover:bg-slate-50 dark:hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span 
                  className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-800 dark:text-slate-200 truncate">{seg.category}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-400 dark:text-slate-400 font-mono text-[11px]">
                  ({seg.percentage}%)
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ৳{seg.amount.toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseDistributionChart;

