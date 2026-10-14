import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { SystemSettings, Application } from '../types/recruitment';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  id: 'global',
  companyName: 'PT Semoga Kerja',
  hrEmail: 'recruitment@semogakerja.co.id',
  retentionPeriodMonths: 12, // Default 1 year
  autoSendConfirmation: true,
  gmailConnectedEmail: '2207016087@student.walisongo.ac.id',
  updatedAt: new Date().toISOString(),
};

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    const snap = await getDoc(doc(db, 'system_settings', 'global'));
    if (!snap.exists()) {
      await setDoc(doc(db, 'system_settings', 'global'), DEFAULT_SYSTEM_SETTINGS);
      return DEFAULT_SYSTEM_SETTINGS;
    }
    return { id: snap.id, ...(snap.data() as Omit<SystemSettings, 'id'>) };
  } catch (error) {
    console.warn('Fallback to default settings:', error);
    return DEFAULT_SYSTEM_SETTINGS;
  }
}

export async function updateSystemSettings(updates: Partial<SystemSettings>): Promise<void> {
  try {
    const cleaned = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'system_settings', 'global'), cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'system_settings/global');
  }
}

/**
 * Purges candidate applications that exceed the retention period (retention policy enforcement)
 */
export async function purgeExpiredApplications(retentionMonths: number): Promise<{ purgedCount: number }> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - retentionMonths);
    const snap = await getDocs(collection(db, 'applications'));
    let purged = 0;
    for (const d of snap.docs) {
      const data = d.data() as Application;
      const createdAt = new Date(data.createdAt);
      if (createdAt < cutoffDate) {
        await deleteDoc(d.ref);
        purged++;
      }
    }
    return { purgedCount: purged };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'applications');
    return { purgedCount: 0 };
  }
}
