import React, { useState } from 'react';
import { IncidentCase } from '../types';
import { ESCALATION_TEAMS } from '../data/initialData';
import { 
  AlertTriangle, 
  Phone, 
  Mail, 
  Clock, 
  Copy, 
  Check, 
  ShieldAlert, 
  FileText,
  UserCheck
} from 'lucide-react';

interface EscalationMatrixProps {
  cases: IncidentCase[];
  initialSelectedCase?: IncidentCase | null;
}

export const EscalationMatrix: React.FC<EscalationMatrixProps> = ({
  cases,
  initialSelectedCase
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    initialSelectedCase ? initialSelectedCase.id : cases[0]?.id || ''
  );
  const [severity, setSeverity] = useState<string>(initialSelectedCase ? initialSelectedCase.severity : 'P1 - Critical');
  const [impactedNode, setImpactedNode] = useState<string>(
    initialSelectedCase ? initialSelectedCase.targetNodes.join(', ') : '10.11.4.28'
  );
  const [operatorName, setOperatorName] = useState<string>('NOC Shift Operator');
  const [actionsTaken, setActionsTaken] = useState<string>(
    '1. Executed ping sweep - node timed out.\n2. Verified SolarWinds alert at http://10.1.27.165.\n3. Attempted DNS resolution test against 10.1.2.1.'
  );
  const [blockerNote, setBlockerNote] = useState<string>(
    'Interface link down on core gateway or IPsec tunnel phase 2 mismatch. Escalating to L2 NetOps on-call.'
  );

  const [generatedTicket, setGeneratedTicket] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerateTicket = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCase = cases.find(c => c.id === selectedCaseId);
    const caseTitle = selectedCase ? selectedCase.title : 'Unscheduled Network Outage';
    const caseNum = selectedCase ? selectedCase.caseNumber : 'INC-CUSTOM';
    const timestamp = new Date().toLocaleString();

    const ticketBody = `==================================================================
NOC INCIDENT ESCALATION & SHIFT HANDOVER TICKET
Ticket Reference: [${caseNum}] ${caseTitle}
==================================================================
Timestamp: ${timestamp}
Severity Level: ${severity}
Originating Duty Operator: ${operatorName}
Impacted Infrastructure: ${impactedNode}

1. EXECUTIVE SYNOPSIS:
${selectedCase?.summary || 'Degradation or total outage observed on target nodes.'}

2. TRIAGE ACTIONS & TESTS COMPLETED:
${actionsTaken}

3. CURRENT SYSTEM STATE & BLOCKER:
${blockerNote}

4. ESCALATION TARGET:
- Escalated To: Tier 2 Network Operations / ICTA On-Call Lead
- Target SLA Response Window: 15 - 30 Minutes
- Handover Bridge: Teams NOC Incident Channel / Ext 4401

5. RECOMMENDED NEXT PROCEDURES:
- Review SolarWinds gateway status: http://10.1.27.165
- Verify upstream transit BGP sessions
- Await confirmation before closing ticket

Generated via SCICOM NOC Operations Portal.
==================================================================`;

    setGeneratedTicket(ticketBody);
  };

  const copyTicket = () => {
    if (!generatedTicket) return;
    navigator.clipboard.writeText(generatedTicket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* SLA Tiers Overview */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)]">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="w-5 h-5 text-[#ff4d4d]" />
          <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
            Incident Severity Matrix &amp; SLA Commitment
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded bg-[#0b0c10] border border-[#ff4d4d]/40 space-y-1">
            <div className="font-bold text-[#ff4d4d] font-mono flex items-center justify-between">
              <span>P1 - CRITICAL</span>
              <span>15 MIN SLA</span>
            </div>
            <p className="text-[#c5c6c7] text-[11px] leading-relaxed">
              Complete business disruption, core VPN gateway down, or primary ERP database unreachable.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0b0c10] border border-[#f5a623]/40 space-y-1">
            <div className="font-bold text-[#f5a623] font-mono flex items-center justify-between">
              <span>P2 - HIGH</span>
              <span>30 MIN SLA</span>
            </div>
            <p className="text-[#c5c6c7] text-[11px] leading-relaxed">
              Significant impairment with workaround available, softphone PBX trunk degradation, or batch deadlock.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0b0c10] border border-[#38bdf8]/40 space-y-1">
            <div className="font-bold text-[#38bdf8] font-mono flex items-center justify-between">
              <span>P3 - MEDIUM</span>
              <span>2 HR SLA</span>
            </div>
            <p className="text-[#c5c6c7] text-[11px] leading-relaxed">
              Non-critical service impairment, single client ODBC setup issues, or reporting delays.
            </p>
          </div>

          <div className="p-3 rounded bg-[#0b0c10] border border-[#45a29e]/40 space-y-1">
            <div className="font-bold text-[#66fcf1] font-mono flex items-center justify-between">
              <span>P4 - LOW</span>
              <span>8 HR SLA</span>
            </div>
            <p className="text-[#c5c6c7] text-[11px] leading-relaxed">
              General inquiries, procedural reference questions, or routine configuration backups.
            </p>
          </div>
        </div>
      </div>

      {/* On-Call Directory */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#66fcf1]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              On-Call Escalation Directory &amp; Contacts
            </h3>
          </div>
          <span className="text-xs text-[#45a29e] font-mono">SCICOM 24/7 ESCALATION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ESCALATION_TEAMS.map((team, idx) => (
            <div key={idx} className="p-3.5 bg-[#0b0c10] border border-[#45a29e]/40 rounded space-y-2 text-xs">
              <div className="font-bold text-white flex items-center justify-between">
                <span>{team.tier}</span>
              </div>
              <div className="text-[#45a29e] font-medium">{team.role}</div>

              <div className="space-y-1 text-[#c5c6c7] pt-1 border-t border-[#45a29e]/20 text-[11px]">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#66fcf1] shrink-0" />
                  <a href={`mailto:${team.contact}`} className="text-white hover:text-[#66fcf1] truncate">
                    {team.contact}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#66fcf1] shrink-0" />
                  <span>{team.phone} ({team.ext})</span>
                </div>
                <div className="flex items-center gap-2 text-[#f5a623]">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>{team.coverage} · {team.slaTarget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Handover Ticket Generator */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-[#66fcf1]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Incident Handover &amp; Escalation Ticket Generator
            </h3>
          </div>
          <p className="text-xs text-[#c5c6c7]">
            Format a structured handover document with completed diagnostic telemetry to send to Tier 2/3 engineering via Email, Slack, or Jira.
          </p>
        </div>

        <form onSubmit={handleGenerateTicket} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="space-y-3">
            <div>
              <label className="block text-[#66fcf1] font-semibold mb-1 uppercase">Related Incident Case</label>
              <select
                value={selectedCaseId}
                onChange={e => {
                  setSelectedCaseId(e.target.value);
                  const found = cases.find(c => c.id === e.target.value);
                  if (found) {
                    setSeverity(found.severity);
                    setImpactedNode(found.targetNodes.join(', '));
                  }
                }}
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
              >
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    [{c.caseNumber}] {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase">Severity</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                >
                  <option value="P1 - Critical">P1 - Critical</option>
                  <option value="P2 - High">P2 - High</option>
                  <option value="P3 - Medium">P3 - Medium</option>
                  <option value="P4 - Low">P4 - Low</option>
                </select>
              </div>

              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase">Duty Operator</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#66fcf1] font-semibold mb-1 uppercase">Impacted Nodes / Hosts</label>
              <input
                type="text"
                value={impactedNode}
                onChange={e => setImpactedNode(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white font-mono focus:outline-none focus:border-[#66fcf1]"
              />
            </div>

            <div>
              <label className="block text-[#66fcf1] font-semibold mb-1 uppercase">Diagnostics Completed</label>
              <textarea
                rows={3}
                value={actionsTaken}
                onChange={e => setActionsTaken(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
              />
            </div>

            <div>
              <label className="block text-[#66fcf1] font-semibold mb-1 uppercase">Reason for Escalation / Blocker</label>
              <textarea
                rows={2}
                value={blockerNote}
                onChange={e => setBlockerNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(69,162,158,0.3)]"
            >
              Format &amp; Generate Escalation Ticket
            </button>
          </div>

          {/* Right Column: Generated Output */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-[#45a29e] uppercase">
                Generated Ticket Output
              </span>
              {generatedTicket && (
                <button
                  type="button"
                  onClick={copyTicket}
                  className="flex items-center gap-1 text-xs text-[#66fcf1] hover:underline"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Handover Text</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <textarea
              readOnly
              value={generatedTicket || 'Click "Format & Generate Escalation Ticket" on the left to populate the standardized NOC handover message...'}
              rows={16}
              className="w-full flex-1 p-3 bg-[#0b0c10] border border-[#45a29e] rounded font-mono text-xs text-[#66fcf1] focus:outline-none resize-none leading-relaxed"
            />
          </div>

        </form>
      </div>

    </div>
  );
};
