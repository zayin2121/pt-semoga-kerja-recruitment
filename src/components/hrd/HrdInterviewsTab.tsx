import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Video,
  MapPin,
  Clock,
  XCircle,
  X,
  Check,
} from 'lucide-react';
import { InterviewSchedule, Application, Job } from '../../types/recruitment';
import { createInterviewSchedule, updateInterviewSchedule, saveInterviewEvaluation, deleteInterviewSchedule } from '../../services/interviewService';
import { logAudit } from '../../services/auditService';

interface HrdInterviewsTabProps {
  interviews: InterviewSchedule[];
  applications: Application[];
  jobs: Job[];
  onRefreshInterviews: () => Promise<void>;
  currentUserEmail?: string;
  defaultCandidateForModal?: Application | null;
  onClearDefaultCandidate?: () => void;
}

export const HrdInterviewsTab: React.FC<HrdInterviewsTabProps> = ({
  interviews,
  applications,
  jobs,
  onRefreshInterviews,
  currentUserEmail,
  defaultCandidateForModal,
  onClearDefaultCandidate,
}) => {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(Boolean(defaultCandidateForModal));
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewSchedule | null>(null);

  // Schedule form
  const [selectedAppId, setSelectedAppId] = useState(defaultCandidateForModal?.id || '');
  const [interviewDate, setInterviewDate] = useState('2026-10-20');
  const [interviewTime, setInterviewTime] = useState('10:00');
  const [timeZone, setTimeZone] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');
  const [interviewerName, setInterviewerName] = useState('Tim Rekrutmen HR & User');
  const [interviewerEmail, setInterviewerEmail] = useState(currentUserEmail || 'recruitment@semogakerja.co.id');
  const [locationType, setLocationType] = useState<'online' | 'offline'>('online');
  const [meetingLinkOrLocation, setMeetingLinkOrLocation] = useState('https://meet.google.com/semoga-kerja-interview');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Evaluation form
  const [evalScore, setEvalScore] = useState(85);
  const [evalNotes, setEvalNotes] = useState('');
  const [isSavingEval, setIsSavingEval] = useState(false);
  const [formError, setFormError] = useState('');

  const openNewScheduleModal = () => {
    setSelectedAppId(applications[0]?.id || '');
    setInterviewDate(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);
    setInterviewTime('10:00');
    setTimeZone('WIB');
    setLocationType('online');
    setMeetingLinkOrLocation('https://meet.google.com/semoga-kerja-interview');
    setNotes('');
    setFormError('');
    setIsScheduleModalOpen(true);
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const app = applications.find(a => a.id === selectedAppId);
    if (!app) {
      setFormError('Pilih kandidat yang valid.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createInterviewSchedule({
        applicationId: app.id,
        candidateName: app.fullName,
        jobTitle: app.jobTitle,
        interviewDate,
        interviewTime,
        timeZone,
        interviewerName,
        interviewerEmail,
        locationType,
        meetingLinkOrLocation,
        notes,
        status: 'scheduled',
      });
      await logAudit(
        'SCHEDULE_INTERVIEW',
        `Menjadwalkan wawancara untuk ${app.fullName} pada ${interviewDate} ${interviewTime} ${timeZone} (${locationType})`,
        app.id,
        currentUserEmail
      );
      await onRefreshInterviews();
      setIsScheduleModalOpen(false);
      if (onClearDefaultCandidate) onClearDefaultCandidate();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan jadwal wawancara.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEvaluationModal = (item: InterviewSchedule) => {
    setSelectedInterview(item);
    setEvalScore(item.evaluationScore || 80);
    setEvalNotes(item.evaluationNotes || '');
    setFormError('');
    setIsEvaluationModalOpen(true);
  };

  const handleSaveEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    setIsSavingEval(true);
    setFormError('');
    try {
      await saveInterviewEvaluation(selectedInterview.id, evalScore, evalNotes);
      await logAudit(
        'EVALUATE_INTERVIEW',
        `Menyimpan hasil evaluasi wawancara ${selectedInterview.candidateName}: Skor ${evalScore}/100`,
        selectedInterview.applicationId,
        currentUserEmail
      );
      await onRefreshInterviews();
      setIsEvaluationModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan evaluasi.');
    } finally {
      setIsSavingEval(false);
    }
  };

  const handleCancelInterview = async (item: InterviewSchedule) => {
    try {
      await updateInterviewSchedule(item.id, { status: 'cancelled' });
      await logAudit('CANCEL_INTERVIEW', `Membatalkan jadwal wawancara ${item.candidateName}`, item.applicationId, currentUserEmail);
      await onRefreshInterviews();
    } catch (err) {
      console.error('Gagal membatalkan jadwal:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Penjadwalan Wawancara & Evaluasi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola agenda interview online / tatap muka dan catat hasil penilaian kompetensi kandidat.
          </p>
        </div>
        <button
          onClick={openNewScheduleModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Jadwalkan Wawancara Baru</span>
        </button>
      </div>

      {/* Interviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Kandidat & Posisi</th>
                <th className="px-4 py-3.5">Waktu Wawancara</th>
                <th className="px-4 py-3.5">Metode & Lokasi</th>
                <th className="px-4 py-3.5">Pewawancara</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Hasil Evaluasi</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    Belum ada jadwal wawancara yang dibuat.
                  </td>
                </tr>
              ) : (
                interviews.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-xs">{item.candidateName}</p>
                      <span className="text-[11px] text-slate-500">{item.jobTitle}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-800">
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        <span>{new Date(item.interviewDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {item.interviewTime} {item.timeZone}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {item.locationType === 'online' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 inline-flex items-center gap-1">
                            <Video className="w-3 h-3" /> Online
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> Offline
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 truncate max-w-[180px] block mt-1">
                        {item.meetingLinkOrLocation}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      <p className="font-medium">{item.interviewerName}</p>
                      <span className="text-[10px] text-slate-400">{item.interviewerEmail}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          item.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'scheduled'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.status === 'completed' ? 'Selesai' : item.status === 'scheduled' ? 'Terjadwal' : 'Dibatalkan'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {item.evaluationScore ? (
                        <div className="text-xs">
                          <span className="font-bold text-emerald-700">{item.evaluationScore}/100</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                            {item.evaluationNotes}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Belum dinilai</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEvaluationModal(item)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                        >
                          {item.evaluationScore ? 'Ubah Nilai' : 'Beri Nilai'}
                        </button>
                        {item.status === 'scheduled' && (
                          <button
                            onClick={() => handleCancelInterview(item)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Batalkan Sesi"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Interview Schedule */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm sm:text-base">Jadwalkan Sesi Wawancara</h3>
              <button
                onClick={() => {
                  setIsScheduleModalOpen(false);
                  if (onClearDefaultCandidate) onClearDefaultCandidate();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="p-4 sm:p-6 space-y-3.5 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Kandidat Pelamar <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedAppId}
                  onChange={e => setSelectedAppId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="">-- Pilih Pelamar --</option>
                  {applications.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.fullName} • {a.jobTitle} ({a.referenceNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={interviewDate}
                    onChange={e => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jam & Zona</label>
                  <div className="flex gap-1">
                    <input
                      type="time"
                      required
                      value={interviewTime}
                      onChange={e => setInterviewTime(e.target.value)}
                      className="w-2/3 px-2 py-2 border border-slate-300 rounded-xl"
                    />
                    <select
                      value={timeZone}
                      onChange={e => setTimeZone(e.target.value as any)}
                      className="w-1/3 px-1.5 py-2 border border-slate-300 rounded-xl bg-white"
                    >
                      <option value="WIB">WIB</option>
                      <option value="WITA">WITA</option>
                      <option value="WIT">WIT</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Metode</label>
                  <select
                    value={locationType}
                    onChange={e => setLocationType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="online">Online (Video Meeting)</option>
                    <option value="offline">Offline (Tatap Muka)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Pewawancara</label>
                  <input
                    type="text"
                    required
                    value={interviewerName}
                    onChange={e => setInterviewerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautan Google Meet / Alamat Ruang Kantor
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://meet.google.com/xxx atau Ruang Meeting Lt. 8"
                  value={meetingLinkOrLocation}
                  onChange={e => setMeetingLinkOrLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Persiapan</label>
                <textarea
                  rows={2}
                  placeholder="Harap siapkan portofolio..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-3 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Evaluation Form */}
      {isEvaluationModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm sm:text-base">Evaluasi: {selectedInterview.candidateName}</h3>
              <button
                onClick={() => setIsEvaluationModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="p-4 sm:p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Skor Evaluasi Kompetensi (1 - 100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={evalScore}
                    onChange={e => setEvalScore(Number(e.target.value))}
                    className="flex-1 cursor-pointer"
                  />
                  <span className="font-black text-sm text-blue-700 w-10 text-right">{evalScore}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Evaluasi / Rekomendasi
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Kandidat menguasai konsep BEI dengan baik..."
                  value={evalNotes}
                  onChange={e => setEvalNotes(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-3 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingEval}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingEval ? 'Menyimpan...' : 'Simpan Nilai'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
