import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertCircle, CheckCircle, X } from 'lucide-react';

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
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check for password "Mogul"
    if (password.trim() === 'Mogul') {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setPassword('');
        onLoginSuccess();
        onClose();
      }, 600);
    } else {
      setError('Access denied: Invalid administrator password.');
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
                Admin Authentication
              </h3>
              <p className="text-[11px] text-stone-400 font-sans">
                MarkRyan Creative Architecture &middot; Private Console
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans" id="admin-login-form">
          <div className="text-xs text-stone-600 leading-relaxed">
            Enter the administrator passcode to access the <strong>Admins Page</strong>, content publishing tools, and comment moderation panel.
          </div>

          <div>
            <label
              htmlFor="admin-password-input"
              className="block font-semibold text-stone-700 text-[11px] uppercase tracking-wider mb-1.5"
            >
              Administrator Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="admin-password-input"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
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
              <span>Password verified. Unlocking Administrator Console...</span>
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
              disabled={!password || isSuccess}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-xl shadow-xs transition-colors disabled:opacity-50"
              id="admin-login-submit-btn"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Unlock Admin Access</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginModal;
