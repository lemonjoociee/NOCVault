import React, { useState } from 'react';
import { IncidentCase } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  X, 
  CheckSquare, 
  Square, 
  Copy, 
  Check, 
  FileText, 
  AlertTriangle, 
  Server, 
  ShieldAlert,
  Clock,
  Key
} from 'lucide-react';

interface CaseDetailModalProps {
  incidentCase: IncidentCase | null;
  onClose: () => void;
  onOpenPdf?: (pdfPath: string, title: string) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  incidentCase,
  onClose,
  onOpenPdf
}) => {
  const { isDark } = useTheme();
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'workflow' | 'escalation'>('workflow');

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
    if (sev.includes('P1')) return isDark ? 'bg-red-950/40 text-red-400 border-red-500/40' : 'bg-red-50 text-red-700 border-red-200';
    if (sev.includes('P2')) return isDark ? 'bg-amber-950/40 text-amber-400 border-amber-500/40' : 'bg-amber-50 text-amber-800 border-amber-300';
    if (sev.includes('P3')) return isDark ? 'bg-sky-950/40 text-sky-400 border-sky-500/40' : 'bg-sky-50 text-sky-800 border-sky-300';
    return isDark ? 'bg-teal-950/40 text-[#66fcf1] border-teal-500/40' : 'bg-teal-50 text-teal-800 border-teal-300';
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const totalSteps = incidentCase.workflowSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-4xl border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto transition-colors ${
        isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex items-start justify-between gap-4 ${
          isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
        }`}>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5 text-xs">
              <span className={`font-mono font-bold px-2 py-0.5 rounded-md border ${
                isDark ? 'text-[#66fcf1] bg-[#1f2833] border-[#66fcf1]/40' : 'text-sky-800 bg-sky-100 border-sky-300'
              }`}>
                {incidentCase.caseNumber}
              </span>
              <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold ${getSeverityBadgeClass(incidentCase.severity)}`}>
                {incidentCase.severity}
              </span>
              <span className={`font-medium font-mono text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                Project: <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{incidentCase.category}</strong>
              </span>
              <span className={isDark ? 'text-[#45a29e]' : 'text-slate-400'}>·</span>
              <span className={`text-[11px] ${isDark ? 'text-[#c5c6c7]/70' : 'text-slate-500'}`}>
                Updated by {incidentCase.author} on {incidentCase.createdDate}
              </span>
            </div>
            
            <h2 className={`text-lg sm:text-xl font-bold tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {incidentCase.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'text-[#c5c6c7] hover:text-[#66fcf1] bg-[#1f2833] hover:bg-[#0b0c10] border-[#45a29e]/50' : 'text-slate-500 hover:text-slate-800 bg-white border-slate-300 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation Bar */}
        <div className={`px-4 sm:px-6 border-b flex items-center justify-between gap-2 overflow-x-auto ${
          isDark ? 'bg-[#141c24] border-[#45a29e]/30' : 'bg-slate-100 border-slate-200'
        }`}>
          <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveSubTab('workflow')}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'workflow'
                  ? isDark ? 'border-[#66fcf1] text-[#66fcf1]' : 'border-sky-600 text-sky-700 font-bold'
                  : isDark ? 'border-transparent text-[#c5c6c7] hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Step-by-Step SOP ({completedCount}/{totalSteps})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('escalation')}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'escalation'
                  ? isDark ? 'border-[#66fcf1] text-[#66fcf1]' : 'border-sky-600 text-sky-700 font-bold'
                  : isDark ? 'border-transparent text-[#c5c6c7] hover:text-white' : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalation Matrix</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className={`p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm ${
          isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
        }`}>
          
          {/* Target Nodes & Incident Summary */}
          <div className={`border rounded-xl p-4 space-y-3 ${
            isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
          }`}>
            <div>
              <div className={`text-xs uppercase tracking-wider font-semibold mb-1 ${
                isDark ? 'text-[#45a29e]' : 'text-sky-700'
              }`}>
                Executive Incident Summary
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {incidentCase.summary}
              </p>
            </div>

            {/* Target Nodes row */}
            {incidentCase.targetNodes && incidentCase.targetNodes.length > 0 && (
              <div className={`flex flex-wrap items-center gap-2 pt-2 border-t ${
                isDark ? 'border-[#45a29e]/20' : 'border-slate-200'
              }`}>
                <span className={`text-xs flex items-center gap-1 ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                  <Server className="w-3.5 h-3.5" />
                  Target Nodes:
                </span>
                {incidentCase.targetNodes.map((node, i) => (
                  <button
                    key={i}
                    onClick={() => copyToClipboard(node, `node-${i}`)}
                    className={`font-mono text-xs px-2 py-0.5 rounded-md border flex items-center gap-1.5 transition-colors ${
                      isDark 
                        ? 'bg-[#1f2833] text-[#66fcf1] border-[#45a29e]/60 hover:border-[#66fcf1]' 
                        : 'bg-white text-sky-700 border-slate-300 hover:border-sky-500'
                    }`}
                    title="Click to copy host/IP"
                  >
                    <span>{node}</span>
                    {copiedText === `node-${i}` ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-60" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Symptoms & Root Cause */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t text-xs ${
              isDark ? 'border-[#45a29e]/20' : 'border-slate-200'
            }`}>
              <div>
                <span className="text-red-500 font-semibold block mb-1">Reported Symptoms:</span>
                <ul className={`list-disc list-inside space-y-0.5 ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                  {incidentCase.symptoms.map((sym, idx) => (
                    <li key={idx}>{sym}</li>
                  ))}
                </ul>
              </div>

              {incidentCase.rootCause && (
                <div>
                  <span className="text-amber-500 font-semibold block mb-1">Root Cause / Pathology:</span>
                  <p className={isDark ? 'text-white/90' : 'text-slate-800'}>{incidentCase.rootCause}</p>
                </div>
              )}
            </div>
          </div>

          {/* TAB 1: WORKFLOW STEPS */}
          {activeSubTab === 'workflow' && (
            <div className="space-y-4">
              
              {/* Progress bar */}
              <div className={`flex items-center justify-between text-xs mb-2 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Triage Checklist Progress: {completedCount} of {totalSteps} steps completed
                </span>
                <span className={`font-mono font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>{progressPercent}%</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                isDark ? 'bg-[#0b0c10] border-[#45a29e]/30' : 'bg-slate-200 border-slate-300'
              }`}>
                <div 
                  className={`h-full transition-all duration-300 ${isDark ? 'bg-[#66fcf1]' : 'bg-sky-600'}`}
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
                      className={`p-4 rounded-xl border transition-all ${
                        isDone 
                          ? isDark ? 'bg-[#0b0c10]/40 border-[#45a29e]/30 opacity-75' : 'bg-slate-50 border-slate-200 opacity-70'
                          : isDark ? 'bg-[#0b0c10] border-[#45a29e]/70 shadow-sm' : 'bg-white border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <button
                          onClick={() => toggleStep(step.stepNumber)}
                          className="flex items-center gap-2.5 text-left group cursor-pointer"
                        >
                          {isDone ? (
                            <CheckSquare className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                          ) : (
                            <Square className={`w-5 h-5 shrink-0 ${isDark ? 'text-[#45a29e] group-hover:text-[#66fcf1]' : 'text-slate-400 group-hover:text-sky-600'}`} />
                          )}
                          <span className={`font-semibold text-sm ${
                            isDone 
                              ? 'line-through opacity-60' 
                              : isDark ? 'text-white' : 'text-slate-900'
                          }`}>
                            {step.stepNumber}. {step.title}
                          </span>
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className={`pl-7 space-y-1.5 text-xs leading-relaxed ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                        {step.instructions.map((inst, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className={`font-mono shrink-0 ${isDark ? 'text-[#45a29e]' : 'text-sky-600'}`}>›</span>
                            <span>{inst}</span>
                          </div>
                        ))}

                        {/* Optional Warning */}
                        {step.warning && (
                          <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/40 text-red-500 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span>{step.warning}</span>
                          </div>
                        )}

                        {/* Optional Screenshot Reference Note */}
                        {step.screenshotNote && (
                          <div className={`mt-2 p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            isDark ? 'bg-[#1f2833] border-[#45a29e]/40 text-[#66fcf1]' : 'bg-sky-50 border-sky-200 text-sky-800'
                          }`}>
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span><strong>Reference:</strong> {step.screenshotNote}</span>
                          </div>
                        )}

                        {/* Credentials block */}
                        {step.credentials && step.credentials.length > 0 && (
                          <div className={`mt-3 p-3 rounded-lg border space-y-2 ${
                            isDark ? 'bg-[#141c24] border-[#45a29e]/50' : 'bg-slate-50 border-slate-300'
                          }`}>
                            <div className={`text-[11px] font-semibold flex items-center gap-1.5 uppercase ${
                              isDark ? 'text-[#66fcf1]' : 'text-sky-700'
                            }`}>
                              <Key className="w-3 h-3" />
                              <span>Required Credentials &amp; Parameters</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {step.credentials.map((cred, cIdx) => (
                                <div key={cIdx} className={`p-2 rounded-md border flex items-center justify-between gap-2 ${
                                  isDark ? 'bg-[#0b0c10] border-[#45a29e]/30' : 'bg-white border-slate-200'
                                }`}>
                                  <div className="overflow-hidden">
                                    <div className={`text-[10px] uppercase font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>{cred.label}</div>
                                    <div className={`font-mono text-xs truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{cred.value}</div>
                                  </div>
                                  <button
                                    onClick={() => copyToClipboard(cred.value, `cred-${step.stepNumber}-${cIdx}`)}
                                    className={`p-1 rounded ${isDark ? 'text-[#c5c6c7] hover:text-[#66fcf1] bg-[#1f2833]' : 'text-slate-500 hover:text-sky-700 bg-slate-100'}`}
                                    title="Copy credential"
                                  >
                                    {copiedText === `cred-${step.stepNumber}-${cIdx}` ? (
                                      <Check className="w-3 h-3 text-emerald-500" />
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
                            <div className={`flex items-center justify-between px-3 py-1 rounded-t-lg border-t border-x text-[10px] font-mono ${
                              isDark ? 'bg-[#141c24] border-[#45a29e]/40 text-[#45a29e]' : 'bg-slate-100 border-slate-300 text-slate-600'
                            }`}>
                              <span>COMMAND LINE EXECUTION</span>
                              <button
                                onClick={() => copyToClipboard(step.command!, `cmd-${step.stepNumber}`)}
                                className={`flex items-center gap-1 hover:underline ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}
                              >
                                {copiedText === `cmd-${step.stepNumber}` ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
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
                            <pre className={`p-3 rounded-b-lg border text-xs font-mono overflow-x-auto whitespace-pre-wrap ${
                              isDark ? 'bg-[#0b0c10] border-[#45a29e]/40 text-[#66fcf1]' : 'bg-slate-900 border-slate-800 text-sky-300'
                            }`}>
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

          {/* TAB 2: ESCALATION MATRIX */}
          {activeSubTab === 'escalation' && (
            <div className="space-y-4">
              <div className={`border rounded-xl p-4 space-y-4 ${
                isDark ? 'bg-[#0b0c10] border-[#45a29e]/50' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <span>Designated Escalation Hierarchy for {incidentCase.caseNumber}</span>
                  </h3>
                  <div className="text-xs text-amber-500 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      Target Resolution SLA: {incidentCase.escalationPath.slaMins ? `${incidentCase.escalationPath.slaMins} mins` : 'Standard Tier Matrix'}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className={`p-3 rounded-lg border-l-4 border-l-teal-500 ${
                    isDark ? 'bg-[#1f2833]' : 'bg-white border border-slate-200 shadow-sm'
                  }`}>
                    <div className={`font-semibold ${isDark ? 'text-[#66fcf1]' : 'text-teal-700'}`}>Tier 1 NOC Response (0 - 15 mins)</div>
                    <div className={`mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{incidentCase.escalationPath.l1}</div>
                  </div>

                  <div className={`p-3 rounded-lg border-l-4 border-l-amber-500 ${
                    isDark ? 'bg-[#1f2833]' : 'bg-white border border-slate-200 shadow-sm'
                  }`}>
                    <div className="font-semibold text-amber-500">Tier 2 Engineering Escalation (15 - 30 mins)</div>
                    <div className={`mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{incidentCase.escalationPath.l2}</div>
                  </div>

                  <div className={`p-3 rounded-lg border-l-4 border-l-red-500 ${
                    isDark ? 'bg-[#1f2833]' : 'bg-white border border-slate-200 shadow-sm'
                  }`}>
                    <div className="font-semibold text-red-500">Tier 3 Architecture &amp; Vendor Lead (30+ mins)</div>
                    <div className={`mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{incidentCase.escalationPath.l3}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex items-center justify-between ${
          isDark ? 'border-[#45a29e]/40 bg-[#0b0c10]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className={`text-xs font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>
            Tags: {incidentCase.tags.join(', ')}
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              isDark ? 'bg-[#1f2833] hover:bg-[#141c24] text-white border-[#45a29e]' : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            Close SOP Guide
          </button>
        </div>

      </div>
    </div>
  );
};
