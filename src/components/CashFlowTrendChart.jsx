import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar,
  Sparkles
} from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

const CashFlowTrendChart = ({ transactions }) => {
  const [period, setPeriod] = useState(7); // 7 or 30 days
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Generate data points for the last N days
  const chartData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('bn-BD', { weekday: 'short', day: 'numeric' });
      const fullDate = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

      let inAmount = 0;
      let outAmount = 0;

      transactions.forEach(t => {
        const tDate = (t.date || t.createdAt || '').split('T')[0];
        if (tDate === dateKey) {
          const amt = Number(t.amount) || 0;
          if (t.type === 'cash_in') inAmount += amt;
          if (t.type === 'cash_out') outAmount += amt;
        }
      });

      days.push({
        dateKey,
        dayLabel,
        fullDate,
        inAmount,
        outAmount,
        net: inAmount - outAmount
      });
    }

    const totalIn = days.reduce((sum, d) => sum + d.inAmount, 0);
    const totalOut = days.reduce((sum, d) => sum + d.outAmount, 0);
    const maxVal = Math.max(...days.map(d => Math.max(d.inAmount, d.outAmount)), 500);

    return { days, totalIn, totalOut, netSavings: totalIn - totalOut, maxVal };
  }, [transactions, period]);

  // Chart dimensions
  const width = 760;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Calculate coordinates for SVG paths
  const pointsIn = chartData.days.map((d, i) => {
    const x = paddingX + (i / (chartData.days.length - 1 || 1)) * plotWidth;
    const y = height - paddingY - (d.inAmount / (chartData.maxVal || 1)) * plotHeight;
    return { x, y, data: d };
  });

  const pointsOut = chartData.days.map((d, i) => {
    const x = paddingX + (i / (chartData.days.length - 1 || 1)) * plotWidth;
    const y = height - paddingY - (d.outAmount / (chartData.maxVal || 1)) * plotHeight;
    return { x, y, data: d };
  });

  // Helper to generate smooth Bézier curves
  const createCurvedPath = (points) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      path += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const linePathIn = createCurvedPath(pointsIn);
  const linePathOut = createCurvedPath(pointsOut);

  const baselineY = height - paddingY;
  const areaPathIn = pointsIn.length > 0 
    ? `${linePathIn} L ${pointsIn[pointsIn.length - 1].x} ${baselineY} L ${pointsIn[0].x} ${baselineY} Z`
    : '';

  const areaPathOut = pointsOut.length > 0 
    ? `${linePathOut} L ${pointsOut[pointsOut.length - 1].x} ${baselineY} L ${pointsOut[0].x} ${baselineY} Z`
    : '';

  const activePointIn = hoveredIndex !== null ? pointsIn[hoveredIndex] : null;
  const activePointOut = hoveredIndex !== null ? pointsOut[hoveredIndex] : null;
  const hoveredData = hoveredIndex !== null ? chartData.days[hoveredIndex] : null;

  return (
    <div className="relative p-5 sm:p-7 rounded-3xl bg-white dark:bg-[#0d1424] border border-slate-200/90 dark:border-white/[0.08] shadow-lg shadow-slate-200/40 dark:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300">
      {/* Ambient background glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Chart Top Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  Cash Flow Dynamic Trend
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  3D Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                দৈনিক আয় (+ In) ও ব্যয়ের (- Out) গতিপ্রকৃতি ও ক্যাশ ফ্লো তুলনা
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Legend Badges */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.07] text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500"></span>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">+ Cash In</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs shadow-rose-500"></span>
              <span className="text-rose-700 dark:text-rose-400 font-bold">- Cash Out</span>
            </div>
          </div>

          {/* Time Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-white/[0.04] rounded-2xl border border-slate-200/80 dark:border-white/[0.07] text-xs font-bold">
            <button
              onClick={() => { setPeriod(7); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 7 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ৭ দিন
            </button>
            <button
              onClick={() => { setPeriod(30); setHoveredIndex(null); }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                period === 30 
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ৩০ দিন
            </button>
          </div>
        </div>
      </div>

      {/* Quick Period Summary Metrics */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-6">
        <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/[0.07] border border-emerald-200/80 dark:border-emerald-500/20 card-interactive">
          <p className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>মোট ইনকাম</span>
          </p>
          <div className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 tracking-tight">
            <AnimatedNumber value={chartData.totalIn} prefix="+৳" duration={600} />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-500/[0.07] border border-rose-200/80 dark:border-rose-500/20 card-interactive">
          <p className="text-[10px] sm:text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>মোট খরচ</span>
          </p>
          <div className="text-base sm:text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5 tracking-tight">
            <AnimatedNumber value={chartData.totalOut} prefix="-৳" duration={600} />
          </div>
        </div>

        <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-500/[0.07] border border-indigo-200/80 dark:border-indigo-500/20 card-interactive">
          <p className="text-[10px] sm:text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>নেট ব্যালেন্স সেভিংস</span>
          </p>
          <div className={`text-base sm:text-xl font-black mt-0.5 tracking-tight ${
            chartData.netSavings >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            <AnimatedNumber 
              value={Math.abs(chartData.netSavings)} 
              prefix={chartData.netSavings >= 0 ? '+৳' : '-৳'} 
              duration={650} 
            />
          </div>
        </div>
      </div>

      {/* SVG Responsive Curved Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-48 sm:h-64 overflow-visible"
        >
          <defs>
            {/* Linear Gradients for Area Fills */}
            <linearGradient id="emeraldAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="70%" stopColor="#10b981" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="roseAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#f43f5e" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing 3D Drop Shadow Filters */}
            <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#10b981" floodOpacity="0.45" />
            </filter>

            <filter id="roseGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#f43f5e" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = height - paddingY - pct * plotHeight;
            const amt = Math.round(pct * chartData.maxVal);
            return (
              <g key={idx}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="currentColor" 
                  strokeDasharray="4 4"
                  className="text-slate-200 dark:text-white/[0.06]" 
                />
                <text 
                  x={paddingX - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[9px] font-semibold"
                >
                  ৳{amt >= 1000 ? `${(amt / 1000).toFixed(0)}k` : amt}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={areaPathIn} fill="url(#emeraldAreaGrad)" />
          <path d={areaPathOut} fill="url(#roseAreaGrad)" />

          {/* Curved Stroke Lines with 3D Glow */}
          <path 
            d={linePathOut} 
            fill="none" 
            stroke="#f43f5e" 
            strokeWidth="3" 
            strokeLinecap="round" 
            filter="url(#roseGlow)" 
          />
          <path 
            d={linePathIn} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="3.5" 
            strokeLinecap="round" 
            filter="url(#emeraldGlow)" 
          />

          {/* Hover Column Highlights */}
          {chartData.days.map((d, i) => {
            const x = paddingX + (i / (chartData.days.length - 1 || 1)) * plotWidth;
            const colWidth = plotWidth / (chartData.days.length || 1);
            const isHovered = hoveredIndex === i;

            return (
              <g 
                key={i} 
                onMouseEnter={() => setHoveredIndex(i)}
                className="cursor-pointer"
              >
                {/* Transparent Hit Target */}
                <rect 
                  x={x - colWidth / 2} 
                  y={paddingY} 
                  width={colWidth} 
                  height={plotHeight} 
                  fill="transparent" 
                />

                {/* Vertical guideline on hover */}
                {isHovered && (
                  <line 
                    x1={x} 
                    y1={paddingY} 
                    x2={x} 
                    y2={baselineY} 
                    stroke="#10b981" 
                    strokeWidth="1.5" 
                    strokeDasharray="3 3"
                    className="opacity-70"
                  />
                )}

                {/* X Axis Label */}
                {(period === 7 || i % 4 === 0 || i === chartData.days.length - 1) && (
                  <text 
                    x={x} 
                    y={height - 8} 
                    textAnchor="middle" 
                    className={`font-mono text-[10px] font-semibold transition-colors ${
                      isHovered 
                        ? 'fill-emerald-600 dark:fill-emerald-400 font-bold' 
                        : 'fill-slate-400 dark:fill-slate-500'
                    }`}
                  >
                    {period === 7 ? d.dayLabel : d.fullDate}
                  </text>
                )}
              </g>
            );
          })}

          {/* Active Hover Highlight Points */}
          {activePointIn && (
            <g>
              <circle 
                cx={activePointIn.x} 
                cy={activePointIn.y} 
                r="7" 
                fill="#10b981" 
                className="animate-ping opacity-50" 
              />
              <circle 
                cx={activePointIn.x} 
                cy={activePointIn.y} 
                r="6" 
                fill="#10b981" 
                stroke="#ffffff" 
                strokeWidth="2.5" 
                className="shadow-lg"
              />
            </g>
          )}

          {activePointOut && (
            <g>
              <circle 
                cx={activePointOut.x} 
                cy={activePointOut.y} 
                r="5" 
                fill="#f43f5e" 
                stroke="#ffffff" 
                strokeWidth="2" 
                className="shadow-lg"
              />
            </g>
          )}
        </svg>

        {/* Floating 3D Tooltip */}
        {hoveredData && activePointIn && (
          <div 
            className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2"
            style={{ 
              left: `${(activePointIn.x / width) * 100}%`, 
              top: '8px' 
            }}
          >
            <div className="p-3 rounded-2xl bg-slate-900/95 dark:bg-black/95 text-white border border-slate-700/80 dark:border-white/20 shadow-2xl backdrop-blur-xl text-xs space-y-1.5 min-w-[150px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 font-semibold text-slate-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  {hoveredData.fullDate} ({hoveredData.dayLabel})
                </span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <span>+ In:</span>
                </span>
                <span className="font-extrabold text-emerald-400">৳{hoveredData.inAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span className="text-rose-400 flex items-center gap-1 font-bold">
                  <span>- Out:</span>
                </span>
                <span className="font-extrabold text-rose-400">৳{hoveredData.outAmount.toLocaleString()}</span>
              </div>
              <div className="pt-1 border-t border-slate-800 flex items-center justify-between font-bold text-[11px]">
                <span className="text-slate-400">Net:</span>
                <span className={`font-mono ${hoveredData.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {hoveredData.net >= 0 ? '+' : '-'}৳{Math.abs(hoveredData.net).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlowTrendChart;

