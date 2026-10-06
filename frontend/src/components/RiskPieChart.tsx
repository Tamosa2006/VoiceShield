import { useEffect, useRef } from 'react';
import { PieChart } from 'lucide-react';
import gsap from 'gsap';
import type { AnalysisResult } from '../types';

interface RiskPieChartProps {
  analysis: AnalysisResult | null;
}

export function RiskPieChart({ analysis }: RiskPieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);

  const riskScore = analysis?.risk_score ?? 94;
  const severity = analysis?.severity ?? 'CRITICAL';
  const confidence = analysis?.confidence ?? 96;

  // Calculate dynamic segment shares based on risk score
  const exploitShare = Math.round(riskScore * 0.45);
  const impactShare = Math.round(riskScore * 0.30);
  const anomalyShare = Math.round(riskScore * 0.15);
  const residualSafety = Math.max(5, 100 - (exploitShare + impactShare + anomalyShare));

  const segments = [
    {
      name: 'Exploit Vector & Execution',
      share: exploitShare,
      color: '#f43f5e',
      border: 'border-rose-500/50',
      badge: 'bg-rose-500/20 text-rose-300'
    },
    {
      name: 'System & Privilege Impact',
      share: impactShare,
      color: '#a855f7',
      border: 'border-purple-500/50',
      badge: 'bg-purple-500/20 text-purple-300'
    },
    {
      name: 'Telemetry Anomaly Rate',
      share: anomalyShare,
      color: '#f59e0b',
      border: 'border-amber-500/50',
      badge: 'bg-amber-500/20 text-amber-300'
    },
    {
      name: 'Defensive Integrity Buffer',
      share: residualSafety,
      color: '#06b6d4',
      border: 'border-cyan-500/50',
      badge: 'bg-cyan-500/20 text-cyan-300'
    }
  ];

  // Circumference for radius 58: 2 * PI * 58 ≈ 364.42
  const r = 58;
  const c = 2 * Math.PI * r;

  let accumulatedPercent = 0;
  const slices = segments.map((seg) => {
    const dashLength = (seg.share / 100) * c;
    const dashOffset = -((accumulatedPercent / 100) * c);
    accumulatedPercent += seg.share;
    return {
      ...seg,
      dashArray: `${dashLength} ${c}`,
      dashOffset
    };
  });

  useEffect(() => {
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [analysis]);

  const severityColor = 
    severity === 'CRITICAL' ? 'text-rose-400 border-rose-500/50 bg-rose-500/20' :
    severity === 'HIGH' ? 'text-orange-400 border-orange-500/50 bg-orange-500/20' :
    severity === 'MEDIUM' ? 'text-amber-400 border-amber-500/50 bg-amber-500/20' :
    'text-emerald-400 border-emerald-500/50 bg-emerald-500/20';

  return (
    <div 
      ref={chartRef}
      className="p-5 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#26283d] mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
              Risk Score & Threat Composition
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Graphical Pie Representation • Confidence: {confidence}%
            </p>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${severityColor}`}>
          {severity}
        </span>
      </div>

      {/* Main Pie / Donut Chart & Legend */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-2">
        {/* SVG Donut Chart */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg 
            ref={ringRef}
            className="w-full h-full transform -rotate-90" 
            viewBox="0 0 150 150"
          >
            {/* Background Base Ring */}
            <circle
              cx="75"
              cy="75"
              r={r}
              stroke="#24263a"
              strokeWidth="14"
              fill="transparent"
            />

            {/* Segment Slices */}
            {slices.map((slice, idx) => (
              <circle
                key={idx}
                className="donut-slice transition-all duration-700 hover:stroke-width-[18px] cursor-pointer"
                cx="75"
                cy="75"
                r={r}
                stroke={slice.color}
                strokeWidth="14"
                strokeDasharray={slice.dashArray}
                strokeDashoffset={slice.dashOffset}
                strokeLinecap="round"
                fill="transparent"
              />
            ))}
          </svg>

          {/* Center Gauge Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
              {riskScore}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 mt-1">
              / 100 RISK
            </span>
          </div>
        </div>

        {/* Legend Slices Breakdown */}
        <div className="flex-1 w-full space-y-2">
          {segments.map((seg, idx) => (
            <div 
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-[#141522] border border-[#26283d] hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs font-sans text-slate-300 truncate">
                  {seg.name}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-200 shrink-0 ml-2">
                {seg.share}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
