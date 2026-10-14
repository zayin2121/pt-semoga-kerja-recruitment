import {
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { AuditLog } from '../types/recruitment';

export async function logAudit(
  action: string,
  details: string,
  targetId?: string,
  userEmail?: string,
  userName?: string
): Promise<void> {
  try {
    const entry: Omit<AuditLog, 'id'> = {
      action,
      details,
      targetId: targetId || '',
      performedBy: userName || 'HR Staff',
      performedByEmail: userEmail || 'system@semogakerja.co.id',
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, 'audit_logs'), entry);
  } catch (error) {
    console.warn('Could not record audit log to Firestore:', error);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'audit_logs'));
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AuditLog, 'id'>) }));
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'audit_logs');
    return [];
  }
}
