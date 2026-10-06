import { useState, useEffect, useRef } from 'react';
import { TopNavbar } from './components/TopNavbar';
import { ScenarioCards } from './components/ScenarioCards';
import { RiskPieChart } from './components/RiskPieChart';
import { TimelineWaveChart } from './components/TimelineWaveChart';
import { InvestigationConsole } from './components/InvestigationConsole';
import { IncidentsTable } from './components/IncidentsTable';
import { 
  fetchHealth, 
  fetchSamples, 
  analyzeLogs, 
  saveIncidentToDb, 
  fetchIncidents, 
  fetchIncidentDetail, 
  updateIncidentStatus, 
  deleteIncidentFromDb 
} from './services/api';
import type { AnalysisResult, HealthStatus, IncidentRecord, SampleScenario } from './types';
import { CheckCircle2, AlertCircle, Info, Database } from 'lucide-react';
import gsap from 'gsap';

export function App() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [logs, setLogs] = useState<string>('');
  const [contextNotes, setContextNotes] = useState<string>('');
  const [incidentTitle, setIncidentTitle] = useState<string>('');
  
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [samples, setSamples] = useState<SampleScenario[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [activeSampleId, setActiveSampleId] = useState<string>('ssh_brute_force');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const healthData = await fetchHealth();
        setHealth(healthData);
      } catch (e) {
        console.warn('Backend health check error:', e);
      }

      try {
        const samplesData = await fetchSamples();
        setSamples(samplesData);
        if (samplesData.length > 0) {
          const first = samplesData[0];
          setLogs(first.logs);
          setIncidentTitle(`INC-101: ${first.name}`);
          setActiveSampleId(first.id);

          // Automatically analyze the first scenario so metrics populate immediately
          try {
            const initialAnalysis = await analyzeLogs(first.logs);
            setAnalysis(initialAnalysis);
          } catch (err) {
            console.warn('Initial analysis error:', err);
          }
        }
      } catch (e) {
        console.warn('Error fetching samples:', e);
      }

      loadIncidents();
    };

    init();
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (e) {
      console.warn('Error loading incidents:', e);
    }
  };

  const handleSelectSample = async (sample: SampleScenario) => {
    setActiveSampleId(sample.id);
    setLogs(sample.logs);
    setIncidentTitle(`INC-${Math.floor(1000 + Math.random() * 9000)}: ${sample.name}`);
    setContextNotes(`Ingested telemetry: ${sample.description}`);
    setIsSaved(false);
    showToast(`Loaded scenario: ${sample.name}`, 'info');

    // Trigger analysis immediately on card click
    try {
      setIsLoading(true);
      const res = await analyzeLogs(sample.logs, sample.description);
      setAnalysis(res);
      showToast(`Analyzed ${sample.name}: ${res.severity} (${res.risk_score}/100)`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!logs.trim()) {
      showToast('Please provide security logs to investigate.', 'error');
      return;
    }

    try {
      setIsLoading(true);
      setIsSaved(false);
      const result = await analyzeLogs(logs, contextNotes, incidentTitle);
      setAnalysis(result);
      showToast(`Investigation complete: ${result.threat_type} (${result.risk_score}/100)`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToVault = async () => {
    if (!analysis) return;
    try {
      setIsSaving(true);
      const titleToSave = incidentTitle.trim() || `Incident: ${analysis.threat_type}`;
      await saveIncidentToDb(titleToSave, logs, analysis);
      setIsSaved(true);
      showToast('Incident saved to local SQLite vault!', 'success');
      loadIncidents();
    } catch (err: any) {
      showToast('Failed to save incident.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectIncidentFromTable = async (id: string) => {
    try {
      const record = await fetchIncidentDetail(id);
      if (record.analysis) {
        setAnalysis(record.analysis);
        setLogs(record.raw_logs || '');
        setIncidentTitle(record.title);
        setIsSaved(true);
        // Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`Loaded incident: ${record.title}`, 'info');
      }
    } catch (e) {
      showToast('Failed to load incident record.', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateIncidentStatus(id, status);
      setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: status as any } : inc));
      showToast(`Status updated to ${status}`, 'success');
    } catch (e) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await deleteIncidentFromDb(id);
      setIncidents(prev => prev.filter(inc => inc.id !== id));
      showToast('Incident deleted from vault.', 'info');
    } catch (e) {
      showToast('Failed to delete incident.', 'error');
    }
  };

  const handleVoiceBriefingToggle = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser.', 'error');
      return;
    }

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
    } else {
      if (!analysis?.voice_briefing_script) {
        showToast('No active incident briefing available. Run an investigation first.', 'info');
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(analysis.voice_briefing_script);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingVoice(true);
      showToast('Playing AI Audio Incident Briefing...', 'info');
    }
  };

  const handleExportReport = () => {
    if (!analysis) return;
    const content = `# VoiceShield Incident Investigation Report
**Date:** ${new Date().toISOString()}
**Severity:** ${analysis.severity}
**Risk Score:** ${analysis.risk_score} / 100
**Confidence:** ${analysis.confidence}%
**Detected Threat:** ${analysis.threat_type}
**Analysis Engine:** ${analysis.source}

## Executive Summary
${analysis.summary}

## Extracted Indicators of Compromise (IOCs)
${analysis.evidence.map(e => `- [${e.severity}] ${e.ioc_type}: \`${e.value}\` - ${e.description}`).join('\n')}

