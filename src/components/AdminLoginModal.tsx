import React, { useState } from 'react';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  X,
  Sparkles,
  LogIn,
  Copy,
  ExternalLink,
  Globe,
  HelpCircle,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  verifyUserIsAdmin,
  SUPERADMIN_EMAIL,
  FIREBASE_PROJECT_ID,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: AdminLoginModalProps) {
  const [authMode, setAuthMode] = useState<'passcode' | 'email'>('passcode');
  const [passcode, setPasscode] = useState<string>('');
  const [email, setEmail] = useState<string>(SUPERADMIN_EMAIL);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [unauthorizedDomain, setUnauthorizedDomain] = useState<{
    domain: string;
    origin: string;
  } | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<boolean>(false);
  const [showDomainGuide, setShowDomainGuide] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/settings`;

  const handleCopyDomain = (domainToCopy: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(domainToCopy);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    }
  };

  // Passcode verification validated securely via serverless API
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnauthorizedDomain(null);

    if (!passcode.trim()) {
      setError('Please enter the administrator passcode.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Access denied: Invalid administrator passcode.');
        return;
      }

      // Store server-issued HMAC token in both sessionStorage and localStorage
      if (data.adminToken) {
        sessionStorage.setItem('markryan_admin_token', data.adminToken);
        localStorage.setItem('markryan_admin_token', data.adminToken);
      }

      // Background attempt to sync Firebase Auth session if possible, but never block passcode access
      try {
        try {
          await signInWithEmailAndPassword(auth, SUPERADMIN_EMAIL, passcode.trim());
        } catch (fbErr: any) {
          if (fbErr?.code === 'auth/user-not-found' || fbErr?.code === 'auth/invalid-credential') {
            try {
              await createUserWithEmailAndPassword(auth, SUPERADMIN_EMAIL, passcode.trim());
            } catch {
              // Silently ignore creation failure
            }
          }
        }

        if (auth.currentUser) {
          await verifyUserIsAdmin(auth.currentUser);
        }
      } catch (authSyncErr) {
        console.info('Firebase Auth client sync bypassed (serverless admin session active).');
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      console.error('Server passcode verification error:', err);
      setError(
        err?.message && !err.message.includes('fetch')
          ? err.message
          : 'Could not reach authorization server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Email & Password Login with Serverless Passcode Fallback
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnauthorizedDomain(null);
    setIsLoading(true);

    try {
      let firebaseUser = null;
      let firebaseAuthSuccess = false;

      // 1. Try Firebase Auth with email & password
      try {
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        firebaseUser = userCred.user;
        firebaseAuthSuccess = true;
      } catch (authErr: any) {
        if (authErr?.code === 'auth/user-not-found') {
          try {
            const newCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
            firebaseUser = newCred.user;
            firebaseAuthSuccess = true;
          } catch {
            // Non-blocking fallback
          }
        }
      }

      if (firebaseAuthSuccess && firebaseUser) {
        const isAdminUser = await verifyUserIsAdmin(firebaseUser);
        if (!isAdminUser && firebaseUser.email?.toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase()) {
          setError('Your account is authenticated, but not granted administrator privileges.');
          setIsLoading(false);
          return;
        }

        sessionStorage.setItem('markryan_admin_token', 'firebase-email-auth-verified');
        localStorage.setItem('markryan_admin_token', 'firebase-email-auth-verified');

        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPassword('');
          onLoginSuccess();
          onClose();
        }, 500);
        return;
      }

      // 2. If Firebase Auth didn't succeed, check if the password matches master admin passcode
      const verifyRes = await fetch('/api/verify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: password.trim() }),
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.success) {
        if (verifyData.adminToken) {
          sessionStorage.setItem('markryan_admin_token', verifyData.adminToken);
          localStorage.setItem('markryan_admin_token', verifyData.adminToken);
        }

        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setPassword('');
          onLoginSuccess();
          onClose();
        }, 500);
        return;
      }

      setError('Authentication failed. Please verify credentials or sign in with Master Passcode.');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In with Popup & Unauthorized Domain Detection
  const handleGoogleSignIn = async () => {
    setError('');
    setUnauthorizedDomain(null);
    setIsLoading(true);

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const isPrivileged = await verifyUserIsAdmin(res.user);
      if (!isPrivileged && res.user.email?.toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase()) {
        setError(`Signed in as ${res.user.email}, but this account is not registered as an administrator.`);
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem('markryan_admin_token', 'firebase-google-auth-verified');
      localStorage.setItem('markryan_admin_token', 'firebase-google-auth-verified');

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Firebase Google Sign-In notice:', err?.code, err?.message);

      if (err?.code === 'auth/unauthorized-domain') {
        const host = currentHost || 'this website';
        setUnauthorizedDomain({
          domain: host,
          origin: currentOrigin,
        });
        setError(`Firebase does not recognize this website domain (${host}) in its Authorized Domains list.`);
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please allow popups or use Master Passcode.');
      } else if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing authentication.');
      } else if (err?.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled in Firebase Console. Please enable Google provider or use Master Passcode.');
      } else {
        setError(err?.message || 'Google Sign-In could not be completed.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      id="admin-login-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
        id="admin-login-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#722F37] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-medium tracking-wide">
                Admin Authorization
              </h3>
              <p className="text-[11px] text-stone-400 font-sans">
                Cloud-Backed Session &middot; Persistent Authority
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAuthMode('passcode');
              setError('');
              setUnauthorizedDomain(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              authMode === 'passcode'
                ? 'border-[#722F37] text-[#722F37]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Master Passcode
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setError('');
              setUnauthorizedDomain(null);
            }}
            className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-colors ${
              authMode === 'email'
                ? 'border-[#722F37] text-[#722F37]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Email & Password
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 font-sans overflow-y-auto space-y-4">
          {/* Unauthorized Domain Resolution Banner */}
          {(unauthorizedDomain || showDomainGuide) && (
            <div
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-xs text-amber-950"
              id="unauthorized-domain-resolution-card"
            >
              <div className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900 text-xs">
                    Authorize Website Domain in Firebase
                  </div>
                  <p className="text-[11px] text-amber-800/90 mt-1 leading-relaxed">
                    Firebase OAuth requires every production domain to be explicitly listed under <strong>Authorized Domains</strong> in your Firebase project.
                  </p>
                </div>
              </div>

              <div className="bg-white/90 p-2.5 rounded-lg border border-amber-200 flex items-center justify-between gap-2 font-mono text-[11px] text-stone-800">
                <span className="truncate">{currentHost || unauthorizedDomain?.domain}</span>
                <button
                  type="button"
                  onClick={() => handleCopyDomain(currentHost || unauthorizedDomain?.domain || '')}
                  className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md text-[10px] font-sans font-medium flex items-center gap-1 transition-colors shrink-0"
                  id="copy-domain-btn"
                >
                  {copiedDomain ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Domain</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-amber-900 space-y-1 pl-1">
                <div className="font-medium">Quick 3-step setup:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-stone-700">
                  <li>Click <strong>Open Firebase Settings</strong> below.</li>
                  <li>Under <strong>Authorized domains</strong>, click <strong>Add domain</strong>.</li>
                  <li>Paste the copied domain and click <strong>Save</strong>.</li>
                </ol>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-medium transition-colors text-center"
                  id="open-firebase-console-link"
                >
                  <span>Open Firebase Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('passcode');
                    setUnauthorizedDomain(null);
                    setShowDomainGuide(false);
                    setError('');
                  }}
                  className="w-full sm:w-auto px-3 py-2 bg-white hover:bg-stone-100 text-stone-700 border border-amber-300 rounded-lg text-xs font-medium transition-colors text-center"
                >
                  Use Passcode Instead
                </button>
              </div>
            </div>
          )}

          {authMode === 'passcode' ? (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4" id="admin-passcode-form">
              <div className="text-xs text-stone-600 leading-relaxed">
                Enter your master administrator passcode to establish a persistent, cloud-authorized session.
              </div>

              <div>
                <label
                  htmlFor="admin-passcode-input"
                  className="block font-semibold text-stone-700 text-[11px] uppercase tracking-wider mb-1.5"
                >
                  Master Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-passcode-input"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter passcode..."
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 placeholder-stone-400 focus:outline-none focus:border-[#722F37] focus:bg-white focus:ring-1 focus:ring-[#722F37]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Authorization granted. Initializing Admin Console...</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                >
                  Return as Viewer
                </button>

                <button
                  type="submit"
                  disabled={!passcode || isLoading || isSuccess}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-xl shadow-xs transition-colors disabled:opacity-50"
                  id="admin-login-submit-btn"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Authorizing...' : 'Unlock Admin Access'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 flex items-center justify-center gap-2 transition-colors"
                  id="admin-google-signin-btn-passcode-tab"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sign in with Google ({SUPERADMIN_EMAIL})</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-4" id="admin-email-form">
              <div className="text-xs text-stone-600 leading-relaxed">
                Sign in with your administrator email account (<strong>{SUPERADMIN_EMAIL}</strong>).
              </div>

              <div>
                <label
                  htmlFor="admin-email-input"
                  className="block font-semibold text-stone-700 text-[11px] uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-[#722F37] focus:bg-white focus:ring-1 focus:ring-[#722F37]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-account-password"
                  className="block font-semibold text-stone-700 text-[11px] uppercase tracking-wider mb-1.5"
                >
                  Password or Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-account-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter account password or master passcode..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:border-[#722F37] focus:bg-white focus:ring-1 focus:ring-[#722F37]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              {isSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Authentication confirmed. Opening Admin Console...</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-stone-500 hover:text-stone-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!password || isLoading || isSuccess}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium border border-stone-200 flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Troubleshooting Info Toggle */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowDomainGuide(!showDomainGuide)}
              className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-stone-700 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showDomainGuide ? 'Hide Domain Setup Guide' : 'Production Domain Setup Guide'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginModal;
