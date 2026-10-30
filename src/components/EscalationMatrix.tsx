import React, { useState } from 'react';
import { User, EscalationContact } from '../types';
import { 
  getStoredContacts, 
  addEscalationContact, 
  updateEscalationContact, 
  deleteEscalationContact 
} from '../utils/storage';
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
  ShieldCheck
} from 'lucide-react';

interface EscalationMatrixProps {
  currentUser: User;
}

export const EscalationMatrix: React.FC<EscalationMatrixProps> = ({ currentUser }) => {
  const [contacts, setContacts] = useState<EscalationContact[]>(() => getStoredContacts());
  
  // Modal / Form state for Add or Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EscalationContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<EscalationContact | null>(null);

  // Form fields
  const [tier, setTier] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ext, setExt] = useState('');
  const [coverage, setCoverage] = useState('');
  const [slaTarget, setSlaTarget] = useState('');
  const [duties, setDuties] = useState('');

  const isAdmin = currentUser.role === 'Admin';

  const handleOpenAddModal = () => {
    setEditingContact(null);
    setTier('');
    setRole('');
    setEmail('');
    setPhone('');
    setExt('');
    setCoverage('24/7 On-Call Escalation');
    setSlaTarget('Response within 30 minutes');
    setDuties('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: EscalationContact) => {
    setEditingContact(contact);
    setTier(contact.tier);
    setRole(contact.role);
    setEmail(contact.contact);
    setPhone(contact.phone);
    setExt(contact.ext || '');
    setCoverage(contact.coverage);
    setSlaTarget(contact.slaTarget);
    setDuties(contact.duties.join(', '));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!tier.trim() || !role.trim() || !email.trim() || !phone.trim()) return;

    const parsedDuties = duties
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);

    const dutiesToSave = parsedDuties.length > 0 ? parsedDuties : ['Incident triage', 'Operational escalation'];

    if (editingContact) {
      // Update existing
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
      // Add new
      const created = addEscalationContact({
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

    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (!isAdmin || !contactToDelete) return;
    const updated = deleteEscalationContact(contactToDelete.id);
    setContacts(updated);
    setContactToDelete(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-5 h-5 text-[#66fcf1]" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
              NOC Escalation Matrix &amp; Directory
            </h2>
          </div>
          <p className="text-xs text-[#c5c6c7]">
            Standardized 24/7 on-call tier contacts, escalation hierarchy, and primary operational responsibilities.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAdmin ? (
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/40 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#66fcf1]" />
              <span>ADMIN: EDITING ENABLED</span>
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#0b0c10] text-[#45a29e] border border-[#45a29e]/40 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>NOC: READ-ONLY</span>
            </span>
          )}
        </div>
      </div>

      {/* On-Call Directory */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-[#66fcf1]" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              On-Call Escalation Directory &amp; Tier Contacts
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[#45a29e] font-mono hidden sm:inline">24/7 DUTY ROSTER</span>
            
            {/* Add Contact Button - Admin Only */}
            {isAdmin && (
              <button
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs transition-colors shadow-sm"
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
              className="p-4 bg-[#0b0c10] border border-[#45a29e]/40 hover:border-[#66fcf1]/60 rounded-lg space-y-3 text-xs flex flex-col justify-between transition-colors relative group"
            >
              <div>
                {/* Card Header with Tier and Admin Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white text-sm">
                      {team.tier}
                    </div>
                    <div className="text-[#45a29e] font-medium text-xs mt-0.5">
                      {team.role}
                    </div>
                  </div>

                  {/* Admin Edit/Delete Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleOpenEditModal(team)}
                        className="p-1 text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#1f2833] rounded transition-colors"
                        title="Edit Contact"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactToDelete(team)}
                        className="p-1 text-[#c5c6c7] hover:text-[#ff4d4d] hover:bg-[#ff4d4d]/20 rounded transition-colors cursor-pointer"
                        title={`Delete ${team.tier}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="mt-3 space-y-1.5 text-[#c5c6c7] text-[11px]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#66fcf1] shrink-0" />
                    <a href={`mailto:${team.contact}`} className="text-white hover:text-[#66fcf1] truncate">
                      {team.contact}
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#66fcf1] shrink-0" />
                    <span>{team.phone} {team.ext ? `(${team.ext})` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#f5a623]">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{team.coverage} · {team.slaTarget}</span>
                  </div>
                </div>
              </div>

              {/* Responsibilities */}
              <div className="pt-2 border-t border-[#45a29e]/20 text-[10px] text-[#c5c6c7]/80">
                <span className="text-[#45a29e] font-semibold block mb-0.5 uppercase font-mono">Primary Scope:</span>
                <div>{team.duties.join(' · ')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-[#1f2833] border border-[#45a29e] rounded-lg shadow-[0_0_30px_rgba(102,252,241,0.25)] flex flex-col overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#45a29e]/40 bg-[#0b0c10] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#1f2833] border border-[#66fcf1] flex items-center justify-center text-[#66fcf1]">
                  <Phone className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white uppercase font-mono tracking-wide">
                  {editingContact ? 'Edit On-Call Contact' : 'Add New On-Call Contact'}
                </h3>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-1.5 text-[#c5c6c7] hover:text-[#66fcf1] rounded bg-[#1f2833] border border-[#45a29e]/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs text-[#c5c6c7]">
              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider font-mono">
                  Tier / Team Designation *
                </label>
                <input
                  type="text"
                  required
                  value={tier}
                  onChange={e => setTier(e.target.value)}
                  placeholder="e.g. Tier 2 Network Operations (NetOps)"
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                />
              </div>

              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider font-mono">
                  Operational Role / Domain *
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Core Routing, Switching & VPN Triage"
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider font-mono">
                    Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. net-ops@scicom.com.my"
                    className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>

                <div>
                  <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider font-mono">
                    Phone / Extension *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+60 12-345 6789"
                      className="flex-1 px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                    />
                    <input
                      type="text"
                      value={ext}
                      onChange={e => setExt(e.target.value)}
                      placeholder="Ext 4420"
                      className="w-24 px-2 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white font-mono focus:outline-none focus:border-[#66fcf1]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#45a29e] font-semibold mb-1 uppercase tracking-wider font-mono">
                    Coverage Schedule
                  </label>
                  <input
                    type="text"
                    value={coverage}
                    onChange={e => setCoverage(e.target.value)}
                    placeholder="e.g. 24/7 On-Call Escalation or 08:00 - 20:00"
                    className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>

                <div>
                  <label className="block text-[#45a29e] font-semibold mb-1 uppercase tracking-wider font-mono">
                    Target SLA Response
                  </label>
                  <input
                    type="text"
                    value={slaTarget}
                    onChange={e => setSlaTarget(e.target.value)}
                    placeholder="e.g. Response within 30 minutes"
                    className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#45a29e] font-semibold mb-1 uppercase tracking-wider font-mono">
                  Primary Scope / Responsibilities (comma separated)
                </label>
                <textarea
                  rows={2}
                  value={duties}
                  onChange={e => setDuties(e.target.value)}
                  placeholder="e.g. IPsec tunnel resets, BGP route tuning, Switch interface debugs"
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white focus:outline-none focus:border-[#66fcf1]"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-[#45a29e]/30 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-[#141c24] hover:bg-[#0b0c10] text-[#c5c6c7] rounded border border-[#45a29e]/50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs transition-colors flex items-center gap-1.5"
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
          <div className="bg-[#1f2833] border border-[#ff4d4d]/60 rounded-xl max-w-md w-full p-6 shadow-[0_0_35px_rgba(255,77,77,0.35)] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff4d4d]/20 border border-[#ff4d4d]/50 flex items-center justify-center text-[#ff4d4d] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Remove Escalation Contact
                </h3>
                <p className="text-xs text-[#c5c6c7]">SCICOM Directory Action</p>
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Tier / Unit:</span>
                <span className="text-white font-bold">{contactToDelete.tier}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Role:</span>
                <span className="text-[#c5c6c7]">{contactToDelete.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Contact:</span>
                <span className="text-[#66fcf1] font-mono">{contactToDelete.contact}</span>
              </div>
              <div className="pt-2 text-[11px] text-[#ff4d4d]">
                Are you sure you want to remove this tier contact from the active on-call escalation directory?
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 rounded-lg bg-[#0b0c10] border border-[#45a29e]/50 text-[#c5c6c7] hover:text-white text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(255,77,77,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Contact
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
