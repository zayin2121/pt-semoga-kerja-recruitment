import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Job, ScreeningCriterion } from '../types/recruitment';

// Do not pre-populate any demo jobs. Job listings remain completely empty until an HRD account uploads new jobs.
export const INITIAL_DEMO_JOBS: Omit<Job, 'id'>[] = [];

/**
 * Retrieves all jobs uploaded by HRD accounts (excluding any legacy demo items)
 */
export async function getAllJobs(): Promise<Job[]> {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    const all = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Job, 'id'>) }));
    // Exclude any demo jobs; only genuine jobs created by HRD will appear
    return all.filter(j => !j.isDemo);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'jobs');
    return [];
  }
}

/**
 * Retrieves published jobs for candidates/public view
 */
export async function getPublishedJobs(): Promise<Job[]> {
  try {
    const all = await getAllJobs();
    return all.filter(j => j.status === 'published');
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'jobs');
    return [];
  }
}

export async function getJobById(id: string): Promise<Job | null> {
  try {
    const docSnap = await getDoc(doc(db, 'jobs', id));
    if (!docSnap.exists()) return null;
    const data = docSnap.data() as Omit<Job, 'id'>;
    if (data.isDemo) return null;
    return { id: docSnap.id, ...data };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `jobs/${id}`);
    return null;
  }
}

/**
 * Creates a new official job listing (uploaded by authenticated HRD account)
 */
export async function createJob(jobData: Omit<Job, 'id'>): Promise<Job> {
  try {
    const cleaned = {
      ...jobData,
      isDemo: false, // Always false for real HRD uploads
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'jobs'), cleaned);
    return { id: ref.id, ...cleaned };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'jobs');
  }
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  try {
    const cleaned = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'jobs', id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `jobs/${id}`);
  }
}

export async function deleteJob(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'jobs', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `jobs/${id}`);
  }
}

/**
 * Do not seed any demo jobs. Returns genuine jobs or empty array.
 */
export async function seedDemoJobsIfEmpty(): Promise<Job[]> {
  return getAllJobs();
}

/**
 * Cleanup any legacy demo jobs when HRD is authenticated
 */
export async function cleanupDemoJobs(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, 'jobs'));
    for (const d of snap.docs) {
      const data = d.data();
      if (data.isDemo === true) {
        try {
          await deleteDoc(d.ref);
        } catch {
          // ignore individual deletion permission errors
        }
      }
    }
  } catch {
    // silent catch
  }
}

export function canApplyJob(job: Job | null): { allowed: boolean; reason?: string } {
  if (!job) return { allowed: false, reason: 'Lowongan tidak ditemukan.' };
  if (job.status !== 'published') {
    return {
      allowed: false,
      reason: `Lowongan ini berstatus "${job.status}" dan tidak lagi menerima lamaran baru.`,
    };
  }
  if (job.deadline) {
    const deadlineDate = new Date(job.deadline);
    const now = new Date();
    // Allow through end of the deadline day
    deadlineDate.setHours(23, 59, 59, 999);
    if (now > deadlineDate) {
      return { allowed: false, reason: 'Batas akhir penerimaan lamaran untuk posisi ini telah lewat.' };
    }
  }
  return { allowed: true };
}
