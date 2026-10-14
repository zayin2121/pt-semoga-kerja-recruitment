import React, { useState } from 'react';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { Job, Application, CandidateUser } from '../types/recruitment';
import { extractCvText } from '../services/screeningService';
import { submitCandidateApplication, isValidIndonesianPhone, isValidEmail } from '../services/applicationService';

interface ApplicationFormModalProps {
  job: Job;
  candidateUser?: CandidateUser | null;
  onClose: () => void;
  onSuccess: (application: Application) => void;
  onOpenPrivacy: () => void;
}

export const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  job,
  candidateUser,
  onClose,
  onSuccess,
  onOpenPrivacy,
}) => {
  const [fullName, setFullName] = useState(candidateUser?.displayName || '');
  const [email, setEmail] = useState(candidateUser?.email || '');
  const [phone, setPhone] = useState('');
  const [domicile, setDomicile] = useState('');
  const [educationLevel, setEducationLevel] = useState('S1');
  const [major, setMajor] = useState('');
  const [experienceSummary, setExperienceSummary] = useState('');
  const [skills, setSkills] = useState<string[]>(['Komunikasi', 'Problem Solving']);
  const [skillInput, setSkillInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [additionalAnswers, setAdditionalAnswers] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // File state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsingCv, setIsParsingCv] = useState(false);
  const [extractedCvText, setExtractedCvText] = useState('');
  const [extractionQuality, setExtractionQuality] = useState<'clean' | 'partial' | 'manual_review'>('clean');
  const [fileError, setFileError] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('Ukuran berkas melebihi batas maksimum 5MB.');
      setResumeFile(null);
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setFileError('Format berkas tidak didukung. Harap unggah berkas PDF atau DOCX.');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    setIsParsingCv(true);

    try {
      const { text, status } = await extractCvText(file);
      setExtractedCvText(text);
      setExtractionQuality(status);

      if (text) {
        const potentialSkills = ['excel', 'spreadsheet', 'komunikasi', 'rekrutmen', 'administrasi', 'bahasa inggris', 'bpjs', 'akuntansi', 'analisis'];
        potentialSkills.forEach(ps => {
          if (text.toLowerCase().includes(ps) && !skills.some(s => s.toLowerCase() === ps)) {
            setSkills(prev => [...prev, ps.charAt(0).toUpperCase() + ps.slice(1)]);
          }
        });
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setExtractionQuality('manual_review');
    } finally {
      setIsParsingCv(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!resumeFile) {
      setErrorMessage('Mohon unggah berkas CV Anda terlebih dahulu.');
      return;
    }
    if (!isValidEmail(email)) {
      setErrorMessage('Format alamat email tidak valid.');
      return;
    }
    if (!isValidIndonesianPhone(phone)) {
      setErrorMessage('Nomor WhatsApp harus nomor Indonesia yang valid (cth: 081234567890 atau +6281234567890).');
      return;
    }
    if (!privacyAccepted) {
      setErrorMessage('Anda wajib menyetujui Kebijakan Privasi dan Pemrosesan Data.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitCandidateApplication({
        job,
        candidateUid: candidateUser?.uid,
        fullName,
        email,
        phone,
        domicile,
        educationLevel,
        major,
        experienceSummary,
        skills,
        resumeFile,
        resumeExtractedText: extractedCvText,
        extractionQuality,
        portfolioUrl,
        additionalAnswers,
        privacyAccepted,
      });

      if (!response.success || !response.application) {
        setErrorMessage(response.error || 'Terjadi kesalahan saat memproses lamaran.');
        setIsSubmitting(false);
        return;
      }

      onSuccess(response.application);
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMessage(err?.message || 'Gagal mengirim lamaran ke server.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-start justify-between gap-3 border-b border-slate-800">
          <div className="min-w-0">
            <span className="inline-block text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold mb-1">
              Formulir Lamaran Resmi
            </span>
            <h2 className="text-base sm:text-xl font-black text-white truncate leading-snug">
              Melamar: {job.title}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              PT Semoga Kerja • {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 text-xs sm:text-sm">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Data Pribadi & Kontak */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              1. Identitas & Kontak Pelamar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Konfirmasi resmi tanda terima akan dikirimkan ke alamat email ini.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kota Domisili Saat Ini <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Jakarta Selatan / Tangerang"
                  value={domicile}
                  onChange={e => setDomicile(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Latar Belakang Pendidikan & Pengalaman */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              2. Pendidikan & Riwayat Pengalaman
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pendidikan Terakhir <span className="text-red-500">*</span>
                </label>
                <select
                  value={educationLevel}
                  onChange={e => setEducationLevel(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="SMA/SMK">SMA / SMK Sederajat</option>
                  <option value="D3">Diploma 3 (D3)</option>
                  <option value="D4">Diploma 4 (D4)</option>
                  <option value="S1">Sarjana (S1)</option>
                  <option value="S2">Magister (S2)</option>
                  <option value="S3">Doktor (S3)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Program Studi / Jurusan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Psikologi / Manajemen / Akuntansi"
                  value={major}
                  onChange={e => setMajor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ringkasan Pengalaman Kerja, Magang, atau Proyek Relevan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Jelaskan peran kerja terakhir atau proyek utama yang pernah Anda kerjakan..."
                value={experienceSummary}
                onChange={e => setExperienceSummary(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Skills Tag Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterampilan & Kompetensi Utama <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ketik keahlian (cth: BEI, Excel, Brevet)..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {skills.map(s => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-blue-500 hover:text-blue-800 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Unggah CV (PDF/DOCX) */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5">
              3. Unggah Berkas Resume / CV
            </h3>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-5 sm:p-6 text-center transition-colors bg-slate-50/60">
              <input
                type="file"
                id="cv-upload"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="cv-upload" className="cursor-pointer block">
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mx-auto mb-2" />
                <span className="font-bold text-xs sm:text-sm text-blue-600 hover:underline block mb-1">
                  Pilih file CV dari perangkat Anda
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 block">
                  Format PDF atau DOCX (Maksimal 5 MB)
                </span>
              </label>

              {fileError && (
                <p className="text-xs text-red-600 mt-2 font-medium flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}

              {isParsingCv && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-blue-600 font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengekstrak dan memverifikasi isi teks CV...</span>
                </div>
              )}

              {resumeFile && !isParsingCv && (
                <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl text-left flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">{resumeFile.name}</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500">
                        {(resumeFile.size / 1024).toFixed(1)} KB • Ekstraksi:{' '}
                        {extractionQuality === 'clean' ? (
                          <span className="text-emerald-600 font-semibold">Teks Terbaca Jelas</span>
                        ) : extractionQuality === 'partial' ? (
                          <span className="text-amber-600 font-semibold">Sebagian Teks</span>
                        ) : (
                          <span className="text-slate-600 font-semibold">Pemeriksaan Manual (Scan)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeFile(null);
                      setExtractedCvText('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tautan Portofolio / LinkedIn (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Waktu Kesiapan Bergabung (Notice Period)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Segera / 1 bulan"
                  value={additionalAnswers}
                  onChange={e => setAdditionalAnswers(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Kebijakan Privasi & Persetujuan */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-xl border border-slate-200">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="privacy-checkbox"
                checked={privacyAccepted}
                onChange={e => setPrivacyAccepted(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
              />
              <label htmlFor="privacy-checkbox" className="text-[11px] sm:text-xs text-slate-600 cursor-pointer leading-relaxed">
                Saya menyatakan bahwa seluruh data dan dokumen yang saya berikan adalah benar. Saya menyetujui pemrosesan data pribadi saya untuk seleksi kerja sesuai dengan{' '}
                <button
                  type="button"
                  onClick={onOpenPrivacy}
                  className="text-blue-600 hover:underline font-bold inline-flex items-center gap-0.5"
                >
                  Kebijakan Privasi PT Semoga Kerja
                  <ExternalLink className="w-3 h-3" />
                </button>
                . Data disimpan secara privat dan terlindungi.
              </label>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Batalkan
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !privacyAccepted}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer ml-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Lamaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Kirim Lamaran Pekerjaan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
