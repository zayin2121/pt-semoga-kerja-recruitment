import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Application, ApplicationStage, StageHistoryEntry, Job } from '../types/recruitment';
import { evaluateCandidateCv } from './screeningService';
import { processApplicationConfirmationEmail } from './emailService';

/**
 * Generates an official unique reference number e.g. SK-202610-8492
 */
export function generateReferenceNumber(): string {
  const d = new Date();
  const yearMonth = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `SK-${yearMonth}-${randomSuffix}`;
}

/**
 * Sanitizes plain string inputs to prevent script injection
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

/**
 * Validates Indonesian phone / WhatsApp number
 */
export function isValidIndonesianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  return /^(\+62|62|0)8[1-9][0-9]{6,11}$/.test(cleaned);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export interface ApplicationInputPayload {
  job: Job;
  candidateUid?: string;
  fullName: string;
  email: string;
  phone: string;
  domicile: string;
  educationLevel: string;
  major: string;
  experienceSummary: string;
  skills: string[];
  resumeFile: File;
  resumeExtractedText: string;
  extractionQuality: 'clean' | 'partial' | 'manual_review';
  portfolioUrl?: string;
  additionalAnswers?: string;
  privacyAccepted: boolean;
}

/**
 * Checks if a candidate account has already submitted an application for the job
 */
export async function hasCandidateAppliedToJob(
  candidateUid: string,
  jobId: string
): Promise<Application | null> {
  if (!candidateUid || !jobId) return null;
  try {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('candidateUid', '==', candidateUid)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docData = snap.docs[0];
    return { id: docData.id, ...(docData.data() as Omit<Application, 'id'>) };
  } catch (err) {
    console.warn('Error checking duplicate application by candidateUid:', err);
    return null;
  }
}

/**
 * Fetches all applications belonging to a specific candidate
 */
export async function getCandidateApplications(candidateUid: string): Promise<Application[]> {
  if (!candidateUid) return [];
  try {
    const q = query(
      collection(db, 'applications'),
      where('candidateUid', '==', candidateUid)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Application, 'id'>) }));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Error fetching candidate applications by candidateUid:', err);
    return [];
  }
}

/**
 * Submits a candidate application with strict duplicate prevention and server validation
 */
export async function submitCandidateApplication(
  payload: ApplicationInputPayload
): Promise<{ success: boolean; application?: Application; error?: string; duplicate?: boolean }> {
  // 1. Validation checks
  if (!payload.job || payload.job.status !== 'published') {
    return { success: false, error: 'Lowongan pekerjaan ini sedang tidak menerima lamaran baru.' };
  }
  if (!payload.fullName.trim()) {
    return { success: false, error: 'Nama lengkap wajib diisi.' };
  }
  if (!isValidEmail(payload.email)) {
    return { success: false, error: 'Format alamat email tidak valid.' };
  }
  if (!isValidIndonesianPhone(payload.phone)) {
    return { success: false, error: 'Nomor WhatsApp tidak valid (format Indonesia: 08xxx atau +628xxx).' };
  }
  if (!payload.domicile.trim()) {
    return { success: false, error: 'Domisili kota tinggal wajib diisi.' };
  }
  if (!payload.educationLevel) {
    return { success: false, error: 'Pendidikan terakhir wajib dipilih.' };
  }
  if (!payload.major.trim()) {
    return { success: false, error: 'Program studi / jurusan wajib diisi.' };
  }
  if (!payload.experienceSummary.trim()) {
    return { success: false, error: 'Ringkasan pengalaman wajib diisi.' };
  }
  if (!payload.skills || payload.skills.length === 0) {
    return { success: false, error: 'Mohon cantumkan minimal satu keahlian/keterampilan.' };
  }
  if (!payload.resumeFile) {
    return { success: false, error: 'Berkas CV wajib diunggah (format PDF atau DOCX).' };
  }
  if (!payload.privacyAccepted) {
    return { success: false, error: 'Anda harus menyetujui Kebijakan Privasi dan Pemrosesan Data untuk melanjutkan.' };
  }

  // 2. Strict Anti-Duplicate Enforcement
  // One candidate account can only submit ONE application per Job ID.
  if (payload.candidateUid) {
    const existing = await hasCandidateAppliedToJob(payload.candidateUid, payload.job.id);
    if (existing && !existing.allowReapply) {
      return {
        success: false,
        duplicate: true,
        error: `Anda sudah pernah mengirimkan lamaran untuk posisi "${payload.job.title}". Satu akun kandidat hanya dapat mengirimkan satu berkas lamaran per posisi lowongan.`,
      };
    }
  }

  // 3. Automated CV Screening Calculation
  const screeningResult = evaluateCandidateCv(
    payload.resumeExtractedText || '',
    payload.skills,
    payload.job,
    payload.extractionQuality
  );

  const refNumber = generateReferenceNumber();
  const now = new Date().toISOString();

  const initialHistoryEntry: StageHistoryEntry = {
    fromStage: null,
    toStage: 'Applied',
    timestamp: now,
    changedBy: 'Sistem Portal Karir (Kandidat)',
    note: 'Lamaran baru masuk via website resmi PT Semoga Kerja.',
  };

  const appData: Omit<Application, 'id'> = {
    referenceNumber: refNumber,
    jobId: payload.job.id,
    jobTitle: payload.job.title,
    candidateUid: payload.candidateUid || '',
    fullName: sanitizeText(payload.fullName),
    email: sanitizeText(payload.email.toLowerCase()),
    phone: sanitizeText(payload.phone),
    domicile: sanitizeText(payload.domicile),
    educationLevel: sanitizeText(payload.educationLevel),
    major: sanitizeText(payload.major),
    experienceSummary: sanitizeText(payload.experienceSummary),
    skills: payload.skills.map(s => sanitizeText(s)),
    resumeFileName: sanitizeText(payload.resumeFile.name),
    resumeFileType: payload.resumeFile.type || 'application/octet-stream',
    resumeFileSize: payload.resumeFile.size,
    resumeText: sanitizeText(payload.resumeExtractedText.slice(0, 15000)),
    portfolioUrl: sanitizeText(payload.portfolioUrl || ''),
    additionalAnswers: sanitizeText(payload.additionalAnswers || ''),
    privacyAccepted: true,
    stage: 'Applied',
    stageHistory: [initialHistoryEntry],
    screeningResult,
    internalNotes: '',
    allowReapply: false,
    createdAt: now,
    updatedAt: now,
    isDemo: false,
  };

  try {
    const docRef = await addDoc(collection(db, 'applications'), appData);
    const createdApp: Application = { id: docRef.id, ...appData };

    // Send confirmation email asynchronously via Gmail API of application owner
    processApplicationConfirmationEmail(
      createdApp.id,
      createdApp.fullName,
      createdApp.email,
      createdApp.jobTitle
    ).catch(e => console.warn('Email dispatch warning:', e));

    return { success: true, application: createdApp };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'applications');
    return { success: false, error: 'Gagal menyimpan lamaran ke database. Silakan coba kembali.' };
  }
}

