import React, { useState } from 'react';
import type { CuriosityEssay } from '../types';
import { Compass, Gauge, Cpu, Zap, Bookmark, Layers, ArrowUpRight, Search, Trash2, Share2 } from 'lucide-react';
import { BacklinkCitationModal } from './BacklinkCitationModal';

interface RandomKnowledgeSectionProps {
  essays: CuriosityEssay[];
  activeEssayId?: string;
  onSelectEssay?: (id: string) => void;
  isAdmin?: boolean;
  onDeleteCuriosity?: (id: string) => void;
}

export function RandomKnowledgeSection({
  essays,
  activeEssayId,
  onSelectEssay,
  isAdmin,
  onDeleteCuriosity,
}: RandomKnowledgeSectionProps) {
  const [selectedEssayId, setSelectedEssayId] = useState<string>(activeEssayId || essays[0]?.id || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);

  React.useEffect(() => {
    if (activeEssayId) {
      setSelectedEssayId(activeEssayId);
    }
  }, [activeEssayId]);


  const categories = ['All', 'F1 Aerodynamics', '90s Combustion'];

  const filteredEssays = essays.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const activeEssay = essays.find((e) => e.id === selectedEssayId) || filteredEssays[0] || essays[0];

  return (
    <div
      className="min-h-[calc(100vh-4.5rem)] bg-[#f2f2f3] py-10 px-4 sm:px-6 lg:px-8 border-t border-stone-200"
      id="curiosities-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Curated Cabinet Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-900/10 text-amber-900 text-xs tracking-wider uppercase font-medium mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>II. Cabinet of Curiosities</span>
          </div>

          <h1 className="font-pecita text-5xl sm:text-6xl text-stone-900 mb-3 tracking-wide">
            Random Knowledge &amp; Eclectic Passions
          </h1>

          <p className="font-bricolage text-sm sm:text-base text-stone-600 leading-relaxed">
            A classic literary archive of obsessions: from the fluid mechanics of Formula 1 Venturi underfloors
            to the hydraulic cam harmonics of 90s Japanese combustion engines.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/70 p-3 rounded-xl border border-stone-200">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bricolage font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search curiosities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bricolage text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>
        </div>

        {/* Main Curiosities Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Curiosity Index Drawer */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="font-pecita text-2xl text-stone-800 px-1">Curated Dossiers</h2>
            <div className="space-y-3">
              {filteredEssays.map((essay) => {
                const isSelected = essay.id === activeEssay?.id;
                return (
                  <button
                    key={essay.id}
                    type="button"
                    onClick={() => setSelectedEssayId(essay.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white shadow-md border-amber-800/40 ring-1 ring-amber-800/20'
                        : 'bg-white/60 hover:bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bricolage text-stone-500 mb-1">
                      <span className="font-semibold text-amber-900">{essay.category}</span>
                      <span>{essay.readTime}</span>
                    </div>

                    <h3 className="font-pecita text-2xl text-stone-900 leading-tight">
                      {essay.title}
                    </h3>

                    <p className="font-bricolage text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                      {essay.summary}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400 font-bricolage pt-2 border-t border-stone-100">
                      <span>Era: {essay.year}</span>
                      <span className="text-amber-800 font-medium flex items-center gap-1">
                        Read Deep Dive <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Essay Detailed View */}
          <div className="lg:col-span-8">
            {activeEssay ? (
              <article
                className="bg-white rounded-2xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6"
                id="active-curiosity-essay"
              >
                {/* Header with Pecita typography */}
                <div className="border-b border-stone-200 pb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bricolage text-amber-900">
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Dossier #{activeEssay.id} &middot; {activeEssay.category}</span>
                      <span>&bull;</span>
                      <span>{activeEssay.readTime}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCitationModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100/70 rounded-lg border border-amber-200/80 transition-colors font-bricolage"
                        title="Generate citation / backlink"
                        id="curiosity-cite-btn"
                      >
                        <Share2 className="w-3 h-3 text-amber-900" />
                        <span>Cite / Share</span>
                      </button>

                      {isAdmin && onDeleteCuriosity && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete "${activeEssay.title}"?`)) {
                              onDeleteCuriosity(activeEssay.id);
                              const remaining = essays.filter((e) => e.id !== activeEssay.id);
                              if (remaining.length > 0) {
                                setSelectedEssayId(remaining[0].id);
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          title="Delete this essay (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="font-pecita text-4xl sm:text-5xl text-stone-950 tracking-wide leading-tight mb-4">
                    {activeEssay.title}
                  </h2>

                  <p className="font-bricolage text-stone-700 text-sm sm:text-base font-normal bg-stone-50 p-4 rounded-xl border border-stone-200/80 leading-relaxed italic">
                    &ldquo;{activeEssay.summary}&rdquo;
                  </p>
                </div>

                {/* Body Content in Bricolage Grotesque */}
                <div className="space-y-4 text-stone-800 font-bricolage text-sm sm:text-base leading-relaxed">
                  {activeEssay.content.map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Key Diagram Notes / Technical Callouts */}
                {activeEssay.keyDiagramNotes && activeEssay.keyDiagramNotes.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-stone-200">
                    <h3 className="font-pecita text-2xl text-stone-900 mb-3 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-800" />
                      <span>Curiosity Blueprint Notes</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeEssay.keyDiagramNotes.map((note, nIdx) => (
                        <div
                          key={nIdx}
                          className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200 text-xs font-bricolage"
                        >
                          <div className="font-semibold text-stone-900 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-800" />
                            {note.term}
                          </div>
                          <p className="text-stone-600 leading-relaxed">{note.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engineering Spec Sheet */}
                {activeEssay.specSheet && activeEssay.specSheet.length > 0 && (
                  <div className="mt-6 p-4 rounded-xl bg-stone-900 text-stone-100 font-bricolage">
                    <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      <Gauge className="w-4 h-4" />
                      <span>Technical Benchmarks</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {activeEssay.specSheet.map((spec, sIdx) => (
                        <div key={sIdx} className="border-l border-stone-700 pl-3">
                          <span className="text-stone-400 block text-[11px]">{spec.label}</span>
                          <span className="font-mono text-stone-100 font-medium text-sm mt-0.5 block">
                            {spec.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Internal Deep Links & Discovery */}
                <div className="pt-8 mt-10 border-t border-stone-200 text-xs font-sans space-y-3">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold font-mono">
                    Interdisciplinary Explorations &middot; MarkRyan Studio
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <a
                      href="#diary"
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 text-stone-700 hover:text-[#722F37] transition-all block font-sans"
                    >
                      <span className="font-semibold block text-stone-900">The Diary</span>
                      <span className="text-[11px] text-stone-500 font-comic">Reflective notebook &amp; letters</span>
                    </a>
                    <a
                      href="#computer"
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 text-stone-700 hover:text-[#722F37] transition-all block font-sans"
                    >
                      <span className="font-semibold block text-stone-900">Computer Stuff</span>
                      <span className="text-[11px] text-stone-500 font-mono">Systems, Tor &amp; Metaphysics</span>
                    </a>
                    <a
                      href="#poet"
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-white border border-stone-200 text-stone-700 hover:text-[#722F37] transition-all block font-sans"
                    >
                      <span className="font-semibold block text-stone-900">The Poet</span>
                      <span className="text-[11px] text-stone-500 font-nightingale italic">Original verse &amp; meter</span>
                    </a>
                  </div>
                </div>

                {/* Backlink and citation generator modal */}
                <BacklinkCitationModal
                  isOpen={showCitationModal}
                  onClose={() => setShowCitationModal(false)}
                  title={activeEssay ? `${activeEssay.title} — Cabinet of Curiosities` : 'Random Knowledge — MarkRyan'}
                  slugOrHash={`#curiosities/${activeEssay?.id || ''}`}
                />
              </article>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-stone-200/80 shadow-sm text-center space-y-3">
                <Compass className="w-10 h-10 text-amber-800/50 mx-auto" />
                <h3 className="font-pecita text-3xl text-stone-800">Cabinet of Curiosities</h3>
                <p className="font-bricolage text-sm text-stone-500 max-w-sm mx-auto">
                  Select an inquiry from the list on the left to explore technical blueprints and engineering mechanics.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RandomKnowledgeSection;
