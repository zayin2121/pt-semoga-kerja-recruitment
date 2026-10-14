import React, { useState } from 'react';
import { Briefcase, Search, MapPin, Clock, Filter, ArrowRight, CheckCircle2, AlertTriangle, RotateCcw, Layers } from 'lucide-react';
import { Job, Application } from '../types/recruitment';
import { JOB_CATEGORIES, JOB_LOCATIONS, isDepartmentMatch } from '../constants/jobCategories';

interface JobListProps {
  jobs: Job[];
  candidateApplications?: Application[];
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const JobList: React.FC<JobListProps> = ({
  jobs,
  candidateApplications = [],
  onSelectJob,
  onApplyJob,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const publishedJobs = jobs.filter(j => j.status === 'published');
  
  // Combine predefined categories with any custom departments existing in published jobs
  const customDepts = publishedJobs.map(j => j.department).filter(Boolean);
  const allDepartments = Array.from(new Set([...JOB_CATEGORIES, ...customDepts]));
  
  const types = ['all', 'Full-time', 'Contract', 'Internship', 'Part-time'];
  const allLocations = Array.from(new Set([...JOB_LOCATIONS, ...publishedJobs.map(j => j.location).filter(Boolean)]));

  const filteredJobs = publishedJobs.filter(job => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      job.title.toLowerCase().includes(term) ||
      job.description.toLowerCase().includes(term) ||
      job.department.toLowerCase().includes(term) ||
      (job.requirementsMandatory || []).some(req => req.toLowerCase().includes(term));
    
    const matchesDept = isDepartmentMatch(job.department, deptFilter);
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    const matchesLoc = locationFilter === 'all' || job.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesDept && matchesType && matchesLoc;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Lowongan Pekerjaan
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">
          Jelajahi posisi yang sedang dibuka di PT Semoga Kerja. Gunakan pencarian dan filter kategori di bawah untuk menemukan posisi yang sesuai dengan keahlian Anda.
        </p>
      </div>

      {/* Responsive Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        {/* Quick Category Pills / Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Kategori Populer:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar scroll-smooth">
            <button
              onClick={() => setDeptFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                deptFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              Semua Kategori
            </button>
            {JOB_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setDeptFilter(deptFilter === cat ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  deptFilter === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari posisi, kata kunci, keahlian..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-700"
            >
              <option value="all">Semua Departemen / Kategori</option>
              {allDepartments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-700"
            >
              <option value="all">Semua Tipe Pekerjaan</option>
              {types.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-700"
            >
              <option value="all">Semua Lokasi</option>
              {allLocations.map(l => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips / Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span>Menampilkan <strong>{filteredJobs.length}</strong> posisi lowongan aktif</span>
            {deptFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200">
                Kategori: {deptFilter}
              </span>
            )}
          </div>
          {(searchTerm || deptFilter !== 'all' || typeFilter !== 'all' || locationFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setDeptFilter('all');
                setTypeFilter('all');
                setLocationFilter('all');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Jobs Grid */}
      {publishedJobs.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7 text-blue-600" />
          </div>
          <h3 className="text-slate-900 font-extrabold text-base sm:text-lg">
            Belum Ada Lowongan yang Dibuka
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            Saat ini PT Semoga Kerja belum mempublikasikan lowongan pekerjaan baru. Lowongan resmi akan langsung muncul setelah diunggah oleh akun HRD.
          </p>
          <div className="pt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
              Silakan periksa kembali secara berkala
            </span>
          </div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-slate-800 font-bold text-sm sm:text-base">Tidak ada lowongan yang cocok</h3>
          <p className="text-slate-500 text-xs mt-1">Coba sesuaikan kata kunci pencarian atau ubah filter Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredJobs.map(job => {
            const isDeadlineClose = () => {
              if (!job.deadline) return false;
              const daysLeft = Math.ceil(
                (new Date(job.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );
              return daysLeft >= 0 && daysLeft <= 7;
            };
            const alreadyApplied = candidateApplications.some(a => a.jobId === job.id && !a.allowReapply);

            return (
              <div
                key={job.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
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

                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-3.5">
                    {job.description}
                  </p>

                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Kualifikasi Utama:
                    </span>
                    <ul className="space-y-1">
                      {job.requirementsMandatory?.slice(0, 2).map((req, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Batas: {new Date(job.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {isDeadlineClose() && (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Segera Berakhir
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-4 mt-3 border-t border-slate-100">
                  <div>
                    {alreadyApplied && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        <span>Sudah Dilamar</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => onSelectJob(job)}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    >
                      Detail
                    </button>
                    {alreadyApplied ? (
                      <button
                        onClick={() => onSelectJob(job)}
                        className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Lihat Status
                      </button>
                    ) : (
                      <button
                        onClick={() => onApplyJob(job)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Lamar</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
