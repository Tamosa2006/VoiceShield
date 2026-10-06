import { useState, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction, ChangeEvent } from 'react';
import { 
  Terminal, 
  Play, 
  Trash2, 
  Mic, 
  MicOff, 
  FileText, 
  Sparkles, 
  Upload, 
  Activity,
  Layers
} from 'lucide-react';
import type { SampleScenario } from '../types';

interface LogInputPanelProps {
  logs: string;
  setLogs: (logs: string) => void;
  contextNotes: string;
  setContextNotes: Dispatch<SetStateAction<string>>;
  incidentTitle: string;
  setIncidentTitle: (title: string) => void;
  samples: SampleScenario[];
  onSelectSample: (sample: SampleScenario) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

// Support browser SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export const LogInputPanel: React.FC<LogInputPanelProps> = ({
  logs,
  setLogs,
  contextNotes,
  setContextNotes,
  incidentTitle,
  setIncidentTitle,
  samples,
  onSelectSample,
  onAnalyze,
  isLoading
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setContextNotes((prev: string) => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${transcript}` : transcript;
        });
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setContextNotes]);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setLogs(content);
        if (!incidentTitle) {
          setIncidentTitle(`Investigate: ${file.name}`);
        }
      }
    };
    reader.readAsText(file);
  };

  const lineCount = logs.trim() ? logs.trim().split('\n').length : 0;
  const charCount = logs.length;

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Raw Security Telemetry Ingest
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* File upload hidden input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".log,.txt,.json,.csv" 
              className="hidden" 
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
              title="Upload log file (.log, .txt, .json)"
            >
              <Upload className="w-3 h-3 text-cyan-400" />
              <span>Upload File</span>
            </button>

            {logs && (
              <button
                onClick={() => {
                  setLogs('');
                  setIncidentTitle('');
                }}
                className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs flex items-center gap-1 border border-rose-800/40 transition cursor-pointer"
                title="Clear logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* 1-Click Sample Scenarios Loader */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Instant Demo Scenarios (1-Click Load):
            </span>
            <span>{samples.length} presets available</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {samples.map((sample) => (
              <button
                key={sample.id}
                onClick={() => onSelectSample(sample)}
                className="px-2.5 py-1 text-xs rounded-md bg-slate-800/90 hover:bg-cyan-950/80 hover:border-cyan-500/60 border border-slate-700/80 text-slate-300 hover:text-cyan-200 transition-all font-sans flex items-center gap-1.5 cursor-pointer text-left group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80 group-hover:bg-cyan-300" />
                <span className="font-medium">{sample.name}</span>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                  {sample.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Title Tag */}
      <div className="px-4 py-2 bg-slate-900/30 border-b border-slate-800 flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-slate-500 shrink-0" />
        <input
          type="text"
          value={incidentTitle}
          onChange={(e) => setIncidentTitle(e.target.value)}
          placeholder="Incident Investigation Title / Ticket (Optional e.g. INC-4029: Production Auth Anomaly)"
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
        />
      </div>

      {/* Editor Body */}
      <div className="relative flex-1 flex flex-col min-h-[320px] lg:min-h-[400px]">
        <textarea
          value={logs}
          onChange={(e) => setLogs(e.target.value)}
          placeholder={`Paste raw security log events here...\n\nSupported log sources:\n- Linux /var/log/auth.log, syslog, dmesg\n- Apache & Nginx access / error logs\n- AWS CloudTrail JSON audit events\n- Windows Event Logs & PowerShell transcripts\n- Firewall, Snort, Zeek & NetFlow records`}
          className="flex-1 w-full p-4 bg-[#080d1a] text-slate-300 font-mono text-xs leading-relaxed resize-none focus:outline-none border-0 placeholder-slate-600 focus:ring-1 focus:ring-cyan-500/50"
          spellCheck={false}
        />

        {/* Telemetry info bar */}
        <div className="px-4 py-1.5 bg-[#0a0f1e] border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Lines: <strong className="text-cyan-400">{lineCount}</strong></span>
            <span>Bytes: <strong className="text-slate-300">{charCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-ping" />
            <span>Ingest stream ready</span>
          </div>
        </div>
      </div>

      {/* Voice Context / Analyst Notes Panel */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/40">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-cyan-400" />
            Analyst Context / Spoken Field Notes
          </label>

          {speechSupported && (
            <button
              type="button"
              onClick={toggleRecording}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium transition cursor-pointer border ${
                isRecording 
                  ? 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              {isRecording ? (
                <>
                  <MicOff className="w-3 h-3 text-rose-400" />
                  <span>Recording Audio...</span>
                </>
              ) : (
                <>
                  <Mic className="w-3 h-3 text-cyan-400" />
                  <span>Dictate Notes (Voice)</span>
                </>
              )}
            </button>
          )}
        </div>

        <input
          type="text"
          value={contextNotes}
          onChange={(e) => setContextNotes(e.target.value)}
          placeholder="E.g., Host edge-srv-01 triggered alert rule 402; observed outbound connection spike..."
          className="w-full px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 font-sans"
        />
      </div>

      {/* Action / Submit Area */}
      <div className="p-4 border-t border-slate-800 bg-[#0d1322]">
        <button
          onClick={onAnalyze}
          disabled={isLoading || !logs.trim()}
          className={`w-full py-3 px-4 rounded-xl font-mono text-sm font-semibold tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
            isLoading || !logs.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-500 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.99]'
          }`}
        >
          {isLoading ? (
            <>
              <Activity className="w-4 h-4 animate-spin text-cyan-300" />
              <span>SCANNING TELEMETRY & EXTRACTING IOCs...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-cyan-200" />
              <span>ANALYZE SECURITY INCIDENT</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
