import React, { useState } from 'react';
import type { CuriosityEssay } from '../types';
import { Compass, Gauge, Cpu, Zap, Bookmark, Layers, ArrowUpRight, Search, Trash2 } from 'lucide-react';

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
            <h3 className="font-pecita text-2xl text-stone-800 px-1">Curated Dossiers</h3>
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

                    <h4 className="font-pecita text-2xl text-stone-900 leading-tight">
                      {essay.title}
                    </h4>

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
            {activeEssay && (
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
                        <span>Delete Dossier</span>
                      </button>
                    )}
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
                    <h4 className="font-pecita text-2xl text-stone-900 mb-3 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-amber-800" />
                      <span>Curiosity Blueprint Notes</span>
                    </h4>

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
              </article>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RandomKnowledgeSection;
