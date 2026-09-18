import React, { useState } from 'react';
import type { Poem } from '../types';
import { WALLPAPER_SNIPPETS } from '../data/initialContent';
import { BookOpen, Sparkles, Heart, Clock, Quote, Share2, Check, Trash2 } from 'lucide-react';

interface PoetSectionProps {
  poems: Poem[];
  onOpenPoemModal?: (poem: Poem) => void;
  isAdmin?: boolean;
  onDeletePoem?: (id: string) => void;
}

export function PoetSection({ poems, onOpenPoemModal, isAdmin, onDeletePoem }: PoetSectionProps) {
  const [selectedPoemId, setSelectedPoemId] = useState<string>(poems[0]?.id || 'poem-1');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activePoem = poems.find((p) => p.id === selectedPoemId) || poems[0];

  const handleCopy = (poem: Poem) => {
    const text = `${poem.title}\n${poem.subtitle || ''}\n\n` +
      poem.stanzas.map((s) => s.join('\n')).join('\n\n') +
      `\n\n— MarkRyan (${poem.date})`;
    navigator.clipboard.writeText(text);
    setCopiedId(poem.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] poetry-wallpaper py-10 px-4 sm:px-6 lg:px-8" id="poet-section-container">
      {/* Textured Low-Opacity Wallpaper of Dostoevsky and Bukowski snippets */}
      <div className="poetry-wallpaper-text" aria-hidden="true">
        {WALLPAPER_SNIPPETS.repeat(6)}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#722F37]/10 border border-[#722F37]/30 text-[#722F37] text-xs font-serif tracking-widest uppercase mb-3">
            <Quote className="w-3 h-3" />
            <span>I. The Poet &middot; The Writer</span>
          </div>

          <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl font-light text-stone-900 tracking-tight leading-none mb-4">
            The Geometry of Love &amp; Solitude
          </h1>

          <p className="font-baskerville text-sm sm:text-base text-stone-600 italic max-w-xl mx-auto leading-relaxed">
            Original verses exploring Cartesian heartbreaks, existential echoes across frozen canals,
            and the stubborn persistence of warmth in decaying rooms.
          </p>

          {/* Burgundy Accent Rule */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-[#722F37]/40" />
            <div className="w-2.5 h-2.5 rotate-45 border border-[#722F37] bg-[#722F37]/20" />
            <div className="h-px w-16 bg-[#722F37]/40" />
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Poetry Gallery Index */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#722F37]/20 text-xs font-serif text-[#722F37] tracking-wider uppercase">
              <span>Folio Index</span>
              <span>{poems.length} Compositions</span>
            </div>

            {poems.length === 0 ? (
              <div className="p-6 rounded-xl bg-white/70 border border-[#722F37]/20 text-center text-xs text-stone-500 font-serif space-y-2">
                <p className="italic">Folio is currently being compiled.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {poems.map((poem, idx) => {
                  const isSelected = poem.id === activePoem?.id;
                  return (
                    <button
                      key={poem.id}
                      type="button"
                      onClick={() => setSelectedPoemId(poem.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-300 relative group ${
                        isSelected
                          ? 'bg-white shadow-md border-[#722F37] translate-x-1'
                          : 'bg-white/60 hover:bg-white/90 border-stone-200/80 hover:border-[#722F37]/40'
                      }`}
                      id={`poem-selector-${poem.id}`}
                    >
                      {/* Burgundy Left Accent Indicator */}
                      <div
                        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all duration-300 ${
                          isSelected ? 'bg-[#722F37]' : 'bg-transparent group-hover:bg-[#722F37]/30'
                        }`}
                      />

                      <div className="pl-2">
                        <div className="flex items-center justify-between text-[11px] text-stone-500 font-serif mb-1">
                          <span className="text-[#722F37] font-semibold">Canticle {idx + 1}</span>
                          <span>{poem.date}</span>
                        </div>
                        <h3 className="font-cormorant text-xl font-medium text-stone-900 leading-snug group-hover:text-[#722F37] transition-colors">
                          {poem.title}
                        </h3>
                        {poem.subtitle && (
                          <p className="font-baskerville text-xs text-stone-500 italic mt-0.5 line-clamp-1">
                            {poem.subtitle}
                          </p>
                        )}
                        <div className="mt-2.5 flex items-center gap-2">
                          <span className="text-[10px] uppercase font-sans tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                            {poem.theme}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Dostoevsky & Bukowski Epigraph Callout */}
            <div className="mt-6 p-4 rounded-xl bg-[#722F37]/5 border border-[#722F37]/20 text-xs font-serif text-stone-700 leading-relaxed space-y-2">
              <p className="italic text-stone-800">
                &ldquo;Pain and suffering are always inevitable for a large intelligence and a deep heart.&rdquo;
              </p>
              <div className="text-right text-[11px] text-[#722F37] font-medium font-sans">
                — Fyodor Dostoevsky
              </div>
            </div>
          </div>

          {/* Active Poem Framing with Burgundy Accents */}
          <div className="lg:col-span-8">
            {activePoem ? (
              <article
                className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-10 lg:p-12 border-2 border-[#722F37]/30 shadow-xl relative overflow-hidden"
                id="active-poem-card"
              >
                {/* Decorative Burgundy Corner Accents */}
                <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#722F37]" />
                <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#722F37]" />
                <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#722F37]" />
                <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#722F37]" />

                {/* Poem Header */}
                <div className="border-b border-[#722F37]/15 pb-6 mb-8 text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#722F37]/10 text-[#722F37] text-xs font-serif uppercase tracking-widest mb-3">
                    <Heart className="w-3 h-3 text-[#722F37]" />
                    <span>Theme: {activePoem.theme} &middot; {activePoem.date}</span>
                  </div>

                  <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl font-normal text-stone-950 tracking-tight mb-2">
                    {activePoem.title}
                  </h2>

                  {activePoem.subtitle && (
                    <p className="font-baskerville text-sm sm:text-base text-stone-600 italic">
                      {activePoem.subtitle}
                    </p>
                  )}

                  {activePoem.dedication && (
                    <p className="font-baskerville text-xs text-[#722F37] italic mt-3">
                      {activePoem.dedication}
                    </p>
                  )}
                </div>

                {/* Stanzas in Baskerville */}
                <div className="space-y-6 sm:space-y-8 max-w-xl mx-auto py-2">
                  {activePoem.stanzas.map((stanza, sIdx) => (
                    <div key={sIdx} className="space-y-1.5 text-center sm:text-left">
                      {stanza.map((line, lIdx) => (
                        <p
                          key={lIdx}
                          className="font-baskerville text-base sm:text-lg text-stone-800 leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Burgundy Footer & Actions */}
                <div className="mt-10 pt-6 border-t border-[#722F37]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-serif">
                  <div className="flex items-center gap-2 text-[#722F37]">
                    <span className="w-2 h-2 rounded-full bg-[#722F37]" />
                    <span className="italic font-baskerville">Written by MarkRyan</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isAdmin && onDeletePoem && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove "${activePoem.title}"?`)) {
                            onDeletePoem(activePoem.id);
                            const remaining = poems.filter((p) => p.id !== activePoem.id);
                            if (remaining.length > 0) {
                              setSelectedPoemId(remaining[0].id);
                            }
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-400 text-red-600 hover:bg-red-50 bg-white transition-colors"
                        title="Delete this poem (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="font-sans">Remove Poem</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(activePoem)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-[#722F37] text-stone-700 hover:text-[#722F37] bg-white transition-colors"
                      id="copy-poem-btn"
                    >
                      {copiedId === activePoem.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-sans">Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="font-sans">Copy Stanzas</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <div className="bg-white/95 backdrop-blur-md rounded-2xl p-12 border-2 border-[#722F37]/20 shadow-xl text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#722F37]/10 text-[#722F37] flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-cormorant text-2xl text-stone-800 font-normal">Folio Collection</h3>
                <p className="font-baskerville text-sm text-stone-500 italic max-w-sm mx-auto">
                  Select a composition from the index on the left to read verses.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PoetSection;
