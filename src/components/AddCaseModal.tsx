import React, { useState } from 'react';
import { CaseCategory, IncidentCase, SeverityLevel, User, WorkflowStep } from '../types';
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
      <div className="relative w-full max-w-3xl bg-[#1f2833] border border-[#45a29e] rounded-lg shadow-[0_0_30px_rgba(102,252,241,0.25)] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#45a29e]/40 bg-[#0b0c10] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#1f2833] border border-[#66fcf1] flex items-center justify-center text-[#66fcf1]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#66fcf1] tracking-wide uppercase font-mono">
                Add New Troubleshooting Case
              </h2>
              <p className="text-xs text-[#c5c6c7]">
                Record a verified operational workflow, troubleshooting steps, and escalation hierarchy for NOC team reference.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#c5c6c7] hover:text-[#66fcf1] rounded bg-[#1f2833] border border-[#45a29e]/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-[#c5c6c7]">
          
          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                Case Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Cisco Core Switch Link Flap & BGP Route Recovery"
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
              />
            </div>

            <div>
              <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                Severity Level
              </label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as SeverityLevel)}
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
              >
                <option value="P1 - Critical">P1 - Critical Outage</option>
                <option value="P2 - High">P2 - High Severity</option>
                <option value="P3 - Medium">P3 - Medium Severity</option>
                <option value="P4 - Low">P4 - Low / Inquiry</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="e.g. EMGS, Dynamics GP 2016, Cisco Core, Zoiper VoIP, Payment Gateway..."
              className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
              Executive Incident Summary *
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="High-level overview of the issue, affected services, and expected resolution..."
              className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
            />
          </div>

          {/* Symptoms & Root cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#ff4d4d] font-semibold mb-1 uppercase tracking-wider">
                Reported Symptoms (one per line)
              </label>
              <textarea
                rows={3}
                value={symptoms}
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Users unable to sign in&#10;SolarWinds reports node unreachable&#10;HTTP 504 Gateway Timeout"
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white font-mono text-xs focus:outline-none focus:border-[#66fcf1]"
              />
            </div>

            <div>
              <label className="block text-[#f5a623] font-semibold mb-1 uppercase tracking-wider">
                Root Cause Analysis (RCA)
              </label>
              <textarea
                rows={3}
                value={rootCause}
                onChange={e => setRootCause(e.target.value)}
                placeholder="Identified underlying issue (e.g. IPsec phase 2 renegotiation timeout, DNS cache corruption)..."
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
              />
            </div>
          </div>

          {/* Dynamic Workflow Steps */}
          <div className="pt-2 border-t border-[#45a29e]/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[#66fcf1] font-bold uppercase tracking-wider text-xs">
                  Troubleshooting Steps (SOP Checklist)
                </span>
                <p className="text-[11px] text-[#c5c6c7]/80">
                  Sequential instructions for the operator during triage
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#45a29e]/30 hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] rounded border border-[#45a29e] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            {steps.map((step, idx) => (
              <div key={idx} className="p-3 bg-[#0b0c10] border border-[#45a29e]/50 rounded space-y-2 relative">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="font-mono text-[#66fcf1] font-bold">Step {step.stepNumber}:</span>
                    <input
                      type="text"
                      required
                      value={step.title}
                      onChange={e => handleStepTitleChange(idx, e.target.value)}
                      placeholder="e.g. Verify Core Gateway Status in SolarWinds"
                      className="flex-1 px-2.5 py-1 bg-[#1f2833] border border-[#45a29e]/50 rounded text-white text-xs focus:outline-none focus:border-[#66fcf1]"
                    />
                  </div>
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStep(idx)}
                      className="p-1 text-[#ff4d4d] hover:bg-[#ff4d4d]/20 rounded"
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
                    className="w-full px-2.5 py-1.5 bg-[#141c24] border border-[#45a29e]/30 rounded text-white text-xs focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={step.command || ''}
                    onChange={e => handleStepCommandChange(idx, e.target.value)}
                    placeholder="Command to run (e.g. ping -c 4 10.11.4.28 or nslookup ...)"
                    className="w-full px-2.5 py-1 bg-[#141c24] border border-[#45a29e]/30 rounded text-[#66fcf1] font-mono text-xs focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Escalation Path */}
          <div className="pt-2 border-t border-[#45a29e]/30 space-y-2">
            <div className="text-[#66fcf1] font-bold uppercase tracking-wider text-xs">
              Escalation SLA &amp; Contacts
            </div>

            <div>
              <label className="block text-[10px] text-[#45a29e] uppercase font-mono mb-1">
                Tier 2 Escalation Point / Contact
              </label>
              <input
                type="text"
                value={l2Escalation}
                onChange={e => setL2Escalation(e.target.value)}
                placeholder="e.g. Tier 2 Network / Systems Engineer (On-call phone alert)"
                className="w-full px-2.5 py-1.5 bg-[#0b0c10] border border-[#45a29e] rounded text-white text-xs focus:outline-none focus:border-[#66fcf1]"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] text-[#45a29e] uppercase font-mono mb-1">
              Search Tags (comma separated)
            </label>
            <input
              type="text"
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="e.g. Cisco, VPN, EMGS, Outage, BGP"
              className="w-full px-2.5 py-1.5 bg-[#0b0c10] border border-[#45a29e] rounded text-white text-xs font-mono"
            />
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-[#45a29e]/40 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#141c24] hover:bg-[#0b0c10] text-[#c5c6c7] rounded text-xs border border-[#45a29e]/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs transition-colors shadow-[0_0_15px_rgba(69,162,158,0.3)]"
            >
              Publish SOP Case to Portal
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
