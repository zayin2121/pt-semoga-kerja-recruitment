import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleAuthProvider, firebaseConfig } from './firebase';
import { HrdUser, CandidateUser } from '../types/recruitment';

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const PRIMARY_ADMIN_EMAIL = '2207016087@student.walisongo.ac.id';
export const ADMIN_EMAILS: string[] = [
  '2207016087@student.walisongo.ac.id',
  'muzaydzuhri@gmail.com',
];

export const FIREBASE_PROJECT_ID = (firebaseConfig as any)?.projectId || 'gen-lang-client-0934789040';
export const FIREBASE_AUTH_SETTINGS_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;
export const FIREBASE_AUTH_PROVIDERS_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

export function isUnauthorizedDomainError(error: any): boolean {
  const code = typeof error === 'string' ? error : (error?.code || '');
  const message = typeof error === 'string' ? error : (error?.message || '');
  return code === 'auth/unauthorized-domain' || message.includes('unauthorized-domain');
}

export function isOperationNotAllowedError(error: any): boolean {
  const code = typeof error === 'string' ? error : (error?.code || '');
  const message = typeof error === 'string' ? error : (error?.message || '');
  return code === 'auth/operation-not-allowed' || message.includes('PASSWORD_LOGIN_DISABLED') || message.includes('operation-not-allowed');
}

export function getCachedAccessToken(): string | null {
  return cachedAccessToken;
}

export function setCachedAccessToken(token: string | null): void {
  cachedAccessToken = token;
}

/**
 * Initializes persistent Auth State Listener with automatic session recovery
 */
export function initAuth(
  onSuccess?: (user: User, token: string | null) => void,
  onFailure?: () => void
) {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onSuccess) {
        onSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onFailure) {
        onFailure();
      }
    }
  });
}

/**
 * Translates Firebase Auth error codes into clear, human-readable Indonesian error messages
 */
export function getFriendlyAuthErrorMessage(error: any): string {
  const code = error?.code || '';
  const message = error?.message || '';

  if (isUnauthorizedDomainError(error)) {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'domain ini';
    return `Domain saat ini (${currentHost}) belum terdaftar pada daftar Authorized Domains Firebase Authentication (auth/unauthorized-domain). Silakan tambahkan "run.app" atau "${currentHost}" di Firebase Console > Authentication > Settings > Authorized domains.`;
  }
  if (isOperationNotAllowedError(error)) {
    return 'Metode masuk Email & Password belum diaktifkan di Firebase Authentication Console (Status: PASSWORD_LOGIN_DISABLED). Silakan aktifkan penyedia Email/Password di Firebase Console > Authentication > Sign-in method, atau tambahkan domain untuk menggunakan Akun Google.';
  }
  if (code === 'auth/user-not-found') {
    return 'Akun dengan alamat email ini belum terdaftar. Silakan daftar akun baru terlebih dahulu.';
  }
  if (code === 'auth/wrong-password') {
    return 'Kata sandi salah. Silakan periksa kembali atau gunakan tombol "Lupa password?".';
  }
  if (code === 'auth/invalid-credential') {
    return 'Email atau kata sandi tidak sesuai. Periksa kembali data login Anda.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'Alamat email ini sudah terdaftar. Silakan pilih "Masuk ke Akun".';
  }
  if (code === 'auth/weak-password') {
    return 'Kata sandi terlalu lemah. Gunakan minimal 6 karakter.';
  }
  if (code === 'auth/invalid-email') {
    return 'Format alamat email tidak valid.';
  }
  if (code === 'auth/account-exists-with-different-credential') {
    return 'Akun dengan alamat email ini telah terdaftar menggunakan penyedia login lain (seperti Akun Google). Silakan masuk menggunakan metode tersebut.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Jendela autentikasi ditutup sebelum verifikasi selesai.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Jendela pop-up diblokir oleh peramban. Harap izinkan pop-up untuk situs ini.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Koneksi ke server gagal. Periksa koneksi internet Anda dan coba lagi.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Terlalu banyak percobaan gagal. Akses dibatasi sementara demi keamanan. Silakan coba lagi beberapa saat lagi.';
  }
  if (code === 'auth/requires-recent-login') {
    return 'Sesi Anda telah kedaluwarsa. Silakan masuk kembali.';
  }

  return message || 'Terjadi gangguan saat memproses autentikasi. Silakan coba kembali.';
}

