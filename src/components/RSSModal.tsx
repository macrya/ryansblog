import React, { useState } from 'react';
import type { DiaryPost } from '../types';
import { generateRssFeed } from '../utils/rssGenerator';
import {
  Rss,
  Copy,
  Check,
  Download,
  X,
  Code,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface RSSModalProps {
  isOpen: boolean;
  onClose: () => void;
  posts: DiaryPost[];
}

export function RSSModal({ isOpen, onClose, posts }: RSSModalProps) {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedXml, setCopiedXml] = useState<boolean>(false);
  const [showRawXml, setShowRawXml] = useState<boolean>(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://markryan.dev';
  const feedUrl = `${origin}/rss.xml`;
  const xmlContent = generateRssFeed(posts, origin);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(feedUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopiedXml(true);
    setTimeout(() => setCopiedXml(false), 2000);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rss.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
      id="rss-modal-backdrop"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[85vh]"
        id="rss-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Rss className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-semibold text-stone-900 leading-none">
                Blog RSS 2.0 Feed
              </h3>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                Subscribe in NetNewsWire, Feedly, Reeder, or any podcast/feed reader
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 font-sans text-xs">
          {/* Feed URL Field */}
          <div>
            <label className="block font-semibold text-stone-700 uppercase tracking-wider text-[10px] mb-1.5">
              Live Feed URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={feedUrl}
                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-stone-800 font-mono text-xs select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleDownloadXml}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download rss.xml ({posts.length} entries)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRawXml(!showRawXml)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawXml ? 'Hide XML' : 'Inspect Raw XML'}</span>
            </button>
          </div>

          {/* Raw XML Viewer */}
          {showRawXml && (
            <div className="mt-3 relative rounded-xl border border-stone-800 bg-[#0d1117] p-3 text-stone-200 overflow-hidden">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800 mb-2">
                <span className="text-[10px] font-mono text-stone-400">rss.xml (Standard 2.0 with CDATA)</span>
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-mono"
                >
                  {copiedXml ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedXml ? 'Copied' : 'Copy All XML'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono leading-relaxed overflow-x-auto max-h-56 select-all text-stone-300">
                {xmlContent}
              </pre>
            </div>
          )}

          {/* Feed Preview Items */}
          <div className="pt-2 border-t border-stone-200">
            <div className="font-semibold text-stone-700 uppercase tracking-wider text-[10px] mb-2">
              Feed Contents ({posts.length} Posts Indexed)
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs space-y-0.5"
                >
                  <div className="font-medium text-stone-900">{post.title}</div>
                  <div className="text-[10px] text-stone-400">
                    {post.date} &middot; {post.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RSSModal;
