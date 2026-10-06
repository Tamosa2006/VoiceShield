import { useState } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  ChevronRight, 
  Minus
} from 'lucide-react';
import type { IncidentRecord } from '../types';

interface IncidentsTableProps {
  incidents: IncidentRecord[];
  onSelectIncident: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteIncident: (id: string) => void;
  onNewInvestigation?: () => void;
  searchQuery: string;
}

export function IncidentsTable({
  incidents,
  onSelectIncident,
  onUpdateStatus,
  onDeleteIncident,
  onNewInvestigation,
  searchQuery
}: IncidentsTableProps) {
  const [currentPage, setCurrentPage] = useState(3);

  const filtered = incidents.filter(i => 
    !searchQuery || 
    i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.threat_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Investigating':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'Contained':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      case 'Resolved':
        return 'bg-slate-700/40 text-slate-300 border border-slate-600/40';
      default:
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg flex flex-col justify-between">
      {/* Table Header matching reference image */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 font-sans tracking-wide">
              Security Incidents & Telemetry Vault
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Live SOC Ingestion & Triage Queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            {incidents.length || 212} incidents
          </span>
          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-[#25273d] transition cursor-pointer">
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[#26283d] text-slate-400 text-[11px] font-mono">
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3">Threat Detection & Title</th>
              <th className="py-2.5 px-3">Risk</th>
              <th className="py-2.5 px-3">Origin / Telemetry</th>
              <th className="py-2.5 px-3">Reported Time</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#242539]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                  <div>No incident records matched your query.</div>
                  {onNewInvestigation && (
                    <button
                      onClick={onNewInvestigation}
                      className="mt-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] cursor-pointer hover:bg-emerald-500/30 transition"
                    >
                      + Run New Investigation
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              filtered.slice(0, 7).map((item, idx) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-[#222437] transition group cursor-pointer"
                  onClick={() => onSelectIncident(item.id)}
                >
                  {/* State badge */}
                  <td className="py-3 px-3">
                    {idx === 0 ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[9px] font-mono">
                        NEW
                      </span>
                    ) : idx === 1 ? (
                      <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center justify-center text-[10px] font-bold">
                        ✕
                      </span>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                    )}
                  </td>

                  {/* Title & Threat */}
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {item.threat_type}
                    </div>
                  </td>

                  {/* Risk Score */}
                  <td className="py-3 px-3 font-mono font-bold">
                    <span className={item.risk_score > 80 ? 'text-rose-400' : 'text-amber-400'}>
                      {item.risk_score}
                    </span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </td>

                  {/* Telemetry IP / Host */}
                  <td className="py-3 px-3 font-mono text-slate-300 text-[11px]">
                    198.51.100.{40 + idx}
                  </td>

                  {/* Time */}
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  {/* Status Pill */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.status || 'Active'}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium font-sans ${getStatusBadge(item.status)} bg-transparent cursor-pointer focus:outline-none`}
                    >
                      <option value="Active" className="bg-[#1c1d2d] text-emerald-300">Active</option>
                      <option value="Investigating" className="bg-[#1c1d2d] text-amber-300">Investigating</option>
                      <option value="Contained" className="bg-[#1c1d2d] text-blue-300">Contained</option>
                      <option value="Resolved" className="bg-[#1c1d2d] text-slate-300">Resolved</option>
                    </select>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectIncident(item.id)}
                        className="p-1 rounded hover:bg-[#2e314d] text-slate-400 hover:text-cyan-300 transition cursor-pointer"
                        title="Open investigation console"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteIncident(item.id)}
                        className="p-1 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete incident"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls matching reference image */}
      <div className="mt-4 pt-3 border-t border-[#26283d] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span>Show on page</span>
          <select className="bg-[#25273d] border border-[#32344f] rounded-lg px-2 py-1 text-slate-300 focus:outline-none cursor-pointer">
            <option>100</option>
            <option>50</option>
            <option>25</option>
          </select>
        </div>

        {/* Page numbers `<  1  2  [3]  ...  8  9  >` */}
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            className="w-7 h-7 rounded-lg bg-[#25273d] hover:bg-[#2d304a] text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            ‹
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                currentPage === page
                  ? 'bg-white text-slate-900 shadow'
                  : 'bg-[#25273d] hover:bg-[#2d304a] text-slate-300'
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-slate-600">...</span>
          {[8, 9].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                currentPage === page
                  ? 'bg-white text-slate-900 shadow'
                  : 'bg-[#25273d] hover:bg-[#2d304a] text-slate-300'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => setCurrentPage(Math.min(9, currentPage + 1))}
            className="w-7 h-7 rounded-lg bg-[#25273d] hover:bg-[#2d304a] text-slate-300 flex items-center justify-center transition cursor-pointer"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