## Recommended Response Playbook
${analysis.response_actions.map(a => `Step ${a.step}: ${a.title} [Priority: ${a.priority} | ${a.category}]
${a.description}
${a.command ? `Command: ${a.command}` : ''}`).join('\n\n')}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `VoiceShield-Report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported Markdown incident report.', 'success');
  };

  const handleNewInvestigation = () => {
    setLogs('');
    setContextNotes('');
    setIncidentTitle('');
    setAnalysis(null);
    setIsSaved(false);
    showToast('Workspace reset. Paste logs or select a scenario above.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#13141f] text-slate-200 font-sans select-none flex flex-col">
      {/* Top Header (Clean, no dummy notification bells) */}
      <TopNavbar
        health={health}
        onNewInvestigation={handleNewInvestigation}
        onVoiceBriefingToggle={handleVoiceBriefingToggle}
        isPlayingVoice={isPlayingVoice}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Dashboard Canvas */}
      <main ref={containerRef} className="flex-1 p-4 lg:p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Row 1: All 5 Pre-Packaged Incident Scenarios */}
        <ScenarioCards
          samples={samples}
          onSelectSample={handleSelectSample}
          activeSampleId={activeSampleId}
        />

        {/* Row 2: Visual Telemetry Deck (Risk Score Pie Chart + Dual Wave Threat Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6">
            <RiskPieChart analysis={analysis} />
          </div>
          <div className="lg:col-span-6">
            <TimelineWaveChart />
          </div>
        </div>

        {/* Row 3: Investigation Console (Log Ingest Terminal + Real-time AI Output Deck) */}
        <InvestigationConsole
          logs={logs}
          setLogs={setLogs}
          contextNotes={contextNotes}
          setContextNotes={setContextNotes}
          incidentTitle={incidentTitle}
          setIncidentTitle={setIncidentTitle}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
          analysis={analysis}
          onSaveToVault={handleSaveToVault}
          isSaving={isSaving}
          isSaved={isSaved}
          onExportReport={handleExportReport}
          onVoiceBriefingToggle={handleVoiceBriefingToggle}
          isPlayingVoice={isPlayingVoice}
        />

        {/* Row 4: Local Incident Vault Table (SQLite Persistent Records) */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono text-slate-400">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-bold text-slate-300">SQLite Incident Vault History</span>
            <span className="text-[11px] text-slate-500">• Saved Investigations</span>
          </div>

          <IncidentsTable
            incidents={incidents}
            onSelectIncident={handleSelectIncidentFromTable}
            onUpdateStatus={handleUpdateStatus}
            onDeleteIncident={handleDeleteIncident}
            onNewInvestigation={handleNewInvestigation}
            searchQuery={searchQuery}
          />
        </div>
      </main>

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-2xl border flex items-center gap-2.5 text-xs font-mono shadow-2xl backdrop-blur-md ${
            toast.type === 'success' ? 'bg-emerald-950/95 text-emerald-300 border-emerald-600' :
            toast.type === 'error' ? 'bg-rose-950/95 text-rose-300 border-rose-600' :
            'bg-[#1e2032]/95 text-cyan-300 border-cyan-700'
          }`}>
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
