import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Check,
  Search,
  Filter,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Job, JobStatus, JobType, ScreeningCriterion } from '../../types/recruitment';
import { createJob, updateJob, deleteJob } from '../../services/jobService';
import { logAudit } from '../../services/auditService';
import { JOB_CATEGORIES, JOB_LOCATIONS, isDepartmentMatch } from '../../constants/jobCategories';

interface HrdJobsTabProps {
  jobs: Job[];
  onRefreshJobs: () => Promise<void>;
  currentUserEmail?: string;
}

export const HrdJobsTab: React.FC<HrdJobsTabProps> = ({
  jobs,
  onRefreshJobs,
  currentUserEmail,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [searchJobTerm, setSearchJobTerm] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Human Resource');
  const [isCustomDept, setIsCustomDept] = useState(false);
  const [location, setLocation] = useState('Jakarta Selatan (Hybrid)');
  const [type, setType] = useState<JobType>('Full-time');
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [mandatoryReqText, setMandatoryReqText] = useState('');
  const [optionalReqText, setOptionalReqText] = useState('');
  const [deadline, setDeadline] = useState('2026-11-30');
  const [status, setStatus] = useState<JobStatus>('published');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const openCreateModal = () => {
    setEditingJob(null);
    setTitle('');
    setDepartment('Human Resource');
    setIsCustomDept(false);
    setLocation('Jakarta Selatan (Hybrid)');
    setType('Full-time');
    setDescription('');
    setResponsibilitiesText('');
    setMandatoryReqText('');
    setOptionalReqText('');
    setDeadline('2026-12-31');
    setStatus('published');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (job: Job) => {
    setEditingJob(job);
    setTitle(job.title);
    setDepartment(job.department);
    setIsCustomDept(!JOB_CATEGORIES.includes(job.department as any));
    setLocation(job.location);
    setType(job.type);
    setDescription(job.description);
    setResponsibilitiesText((job.responsibilities || []).join('\n'));
    setMandatoryReqText((job.requirementsMandatory || []).join('\n'));
    setOptionalReqText((job.requirementsOptional || []).join('\n'));
    setDeadline(job.deadline || '2026-12-31');
    setStatus(job.status);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError('Judul lowongan dan deskripsi wajib diisi.');
      return;
    }
    setIsSaving(true);
    setFormError('');

    const responsibilities = responsibilitiesText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);
    const requirementsMandatory = mandatoryReqText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);
    const requirementsOptional = optionalReqText
      .split('\n')
      .map(r => r.trim())
      .filter(Boolean);

    const screeningCriteria: ScreeningCriterion[] = [
      ...requirementsMandatory.map((req, i) => ({
        id: `m-${i}`,
        label: req,
        type: 'mandatory' as const,
        weight: 10,
        keywords: req.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 3),
      })),
      ...requirementsOptional.map((req, i) => ({
        id: `o-${i}`,
        label: req,
        type: 'optional' as const,
        weight: 5,
        keywords: req.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3).slice(0, 3),
      })),
    ];

    try {
      if (editingJob) {
        await updateJob(editingJob.id, {
          title,
          department,
          location,
          type,
          description,
          responsibilities,
          requirementsMandatory,
          requirementsOptional,
          screeningCriteria,
          deadline,
          status,
        });
        await logAudit('UPDATE_JOB', `Memperbarui lowongan: ${title} (${editingJob.id})`, editingJob.id, currentUserEmail);
      } else {
        const created = await createJob({
          title,
          department,
          location,
          type,
          description,
          responsibilities,
          requirementsMandatory,
          requirementsOptional,
          screeningCriteria,
          deadline,
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: currentUserEmail || 'HR Staff',
          isDemo: false,
        });
        await logAudit('CREATE_JOB', `Membuat lowongan baru: ${title}`, created?.id, currentUserEmail);
      }
      await onRefreshJobs();
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error saving job:', err);
      setFormError(err?.message || 'Gagal menyimpan lowongan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteJob = async (job: Job) => {
    try {
      await deleteJob(job.id);
      await logAudit('DELETE_JOB', `Menghapus lowongan: ${job.title}`, job.id, currentUserEmail);
      await onRefreshJobs();
    } catch (err) {
      console.error('Gagal menghapus lowongan:', err);
    }
  };

  const handleToggleStatus = async (job: Job, newStatus: JobStatus) => {
    try {
      await updateJob(job.id, { status: newStatus });
      await logAudit('CHANGE_JOB_STATUS', `Mengubah status lowongan ${job.title} menjadi ${newStatus}`, job.id, currentUserEmail);
      await onRefreshJobs();
    } catch (err) {
      console.error('Gagal mengubah status lowongan:', err);
    }
  };

  // Unique departments for filter
  const allHrdDepartments = Array.from(new Set([...JOB_CATEGORIES, ...jobs.map(j => j.department).filter(Boolean)]));

  const filteredJobs = jobs.filter(j => {
    const matchesStatus = filterStatus === 'all' || j.status === filterStatus;
    const matchesDept = isDepartmentMatch(j.department, filterDept);
    const term = searchJobTerm.toLowerCase();
    const matchesSearch =
      !searchJobTerm.trim() ||
      j.title.toLowerCase().includes(term) ||
      j.department.toLowerCase().includes(term) ||
      j.location.toLowerCase().includes(term);
    return matchesStatus && matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manajemen Lowongan Pekerjaan</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola lowongan aktif, kualifikasi screening berbobot, tenggat waktu, dan draft posisi.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Lowongan Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar for HRD */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Semua ({jobs.length})
            </button>
            <button
              onClick={() => setFilterStatus('published')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                filterStatus === 'published'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Dipublikasikan ({jobs.filter(j => j.status === 'published').length})
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                filterStatus === 'closed'
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Ditutup ({jobs.filter(j => j.status === 'closed').length})
            </button>
            <button
              onClick={() => setFilterStatus('draft')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                filterStatus === 'draft'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Draft ({jobs.filter(j => j.status === 'draft').length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari posisi atau lokasi..."
                value={searchJobTerm}
                onChange={e => setSearchJobTerm(e.target.value)}
                className="w-full pl-8.5 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              className="w-full sm:w-48 py-1.5 px-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white text-slate-700"
            >
              <option value="all">Semua Kategori</option>
              {allHrdDepartments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {(searchJobTerm || filterDept !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchJobTerm('');
                  setFilterDept('all');
                  setFilterStatus('all');
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold p-1.5 flex items-center gap-1 cursor-pointer shrink-0"
                title="Reset Filter"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Jobs Table or Empty State */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-14 text-center border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Briefcase className="w-7 h-7 text-blue-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-slate-900 font-extrabold text-base sm:text-lg">
              Belum Ada Lowongan Pekerjaan
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Daftar lowongan saat ini masih kosong. Klik tombol di bawah untuk mulai mengunggah posisi pekerjaan. Lowongan yang Anda publikasikan akan langsung muncul di portal karir kandidat.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lowongan Baru</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Posisi & Departemen</th>
                  <th className="px-4 py-3.5">Lokasi & Tipe</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Tenggat Waktu</th>
                  <th className="px-4 py-3.5">Kriteria Screening</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Tidak ada data lowongan pada filter ini.
                    </td>
                  </tr>
                ) : (
                filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{job.title}</span>
                        {job.isDemo && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                            DEMO
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{job.department}</span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-slate-800">{job.location}</p>
                      <span className="text-[11px] text-slate-500">{job.type}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          job.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : job.status === 'closed'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            job.status === 'published'
                              ? 'bg-emerald-500'
                              : job.status === 'closed'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        ></span>
                        {job.status === 'published'
                          ? 'Aktif / Buka'
                          : job.status === 'closed'
                          ? 'Ditutup'
                          : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-slate-800 font-medium">
                        {job.requirementsMandatory?.length || 0} Wajib • {job.requirementsOptional?.length || 0} Tambahan
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {job.status === 'published' ? (
                          <button
                            onClick={() => handleToggleStatus(job, 'closed')}
                            className="px-2 py-1 text-[11px] text-amber-700 hover:bg-amber-50 rounded-lg border border-amber-200 font-medium transition-colors cursor-pointer"
                          >
                            Tutup
                          </button>
                        ) : job.status === 'closed' ? (
                          <button
                            onClick={() => handleToggleStatus(job, 'published')}
                            className="px-2 py-1 text-[11px] text-emerald-700 hover:bg-emerald-50 rounded-lg border border-emerald-200 font-medium transition-colors cursor-pointer"
                          >
                            Buka
                          </button>
                        ) : null}
                        <button
                          onClick={() => openEditModal(job)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Lowongan"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Modal Create / Edit Job */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 className="font-bold text-sm sm:text-base">
                {editingJob ? `Edit Lowongan: ${editingJob.title}` : 'Buat Lowongan Pekerjaan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Judul Jabatan / Posisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Recruitment Staff"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Enhanced Department / Category Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Kategori / Departemen <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomDept(!isCustomDept)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                      {isCustomDept ? 'Pilih dari Standar' : '+ Kategori Kustom'}
                    </button>
                  </div>

                  {!isCustomDept ? (
                    <select
                      value={JOB_CATEGORIES.includes(department as any) ? department : 'Lainnya'}
                      onChange={e => {
                        if (e.target.value === 'Lainnya') {
                          setIsCustomDept(true);
                        } else {
                          setDepartment(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {JOB_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="Lainnya">+ Kategori Lainnya (Ketik Manual)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Ketik kategori departemen spesifik..."
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}

                  {/* Quick Category Chips for 1-click selection */}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {JOB_CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setDepartment(cat);
                          setIsCustomDept(false);
                        }}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors cursor-pointer border ${
                          department === cat && !isCustomDept
                            ? 'bg-blue-600 text-white border-blue-600 font-bold'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enhanced Location Selector */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lokasi Kerja <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Jakarta Selatan (Hybrid)"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {/* Quick Location Chips */}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {JOB_LOCATIONS.slice(0, 4).map(loc => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className={`px-2 py-0.5 rounded-md text-[10px] transition-colors cursor-pointer border ${
                          location === loc
                            ? 'bg-blue-100 text-blue-800 border-blue-300 font-semibold'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Pekerjaan</label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as JobType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenggat Waktu</label>
                  <input
                    type="date"
                    required
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Publikasi</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as JobStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="published">Dipublikasikan (Buka)</option>
                    <option value="draft">Draft (Belum Tampil)</option>
                    <option value="closed">Ditutup</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pekerjaan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan peran kerja dan kontribusi posisi ini..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggung Jawab Utama (1 per baris)
                </label>
                <textarea
                  rows={3}
                  placeholder="Tanggung jawab 1&#10;Tanggung jawab 2"
                  value={responsibilitiesText}
                  onChange={e => setResponsibilitiesText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block font-semibold text-blue-800 mb-1">
                    Kualifikasi Wajib (1 per baris) • Bobot 70%
                  </label>
                  <textarea
                    rows={4}
                    placeholder="S1 Psikologi / Manajemen&#10;Pengalaman rekrutmen minimal 1 tahun&#10;Menguasai BEI"
                    value={mandatoryReqText}
                    onChange={e => setMandatoryReqText(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kualifikasi Tambahan (1 per baris) • Bobot 30%
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Kemahiran ATS&#10;Bahasa Inggris aktif"
                    value={optionalReqText}
                    onChange={e => setOptionalReqText(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Lowongan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
