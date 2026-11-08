import React, { useState, useMemo } from 'react';
import { User, EscalationContact, EscalationGuideRow } from '../types';
import { 
  getStoredContacts, 
  addEscalationContact, 
  updateEscalationContact, 
  deleteEscalationContact,
  getStoredEscalationGuide,
  addEscalationGuideRow,
  updateEscalationGuideRow,
  deleteEscalationGuideRow
} from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { 
  Phone, 
  Mail, 
  Clock, 
  Network,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Check,
  Shield,
  ShieldCheck,
  Search,
  FileText,
  ExternalLink,
  Info,
  Layers,
  ArrowRight,
  Download,
  AlertCircle
} from 'lucide-react';

interface EscalationMatrixProps {
  currentUser: User;
}

export const EscalationMatrix: React.FC<EscalationMatrixProps> = ({ currentUser }) => {
  const { isDark } = useTheme();

  // Tier Contacts State
  const [contacts, setContacts] = useState<EscalationContact[]>(() => getStoredContacts());

  // Application Escalation Guide State (from official PDF)
  const [guideRows, setGuideRows] = useState<EscalationGuideRow[]>(() => getStoredEscalationGuide());
  
  // Filter & Search states for the Escalation Guide
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAppFilter, setSelectedAppFilter] = useState('All');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Contact Modal / Form state (Add or Edit)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EscalationContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<EscalationContact | null>(null);

  // Guide Row Modal / Form state (Add or Edit for Admin)
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [editingGuideRow, setEditingGuideRow] = useState<EscalationGuideRow | null>(null);
  const [guideRowToDelete, setGuideRowToDelete] = useState<EscalationGuideRow | null>(null);

  // Contact form fields
  const [tier, setTier] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ext, setExt] = useState('');
  const [coverage, setCoverage] = useState('');
  const [slaTarget, setSlaTarget] = useState('');
  const [duties, setDuties] = useState('');

  // Guide row form fields
  const [guideNo, setGuideNo] = useState(1);
  const [guideApp, setGuideApp] = useState('');
  const [guideIssues, setGuideIssues] = useState('');
  const [guideMayEscalateTo, setGuideMayEscalateTo] = useState('');
  const [guideSecondEscalation, setGuideSecondEscalation] = useState('');
  const [guideRemarks, setGuideRemarks] = useState('');

  const isAdmin = currentUser.role === 'Admin';

  // Applications list for filter tabs
  const applications = useMemo(() => {
    const list = Array.from(new Set(guideRows.map(r => r.application)));
    return ['All', ...list];
  }, [guideRows]);

  // Filtered rows
  const filteredGuideRows = useMemo(() => {
    return guideRows.filter(row => {
      if (selectedAppFilter !== 'All' && row.application !== selectedAppFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchApp = row.application.toLowerCase().includes(q);
      const matchIssues = row.issues.some(i => i.toLowerCase().includes(q));
      const matchEscalate = row.mayEscalateTo.toLowerCase().includes(q);
      const matchSecond = (row.secondEscalation || '').toLowerCase().includes(q);
      const matchRemarks = (row.remarks || '').toLowerCase().includes(q);
      return matchApp || matchIssues || matchEscalate || matchSecond || matchRemarks;
    });
  }, [guideRows, selectedAppFilter, searchQuery]);

  // Handlers for Contacts
  const handleOpenAddContactModal = () => {
    setEditingContact(null);
    setTier('');
    setRole('');
    setEmail('');
    setPhone('');
    setExt('');
    setCoverage('24/7 On-Call Escalation');
    setSlaTarget('Response within 30 minutes');
    setDuties('');
    setIsContactModalOpen(true);
  };

  const handleOpenEditContactModal = (contact: EscalationContact) => {
    setEditingContact(contact);
    setTier(contact.tier);
    setRole(contact.role);
    setEmail(contact.contact);
    setPhone(contact.phone);
    setExt(contact.ext || '');
    setCoverage(contact.coverage);
    setSlaTarget(contact.slaTarget);
    setDuties(contact.duties.join(', '));
    setIsContactModalOpen(true);
  };

  const handleCloseContactModal = () => {
    setIsContactModalOpen(false);
    setEditingContact(null);
  };

  const handleSubmitContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!tier.trim() || !role.trim() || !email.trim() || !phone.trim()) return;

    const parsedDuties = duties
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);

    const dutiesToSave = parsedDuties.length > 0 ? parsedDuties : ['Incident triage', 'Operational escalation'];

    if (editingContact) {
      const updated: EscalationContact = {
        ...editingContact,
        tier: tier.trim(),
        role: role.trim(),
        contact: email.trim(),
        phone: phone.trim(),
        ext: ext.trim() || undefined,
        coverage: coverage.trim() || '24/7 On-Call',
        slaTarget: slaTarget.trim() || 'Response within 30 mins',
        duties: dutiesToSave
      };
      const result = updateEscalationContact(updated);
      setContacts(result);
    } else {
      addEscalationContact({
        tier: tier.trim(),
        role: role.trim(),
        contact: email.trim(),
        phone: phone.trim(),
        ext: ext.trim() || undefined,
        coverage: coverage.trim() || '24/7 On-Call',
        slaTarget: slaTarget.trim() || 'Response within 30 mins',
        duties: dutiesToSave
      });
      setContacts(getStoredContacts());
    }

    handleCloseContactModal();
  };

  const handleConfirmDeleteContact = () => {
    if (!isAdmin || !contactToDelete) return;
    const updated = deleteEscalationContact(contactToDelete.id);
    setContacts(updated);
    setContactToDelete(null);
  };

  // Handlers for Guide Rows
  const handleOpenAddGuideModal = () => {
    setEditingGuideRow(null);
    setGuideNo(guideRows.length + 1);
    setGuideApp('');
    setGuideIssues('');
    setGuideMayEscalateTo('');
    setGuideSecondEscalation('');
    setGuideRemarks('');
    setIsGuideModalOpen(true);
  };

  const handleOpenEditGuideModal = (row: EscalationGuideRow) => {
    setEditingGuideRow(row);
    setGuideNo(row.no);
    setGuideApp(row.application);
    setGuideIssues(row.issues.join('\n'));
    setGuideMayEscalateTo(row.mayEscalateTo);
    setGuideSecondEscalation(row.secondEscalation || '');
    setGuideRemarks(row.remarks || '');
    setIsGuideModalOpen(true);
  };

  const handleCloseGuideModal = () => {
    setIsGuideModalOpen(false);
    setEditingGuideRow(null);
  };

  const handleSubmitGuideRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!guideApp.trim() || !guideIssues.trim() || !guideMayEscalateTo.trim()) return;

    const parsedIssues = guideIssues
      .split('\n')
      .map(i => i.trim())
      .filter(Boolean);

    if (editingGuideRow) {
      const updated: EscalationGuideRow = {
        ...editingGuideRow,
        no: Number(guideNo) || editingGuideRow.no,
        application: guideApp.trim(),
        issues: parsedIssues,
        mayEscalateTo: guideMayEscalateTo.trim(),
        secondEscalation: guideSecondEscalation.trim() || undefined,
        remarks: guideRemarks.trim() || undefined
      };
      const result = updateEscalationGuideRow(updated);
      setGuideRows(result);
    } else {
      addEscalationGuideRow({
        no: Number(guideNo) || (guideRows.length + 1),
        application: guideApp.trim(),
        issues: parsedIssues,
        mayEscalateTo: guideMayEscalateTo.trim(),
        secondEscalation: guideSecondEscalation.trim() || undefined,
        remarks: guideRemarks.trim() || undefined
      });
      setGuideRows(getStoredEscalationGuide());
    }

    handleCloseGuideModal();
  };

  const handleConfirmDeleteGuideRow = () => {
    if (!isAdmin || !guideRowToDelete) return;
    const updated = deleteEscalationGuideRow(guideRowToDelete.id);
    setGuideRows(updated);
    setGuideRowToDelete(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Header Bar */}
      <div className={`border rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
        isDark 
          ? 'bg-[#1f2833] border-[#45a29e]/50 shadow-[0_0_15px_rgba(102,252,241,0.08)]' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Network className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
            <h2 className={`text-base font-bold tracking-wide uppercase font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              SCICOM Escalation Matrix &amp; Directory
            </h2>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
            Operational escalation paths directly mapped from the official <strong className={isDark ? 'text-white' : 'text-slate-800'}>SCICOM Escalation Guide</strong>, covering SES, SLC, VPN, Zimbra Email, Entra, and 24/7 on-call tier rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* View Official PDF Guide Button */}
          <button
            onClick={() => setIsPdfModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors ${
              isDark 
                ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]/60 hover:bg-[#141c24] hover:border-[#66fcf1]' 
                : 'bg-slate-50 text-sky-700 border-slate-300 hover:bg-slate-100 hover:border-sky-400'
            }`}
            title="Inspect original Escalation Guide PDF document"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Escalation Guide PDF</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>

          {isAdmin ? (
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              isDark 
                ? 'bg-[#0b0c10] text-[#66fcf1] border-[#66fcf1]/40' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-300'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ADMIN: EDITING ENABLED</span>
            </span>
          ) : (
            <span className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
              isDark 
                ? 'bg-[#0b0c10] text-[#45a29e] border-[#45a29e]/40' 
                : 'bg-slate-100 text-slate-600 border-slate-300'
            }`}>
              <Shield className="w-3.5 h-3.5" />
              <span>NOC: READ-ONLY</span>
            </span>
          )}
        </div>
      </div>

      {/* SECTION 1: APPLICATION ESCALATION GUIDE MATRIX (From Official PDF) */}
      <div className={`border rounded-xl p-5 sm:p-6 space-y-5 transition-colors ${
        isDark 
          ? 'bg-[#1f2833] border-[#45a29e]/50' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Layers className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Application Escalation Guide Matrix
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                SOP routing table derived from official SCICOM engineering runbooks (SES, SLC Course, VPN, Zimbra Email, Entra/Calabrio)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={handleOpenAddGuideModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Escalation Rule</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by application, issue (e.g. password, aircond), team..."
              className={`w-full pl-9 pr-8 py-2 rounded-lg text-xs font-mono transition-colors focus:outline-none ${
                isDark 
                  ? 'bg-[#0b0c10] border border-[#45a29e]/50 text-white placeholder-[#8892b0] focus:border-[#66fcf1]' 
                  : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-xs ${
                  isDark ? 'text-[#c5c6c7] hover:text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
            {applications.map(app => (
              <button
                key={app}
                onClick={() => setSelectedAppFilter(app)}
                className={`px-3 py-1.5 rounded-lg font-mono whitespace-nowrap transition-all ${
                  selectedAppFilter === app
                    ? isDark 
                      ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/60 shadow-sm'
                      : 'bg-sky-600 text-white font-medium shadow-sm'
                    : isDark
                      ? 'bg-[#0b0c10]/40 text-[#c5c6c7] hover:text-white border border-transparent'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {app === 'All' ? 'All Applications' : app}
              </button>
            ))}
          </div>
        </div>

        {/* Escalation Table */}
        <div className={`overflow-x-auto rounded-lg border ${
          isDark ? 'border-[#45a29e]/30 bg-[#0b0c10]/50' : 'border-slate-200 bg-white'
        }`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b font-mono font-bold uppercase text-[11px] ${
                isDark 
                  ? 'border-[#45a29e]/40 bg-[#0b0c10] text-[#66fcf1]' 
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <th className="py-3 px-3 w-12 text-center">No</th>
                <th className="py-3 px-4 w-44">Application</th>
                <th className="py-3 px-4">Specific Issue / Request Items</th>
                <th className="py-3 px-4 w-52">May Escalate To</th>
                <th className="py-3 px-4 w-44">Second Escalation</th>
                <th className="py-3 px-4 w-60">Remarks / Operational Directives</th>
                {isAdmin && <th className="py-3 px-3 w-16 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {filteredGuideRows.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="py-8 text-center text-xs opacity-70">
                    No escalation rules match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredGuideRows.map((row) => (
                  <tr 
                    key={row.id}
                    className={`transition-colors ${
                      isDark 
                        ? 'hover:bg-[#141c24] divide-[#45a29e]/20' 
                        : 'hover:bg-slate-50 divide-slate-100'
                    }`}
                  >
                    {/* No */}
                    <td className={`py-3.5 px-3 text-center font-mono font-bold ${
                      isDark ? 'text-[#45a29e]' : 'text-slate-400'
                    }`}>
                      {row.no}
                    </td>

                    {/* Application */}
                    <td className="py-3.5 px-4 align-top">
                      <span className={`inline-block font-bold px-2 py-1 rounded text-xs font-mono border ${
                        row.application === 'SES'
                          ? isDark 
                            ? 'bg-blue-950/40 text-blue-300 border-blue-500/40' 
                            : 'bg-blue-50 text-blue-800 border-blue-200'
                          : row.application === 'SLC Course'
                          ? isDark
                            ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                          : row.application === 'VPN'
                          ? isDark
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : row.application.includes('Zimbra')
                          ? isDark
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                          : isDark
                            ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40'
                            : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      }`}>
                        {row.application}
                      </span>
                    </td>

                    {/* Issues List */}
                    <td className="py-3.5 px-4 align-top">
                      <ul className="space-y-1">
                        {row.issues.map((issue, idx) => (
                          <li key={idx} className={`flex items-start gap-1.5 leading-snug ${
                            isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                          }`}>
                            <span className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                              isDark ? 'bg-[#66fcf1]' : 'bg-sky-500'
                            }`} />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </td>

                    {/* May Escalate To */}
                    <td className="py-3.5 px-4 align-top font-mono">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                        isDark 
                          ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]/50' 
                          : 'bg-sky-50 text-sky-800 border-sky-300'
                      }`}>
                        <ArrowRight className="w-3 h-3 shrink-0" />
                        <span>{row.mayEscalateTo}</span>
                      </div>
                    </td>

                    {/* Second Escalation */}
                    <td className="py-3.5 px-4 align-top font-mono">
                      {row.secondEscalation ? (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                          isDark 
                            ? 'bg-amber-950/30 text-amber-300 border-amber-500/40' 
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}>
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{row.secondEscalation}</span>
                        </div>
                      ) : (
                        <span className={`text-[11px] italic ${isDark ? 'text-[#8892b0]' : 'text-slate-400'}`}>
                          — None specified
                        </span>
                      )}
                    </td>

                    {/* Remarks / Directive Notes */}
                    <td className="py-3.5 px-4 align-top text-xs">
                      {row.remarks ? (
                        <div className={`flex items-start gap-1.5 p-2 rounded-lg border ${
                          row.remarks.toLowerCase().includes('internet')
                            ? isDark
                              ? 'bg-blue-950/30 text-blue-200 border-blue-500/30'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                            : row.remarks.toLowerCase().includes('archive') || row.remarks.toLowerCase().includes('storage')
                            ? isDark
                              ? 'bg-orange-950/30 text-orange-200 border-orange-500/30'
                              : 'bg-orange-50 text-orange-900 border-orange-200'
                            : isDark
                              ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]/40'
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                        }`}>
                          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span className="leading-snug">{row.remarks}</span>
                        </div>
                      ) : (
                        <span className={`text-[11px] italic ${isDark ? 'text-[#8892b0]' : 'text-slate-400'}`}>
                          Standard SOP procedure
                        </span>
                      )}
                    </td>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <td className="py-3.5 px-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditGuideModal(row)}
                            className={`p-1 rounded transition-colors ${
                              isDark ? 'text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#0b0c10]' : 'text-slate-500 hover:text-sky-700 hover:bg-slate-200'
                            }`}
                            title="Edit escalation rule"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setGuideRowToDelete(row)}
                            className="p-1 text-[#ff4d4d] hover:bg-[#ff4d4d]/20 rounded transition-colors"
                            title="Delete escalation rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: 24/7 ON-CALL ESCALATION DIRECTORY & TIER CONTACTS */}
      <div className={`border rounded-xl p-5 sm:p-6 space-y-4 transition-colors ${
        isDark 
          ? 'bg-[#1f2833] border-[#45a29e]/50' 
          : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                On-Call Escalation Directory &amp; Tier Contacts
              </h3>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                Direct phone lines, extensions, and round-the-clock emergency escalation points of contact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono hidden sm:inline ${isDark ? 'text-[#45a29e]' : 'text-teal-700'}`}>
              24/7 DUTY ROSTER
            </span>
            
            {/* Add Contact Button - Admin Only */}
            {isAdmin && (
              <button
                onClick={handleOpenAddContactModal}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add On-Call Contact</span>
              </button>
            )}
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((team) => (
            <div 
              key={team.id} 
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all relative group text-xs ${
                isDark 
                  ? 'bg-[#0b0c10] border-[#45a29e]/40 hover:border-[#66fcf1]/60 shadow-[0_4px_15px_rgba(0,0,0,0.3)]' 
                  : 'bg-slate-50 border-slate-200 hover:border-sky-400 shadow-sm'
              }`}
            >
              <div>
                {/* Card Header with Tier and Admin Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {team.tier}
                    </div>
                    <div className={`font-medium text-xs mt-0.5 ${isDark ? 'text-[#45a29e]' : 'text-sky-700'}`}>
                      {team.role}
                    </div>
                  </div>

                  {/* Admin Edit/Delete Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditContactModal(team)}
                        className={`p-1 rounded transition-colors ${
                          isDark ? 'text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#1f2833]' : 'text-slate-500 hover:text-sky-700 hover:bg-slate-200'
                        }`}
                        title="Edit Contact"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactToDelete(team)}
                        className="p-1 text-[#ff4d4d] hover:bg-[#ff4d4d]/20 rounded transition-colors cursor-pointer"
                        title={`Delete ${team.tier}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className={`mt-3 space-y-1.5 text-[11px] ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                  <div className="flex items-center gap-2">
                    <Mail className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                    <a href={`mailto:${team.contact}`} className={`hover:underline truncate ${isDark ? 'text-white hover:text-[#66fcf1]' : 'text-slate-900 hover:text-sky-600'}`}>
                      {team.contact}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                    <span>{team.phone} {team.ext ? `(${team.ext})` : ''}</span>
                  </div>
                  <div className={`flex items-center gap-2 font-mono ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{team.coverage} · {team.slaTarget}</span>
                  </div>
                </div>
              </div>

              {/* Responsibilities */}
              <div className={`pt-2.5 mt-3 border-t text-[11px] ${
                isDark ? 'border-[#45a29e]/20 text-[#c5c6c7]/80' : 'border-slate-200 text-slate-500'
              }`}>
                <span className={`font-semibold block mb-0.5 uppercase font-mono text-[10px] ${
                  isDark ? 'text-[#45a29e]' : 'text-teal-700'
                }`}>
                  Primary Scope:
                </span>
                <div>{team.duties.join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Reference Viewer Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${
            isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
          }`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <FileText className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                <div>
                  <h3 className={`text-base font-bold font-mono uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Official SCICOM Escalation Guide PDF
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                    Source technical runbook reference
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/assets/aistudio/Escalation_Guide_e86b74cd.pdf"
                  download="Escalation_Guide.pdf"
                  className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
                    isDark 
                      ? 'bg-[#1f2833] border-[#45a29e]/50 text-[#66fcf1] hover:bg-[#0b0c10]' 
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Download copy"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className={`p-1.5 rounded-lg border ${
                    isDark ? 'bg-[#1f2833] border-[#45a29e]/50 text-[#c5c6c7] hover:text-white' : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 bg-black/40 overflow-hidden flex items-center justify-center min-h-[500px]">
              <iframe
                src="/assets/aistudio/Escalation_Guide_e86b74cd.pdf"
                title="Escalation Guide PDF"
                className="w-full h-full min-h-[550px] rounded-lg border border-slate-700 bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Guide Rule Modal */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden my-auto ${
            isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
          }`}>
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Layers className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                <h3 className={`text-base font-bold uppercase font-mono tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editingGuideRow ? 'Edit Escalation Rule' : 'Add New Escalation Rule'}
                </h3>
              </div>
              <button
                onClick={handleCloseGuideModal}
                className={`p-1.5 rounded-lg border ${
                  isDark ? 'bg-[#1f2833] border-[#45a29e]/50 text-[#c5c6c7] hover:text-white' : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitGuideRow} className={`p-5 sm:p-6 space-y-4 text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    Row No # *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={guideNo}
                    onChange={e => setGuideNo(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    Application *
                  </label>
                  <input
                    type="text"
                    required
                    value={guideApp}
                    onChange={e => setGuideApp(e.target.value)}
                    placeholder="e.g. SES, VPN, Zimbra/ Email"
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                  Specific Issues / Requests (One per line) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={guideIssues}
                  onChange={e => setGuideIssues(e.target.value)}
                  placeholder="Reset password&#10;Unlocked ID&#10;Update email user"
                  className={`w-full px-3 py-2 rounded-lg font-mono text-xs focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    May Escalate To (Primary) *
                  </label>
                  <input
                    type="text"
                    required
                    value={guideMayEscalateTo}
                    onChange={e => setGuideMayEscalateTo(e.target.value)}
                    placeholder="e.g. Helpdesk, Facilities (Don), CRM"
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                    Second Escalation (Optional)
                  </label>
                  <input
                    type="text"
                    value={guideSecondEscalation}
                    onChange={e => setGuideSecondEscalation(e.target.value)}
                    placeholder="e.g. ICTS (Khalid), ICTA, NOC TM"
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                  Remarks / Special Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={guideRemarks}
                  onChange={e => setGuideRemarks(e.target.value)}
                  placeholder="e.g. Need to check internet connection issue first"
                  className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-700/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseGuideModal}
                  className={`px-4 py-2 rounded-lg border text-xs ${
                    isDark ? 'bg-[#141c24] border-[#45a29e]/50 text-[#c5c6c7]' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingGuideRow ? 'Save Rule Changes' : 'Add Rule to Matrix'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Guide Rule Confirmation Modal */}
      {guideRowToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#1f2833] border-[#ff4d4d]/60 text-white' : 'bg-white border-red-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono uppercase tracking-wide">
                  Delete Escalation Rule
                </h3>
                <p className="text-xs text-slate-400">Application: {guideRowToDelete.application}</p>
              </div>
            </div>

            <p className="text-xs">
              Are you sure you want to remove this escalation rule for <strong>{guideRowToDelete.application}</strong> ({guideRowToDelete.mayEscalateTo})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setGuideRowToDelete(null)}
                className={`px-4 py-2 rounded-lg border text-xs font-mono ${
                  isDark ? 'bg-[#0b0c10] border-[#45a29e]/50 text-[#c5c6c7]' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteGuideRow}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Rule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className={`relative w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col overflow-hidden my-auto ${
            isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
          }`}>
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
              isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Phone className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                <h3 className={`text-base font-bold uppercase font-mono tracking-wide ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {editingContact ? 'Edit On-Call Contact' : 'Add New On-Call Contact'}
                </h3>
              </div>
              <button
                onClick={handleCloseContactModal}
                className={`p-1.5 rounded-lg border ${
                  isDark ? 'bg-[#1f2833] border-[#45a29e]/50 text-[#c5c6c7] hover:text-white' : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitContact} className={`p-5 sm:p-6 space-y-4 text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
              <div>
                <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                  Tier / Team Designation *
                </label>
                <input
                  type="text"
                  required
                  value={tier}
                  onChange={e => setTier(e.target.value)}
                  placeholder="e.g. Tier 2 Network Operations (NetOps)"
                  className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                  Operational Role / Domain *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Core Routing, Switching & VPN Triage"
                  className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. net-ops@scicom.com.my"
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    Phone / Extension *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+60 12-345 6789"
                      className={`flex-1 px-3 py-2 rounded-lg font-mono focus:outline-none ${
                        isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                    <input
                      type="text"
                      value={ext}
                      onChange={e => setExt(e.target.value)}
                      placeholder="Ext 4420"
                      className={`w-24 px-2 py-2 rounded-lg font-mono focus:outline-none ${
                        isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                    Coverage Schedule
                  </label>
                  <input
                    type="text"
                    value={coverage}
                    onChange={e => setCoverage(e.target.value)}
                    placeholder="e.g. 24/7 On-Call Escalation or 08:00 - 20:00"
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                    Target SLA Response
                  </label>
                  <input
                    type="text"
                    value={slaTarget}
                    onChange={e => setSlaTarget(e.target.value)}
                    placeholder="e.g. Response within 30 minutes"
                    className={`w-full px-3 py-2 rounded-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 uppercase font-mono text-[11px] ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                  Primary Scope / Responsibilities (comma separated)
                </label>
                <textarea
                  rows={2}
                  value={duties}
                  onChange={e => setDuties(e.target.value)}
                  placeholder="e.g. IPsec tunnel resets, BGP route tuning, Switch interface debugs"
                  className={`w-full px-3 py-2 rounded-lg focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="pt-3 border-t border-slate-700/40 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseContactModal}
                  className={`px-4 py-2 rounded-lg border text-xs ${
                    isDark ? 'bg-[#141c24] border-[#45a29e]/50 text-[#c5c6c7]' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors ${
                    isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingContact ? 'Save Changes' : 'Add Contact to Directory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Confirmation Modal */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#1f2833] border-[#ff4d4d]/60 text-white' : 'bg-white border-red-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono uppercase tracking-wide">
                  Remove Escalation Contact
                </h3>
                <p className="text-xs text-slate-400">SCICOM Directory Action</p>
              </div>
            </div>

            <div className={`p-3.5 rounded-lg border space-y-2 text-xs ${
              isDark ? 'bg-[#0b0c10] border-[#45a29e]/30' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Tier / Unit:</span>
                <span className="font-bold">{contactToDelete.tier}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Role:</span>
                <span>{contactToDelete.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Contact:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`}>{contactToDelete.contact}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className={`px-4 py-2 rounded-lg border text-xs font-mono ${
                  isDark ? 'bg-[#0b0c10] border-[#45a29e]/50 text-[#c5c6c7]' : 'bg-slate-100 border-slate-300 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteContact}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
