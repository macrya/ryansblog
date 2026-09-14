import React, { useState } from 'react';
import type {
  ActiveSection,
  Poem,
  CuriosityEssay,
  ComputerArticle,
  DiaryPost,
  BlogComment,
} from '../types';
import {
  Shield,
  PlusCircle,
  MessageSquare,
  BookOpen,
  Feather,
  Terminal,
  Compass,
  Trash2,
  Check,
  Flag,
  LogOut,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Eye,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { DateDisplay } from './DateDisplay';
import { DeleteButton } from './DeleteButton';
import { BrandAvatar } from './BrandAvatar';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewSite: (section?: ActiveSection) => void;
  onOpenCMS: () => void;
  poems: Poem[];
  curiosities: CuriosityEssay[];
  computerArticles: ComputerArticle[];
  diaryPosts: DiaryPost[];
  comments: BlogComment[];
  onDeletePoem: (id: string) => void;
  onDeleteCuriosity: (id: string) => void;
  onDeleteComputerArticle: (id: string) => void;
  onDeleteDiaryPost: (id: string) => void;
  onUpdateCommentStatus: (id: string, status: 'approved' | 'pending' | 'flagged') => void;
  onDeleteComment: (id: string) => void;
  onOpenStartOver?: () => void;
}

export function AdminDashboard({
  onLogout,
  onViewSite,
  onOpenCMS,
  poems,
  curiosities,
  computerArticles,
  diaryPosts,
  comments,
  onDeletePoem,
  onDeleteCuriosity,
  onDeleteComputerArticle,
  onDeleteDiaryPost,
  onUpdateCommentStatus,
  onDeleteComment,
  onOpenStartOver,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'diary' | 'comments' | 'curiosities' | 'poems' | 'computer'>('overview');
  const [commentFilter, setCommentFilter] = useState<'all' | 'pending' | 'flagged' | 'approved'>('all');

  const pendingComments = comments.filter((c) => c.status === 'pending');
  const flaggedComments = comments.filter((c) => c.status === 'flagged');
  const approvedComments = comments.filter((c) => c.status === 'approved');

  const filteredComments = comments.filter((c) => {
    if (commentFilter === 'all') return true;
    return c.status === commentFilter;
  });

  return (
    <div className="min-h-screen bg-[#ececee] text-stone-900 pb-24 font-sans" id="admin-dashboard-page">
      {/* Top Administrative Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#722F37] text-white flex items-center justify-center font-serif font-bold text-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cormorant text-xl font-medium text-white tracking-wide">
                  MarkRyan Admin Console
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-[#722F37] text-stone-100 text-[10px] font-sans uppercase tracking-wider font-semibold">
                  Authorized Admin
                </span>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-sans font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud Firestore Active
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Persistent CMS &middot; Real-time Multi-Device Sync &middot; Comment Moderation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCMS}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#722F37] hover:bg-[#581c24] text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
              id="admin-launch-cms-btn"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Publish New Content</span>
            </button>

            <button
              type="button"
              onClick={() => onViewSite('poet')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors"
              title="Preview Public Viewers Page"
              id="admin-view-public-site-btn"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Site</span>
            </button>

            {onOpenStartOver && (
              <button
                type="button"
                onClick={onOpenStartOver}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-red-950/60 hover:text-red-200 text-stone-300 border border-stone-700 hover:border-red-800/60 rounded-lg text-xs font-medium transition-colors"
                title="Start Over / Reset Website Content & Media Storage"
                id="admin-start-over-btn"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden sm:inline">Start Over</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-800/60 rounded-lg text-xs font-medium transition-colors"
              title="Lock Admin Console"
              id="admin-logout-btn"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 border-t border-stone-800/80 overflow-x-auto text-xs py-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diary')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'diary'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Diary Posts ({diaryPosts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'comments'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments Moderation ({comments.length})</span>
            {pendingComments.length + flaggedComments.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 font-bold text-[10px]">
                {pendingComments.length + flaggedComments.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('curiosities')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'curiosities'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Random Knowledge ({curiosities.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('poems')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'poems'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Poetry Gallery ({poems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('computer')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'computer'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Computer Scripts ({computerArticles.length})</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Greeting Card */}
            <div className="p-6 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <BrandAvatar size="lg" isAdmin={true} />
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-[#722F37] uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Authenticated Administrator Session
                  </span>
                  <h2 className="font-cormorant text-3xl font-medium text-stone-900">
                    Welcome back, MarkRyan.
                  </h2>
                  <p className="text-xs text-stone-500 max-w-xl">
                    All created and edited poems, curiosity essays, computer articles, and diary entries are permanently synchronized with Cloud Firestore. Your published content persists across deployments and devices.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenCMS}
                  className="px-4 py-2 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-xl shadow-xs transition-colors flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-amber-300" />
                  <span>Launch CMS &amp; Image Pipeline</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewSite('diary')}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-xl border border-stone-200 transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-stone-600" />
                  <span>Open The Blog (Diary)</span>
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div
                onClick={() => setActiveTab('diary')}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-[#722F37] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <BookOpen className="w-4 h-4 group-hover:text-[#722F37] transition-colors" />
                  <span className="text-[10px] uppercase font-mono">Blog</span>
                </div>
                <div className="text-2xl font-serif font-bold text-stone-900">{diaryPosts.length}</div>
                <div className="text-xs text-stone-500">Diary Posts</div>
              </div>

              <div
                onClick={() => setActiveTab('comments')}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-[#722F37] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <MessageSquare className="w-4 h-4 group-hover:text-[#722F37] transition-colors" />
                  <span className="text-[10px] uppercase font-mono">Feedback</span>
                </div>
                <div className="text-2xl font-serif font-bold text-stone-900">{comments.length}</div>
                <div className="text-xs text-stone-500">
                  {pendingComments.length > 0 ? (
                    <span className="text-amber-700 font-medium">{pendingComments.length} pending moderation</span>
                  ) : (
                    'Comments'
                  )}
                </div>
              </div>

              <div
                onClick={() => setActiveTab('curiosities')}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-[#722F37] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <Compass className="w-4 h-4 group-hover:text-[#722F37] transition-colors" />
                  <span className="text-[10px] uppercase font-mono">Curiosities</span>
                </div>
                <div className="text-2xl font-serif font-bold text-stone-900">{curiosities.length}</div>
                <div className="text-xs text-stone-500">Technical Essays</div>
              </div>

              <div
                onClick={() => setActiveTab('poems')}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-[#722F37] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <Feather className="w-4 h-4 group-hover:text-[#722F37] transition-colors" />
                  <span className="text-[10px] uppercase font-mono">Poetry</span>
                </div>
                <div className="text-2xl font-serif font-bold text-stone-900">{poems.length}</div>
                <div className="text-xs text-stone-500">Poems &amp; Canticles</div>
              </div>

              <div
                onClick={() => setActiveTab('computer')}
                className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs hover:border-[#722F37] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <Terminal className="w-4 h-4 group-hover:text-[#722F37] transition-colors" />
                  <span className="text-[10px] uppercase font-mono">Computer</span>
                </div>
                <div className="text-2xl font-serif font-bold text-stone-900">{computerArticles.length}</div>
                <div className="text-xs text-stone-500">Scripts &amp; Ontologies</div>
              </div>
            </div>

            {/* Quick Comment Moderation Queue Preview */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#722F37]" />
                  <h3 className="font-cormorant text-xl font-medium text-stone-900">
                    Pending Reader Reflections ({pendingComments.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('comments')}
                  className="text-xs text-[#722F37] hover:underline font-medium"
                >
                  Open Full Moderation Center &rarr;
                </button>
              </div>

              {pendingComments.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-500 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  All comments are currently moderated and approved. No items awaiting review.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingComments.slice(0, 3).map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80 flex items-start justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 font-medium text-stone-900">
                          <span>{comm.authorName}</span>
                          <span className="text-[10px] text-stone-400" dangerouslySetInnerHTML={{ __html: comm.createdAt }} />
                        </div>
                        <p className="text-stone-700 italic font-comic">&ldquo;{comm.content}&rdquo;</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onUpdateCommentStatus(comm.id, 'approved')}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateCommentStatus(comm.id, 'flagged')}
                          className="p-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                          title="Flag"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteComment(comm.id)}
                          className="p-1.5 bg-stone-200 hover:bg-red-100 hover:text-red-700 text-stone-600 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links to Public Views */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-stone-900">The Poet &amp; Existential Gallery</h4>
                  <p className="text-xs text-stone-500 mt-0.5">View wallpaper typography, Dostoevsky snippets, and burgundy framing</p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewSite('poet')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-stone-200 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-sm text-stone-900">Random Knowledge (Curiosities)</h4>
                  <p className="text-xs text-stone-500 mt-0.5">Explore Formula 1 aerodynamics, Venturi tunnels, and 90s combustion specs</p>
                </div>
                <button
                  type="button"
                  onClick={() => onViewSite('curiosities')}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-800 flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Danger Zone: Start Over & Reset Website */}
            {onOpenStartOver && (
              <div className="p-6 rounded-2xl bg-stone-900 text-stone-100 border border-stone-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-mono uppercase tracking-wider font-semibold">
                    <RotateCcw className="w-4 h-4" />
                    <span>Website Maintenance &amp; Reset</span>
                  </div>
                  <h4 className="text-base font-semibold text-white">
                    Start Over, Restore Curated Defaults, or Purge Image Cache
                  </h4>
                  <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                    Need a fresh canvas or want to restore the original MarkRyan portfolio? You can reset your content or purge local IndexedDB media storage at any time.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenStartOver}
                  className="px-4 py-2.5 bg-red-900/80 hover:bg-red-800 text-white rounded-xl text-xs font-medium border border-red-700/60 shadow-xs flex items-center gap-2 transition-colors shrink-0"
                  id="admin-overview-start-over-btn"
                >
                  <RotateCcw className="w-4 h-4 text-red-300" />
                  <span>Start Over / Reset Options</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* DIARY POSTS TAB */}
        {activeTab === 'diary' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cormorant text-3xl font-medium text-stone-900">The Blog (Diary Posts)</h2>
                <p className="text-xs text-stone-500">Manage all entries in the blank diary page</p>
              </div>

              <button
                type="button"
                onClick={onOpenCMS}
                className="px-4 py-2 bg-[#722F37] text-white text-xs font-medium rounded-xl hover:bg-[#581c24] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Write New Post</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diaryPosts.map((post) => (
                <div key={post.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <DateDisplay
                        date={post.date}
                        time={post.time}
                        format="withTime"
                        showIcon
                        className="text-[11px] font-mono text-stone-400"
                        iconClassName="w-3 h-3 text-stone-400"
                      />
                      <h3 className="font-cormorant text-xl font-medium text-stone-900 leading-snug mt-0.5">
                        {post.title}
                      </h3>
                    </div>

                    <DeleteButton
                      postId={post.id}
                      postTitle={post.title}
                      imageUrl={post.imageUrl}
                      onDeleted={(id) => onDeleteDiaryPost(id)}
                      variant="icon"
                    />
                  </div>

                  {post.imageUrl && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-stone-100">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}

                  <p className="text-xs font-comic text-stone-600 line-clamp-3 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>
                      Reflections: {comments.filter((c) => c.postId === post.id && c.status === 'approved').length}
                    </span>
                    <button
                      type="button"
                      onClick={() => onViewSite('diary')}
                      className="text-[#722F37] hover:underline font-medium"
                    >
                      View on Diary Canvas &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMENTS MODERATION TAB */}
        {activeTab === 'comments' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-cormorant text-3xl font-medium text-stone-900">Comment Moderation Center</h2>
                <p className="text-xs text-stone-500">Approve, flag, or remove reader correspondence</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-stone-200 text-xs">
                {(['all', 'pending', 'flagged', 'approved'] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setCommentFilter(filter)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      commentFilter === filter
                        ? 'bg-stone-900 text-white font-medium'
                        : 'text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    {filter} (
                    {filter === 'all'
                      ? comments.length
                      : filter === 'pending'
                      ? pendingComments.length
                      : filter === 'flagged'
                      ? flaggedComments.length
                      : approvedComments.length}
                    )
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {filteredComments.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-500 bg-white rounded-2xl border border-dashed border-stone-300">
                  No comments found under this filter.
                </div>
              ) : (
                filteredComments.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-4 rounded-2xl border bg-white shadow-2xs flex flex-col sm:flex-row items-start justify-between gap-4 ${
                      comm.status === 'flagged'
                        ? 'border-red-300 bg-red-50/20'
                        : comm.status === 'pending'
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-stone-200'
                    }`}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-900">{comm.authorName}</span>
                        {comm.authorEmail && (
                          <span className="text-[11px] text-stone-400 font-mono">({comm.authorEmail})</span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold ${
                            comm.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : comm.status === 'flagged'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {comm.status}
                        </span>
                        <span className="text-[11px] text-stone-400" dangerouslySetInnerHTML={{ __html: comm.createdAt }} />
                      </div>

                      <p className="text-xs font-comic text-stone-800 leading-relaxed whitespace-pre-wrap">
                        {comm.content}
                      </p>

                      <div className="text-[10px] text-stone-400 font-mono">
                        Target Post ID: {comm.postId}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {comm.status !== 'approved' && (
                        <button
                          type="button"
                          onClick={() => onUpdateCommentStatus(comm.id, 'approved')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {comm.status !== 'flagged' && (
                        <button
                          type="button"
                          onClick={() => onUpdateCommentStatus(comm.id, 'flagged')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg flex items-center gap-1"
                        >
                          <Flag className="w-3.5 h-3.5" />
                          <span>Flag</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteComment(comm.id)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 text-xs font-medium rounded-lg flex items-center gap-1"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* RANDOM KNOWLEDGE TAB */}
        {activeTab === 'curiosities' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cormorant text-3xl font-medium text-stone-900">Random Knowledge (Curiosities)</h2>
                <p className="text-xs text-stone-500">Archival essays on aerodynamics and 90s combustion</p>
              </div>

              <button
                type="button"
                onClick={onOpenCMS}
                className="px-4 py-2 bg-[#722F37] text-white text-xs font-medium rounded-xl hover:bg-[#581c24] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>Publish New Curiosity</span>
              </button>
            </div>

            <div className="space-y-4">
              {curiosities.map((essay) => (
                <div key={essay.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-100 text-amber-900">
                        {essay.category}
                      </span>
                      <h3 className="font-cormorant text-xl font-medium text-stone-900 mt-1">
                        {essay.title}
                      </h3>
                      <p className="text-xs text-stone-500 font-sans mt-0.5">{essay.summary}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteCuriosity(essay.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Essay"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POETRY TAB */}
        {activeTab === 'poems' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cormorant text-3xl font-medium text-stone-900">Poetry Gallery</h2>
                <p className="text-xs text-stone-500">Love and existential verse framed in burgundy</p>
              </div>

              <button
                type="button"
                onClick={onOpenCMS}
                className="px-4 py-2 bg-[#722F37] text-white text-xs font-medium rounded-xl hover:bg-[#581c24] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>New Poem</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {poems.map((poem) => (
                <div key={poem.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-[#722F37] font-semibold uppercase tracking-wider">
                        {poem.theme} &middot; {poem.date}
                      </span>
                      <h3 className="font-cormorant text-xl font-medium text-stone-900">
                        {poem.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeletePoem(poem.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {poem.quoteExcerpt && (
                    <p className="text-xs font-serif italic text-stone-600 pl-3 border-l-2 border-[#722F37]">
                      &ldquo;{poem.quoteExcerpt}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPUTER STUFF TAB */}
        {activeTab === 'computer' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cormorant text-3xl font-medium text-stone-900">Computer Stuff</h2>
                <p className="text-xs text-stone-500">Engineering ontologies, OSINT crawlers, and UNIX code blocks</p>
              </div>

              <button
                type="button"
                onClick={onOpenCMS}
                className="px-4 py-2 bg-[#722F37] text-white text-xs font-medium rounded-xl hover:bg-[#581c24] flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>New Script / Article</span>
              </button>
            </div>

            <div className="space-y-4">
              {computerArticles.map((art) => (
                <div key={art.id} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-stone-400 uppercase">{art.category}</span>
                      <h3 className="font-bajaderka text-xl font-medium text-stone-900">{art.title}</h3>
                      <p className="text-xs text-stone-600 font-sans mt-0.5">{art.philosophicalThesis}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteComputerArticle(art.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
