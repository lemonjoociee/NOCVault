import React, { useState, useEffect } from 'react';
import { AutomatedScript } from '../types';
import { 
  Play, 
  Copy, 
  Check, 
  RotateCcw, 
  Terminal as TerminalIcon, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface ScriptRunnerProps {
  scripts: AutomatedScript[];
  selectedScriptId?: string;
}

export const ScriptRunner: React.FC<ScriptRunnerProps> = ({
  scripts,
  selectedScriptId
}) => {
  const [activeScript, setActiveScript] = useState<AutomatedScript>(scripts[0]);
  const [customTarget, setCustomTarget] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasCompleted, setHasCompleted] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [exitCode, setExitCode] = useState<number | null>(null);

  // Sync if selectedScriptId changes from external trigger
  useEffect(() => {
    if (selectedScriptId) {
      const match = scripts.find(s => s.id === selectedScriptId);
      if (match) {
        setActiveScript(match);
        setCustomTarget(match.defaultTarget || '');
        setTerminalOutput([`[*] Script '${match.name}' loaded. Press 'Run Diagnostic Script' to begin.`]);
        setHasCompleted(false);
        setExitCode(null);
      }
    } else if (scripts.length > 0 && !activeScript) {
      setActiveScript(scripts[0]);
      setCustomTarget(scripts[0].defaultTarget || '');
    }
  }, [selectedScriptId, scripts]);

  // When active script changes
  const handleSelectScript = (s: AutomatedScript) => {
    setActiveScript(s);
    setCustomTarget(s.defaultTarget || '');
    setTerminalOutput([`[*] Script '${s.name}' loaded. Ready to execute against target: ${s.defaultTarget || 'Default Host'}`]);
    setHasCompleted(false);
    setExitCode(null);
  };

  const copyScriptCode = () => {
    navigator.clipboard.writeText(activeScript.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunScript = () => {
    if (isRunning) return;
    setIsRunning(true);
    setHasCompleted(false);
    setExitCode(null);
    setTerminalOutput([`[*] Initializing automated execution sequence: ${activeScript.name}...`]);

    const target = customTarget.trim() || activeScript.defaultTarget || 'localhost';
    
    // Simulate streaming execution lines
    const lines = activeScript.expectedOutput.split('\n');
    let currentIdx = 0;

    const timer = setInterval(() => {
      if (currentIdx < lines.length) {
        setTerminalOutput(prev => [...prev, lines[currentIdx]]);
        currentIdx++;
      } else {
        clearInterval(timer);
        setIsRunning(false);
        setHasCompleted(true);
        setExitCode(0);
        setTerminalOutput(prev => [
          ...prev,
          '',
          `[NOC-AGENT] Execution completed with status code 0 (SUCCESS).`,
          `[TIMESTAMP] ${new Date().toISOString()} | Target: ${target}`
        ]);
      }
    }, 280);
  };

  const handleClearTerminal = () => {
    setTerminalOutput([`[*] Terminal reset. Ready for next diagnostic execution.`]);
    setHasCompleted(false);
    setExitCode(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TerminalIcon className="w-5 h-5 text-[#66fcf1]" />
            <h2 className="text-lg font-bold text-white tracking-wide uppercase font-mono">
              Automated Incident Response Console
            </h2>
          </div>
          <p className="text-xs text-[#c5c6c7]">
            Execute verified diagnostic scripts, test port connectivity, query SolarWinds gateways, and benchmark API latency.
          </p>
        </div>

        {/* Script Selection Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-[#45a29e] font-semibold whitespace-nowrap">
            Select Script:
          </label>
          <select
            value={activeScript?.id}
            onChange={(e) => {
              const selected = scripts.find(s => s.id === e.target.value);
              if (selected) handleSelectScript(selected);
            }}
            className="px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-xs text-white focus:outline-none focus:border-[#66fcf1] max-w-xs truncate"
          >
            {scripts.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.language})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Script Configuration & Runner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Script Details & Code */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  {activeScript.name}
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className="font-mono text-[#66fcf1] uppercase bg-[#0b0c10] px-1.5 py-0.5 rounded border border-[#45a29e]/40">
                    {activeScript.language}
                  </span>
                  <span className="text-[#c5c6c7]">{activeScript.category}</span>
                </div>
              </div>

              <button
                onClick={copyScriptCode}
                className="px-2.5 py-1 text-xs font-mono rounded bg-[#0b0c10] text-[#c5c6c7] hover:text-[#66fcf1] border border-[#45a29e]/40 flex items-center gap-1.5 transition-colors"
                title="Copy full script code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#66fcf1]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <p className="text-xs text-[#c5c6c7] leading-relaxed">
              {activeScript.description}
            </p>

            {/* Target Override */}
            <div>
              <label className="block text-[11px] font-semibold text-[#45a29e] uppercase font-mono mb-1 flex items-center gap-1">
                <Server className="w-3 h-3" />
                <span>Target Host / Node IP:</span>
              </label>
              <input
                type="text"
                value={customTarget}
                onChange={e => setCustomTarget(e.target.value)}
                placeholder="Target node (e.g. 10.11.4.28 or KL-FINDBS1-VM)"
                className="w-full px-2.5 py-1.5 bg-[#0b0c10] border border-[#45a29e]/60 rounded text-xs text-[#66fcf1] font-mono focus:outline-none focus:border-[#66fcf1]"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunScript}
              disabled={isRunning}
              className={`w-full py-2.5 px-4 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(69,162,158,0.3)] ${
                isRunning
                  ? 'bg-[#141c24] text-[#c5c6c7] cursor-not-allowed border border-[#45a29e]/30'
                  : 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]'
              }`}
            >
              {isRunning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#66fcf1] border-t-transparent rounded-full animate-spin" />
                  <span>Executing Automation Diagnostics...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Diagnostic Script</span>
                </>
              )}
            </button>
          </div>

          {/* Script Code View */}
          <div className="bg-[#0b0c10] border border-[#45a29e]/40 rounded-lg p-3 space-y-2">
            <div className="text-[10px] text-[#45a29e] font-mono uppercase tracking-wider flex items-center justify-between">
              <span>Source Script ({activeScript.language})</span>
              <span>READ-ONLY INSPECTION</span>
            </div>
            <pre className="p-3 bg-[#141c24] border border-[#45a29e]/30 rounded text-[11px] font-mono text-[#66fcf1] max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {activeScript.code}
            </pre>
          </div>
        </div>

        {/* Right Column: Terminal Console */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-[#0b0c10] border border-[#45a29e] rounded-lg shadow-[0_0_20px_rgba(102,252,241,0.15)] flex flex-col h-[520px] overflow-hidden">
            
            {/* Terminal Top Window Bar */}
            <div className="px-4 py-2.5 bg-[#141c24] border-b border-[#45a29e]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff4d4d]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f5a623]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#66fcf1]" />
                </div>
                <span className="text-xs font-mono text-[#c5c6c7] ml-2">
                  noc-session@gateway:~# {activeScript.language === 'powershell' ? 'powershell' : 'bash'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {exitCode !== null && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#66fcf1]/10 text-[#66fcf1] border border-[#66fcf1]/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>EXIT 0</span>
                  </span>
                )}
                <button
                  onClick={handleClearTerminal}
                  className="p-1 text-[#c5c6c7] hover:text-white rounded hover:bg-[#1f2833]"
                  title="Clear Terminal Output"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Terminal Body Screen */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-1 bg-[#0b0c10] text-[#c5c6c7]">
              {terminalOutput.map((line, idx) => {
                let colorClass = 'text-[#c5c6c7]';
                if (line.startsWith('[*]')) colorClass = 'text-[#66fcf1]';
                else if (line.startsWith('[+]') || line.includes('[OK]') || line.includes('[SUCCESS]')) colorClass = 'text-[#66fcf1] font-semibold';
                else if (line.includes('FAIL') || line.includes('CRITICAL') || line.includes('[ERR]')) colorClass = 'text-[#ff4d4d] font-bold';
                else if (line.includes('WARN')) colorClass = 'text-[#f5a623]';
                else if (line.startsWith('Name:') || line.startsWith('Address:')) colorClass = 'text-white font-medium';

                return (
                  <div key={idx} className={`${colorClass} leading-relaxed whitespace-pre-wrap`}>
                    {line}
                  </div>
                );
              })}

              {isRunning && (
                <div className="flex items-center gap-2 text-[#66fcf1] pt-1">
                  <div className="w-2 h-4 bg-[#66fcf1] animate-pulse" />
                  <span className="text-[11px] text-[#45a29e]">Executing diagnostic packets...</span>
                </div>
              )}
            </div>

            {/* Terminal Bottom Status */}
            <div className="px-4 py-2 bg-[#141c24] border-t border-[#45a29e]/30 flex items-center justify-between text-[11px] font-mono text-[#45a29e]">
              <div className="flex items-center gap-3">
                <span>BUFFER: READY</span>
                <span>·</span>
                <span>TIMEOUT: 5000ms</span>
              </div>
              <div className="flex items-center gap-1 text-[#66fcf1]">
                <Clock className="w-3 h-3" />
                <span>NOC LIVE DIAGNOSTICS</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Available Scripts Library grid */}
      <div className="bg-[#1f2833] border border-[#45a29e]/40 rounded-lg p-5 space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#66fcf1]" />
          <span>Quick Launcher Library</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {scripts.map(s => (
            <div
              key={s.id}
              onClick={() => handleSelectScript(s)}
              className={`p-3 rounded border cursor-pointer transition-all ${
                activeScript?.id === s.id
                  ? 'bg-[#0b0c10] border-[#66fcf1] shadow-[0_0_12px_rgba(102,252,241,0.2)]'
                  : 'bg-[#0b0c10]/60 border-[#45a29e]/30 hover:border-[#45a29e]'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                <span className="truncate pr-2">{s.name}</span>
                <span className="text-[10px] font-mono text-[#66fcf1] uppercase">{s.language}</span>
              </div>
              <p className="text-[11px] text-[#c5c6c7] line-clamp-2 leading-relaxed">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
