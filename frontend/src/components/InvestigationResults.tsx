import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  FileDown, 
  BookmarkPlus, 
  Cpu, 
  Crosshair, 
  Terminal, 
  Sparkles
} from 'lucide-react';
import type { AnalysisResult } from '../types';

interface InvestigationResultsProps {
  analysis: AnalysisResult | null;
  onSaveToVault: () => void;
  isSaving: boolean;
  isSaved: boolean;
}

export function InvestigationResults({
  analysis,
  onSaveToVault,
  isSaving,
  isSaved
}: InvestigationResultsProps) {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [speechSynthesisAvailable, setSpeechSynthesisAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSynthesisAvailable(true);
    }
  }, []);

  // Stop speech when component unmounts or analysis changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    }
    setCompletedSteps({});
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="h-full min-h-[450px] flex flex-col items-center justify-center p-8 bg-[#0d1322] border border-slate-800 rounded-xl text-center">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800/80 mb-4 shadow-[0_0_30px_rgba(15,23,42,0.6)]">
          <Crosshair className="w-12 h-12 text-slate-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 font-mono">SOC Investigation Console Idle</h3>
        <p className="text-xs text-slate-400 max-w-sm mt-2 leading-relaxed">
          Select a 1-click sample incident scenario or paste raw server, authentication, or cloud logs on the left to initiate automated threat analysis.
        </p>
        <div className="mt-6 flex flex-wrap gap-2 justify-center text-[11px] font-mono text-slate-400">
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">MITRE ATT&CK Mapping</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">IOC Extraction</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Voice Briefing</span>
          <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800">Action Playbooks</span>
        </div>
      </div>
    );
  }

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const handleCopyCommand = (command: string, index: number) => {
    navigator.clipboard.writeText(command);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleVoiceBriefing = () => {
    if (!speechSynthesisAvailable) return;

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(analysis.voice_briefing_script);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
    }
  };

  const exportReport = (format: 'markdown' | 'json') => {
    let content = '';
    let filename = `VoiceShield-Report-${Date.now()}`;

    if (format === 'json') {
      content = JSON.stringify(analysis, null, 2);
      filename += '.json';
    } else {
      content = `# VoiceShield Incident Investigation Report
**Date:** ${new Date().toISOString()}
**Severity:** ${analysis.severity}
**Risk Score:** ${analysis.risk_score} / 100
**Confidence:** ${analysis.confidence}%
**Detected Threat:** ${analysis.threat_type}
**Analysis Engine:** ${analysis.source}

## MITRE ATT&CK Mappings
${analysis.mitre_attack.map(m => `- ${m}`).join('\n')}

## Executive Summary
${analysis.summary}

## Extracted Indicators of Compromise (IOCs) & Evidence
${analysis.evidence.map(e => `### [${e.severity}] ${e.ioc_type}: \`${e.value}\`
- **Description:** ${e.description}
${e.raw_line ? `- **Log Line:** \`${e.raw_line}\`` : ''}`).join('\n\n')}

## Recommended Response Playbook
${analysis.response_actions.map(a => `### Step ${a.step}: ${a.title} [Priority: ${a.priority} | ${a.category}]
${a.description}
${a.command ? `\`\`\`bash\n${a.command}\n\`\`\`` : ''}`).join('\n\n')}
`;
      filename += '.md';
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Severity styling
  const severityColors = {
    CRITICAL: {
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/50',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      gauge: '#f43f5e',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)]'
    },
    HIGH: {
      bg: 'bg-orange-950/40',
      border: 'border-orange-500/50',
      text: 'text-orange-400',
      badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
      gauge: '#f97316',
      glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]'
    },
    MEDIUM: {
      bg: 'bg-yellow-950/40',
      border: 'border-yellow-500/50',
      text: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      gauge: '#eab308',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.25)]'
    },
    LOW: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      gauge: '#10b981',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]'
    }
  }[analysis.severity] || {
    bg: 'bg-slate-900',
    border: 'border-slate-700',
    text: 'text-slate-300',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
    gauge: '#06b6d4',
    glow: ''
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner: Threat Header & Gauges */}
      <div className={`p-5 rounded-xl border ${severityColors.border} ${severityColors.bg} ${severityColors.glow} relative overflow-hidden backdrop-blur-sm transition-all`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          {/* Threat Title & Mitre Tags */}
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${severityColors.badge} flex items-center gap-1.5`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {analysis.severity} SEVERITY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-slate-900/90 text-slate-400 border border-slate-700 flex items-center gap-1">
                <Cpu className="w-3 h-3 text-cyan-400" />
                {analysis.source.includes('llm') ? 'LLM AI Engine' : 'Heuristic Security Engine'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight leading-snug">
              {analysis.threat_type}
            </h2>

            {/* MITRE ATT&CK Chips */}
            {analysis.mitre_attack && analysis.mitre_attack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.mitre_attack.map((tag, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-cyan-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Scores: Risk Gauge & Confidence */}
          <div className="flex items-center gap-5 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80 shrink-0 self-stretch sm:self-auto justify-around">
            {/* Risk Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    stroke={severityColors.gauge}
                    strokeDasharray={`${analysis.risk_score}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-mono font-bold text-lg text-white">
                  {analysis.risk_score}
                </span>
              </div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">
                Risk Score
              </span>
            </div>

            <div className="h-10 w-[1px] bg-slate-800" />

            {/* Confidence Gauge */}
            <div className="flex flex-col items-center justify-center min-w-[70px]">
              <span className="font-mono text-xl font-bold text-emerald-400">
                {analysis.confidence}%
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">
                Confidence
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar: Voice Briefing & Export Buttons */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          {/* Voice Briefing Button */}
          {speechSynthesisAvailable && (
            <button
              onClick={handleVoiceBriefing}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 border transition-all cursor-pointer ${
                isPlayingVoice
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] font-semibold'
                  : 'bg-slate-900 hover:bg-slate-800 text-cyan-300 border-slate-700'
              }`}
            >
              {isPlayingVoice ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
                  <span>Stop Voice Briefing</span>
                  <span className="flex gap-0.5 ml-1">
                    <span className="w-1 h-3 bg-slate-950 animate-pulse" />
                    <span className="w-1 h-4 bg-slate-950 animate-pulse delay-75" />
                    <span className="w-1 h-2 bg-slate-950 animate-pulse delay-150" />
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Listen to AI Voice Briefing</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {/* Save to SQLite Vault */}
            <button
              onClick={onSaveToVault}
              disabled={isSaving || isSaved}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition cursor-pointer ${
                isSaved
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 cursor-default'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved to Vault</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isSaving ? 'Saving...' : 'Save to Vault'}</span>
                </>
              )}
            </button>

            {/* Export Markdown */}
            <button
              onClick={() => exportReport('markdown')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              title="Download Incident Report Markdown"
            >
              <FileDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="p-4 rounded-xl bg-[#0d1322] border border-slate-800">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Executive Incident Assessment
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {analysis.summary}
        </p>
      </div>

      {/* Supporting Evidence & IOCs */}
      <div className="rounded-xl bg-[#0d1322] border border-slate-800 overflow-hidden">
        <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-rose-400" />
            Supporting Evidence & Identified IOCs ({analysis.evidence.length})
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Telemetry Corroboration
          </span>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.evidence.map((item, idx) => (
            <div 
              key={idx}
              className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                    {item.ioc_type}
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                    item.severity === 'CRITICAL' ? 'text-rose-400 bg-rose-950/50' :
                    item.severity === 'HIGH' ? 'text-orange-400 bg-orange-950/50' :
                    item.severity === 'MEDIUM' ? 'text-yellow-400 bg-yellow-950/50' :
                    'text-emerald-400 bg-emerald-950/50'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                <div className="font-mono text-xs font-semibold text-slate-100 select-all break-all">
                  {item.value}
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-normal font-sans">
                  {item.description}
                </p>
              </div>

              {item.raw_line && (
                <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 bg-slate-900/50 p-1.5 rounded truncate">
                  <span className="text-slate-500 select-none mr-1.5">&gt;</span>
                  {item.raw_line}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Response Actions Playbook */}
      <div className="rounded-xl bg-[#0d1322] border border-slate-800 overflow-hidden">
        <div className="p-3.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            Remediation & Response Playbook ({analysis.response_actions.length} Steps)
          </h4>
          <span className="text-[11px] font-mono text-slate-400">
            Interactive SOC Checklist
          </span>
        </div>

        <div className="p-4 space-y-3">
          {analysis.response_actions.map((action, idx) => {
            const isDone = !!completedSteps[action.step];

            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border transition-all ${
                  isDone 
                    ? 'bg-slate-950/30 border-slate-800/40 opacity-70' 
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Step completion toggle checkbox */}
                  <button
                    onClick={() => toggleStep(action.step)}
                    className="mt-0.5 p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950" />
                    ) : (
                      <div className="w-4 h-4 rounded border border-slate-600 flex items-center justify-center font-mono text-[10px] text-slate-400">
                        {action.step}
                      </div>
                    )}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold font-mono ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                        {action.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                        {action.category}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        action.priority === 'Immediate' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        action.priority === 'High' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                        'bg-slate-900 text-slate-400'
                      }`}>
                        {action.priority}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDone ? 'text-slate-500' : 'text-slate-400'}`}>
                      {action.description}
                    </p>

                    {/* Copyable CLI Command snippet */}
                    {action.command && (
                      <div className="mt-2 flex items-center justify-between gap-2 p-2 rounded bg-[#070b14] border border-slate-800/90 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                        <code className="select-all">{action.command}</code>
                        <button
                          onClick={() => handleCopyCommand(action.command!, idx)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition cursor-pointer shrink-0"
                          title="Copy command to clipboard"
                        >
                          {copiedIndex === idx ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
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
    </div>
  );
};
