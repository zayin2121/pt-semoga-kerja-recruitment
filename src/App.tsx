import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CareerHome } from './components/CareerHome';
import { JobList } from './components/JobList';
import { JobDetailModal } from './components/JobDetailModal';
import { ApplicationFormModal } from './components/ApplicationFormModal';
import { ApplicationSuccessModal } from './components/ApplicationSuccessModal';
import { CheckStatusModal } from './components/CheckStatusModal';
import { PrivacyPolicyView } from './components/PrivacyPolicyView';
import { CandidateAuthView } from './components/candidate/CandidateAuthView';
import { CandidateProfileView } from './components/candidate/CandidateProfileView';
import { HrdLoginPage } from './components/hrd/HrdLoginPage';
import { HrdDashboard } from './components/hrd/HrdDashboard';
import { Logo } from './components/Logo';
import {
  Job,
  Application,
  InterviewSchedule,
  EmailDeliveryLog,
  AuditLog,
  SystemSettings,
  CandidateUser,
} from './types/recruitment';
import { getAllJobs, seedDemoJobsIfEmpty, cleanupDemoJobs } from './services/jobService';
import { getAllApplications, seedDemoApplicationsIfEmpty, getCandidateApplications } from './services/applicationService';
import { getAllInterviewSchedules } from './services/interviewService';
import { getEmailDeliveryLogs } from './services/emailService';
import { getAuditLogs } from './services/auditService';
import { getSystemSettings, DEFAULT_SYSTEM_SETTINGS } from './services/systemService';
import { initAuth, signOutUser, isUserHrd } from './services/authService';
import { testConnection } from './services/firebase';
import { Loader2 } from 'lucide-react';

