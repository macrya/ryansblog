import React, { useState } from 'react';
import { generateBacklinkCitations } from '../utils/seo';
import {
  Link2,
  Copy,
  Check,
  Share2,
  ExternalLink,
  BookOpen,
  Code2,
  FileText,
  X,
} from 'lucide-react';
import { useToast } from './Toast';

interface BacklinkCitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  slugOrHash: string;
}

export function BacklinkCitationModal({
  isOpen,
  onClose,
  title,
  slugOrHash,
}: BacklinkCitationModalProps) {
  const { showToast } = useToast();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  if (!isOpen) return null;

  const citations = generateBacklinkCitations(title, slugOrHash);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFormat(label);
      showToast(`${label} copied to clipboard!`, 'success', 'Copied');
      setTimeout(() => setCopiedFormat(null), 2500);
    } catch {
      showToast('Please copy manually.', 'info', 'Clipboard');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} by MarkRyan`,
          url: citations.url,
        });
        showToast('Shared successfully.', 'success', 'Shared');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboard(citations.url, 'Permalink');
        }
      }
    } else {
      copyToClipboard(citations.url, 'Permalink');
    }
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`"${title}" by MarkRyan\n\n${citations.url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(citations.url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-stone-200 overflow-hidden text-stone-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="backlink-modal-title"
      >
        {/* Header */}
        <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#722F37] text-white flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 id="backlink-modal-title" className="font-cormorant text-xl font-semibold text-stone-900">
                Cite &amp; Link Back to This Work
              </h3>
              <p className="text-[11px] text-stone-500 font-sans">
                Backlink strategy &amp; scholarly citation formats
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Target Article Reference */}
          <div className="p-3 bg-stone-100/70 rounded-xl border border-stone-200">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold block mb-1">
              Referenced Target
            </span>
            <p className="font-medium text-stone-900 text-sm">{title}</p>
            <p className="text-xs text-[#722F37] truncate mt-0.5">{citations.url}</p>
          </div>

          {/* Social Sharing & Native Web Share */}
          <div>
            <span className="text-xs font-semibold text-stone-700 block mb-2">
              Instant Social Backlink
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg border border-stone-200 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Web Share</span>
              </button>
              <button
                type="button"
                onClick={shareOnTwitter}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors"
              >
                <span>Share on X</span>
              </button>
              <button
                type="button"
                onClick={shareOnLinkedIn}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0077b5] hover:bg-[#005f93] text-white text-xs font-medium rounded-lg transition-colors"
              >
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Citation Format 1: Markdown Link */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-stone-500" />
                <span>Markdown Link (GitHub, Obsidian, Hugo)</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(citations.markdown, 'Markdown link')}
                className="text-[11px] text-[#722F37] hover:underline font-medium flex items-center gap-1"
              >
                {copiedFormat === 'Markdown link' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Markdown</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 overflow-x-auto whitespace-pre-wrap">
              {citations.markdown}
            </pre>
          </div>

          {/* Citation Format 2: HTML Anchor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-stone-500" />
                <span>HTML Anchor (Websites &amp; Blogs)</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(citations.html, 'HTML code')}
                className="text-[11px] text-[#722F37] hover:underline font-medium flex items-center gap-1"
              >
                {copiedFormat === 'HTML code' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy HTML</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 overflow-x-auto whitespace-pre-wrap">
              {citations.html}
            </pre>
          </div>

          {/* Citation Format 3: BibTeX */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-700 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                <span>BibTeX (LaTeX &amp; Academic Papers)</span>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(citations.bibtex, 'BibTeX citation')}
                className="text-[11px] text-[#722F37] hover:underline font-medium flex items-center gap-1"
              >
                {copiedFormat === 'BibTeX citation' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy BibTeX</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-[11px] font-mono text-stone-700 overflow-x-auto">
              {citations.bibtex}
            </pre>
          </div>

          {/* Attribution license notice */}
          <div className="text-[11px] text-stone-500 border-t border-stone-200 pt-3">
            Published under{' '}
            <a
              href="https://creativecommons.org/licenses/by-nc/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#722F37] underline"
            >
              CC BY-NC 4.0
            </a>
            . You are welcome to cite, link, and quote with attribution.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-medium hover:bg-stone-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