/**
 * HRD Sign-in with Google requesting Gmail sending permission
 */
export async function signInHrdWithGoogle(): Promise<{ user: User; accessToken: string }> {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    if (token) {
      cachedAccessToken = token;
    }
    return { user: result.user, accessToken: token };
  } catch (error) {
    console.error('HRD sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export const signInWithGoogle = signInHrdWithGoogle;

/**
 * Candidate Sign-in with Google (Least privilege: standard profile & email)
 */
export async function candidateSignInWithGoogle(): Promise<User> {
  try {
    const candidateGoogleProvider = new GoogleAuthProvider();
    // Add custom parameters to always prompt account selection if needed
    candidateGoogleProvider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, candidateGoogleProvider);
    // Save or update candidate profile in Firestore
    await saveCandidateProfile(result.user, 'google');
    return result.user;
  } catch (error) {
    console.error('Candidate Google sign-in error:', error);
    throw error;
  }
}

/**
 * Candidate Sign-up with Email & Password
 */
export async function candidateSignUpWithEmail(
  name: string,
  email: string,
  pass: string
): Promise<User> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name.trim() });
      await saveCandidateProfile(cred.user, 'password', name.trim());
    }
    return cred.user;
  } catch (error: any) {
    console.error('Candidate sign-up error:', error);
    throw error;
  }
}

/**
 * Candidate Sign-in with Email & Password
 */
export async function candidateSignInWithEmail(email: string, pass: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await saveCandidateProfile(cred.user, 'password');
    return cred.user;
  } catch (error: any) {
    console.error('Candidate email sign-in error:', error);
    throw error;
  }
}

/**
 * Candidate Password Reset
 */
export async function candidateResetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Checks existing sign-in methods for an email
 */
export async function checkSignInMethods(email: string): Promise<string[]> {
  try {
    return await fetchSignInMethodsForEmail(auth, email.trim());
  } catch (error) {
    console.warn('Could not fetch sign in methods:', error);
    return [];
  }
}

/**
 * Save candidate record to Firestore 'candidates' collection
 */
export async function saveCandidateProfile(
  user: User,
  provider: 'google' | 'password',
  fallbackName?: string
): Promise<void> {
  try {
    const candidateRef = doc(db, 'candidates', user.uid);
    const candidateDoc = await getDoc(candidateRef);
    if (!candidateDoc.exists()) {
      await setDoc(candidateRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || fallbackName || user.email?.split('@')[0] || 'Kandidat',
        provider,
        role: 'candidate',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      await setDoc(
        candidateRef,
        {
          email: user.email || '',
          displayName: user.displayName || fallbackName || candidateDoc.data()?.displayName || 'Kandidat',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Could not save candidate profile to Firestore (may rely on Auth user):', err);
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
  cachedAccessToken = null;
}

export function isUserHrd(user: User | null): boolean {
  if (!user || !user.email) return false;
  const userEmail = user.email.toLowerCase();
  return ADMIN_EMAILS.some(e => e.toLowerCase() === userEmail);
}

export async function isUserHrdAsync(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  if (isUserHrd(user)) return true;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

export function getCurrentHrdUser(user: User | null): HrdUser | null {
  if (!user) return null;
  const isPrimaryAdmin = isUserHrd(user);
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'HR Staff',
    role: isPrimaryAdmin ? 'admin' : 'recruiter',
    isGmailConnected: Boolean(cachedAccessToken),
  };
}

export function getCurrentCandidateUser(user: User | null): CandidateUser | null {
  if (!user) return null;
  const provider = user.providerData?.some(p => p.providerId === 'google.com') ? 'google' : 'password';
  return {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || 'Kandidat',
    provider,
  };
}
