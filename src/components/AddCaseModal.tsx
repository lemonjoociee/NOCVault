import React, { useState } from 'react';
import { CaseCategory, IncidentCase, SeverityLevel, User, WorkflowStep } from '../types';
import { useTheme } from '../context/ThemeContext';
import { X, Plus, Trash2, ShieldCheck } from 'lucide-react';

interface AddCaseModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onCaseAdded: (newCase: IncidentCase) => void;
}

export const AddCaseModal: React.FC<AddCaseModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onCaseAdded
}) => {
  const { isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState<SeverityLevel>('P2 - High');
  const [summary, setSummary] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [tags, setTags] = useState('');

  // Dynamic workflow steps
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      stepNumber: 1,
      title: 'Initial Health & Interface Triage',
      instructions: [
        'Inspect operational interface or run connectivity checks.',
        'Review recent alert history in monitoring console.'
      ],
      command: 'ping -c 4 <host_or_ip>',
      credentials: []
    }
  ]);

  // Escalation info
  const [l1Escalation, setL1Escalation] = useState('Tier 1 NOC Shift Desk (Verification within 15 mins)');
  const [l2Escalation, setL2Escalation] = useState('Tier 2 Network / Systems Engineer (On-call phone alert)');
  const [l3Escalation, setL3Escalation] = useState('ICTA Infrastructure Lead & Vendor NOC');

  if (!isOpen) return null;

  const handleAddStep = () => {
    setSteps(prev => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        title: '',
        instructions: [''],
        command: '',
        credentials: []
      }
    ]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) return;
    const updated = steps.filter((_, idx) => idx !== index).map((s, idx) => ({
      ...s,
      stepNumber: idx + 1
    }));
    setSteps(updated);
  };

  const handleStepTitleChange = (index: number, val: string) => {
    const updated = [...steps];
    updated[index].title = val;
    setSteps(updated);
  };

  const handleStepInstructionChange = (stepIndex: number, text: string) => {
    const updated = [...steps];
    updated[stepIndex].instructions = text.split('\n').filter(Boolean);
    setSteps(updated);
  };

  const handleStepCommandChange = (stepIndex: number, val: string) => {
    const updated = [...steps];
    updated[stepIndex].command = val;
    setSteps(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !category.trim()) return;

    const parsedSymptoms = symptoms
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedTags = tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const rawCase = {
      title: title.trim(),
      category: category.trim(),
      severity,
      summary: summary.trim(),
      symptoms: parsedSymptoms.length > 0 ? parsedSymptoms : ['Performance degradation reported on target service'],
      rootCause: rootCause.trim() || undefined,
      workflowSteps: steps.filter(s => s.title.trim().length > 0),
      scripts: [],
      escalationPath: {
        l1: l1Escalation,
        l2: l2Escalation,
        l3: l3Escalation
      },
      author: `${currentUser.fullName} (${currentUser.role})`,
      tags: parsedTags.length > 0 ? parsedTags : [category.trim(), 'Incident Response']
    };

    onCaseAdded(rawCase as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className={`relative w-full max-w-3xl border rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto transition-colors ${
        isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
      }`}>
        
        {/* Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${
          isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
              isDark ? 'bg-[#1f2833] border-[#66fcf1] text-[#66fcf1]' : 'bg-sky-100 border-sky-300 text-sky-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold tracking-wide uppercase font-mono ${
                isDark ? 'text-[#66fcf1]' : 'text-slate-900'
              }`}>
                Add New Troubleshooting Case
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                Record a verified operational workflow, troubleshooting steps, and escalation hierarchy for NOC team reference.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'text-[#c5c6c7] hover:text-[#66fcf1] bg-[#1f2833] border-[#45a29e]/50' : 'text-slate-500 hover:text-slate-800 bg-white border-slate-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className={`p-4 sm:p-6 overflow-y-auto space-y-5 text-xs ${
          isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
        }`}>
          
          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className={`block font-semibold mb-1 uppercase tracking-wider font-mono ${
                isDark ? 'text-[#66fcf1]' : 'text-slate-700'
              }`}>
                Case Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Cisco Core Switch Link Flap & BGP Route Recovery"
                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                  isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                }`}
              />
            </div>

            <div>
              <label className={`block font-semibold mb-1 uppercase tracking-wider font-mono ${
                isDark ? 'text-[#66fcf1]' : 'text-slate-700'
              }`}>
                Severity Level
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as SeverityLevel)}
                className={`w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none ${
                  isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              >
                <option value="P1 - Critical">P1 - Critical Outage</option>
                <option value="P2 - High">P2 - High Severity</option>
                <option value="P3 - Medium">P3 - Medium Severity</option>
                <option value="P4 - Low">P4 - Low / Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label className={`block font-semibold mb-1 uppercase tracking-wider font-mono ${
              isDark ? 'text-[#66fcf1]' : 'text-slate-700'
            }`}>
              Project Name *
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. EMGS, Dynamics GP 2016, Cisco Core, Zoiper VoIP, Payment Gateway..."
              className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Summary */}
          <div>
            <label className={`block font-semibold mb-1 uppercase tracking-wider font-mono ${
              isDark ? 'text-[#66fcf1]' : 'text-slate-700'
            }`}>
              Executive Incident Summary *
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="High-level overview of the issue, affected services, and expected resolution..."
              className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
              }`}
            />
          </div>

          {/* Symptoms & Root cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-red-500 font-semibold mb-1 uppercase tracking-wider font-mono">
                Reported Symptoms (one per line)
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Users unable to sign in&#10;SolarWinds reports node unreachable&#10;HTTP 504 Gateway Timeout"
                className={`w-full px-3 py-2 rounded-lg font-mono text-xs focus:outline-none ${
                  isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
            </div>

            <div>
              <label className="block text-amber-500 font-semibold mb-1 uppercase tracking-wider font-mono">
                Root Cause Analysis (RCA)
              </label>
              <textarea
                rows={3}
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                placeholder="Identified underlying issue (e.g. IPsec phase 2 renegotiation timeout, DNS cache corruption)..."
                className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                  isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Dynamic Workflow Steps */}
          <div className={`pt-2 border-t space-y-3 ${isDark ? 'border-[#45a29e]/30' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <span className={`font-bold uppercase tracking-wider text-xs font-mono ${
                  isDark ? 'text-[#66fcf1]' : 'text-sky-700'
                }`}>
                  Troubleshooting Steps (SOP Checklist)
                </span>
                <p className={`text-[11px] ${isDark ? 'text-[#c5c6c7]/80' : 'text-slate-500'}`}>
                  Sequential instructions for the operator during triage
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                  isDark 
                    ? 'bg-[#45a29e]/30 hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] border-[#45a29e]' 
                    : 'bg-sky-50 hover:bg-sky-100 text-sky-700 border-sky-300'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className={`p-3 rounded-xl border space-y-2 relative ${
                isDark ? 'bg-[#0b0c10] border-[#45a29e]/50' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className={`font-mono font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>
                      Step {step.stepNumber}:
                    </span>
                    <input
                      type="text"
                      required
                      value={step.title}
                      onChange={e => handleStepTitleChange(idx, e.target.value)}
                      placeholder="e.g. Verify Core Gateway Status in SolarWinds"
                      className={`flex-1 px-2.5 py-1 rounded-lg text-xs focus:outline-none ${
                        isDark ? 'bg-[#1f2833] border border-[#45a29e]/50 text-white focus:border-[#66fcf1]' : 'bg-white border border-slate-300 text-slate-900 focus:border-sky-500'
                      }`}
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 text-red-500 hover:bg-red-500/20 rounded cursor-pointer"
                      title="Remove step"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={step.instructions.join('\n')}
                    onChange={e => handleStepInstructionChange(idx, e.target.value)}
                    placeholder="Instructions for this step (one bullet per line)..."
                    className={`w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none ${
                      isDark ? 'bg-[#141c24] border border-[#45a29e]/30 text-white focus:border-[#66fcf1]' : 'bg-white border border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={step.command || ''}
                    onChange={e => handleStepCommandChange(idx, e.target.value)}
                    placeholder="Command to run (e.g. ping -c 4 10.11.4.28 or nslookup ...)"
                    className={`w-full px-2.5 py-1 rounded-lg font-mono text-xs focus:outline-none ${
                      isDark ? 'bg-[#141c24] border border-[#45a29e]/30 text-[#66fcf1] focus:border-[#66fcf1]' : 'bg-slate-900 text-sky-300 border border-slate-700'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Escalation Path */}
          <div className={`pt-2 border-t space-y-2 ${isDark ? 'border-[#45a29e]/30' : 'border-slate-200'}`}>
            <div className={`font-bold uppercase tracking-wider text-xs font-mono ${
              isDark ? 'text-[#66fcf1]' : 'text-slate-800'
            }`}>
              Escalation SLA &amp; Contacts
            </div>

            <div>
              <label className={`block text-[10px] uppercase font-mono mb-1 ${
                isDark ? 'text-[#45a29e]' : 'text-slate-500'
              }`}>
                Tier 2 Escalation Point / Contact
              </label>
              <input
                type="text"
                value={l2Escalation}
                onChange={e => setL2Escalation(e.target.value)}
                placeholder="e.g. Tier 2 Network / Systems Engineer (On-call phone alert)"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none ${
                  isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className={`block text-[10px] uppercase font-mono mb-1 ${
              isDark ? 'text-[#45a29e]' : 'text-slate-500'
            }`}>
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. Cisco, VPN, EMGS, Outage, BGP"
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono ${
                isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Submit buttons */}
          <div className={`pt-4 border-t flex items-center justify-end gap-3 ${
            isDark ? 'border-[#45a29e]/40' : 'border-slate-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-xs border transition-colors ${
                isDark ? 'bg-[#141c24] hover:bg-[#0b0c10] text-[#c5c6c7] border-[#45a29e]/50' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 font-bold rounded-lg text-xs transition-colors shadow-sm ${
                isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              Publish SOP Case to Portal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
