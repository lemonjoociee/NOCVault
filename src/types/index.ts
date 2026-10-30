export type UserRole = 'NOC' | 'Admin';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  status: 'Active' | 'Invited' | 'Suspended';
  createdAt: string;
  lastLogin?: string;
  password?: string;
}

export type SeverityLevel = 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'P4 - Low';

export type CaseCategory = string;

export interface WorkflowStep {
  stepNumber: number;
  title: string;
  instructions: string[];
  command?: string;
  screenshotNote?: string;
  warning?: string;
  credentials?: { label: string; value: string }[];
}

export interface AutomatedScript {
  id: string;
  name: string;
  category: CaseCategory;
  language: 'bash' | 'powershell' | 'python' | 'batch';
  description: string;
  code: string;
  defaultTarget?: string;
  expectedOutput: string;
}

export interface IncidentCase {
  id: string;
  caseNumber: string;
  title: string;
  category: CaseCategory;
  severity: SeverityLevel;
  summary: string;
  targetNodes?: string[];
  symptoms: string[];
  rootCause?: string;
  workflowSteps: WorkflowStep[];
  scripts: AutomatedScript[];
  escalationPath: {
    l1?: string;
    l2: string;
    l3?: string;
    slaMins?: number;
  };
  pdfAttachment?: {
    title: string;
    filename: string;
    path: string;
  };
  author: string;
  createdDate: string;
  tags: string[];
}

export interface MemberInvitation {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  department: string;
  status: 'Pending' | 'Accepted';
  invitedBy: string;
  invitedAt: string;
  token: string;
}

export interface EscalationContact {
  id: string;
  tier: string;
  role: string;
  contact: string;
  phone: string;
  ext?: string;
  coverage: string;
  slaTarget: string;
  duties: string[];
}