export async function getAllApplications(): Promise<Application[]> {
  try {
    const snap = await getDocs(collection(db, 'applications'));
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Application, 'id'>) }));
    return list
      .filter(a => !a.isDemo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'applications');
    return [];
  }
}

export async function getApplicationById(id: string): Promise<Application | null> {
  try {
    const snap = await getDoc(doc(db, 'applications', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as Omit<Application, 'id'>) };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `applications/${id}`);
    return null;
  }
}

export async function getApplicationByRefAndEmail(refNumber: string, email: string): Promise<Application | null> {
  try {
    const apps = await getAllApplications();
    const found = apps.find(
      a =>
        a.referenceNumber.trim().toUpperCase() === refNumber.trim().toUpperCase() &&
        a.email.trim().toLowerCase() === email.trim().toLowerCase()
    );
    return found || null;
  } catch (error) {
    console.error('Error finding application by ref and email:', error);
    return null;
  }
}

export async function updateApplicationStage(
  applicationId: string,
  newStage: ApplicationStage,
  performedBy: string,
  note?: string
): Promise<void> {
  try {
    const current = await getApplicationById(applicationId);
    if (!current) throw new Error('Lamaran tidak ditemukan.');

    const newHistoryEntry: StageHistoryEntry = {
      fromStage: current.stage,
      toStage: newStage,
      timestamp: new Date().toISOString(),
      changedBy: performedBy,
      note: note?.trim() || undefined,
    };

    const updatedHistory = [...(current.stageHistory || []), newHistoryEntry];

    await updateDoc(doc(db, 'applications', applicationId), {
      stage: newStage,
      stageHistory: updatedHistory,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `applications/${applicationId}`);
  }
}

export async function updateApplicationNotes(applicationId: string, notes: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'applications', applicationId), {
      internalNotes: notes,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `applications/${applicationId}`);
  }
}

/**
 * HRD feature to allow candidate to reapply for this job
 */
export async function allowCandidateReapply(applicationId: string, allowed: boolean): Promise<void> {
  try {
    await updateDoc(doc(db, 'applications', applicationId), {
      allowReapply: allowed,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `applications/${applicationId}`);
  }
}

export async function deleteApplication(applicationId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'applications', applicationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `applications/${applicationId}`);
  }
}

/**
 * Do not seed demo applications. Keeps pipeline empty until genuine applicants apply.
 */
export async function seedDemoApplicationsIfEmpty(jobs: Job[], isHrdUser?: boolean): Promise<Application[]> {
  return [];
}

