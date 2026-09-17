'use client';

import React, { useState, useTransition } from 'react';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';
import { deletePost, type DeletePostResult } from '../actions/deletePost';
import { useToast } from './Toast';

export interface DeleteButtonProps {
  /** The unique ID of the post to delete */
  postId: string;
  /** Optional title of the post for confirmation display */
  postTitle?: string;
  /** Optional URL of the header image in Vercel Blob to purge */
  imageUrl?: string;
  /** Admin authorization token/password */
  adminSecret?: string;
  /** Callback fired after successful deletion */
  onDeleted?: (postId: string) => void;
  /** Optional custom server action override if using a specific action hook */
  action?: (input: { postId: string; adminSecret?: string; imageUrl?: string }) => Promise<DeletePostResult>;
  /** UI style variant */
  variant?: 'minimal' | 'danger' | 'icon';
  /** Button label override */
  label?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Client-Side <DeleteButton /> Component
 *
 * Designed for Next.js App Router & React CMS.
 * Features a secure confirmation modal, useTransition pending state,
 * Vercel Blob purge execution, and toast notifications.
 */
export function DeleteButton({
  postId,
  postTitle,
  imageUrl,
  adminSecret,
  onDeleted,
  action,
  variant = 'minimal',
  label = 'Remove entry',
  className = '',
}: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { showToast } = useToast();

  const handleDeleteConfirmed = () => {
    startTransition(async () => {
      try {
        const effectiveSecret =
          adminSecret ||
          (typeof window !== 'undefined'
            ? sessionStorage.getItem('markryan_admin_token') || ''
            : '');

        let result: DeletePostResult;

        try {
          const executeAction = action || deletePost;
          result = await executeAction({
            postId,
            adminSecret: effectiveSecret,
            imageUrl,
          });
        } catch (actionErr) {
          console.warn('[DeleteButton] Server action not available, attempting REST API fallback:', actionErr);
          // Fallback to Vercel Serverless Function endpoint /api/delete-post
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (effectiveSecret) {
            headers['Authorization'] = `Bearer ${effectiveSecret}`;
          }

          const response = await fetch('/api/delete-post', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              postId,
              adminSecret: effectiveSecret,
              imageUrl,
            }),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Server returned ${response.status}`);
          }
          result = await response.json();
        }

        if (result.success) {
          showToast(
            result.message || 'Post deleted and Vercel Blob asset purged.',
            'success',
            'Post Removed'
          );
          setIsConfirmOpen(false);
          if (onDeleted) {
            onDeleted(postId);
          }
        } else {
          showToast(
            result.message || 'Failed to delete post.',
            'error',
            'Deletion Error'
          );
        }
      } catch (err) {
        console.error('[DeleteButton] Execution failed:', err);
        showToast(
          err instanceof Error ? err.message : 'Network error executing server action.',
          'error',
          'Action Failed'
        );
      }
    });
  };

  // Render variant styles
  const getButtonStyles = () => {
    switch (variant) {
      case 'danger':
        return 'px-3 py-1.5 bg-red-900/20 hover:bg-red-900/30 text-red-700 border border-red-300 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5';
      case 'icon':
        return 'p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center';
      case 'minimal':
      default:
        return 'text-xs text-stone-400 hover:text-red-700 inline-flex items-center gap-1 transition-colors font-sans';
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setIsConfirmOpen(true)}
        className={`${getButtonStyles()} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
        title={`Delete "${postTitle || postId}" (Admin)`}
        id={`delete-post-btn-${postId}`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
            {variant !== 'icon' && <span>Deleting...</span>}
          </>
        ) : (
          <>
            <Trash2 className="w-3.5 h-3.5" />
            {variant !== 'icon' && <span>{label}</span>}
          </>
        )}
      </button>

      {/* Minimalist Confirmation Modal */}
      {isConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-[#faf9f6] text-stone-900 rounded-2xl shadow-2xl border border-stone-300/80 p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5 text-red-700">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                </div>
                <h3 className="font-cormorant text-xl font-medium text-stone-900">
                  Confirm Post Deletion
                </h3>
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsConfirmOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-sans text-stone-600 leading-relaxed">
              <p>
                Are you sure you want to permanently delete this diary entry?
              </p>
              {postTitle && (
                <div className="p-3 bg-stone-200/50 rounded-lg border border-stone-300/60 font-serif italic text-stone-800">
                  &ldquo;{postTitle}&rdquo;
                </div>
              )}
              {imageUrl && (
                <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <strong>Vercel Blob Storage Notice:</strong> The associated 16:9 header image file will be securely purged using the Vercel Blob <code className="font-mono bg-amber-100 px-1 rounded">del()</code> API.
                </p>
              )}
              <p className="text-stone-500">
                This operation will immediately revalidate public paths across the Next.js App Router.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 text-xs font-sans font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteConfirmed}
                className="px-4 py-2 text-xs font-sans font-medium bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                id="confirm-delete-post-btn"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Purging from Vercel Blob...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeleteButton;
