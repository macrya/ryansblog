import React, { useState, useEffect, useRef } from 'react';
import { Camera, Eye, X, Sparkles } from 'lucide-react';

interface BrandAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showUploadOption?: boolean;
}

export function BrandAvatar({
  className = '',
  size = 'md',
  showUploadOption = true,
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
    // Check if user previously saved a custom avatar in localStorage
    const saved = localStorage.getItem('markryan_custom_avatar');
    if (saved) {
      setCustomAvatar(saved);
    }
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
  }[size];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        } catch (storageErr) {
          console.warn('Could not save avatar to localStorage:', storageErr);
        }
      }
    };
    reader.readAsDataURL(file);
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
          } ring-1 ring-stone-300/80 shadow-xs hover:shadow-md hover:ring-[#722F37] bg-white group`}
          id="header-brand-avatar"
          title="MarkRyan — View profile photo & details"
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

          {/* Quick upload overlay indicator on hover */}
          {showUploadOption && (
            <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white backdrop-blur-[1px]">
              <Eye className="w-3.5 h-3.5" />
            </span>
          )}
        </button>

        {/* Hidden File Input for quick photo replacement */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
          id="avatar-photo-upload-input"
        />
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
              {/* Large Image Preview */}
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-[#722F37]/20 shadow-md bg-stone-100 mb-4 group">
                <img
                  src={activeSrc}
                  alt="MarkRyan"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs gap-1 backdrop-blur-xs cursor-pointer"
                  title="Upload photo"
                >
                  <Camera className="w-5 h-5" />
                  <span>Update Photo</span>
                </button>
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

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-5 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors border border-stone-300"
                  id="modal-upload-photo-btn"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload / Replace Photo</span>
                </button>
                {customAvatar && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomAvatar(null);
                      localStorage.removeItem('markryan_custom_avatar');
                      setCurrentSrcIndex(0);
                    }}
                    className="py-2 px-3 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                    title="Reset to default photo"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
