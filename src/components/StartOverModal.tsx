import React, { useState } from 'react';
import {
  RotateCcw,
  AlertTriangle,
  X,
  Trash2,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { useToast } from './Toast';

export interface StartOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetToDefaults: () => void;
  onStartFromScratch: () => void;
  onClearMediaStorage: () => Promise<void>;
}

export function StartOverModal({
  isOpen,
  onClose,
  onResetToDefaults,
  onStartFromScratch,
  onClearMediaStorage,
}: StartOverModalProps) {
  const [activeAction, setActiveAction] = useState<'defaults' | 'scratch' | 'media' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleExecute = async () => {
    if (!activeAction) return;

    setIsProcessing(true);
    try {
      if (activeAction === 'defaults') {
        onResetToDefaults();
        showToast('Website successfully reset to the initial curated portfolio.', 'success');
      } else if (activeAction === 'scratch') {
        onStartFromScratch();
        showToast('Website cleared. You now have a fresh, blank canvas.', 'info');
      } else if (activeAction === 'media') {
        await onClearMediaStorage();
        showToast('Media storage and uploaded image cache cleared.', 'success');
      }
      onClose();
    } catch (err) {
      console.error('Reset execution failed:', err);
      showToast('An error occurred during reset.', 'error');
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in"
      id="start-over-modal-backdrop"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg border border-stone-200 shadow-2xl overflow-hidden animate-scale-up"
        id="start-over-modal-card"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-semibold text-stone-900 leading-none">
                Start Over &middot; Reset Website
              </h3>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                Manage site lifecycle, author content, and image storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors"
            id="close-start-over-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed font-sans">
            Choose how you would like to reset or start over. You can restore the original curated portfolio, start fresh with an empty canvas, or purge image storage.
          </p>

          <div className="space-y-2.5">
            {/* Option 1: Reset to Defaults */}
            <label
              onClick={() => setActiveAction('defaults')}
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                activeAction === 'defaults'
                  ? 'border-[#722F37] bg-[#722F37]/5 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    activeAction === 'defaults'
                      ? 'border-[#722F37] bg-[#722F37]'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {activeAction === 'defaults' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#722F37]" />
                    <span className="text-xs font-semibold text-stone-900">
                      Reset to Curated Portfolio State
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Restores all original poetry stanzas, horology &amp; aerodynamics curiosities, UNIX articles, and diary entries.
                  </p>
                </div>
              </div>
            </label>

            {/* Option 2: Clean Slate */}
            <label
              onClick={() => setActiveAction('scratch')}
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                activeAction === 'scratch'
                  ? 'border-red-600 bg-red-50/50 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    activeAction === 'scratch'
                      ? 'border-red-600 bg-red-600'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {activeAction === 'scratch' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs font-semibold text-stone-900">
                      Start Over from Scratch (Clean Canvas)
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Clears all existing posts, poems, and articles so you can publish your own writing on a 100% fresh, blank website.
                  </p>
                </div>
              </div>
            </label>

            {/* Option 3: Clear Media Storage */}
            <label
              onClick={() => setActiveAction('media')}
              className={`block p-4 rounded-xl border cursor-pointer transition-all ${
                activeAction === 'media'
                  ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                  : 'border-stone-200 hover:border-stone-300 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                    activeAction === 'media'
                      ? 'border-amber-600 bg-amber-600'
                      : 'border-stone-300 bg-white'
                  }`}
                >
                  {activeAction === 'media' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-xs font-semibold text-stone-900">
                      Purge Image &amp; Media Storage
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                    Empties the browser IndexedDB and cache of all uploaded 16:9 crops and custom avatars, freeing storage.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {activeAction && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {activeAction === 'defaults' && 'This will replace current edits with the original showcase entries.'}
                {activeAction === 'scratch' && 'Warning: This will empty all galleries, essays, and diary entries.'}
                {activeAction === 'media' && 'All locally stored custom images will be erased from browser memory.'}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!activeAction || isProcessing}
            onClick={handleExecute}
            className={`px-5 py-2 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-40 ${
              activeAction === 'scratch'
                ? 'bg-red-600 hover:bg-red-700'
                : activeAction === 'media'
                ? 'bg-amber-700 hover:bg-amber-800'
                : 'bg-[#722F37] hover:bg-[#581c24]'
            }`}
            id="confirm-start-over-btn"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {activeAction === 'scratch' ? 'Confirm Start Over' : 'Confirm Reset'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StartOverModal;
