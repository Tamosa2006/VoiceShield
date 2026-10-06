import { ShieldAlert, Database, Cpu, History, PlusCircle } from 'lucide-react';
import type { HealthStatus } from '../types';

interface HeaderProps {
  health: HealthStatus | null;
  incidentCount: number;
  onOpenHistory: () => void;
  onNewInvestigation: () => void;
}

export function Header({
  health,
  incidentCount,
  onOpenHistory,
  onNewInvestigation
}: HeaderProps) {
  const isLlmActive = health?.llm_active ?? false;

  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/10 to-transparent border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldAlert className="w-6 h-6 animate-pulse text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white font-mono flex items-center">
                VOICE<span className="text-cyan-400">SHIELD</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80 tracking-wider">
                SOC v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-wide">
              AI Security Incident Investigation Assistant
            </p>
          </div>
        </div>

        {/* Telemetry Status & Actions */}
        <div className="flex items-center flex-wrap gap-2.5 sm:gap-3">
          {/* Engine status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 hidden md:inline">Engine:</span>
            <span className={`font-mono font-medium ${isLlmActive ? 'text-emerald-400' : 'text-amber-300'}`}>
              {health?.llm_provider || 'Checking Engine...'}
            </span>
            <span className={`w-2 h-2 rounded-full ${isLlmActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </div>

          {/* SQLite Vault indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Vault:</span>
            <span className="text-blue-300 font-mono">SQLite (Active)</span>
          </div>

          {/* New investigation reset */}
          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
            title="Start fresh investigation"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Triage</span>
          </button>

          {/* History drawer button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/70 border border-cyan-700/60 text-cyan-300 text-xs font-medium transition-all shadow-sm cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Incident Vault</span>
            {incidentCount > 0 && (
              <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded font-mono text-[10px] border border-cyan-500/40">
                {incidentCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
