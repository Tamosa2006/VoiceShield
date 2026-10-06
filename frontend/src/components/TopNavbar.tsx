import { 
  ShieldAlert, 
  Search, 
  PhoneCall, 
  Plus, 
  VolumeX,
  Cpu
} from 'lucide-react';
import type { HealthStatus } from '../types';

interface TopNavbarProps {
  health: HealthStatus | null;
  onNewInvestigation: () => void;
  onVoiceBriefingToggle: () => void;
  isPlayingVoice: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function TopNavbar({
  health,
  onNewInvestigation,
  onVoiceBriefingToggle,
  isPlayingVoice,
  searchQuery,
  setSearchQuery
}: TopNavbarProps) {
  return (
    <header className="h-16 bg-[#181926] border-b border-[#26273b] px-4 lg:px-6 flex items-center justify-between gap-4 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-white text-base font-mono tracking-tight">
            VOICE<span className="text-cyan-400">SHIELD</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono block -mt-1">
            AI SOC Investigation Assistant
          </span>
        </div>
      </div>

      {/* Center Search Bar */}
      <div className="flex-1 max-w-lg mx-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident telemetry, IOCs, IP addresses, CVEs..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1e2032] border border-[#2b2d42] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 font-sans transition"
          />
        </div>
      </div>

      {/* Right Controls (Clean, no dummy notification bells or text) */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Voice Briefing Button (Bright blue pill with phone/audio icon) */}
        <button
          onClick={onVoiceBriefingToggle}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm ${
            isPlayingVoice
              ? 'bg-cyan-500 text-slate-950 font-bold animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.6)]'
              : 'bg-[#0284c7] hover:bg-[#0369a1] text-white'
          }`}
          title="Play AI Audio Incident Briefing"
        >
          {isPlayingVoice ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <PhoneCall className="w-4 h-4" />
              <span>Voice Briefing</span>
            </>
          )}
        </button>

        {/* Engine status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e2032] border border-[#2b2d42] text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Engine:</span>
          <span className={health?.llm_active ? 'text-emerald-400 font-semibold' : 'text-amber-300 font-semibold'}>
            {health?.llm_active ? 'LLM' : 'Fallback'}
          </span>
          <span className={`w-2 h-2 rounded-full ${health?.llm_active ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
        </div>

        {/* + New Incident Button (Bright Green) */}
        <button
          onClick={onNewInvestigation}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold tracking-wide transition shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Incident</span>
        </button>
      </div>
    </header>
  );
}
