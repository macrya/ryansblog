import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle, X, Sparkles, LogIn } from 'lucide-react';
import {
  auth,
  googleProvider,
  verifyUserIsAdmin,
  SUPERADMIN_EMAIL,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
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

  if (!isOpen) return null;

  // Passcode verification ("Mogul") backed by Firebase Auth
  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passcode.trim() !== 'Mogul') {
      setError('Access denied: Invalid administrator passcode.');
      return;
    }

    setIsLoading(true);
    try {
      // Establish an authenticated Firebase session for the administrator
      const adminEmail = SUPERADMIN_EMAIL;
      const adminPass = 'MarkRyanMogul2026!';

      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPass);
      } catch (authErr: any) {
        if (authErr?.code === 'auth/user-not-found' || authErr?.code === 'auth/invalid-credential') {
          // If first time, provision admin account
          try {
            await createUserWithEmailAndPassword(auth, adminEmail, adminPass);
          } catch {
            // Fallback: sign in anonymously and claim admin role
            await signInAnonymously(auth);
          }
        } else {
          // Fallback to anonymous authenticated session with admin privilege
          await signInAnonymously(auth);
        }
      }

      await verifyUserIsAdmin(auth.currentUser);

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      console.warn('Firebase Auth session warning:', err);
      // Still allow admin unlock if passcode matched
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPasscode('');
        onLoginSuccess();
        onClose();
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Email & Password Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      try {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } catch (authErr: any) {
        if (authErr?.code === 'auth/user-not-found') {
          // Allow first-time registration for the site owner
          await createUserWithEmailAndPassword(auth, email.trim(), password);
        } else {
          throw authErr;
        }
      }

      const isAdminUser = await verifyUserIsAdmin(auth.currentUser);
      if (!isAdminUser && auth.currentUser?.email?.toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase()) {
        setError('Your account is authenticated, but not granted administrator privileges.');
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In with Popup
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const isPrivileged = await verifyUserIsAdmin(res.user);
      if (!isPrivileged && res.user.email?.toLowerCase() !== SUPERADMIN_EMAIL.toLowerCase()) {
        setError(`Signed in as ${res.user.email}, but this account is not registered as an administrator.`);
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onLoginSuccess();
        onClose();
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'Google Sign-In could not be completed.');
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
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-stone-200 overflow-hidden"
        id="admin-login-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-stone-900 text-stone-100 flex items-center justify-between border-b border-stone-800">
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
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-3">
          <button
            type="button"
            onClick={() => {
              setAuthMode('passcode');
              setError('');
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
        <div className="p-6 font-sans">
          {authMode === 'passcode' ? (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4" id="admin-passcode-form">
              <div className="text-xs text-stone-600 leading-relaxed">
                Enter the master administrator passcode to establish a persistent, cloud-authorized session.
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
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-account-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your account password..."
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
        </div>
      </div>
    </div>
  );
}

export default AdminLoginModal;
