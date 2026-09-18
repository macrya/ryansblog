import React, { useState } from 'react';
import type { ComputerArticle, CodeBlockItem } from '../types';
import { Terminal, Copy, Check, Code2, ShieldAlert, Cpu, Sparkles, Binary, Trash2, Share2 } from 'lucide-react';
import { BacklinkCitationModal } from './BacklinkCitationModal';

interface ComputerSectionProps {
  articles: ComputerArticle[];
  isAdmin?: boolean;
  onDeleteComputerArticle?: (id: string) => void;
}

export function ComputerSection({ articles, isAdmin, onDeleteComputerArticle }: ComputerSectionProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);

  const activeArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  const handleCopyCode = (block: CodeBlockItem) => {
    navigator.clipboard.writeText(block.code);
    setCopiedCodeId(block.id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div
      className="min-h-[calc(100vh-4.5rem)] bg-[#f3f3f4] py-10 px-4 sm:px-6 lg:px-8 border-t border-stone-200"
      id="computer-stuff-section"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/10 text-slate-900 text-xs font-mono uppercase tracking-wider mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>III. Computer Stuff &middot; Philosophy &amp; Engineering</span>
          </div>

          <h1 className="font-bajaderka text-4xl sm:text-5xl text-stone-900 mb-3 tracking-wide">
            Ontologies of the Machine
          </h1>

          <p className="font-nightingale text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl mx-auto italic">
            Bridging Heideggerian metaphysics with asynchronous sockets, Tor network topology,
            and algebraic UNIX pipelines.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Article Selector Column */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="font-bajaderka text-xl text-stone-800 px-1">Research Papers &amp; Scripts</h2>

            <div className="space-y-3">
              {articles.map((art) => {
                const isSelected = art.id === activeArticle?.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArticleId(art.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-white shadow-md border-stone-800 ring-1 ring-stone-900'
                        : 'bg-white/60 hover:bg-white border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 mb-1">
                      <span className="font-semibold text-stone-900">{art.category}</span>
                      <span>{art.date}</span>
                    </div>

                    <h3 className="font-bajaderka text-lg text-stone-950 leading-snug">
                      {art.title}
                    </h3>

                    <p className="font-nightingale text-xs text-stone-600 italic mt-1 line-clamp-2">
                      {art.subtitle}
                    </p>

                    <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-stone-500">
                      <Code2 className="w-3 h-3 text-stone-700" />
                      <span>{art.codeBlocks.length} Script module(s)</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Engineering Axiom Card */}
            <div className="p-4 rounded-xl bg-stone-900 text-stone-300 font-mono text-xs leading-relaxed space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold uppercase text-[10px]">
                <Binary className="w-3.5 h-3.5" />
                <span>Architectural Axiom</span>
              </div>
              <p className="font-nightingale italic text-stone-300 text-sm">
                &ldquo;A computer is a clock with benefits. The trick is understanding which parts of the gear train are made of sand.&rdquo;
              </p>
            </div>
          </div>

          {/* Active Article & Dark-Mode Code Blocks */}
          <div className="lg:col-span-8">
            {activeArticle ? (
              <article
                className="bg-white rounded-2xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6"
                id="active-computer-article"
              >
                {/* Header */}
                <div className="border-b border-stone-200 pb-6">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-xs font-mono text-stone-500">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-medium">
                        {activeArticle.category}
                      </span>
                      <span>&bull;</span>
                      <span>{activeArticle.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCitationModal(true)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-700 hover:text-[#722F37] bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 transition-colors font-mono"
                        title="Generate citation / backlink"
                        id="computer-cite-btn"
                      >
                        <Share2 className="w-3 h-3 text-[#722F37]" />
                        <span>Cite / Share</span>
                      </button>

                      {isAdmin && onDeleteComputerArticle && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove "${activeArticle.title}"?`)) {
                              onDeleteComputerArticle(activeArticle.id);
                              const remaining = articles.filter((a) => a.id !== activeArticle.id);
                              if (remaining.length > 0) {
                                setSelectedArticleId(remaining[0].id);
                              }
                            }
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                          title="Delete this article (Admin)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="font-bajaderka text-3xl sm:text-4xl text-stone-950 tracking-wide leading-tight mb-2">
                    {activeArticle.title}
                  </h2>

                  <p className="font-nightingale text-base text-stone-600 italic">
                    {activeArticle.subtitle}
                  </p>

                  {/* Philosophical Thesis Callout */}
                  <div className="mt-5 p-4 rounded-xl bg-stone-50 border-l-4 border-stone-900">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold mb-1">
                      Philosophical Premise
                    </div>
                    <p className="font-nightingale text-stone-800 text-sm sm:text-base italic leading-relaxed">
                      &ldquo;{activeArticle.philosophicalThesis}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Body Text in Nightingale */}
                <div className="space-y-4 text-stone-800 font-nightingale text-base leading-relaxed">
                  {activeArticle.body.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>

                {/* Formatted Dark-Mode Code Blocks */}
                <div className="space-y-6 pt-4">
                  {activeArticle.codeBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="rounded-xl overflow-hidden border border-stone-800 shadow-lg bg-[#0d1117] text-stone-200 font-code text-xs"
                      id={`code-block-${block.id}`}
                    >
                      {/* Code Header Bar */}
                      <div className="bg-[#161b22] px-4 py-2.5 border-b border-stone-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                          <span className="ml-2 text-stone-300 font-mono text-xs font-medium">
                            {block.filename}
                          </span>
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-300 border border-stone-700">
                            {block.language}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(block)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-mono transition-colors"
                          id={`copy-code-btn-${block.id}`}
                        >
                          {copiedCodeId === block.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-400" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Code Annotation / Notes */}
                      {block.annotations && (
                        <div className="px-4 py-2 bg-[#12161f] border-b border-stone-800/80 text-[11px] text-stone-400 font-mono flex items-center gap-2">
                          <span className="text-amber-400 font-semibold">Specs:</span>
                          <span>{block.annotations}</span>
                        </div>
                      )}

                      {/* Code Content */}
                      <div className="p-4 overflow-x-auto text-[12px] leading-relaxed select-text font-mono">
                        <pre className="text-stone-300 font-mono whitespace-pre">
                          <code>{block.code}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Internal Deep Links & Discovery */}
                <div className="pt-8 mt-10 border-t border-stone-200 text-xs font-sans space-y-3">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold font-mono">
                    Interdisciplinary Explorations &middot; MarkRyan Studio
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <a
                      href="#diary"
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-[#722F37] transition-all block font-sans"
                    >
                      <span className="font-semibold block text-stone-900">The Diary</span>
                      <span className="text-[11px] text-stone-500 font-comic">Reflective notebook &amp; letters</span>
                    </a>
                    <a
                      href="#poet"
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-[#722F37] transition-all block font-sans"
                    >
                      <span className="font-semibold block text-stone-900">The Poet</span>
                      <span className="text-[11px] text-stone-500 font-nightingale italic">Original verse &amp; meter</span>
                    </a>
                    <a
                      href="#curiosities"
                      className="p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 hover:text-[#722F37] transition-all block font-sans"
                    >
                      <span className="font-semibold block text-stone-900">Random Knowledge</span>
                      <span className="text-[11px] text-stone-500">Curiosities &amp; Blueprints</span>
                    </a>
                  </div>
                </div>

                {/* Backlink and citation generator modal */}
                <BacklinkCitationModal
                  isOpen={showCitationModal}
                  onClose={() => setShowCitationModal(false)}
                  title={activeArticle ? `${activeArticle.title} — Computer Stuff` : 'Computer Stuff — MarkRyan'}
                  slugOrHash={`#computer/${activeArticle?.id || ''}`}
                />
              </article>
            ) : (
              <div className="bg-white rounded-2xl p-12 border border-stone-200/80 shadow-sm text-center space-y-3">
                <Terminal className="w-10 h-10 text-slate-800/50 mx-auto" />
                <h3 className="font-bajaderka text-3xl text-stone-800">Computer Stuff &middot; Architecture</h3>
                <p className="font-nightingale text-base text-stone-500 italic max-w-sm mx-auto">
                  Select an article from the index on the left to read technical systems architectures.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComputerSection;
