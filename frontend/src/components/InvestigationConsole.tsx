import { useState, useRef } from 'react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { 
  Terminal, 
  Play, 
  Trash2, 
  Upload, 
  Activity, 
  CheckCircle2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  BookmarkPlus, 
  Crosshair, 
  Sparkles,
  FileDown
} from 'lucide-react';
import type { AnalysisResult } from '../types';

interface InvestigationConsoleProps {
  logs: string;
  setLogs: (logs: string) => void;
  contextNotes: string;
  setContextNotes: Dispatch<SetStateAction<string>>;
  incidentTitle: string;
  setIncidentTitle: (title: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  analysis: AnalysisResult | null;
  onSaveToVault: () => void;
  isSaving: boolean;
  isSaved: boolean;
  onExportReport: () => void;
  onVoiceBriefingToggle: () => void;
  isPlayingVoice: boolean;
}

export function InvestigationConsole({
  logs,
  setLogs,
  contextNotes,
  setContextNotes,
  incidentTitle,
  setIncidentTitle,
  onAnalyze,
  isLoading,
  analysis,
  onSaveToVault,
  isSaving,
  isSaved,
  onExportReport,
  onVoiceBriefingToggle,
  isPlayingVoice
}: InvestigationConsoleProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const handleCopyCommand = (command: string, step: number) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLogs(content);
        if (!incidentTitle) setIncidentTitle(`Investigate: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const lineCount = logs.trim() ? logs.trim().split('\n').length : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left: Raw Log Telemetry Terminal */}
      <div className="lg:col-span-5 p-5 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#26283d] mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                Log Ingest Terminal
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".log,.txt,.json,.csv" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 rounded-lg bg-[#25273d] hover:bg-[#2d304a] text-slate-300 text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3 h-3 text-cyan-400" />
                <span>Upload</span>
              </button>
              {logs && (
                <button
                  onClick={() => setLogs('')}
                  className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Title input */}
          <input
            type="text"
            value={incidentTitle}
            onChange={(e) => setIncidentTitle(e.target.value)}
            placeholder="Incident Investigation Tag / Title (Optional)"
            className="w-full px-3 py-2 rounded-xl bg-[#141522] border border-[#26283d] text-xs text-slate-200 placeholder-slate-500 mb-3 focus:outline-none focus:border-cyan-500/50 font-mono"
          />

          {/* Textarea */}
          <div className="relative">
            <textarea
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              placeholder="Paste raw security logs here (syslog, auth.log, apache/nginx, cloudtrail, event logs)..."
              rows={14}
              className="w-full p-3.5 rounded-xl bg-[#13141f] border border-[#26283d] text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              spellCheck={false}
            />
            <div className="absolute right-3 bottom-3 text-[10px] font-mono text-slate-500 bg-[#1c1d2d] px-2 py-0.5 rounded border border-[#2a2b3f]">
              {lineCount} lines
            </div>
          </div>

          {/* Analyst Spoken Voice Notes Input */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-slate-400">
              <span>Analyst Context & Hypotheses</span>
            </div>
            <input
              type="text"
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              placeholder="Spoken or typed analyst context notes..."
              className="w-full px-3 py-2 rounded-xl bg-[#141522] border border-[#26283d] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Action Submit Button */}
        <div className="mt-4 pt-3 border-t border-[#26283d]">
          <button
            onClick={onAnalyze}
            disabled={isLoading || !logs.trim()}
            className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              isLoading || !logs.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isLoading ? (
              <>
                <Activity className="w-4 h-4 animate-spin text-emerald-200" />
                <span>EXTRACTING IOCs & RUNNING AI TRIAGE...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>ANALYZE LOG TELEMETRY NOW</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right: Automated Analysis Findings Deck */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        {analysis ? (
          <>
            {/* Threat Header Banner */}
            <div className="p-5 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#26283d]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {analysis.severity} THREAT
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Confidence: <strong className="text-emerald-400">{analysis.confidence}%</strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 font-sans tracking-tight">
                    {analysis.threat_type}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={onVoiceBriefingToggle}
                    className="px-3 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer shadow"
                  >
                    {isPlayingVoice ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 animate-bounce" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Voice Briefing</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onSaveToVault}
                    disabled={isSaving || isSaved}
                    className="px-3 py-1.5 rounded-xl bg-[#25273d] hover:bg-[#2d304a] text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-[#32344f] transition cursor-pointer"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  <button
                    onClick={onExportReport}
                    className="p-1.5 rounded-xl bg-[#25273d] hover:bg-[#2d304a] text-slate-300 border border-[#32344f] transition cursor-pointer"
                    title="Export Markdown Report"
                  >
                    <FileDown className="w-4 h-4 text-cyan-400" />
                  </button>
                </div>
              </div>

              {/* MITRE ATT&CK Badges */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {analysis.mitre_attack.map((m, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-[#141522] border border-[#26283d] text-[10px] font-mono text-cyan-300"
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* Executive Summary */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans mt-3 p-3 rounded-xl bg-[#141522] border border-[#26283d]">
                {analysis.summary}
              </p>
            </div>

            {/* Extracted Evidence & IOCs */}
            <div className="p-4 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                Supporting Evidence & IOC Indicators ({analysis.evidence.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analysis.evidence.map((item, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#141522] border border-[#26283d]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 mb-1">
                      <span>{item.ioc_type}</span>
                      <span className="text-rose-400 font-bold">{item.severity}</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-slate-100 select-all truncate">
                      {item.value}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-tight font-sans">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Response Actions Checklist */}
            <div className="p-4 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] shadow-lg">
              <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Mitigation Playbook & Remediation Sequence
              </h4>
              <div className="space-y-2">
                {analysis.response_actions.map((act) => {
                  const isDone = !!completedSteps[act.step];
                  return (
                    <div 
                      key={act.step}
                      className={`p-3 rounded-xl border transition ${
                        isDone ? 'bg-[#141522]/50 border-[#26283d]/50 opacity-60' : 'bg-[#141522] border-[#26283d]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <button
                          onClick={() => toggleStep(act.step)}
                          className="mt-0.5 text-slate-400 hover:text-cyan-400 cursor-pointer"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center text-[9px] font-mono">
                              {act.step}
                            </div>
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-200">
                              {act.title}
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#25273d] text-cyan-300">
                              {act.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {act.description}
                          </p>
                          {act.command && (
                            <div className="mt-2 flex items-center justify-between gap-2 p-1.5 rounded-lg bg-[#0b0c14] border border-[#26283d] text-[10px] font-mono text-cyan-300">
                              <code className="truncate">{act.command}</code>
                              <button
                                onClick={() => handleCopyCommand(act.command!, act.step)}
                                className="p-1 hover:text-white cursor-pointer shrink-0"
                              >
                                {copiedStep === act.step ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full min-h-[300px] p-8 rounded-2xl bg-[#1c1d2d] border border-[#2a2b3f] flex flex-col items-center justify-center text-center">
            <Crosshair className="w-10 h-10 text-slate-600 animate-pulse mb-3" />
            <h4 className="text-sm font-bold text-slate-200 font-mono">Investigation Console Ready</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              Paste security logs on the left or click any scenario card above to generate instant risk score, MITRE ATT&CK mapping, and mitigation playbooks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
