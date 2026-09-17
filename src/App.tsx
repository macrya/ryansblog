/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type {
  ActiveSection,
  Poem,
  CuriosityEssay,
  ComputerArticle,
  DiaryPost,
  BlogComment,
} from './types';
import {
  INITIAL_POEMS,
  INITIAL_CURIOSITIES,
  INITIAL_COMPUTER_ARTICLES,
  INITIAL_DIARY_POSTS,
  INITIAL_COMMENTS,
} from './data/initialContent';
import { Navigation } from './components/Navigation';
import { PoetSection } from './components/PoetSection';
import { RandomKnowledgeSection } from './components/RandomKnowledgeSection';
import { ComputerSection } from './components/ComputerSection';
import { DiarySection } from './components/DiarySection';
import { CMSModal } from './components/CMSModal';
import { SearchModal } from './components/SearchModal';
import { RSSModal } from './components/RSSModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { StartOverModal } from './components/StartOverModal';
import { ToastProvider, useToast } from './components/Toast';
import { clearAllPersistentImages } from './utils/persistentStorage';
import {
  auth,
  verifyUserIsAdmin,
  subscribeToPoems,
  subscribeToCuriosities,
  subscribeToComputerArticles,
  subscribeToDiaryPosts,
  subscribeToComments,
  fetchDiaryPostsFromCloud,
  persistPoem,
  deletePoemFromCloud,
  persistCuriosity,
  deleteCuriosityFromCloud,
  persistComputerArticle,
  deleteComputerArticleFromCloud,
  persistDiaryPost,
  deleteDiaryPostFromCloud,
  persistComment,
  updateCommentStatusInCloud,
  deleteCommentFromCloud,
  seedInitialContentIfEmpty,
  resetCloudToDefaults,
  clearCloudContent,
} from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  Github,
  Instagram,
  Youtube,
  Music,
  Feather,
  Compass,
  Terminal,
  BookOpen,
  Search,
  Rss,
  ArrowUp,
  ExternalLink,
  Shield,
  Lock,
  RotateCcw,
} from 'lucide-react';

export default function App() {
  return (
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  );
}

