import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCheck,
  Check,
  Building2,
} from 'lucide-react';
import { Job } from '../types/recruitment';
import { Logo } from './Logo';
import { JOB_CATEGORIES, isDepartmentMatch } from '../constants/jobCategories';

interface CareerHomeProps {
  jobs: Job[];
  onSelectJob: (job: Job) => void;
  onExploreAllJobs: () => void;
  onOpenPrivacy: () => void;
}

export const CareerHome: React.FC<CareerHomeProps> = ({
  jobs,
  onSelectJob,
  onExploreAllJobs,
  onOpenPrivacy,
}) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedDept, setSelectedDept] = useState('Semua');

  const publishedJobs = jobs.filter(j => j.status === 'published');
  const customDepts = publishedJobs.map(j => j.department).filter(Boolean);
  const departments = ['Semua', ...Array.from(new Set([...JOB_CATEGORIES, ...customDepts]))];

  const filteredJobs = publishedJobs.filter(job => {
    const term = searchKeyword.toLowerCase();
    const matchesKeyword =
      !searchKeyword.trim() ||
      job.title.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term) ||
      job.department.toLowerCase().includes(term);
    const matchesDept = isDepartmentMatch(job.department, selectedDept);
    return matchesKeyword && matchesDept;
  });

  return (
    <div className="space-y-12 sm:space-y-16 lg:space-y-20 pb-16 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-12 sm:py-20 lg:py-24 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 sm:space-y-6">
            {/* Official Badge with mini logo emblem */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/90 border border-blue-800/80 text-blue-300 text-xs font-semibold shadow-xs">
              <Logo variant="dark" size="sm" symbolOnly className="w-4 h-4" />
              <span className="truncate">Portal Karir Resmi PT Semoga Kerja</span>
            </div>

            {/* Responsive Main Heading with balanced line-height and wrap */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight sm:leading-tight">
              Bangun Masa Depan Profesional Bersama Tim Unggul
            </h1>

            {/* Description with proper reading width */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-300 leading-relaxed sm:leading-relaxed max-w-2xl">
              Kami membuka kesempatan bagi para talenta berdedikasi untuk bertumbuh, berinovasi, dan memberikan dampak nyata dalam ekosistem kerja yang profesional, sehat, dan berorientasi hasil.
            </p>

            {/* Responsive Quick Search Box - Stacks cleanly on mobile, horizontal on tablet/desktop */}
            <div className="space-y-3">
              <div className="bg-slate-800/90 p-2.5 sm:p-3.5 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-sm flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari posisi kerja (cth: Recruitment, IT, Data)..."
                    value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900/95 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-900/95 border border-slate-700 rounded-xl text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
                >
                  {departments.map(d => (
                    <option key={d} value={d}>
                      {d === 'Semua' ? 'Semua Kategori' : d}
                    </option>
                  ))}
                </select>

                <button
                  onClick={onExploreAllJobs}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shrink-0 flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Cari Lowongan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Category Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
                <span className="text-[11px] font-medium text-slate-400">Pilihan Populer:</span>
                {JOB_CATEGORIES.slice(0, 5).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedDept(cat);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
                      selectedDept === cat
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-1.5 sm:space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
            Nilai Perusahaan
          </span>
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mengapa Berkarir di PT Semoga Kerja?
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Komitmen kami untuk menciptakan lingkungan kerja yang suportif, transparan, dan menghargai setiap kontribusi talenta.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">
              Apresiasi & Jenjang Karir Jelas
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Jalur karir berbasis kompetensi dan pencapaian nyata dengan sistem evaluasi berkala yang objektif dan transparan.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">
              Budaya Kolaboratif & Terbuka
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Lingkungan kerja yang menghargai keberagaman pemikiran, komunikasi jujur, dan kerja sama lintas divisi yang solid.
            </p>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5">
              Keamanan & Kesejahteraan
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Perlindungan jaminan sosial ketenagakerjaan dan kesehatan lengkap, jam kerja seimbang, serta kepatuhan hukum penuh.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Lowongan Pekerjaan Terbaru
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
              Temukan posisi yang sesuai dengan keahlian dan aspirasi karir Anda.
            </p>
          </div>
          <button
            onClick={onExploreAllJobs}
            className="text-blue-600 hover:text-blue-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Lihat Semua Lowongan ({publishedJobs.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {publishedJobs.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center border border-slate-200 shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-slate-900 font-extrabold text-base sm:text-lg">
              Belum Ada Lowongan yang Dibuka
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Saat ini PT Semoga Kerja belum mempublikasikan lowongan pekerjaan baru. Seluruh lowongan resmi akan langsung ditampilkan di halaman ini setelah diunggah oleh tim HRD.
            </p>
            <div className="pt-2">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
                Pembaruan akan ditampilkan secara real-time
              </span>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
            <Briefcase className="w-10 h-10 text-slate-400 mx-auto mb-2.5" />
            <h3 className="text-slate-800 font-bold text-sm sm:text-base">Tidak ada lowongan yang cocok</h3>
            <p className="text-slate-500 text-xs mt-1">Coba gunakan kata kunci lain atau pilih semua departemen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredJobs.slice(0, 4).map(job => (
              <div
                key={job.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {job.department}
                      </span>
                      <h3
                        onClick={() => onSelectJob(job)}
                        className="text-base sm:text-lg font-bold text-slate-900 mt-1.5 cursor-pointer hover:text-blue-600 transition-colors leading-snug"
                      >
                        {job.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                      {job.type}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs line-clamp-2 mb-3.5 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 mb-5">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Batas: {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100">
                  <span className="text-[11px] text-slate-500">
                    {job.requirementsMandatory?.length || 0} Kualifikasi Utama
                  </span>
                  <button
                    onClick={() => onSelectJob(job)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <span>Lihat & Lamar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recruitment Workflow Section */}
      <section id="tahapan-seleksi" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
          <div className="max-w-2xl mb-8 sm:mb-10 space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Transparansi Rekrutmen
            </span>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
              Alur Proses Seleksi Terstruktur
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Setiap lamaran yang masuk ditinjau secara teliti oleh tim rekrutmen PT Semoga Kerja dengan tahapan yang adil dan terdokumentasi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center mb-3">
                1
              </span>
              <h4 className="font-bold text-sm text-white mb-1">Pengiriman Berkas</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pelamar mengisi formulir online dan mengunggah CV (format PDF/DOCX). Sistem mengirimkan konfirmasi penerimaan instan.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center mb-3">
                2
              </span>
              <h4 className="font-bold text-sm text-white mb-1">Screening Kualifikasi</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Peninjauan kualifikasi wajib dan kecocokan profil oleh tim HRD menggunakan modul screening transparan.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center mb-3">
                3
              </span>
              <h4 className="font-bold text-sm text-white mb-1">Wawancara & Asesmen</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kandidat terpilih dijadwalkan untuk wawancara kompetensi dengan HRD dan hiring manager secara online atau offline.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center mb-3">
                4
              </span>
              <h4 className="font-bold text-sm text-white mb-1">Offering & Onboarding</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Penawaran kerja resmi (Offering Letter) dan pendampingan pengenalan budaya kerja awal di PT Semoga Kerja.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
