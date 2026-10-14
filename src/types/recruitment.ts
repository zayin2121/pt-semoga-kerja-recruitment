export type JobType = 'Full-time' | 'Contract' | 'Internship' | 'Part-time';
export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';

export interface ScreeningCriterion {
  id: string;
  label: string;
  type: 'mandatory' | 'optional';
  weight: number; // e.g. 1-10
  keywords: string[];
}

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  description: string;
  responsibilities: string[];
  requirementsMandatory: string[];
  requirementsOptional: string[];
  screeningCriteria: ScreeningCriterion[];
  status: JobStatus;
  deadline: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  isDemo?: boolean;
}

export type ApplicationStage =
  | 'Applied'
  | 'Screening'
  | 'HR Review'
  | 'Interview'
  | 'Assessment'
  | 'User Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn'
  | 'Talent Pool';

export interface StageHistoryEntry {
  fromStage: ApplicationStage | null;
  toStage: ApplicationStage;
  timestamp: string;
  changedBy: string;
  note?: string;
}

export interface ScreeningEvidence {
  criterionId: string;
  criterionLabel: string;
  isMandatory: boolean;
  isFound: boolean;
  snippet?: string;
}

export interface ScreeningResult {
  score: number; // 0 - 100
  mandatoryScore: number; // 0 - 100
  optionalScore: number; // 0 - 100
  passedMandatory: boolean;
  extractionStatus: 'clean' | 'partial' | 'manual_review';
  evidence: ScreeningEvidence[];
  summaryNote: string;
  processedAt: string;
}

export interface Application {
  id: string;
  referenceNumber: string; // e.g. SK-202610-1849
  jobId: string;
  jobTitle: string;
  candidateUid?: string; // Stable UID of the candidate account
  fullName: string;
  email: string;
  phone: string;
  domicile: string;
  educationLevel: string;
  major: string;
  experienceSummary: string;
  skills: string[];
  resumeFileName: string;
  resumeFileType: string;
  resumeFileSize: number;
  resumeText?: string;
  portfolioUrl?: string;
  additionalAnswers?: string;
  privacyAccepted: boolean;
  stage: ApplicationStage;
  stageHistory: StageHistoryEntry[];
  screeningResult?: ScreeningResult;
  internalNotes?: string;
  allowReapply?: boolean; // HRD override allowing candidate to submit another application
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface CandidateUser {
  uid: string;
  email: string;
  displayName: string;
  provider: 'google' | 'password';
  createdAt?: string;
}

export function getPublicStageLabel(stage: ApplicationStage): string {
  switch (stage) {
    case 'Applied':
    case 'Screening':
    case 'HR Review':
      return 'Sedang Ditinjau';
    case 'Assessment':
      return 'Dalam Proses Seleksi';
    case 'Interview':
    case 'User Interview':
      return 'Wawancara';
    case 'Offer':
      return 'Penawaran Kerja';
    case 'Hired':
      return 'Diterima / Bergabung';
    case 'Rejected':
    case 'Withdrawn':
      return 'Proses Selesai';
    case 'Talent Pool':
      return 'Talent Pool';
    default:
      return 'Sedang Ditinjau';
  }
}

export interface InterviewSchedule {
  id: string;
  applicationId: string;
  candidateName: string;
  jobTitle: string;
  interviewDate: string; // YYYY-MM-DD
  interviewTime: string; // HH:mm
  timeZone: 'WIB' | 'WITA' | 'WIT';
  interviewerName: string;
  interviewerEmail: string;
  locationType: 'online' | 'offline';
  meetingLinkOrLocation: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  evaluationScore?: number; // 1-100
  evaluationNotes?: string;
  createdAt: string;
}

export interface EmailDeliveryLog {
  id: string;
  applicationId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  subject: string;
  status: 'sent' | 'pending' | 'failed';
  senderEmail: string;
  error?: string;
  sentAt: string;
  attempts: number;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy: string;
  performedByEmail: string;
  targetId?: string;
  timestamp: string;
}

export interface SystemSettings {
  id: string;
  companyName: string;
  hrEmail: string;
  retentionPeriodMonths: number;
  autoSendConfirmation: boolean;
  gmailConnectedEmail?: string;
  gmailLastTestedAt?: string;
  updatedAt: string;
}

export interface HrdUser {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'recruiter';
  isGmailConnected: boolean;
}

export interface TestResultItem {
  id: string;
  category: string;
  title: string;
  status: 'passed' | 'failed' | 'pending';
  message: string;
  durationMs: number;
}
