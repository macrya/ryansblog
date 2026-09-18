import React, { useState } from 'react';
import type { BlogComment } from '../types';
import {
  MessageSquare,
  Send,
  Shield,
  CheckCircle,
  Flag,
  Trash2,
  Check,
  AlertTriangle,
  User,
  Sparkles,
} from 'lucide-react';

interface CommentsSectionProps {
  postId: string;
  comments: BlogComment[];
  onAddComment: (comment: BlogComment) => void;
  onUpdateCommentStatus: (commentId: string, status: 'approved' | 'pending' | 'flagged') => void;
  onDeleteComment: (commentId: string) => void;
  isAdmin?: boolean;
  onRequireAdminAuth?: () => void;
}

export function CommentsSection({
  postId,
  comments,
  onAddComment,
  onUpdateCommentStatus,
  onDeleteComment,
  isAdmin = false,
  onRequireAdminAuth,
}: CommentsSectionProps) {
  const [authorName, setAuthorName] = useState<string>('');
  const [authorEmail, setAuthorEmail] = useState<string>('');
  const [commentText, setCommentText] = useState<string>('');
  const [honeypot, setHoneypot] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedFeedback, setSubmittedFeedback] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  // Moderation state
  const [isModeratorMode, setIsModeratorMode] = useState<boolean>(false);
  const [moderationFilter, setModerationFilter] = useState<'all' | 'approved' | 'pending' | 'flagged'>('all');

  const handleToggleModeratorMode = () => {
    if (!isAdmin) {
      if (onRequireAdminAuth) {
        onRequireAdminAuth();
      }
      return;
    }
    setIsModeratorMode(!isModeratorMode);
  };

  // Filter comments for this post
  const postComments = comments.filter((c) => c.postId === postId);

  const displayedComments = isModeratorMode
    ? postComments.filter((c) => (moderationFilter === 'all' ? true : c.status === moderationFilter))
    : postComments.filter((c) => c.status === 'approved');

  const pendingCount = postComments.filter((c) => c.status === 'pending').length;
  const flaggedCount = postComments.filter((c) => c.status === 'flagged').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // 1. Anti-spam Honeypot Check (silent drop if bot filled the hidden trap)
    if (honeypot.trim().length > 0) {
      console.warn('Spam bot honeypot triggered on comment submission.');
      setSubmittedFeedback(true);
      setTimeout(() => setSubmittedFeedback(false), 3000);
      return;
    }

    // 2. Client-side Rate Limiting (max 3 comments per 60 seconds per browser)
    try {
      const nowMs = Date.now();
      const rawTimestamps = sessionStorage.getItem('markryan_comment_timestamps');
      const timestamps: number[] = rawTimestamps ? JSON.parse(rawTimestamps) : [];
      const recentTimestamps = timestamps.filter((t) => nowMs - t < 60000);

      if (recentTimestamps.length >= 3) {
        setSubmitError('Rate limit reached: Please pause a moment before sending another reflection.');
        return;
      }

      recentTimestamps.push(nowMs);
      sessionStorage.setItem('markryan_comment_timestamps', JSON.stringify(recentTimestamps));
    } catch {
      // sessionStorage unavailable
    }

    // 3. Validation
    if (!commentText.trim() || !authorName.trim()) {
      setSubmitError('Please provide both your name and reflection content.');
      return;
    }

    if (commentText.trim().length > 2000) {
      setSubmitError('Comment is too long (maximum 2,000 characters).');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Only grant admin badge and instant approval if actually authenticated as admin
    const newComment: BlogComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      postId,
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim() || undefined,
      content: commentText.trim(),
      createdAt: `${formattedDate} · ${formattedTime}`,
      status: isAdmin ? 'approved' : 'pending',
      isAdmin: Boolean(isAdmin),
    };

    try {
      onAddComment(newComment);
      setCommentText('');
      setSubmittedFeedback(true);
      setTimeout(() => setSubmittedFeedback(false), 3500);
    } catch (err: any) {
      setSubmitError(err?.message || 'Could not post comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-14 pt-10 border-t border-stone-300/60 font-sans" id={`comments-section-${postId}`}>
      {/* Header & Moderation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#722F37]" />
          <h2 className="font-cormorant text-2xl font-medium text-stone-900">
            Reflections &amp; Correspondence ({postComments.filter((c) => c.status === 'approved').length})
          </h2>
        </div>

        {/* Moderation Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleModeratorMode}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-colors ${
              isModeratorMode
                ? 'bg-[#722F37] text-white font-medium shadow-xs'
                : 'bg-stone-200/70 hover:bg-stone-300/70 text-stone-700'
            }`}
            title={isAdmin ? "Toggle Moderator Controls" : "Restricted to Administrator"}
            id="moderator-mode-toggle"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>{isModeratorMode ? 'Moderator View (Active)' : 'Moderator Tools'}</span>
            {pendingCount + flaggedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-stone-900 text-[10px] font-bold flex items-center justify-center ml-0.5">
                {pendingCount + flaggedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Moderation Filter Bar (when active) */}
      {isModeratorMode && (
        <div className="mb-6 p-3 rounded-xl bg-stone-100/90 border border-stone-300 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-500 font-medium mr-1">Filter:</span>
            {(['all', 'approved', 'pending', 'flagged'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setModerationFilter(filter)}
                className={`px-2.5 py-1 rounded capitalize transition-all ${
                  moderationFilter === filter
                    ? 'bg-stone-800 text-white font-medium'
                    : 'bg-white text-stone-600 hover:bg-stone-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-stone-500">
            <span>Approved: {postComments.filter((c) => c.status === 'approved').length}</span> &middot;{' '}
            <span className="text-amber-700 font-medium">Pending: {pendingCount}</span> &middot;{' '}
            <span className="text-red-700 font-medium">Flagged: {flaggedCount}</span>
          </div>
        </div>
      )}

      {/* Comment Thread */}
      <div className="space-y-4 mb-8">
        {displayedComments.length === 0 ? (
          <div className="py-8 text-center bg-white/40 rounded-xl border border-dashed border-stone-300 text-xs font-comic text-stone-500">
            No reflections recorded for this post yet. Leave the first mark below.
          </div>
        ) : (
          displayedComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-xl border transition-all ${
                comment.isAdmin
                  ? 'bg-[#722F37]/5 border-[#722F37]/30'
                  : 'bg-white/80 border-stone-200 shadow-2xs'
              } ${
                comment.status === 'flagged' ? 'border-red-300 bg-red-50/50' : ''
              } ${
                comment.status === 'pending' ? 'border-amber-300 bg-amber-50/50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-serif font-bold ${
                      comment.isAdmin
                        ? 'bg-[#722F37] text-white'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {comment.isAdmin ? 'M' : comment.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-stone-900">
                        {comment.authorName}
                      </span>
                      {comment.isAdmin && (
                        <span className="px-1.5 py-0.5 rounded bg-[#722F37] text-white text-[9px] font-sans font-medium uppercase tracking-wider">
                          Author
                        </span>
                      )}
                      {comment.status !== 'approved' && isModeratorMode && (
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-medium uppercase ${
                            comment.status === 'flagged'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {comment.status}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-stone-400 font-sans block">
                      {comment.createdAt.replace(/&middot;/g, '·')}
                    </span>
                  </div>
                </div>

                {/* Moderation Action Buttons for each comment */}
                {isModeratorMode && (
                  <div className="flex items-center gap-1">
                    {comment.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => onUpdateCommentStatus(comment.id, 'approved')}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Approve Comment"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {comment.status !== 'flagged' && (
                      <button
                        type="button"
                        onClick={() => onUpdateCommentStatus(comment.id, 'flagged')}
                        className="p-1 text-amber-600 hover:bg-amber-50 rounded"
                        title="Flag Comment"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 text-stone-400 hover:text-red-600 rounded"
                      title="Delete Comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              <p className="text-sm font-comic text-stone-800 leading-relaxed pl-9 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 p-5 rounded-2xl border border-stone-200/90 shadow-xs space-y-3"
        id="new-comment-form"
      >
        <h3 className="flex items-center gap-2 text-xs font-semibold text-stone-800 pb-1">
          <User className="w-3.5 h-3.5 text-[#722F37]" />
          <span>Leave a Reflection or Letter</span>
        </h3>

        {/* Anti-Spam Honeypot Field (invisible to genuine users, traps automated bots) */}
        <div
          aria-hidden="true"
          style={{ display: 'none', position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}
        >
          <label htmlFor="hp_comment_website">Leave this field empty</label>
          <input
            type="text"
            id="hp_comment_website"
            name="hp_comment_website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              required
              placeholder="Your Name *"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-sans text-stone-900 focus:outline-none focus:border-[#722F37] focus:bg-white"
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (Optional, kept private)"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-sans text-stone-900 focus:outline-none focus:border-[#722F37] focus:bg-white"
            />
          </div>
        </div>

        <div>
          <textarea
            rows={3}
            required
            placeholder="Share your thoughts, questions, or counter-theses..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-comic text-stone-900 focus:outline-none focus:border-[#722F37] focus:bg-white resize-none leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-stone-400 font-sans">
            Comments are moderated for civility and intellectual honesty.
          </div>

          <div className="flex items-center gap-3">
            {submittedFeedback && (
              <span className="text-xs text-emerald-700 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" /> Reflection posted
              </span>
            )}
            <button
              type="submit"
              disabled={isSubmitting || !commentText.trim() || !authorName.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-lg shadow-xs transition-colors disabled:opacity-40"
              id="submit-comment-btn"
            >
              <Send className="w-3 h-3" />
              <span>Send Reflection</span>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

export default CommentsSection;
