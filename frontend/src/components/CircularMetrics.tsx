import { useEffect, useRef } from 'react';
import { 
  FileDown, 
  PieChart
} from 'lucide-react';
import gsap from 'gsap';
import type { AnalysisResult } from '../types';

interface CircularMetricsProps {
  analysis: AnalysisResult | null;
  onExport: () => void;
}

export function CircularMetrics({
  analysis,
  onExport
}: CircularMetricsProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const riskScore = analysis?.risk_score ?? 94;
  const confidence = analysis?.confidence ?? 96;
  const iocMatch = analysis ? Math.min(100, Math.max(70, analysis.evidence.length * 25)) : 85;
  const completedStepsCount = 3; // simulated default triage rate
  const containmentRate = analysis ? Math.min(100, Math.round((completedStepsCount / Math.max(1, analysis.response_actions.length)) * 100)) : 60;

  useEffect(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, [analysis]);

  const metrics = [
    {
      title: 'Risk Score',
      percent: riskScore,
      subtext: `${analysis?.severity || 'CRITICAL'} Threat`,
      color: riskScore > 80 ? '#f43f5e' : riskScore > 50 ? '#f97316' : '#10b981',
      track: '#2d1a29'
    },
    {
      title: 'Confidence',
      percent: confidence,
      subtext: 'Telemetry Match',
      color: '#a855f7',
      track: '#281c3b'
    },
    {
      title: 'IOC Corroboration',
      percent: iocMatch,
      subtext: 'Pattern Rules',
      color: '#06b6d4',
      track: '#162e3d'
    },
    {
      title: 'Containment',
      percent: containmentRate,
      subtext: 'Playbook Progress',
      color: '#10b981',
      track: '#163327'
    }
  ];

  return (
    <div 
      ref={cardRef}
      className="p-5 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
              Incident Telemetry & Scoring
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Real-time Correlated Metrics
            </p>
          </div>
        </div>

        {/* .xlsx / export report button matching reference image */}
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25273d] hover:bg-[#2d304a] text-slate-300 text-xs font-mono border border-[#32344f] transition cursor-pointer"
        >
          <FileDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>.report</span>
        </button>
      </div>

      {/* 4 Circular Progress Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
        {metrics.map((item, idx) => {
          const radius = 28;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (item.percent / 100) * circumference;

          return (
            <div key={idx} className="flex flex-col items-center text-center">
              <span className="text-[11px] font-medium text-slate-300 truncate font-sans">
                {item.title}
              </span>
              <span className="text-[9px] text-slate-500 font-mono mb-2 truncate">
                {item.subtext}
              </span>

              {/* Circular SVG Ring */}
              <div className="relative w-18 h-18 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
                  {/* Background Track */}
                  <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    stroke="#26283d"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Animated Progress Ring */}
                  <circle
                    cx="35"
                    cy="35"
                    r={radius}
                    stroke={item.color}
                    strokeWidth="6"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Centered Value */}
                <div className="absolute font-mono font-bold text-sm text-slate-100">
                  {item.percent}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
