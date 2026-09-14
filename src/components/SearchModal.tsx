import React, { useState, useMemo, useEffect, useRef } from 'react';
import type {
  ActiveSection,
  DiaryPost,
  CuriosityEssay,
  Poem,
  ComputerArticle,
  SearchResultItem,
} from '../types';
import {
  Search,
  X,
  Compass,
  BookOpen,
  Feather,
  Terminal,
  ArrowRight,
  Clock,
  Calendar,
  Sparkles,
  Layers,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  diaryPosts: DiaryPost[];
  curiosities: CuriosityEssay[];
  poems?: Poem[];
  computerArticles?: ComputerArticle[];
  onNavigateToItem: (section: ActiveSection, itemId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  diaryPosts,
  curiosities,
  poems = [],
  computerArticles = [],
  onNavigateToItem,
}: SearchModalProps) {
  const [query, setQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'diary' | 'curiosities' | 'other'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Search indexing engine
  const searchIndex: SearchResultItem[] = useMemo(() => {
    const items: SearchResultItem[] = [];

    // 1. Index Blog / Diary Posts
    diaryPosts.forEach((post) => {
      items.push({
        id: post.id,
        title: post.title,
        section: 'diary',
        sectionLabel: 'The Blog (Diary)',
        summary: post.content.slice(0, 180) + '...',
        matchExcerpt: `${post.title} ${post.content} ${post.location || ''} ${post.mood || ''}`,
        dateOrCategory: `${post.date} &middot; ${post.time}`,
      });
    });

    // 2. Index Random Knowledge Curiosities
    curiosities.forEach((essay) => {
      const allText = [
        essay.title,
        essay.summary,
        ...essay.content,
        ...(essay.keyDiagramNotes?.map((n) => `${n.term} ${n.definition}`) || []),
      ].join(' ');

      items.push({
        id: essay.id,
        title: essay.title,
        section: 'curiosities',
        sectionLabel: 'Random Knowledge',
        summary: essay.summary,
        matchExcerpt: allText,
        dateOrCategory: `${essay.category} &middot; ${essay.readTime}`,
      });
    });

    // 3. Index Poems
    poems.forEach((poem) => {
      const stanzaText = poem.stanzas.map((s) => s.join(' ')).join(' ');
      items.push({
        id: poem.id,
        title: poem.title,
        section: 'poet',
        sectionLabel: 'The Poet / Writer',
        summary: poem.quoteExcerpt || poem.subtitle || stanzaText.slice(0, 140) + '...',
        matchExcerpt: `${poem.title} ${poem.subtitle || ''} ${poem.theme} ${stanzaText}`,
        dateOrCategory: `Poem &middot; ${poem.theme}`,
      });
    });

    // 4. Index Computer Articles
    computerArticles.forEach((art) => {
      items.push({
        id: art.id,
        title: art.title,
        section: 'computer',
        sectionLabel: 'Computer Stuff',
        summary: art.philosophicalThesis,
        matchExcerpt: `${art.title} ${art.subtitle} ${art.philosophicalThesis} ${art.body.join(' ')}`,
        dateOrCategory: art.category,
      });
    });

    return items;
  }, [diaryPosts, curiosities, poems, computerArticles]);

  // Execute filtering & ranking
  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return searchIndex.filter((item) => {
      if (selectedFilter === 'diary' && item.section !== 'diary') return false;
      if (selectedFilter === 'curiosities' && item.section !== 'curiosities') return false;
      if (selectedFilter === 'other' && (item.section === 'diary' || item.section === 'curiosities')) return false;

      const titleMatch = item.title.toLowerCase().includes(trimmed);
      const excerptMatch = item.matchExcerpt.toLowerCase().includes(trimmed);
      return titleMatch || excerptMatch;
    });
  }, [query, searchIndex, selectedFilter]);

  if (!isOpen) return null;

  const handleSelect = (item: SearchResultItem) => {
    onNavigateToItem(item.section, item.id);
    onClose();
  };

  // Helper to extract a relevant snippet with the searched word
  const getHighlightedSnippet = (text: string, queryStr: string) => {
    if (!queryStr) return text.slice(0, 160) + '...';
    const index = text.toLowerCase().indexOf(queryStr.toLowerCase());
    if (index === -1) return text.slice(0, 160) + '...';

    const start = Math.max(0, index - 40);
    const end = Math.min(text.length, index + queryStr.length + 80);
    const prefix = start > 0 ? '...' : '';
    const suffix = end < text.length ? '...' : '';
    return prefix + text.slice(start, end) + suffix;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
      id="search-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[80vh]"
        id="search-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center gap-3 bg-stone-50/70">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search across blog posts & Random Knowledge essays..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none font-sans"
            id="site-search-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-stone-400 bg-stone-200 rounded border border-stone-300">
            ESC
          </kbd>
        </div>

        {/* Section Filters */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-white border-b border-stone-100 text-xs overflow-x-auto">
          <span className="text-stone-400 text-[11px] font-medium mr-1">Index:</span>
          <button
            type="button"
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              selectedFilter === 'all'
                ? 'bg-stone-900 text-white font-medium'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Content
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('diary')}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              selectedFilter === 'diary'
                ? 'bg-[#722F37] text-white font-medium'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Blog Posts ({diaryPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('curiosities')}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              selectedFilter === 'curiosities'
                ? 'bg-amber-900 text-white font-medium'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Random Knowledge ({curiosities.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter('other')}
            className={`px-2.5 py-1 rounded-full transition-colors ${
              selectedFilter === 'other'
                ? 'bg-stone-800 text-white font-medium'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Poetry &amp; Code
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-5 divide-y divide-stone-100">
          {!query.trim() ? (
            <div className="py-8 text-center text-xs text-stone-500 font-sans space-y-3">
              <p>Type keywords to search essays, aerodynamics, engines, or diary reflections.</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-[11px] text-stone-400">Popular queries:</span>
                {['Venturi', 'RB26', 'VTEC', 'Dostoevsky', 'Tor SOCKS5', 'UNIX Pipe'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] font-mono border border-stone-200"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center text-stone-500 font-sans text-xs space-y-1">
              <p className="font-medium text-stone-700">No matching entries found for &ldquo;{query}&rdquo;</p>
              <p className="text-stone-400">Try searching for broader terms like &quot;F1&quot;, &quot;solitude&quot;, or &quot;engine&quot;.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider px-1 pb-1">
                Found {results.length} matching {results.length === 1 ? 'entry' : 'entries'}
              </div>

              {results.map((item) => (
                <button
                  key={`${item.section}-${item.id}`}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left p-3.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-200 transition-all group flex items-start justify-between gap-3"
                  id={`search-result-${item.id}`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          item.section === 'diary'
                            ? 'bg-stone-100 text-stone-800'
                            : item.section === 'curiosities'
                            ? 'bg-amber-100 text-amber-900'
                            : item.section === 'poet'
                            ? 'bg-[#722F37]/10 text-[#722F37]'
                            : 'bg-slate-100 text-slate-800 font-mono'
                        }`}
                      >
                        {item.sectionLabel}
                      </span>
                      <span
                        className="text-stone-400"
                        dangerouslySetInnerHTML={{ __html: item.dateOrCategory }}
                      />
                    </div>

                    <h4 className="text-sm font-semibold text-stone-900 group-hover:text-[#722F37] transition-colors leading-snug">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed font-sans">
                      {getHighlightedSnippet(item.matchExcerpt, query)}
                    </p>
                  </div>

                  <div className="mt-2 text-stone-400 group-hover:text-[#722F37] group-hover:translate-x-0.5 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