function AppInner() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<ActiveSection>('poet');
  const [isDiaryZenMode, setIsDiaryZenMode] = useState<boolean>(false);
  const [isCMSOpen, setIsCMSOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isRSSOpen, setIsRSSOpen] = useState<boolean>(false);
  const [selectedCuriosityId, setSelectedCuriosityId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return Boolean(sessionStorage.getItem('markryan_admin_token'));
    }
    return false;
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isStartOverOpen, setIsStartOverOpen] = useState<boolean>(false);

  // Persistent collections
  const [poems, setPoems] = useState<Poem[]>(() => {
    const saved = localStorage.getItem('markryan_poems');
    return saved ? JSON.parse(saved) : INITIAL_POEMS;
  });

  const [curiosities, setCuriosities] = useState<CuriosityEssay[]>(() => {
    const saved = localStorage.getItem('markryan_curiosities');
    return saved ? JSON.parse(saved) : INITIAL_CURIOSITIES;
  });

  const [computerArticles, setComputerArticles] = useState<ComputerArticle[]>(() => {
    const saved = localStorage.getItem('markryan_computer');
    return saved ? JSON.parse(saved) : INITIAL_COMPUTER_ARTICLES;
  });

  const [diaryPosts, setDiaryPosts] = useState<DiaryPost[]>(() => {
    const saved = localStorage.getItem('markryan_diary');
    return saved ? JSON.parse(saved) : INITIAL_DIARY_POSTS;
  });

  // Comments for the blog posts with local persistence
  const [comments, setComments] = useState<BlogComment[]>(() => {
    const saved = localStorage.getItem('markryan_blog_comments');
    return saved ? JSON.parse(saved) : INITIAL_COMMENTS;
  });

  // 1. Firebase Authentication Listener (Verified Server State)
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isPrivileged = await verifyUserIsAdmin(user);
        setIsAdmin(isPrivileged);
      } else {
        const hasSessionToken =
          typeof window !== 'undefined' &&
          Boolean(sessionStorage.getItem('markryan_admin_token'));
        setIsAdmin(hasSessionToken);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Cloud Firestore Realtime Synchronization (Content Persistence across versions)
  useEffect(() => {
    // Seed default portfolio documents if Firestore is initially empty
    seedInitialContentIfEmpty();

    // 1. Immediate direct server fetch to bypass any client disk cache
    fetchDiaryPostsFromCloud(true)
      .then((posts) => {
        if (posts && posts.length > 0) {
          setDiaryPosts(posts);
        }
      })
      .catch((err) => {
        console.warn('Initial server fetch for diary posts:', err);
      });

    // 2. Real-time continuous subscriptions across all devices and sessions
    const unsubPoems = subscribeToPoems((cloudPoems) => {
      setPoems(cloudPoems);
    });

    const unsubCuriosities = subscribeToCuriosities((cloudCuriosities) => {
      setCuriosities(cloudCuriosities);
    });

    const unsubArticles = subscribeToComputerArticles((cloudArticles) => {
      setComputerArticles(cloudArticles);
    });

    const unsubDiary = subscribeToDiaryPosts((cloudPosts) => {
      setDiaryPosts(cloudPosts);
    });

    const unsubComments = subscribeToComments((cloudComments) => {
      setComments(cloudComments);
    });

    return () => {
      unsubPoems();
      unsubCuriosities();
      unsubArticles();
      unsubDiary();
      unsubComments();
    };
  }, []);

  // Sync state to localStorage safely for instant offline fallback
  useEffect(() => {
    try {
      localStorage.setItem('markryan_poems', JSON.stringify(poems));
    } catch (e) {
      console.warn('LocalStorage quota reached for poems:', e);
    }
  }, [poems]);

  useEffect(() => {
    try {
      localStorage.setItem('markryan_curiosities', JSON.stringify(curiosities));
    } catch (e) {
      console.warn('LocalStorage quota reached for curiosities:', e);
    }
  }, [curiosities]);

  useEffect(() => {
    try {
      localStorage.setItem('markryan_computer', JSON.stringify(computerArticles));
    } catch (e) {
      console.warn('LocalStorage quota reached for computer articles:', e);
    }
  }, [computerArticles]);

  useEffect(() => {
    try {
      localStorage.setItem('markryan_diary', JSON.stringify(diaryPosts));
    } catch (e) {
      console.warn('LocalStorage quota reached for diary posts:', e);
    }
  }, [diaryPosts]);

  useEffect(() => {
    try {
      localStorage.setItem('markryan_blog_comments', JSON.stringify(comments));
    } catch (e) {
      console.warn('LocalStorage quota reached for comments:', e);
    }
  }, [comments]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K to trigger search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Section navigation
  const handleSelectSection = (section: ActiveSection) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigating to item from Search Results
  const handleNavigateFromSearch = (section: ActiveSection, itemId: string) => {
    setActiveSection(section);
    if (section === 'curiosities') {
      setSelectedCuriosityId(itemId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CMS Content Additions & Deletions (Realtime Local + Persistent Cloud Firestore)
  const handleAddPoem = async (newPoem: Poem) => {
    try {
      await persistPoem(newPoem);
      setPoems((prev) => [newPoem, ...prev.filter((p) => p.id !== newPoem.id)]);
      showToast(`Poem "${newPoem.title}" published & saved to Cloud Firestore.`, 'success', 'Saved');
    } catch (err: any) {
      console.error('Could not persist poem to cloud:', err);
      const isAuthIssue = !auth.currentUser || err?.code === 'permission-denied';
      showToast(
        isAuthIssue
          ? 'Cloud write rejected: Please authenticate with your Firebase Admin account (kimmarkryan5@gmail.com).'
          : (err?.message || 'Failed to persist poem to cloud storage.'),
        'error',
        'Persistence Error'
      );
      if (isAuthIssue) {
        setIsAdminLoginOpen(true);
      }
    }
  };

  const handleDeletePoem = async (id: string) => {
    try {
      await deletePoemFromCloud(id);
      setPoems((prev) => prev.filter((p) => p.id !== id));
      showToast('Poem deleted from Cloud Firestore.', 'info', 'Deleted');
    } catch (err: any) {
      console.error('Could not delete poem from cloud:', err);
      showToast(err?.message || 'Failed to delete poem from cloud storage.', 'error', 'Delete Error');
    }
  };

  const handleAddCuriosity = async (newCuriosity: CuriosityEssay) => {
    try {
      await persistCuriosity(newCuriosity);
      setCuriosities((prev) => [newCuriosity, ...prev.filter((c) => c.id !== newCuriosity.id)]);
      showToast(`Curiosity "${newCuriosity.title}" published & saved to Cloud Firestore.`, 'success', 'Saved');
    } catch (err: any) {
      console.error('Could not persist curiosity essay to cloud:', err);
      const isAuthIssue = !auth.currentUser || err?.code === 'permission-denied';
      showToast(
        isAuthIssue
          ? 'Cloud write rejected: Please authenticate with your Firebase Admin account (kimmarkryan5@gmail.com).'
          : (err?.message || 'Failed to persist essay to cloud storage.'),
        'error',
        'Persistence Error'
      );
      if (isAuthIssue) {
        setIsAdminLoginOpen(true);
      }
    }
  };

  const handleDeleteCuriosity = async (id: string) => {
    try {
      await deleteCuriosityFromCloud(id);
      setCuriosities((prev) => prev.filter((c) => c.id !== id));
      showToast('Curiosity essay deleted from Cloud Firestore.', 'info', 'Deleted');
    } catch (err: any) {
      console.error('Could not delete curiosity from cloud:', err);
      showToast(err?.message || 'Failed to delete curiosity from cloud storage.', 'error', 'Delete Error');
    }
  };

  const handleAddComputerArticle = async (newArticle: ComputerArticle) => {
    try {
      await persistComputerArticle(newArticle);
      setComputerArticles((prev) => [newArticle, ...prev.filter((a) => a.id !== newArticle.id)]);
      showToast(`Computer article "${newArticle.title}" published & saved to Cloud Firestore.`, 'success', 'Saved');
    } catch (err: any) {
      console.error('Could not persist computer article to cloud:', err);
      const isAuthIssue = !auth.currentUser || err?.code === 'permission-denied';
      showToast(
        isAuthIssue
          ? 'Cloud write rejected: Please authenticate with your Firebase Admin account (kimmarkryan5@gmail.com).'
          : (err?.message || 'Failed to persist computer article to cloud storage.'),
        'error',
        'Persistence Error'
      );
      if (isAuthIssue) {
        setIsAdminLoginOpen(true);
      }
    }
  };

  const handleDeleteComputerArticle = async (id: string) => {
    try {
      await deleteComputerArticleFromCloud(id);
      setComputerArticles((prev) => prev.filter((a) => a.id !== id));
      showToast('Computer article deleted from Cloud Firestore.', 'info', 'Deleted');
    } catch (err: any) {
      console.error('Could not delete computer article from cloud:', err);
      showToast(err?.message || 'Failed to delete computer article from cloud storage.', 'error', 'Delete Error');
    }
  };

  const handleSaveNewDiaryPost = async (newPost: DiaryPost) => {
    try {
      await persistDiaryPost(newPost);
      setDiaryPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);
      showToast(`Diary post "${newPost.title}" published & saved to Cloud Firestore.`, 'success', 'Saved');
    } catch (err: any) {
      console.error('Could not persist diary post to cloud:', err);
      const isAuthIssue = !auth.currentUser || err?.code === 'permission-denied';
      showToast(
        isAuthIssue
          ? 'Cloud write rejected: Please authenticate with your Firebase Admin account (kimmarkryan5@gmail.com).'
          : (err?.message || 'Failed to persist diary entry to cloud storage.'),
        'error',
        'Persistence Error'
      );
      if (isAuthIssue) {
        setIsAdminLoginOpen(true);
      }
    }
  };

  const handleDeleteDiaryPost = async (id: string) => {
    try {
      await deleteDiaryPostFromCloud(id);
      setDiaryPosts((prev) => prev.filter((p) => p.id !== id));
      showToast('Diary post deleted from Cloud Firestore.', 'info', 'Deleted');
    } catch (err: any) {
      console.error('Could not delete diary post from cloud:', err);
      showToast(err?.message || 'Failed to delete diary entry from cloud storage.', 'error', 'Delete Error');
    }
  };

  // Admin Authentication Actions
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setActiveSection('admin');
  };

  const handleAdminLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase sign out error:', e);
    }
    sessionStorage.removeItem('markryan_admin_token');
    localStorage.removeItem('markryan_is_admin');
    setIsAdmin(false);
    if (activeSection === 'admin') {
      setActiveSection('poet');
    }
  };

  const handleOpenCMS = () => {
    if (!isAdmin) {
      setIsAdminLoginOpen(true);
      return;
    }
    setIsCMSOpen(true);
  };

  // Comments & Moderation Actions (Realtime + Cloud Firestore)
  const handleAddComment = async (newComment: BlogComment) => {
    try {
      await persistComment(newComment);
      setComments((prev) => [newComment, ...prev.filter((c) => c.id !== newComment.id)]);
      showToast('Your reflection has been submitted.', 'success', 'Submitted');
    } catch (err: any) {
      console.error('Could not persist comment to cloud:', err);
      showToast(err?.message || 'Failed to submit comment to cloud database.', 'error', 'Comment Error');
    }
  };

  const handleUpdateCommentStatus = async (commentId: string, status: 'approved' | 'pending' | 'flagged') => {
    try {
      await updateCommentStatusInCloud(commentId, status);
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, status } : c))
      );
      showToast(`Comment status updated to ${status}.`, 'info', 'Status Updated');
    } catch (err: any) {
      console.error('Could not update comment status in cloud:', err);
      showToast(err?.message || 'Failed to update comment status in cloud database.', 'error', 'Moderation Error');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentFromCloud(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast('Comment deleted from Cloud Firestore.', 'info', 'Deleted');
    } catch (err: any) {
      console.error('Could not delete comment from cloud:', err);
      showToast(err?.message || 'Failed to delete comment from cloud database.', 'error', 'Delete Error');
    }
  };

  // Start Over & Reset Website Handlers (Local + Firestore Synchronization)
  const handleResetToDefaults = async () => {
    try {
      await resetCloudToDefaults();
      setPoems(INITIAL_POEMS);
      setCuriosities(INITIAL_CURIOSITIES);
      setComputerArticles(INITIAL_COMPUTER_ARTICLES);
      setDiaryPosts(INITIAL_DIARY_POSTS);
      setComments(INITIAL_COMMENTS);
      localStorage.setItem('markryan_poems', JSON.stringify(INITIAL_POEMS));
      localStorage.setItem('markryan_curiosities', JSON.stringify(INITIAL_CURIOSITIES));
      localStorage.setItem('markryan_computer', JSON.stringify(INITIAL_COMPUTER_ARTICLES));
      localStorage.setItem('markryan_diary', JSON.stringify(INITIAL_DIARY_POSTS));
      localStorage.setItem('markryan_blog_comments', JSON.stringify(INITIAL_COMMENTS));
      showToast('Website content restored to defaults.', 'success', 'Defaults Restored');
    } catch (e: any) {
      console.error('Error resetting to defaults:', e);
      showToast(e?.message || 'Failed to reset cloud content to defaults.', 'error', 'Reset Error');
    }
  };

  const handleStartFromScratch = async () => {
    try {
      await clearCloudContent(poems, curiosities, computerArticles, diaryPosts, comments);
      setPoems([]);
      setCuriosities([]);
      setComputerArticles([]);
      setDiaryPosts([]);
      setComments([]);
      localStorage.setItem('markryan_poems', JSON.stringify([]));
      localStorage.setItem('markryan_curiosities', JSON.stringify([]));
      localStorage.setItem('markryan_computer', JSON.stringify([]));
      localStorage.setItem('markryan_diary', JSON.stringify([]));
      localStorage.setItem('markryan_blog_comments', JSON.stringify([]));
      showToast('Cloud Firestore content wiped clean.', 'info', 'Content Cleared');
    } catch (e: any) {
      console.error('Error clearing cloud content:', e);
      showToast(e?.message || 'Failed to clear cloud content.', 'error', 'Clear Error');
    }
  };

  const handleClearMediaStorage = async () => {
    try {
      await clearAllPersistentImages();
      localStorage.removeItem('markryan_recent_uploads');
      localStorage.removeItem('markryan_brand_avatar_data');
      showToast('Local media storage and cached uploads cleared.', 'info', 'Media Cleared');
    } catch (e: any) {
      console.error('Error clearing media storage:', e);
      showToast(e?.message || 'Failed to clear media storage.', 'error', 'Clear Error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f3f3f4] text-stone-900 selection:bg-[#722F37] selection:text-white font-sans">
      {/* Global Navigation Header */}
      <Navigation
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        isDiaryZenMode={isDiaryZenMode}
        onToggleDiaryZenMode={() => setIsDiaryZenMode(!isDiaryZenMode)}
        onOpenCMS={handleOpenCMS}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenRSS={() => setIsRSSOpen(true)}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onLogoutAdmin={handleAdminLogout}
        onOpenStartOver={() => setIsStartOverOpen(true)}
      />

      {/* Main Architectural Content */}
      <div className="flex-1">
        {activeSection === 'poet' && (
          <PoetSection
            poems={poems}
            isAdmin={isAdmin}
            onDeletePoem={handleDeletePoem}
          />
        )}

        {activeSection === 'curiosities' && (
          <RandomKnowledgeSection
            essays={curiosities}
            activeEssayId={selectedCuriosityId}
            onSelectEssay={(id) => setSelectedCuriosityId(id)}
            isAdmin={isAdmin}
            onDeleteCuriosity={handleDeleteCuriosity}
          />
        )}

        {activeSection === 'computer' && (
          <ComputerSection
            articles={computerArticles}
            isAdmin={isAdmin}
            onDeleteComputerArticle={handleDeleteComputerArticle}
          />
        )}

        {activeSection === 'diary' && (
          <DiarySection
            posts={diaryPosts}
            comments={comments}
            onAddComment={handleAddComment}
            onUpdateCommentStatus={handleUpdateCommentStatus}
            onDeleteComment={handleDeleteComment}
            onSaveNewPost={handleSaveNewDiaryPost}
            onDeletePost={handleDeleteDiaryPost}
            isZenMode={isDiaryZenMode}
            onToggleZenMode={() => setIsDiaryZenMode(!isDiaryZenMode)}
            onOpenRSS={() => setIsRSSOpen(true)}
            isAdmin={isAdmin}
            onRequireAdminAuth={() => setIsAdminLoginOpen(true)}
          />
        )}

        {activeSection === 'admin' && (
          isAdmin ? (
            <AdminDashboard
              onLogout={handleAdminLogout}
              onViewSite={(section) => handleSelectSection(section || 'poet')}
              onOpenCMS={handleOpenCMS}
              poems={poems}
              curiosities={curiosities}
              computerArticles={computerArticles}
              diaryPosts={diaryPosts}
              comments={comments}
              onDeletePoem={handleDeletePoem}
              onDeleteCuriosity={handleDeleteCuriosity}
              onDeleteComputerArticle={handleDeleteComputerArticle}
              onDeleteDiaryPost={handleDeleteDiaryPost}
              onUpdateCommentStatus={handleUpdateCommentStatus}
              onDeleteComment={handleDeleteComment}
              onOpenStartOver={() => setIsStartOverOpen(true)}
              isFirebaseAuthActive={Boolean(auth.currentUser)}
              currentUserEmail={auth.currentUser?.email || null}
              onRequireAdminAuth={() => setIsAdminLoginOpen(true)}
            />
          ) : (
            <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#722F37] text-white mx-auto flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-cormorant text-3xl font-medium text-stone-900">Restricted Admins Page</h2>
              <p className="text-xs text-stone-600 font-sans">
                This page is reserved for the site administrator. Please authenticate with your passcode.
              </p>
              <button
                type="button"
                onClick={() => setIsAdminLoginOpen(true)}
                className="px-5 py-2.5 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-xl shadow-xs transition-colors"
                id="enter-admin-passcode-btn"
              >
                Enter Admin Passcode
              </button>
            </div>
          )
        )}
      </div>

      {/* Global Footer (Hidden in Diary mode to preserve the pure unlined blank page) */}
      {activeSection !== 'diary' && (
        <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-6 h-6 rounded-full bg-[#722F37] text-white text-xs font-serif font-bold flex items-center justify-center">
                  M
                </span>
                <span className="font-cormorant text-xl font-medium text-stone-100">
                  MarkRyan
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans max-w-sm">
                Creative Developer &amp; Technical Architect &middot; Crafting at the intersection of
                literature, mechanical engineering, and distributed software systems.
              </p>
            </div>

            {/* Quick Navigation in Footer */}
            <div className="flex items-center gap-5 text-xs text-stone-400">
              <button
                type="button"
                onClick={() => handleSelectSection('poet')}
                className="hover:text-white transition-colors"
              >
                The Poet
              </button>
              <button
                type="button"
                onClick={() => handleSelectSection('curiosities')}
                className="hover:text-white transition-colors"
              >
                Curiosities
              </button>
              <button
                type="button"
                onClick={() => handleSelectSection('computer')}
                className="hover:text-white transition-colors"
              >
                Computer Stuff
              </button>
              <button
                type="button"
                onClick={() => handleSelectSection('diary')}
                className="hover:text-white transition-colors"
              >
                The Diary
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hover:text-white transition-colors flex items-center gap-1 text-stone-400"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRSSOpen(true)}
                className="hover:text-orange-400 transition-colors flex items-center gap-1 text-orange-400/90 font-medium"
                title="View Blog RSS Feed"
                id="footer-rss-btn"
              >
                <Rss className="w-3.5 h-3.5" />
                <span>RSS Feed</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isAdmin) {
                    handleSelectSection('admin');
                  } else {
                    setIsAdminLoginOpen(true);
                  }
                }}
                className={`transition-colors flex items-center gap-1 text-xs ${
                  isAdmin
                    ? 'text-amber-300 hover:text-amber-200 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title={isAdmin ? "Go to Admins Dashboard" : "Admin Login"}
                id="footer-admin-btn"
              >
                {isAdmin ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admins Page (Active)</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Admin Portal</span>
                  </>
                )}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsStartOverOpen(true)}
                  className="text-stone-400 hover:text-red-400 transition-colors flex items-center gap-1 text-xs"
                  title="Start Over / Reset Website Content & Media Storage"
                  id="footer-start-over-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                  <span>Start Over</span>
                </button>
              )}
            </div>

            {/* Global Social Links */}
            <div className="flex items-center gap-4 text-stone-400">
              <a
                href="https://github.com/macrya"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors p-2 rounded-lg hover:bg-stone-800"
                title="GitHub (@macrya)"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/ryan_indubitably?stkn=MWNranFhODZzMXFtcw=="
                target="_blank"
                rel="noreferrer"
                className="hover:text-pink-400 transition-colors p-2 rounded-lg hover:bg-stone-800"
                title="Instagram (@ryan_indubitably)"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@mr.ryan.k?si=Sha9MeKQ9qx-oOOy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-stone-800"
                title="YouTube (@mr.ryan.k)"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://open.spotify.com/user/macrya"
                target="_blank"
                rel="noreferrer"
                className="hover:text-emerald-400 transition-colors p-2 rounded-lg hover:bg-stone-800"
                title="Spotify"
              >
                <Music className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
            <span>&copy; {new Date().getFullYear()} MarkRyan. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsRSSOpen(true)}
                className="text-stone-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
              >
                <Rss className="w-3 h-3 text-orange-400" />
                <span>/rss.xml</span>
              </button>
              <span>&bull;</span>
              <span>Next.js App Router</span>
              <span>&bull;</span>
              <span>Vercel Blob Client Pipeline</span>
            </div>
          </div>
        </footer>
      )}

      {/* Global Search Modal indexing Blog Posts & Random Knowledge */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        diaryPosts={diaryPosts}
        curiosities={curiosities}
        poems={poems}
        computerArticles={computerArticles}
        onNavigateToItem={handleNavigateFromSearch}
      />

      {/* RSS Feed Modal & Subscription Studio */}
      <RSSModal
        isOpen={isRSSOpen}
        onClose={() => setIsRSSOpen(false)}
        posts={diaryPosts}
      />

      {/* Full CMS Modal Studio with 16:9 ImageUploader */}
      <CMSModal
        isOpen={isCMSOpen}
        onClose={() => setIsCMSOpen(false)}
        onAddPoem={handleAddPoem}
        onAddCuriosity={handleAddCuriosity}
        onAddComputerArticle={handleAddComputerArticle}
        onAddDiaryPost={handleSaveNewDiaryPost}
      />

      {/* Admin Authentication Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={handleAdminLoginSuccess}
      />

      {/* Start Over & Reset Website Modal */}
      <StartOverModal
        isOpen={isStartOverOpen}
        onClose={() => setIsStartOverOpen(false)}
        onResetToDefaults={handleResetToDefaults}
        onStartFromScratch={handleStartFromScratch}
        onClearMediaStorage={handleClearMediaStorage}
      />
    </div>
  );
}
