import React, { useState } from 'react';
import { Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SystemSettings } from '../../types/recruitment';
import { updateSystemSettings, purgeExpiredApplications } from '../../services/systemService';
import { logAudit } from '../../services/auditService';

interface HrdSettingsTabProps {
  settings: SystemSettings;
  onRefreshSettings: () => Promise<void>;
  currentUserEmail?: string;
  onRefreshApplications: () => Promise<void>;
}

export const HrdSettingsTab: React.FC<HrdSettingsTabProps> = ({
  settings,
  onRefreshSettings,
  currentUserEmail,
  onRefreshApplications,
}) => {
  const [companyName, setCompanyName] = useState(settings.companyName || 'PT Semoga Kerja');
  const [hrEmail, setHrEmail] = useState(settings.hrEmail || 'recruitment@semogakerja.co.id');
  const [retentionPeriodMonths, setRetentionPeriodMonths] = useState(settings.retentionPeriodMonths || 12);
  const [autoSendConfirmation, setAutoSendConfirmation] = useState(settings.autoSendConfirmation ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [purgeMessage, setPurgeMessage] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateSystemSettings({
        companyName,
        hrEmail,
        retentionPeriodMonths: Number(retentionPeriodMonths),
        autoSendConfirmation,
      });
      await logAudit(
        'UPDATE_SETTINGS',
        `Memperbarui konfigurasi sistem (retensi: ${retentionPeriodMonths} bulan, auto-send: ${autoSendConfirmation})`,
        'system_settings/global',
        currentUserEmail
      );
      await onRefreshSettings();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurgeExpired = async () => {
    const months = Number(retentionPeriodMonths);
    setIsPurging(true);
    setPurgeMessage(null);
    try {
      const res = await purgeExpiredApplications(months);
      await logAudit(
        'PURGE_EXPIRED_DATA',
        `Menjalankan pembersihan retensi data: ${res.purgedCount} berkas kadaluwarsa berhasil dihapus.`,
        '',
        currentUserEmail
      );
      setPurgeMessage(`Pembersihan retensi data berhasil: ${res.purgedCount} berkas pelamar dihapus.`);
      await onRefreshApplications();
      setTimeout(() => setPurgeMessage(null), 5000);
    } catch (err) {
      setPurgeMessage('Gagal menjalankan pembersihan data retensi.');
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
        <h2 className="text-lg font-bold text-slate-900">Pengaturan Sistem & Kebijakan Retensi</h2>
        <p className="text-xs text-slate-500">
          Konfigurasi identitas perusahaan, batas masa simpan data kandidat, dan otomasi korespondensi.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nama Perusahaan</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Resmi Rekrutmen</label>
            <input
              type="email"
              required
              value={hrEmail}
              onChange={e => setHrEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Periode Retensi Data Pelamar</label>
            <select
              value={retentionPeriodMonths}
              onChange={e => setRetentionPeriodMonths(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
            >
              <option value={6}>6 Bulan</option>
              <option value={12}>12 Bulan (1 Tahun - Rekomendasi)</option>
              <option value={24}>24 Bulan (2 Tahun)</option>
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Sesuai asas kepatuhan privasi data: data tidak disimpan selamanya tanpa batas waktu.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Kirim Konfirmasi Email Otomatis</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="auto-send"
                checked={autoSendConfirmation}
                onChange={e => setAutoSendConfirmation(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="auto-send" className="text-slate-700 cursor-pointer">
                Otomatis kirim email tanda terima saat lamaran baru berhasil masuk
              </label>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </button>
        </div>
      </form>

      {/* Retention Data Purge Box */}
      <div className="bg-red-50/50 border border-red-200 rounded-2xl p-5 sm:p-6 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <span>Pembersihan Data Retensi (Data Purge)</span>
        </div>
        <p className="text-slate-600 leading-relaxed max-w-2xl">
          Menghapus permanen seluruh data kandidat dan CV yang umurnya telah melebihi batas retensi ({retentionPeriodMonths} bulan) untuk menegakkan prinsip minimisasi data. Tindakan ini tidak dapat dibatalkan.
        </p>
        {purgeMessage && (
          <div className="p-3 bg-red-100 text-red-900 border border-red-300 rounded-xl font-medium">
            {purgeMessage}
          </div>
        )}
        <button
          disabled={isPurging}
          onClick={handlePurgeExpired}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>{isPurging ? 'Memproses Pembersihan...' : 'Jalankan Pembersihan Data Kadaluwarsa'}</span>
        </button>
      </div>
    </div>
  );
};
