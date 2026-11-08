import React, { useState, useMemo } from 'react';
import { IncidentCase, SeverityLevel } from '../types';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  ArrowRight, 
  Server, 
  SlidersHorizontal,
  PlusCircle,
  Clock
} from 'lucide-react';

interface KnowledgeBaseProps {
  cases: IncidentCase[];
  onSelectCase: (incidentCase: IncidentCase) => void;
  onOpenPdf?: (pdfPath: string, title: string) => void;
  onOpenAddCase: () => void;
}

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  cases,
  onSelectCase,
  onOpenAddCase
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      // Severity filter
      if (selectedSeverity !== 'All' && !c.severity.startsWith(selectedSeverity)) {
        return false;
      }
      // Text search
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = c.title.toLowerCase().includes(q);
      const inId = c.caseNumber.toLowerCase().includes(q);
      const inCategory = (c.category || '').toLowerCase().includes(q);
      const inSummary = c.summary.toLowerCase().includes(q);
      const inNodes = (c.targetNodes || []).some(n => n.toLowerCase().includes(q));
      const inSymptoms = c.symptoms.some(s => s.toLowerCase().includes(q));
      const inTags = c.tags.some(t => t.toLowerCase().includes(q));

      return inTitle || inId || inCategory || inSummary || inNodes || inSymptoms || inTags;
    });
  }, [cases, searchQuery, selectedSeverity]);

  const getSeverityBadge = (sev: SeverityLevel) => {
    if (sev.includes('P1')) {
      return (
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
          isDark ? 'bg-red-950/40 text-red-400 border-red-500/40' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          P1 - CRITICAL
        </span>
      );
    }
    if (sev.includes('P2')) {
      return (
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
          isDark ? 'bg-amber-950/40 text-amber-400 border-amber-500/40' : 'bg-amber-50 text-amber-800 border-amber-300'
        }`}>
          P2 - HIGH
        </span>
      );
    }
    if (sev.includes('P3')) {
      return (
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
          isDark ? 'bg-sky-950/40 text-sky-400 border-sky-500/40' : 'bg-sky-50 text-sky-800 border-sky-300'
        }`}>
          P3 - MEDIUM
        </span>
      );
    }
    return (
      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
        isDark ? 'bg-teal-950/40 text-[#66fcf1] border-teal-500/40' : 'bg-teal-50 text-teal-800 border-teal-300'
      }`}>
        P4 - LOW
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Severity Filter Bar */}
      <div className={`border rounded-xl p-4 sm:p-5 transition-colors ${
        isDark 
          ? 'bg-[#1f2833] border-[#45a29e]/50 shadow-[0_0_15px_rgba(102,252,241,0.08)]' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              isDark ? 'text-[#45a29e]' : 'text-slate-400'
            }`}>
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by case ID, project, keyword, IP address (10.11.4.28), symptom, or tag..."
              className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm transition-colors focus:outline-none ${
                isDark 
                  ? 'bg-[#0b0c10] border border-[#45a29e] text-white placeholder-[#c5c6c7]/50 focus:border-[#66fcf1]' 
                  : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs p-1 ${
                  isDark ? 'text-[#c5c6c7] hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity Dropdown & Add Case CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-semibold flex items-center gap-1 ${
              isDark ? 'text-[#45a29e]' : 'text-slate-600'
            }`}>
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Severity:
            </span>
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className={`px-3 py-2 rounded-lg text-xs focus:outline-none font-mono ${
                isDark 
                  ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' 
                  : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            >
              <option value="All">All Severities</option>
              <option value="P1">P1 - Critical</option>
              <option value="P2">P2 - High</option>
              <option value="P3">P3 - Medium</option>
              <option value="P4">P4 - Low</option>
            </select>

            <button
              onClick={onOpenAddCase}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0 ${
                isDark 
                  ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Case</span>
            </button>
          </div>
        </div>
      </div>

      {/* Case Count and Status Bar */}
      <div className={`flex items-center justify-between text-xs px-1 font-mono ${
        isDark ? 'text-[#c5c6c7]' : 'text-slate-600'
      }`}>
        <div>
          Showing <span className={`font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>{filteredCases.length}</span> documented NOC operational procedures
          {selectedSeverity !== 'All' && <span> (Severity: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{selectedSeverity}</strong>)</span>}
        </div>
        <div className={`text-[11px] hidden sm:block ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>
          All workflows verified against SCICOM operational standards
        </div>
      </div>

      {/* Case Cards Grid */}
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className={`border rounded-xl p-5 transition-all flex flex-col justify-between group shadow-sm ${
                isDark 
                  ? 'bg-[#1f2833] border-[#45a29e]/50 hover:border-[#66fcf1] shadow-[0_0_15px_rgba(102,252,241,0.06)] hover:shadow-[0_0_20px_rgba(102,252,241,0.18)]' 
                  : 'bg-white border-slate-200 hover:border-sky-400 hover:shadow-md'
              }`}
            >
              <div>
                {/* Card Top Row: Case Number & Project Name */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md border ${
                      isDark 
                        ? 'text-[#66fcf1] bg-[#0b0c10] border-[#66fcf1]/40' 
                        : 'text-sky-800 bg-sky-50 border-sky-300'
                    }`}>
                      {c.caseNumber}
                    </span>
                    <span className={`text-xs font-medium ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                      Project: <strong className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{c.category}</strong>
                    </span>
                  </div>

                  {getSeverityBadge(c.severity)}
                </div>

                {/* Title */}
                <h3 
                  onClick={() => onSelectCase(c)}
                  className={`text-base font-bold transition-colors cursor-pointer leading-snug mb-2 ${
                    isDark ? 'text-white group-hover:text-[#66fcf1]' : 'text-slate-900 group-hover:text-sky-700'
                  }`}
                >
                  {c.title}
                </h3>

                {/* Summary */}
                <p className={`text-xs line-clamp-2 leading-relaxed mb-4 ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-600'
                }`}>
                  {c.summary}
                </p>

                {/* Target Nodes / IPs (rendered if present) */}
                {c.targetNodes && c.targetNodes.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center gap-1.5">
                    <span className={`text-[10px] uppercase font-mono flex items-center gap-1 ${
                      isDark ? 'text-[#45a29e]' : 'text-slate-500'
                    }`}>
                      <Server className="w-3 h-3" />
                      Target:
                    </span>
                    {c.targetNodes.slice(0, 3).map((node, nIdx) => (
                      <span
                        key={nIdx}
                        className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md border ${
                          isDark 
                            ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]/40' 
                            : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}
                      >
                        {node}
                      </span>
                    ))}
                    {c.targetNodes.length > 3 && (
                      <span className={`text-[10px] ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                        +{c.targetNodes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom / Action Row */}
              <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-xs ${
                isDark ? 'border-[#45a29e]/20' : 'border-slate-100'
              }`}>
                
                {/* Meta info */}
                <div className={`flex items-center gap-3 text-[11px] ${
                  isDark ? 'text-[#c5c6c7]/80' : 'text-slate-500'
                }`}>
                  <span className="flex items-center gap-1">
                    <Clock className={`w-3 h-3 ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`} />
                    {c.escalationPath.slaMins ? `SLA: ${c.escalationPath.slaMins}m` : 'Standard SLA'}
                  </span>
                  <span>·</span>
                  <span>{c.workflowSteps.length} Steps</span>
                </div>

                {/* Action Button: View SOP */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectCase(c)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors shadow-sm ${
                      isDark 
                        ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' 
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
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
        <div className={`p-12 text-center rounded-xl border space-y-3 ${
          isDark ? 'bg-[#1f2833] border-[#45a29e]/40' : 'bg-white border-slate-200'
        }`}>
          <div className={`w-12 h-12 mx-auto rounded-full border flex items-center justify-center ${
            isDark ? 'bg-[#0b0c10] border-[#45a29e] text-[#45a29e]' : 'bg-slate-100 border-slate-300 text-slate-500'
          }`}>
            <Search className="w-6 h-6" />
          </div>
          <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No Matching Incidents Found</h3>
          <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
            No standard operating procedures matched &quot;{searchQuery}&quot;.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSeverity('All');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border ${
                isDark ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]' : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              Clear Search
            </button>
            <button
              onClick={onOpenAddCase}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                isDark ? 'bg-[#45a29e] text-[#0b0c10]' : 'bg-teal-600 text-white'
              }`}
            >
              Create New Case
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
