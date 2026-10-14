import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { InterviewSchedule } from '../types/recruitment';

export async function getAllInterviewSchedules(): Promise<InterviewSchedule[]> {
  try {
    const snap = await getDocs(collection(db, 'interview_schedules'));
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<InterviewSchedule, 'id'>) }));
    return list.sort((a, b) => new Date(`${b.interviewDate} ${b.interviewTime}`).getTime() - new Date(`${a.interviewDate} ${a.interviewTime}`).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'interview_schedules');
    return [];
  }
}

export async function createInterviewSchedule(
  data: Omit<InterviewSchedule, 'id' | 'createdAt'>
): Promise<InterviewSchedule> {
  try {
    const record = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const ref = await addDoc(collection(db, 'interview_schedules'), record);
    return { id: ref.id, ...record };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'interview_schedules');
  }
}

export async function updateInterviewSchedule(
  id: string,
  updates: Partial<InterviewSchedule>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'interview_schedules', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `interview_schedules/${id}`);
  }
}

export async function saveInterviewEvaluation(
  id: string,
  evaluationScore: number,
  evaluationNotes: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'interview_schedules', id), {
      status: 'completed',
      evaluationScore,
      evaluationNotes,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `interview_schedules/${id}`);
  }
}

export async function deleteInterviewSchedule(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'interview_schedules', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `interview_schedules/${id}`);
  }
}
