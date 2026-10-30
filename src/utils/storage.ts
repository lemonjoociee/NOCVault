import { User, IncidentCase, AutomatedScript, MemberInvitation, EscalationContact } from '../types';
import { INITIAL_USERS, INITIAL_CASES, INITIAL_SCRIPTS, ESCALATION_TEAMS } from '../data/initialData';

const USERS_STORAGE_KEY = 'noc_portal_users_v1';
const CASES_STORAGE_KEY = 'noc_portal_cases_v1';
const SCRIPTS_STORAGE_KEY = 'noc_portal_scripts_v1';
const INVITES_STORAGE_KEY = 'noc_portal_invites_v1';
const CONTACTS_STORAGE_KEY = 'noc_portal_escalation_contacts_v1';

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    const parsed: User[] = JSON.parse(raw);
    // Ensure all default users have passwords populated
    const merged = parsed.map(u => {
      if (!u.password) {
        if (u.username === 'admin') return { ...u, password: 'admin123' };
        if (u.username === 'noc_lead') return { ...u, password: 'noc123' };
        if (u.username === 'rajeev') return { ...u, password: 'rajeev123' };
        return { ...u, password: 'Noc@2026' };
      }
      return u;
    });
    return merged;
  } catch (e) {
    console.error('Failed to parse stored users:', e);
    return INITIAL_USERS;
  }
}

export function saveUsers(users: User[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}

export function addMember(newUser: Omit<User, 'id' | 'createdAt'>): { user: User; invite: MemberInvitation } {
  const users = getStoredUsers();
  const id = `usr-${Date.now().toString(36)}`;
  const now = new Date().toISOString().split('T')[0];
  
  const createdUser: User = {
    ...newUser,
    id,
    createdAt: now,
    status: 'Active'
  };

  const updatedUsers = [createdUser, ...users];
  saveUsers(updatedUsers);

  // Record simulated invitation
  const invite: MemberInvitation = {
    id: `inv-${Date.now()}`,
    email: newUser.email,
    fullName: newUser.fullName,
    role: newUser.role,
    department: newUser.department,
    status: 'Accepted',
    invitedBy: 'Admin Portal',
    invitedAt: new Date().toLocaleString(),
    token: `tok_${Math.random().toString(36).substring(2, 10)}`
  };

  const invites = getStoredInvitations();
  saveInvitations([invite, ...invites]);

  return { user: createdUser, invite };
}

export function updateMemberRole(userId: string, newRole: 'NOC' | 'Admin'): User[] {
  const users = getStoredUsers();
  const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
  saveUsers(updated);
  return updated;
}

export function toggleMemberStatus(userId: string): User[] {
  const users = getStoredUsers();
  const updated = users.map(u => {
    if (u.id === userId) {
      const nextStatus: 'Active' | 'Suspended' = u.status === 'Active' ? 'Suspended' : 'Active';
      return { ...u, status: nextStatus };
    }
    return u;
  });
  saveUsers(updated);
  return updated;
}

export function deleteMember(userId: string): User[] {
  const users = getStoredUsers().filter(u => u.id !== userId);
  saveUsers(users);
  return users;
}

export function getStoredCases(): IncidentCase[] {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(INITIAL_CASES));
      return INITIAL_CASES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored cases:', e);
    return INITIAL_CASES;
  }
}

export function saveCases(cases: IncidentCase[]): void {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));
  } catch (e) {
    console.error('Failed to save cases:', e);
  }
}

export function addIncidentCase(newCase: Omit<IncidentCase, 'id' | 'caseNumber' | 'createdDate'>): IncidentCase {
  const currentCases = getStoredCases();
  const caseNumber = `CASE-${100 + currentCases.length + 1}`;
  const id = `case-${Date.now()}`;
  const createdDate = new Date().toISOString().split('T')[0];

  const fullCase: IncidentCase = {
    ...newCase,
    id,
    caseNumber,
    createdDate
  };

  const updated = [fullCase, ...currentCases];
  saveCases(updated);
  return fullCase;
}

export function getStoredScripts(): AutomatedScript[] {
  try {
    const raw = localStorage.getItem(SCRIPTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(INITIAL_SCRIPTS));
      return INITIAL_SCRIPTS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored scripts:', e);
    return INITIAL_SCRIPTS;
  }
}

export function getStoredInvitations(): MemberInvitation[] {
  try {
    const raw = localStorage.getItem(INVITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInvitations(invites: MemberInvitation[]): void {
  try {
    localStorage.setItem(INVITES_STORAGE_KEY, JSON.stringify(invites));
  } catch (e) {
    console.error('Failed to save invitations:', e);
  }
}

export function getStoredContacts(): EscalationContact[] {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) {
      const seeded: EscalationContact[] = ESCALATION_TEAMS.map((t, idx) => ({
        id: `contact-${idx + 1}`,
        ...t
      }));
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored contacts:', e);
    return ESCALATION_TEAMS.map((t, idx) => ({ id: `contact-${idx + 1}`, ...t }));
  }
}

export function saveContacts(contacts: EscalationContact[]): void {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error('Failed to save contacts:', e);
  }
}

export function addEscalationContact(contact: Omit<EscalationContact, 'id'>): EscalationContact {
  const current = getStoredContacts();
  const created: EscalationContact = {
    ...contact,
    id: `contact-${Date.now()}`
  };
  const updated = [...current, created];
  saveContacts(updated);
  return created;
}

export function updateEscalationContact(contact: EscalationContact): EscalationContact[] {
  const current = getStoredContacts();
  const updated = current.map(c => c.id === contact.id ? contact : c);
  saveContacts(updated);
  return updated;
}

export function deleteEscalationContact(contactId: string): EscalationContact[] {
  const current = getStoredContacts().filter(c => c.id !== contactId);
  saveContacts(current);
  return current;
}

