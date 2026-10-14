import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { getCachedAccessToken } from './authService';
import { EmailDeliveryLog } from '../types/recruitment';

/**
 * Creates an RFC 2822 base64url encoded email string compatible with Gmail API
 */
function createRawEmail(to: string, from: string, subject: string, bodyText: string): string {
  const cleanTo = to.replace(/[\r\n]/g, '').trim();
  const cleanFrom = from.replace(/[\r\n]/g, '').trim();
  const cleanSubject = subject.replace(/[\r\n]/g, '').trim();

  // UTF-8 base64 encoded subject
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(cleanSubject)))}?=`;

  const emailLines = [
    `To: ${cleanTo}`,
    `From: ${cleanFrom}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    bodyText,
  ];

  const emailString = emailLines.join('\r\n');
  // Convert to base64url (RFC 4648)
  return btoa(unescape(encodeURIComponent(emailString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generates official application confirmation email template
 */
export function generateConfirmationEmailTemplate(candidateName: string, jobTitle: string): { subject: string; body: string } {
  const safeName = candidateName.replace(/[<>]/g, '').trim();
  const safeJob = jobTitle.replace(/[<>]/g, '').trim();

  const subject = `Konfirmasi Lamaran Kerja - ${safeJob} | PT Semoga Kerja`;
  const body = `Yth. ${safeName},

Terima kasih telah melamar di PT Semoga Kerja untuk posisi ${safeJob}.

Kami mengonfirmasi bahwa lamaran Anda telah berhasil kami terima. Tim rekrutmen kami akan meninjau informasi dan dokumen yang telah Anda kirimkan sesuai dengan kebutuhan posisi tersebut.

Mohon menunggu informasi selanjutnya dari tim rekrutmen kami. Apabila terdapat perkembangan atau tahapan seleksi berikutnya, kami akan menghubungi Anda melalui email dan WhatsApp yang telah Anda cantumkan saat melamar.

Email ini merupakan konfirmasi penerimaan lamaran, bukan pemberitahuan kelulusan seleksi.

Terima kasih atas minat Anda untuk bergabung dengan PT Semoga Kerja.

Hormat kami,
Tim Recruitment & Human Resources
PT Semoga Kerja

---
Email ini dikirim secara otomatis.`;

  return { subject, body };
}

/**
 * Sends email via Gmail API using OAuth token
 */
export async function sendEmailViaGmailApi(
  toEmail: string,
  subject: string,
  bodyText: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const accessToken = getCachedAccessToken();
  if (!accessToken) {
    return {
      success: false,
      error: 'Akun Gmail belum terhubung / belum login dengan izin Gmail. Silakan hubungkan akun di Dashboard HRD.',
    };
  }

  try {
    const raw = createRawEmail(toEmail, 'me', subject, bodyText);
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Gmail API Error response:', data);
      return {
        success: false,
        error: data.error?.message || `Gagal mengirim email: HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (error) {
    console.error('Exception calling Gmail API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Koneksi ke Gmail API terputus',
    };
  }
}

/**
 * Triggers confirmation email for an application and records audit log
 */
export async function processApplicationConfirmationEmail(
  applicationId: string,
  candidateName: string,
  candidateEmail: string,
  jobTitle: string
): Promise<EmailDeliveryLog> {
  const { subject, body } = generateConfirmationEmailTemplate(candidateName, jobTitle);
  const accessToken = getCachedAccessToken();

  let status: 'sent' | 'pending' | 'failed' = 'pending';
  let errorMessage = '';

  if (accessToken) {
    const result = await sendEmailViaGmailApi(candidateEmail, subject, body);
    if (result.success) {
      status = 'sent';
    } else {
      status = 'failed';
      errorMessage = result.error || 'Pengiriman gagal';
    }
  } else {
    status = 'pending';
    errorMessage = 'Menunggu otorisasi akun Gmail oleh HRD di Dashboard.';
  }

  const logData: Omit<EmailDeliveryLog, 'id'> = {
    applicationId,
    candidateName,
    candidateEmail,
    jobTitle,
    subject,
    status,
    senderEmail: accessToken ? 'HR Official (Gmail Connected)' : 'Belum Terhubung',
    error: errorMessage || undefined,
    sentAt: new Date().toISOString(),
    attempts: 1,
  };

  try {
    const docRef = await addDoc(collection(db, 'email_delivery_logs'), logData);
    return { id: docRef.id, ...logData };
  } catch (error) {
    console.error('Failed to save email log to Firestore:', error);
    return { id: 'temp-id', ...logData };
  }
}

/**
 * Retries sending an email log
 */
export async function retryEmailDelivery(log: EmailDeliveryLog): Promise<{ success: boolean; message: string }> {
  const { subject, body } = generateConfirmationEmailTemplate(log.candidateName, log.jobTitle);
  const result = await sendEmailViaGmailApi(log.candidateEmail, subject, body);

  const updates: Partial<EmailDeliveryLog> = {
    attempts: (log.attempts || 1) + 1,
    sentAt: new Date().toISOString(),
  };

  if (result.success) {
    updates.status = 'sent';
    updates.error = undefined;
  } else {
    updates.status = 'failed';
    updates.error = result.error || 'Gagal mengirim ulang';
  }

  try {
    if (log.id && log.id !== 'temp-id') {
      await updateDoc(doc(db, 'email_delivery_logs', log.id), updates);
    }
    return {
      success: result.success,
      message: result.success ? 'Email berhasil dikirim ulang' : (result.error || 'Pengiriman gagal'),
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `email_delivery_logs/${log.id}`);
    return { success: false, message: 'Gagal memperbarui status log email' };
  }
}

/**
 * Sends a test email to the current HR user
 */
export async function sendTestEmailToCurrentUser(userEmail: string): Promise<{ success: boolean; message: string }> {
  const subject = 'Uji Coba Pengiriman Gmail API - PT Semoga Kerja Recruitment System';
  const body = `Halo,

Ini adalah pesan pengujian koneksi Gmail API untuk PT Semoga Kerja Recruitment Management System.
Akun pengirim berhasil terhubung dan siap digunakan untuk mengirimkan konfirmasi lamaran kerja kepada kandidat.

Waktu pengujian: ${new Date().toLocaleString('id-ID')}
Status: Sukses terverifikasi.

Salam,
Sistem Otomasi PT Semoga Kerja`;

  const result = await sendEmailViaGmailApi(userEmail, subject, body);
  return {
    success: result.success,
    message: result.success
      ? `Email uji coba berhasil dikirim ke ${userEmail} via Gmail API!`
      : (result.error || 'Pengiriman gagal'),
  };
}

/**
 * Gets all email logs
 */
export async function getEmailDeliveryLogs(): Promise<EmailDeliveryLog[]> {
  try {
    const snap = await getDocs(collection(db, 'email_delivery_logs'));
    const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<EmailDeliveryLog, 'id'>) }));
    return list.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'email_delivery_logs');
    return [];
  }
}
