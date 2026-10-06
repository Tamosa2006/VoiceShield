import { useState } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  ShieldAlert, 
  Clock, 
  ChevronRight,
  Database
} from 'lucide-react';
import type { IncidentRecord } from '../types';

interface IncidentHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  incidents: IncidentRecord[];
  onSelectIncident: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteIncident: (id: string) => void;
  isLoading: boolean;
}

export function IncidentHistoryDrawer({
  isOpen,
  onClose,
  incidents,
  onSelectIncident,
  onUpdateStatus,
  onDeleteIncident,
  isLoading
}: IncidentHistoryDrawerProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  if (!isOpen) return null;

  const filteredIncidents = incidents.filter(item => {
    const matchesSeverity = severityFilter === 'ALL' || item.severity.toUpperCase() === severityFilter;
    const matchesSearch = !search || 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.threat_type.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Resolved':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-800';
      case 'Contained':
        return 'bg-blue-950/80 text-blue-400 border-blue-800';
      case 'Investigating':
        return 'bg-amber-950/80 text-amber-400 border-amber-800';
      case 'False Positive':
        return 'bg-slate-900 text-slate-400 border-slate-700';
      default:
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0f19] border-l border-slate-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold font-mono text-slate-200 uppercase tracking-wider">
                Incident Vault (SQLite)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-cyan-300">
                {incidents.length}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Severity Filters */}
          <div className="p-3.5 border-b border-slate-800 bg-slate-900/30 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search past incidents, IOCs, threats..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded-md transition cursor-pointer shrink-0 border ${
                    severityFilter === sev
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700 font-semibold'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* List of Incidents */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500 text-xs font-mono">
                Loading incidents from SQLite...
              </div>
            ) : filteredIncidents.length === 0 ? (
              <div className="text-center py-12 px-4">
                <ShieldAlert className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No incident records found</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Run an investigation and click "Save to Vault" to persist incidents locally.
                </p>
              </div>
            ) : (
              filteredIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition flex flex-col gap-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                        incident.severity === 'CRITICAL' ? 'bg-rose-950/80 text-rose-400 border-rose-800' :
                        incident.severity === 'HIGH' ? 'bg-orange-950/80 text-orange-400 border-orange-800' :
                        incident.severity === 'MEDIUM' ? 'bg-yellow-950/80 text-yellow-400 border-yellow-800' :
                        'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Risk: <strong className="text-slate-200">{incident.risk_score}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Triage status selector */}
                      <select
                        value={incident.status}
                        onChange={(e) => onUpdateStatus(incident.id, e.target.value)}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${getStatusBadge(incident.status)} bg-transparent cursor-pointer focus:outline-none`}
                      >
                        <option value="New" className="bg-slate-900 text-slate-200">New</option>
                        <option value="Investigating" className="bg-slate-900 text-slate-200">Investigating</option>
                        <option value="Contained" className="bg-slate-900 text-slate-200">Contained</option>
                        <option value="Resolved" className="bg-slate-900 text-slate-200">Resolved</option>
                        <option value="False Positive" className="bg-slate-900 text-slate-200">False Positive</option>
                      </select>

                      <button
                        onClick={() => onDeleteIncident(incident.id)}
                        className="p-1 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete incident"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-slate-200 font-mono">
                      {incident.title}
                    </h5>
                    <p className="text-[11px] text-cyan-400/90 font-mono mt-0.5">
                      {incident.threat_type}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {incident.summary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <button
                      onClick={() => onSelectIncident(incident.id)}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium transition cursor-pointer"
                    >
                      <span>Load into Console</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
