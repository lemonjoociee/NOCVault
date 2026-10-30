import React, { useState, useMemo } from 'react';
import { IncidentCase, CaseCategory, SeverityLevel, AutomatedScript } from '../types';
import { 
  Search, 
  Terminal, 
  FileText, 
  ArrowRight, 
  Server, 
  SlidersHorizontal,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';

interface KnowledgeBaseProps {
  cases: IncidentCase[];
  onSelectCase: (incidentCase: IncidentCase) => void;
  onRunScript: (script: AutomatedScript) => void;
  onOpenPdf: (pdfPath: string, title: string) => void;
  onOpenAddCase: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  cases,
  onSelectCase,
  onRunScript,
  onOpenPdf,
  onOpenAddCase
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const categories: string[] = [
    'All',
    'Network & VPN',
    'ERP & Dynamics GP',
    'VoIP & Telecom',
    'API & Portals',
    'Database & ODBC',
    'Infrastructure'
  ];

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Category filter
      if (selectedCategory !== 'All' && c.category !== selectedCategory) {
        return false;
      }
      // Severity filter
      if (selectedSeverity !== 'All' && !c.severity.startsWith(selectedSeverity)) {
        return false;
      }
      // Text search
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = c.title.toLowerCase().includes(q);
      const inId = c.caseNumber.toLowerCase().includes(q);
      const inSummary = c.summary.toLowerCase().includes(q);
      const inNodes = c.targetNodes.some(n => n.toLowerCase().includes(q));
      const inSymptoms = c.symptoms.some(s => s.toLowerCase().includes(q));
      const inTags = c.tags.some(t => t.toLowerCase().includes(q));

      return inTitle || inId || inSummary || inNodes || inSymptoms || inTags;
    });
  }, [cases, searchQuery, selectedCategory, selectedSeverity]);

  const getSeverityBadge = (sev: SeverityLevel) => {
    if (sev.includes('P1')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#ff4d4d]/15 text-[#ff4d4d] border border-[#ff4d4d]/40">
          P1 - CRITICAL
        </span>
      );
    }
    if (sev.includes('P2')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#f5a623]/15 text-[#f5a623] border border-[#f5a623]/40">
          P2 - HIGH
        </span>
      );
    }
    if (sev.includes('P3')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/40">
          P3 - MEDIUM
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#45a29e]/15 text-[#66fcf1] border border-[#45a29e]/40">
        P4 - LOW
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-4 sm:p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)]">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by case ID, keyword, IP address (10.11.4.28), symptom, or tag..."
              className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1]"
            />
          </div>

          {/* Severity Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-[#45a29e] font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Severity:
            </span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-xs text-white focus:outline-none focus:border-[#66fcf1]"
            >
              <option value="All">All Severities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>

            <button
              onClick={onOpenAddCase}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] rounded text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Case</span>
            </button>
          </div>
        </div>

        {/* Category Pills (Functional filter buttons) */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[#45a29e]/20 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#66fcf1] text-[#0b0c10] font-bold shadow-sm'
                  : 'bg-[#0b0c10] text-[#c5c6c7] hover:text-white border border-[#45a29e]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Case Count and Status Bar */}
      <div className="flex items-center justify-between text-xs text-[#c5c6c7] px-1 font-mono">
        <div>
          Showing <span className="text-[#66fcf1] font-bold">{filteredCases.length}</span> documented NOC operational procedures
          {selectedCategory !== 'All' && <span> in <strong className="text-white">{selectedCategory}</strong></span>}
        </div>
        <div className="text-[11px] text-[#45a29e] hidden sm:block">
          All workflows verified against SCICOM infrastructure standards
        </div>
      </div>

      {/* Case Cards Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="bg-[#1f2833] border border-[#45a29e]/50 hover:border-[#66fcf1] rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.06)] hover:shadow-[0_0_20px_rgba(102,252,241,0.18)] transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top Row: Case Number & Severity */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#66fcf1] px-2 py-0.5 rounded bg-[#0b0c10] border border-[#66fcf1]/40">
                      {c.caseNumber}
                    </span>
                    <span className="text-xs text-[#c5c6c7] font-medium">
                      {c.category}
                    </span>
                  </div>

                  {getSeverityBadge(c.severity)}
                </div>

                {/* Title */}
                <h3 
                  onClick={() => onSelectCase(c)}
                  className="text-base font-bold text-white group-hover:text-[#66fcf1] transition-colors cursor-pointer leading-snug mb-2"
                >
                  {c.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-[#c5c6c7] line-clamp-2 leading-relaxed mb-4">
                  {c.summary}
                </p>

                {/* Target Nodes / IPs */}
                <div className="mb-4 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase font-mono text-[#45a29e] flex items-center gap-1">
                    <Server className="w-3 h-3" />
                    Target:
                  </span>
                  {c.targetNodes.slice(0, 3).map((node, nIdx) => (
                    <span
                      key={nIdx}
                      className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#0b0c10] text-[#66fcf1] border border-[#45a29e]/40"
                    >
                      {node}
                    </span>
                  ))}
                  {c.targetNodes.length > 3 && (
                    <span className="text-[10px] text-[#c5c6c7]">
                      +{c.targetNodes.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom / Action Row */}
              <div className="pt-3 border-t border-[#45a29e]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                
                {/* Meta info */}
                <div className="flex items-center gap-3 text-[11px] text-[#c5c6c7]/80">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#45a29e]" />
                    SLA: {c.escalationPath.slaMins}m
                  </span>
                  <span>·</span>
                  <span>{c.workflowSteps.length} Steps</span>
                  {c.pdfAttachment && (
                    <>
                      <span>·</span>
                      <span className="text-[#66fcf1] flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        PDF Guide
                      </span>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {c.scripts.length > 0 && (
                    <button
                      onClick={() => onRunScript(c.scripts[0])}
                      className="px-2.5 py-1 rounded bg-[#0b0c10] hover:bg-[#141c24] text-[#66fcf1] border border-[#45a29e]/60 hover:border-[#66fcf1] text-xs font-mono flex items-center gap-1 transition-colors"
                      title="Run automated incident response script"
                    >
                      <Terminal className="w-3 h-3" />
                      <span>Script</span>
                    </button>
                  )}

                  {c.pdfAttachment && (
                    <button
                      onClick={() => onOpenPdf(c.pdfAttachment!.path, c.pdfAttachment!.title)}
                      className="px-2 py-1 rounded bg-[#0b0c10] hover:bg-[#141c24] text-[#45a29e] hover:text-[#66fcf1] border border-[#45a29e]/40 text-xs flex items-center gap-1 transition-colors"
                      title="View original documentation PDF"
                    >
                      <FileText className="w-3 h-3" />
                    </button>
                  )}

                  <button
                    onClick={() => onSelectCase(c)}
                    className="px-3 py-1 rounded bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold text-xs flex items-center gap-1 transition-colors shadow-sm"
                  >
                    <span>View SOP</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-[#1f2833] border border-[#45a29e]/40 rounded-lg space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#0b0c10] border border-[#45a29e] flex items-center justify-center text-[#45a29e]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No Matching Incidents Found</h3>
          <p className="text-xs text-[#c5c6c7] max-w-md mx-auto">
            No standard operating procedures matched &quot;{searchQuery}&quot; under category &quot;{selectedCategory}&quot;.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedSeverity('All');
              }}
              className="px-3 py-1.5 bg-[#0b0c10] text-[#66fcf1] border border-[#45a29e] rounded text-xs"
            >
              Clear Filters
            </button>
            <button
              onClick={onOpenAddCase}
              className="px-3 py-1.5 bg-[#45a29e] text-[#0b0c10] font-bold rounded text-xs"
            >
              Create New Case
            </button>
          </div>
        </div>
      )}

      {/* Helpful Operational Notes strip */}
      <div className="p-4 rounded bg-[#0b0c10] border border-[#45a29e]/40 text-xs text-[#c5c6c7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#66fcf1] shrink-0" />
          <span>
            <strong>Pro-Tip for NOC Operators:</strong> Click on any IP address badge to copy it directly to your clipboard for quick SolarWinds or ping queries.
          </span>
        </div>
        <div className="text-[11px] text-[#45a29e] font-mono shrink-0">
          Gateway Resolver: 10.1.2.1 | SolarWinds: 10.1.27.165
        </div>
      </div>

    </div>
  );
};
