import React, { useState } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileSearch,
  Calendar,
  Mail,
  BarChart3,
  ShieldCheck,
  Settings,
  Terminal,
  LogOut,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { Job, Application, InterviewSchedule, EmailDeliveryLog, AuditLog, SystemSettings } from '../../types/recruitment';
import { HrdOverviewTab } from './HrdOverviewTab';
import { HrdJobsTab } from './HrdJobsTab';
import { HrdPipelineTab } from './HrdPipelineTab';
import { HrdScreeningTab } from './HrdScreeningTab';
import { HrdInterviewsTab } from './HrdInterviewsTab';
import { HrdGmailTab } from './HrdGmailTab';
import { HrdReportsTab } from './HrdReportsTab';
import { HrdAuditTab } from './HrdAuditTab';
import { HrdSettingsTab } from './HrdSettingsTab';
import { HrdTestingTab } from './HrdTestingTab';
import { Logo } from '../Logo';

interface HrdDashboardProps {
  jobs: Job[];
  applications: Application[];
  interviews: InterviewSchedule[];
  emailLogs: EmailDeliveryLog[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  onRefreshJobs: () => Promise<void>;
  onRefreshApplications: () => Promise<void>;
  onRefreshInterviews: () => Promise<void>;
  onRefreshEmailLogs: () => Promise<void>;
  onRefreshAuditLogs: () => Promise<void>;
  onRefreshSettings: () => Promise<void>;
  onLogout: () => void;
  onReturnToCareerSite: () => void;
  currentUserEmail?: string;
}

export const HrdDashboard: React.FC<HrdDashboardProps> = ({
  jobs,
  applications,
  interviews,
  emailLogs,
  auditLogs,
  settings,
  onRefreshJobs,
  onRefreshApplications,
  onRefreshInterviews,
  onRefreshEmailLogs,
  onRefreshAuditLogs,
  onRefreshSettings,
  onLogout,
  onReturnToCareerSite,
  currentUserEmail,
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [scheduledCandidate, setScheduledCandidate] = useState<Application | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const handleOpenScheduleForCandidate = (cand: Application) => {
    setScheduledCandidate(cand);
    setActiveTab('interviews');
    setIsMobileSidebarOpen(false);
  };

  const navItems = [
    { id: 'overview', label: 'Ringkasan & KPI', icon: LayoutDashboard },
    { id: 'jobs', label: 'Kelola Lowongan', icon: Briefcase, count: jobs.length },
    { id: 'pipeline', label: 'Pipeline Pelamar', icon: Users, count: applications.length },
    { id: 'screening', label: 'Screening CV', icon: FileSearch },
    { id: 'interviews', label: 'Jadwal Wawancara', icon: Calendar, count: interviews.length },
    { id: 'gmail', label: 'Gmail API & Log', icon: Mail, count: emailLogs.filter(e => e.status === 'failed').length > 0 ? '!' : undefined },
    { id: 'reports', label: 'Laporan & Ekspor', icon: BarChart3 },
    { id: 'audit', label: 'Audit Trail', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan & Retensi', icon: Settings },
    { id: 'testing', label: 'Pengujian QA Sistem', icon: Terminal, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header for Dashboard */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-3.5 flex items-center justify-between text-white sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Logo variant="dark" size="sm" symbolOnly />
          <div>
            <span className="font-bold text-xs block leading-tight">PT Semoga Kerja</span>
            <span className="text-[10px] text-blue-400 block">ATS Dashboard</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToCareerSite}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg text-xs"
            title="Ke Website Karir"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 rounded-lg text-xs"
            aria-label="Menu"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop and Mobile Drawer */}
      <aside
        className={`w-full md:w-64 bg-slate-900 text-white shrink-0 flex flex-col justify-between border-r border-slate-800 z-20 ${
          isMobileSidebarOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Logo & Brand Header */}
          <div className="p-4 sm:p-5 border-b border-slate-800">
            <Logo
              variant="dark"
              size="sm"
              subtitle="ATS & HRD Dashboard"
            />
          </div>

          <div className="p-3">
            <button
              onClick={onReturnToCareerSite}
              className="w-full px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
              <span>Lihat Website Karir</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : item.highlight
                      ? 'text-emerald-400 hover:bg-slate-800/80 hover:text-emerald-300'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : item.count === '!'
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="truncate mr-2">
              <span className="text-[11px] font-bold text-white block truncate">
                {currentUserEmail || 'HR Administrator'}
              </span>
              <span className="text-[10px] text-emerald-400 block">Akun Terautentikasi</span>
            </div>
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'overview' && (
            <HrdOverviewTab
              jobs={jobs}
              applications={applications}
              interviews={interviews}
              emailLogs={emailLogs}
              onNavigateTab={tab => setActiveTab(tab)}
            />
          )}

          {activeTab === 'jobs' && (
            <HrdJobsTab
              jobs={jobs}
              onRefreshJobs={onRefreshJobs}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeTab === 'pipeline' && (
            <HrdPipelineTab
              applications={applications}
              jobs={jobs}
              onRefreshApplications={onRefreshApplications}
              onScheduleInterview={handleOpenScheduleForCandidate}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeTab === 'screening' && (
            <HrdScreeningTab
              applications={applications}
              jobs={jobs}
              onOpenCandidateDetail={() => {
                setActiveTab('pipeline');
              }}
            />
          )}

          {activeTab === 'interviews' && (
            <HrdInterviewsTab
              interviews={interviews}
              applications={applications}
              jobs={jobs}
              onRefreshInterviews={onRefreshInterviews}
              currentUserEmail={currentUserEmail}
              defaultCandidateForModal={scheduledCandidate}
              onClearDefaultCandidate={() => setScheduledCandidate(null)}
            />
          )}

          {activeTab === 'gmail' && (
            <HrdGmailTab
              emailLogs={emailLogs}
              onRefreshEmailLogs={onRefreshEmailLogs}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeTab === 'reports' && (
            <HrdReportsTab
              applications={applications}
              jobs={jobs}
              currentUserEmail={currentUserEmail}
            />
          )}

          {activeTab === 'audit' && (
            <HrdAuditTab
              auditLogs={auditLogs}
              onRefreshLogs={onRefreshAuditLogs}
            />
          )}

          {activeTab === 'settings' && (
            <HrdSettingsTab
              settings={settings}
              onRefreshSettings={onRefreshSettings}
              currentUserEmail={currentUserEmail}
              onRefreshApplications={onRefreshApplications}
            />
          )}

          {activeTab === 'testing' && (
            <HrdTestingTab jobs={jobs} />
          )}
        </div>
      </main>
    </div>
  );
};
