import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, X, Shield, Lock } from 'lucide-react';

interface BrandAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showUploadOption?: boolean;
  isAdmin?: boolean;
  onOpenAdminLogin?: () => void;
}

export function BrandAvatar({
  className = '',
  size = 'md',
  showUploadOption = true,
  isAdmin = false,
  onOpenAdminLogin,
}: BrandAvatarProps) {
  // Ordered sources to attempt loading
  const defaultSources = [
    '/image.png',
    '/markryan.png',
    '/assets/image.png',
    '/markryan-avatar.svg',
  ];

  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Read and synchronize custom avatar from localStorage
    const syncAvatar = () => {
      const saved = localStorage.getItem('markryan_custom_avatar');
      setCustomAvatar(saved);
      if (saved) {
        setHasFailedAll(false);
      }
    };

    syncAvatar();
    window.addEventListener('storage', syncAvatar);
    window.addEventListener('avatar_updated', syncAvatar);

    return () => {
      window.removeEventListener('storage', syncAvatar);
      window.removeEventListener('avatar_updated', syncAvatar);
    };
  }, []);

  const handleImageError = () => {
    if (customAvatar) {
      // If custom avatar failed, clear it and fall back to default sources
      setCustomAvatar(null);
      setCurrentSrcIndex(0);
      return;
    }

    if (currentSrcIndex < defaultSources.length - 1) {
      setCurrentSrcIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const activeSrc = customAvatar || defaultSources[currentSrcIndex];

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
    xl: 'w-20 h-20 sm:w-24 sm:h-24',
  }[size];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCustomAvatar(dataUrl);
        setHasFailedAll(false);
        try {
          localStorage.setItem('markryan_custom_avatar', dataUrl);
          window.dispatchEvent(new Event('avatar_updated'));
        } catch (storageErr) {
          console.warn('Could not save avatar to localStorage:', storageErr);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAvatar = () => {
    if (!isAdmin) return;
    setCustomAvatar(null);
    localStorage.removeItem('markryan_custom_avatar');
    setCurrentSrcIndex(0);
    window.dispatchEvent(new Event('avatar_updated'));
  };

  return (
    <>
      <div className={`relative group inline-flex items-center justify-center shrink-0 ${className}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          className={`relative rounded-full overflow-hidden p-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#722F37]/50 ${
            sizeClasses
          } ring-1 ring-stone-300/80 shadow-xs hover:shadow-md hover:ring-[#722F37] bg-white group cursor-pointer`}
          id="header-brand-avatar"
          title={isAdmin ? "MarkRyan — Admin Profile (Click to change photo)" : "MarkRyan — Profile (Click to view)"}
          aria-label="MarkRyan profile photo"
        >
          {!hasFailedAll ? (
            <img
              src={activeSrc}
              alt="MarkRyan"
              onError={handleImageError}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center rounded-full transition-transform duration-500 group-hover:scale-108"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-[#722F37] text-amber-50 font-cormorant font-bold flex items-center justify-center text-sm sm:text-base">
              M
            </div>
          )}

          {/* Hover overlay indicator: Camera for admin, Eye for viewer */}
          {showUploadOption && (
            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
              {isAdmin ? <Camera className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </span>
          )}
        </button>

        {/* Hidden File Input for admin photo replacement only */}
        {isAdmin && (
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
            id="avatar-photo-upload-input"
          />
        )}
      </div>

      {/* Modal Profile Viewer */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
          id="avatar-profile-modal-backdrop"
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200/90 p-6 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
            id="avatar-profile-modal"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              title="Close"
              id="close-avatar-modal-btn"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              {/* Admin status pill if logged in */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#722F37]/10 text-[#722F37] text-[11px] font-semibold tracking-wide uppercase mb-3">
                  <Shield className="w-3 h-3" />
                  Admin Authorized
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-medium tracking-wide uppercase mb-3">
                  Author Profile
                </span>
              )}

              {/* Large Image Preview */}
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#722F37]/20 shadow-md bg-stone-100 mb-4 group">
                <img
                  src={activeSrc}
                  alt="MarkRyan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
                {/* Only admins see the upload hover overlay on the modal photo */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1 backdrop-blur-xs cursor-pointer"
                    title="Upload photo"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Update Photo</span>
                  </button>
                )}
              </div>

              <h3 className="font-cormorant text-2xl font-bold text-stone-900 leading-tight">
                MarkRyan
              </h3>
              <p className="text-xs uppercase tracking-widest text-[#722F37] font-semibold mt-1">
                Creative Developer &middot; Technical Architect
              </p>
              <p className="text-stone-600 text-xs mt-3 leading-relaxed font-sans max-w-xs">
                Writer of poetry, builder of systems, and curious observer of everyday elegance.
              </p>

              {/* Action Buttons: ONLY FOR ADMIN */}
              {isAdmin ? (
                <div className="flex items-center gap-2 mt-5 w-full">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-[#722F37] hover:bg-[#581c24] text-white rounded-lg transition-colors shadow-xs cursor-pointer"
                    id="modal-upload-photo-btn"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload / Replace Photo</span>
                  </button>
                  {customAvatar && (
                    <button
                      type="button"
                      onClick={handleResetAvatar}
                      className="py-2 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200 cursor-pointer"
                      title="Reset to default photo"
                    >
                      Reset
                    </button>
                  )}
                </div>
              ) : (
                /* Unauthenticated Visitor View */
                <div className="mt-5 pt-3.5 border-t border-stone-100 w-full flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Lock className="w-3 h-3 text-stone-400" />
                    Photo upload restricted to Admin
                  </span>
                  {onOpenAdminLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        onOpenAdminLogin();
                      }}
                      className="text-[11px] font-semibold text-[#722F37] hover:underline cursor-pointer"
                    >
                      Admin Login
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
