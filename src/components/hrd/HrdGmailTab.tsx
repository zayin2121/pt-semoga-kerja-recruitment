import React, { useState } from 'react';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Send,
  Loader2,
  Info,
} from 'lucide-react';
import { EmailDeliveryLog } from '../../types/recruitment';
import { getCachedAccessToken, signInWithGoogle } from '../../services/authService';
import { retryEmailDelivery, sendTestEmailToCurrentUser } from '../../services/emailService';
import { logAudit } from '../../services/auditService';

interface HrdGmailTabProps {
  emailLogs: EmailDeliveryLog[];
  onRefreshEmailLogs: () => Promise<void>;
  currentUserEmail?: string;
}

export const HrdGmailTab: React.FC<HrdGmailTabProps> = ({
  emailLogs,
  onRefreshEmailLogs,
  currentUserEmail,
}) => {
  const isGmailConnected = Boolean(getCachedAccessToken());
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testMessage, setTestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [retryingLogId, setRetryingLogId] = useState<string | null>(null);

  const handleAuthorizeGmail = async () => {
    setIsAuthorizing(true);
    setTestMessage(null);
    try {
      const { user } = await signInWithGoogle();
      await logAudit('AUTHORIZE_GMAIL', `Akun ${user.email} berhasil memperbarui otorisasi Gmail API.`, user.uid, user.email || '');
      await onRefreshEmailLogs();
      setTestMessage({
        type: 'success',
        text: `Akun ${user.email} berhasil terhubung dengan izin pengiriman Gmail API!`,
      });
    } catch (err: any) {
      setTestMessage({
        type: 'error',
        text: err?.message || 'Gagal mengotorisasi akun Gmail.',
      });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!currentUserEmail) {
      setTestMessage({ type: 'error', text: 'Harap masuk ke sistem terlebih dahulu.' });
      return;
    }
    setIsSendingTest(true);
    setTestMessage(null);
    try {
      const res = await sendTestEmailToCurrentUser(currentUserEmail);
      if (res.success) {
        setTestMessage({ type: 'success', text: res.message });
        await logAudit('TEST_EMAIL', `Pengiriman email uji coba sukses ke ${currentUserEmail}`, '', currentUserEmail);
      } else {
        setTestMessage({ type: 'error', text: res.message });
      }
      await onRefreshEmailLogs();
    } catch (err: any) {
      setTestMessage({ type: 'error', text: err?.message || 'Gagal mengirim email uji coba.' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleRetryEmail = async (log: EmailDeliveryLog) => {
    setRetryingLogId(log.id);
    try {
      const res = await retryEmailDelivery(log);
      setTestMessage({ type: res.success ? 'success' : 'error', text: res.message });
      await logAudit('RETRY_EMAIL', `Mencoba kirim ulang email ke ${log.candidateEmail}: ${res.message}`, log.id, currentUserEmail);
      await onRefreshEmailLogs();
    } catch (err) {
      setTestMessage({ type: 'error', text: 'Gagal mengirim ulang email konfirmasi.' });
    } finally {
      setRetryingLogId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Integrasi Gmail API & Log Pengiriman Email</h2>
        <p className="text-xs text-slate-500">
          Email konfirmasi resmi dikirimkan secara langsung dari akun Gmail pemilik yang terhubung.
        </p>
      </div>

      {/* Connection Status Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isGmailConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {currentUserEmail || '2207016087@student.walisongo.ac.id'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isGmailConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isGmailConnected ? '• Gmail API Terhubung' : '• Perlu Otorisasi'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                Scope: <code className="bg-slate-100 px-1 rounded text-[10px]">gmail.send</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              disabled={isAuthorizing}
              onClick={handleAuthorizeGmail}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isAuthorizing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengotorisasi...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isGmailConnected ? 'Otorisasi Ulang' : 'Hubungkan Gmail'}</span>
                </>
              )}
            </button>
            <button
              disabled={isSendingTest || !isGmailConnected}
              onClick={handleSendTestEmail}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Uji Coba</span>
                </>
              )}
            </button>
          </div>
        </div>

        {testMessage && (
          <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            testMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {testMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{testMessage.text}</span>
          </div>
        )}

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-800 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            Ketentuan Pengiriman Email Konfirmasi:
          </p>
          <p>
            1. Email konfirmasi hanya dikirim setelah data lamaran tersimpan secara persisten di database Firestore.
          </p>
          <p>
            2. Menggunakan template resmi PT Semoga Kerja tanpa memicu HTML injection dan mencantumkan nomor referensi unik.
          </p>
          <p>
            3. Jika pengiriman gagal (misal token kedaluwarsa), berkas lamaran tetap tersimpan aman dan tombol <strong>"Kirim Ulang"</strong> dapat ditekan kapan saja oleh HRD.
          </p>
        </div>
      </div>

      {/* Email Delivery Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Riwayat Log Pengiriman Email ({emailLogs.length} Entri)
          </h3>
          <button
            onClick={() => onRefreshEmailLogs()}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Perbarui Log</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Penerima & Posisi</th>
                <th className="px-4 py-3">Subjek Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu & Percobaan</th>
                <th className="px-4 py-3">Pesan Status / Error</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emailLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Belum ada riwayat email yang tercatat.
                  </td>
                </tr>
              ) : (
                emailLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900">{log.candidateName}</p>
                      <span className="text-[11px] text-slate-500">{log.candidateEmail}</span>
                      <span className="text-[10px] text-blue-600 block">{log.jobTitle}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-800 truncate max-w-[200px]" title={log.subject}>
                      {log.subject}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        log.status === 'sent'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : log.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          log.status === 'sent'
                            ? 'bg-emerald-500'
                            : log.status === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}></span>
                        {log.status === 'sent' ? 'Terkirim' : log.status === 'pending' ? 'Tertunda' : 'Gagal'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      <p>{new Date(log.sentAt).toLocaleString('id-ID')}</p>
                      <span className="text-[10px] text-slate-400">Percobaan ke-{log.attempts || 1}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-[220px]">
                      {log.error ? (
                        <span className="text-red-600 text-[11px] leading-tight block">
                          {log.error}
                        </span>
                      ) : (
                        <span className="text-emerald-700 text-[11px]">Diterima oleh Gmail Server</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {log.status !== 'sent' && (
                        <button
                          disabled={retryingLogId === log.id}
                          onClick={() => handleRetryEmail(log)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 text-blue-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          {retryingLogId === log.id ? (
                            <span>Mengirim...</span>
                          ) : (
                            <>
                              <RotateCw className="w-3 h-3" />
                              <span>Kirim Ulang</span>
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
