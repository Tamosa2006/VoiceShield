import { useEffect, useRef } from 'react';
import { 
  CheckSquare, 
  FileText, 
  Radio, 
  History, 
  Settings, 
  HelpCircle, 
  ChevronDown,
  Terminal,
  Activity
} from 'lucide-react';
import gsap from 'gsap';

interface SidebarProps {
  activeTab: 'overview' | 'investigate' | 'vault' | 'playbooks';
  setActiveTab: (tab: 'overview' | 'investigate' | 'vault' | 'playbooks') => void;
  incidentCount: number;
  onNewInvestigation: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  incidentCount,
  onNewInvestigation
}: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      gsap.from(sidebarRef.current, {
        x: -30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, []);

  return (
    <aside 
      ref={sidebarRef}
      className="w-full lg:w-64 bg-[#181926] border-r border-[#26273b] p-4 flex flex-col justify-between shrink-0 select-none"
    >
      <div>
        {/* User Profile Pill matching reference image */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#1e2032] border border-[#2b2d42] mb-6">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md overflow-hidden">
              <span className="font-mono">AD</span>
              <div className="absolute inset-0 bg-black/20" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-100 font-sans tracking-wide">
                Alex Rivera
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>online</span>
              </div>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#26283d] text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2032]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>SOC Dashboard</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#0ea5e9] text-white text-[10px] font-bold">
              19
            </span>
          </button>

          <button
            onClick={() => setActiveTab('investigate')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'investigate'
                ? 'bg-[#26283d] text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2032]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-purple-400" />
              <span>Live Investigation</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#8b5cf6] text-white text-[10px] font-bold animate-pulse">
              Active
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-[#26283d] text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2032]'
            }`}
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-emerald-400" />
              <span>Incident Vault</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#10b981] text-white text-[10px] font-bold">
              {incidentCount || 130}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('playbooks')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'playbooks'
                ? 'bg-[#26283d] text-white font-semibold shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#1e2032]'
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Response Playbooks</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#f59e0b] text-white text-[10px] font-bold">
              4
            </span>
          </button>
        </div>

        {/* Secondary Navigation Section */}
        <div className="mt-8 pt-4 border-t border-[#26273b] space-y-1">
          <div className="px-3.5 py-1 text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Telemetry & Feeds
          </div>

          <button 
            onClick={onNewInvestigation}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1e2032] transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Live Threat Radar</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </button>

          <button 
            onClick={() => setActiveTab('vault')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1e2032] transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-slate-400" />
              <span>Audit Reports</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Bottom Menu */}
      <div className="pt-4 border-t border-[#26273b] space-y-1">
        <button className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1e2032] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </div>
        </button>

        <button className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-[#1e2032] transition cursor-pointer">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>FAQ & Rules</span>
          </div>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 text-[10px]">
            1
          </span>
        </button>
      </div>
    </aside>
  );
}