export function App() {
  // Path-based routing state
  const [currentPath, setCurrentPath] = useState<string>(() => {
    const p = window.location.pathname;
    if (!p || p === '/') return '/lokerptsk';
    return p;
  });

  // Database records
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateApplications, setCandidateApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailDeliveryLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);

  // Modals & Selection
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<Job | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<Job | null>(null);
  const [submittedApplication, setSubmittedApplication] = useState<Application | null>(null);
  const [isCheckStatusOpen, setIsCheckStatusOpen] = useState(false);

  // Authentication State
  const [currentHrdUser, setCurrentHrdUser] = useState<any>(null);
  const [candidateUser, setCandidateUser] = useState<CandidateUser | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Router navigation helper
  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      setCurrentPath(!p || p === '/' ? '/lokerptsk' : p);
    };
    window.addEventListener('popstate', handlePopState);

    // Initial redirect if user opened root '/'
    if (window.location.pathname === '/' || window.location.pathname === '') {
      window.history.replaceState({}, '', '/lokerptsk');
      setCurrentPath('/lokerptsk');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Initial public data load and auth subscription
  useEffect(() => {
    let isMounted = true;
    async function bootstrap() {
      setIsInitialLoading(true);
      try {
        await testConnection();

        // Load public job listings and settings
        const initialJobs = await seedDemoJobsIfEmpty();
        const initialSettings = await getSystemSettings();
        if (isMounted) {
          setJobs(initialJobs);
          setSettings(initialSettings);
        }

        // Setup auth state listener
        const unsubscribe = initAuth(
          async (user) => {
            if (!isMounted) return;

            if (isUserHrd(user)) {
              setCurrentHrdUser(user);
              // Clean up any legacy demo jobs when authenticated as HRD
              cleanupDemoJobs().catch(e => console.warn('Cleanup demo jobs warning:', e));
              // Authorized HRD: load full recruitment pipeline and admin logs
              try {
                const loadedApps = await getAllApplications();
                const [loadedInterviews, loadedEmails, loadedAudits] = await Promise.all([
                  getAllInterviewSchedules(),
                  getEmailDeliveryLogs(),
                  getAuditLogs(),
                ]);
                if (isMounted) {
                  setApplications(loadedApps);
                  setInterviews(loadedInterviews);
                  setEmailLogs(loadedEmails);
                  setAuditLogs(loadedAudits);
                }
              } catch (hrdErr) {
                console.warn('HRD data loading warning:', hrdErr);
              }
            } else {
              // Standard candidate user: load strictly candidate's own data
              const candUser: CandidateUser = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || user.email?.split('@')[0] || 'Kandidat',
                provider: user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password',
              };
              setCurrentHrdUser(null);
              setCandidateUser(candUser);
              try {
                const myApps = await getCandidateApplications(candUser.uid);
                if (isMounted) {
                  setCandidateApplications(myApps);
                }
              } catch (candErr) {
                console.warn('Candidate application loading warning:', candErr);
              }
            }

            if (isMounted) {
              setIsInitialLoading(false);
            }
          },
          () => {
            if (!isMounted) return;
            setCurrentHrdUser(null);
            setCandidateUser(null);
            setCandidateApplications([]);
            setIsInitialLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        console.warn('Bootstrap initialization warning:', err);
        if (isMounted) setIsInitialLoading(false);
      }
    }

    const unsubPromise = bootstrap();
    return () => {
      isMounted = false;
      unsubPromise.then(unsub => unsub && unsub());
    };
  }, []);

  // Candidate applications: if logged in as candidate, return candidateApplications; if HRD, filter
  const myCandidateApplications = useMemo(() => {
    if (candidateApplications.length > 0) return candidateApplications;
    if (!candidateUser) return [];
    return applications.filter(
      app =>
        app.candidateUid === candidateUser.uid ||
        (candidateUser.email && app.email.toLowerCase() === candidateUser.email.toLowerCase())
    );
  }, [candidateApplications, applications, candidateUser]);

  // Data refresher functions
  const refreshJobs = async () => {
    try {
      const list = await getAllJobs();
      setJobs(list);
    } catch (e) {
      console.warn('Error refreshing jobs:', e);
    }
  };

  const refreshApplications = async () => {
    if (!currentHrdUser) return;
    try {
      const list = await getAllApplications();
      setApplications(list);
    } catch (e) {
      console.warn('Error refreshing applications:', e);
    }
  };

  const refreshInterviews = async () => {
    if (!currentHrdUser) return;
    try {
      const list = await getAllInterviewSchedules();
      setInterviews(list);
    } catch (e) {
      console.warn('Error refreshing interviews:', e);
    }
  };

  const refreshEmailLogs = async () => {
    if (!currentHrdUser) return;
    try {
      const list = await getEmailDeliveryLogs();
      setEmailLogs(list);
    } catch (e) {
      console.warn('Error refreshing email logs:', e);
    }
  };

  const refreshAuditLogs = async () => {
    if (!currentHrdUser) return;
    try {
      const list = await getAuditLogs();
      setAuditLogs(list);
    } catch (e) {
      console.warn('Error refreshing audit logs:', e);
    }
  };

  const refreshSettings = async () => {
    try {
      const s = await getSystemSettings();
      setSettings(s);
    } catch (e) {
      console.warn('Error refreshing settings:', e);
    }
  };

  const handleLogoutHrd = async () => {
    await signOutUser();
    setCurrentHrdUser(null);
    navigate('/lokerptsk');
  };

  const handleLogoutCandidate = async () => {
    await signOutUser();
    setCandidateUser(null);
    navigate('/lokerptsk');
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg p-2">
          <Logo variant="dark" size="sm" symbolOnly />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-bold text-base text-white tracking-tight">PT Semoga Kerja</h2>
          <p className="text-xs text-slate-400">Memuat Recruitment Management System...</p>
        </div>
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
      </div>
    );
  }

  // ==========================================
  // JALUR 1: HRD (Halaman Login & Dashboard)
  // ==========================================

  // Halaman Login HRD: /loginhrd
  if (currentPath === '/loginhrd') {
    return (
      <HrdLoginPage
        onSuccess={(user) => {
          setCurrentHrdUser(user);
          navigate('/dashboardhrd');
        }}
        onNavigateHome={() => navigate('/lokerptsk')}
        currentUser={currentHrdUser}
      />
    );
  }

  // Dashboard HRD: /dashboardhrd atau /hrd (Hanya dapat diakses oleh HRD berwenang)
  if (currentPath === '/dashboardhrd' || currentPath === '/hrd') {
    if (!currentHrdUser || !isUserHrd(currentHrdUser)) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
          <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Autentikasi HRD Diperlukan</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dashboard internal PT Semoga Kerja diproteksi secara ketat. Silakan masuk melalui halaman login HRD resmi.
            </p>
            <button
              onClick={() => navigate('/loginhrd')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Menuju Halaman Login HRD
            </button>
            <button
              onClick={() => navigate('/lokerptsk')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors block mx-auto cursor-pointer"
            >
              Kembali ke Portal Karir
            </button>
          </div>
        </div>
      );
    }

    return (
      <HrdDashboard
        jobs={jobs}
        applications={applications}
        interviews={interviews}
        emailLogs={emailLogs}
        auditLogs={auditLogs}
        settings={settings}
        onRefreshJobs={refreshJobs}
        onRefreshApplications={refreshApplications}
        onRefreshInterviews={refreshInterviews}
        onRefreshEmailLogs={refreshEmailLogs}
        onRefreshAuditLogs={refreshAuditLogs}
        onRefreshSettings={refreshSettings}
        onLogout={handleLogoutHrd}
        onReturnToCareerSite={() => navigate('/lokerptsk')}
        currentUserEmail={currentHrdUser?.email || '2207016087@student.walisongo.ac.id'}
      />
    );
  }

  // ==========================================
  // JALUR 2: KANDIDAT & PUBLIK (/lokerptsk/*)
  // Tidak ada tombol/link Login HRD di halaman mana pun di sini!
  // ==========================================
  const renderCandidateContent = () => {
    // 1. Sign Up Kandidat
    if (currentPath === '/lokerptsk/signup') {
      return (
        <CandidateAuthView
          mode="signup"
          onSwitchMode={(m) => navigate(m === 'login' ? '/lokerptsk/login' : '/lokerptsk/signup')}
          onSuccess={(user) => {
            setCandidateUser({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Kandidat',
              provider: user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password',
            });
            navigate('/lokerptsk/profil');
          }}
          onReturnToJobs={() => navigate('/lokerptsk/lowongan')}
        />
      );
    }

    // 2. Login Kandidat
    if (currentPath === '/lokerptsk/login') {
      return (
        <CandidateAuthView
          mode="login"
          onSwitchMode={(m) => navigate(m === 'login' ? '/lokerptsk/login' : '/lokerptsk/signup')}
          onSuccess={(user) => {
            setCandidateUser({
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Kandidat',
              provider: user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password',
            });
            navigate('/lokerptsk/profil');
          }}
          onReturnToJobs={() => navigate('/lokerptsk/lowongan')}
        />
      );
    }

    // 3. Profil Kandidat
    if (currentPath === '/lokerptsk/profil') {
      if (!candidateUser) {
        return (
          <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Silakan Masuk ke Akun Anda</h2>
            <p className="text-xs text-slate-600">
              Untuk melihat data profil kandidat, Anda harus masuk terlebih dahulu.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/lokerptsk/login')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Masuk Akun
              </button>
              <button
                onClick={() => navigate('/lokerptsk/signup')}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Daftar Akun Baru
              </button>
            </div>
          </div>
        );
      }
      return (
        <CandidateProfileView
          candidate={candidateUser}
          applications={myCandidateApplications}
          initialSubTab="profile"
          onNavigate={(p) => navigate(p)}
          onLogout={handleLogoutCandidate}
        />
      );
    }

    // 4. Riwayat Lamaran Kandidat
    if (currentPath === '/lokerptsk/lamaran') {
      if (!candidateUser) {
        return (
          <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Riwayat Lamaran Pekerjaan</h2>
            <p className="text-xs text-slate-600">
              Masuk ke akun kandidat Anda untuk meninjau status dan riwayat lamaran yang telah Anda kirimkan.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/lokerptsk/login')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Masuk Akun
              </button>
              <button
                onClick={() => setIsCheckStatusOpen(true)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cek Status Cepat
              </button>
            </div>
          </div>
        );
      }
      return (
        <CandidateProfileView
          candidate={candidateUser}
          applications={myCandidateApplications}
          initialSubTab="applications"
          onNavigate={(p) => navigate(p)}
          onLogout={handleLogoutCandidate}
        />
      );
    }

    // 5. Kebijakan Privasi Kandidat
    if (currentPath === '/lokerptsk/kebijakan-privasi') {
      return <PrivacyPolicyView onBack={() => navigate('/lokerptsk')} />;
    }

    // 6. Daftar Lowongan Pekerjaan
    if (currentPath === '/lokerptsk/lowongan') {
      return (
        <JobList
          jobs={jobs}
          candidateApplications={myCandidateApplications}
          onSelectJob={(job) => setSelectedJobForDetail(job)}
          onApplyJob={(job) => {
            if (!candidateUser) {
              navigate('/lokerptsk/login');
            } else {
              setSelectedJobForApply(job);
            }
          }}
        />
      );
    }

    // 7. Beranda Utama Portal Karir: /lokerptsk
    return (
      <CareerHome
        jobs={jobs}
        onSelectJob={(job) => setSelectedJobForDetail(job)}
        onExploreAllJobs={() => navigate('/lokerptsk/lowongan')}
        onOpenPrivacy={() => navigate('/lokerptsk/kebijakan-privasi')}
      />
    );
  };

  const existingAppForSelectedJob = selectedJobForDetail
    ? myCandidateApplications.find((a) => a.jobId === selectedJobForDetail.id)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Strict candidate-only navigation. Absolutely NO HRD link/button */}
      <Navbar
        currentPath={currentPath}
        onNavigate={(p) => navigate(p)}
        onOpenCheckStatus={() => setIsCheckStatusOpen(true)}
        candidateUser={candidateUser}
        onLogoutCandidate={handleLogoutCandidate}
      />

      <main className="flex-1">
        {renderCandidateContent()}
      </main>

      {/* Strict candidate-only footer. Absolutely NO HRD link/button */}
      <Footer
        onOpenPrivacy={() => navigate('/lokerptsk/kebijakan-privasi')}
        onOpenJobs={() => navigate('/lokerptsk/lowongan')}
      />

      {/* Job Detail Modal */}
      {selectedJobForDetail && (
        <JobDetailModal
          job={selectedJobForDetail}
          existingApplication={existingAppForSelectedJob}
          candidateUser={candidateUser}
          onClose={() => setSelectedJobForDetail(null)}
          onApply={(job) => {
            setSelectedJobForDetail(null);
            if (!candidateUser) {
              navigate('/lokerptsk/login');
            } else {
              setSelectedJobForApply(job);
            }
          }}
          onViewMyApplicationStatus={() => {
            setSelectedJobForDetail(null);
            navigate('/lokerptsk/lamaran');
          }}
          onRequireLogin={() => {
            setSelectedJobForDetail(null);
            navigate('/lokerptsk/login');
          }}
        />
      )}

      {/* Application Form Modal */}
      {selectedJobForApply && (
        <ApplicationFormModal
          job={selectedJobForApply}
          candidateUser={candidateUser}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={(newApp) => {
            setSelectedJobForApply(null);
            setSubmittedApplication(newApp);
            setCandidateApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
            if (currentHrdUser) {
              refreshApplications();
              refreshEmailLogs();
            }
          }}
          onOpenPrivacy={() => {
            setSelectedJobForApply(null);
            navigate('/lokerptsk/kebijakan-privasi');
          }}
        />
      )}

      {/* Application Success Modal */}
      {submittedApplication && (
        <ApplicationSuccessModal
          application={submittedApplication}
          onClose={() => setSubmittedApplication(null)}
          onOpenCheckStatus={() => {
            setSubmittedApplication(null);
            navigate('/lokerptsk/lamaran');
          }}
        />
      )}

      {/* Check Status Modal */}
      {isCheckStatusOpen && (
        <CheckStatusModal onClose={() => setIsCheckStatusOpen(false)} />
      )}
    </div>
  );
}

export default App;
