import React, { useState } from 'react';
import { IncidentCase, AutomatedScript } from '../types';
import { 
  X, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  Terminal, 
  FileText, 
  AlertTriangle, 
  Server, 
  ExternalLink,
  ShieldAlert,
  Clock,
  Key
} from 'lucide-react';

interface CaseDetailModalProps {
  incidentCase: IncidentCase | null;
  onClose: () => void;
  onRunScript: (script: AutomatedScript) => void;
  onOpenPdf: (pdfPath: string, title: string) => void;
  onGenerateEscalation: (incidentCase: IncidentCase) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  incidentCase,
  onClose,
  onRunScript,
  onOpenPdf,
  onGenerateEscalation
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'workflow' | 'scripts' | 'escalation'>('workflow');

  if (!incidentCase) return null;

  const toggleStep = (stepNum: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getSeverityBadgeClass = (sev: string) => {
    if (sev.includes('P1')) return 'bg-[#ff4d4d]/20 text-[#ff4d4d] border-[#ff4d4d]/50';
    if (sev.includes('P2')) return 'bg-[#f5a623]/20 text-[#f5a623] border-[#f5a623]/50';
    if (sev.includes('P3')) return 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/50';
    return 'bg-[#45a29e]/20 text-[#66fcf1] border-[#45a29e]/50';
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = incidentCase.workflowSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#1f2833] border border-[#45a29e] rounded-lg shadow-[0_0_30px_rgba(102,252,241,0.25)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#45a29e]/40 bg-[#0b0c10] flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
              <span className="font-mono text-[#66fcf1] font-bold px-2 py-0.5 rounded bg-[#1f2833] border border-[#66fcf1]/40">
                {incidentCase.caseNumber}
              </span>
              <span className={`px-2 py-0.5 rounded border text-xs font-semibold ${getSeverityBadgeClass(incidentCase.severity)}`}>
                {incidentCase.severity}
              </span>
              <span className="text-[#c5c6c7] font-medium">
                {incidentCase.category}
              </span>
              <span className="text-[#45a29e]">·</span>
              <span className="text-[#c5c6c7]/70 text-[11px]">
                Updated by {incidentCase.author} on {incidentCase.createdDate}
              </span>
            </div>
            
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-wide">
              {incidentCase.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#c5c6c7] hover:text-[#66fcf1] rounded bg-[#1f2833] hover:bg-[#0b0c10] border border-[#45a29e]/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className="px-4 sm:px-6 bg-[#141c24] border-b border-[#45a29e]/30 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('workflow')}
              className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'workflow'
                  ? 'border-[#66fcf1] text-[#66fcf1]'
                  : 'border-transparent text-[#c5c6c7] hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Step-by-Step SOP ({completedCount}/{totalSteps})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('scripts')}
              className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'scripts'
                  ? 'border-[#66fcf1] text-[#66fcf1]'
                  : 'border-transparent text-[#c5c6c7] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Response Scripts ({incidentCase.scripts.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('escalation')}
              className={`py-3 px-2 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'escalation'
                  ? 'border-[#66fcf1] text-[#66fcf1]'
                  : 'border-transparent text-[#c5c6c7] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalation Matrix</span>
            </button>
          </div>

          {/* Quick PDF Attachment button if available */}
          {incidentCase.pdfAttachment && (
            <button
              onClick={() => onOpenPdf(incidentCase.pdfAttachment!.path, incidentCase.pdfAttachment!.title)}
              className="my-1.5 flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-[#45a29e]/20 hover:bg-[#66fcf1]/20 text-[#66fcf1] border border-[#66fcf1]/40 rounded transition-colors whitespace-nowrap shrink-0"
              title="Open the official attached guide PDF"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Original PDF</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-[#c5c6c7]">
          
          {/* Target Nodes & Incident Summary */}
          <div className="bg-[#0b0c10] border border-[#45a29e]/40 rounded p-4 space-y-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-[#45a29e] font-semibold mb-1">
                Executive Incident Summary
              </div>
              <p className="text-xs sm:text-sm text-white leading-relaxed">
                {incidentCase.summary}
              </p>
            </div>

            {/* Target Nodes row */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#45a29e]/20">
              <span className="text-xs text-[#45a29e] flex items-center gap-1">
                <Server className="w-3.5 h-3.5" />
                Target Nodes:
              </span>
              {incidentCase.targetNodes.map((node, i) => (
                <button
                  key={i}
                  onClick={() => copyToClipboard(node, `node-${i}`)}
                  className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f2833] text-[#66fcf1] border border-[#45a29e]/60 hover:border-[#66fcf1] flex items-center gap-1.5 transition-colors"
                  title="Click to copy host/IP"
                >
                  <span>{node}</span>
                  {copiedText === `node-${i}` ? (
                    <Check className="w-3 h-3 text-[#66fcf1]" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-60" />
                  )}
                </button>
              ))}
            </div>

            {/* Symptoms & Root Cause */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#45a29e]/20 text-xs">
              <div>
                <span className="text-[#ff4d4d] font-semibold block mb-1">Reported Symptoms:</span>
                <ul className="list-disc list-inside space-y-0.5 text-white/90">
                  {incidentCase.symptoms.map((sym, idx) => (
                    <li key={idx}>{sym}</li>
                  ))}
                </ul>
              </div>

              {incidentCase.rootCause && (
                <div>
                  <span className="text-[#f5a623] font-semibold block mb-1">Root Cause / Pathology:</span>
                  <p className="text-white/90">{incidentCase.rootCause}</p>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: WORKFLOW STEPS */}
          {activeSubTab === 'workflow' && (
            <div className="space-y-4">
              
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-[#c5c6c7] mb-2">
                <span className="font-semibold text-white">
                  Triage Checklist Progress: {completedCount} of {totalSteps} steps completed
                </span>
                <span className="font-mono text-[#66fcf1]">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#0b0c10] h-1.5 rounded-full overflow-hidden border border-[#45a29e]/30">
                <div 
                  className="h-full bg-[#66fcf1] transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Steps list */}
              <div className="space-y-4 mt-4">
                {incidentCase.workflowSteps.map((step) => {
                  const isDone = !!completedSteps[step.stepNumber];
                  return (
                    <div 
                      key={step.stepNumber}
                      className={`p-4 rounded border transition-all ${
                        isDone 
                          ? 'bg-[#0b0c10]/40 border-[#45a29e]/30 opacity-75' 
                          : 'bg-[#0b0c10] border-[#45a29e]/70 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <button
                          onClick={() => toggleStep(step.stepNumber)}
                          className="flex items-center gap-2.5 text-left group"
                        >
                          {isDone ? (
                            <CheckSquare className="w-5 h-5 text-[#66fcf1] shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-[#45a29e] group-hover:text-[#66fcf1] shrink-0" />
                          )}
                          <span className={`font-semibold text-sm ${isDone ? 'line-through text-[#c5c6c7]/60' : 'text-white'}`}>
                            {step.stepNumber}. {step.title}
                          </span>
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className="pl-7 space-y-1.5 text-xs text-[#c5c6c7] leading-relaxed">
                        {step.instructions.map((inst, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-[#45a29e] font-mono shrink-0">›</span>
                            <span>{inst}</span>
                          </div>
                        ))}

                        {/* Optional Warning */}
                        {step.warning && (
                          <div className="mt-2 p-2.5 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/40 text-[#ff4d4d] text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{step.warning}</span>
                          </div>
                        )}

                        {/* Optional Screenshot Reference Note */}
                        {step.screenshotNote && (
                          <div className="mt-2 p-2 rounded bg-[#1f2833] border border-[#45a29e]/40 text-xs text-[#66fcf1] flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span><strong>Reference:</strong> {step.screenshotNote}</span>
                          </div>
                        )}

                        {/* Credentials block */}
                        {step.credentials && step.credentials.length > 0 && (
                          <div className="mt-3 p-3 bg-[#141c24] border border-[#45a29e]/50 rounded space-y-2">
                            <div className="text-[11px] font-semibold text-[#66fcf1] flex items-center gap-1.5 uppercase">
                              <Key className="w-3 h-3" />
                              <span>Required Credentials &amp; Parameters</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {step.credentials.map((cred, cIdx) => (
                                <div key={cIdx} className="bg-[#0b0c10] p-2 rounded border border-[#45a29e]/30 flex items-center justify-between gap-2">
                                  <div className="overflow-hidden">
                                    <div className="text-[10px] text-[#45a29e] uppercase font-mono">{cred.label}</div>
                                    <div className="font-mono text-xs text-white truncate">{cred.value}</div>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(cred.value, `cred-${step.stepNumber}-${cIdx}`)}
                                    className="p-1 text-[#c5c6c7] hover:text-[#66fcf1] rounded bg-[#1f2833]"
                                    title="Copy credential"
                                  >
                                    {copiedText === `cred-${step.stepNumber}-${cIdx}` ? (
                                      <Check className="w-3 h-3 text-[#66fcf1]" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Command Code Snippet */}
                        {step.command && (
                          <div className="mt-3 relative group">
                            <div className="flex items-center justify-between bg-[#141c24] px-3 py-1 rounded-t border-t border-x border-[#45a29e]/40 text-[10px] text-[#45a29e] font-mono">
                              <span>COMMAND LINE EXECUTION</span>
                              <button
                                onClick={() => copyToClipboard(step.command!, `cmd-${step.stepNumber}`)}
                                className="flex items-center gap-1 text-[#66fcf1] hover:underline"
                              >
                                {copiedText === `cmd-${step.stepNumber}` ? (
                                  <>
                                    <Check className="w-3 h-3" />
                                    <span>Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <pre className="p-3 bg-[#0b0c10] border border-[#45a29e]/40 rounded-b text-xs font-mono text-[#66fcf1] overflow-x-auto whitespace-pre-wrap">
                              {step.command}
                            </pre>
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: AUTOMATED SCRIPTS */}
          {activeSubTab === 'scripts' && (
            <div className="space-y-4">
              <div className="text-xs text-[#c5c6c7]">
                The following automated diagnostic and remediation scripts are certified for this case. You can execute them inside the embedded NOC Terminal Simulator.
              </div>

              {incidentCase.scripts.map((script) => (
                <div key={script.id} className="bg-[#0b0c10] border border-[#45a29e] rounded p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{script.name}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1f2833] text-[#66fcf1] border border-[#45a29e]/50">
                          {script.language}
                        </span>
                      </div>
                      <p className="text-xs text-[#c5c6c7] mt-1">{script.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        onRunScript(script);
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Execute Script</span>
                    </button>
                  </div>

                  <div className="relative">
                    <pre className="p-3 bg-[#141c24] border border-[#45a29e]/30 rounded text-xs font-mono text-[#66fcf1] max-h-48 overflow-y-auto">
                      {script.code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: ESCALATION MATRIX */}
          {activeSubTab === 'escalation' && (
            <div className="space-y-4">
              <div className="bg-[#0b0c10] border border-[#45a29e]/50 rounded p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#ff4d4d]" />
                    <span>Designated Escalation Hierarchy for {incidentCase.caseNumber}</span>
                  </h3>
                  <div className="text-xs text-[#f5a623] font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Target Resolution SLA: {incidentCase.escalationPath.slaMins} mins</span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded bg-[#1f2833] border-l-4 border-l-[#45a29e]">
                    <div className="font-semibold text-[#66fcf1]">Tier 1 NOC Response (0 - 15 mins)</div>
                    <div className="text-white mt-0.5">{incidentCase.escalationPath.l1}</div>
                  </div>

                  <div className="p-3 rounded bg-[#1f2833] border-l-4 border-l-[#f5a623]">
                    <div className="font-semibold text-[#f5a623]">Tier 2 Engineering Escalation (15 - 30 mins)</div>
                    <div className="text-white mt-0.5">{incidentCase.escalationPath.l2}</div>
                  </div>

                  <div className="p-3 rounded bg-[#1f2833] border-l-4 border-l-[#ff4d4d]">
                    <div className="font-semibold text-[#ff4d4d]">Tier 3 Architecture &amp; Vendor Lead (30+ mins)</div>
                    <div className="text-white mt-0.5">{incidentCase.escalationPath.l3}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#45a29e]/30 flex justify-end">
                  <button
                    onClick={() => {
                      onGenerateEscalation(incidentCase);
                      onClose();
                    }}
                    className="px-4 py-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold text-xs rounded transition-colors flex items-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Generate Handover Ticket for this Case</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#45a29e]/40 bg-[#0b0c10] flex items-center justify-between">
          <div className="text-xs text-[#45a29e] font-mono">
            Tags: {incidentCase.tags.join(', ')}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1f2833] hover:bg-[#141c24] text-white border border-[#45a29e] rounded text-xs font-semibold transition-colors"
          >
            Close SOP Guide
          </button>
        </div>

      </div>
    </div>
  );
};
