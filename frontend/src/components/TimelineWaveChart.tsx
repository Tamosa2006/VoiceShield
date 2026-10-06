import { useState, useEffect, useRef } from 'react';
import { Clock, Minus } from 'lucide-react';
import gsap from 'gsap';

export function TimelineWaveChart() {
  const [selectedHour, setSelectedHour] = useState<number>(22);
  const chartRef = useRef<SVGSVGElement>(null);
  const hours = [19, 20, 21, 22, 23, 24, 25, 26, 27];

  useEffect(() => {
    if (chartRef.current) {
      gsap.fromTo(
        chartRef.current.querySelectorAll('.wave-path'),
        { scaleY: 0.1, transformOrigin: 'bottom' },
        {
          scaleY: 1,
          transformOrigin: 'bottom',
          duration: 1.0,
          ease: 'power3.out',
          stagger: 0.15,
          clearProps: 'transform'
        }
      );
    }
  }, []);

  return (
    <div className="p-5 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg flex flex-col justify-between">
      {/* Header matching reference image */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
              Threat Velocity & Ingest Wave
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Event frequency and anomaly spike (UTC)
            </p>
          </div>
        </div>

        <button className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#25273d] transition cursor-pointer">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Dual Wave SVG Area Chart */}
      <div className="relative w-full h-36 mt-2">
        <svg 
          ref={chartRef}
          className="w-full h-full overflow-visible" 
          viewBox="0 0 450 140" 
          preserveAspectRatio="none"
        >
          <defs>
            {/* Top Wave Gradient (Coral / Pink to Orange) */}
            <linearGradient id="coralGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#fb923c" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.0" />
            </linearGradient>

            {/* Bottom Wave Gradient (Violet to Purple) */}
            <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Background Grid Lines */}
          <line x1="0" y1="35" x2="450" y2="35" stroke="#26283d" strokeDasharray="3 3" />
          <line x1="0" y1="70" x2="450" y2="70" stroke="#26283d" strokeDasharray="3 3" />
          <line x1="0" y1="105" x2="450" y2="105" stroke="#26283d" strokeDasharray="3 3" />

          {/* Active Highlight Column over selected hour (default 22) */}
          <rect 
            x="140" 
            y="10" 
            width="45" 
            height="115" 
            fill="#8b5cf6" 
            fillOpacity="0.15" 
            rx="8" 
          />

          {/* Wave 2: Bottom Deep Purple Wave */}
          <path
            className="wave-path"
            d="M 0 120 Q 50 60, 100 85 T 200 45 T 300 75 T 400 35 L 450 60 L 450 130 L 0 130 Z"
            fill="url(#purpleGrad)"
          />

          {/* Wave 1: Top Coral/Orange Wave */}
          <path
            className="wave-path"
            d="M 0 100 Q 60 20, 120 70 T 220 30 T 320 85 T 420 50 L 450 65 L 450 130 L 0 130 Z"
            fill="url(#coralGrad)"
          />

          {/* Upper Stroke Lines */}
          <path
            d="M 0 100 Q 60 20, 120 70 T 220 30 T 320 85 T 420 50 L 450 65"
            fill="none"
            stroke="#fda4af"
            strokeWidth="2.5"
          />
          <path
            d="M 0 120 Q 50 60, 100 85 T 200 45 T 300 75 T 400 35 L 450 60"
            fill="none"
            stroke="#c084fc"
            strokeWidth="2"
          />

          {/* Spike dot on hour 22 */}
          <circle cx="160" cy="45" r="4.5" fill="#ffffff" stroke="#f43f5e" strokeWidth="2.5" className="animate-pulse" />
        </svg>

        {/* X-Axis Hour Labels matching reference image */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-2 px-1">
          {hours.map((h) => (
            <button
              key={h}
              onClick={() => setSelectedHour(h)}
              className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                selectedHour === h
                  ? 'bg-purple-600/40 text-purple-300 font-bold border border-purple-500/50'
                  : 'hover:text-slate-200'
              }`}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
