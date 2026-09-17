import React, { useState } from 'react';
import type { DiaryPost, BlogComment } from '../types';
import {
  Maximize2,
  Minimize2,
  Calendar,
  PenTool,
  Check,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Save,
  Clock,
  Sparkles,
  Eye,
  Trash2,
  Rss,
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { CommentsSection } from './CommentsSection';
import { DateDisplay } from './DateDisplay';
import { DeleteButton } from './DeleteButton';

interface DiarySectionProps {
  posts: DiaryPost[];
  comments: BlogComment[];
  onAddComment: (comment: BlogComment) => void;
  onUpdateCommentStatus: (id: string, status: 'approved' | 'pending' | 'flagged') => void;
  onDeleteComment: (id: string) => void;
  onSaveNewPost: (newPost: DiaryPost) => void;
  onDeletePost?: (id: string) => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
  onOpenRSS?: () => void;
  isAdmin?: boolean;
  onRequireAdminAuth?: () => void;
}

export function DiarySection({
  posts,
  comments,
  onAddComment,
  onUpdateCommentStatus,
  onDeleteComment,
  onSaveNewPost,
  onDeletePost,
  isZenMode,
  onToggleZenMode,
  onOpenRSS,
  isAdmin = false,
  onRequireAdminAuth,
}: DiarySectionProps) {

  const [selectedPostIndex, setSelectedPostIndex] = useState<number>(0);
  const [isWritingMode, setIsWritingMode] = useState<boolean>(false);
  const [showImageUploader, setShowImageUploader] = useState<boolean>(false);

  // New post draft states
  const [draftTitle, setDraftTitle] = useState<string>('');
  const [draftContent, setDraftContent] = useState<string>('');
  const [draftLocation, setDraftLocation] = useState<string>('Studio Desk');
  const [draftImageUrl, setDraftImageUrl] = useState<string>('');
  const [draftCaption, setDraftCaption] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  const currentPost = posts[selectedPostIndex] || posts[0];

  const handlePublishEntry = () => {
    if (!draftTitle.trim() && !draftContent.trim()) return;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newPost: DiaryPost = {
      id: `diary-${Date.now()}`,
      title: draftTitle.trim() || 'Untitled Musings',
      date: formattedDate,
      time: formattedTime,
      location: draftLocation.trim() || 'Night Studio',
      content: draftContent.trim(),
      imageUrl: draftImageUrl || undefined,
      imageCaption: draftCaption.trim() || undefined,
      published: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    onSaveNewPost(newPost);
    setDraftTitle('');
    setDraftContent('');
    setDraftImageUrl('');
    setDraftCaption('');
    setShowImageUploader(false);
    setIsWritingMode(false);
    setSelectedPostIndex(0);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  return (
    <div
      className="min-h-screen bg-[#f2f2f3] text-stone-900 transition-colors duration-700 flex flex-col items-center justify-start p-4 sm:p-8 lg:p-14"
      id="blank-diary-canvas"
    >
      {/* Minimalist Floating Controls: Retaining pure unlined canvas while offering complete control */}
      <div className="w-full max-w-3xl flex items-center justify-between pb-6 border-b border-stone-300/40 text-xs font-sans text-stone-500 select-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsWritingMode(false)}
            className={`px-3 py-1 rounded-full transition-all ${
              !isWritingMode
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            id="read-diary-btn"
          >
            <span className="flex items-center gap-1.5">
              <Eye className="w-3 h-3" />
              Read Entries ({posts.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!isAdmin) {
                if (onRequireAdminAuth) onRequireAdminAuth();
                return;
              }
              setIsWritingMode(true);
            }}
            className={`px-3 py-1 rounded-full transition-all ${
              isWritingMode
                ? 'bg-stone-800 text-stone-100 font-medium'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title={isAdmin ? "Compose new diary entry" : "Administrator Only"}
            id="write-diary-btn"
          >
            <span className="flex items-center gap-1.5">
              <PenTool className="w-3 h-3" />
              New Entry {isAdmin ? '' : '(Admin)'}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="text-emerald-700 font-comic flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Entry saved
            </span>
          )}

          {onOpenRSS && (
            <button
              type="button"
              onClick={onOpenRSS}
              className="flex items-center gap-1.5 px-2.5 py-1 text-orange-700 hover:text-orange-900 bg-orange-100/70 hover:bg-orange-200/70 rounded-full transition-colors text-[11px] font-medium"
              title="Subscribe via RSS Feed"
              id="diary-rss-feed-btn"
            >
              <Rss className="w-3 h-3 text-orange-600" />
              <span>RSS Feed</span>
            </button>
          )}

          <button
            type="button"
            onClick={onToggleZenMode}
            className="flex items-center gap-1 px-2.5 py-1 text-stone-500 hover:text-stone-900 rounded hover:bg-stone-200/50 transition-colors"
            title={isZenMode ? 'Show website navigation' : 'Fade away navigation for pure diary writing'}
            id="zen-mode-toggle-btn"
          >
            {isZenMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Show Nav</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">Distraction-Free Zen</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* The Pure Unlined Blank Diary Page Container */}
      <main className="w-full max-w-3xl flex-1 mt-6 sm:mt-10">
        {!isWritingMode ? (
          /* Reading Mode */
          <article className="space-y-8 select-text" id="active-diary-entry">
            {/* Post Navigation between archived dates */}
            {posts.length > 1 && (
              <div className="flex items-center justify-between text-xs text-stone-400 font-comic pb-4">
                <button
                  type="button"
                  disabled={selectedPostIndex >= posts.length - 1}
                  onClick={() => setSelectedPostIndex((prev) => Math.min(posts.length - 1, prev + 1))}
                  className="flex items-center gap-1 hover:text-stone-800 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Older entry
                </button>

                <span>
                  Entry {selectedPostIndex + 1} of {posts.length}
                </span>

                <button
                  type="button"
                  disabled={selectedPostIndex <= 0}
                  onClick={() => setSelectedPostIndex((prev) => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 hover:text-stone-800 disabled:opacity-30 transition-colors"
                >
                  Newer entry <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {currentPost ? (
              <>
                {/* Diary Header with Cormorant Garamond */}
                <header className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-comic tracking-wide">
                    <DateDisplay
                      date={currentPost.date}
                      time={currentPost.time}
                      format="withTime"
                      showIcon
                      className="text-stone-700 font-comic font-medium"
                      iconClassName="w-3.5 h-3.5 text-stone-400"
                    />
                    {currentPost.location && (
                      <>
                        <span>&bull;</span>
                        <span>{currentPost.location}</span>
                      </>
                    )}
                    {currentPost.weather && (
                      <>
                        <span>&bull;</span>
                        <span className="italic">{currentPost.weather}</span>
                      </>
                    )}
                  </div>

                  <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light text-stone-900 tracking-tight leading-tight">
                    {currentPost.title}
                  </h1>
                </header>

                {/* Optional 16:9 Image Processed via ImageUploader */}
                {currentPost.imageUrl && (
                  <figure className="space-y-2">
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-stone-300/70 shadow-xs bg-stone-300/30">
                      <img
                        src={currentPost.imageUrl}
                        alt={currentPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {currentPost.imageCaption && (
                      <figcaption className="font-comic text-xs text-stone-500 text-center italic">
                        {currentPost.imageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Diary Body in Comic Sans: evoking a handwritten notebook */}
                <div className="font-comic text-stone-800 text-base sm:text-lg leading-relaxed whitespace-pre-line space-y-4">
                  {currentPost.content}
                </div>

                {/* Reader Comments & Moderation System for this Blog Post */}
                <CommentsSection
                  postId={currentPost.id}
                  comments={comments}
                  onAddComment={onAddComment}
                  onUpdateCommentStatus={onUpdateCommentStatus}
                  onDeleteComment={onDeleteComment}
                  isAdmin={isAdmin}
                  onRequireAdminAuth={onRequireAdminAuth}
                />

                {isAdmin && onDeletePost && (
                  <div className="pt-8 flex justify-end">
                    <DeleteButton
                      postId={currentPost.id}
                      postTitle={currentPost.title}
                      imageUrl={currentPost.imageUrl}
                      onDeleted={(id) => {
                        if (onDeletePost) onDeletePost(id);
                        setSelectedPostIndex(0);
                      }}
                      variant="minimal"
                      label="Remove entry (Admin)"
                    />
                  </div>
                )}

              </>
            ) : (
              <div className="text-center py-16 font-comic text-stone-500">
                <p>The diary page is completely fresh.</p>
                <button
                  type="button"
                  onClick={() => setIsWritingMode(true)}
                  className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-sans"
                >
                  Write the first entry
                </button>
              </div>
            )}
          </article>
        ) : (
          /* Writing Mode — A Fresh Blank Diary Page */
          <div className="space-y-6" id="diary-writing-canvas">
            <div className="flex items-center justify-between text-xs text-stone-500 font-comic pb-2">
              <div className="flex items-center gap-2">
                <span>Today &middot; {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>&bull;</span>
                <input
                  type="text"
                  placeholder="Location (e.g. Studio Loft)"
                  value={draftLocation}
                  onChange={(e) => setDraftLocation(e.target.value)}
                  className="bg-transparent border-b border-stone-300 text-stone-700 text-xs px-1 py-0.5 focus:outline-none focus:border-stone-600 font-comic"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowImageUploader(!showImageUploader)}
                className="flex items-center gap-1 text-xs text-[#722F37] hover:text-[#581c24] font-sans font-medium"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{showImageUploader ? 'Hide Uploader' : 'Attach 16:9 Image'}</span>
              </button>
            </div>

            {/* Embedded 16:9 Image Uploader Pipeline */}
            {showImageUploader && (
              <div className="mb-6">
                <ImageUploader
                  aspectRatio={16 / 9}
                  onUploadComplete={(url) => {
                    setDraftImageUrl(url);
                    setShowImageUploader(false);
                  }}
                />
              </div>
            )}

            {/* Attached Image Preview */}
            {draftImageUrl && (
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-stone-300">
                  <img src={draftImageUrl} alt="Attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraftImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-stone-900/80 text-white hover:bg-stone-900 text-xs"
                    title="Remove attached photo"
                  >
                    &times;
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional photo caption..."
                  value={draftCaption}
                  onChange={(e) => setDraftCaption(e.target.value)}
                  className="w-full bg-transparent text-xs text-stone-600 font-comic italic border-b border-stone-300 px-2 py-1 focus:outline-none"
                />
              </div>
            )}

            {/* Title in Cormorant Garamond */}
            <input
              type="text"
              placeholder="Title of this page..."
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              className="w-full bg-transparent font-cormorant text-4xl sm:text-5xl font-light text-stone-900 placeholder-stone-400 focus:outline-none border-b border-transparent focus:border-stone-300 transition-colors"
              autoFocus
              id="diary-title-input"
            />

            {/* Body in Comic Sans — pure, unlined, fresh canvas */}
            <textarea
              rows={12}
              placeholder="Start writing freely. No margins, no widgets, just the unlined sheet..."
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              className="w-full bg-transparent font-comic text-stone-800 text-base sm:text-lg leading-relaxed placeholder-stone-400 focus:outline-none resize-none border-none"
              id="diary-body-textarea"
            />

            {/* Action Bar */}
            <div className="pt-4 flex items-center justify-between border-t border-stone-300/60">
              <button
                type="button"
                onClick={() => setIsWritingMode(false)}
                className="px-4 py-2 text-xs font-sans text-stone-500 hover:text-stone-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePublishEntry}
                disabled={!draftTitle.trim() && !draftContent.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-sans font-medium transition-all disabled:opacity-40"
                id="publish-entry-btn"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save to Diary</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DiarySection;
