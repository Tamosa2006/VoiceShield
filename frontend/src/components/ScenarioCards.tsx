import { useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  Database, 
  CloudLightning, 
  Skull, 
  Zap,
  Check
} from 'lucide-react';
import gsap from 'gsap';
import type { SampleScenario } from '../types';

interface ScenarioCardsProps {
  samples: SampleScenario[];
  onSelectSample: (sample: SampleScenario) => void;
  activeSampleId?: string;
}

export function ScenarioCards({
  samples,
  onSelectSample,
  activeSampleId
}: ScenarioCardsProps) {
  // FIX: this ref was missing, which crashed the whole page
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.06,
          duration: 0.4,
          ease: 'power2.out',
          clearProps: 'all'
        }
      );
    }
  }, []);

  const scenarioMeta = [
    {
      id: 'ssh_brute_force',
      name: 'SSH Brute Force',
      badge: 'Linux Syslog',
      desc: 'Credential spray & sudo root bypass',
      bgColor: 'bg-[#6d28d9]', // Deep vibrant purple
      borderColor: 'border-[#8b5cf6]',
      icon: ShieldAlert
    },
    {
      id: 'sqli_attack',
      name: 'SQL Injection',
      badge: 'Web Server',
      desc: 'UNION SELECT schema exfiltration',
      bgColor: 'bg-[#047857]', // Deep vibrant emerald
      borderColor: 'border-[#10b981]',
      icon: Database
    },
    {
      id: 'aws_cloudtrail',
      name: 'AWS CloudTrail',
      badge: 'Cloud Audit',
      desc: 'Rogue AccessKey & Public S3 policy',
      bgColor: 'bg-[#0369a1]', // Deep vibrant sky blue
      borderColor: 'border-[#0284c7]',
      icon: CloudLightning
    },
    {
      id: 'log4shell_rce',
      name: 'Log4Shell RCE',
      badge: 'Zero-Day RCE',
      desc: 'CVE-2021-44228 JNDI callback',
      bgColor: 'bg-[#b45309]', // Deep vibrant amber/gold
      borderColor: 'border-[#f59e0b]',
      icon: Zap
    },
    {
      id: 'ransomware_endpoint',
      name: 'Ransomware Canary',
      badge: 'Windows EDR',
      desc: 'Shadow copy purge & encoded script',
      bgColor: 'bg-[#be123c]', // Deep vibrant crimson
      borderColor: 'border-[#f43f5e]',
      icon: Skull
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span className="font-bold text-slate-300">
          Instant Security Scenarios (Select to Investigate):
        </span>
        <span className="text-[11px] text-cyan-400">
          5 Real-World Datasets
        </span>
      </div>

      <div 
        ref={containerRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3"
      >
        {scenarioMeta.map((meta) => {
          const sample = samples.find(s => s.id === meta.id) || {
            id: meta.id,
            name: meta.name,
            badge: meta.badge,
            category: 'Security Event',
            description: meta.desc,
            logs: ''
          };
          const Icon = meta.icon;
          const isActive = activeSampleId === meta.id;

          return (
            <div
              key={meta.id}
              onClick={() => onSelectSample(sample)}
              className={`relative p-3.5 rounded-2xl ${meta.bgColor} text-white shadow-md flex flex-col justify-between gap-3 cursor-pointer group transition-all duration-200 hover:scale-[1.02] hover:shadow-xl border ${
                isActive 
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-[#13141f] border-white' 
                  : `${meta.borderColor} opacity-90 hover:opacity-100`
              }`}
            >
              {/* Header: Icon, Badge, Check Indicator */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                  <Icon className="w-4 h-4 text-white" />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/30 text-white font-mono text-[9px] font-semibold tracking-wider uppercase">
                    {meta.badge}
                  </span>
                  {isActive && (
                    <span className="w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center font-bold shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <div>
                <h4 className="text-xs font-bold font-sans tracking-tight text-white group-hover:text-cyan-100 transition truncate">
                  {meta.name}
                </h4>
                <p className="text-[11px] text-white/80 line-clamp-2 leading-tight font-sans mt-0.5">
                  {meta.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}