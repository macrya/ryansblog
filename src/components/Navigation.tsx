import React from 'react';
import type { ActiveSection } from '../types';
import { BrandAvatar } from './BrandAvatar';
import {
  Feather,
  Compass,
  Terminal,
  BookOpen,
  PlusCircle,
  Github,
  Instagram,
  Youtube,
  Music,
  Maximize2,
  Minimize2,
  Search,
  Rss,
  Shield,
  Lock,
  LogOut,
} from 'lucide-react';

interface NavigationProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  isDiaryZenMode: boolean;
  onToggleDiaryZenMode?: () => void;
  onOpenCMS: () => void;
  onOpenSearch: () => void;
  onOpenRSS: () => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onLogoutAdmin: () => void;
}

export function Navigation({
  activeSection,
  onSelectSection,
  isDiaryZenMode,
  onToggleDiaryZenMode,
  onOpenCMS,
  onOpenSearch,
  onOpenRSS,
  isAdmin,
  onOpenAdminLogin,
  onLogoutAdmin,
}: NavigationProps) {

  // If in diary zen mode, render a very subtle, minimal watermark reveal button
  if (isDiaryZenMode && activeSection === 'diary') {
    return (
      <div className="fixed top-4 right-4 z-50 transition-opacity duration-700 opacity-20 hover:opacity-100">
        <button
          type="button"
          onClick={onToggleDiaryZenMode}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-white/70 backdrop-blur-md rounded-full border border-stone-300 shadow-sm transition-all"
          title="Exit Zen Mode / Show Navigation"
          id="exit-zen-nav-btn"
        >
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Diary Zen Mode</span>
        </button>
      </div>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 w-full bg-[#f3f3f4]/90 backdrop-blur-md border-b border-stone-200/80 transition-all duration-500"
      id="global-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Author Brand / Avatar & Monogram */}
        <div className="flex items-center gap-3">
          <BrandAvatar size="md" />
          <button
            type="button"
            onClick={() => onSelectSection('poet')}
            className="group text-left focus:outline-none"
            id="brand-home-btn"
          >
            <span className="font-cormorant text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight leading-none block group-hover:text-[#722F37] transition-colors">
              MarkRyan
            </span>
            <span className="text-[10px] tracking-wider uppercase text-stone-500 font-sans block mt-0.5">
              Creative Developer &middot; Technical Architect
            </span>
          </button>
        </div>

        {/* 4 Main Nav Sections */}
        <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 p-1 rounded-full border border-stone-300/60" id="section-nav-tabs">
          <button
            type="button"
            onClick={() => onSelectSection('poet')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSection === 'poet'
                ? 'bg-[#722F37] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
            }`}
            id="nav-tab-poet"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>The Poet / Writer</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('curiosities')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSection === 'curiosities'
                ? 'bg-[#722F37] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
            }`}
            id="nav-tab-curiosities"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Random Knowledge</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('computer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSection === 'computer'
                ? 'bg-[#722F37] text-white shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
            }`}
            id="nav-tab-computer"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Computer Stuff</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectSection('diary')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeSection === 'diary'
                ? 'bg-stone-900 text-amber-50 shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-stone-300/50'
            }`}
            id="nav-tab-diary"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>The Blog (Diary)</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => onSelectSection('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeSection === 'admin'
                  ? 'bg-[#722F37] text-white shadow-xs'
                  : 'text-[#722F37] hover:bg-[#722F37]/10'
              }`}
              id="nav-tab-admin"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admins Page</span>
            </button>
          )}
        </nav>

        {/* Global External Links & CMS Studio Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-200/60 hover:bg-stone-200 rounded-lg transition-colors border border-stone-300/50"
            title="Search blog and curiosities (⌘K)"
            id="global-search-trigger-btn"
          >
            <Search className="w-3.5 h-3.5 text-stone-500" />
            <span className="hidden sm:inline font-sans">Search</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.2 text-[10px] font-mono text-stone-500 bg-white rounded border border-stone-300">
              ⌘K
            </kbd>
          </button>

          {/* RSS Feed Discoverability Button */}
          <button
            type="button"
            onClick={onOpenRSS}
            className="p-1.5 rounded-lg text-orange-600 hover:text-orange-700 hover:bg-orange-50 transition-colors"
            title="Blog RSS Feed"
            id="global-rss-trigger-btn"
          >
            <Rss className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-stone-300 mx-0.5" />

          {/* Social Links */}
          <div className="flex items-center gap-1 text-stone-600">

            <a
              href="https://github.com/macrya"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:text-stone-950 hover:bg-stone-200/60 transition-colors"
              title="GitHub (@macrya)"
              id="social-link-github"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/ryan_indubitably?stkn=MWNranFhODZzMXFtcw=="
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:text-stone-950 hover:bg-stone-200/60 transition-colors"
              title="Instagram (@ryan_indubitably)"
              id="social-link-instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com/@mr.ryan.k?si=Sha9MeKQ9qx-oOOy"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:text-stone-950 hover:bg-stone-200/60 transition-colors"
              title="YouTube (@mr.ryan.k)"
              id="social-link-youtube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://open.spotify.com/user/macrya"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Spotify"
              id="social-link-spotify"
            >
              <Music className="w-4 h-4" />
            </a>
          </div>

          <div className="h-4 w-px bg-stone-300 mx-0.5" />

          {/* Admin vs Viewer Action Area */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenCMS}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#722F37] hover:bg-[#581c24] text-white rounded-lg text-xs font-medium shadow-xs transition-colors"
                id="open-cms-btn"
                title="CMS & 16:9 Image Pipeline"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">CMS & Uploader</span>
                <span className="sm:hidden">CMS</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectSection('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === 'admin'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                }`}
                title="Open Admins Page Console"
                id="open-admin-dashboard-btn"
              >
                <Shield className="w-3.5 h-3.5 text-[#722F37]" />
                <span className="hidden md:inline">Console</span>
              </button>

              <button
                type="button"
                onClick={onLogoutAdmin}
                className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                title="Log Out of Admin (Password Protected)"
                id="header-logout-btn"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-200/80 hover:bg-stone-300/80 text-stone-700 hover:text-stone-900 rounded-lg text-xs font-medium transition-colors border border-stone-300/60"
              title="Administrator Portal Login (Password: Mogul)"
              id="open-admin-login-btn"
            >
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Admin Access</span>
              <span className="sm:hidden">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-stone-200/60 bg-stone-100/80 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => onSelectSection('poet')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeSection === 'poet' ? 'bg-[#722F37] text-white font-medium' : 'text-stone-600'
          }`}
        >
          Poet / Writer
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('curiosities')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeSection === 'curiosities' ? 'bg-[#722F37] text-white font-medium' : 'text-stone-600'
          }`}
        >
          Curiosities
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('computer')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeSection === 'computer' ? 'bg-[#722F37] text-white font-medium' : 'text-stone-600'
          }`}
        >
          Computer
        </button>
        <button
          type="button"
          onClick={() => onSelectSection('diary')}
          className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
            activeSection === 'diary' ? 'bg-stone-900 text-white font-medium' : 'text-stone-600'
          }`}
        >
          Diary
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => onSelectSection('admin')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              activeSection === 'admin' ? 'bg-[#722F37] text-white font-medium' : 'text-[#722F37]'
            }`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
}

export default Navigation;
