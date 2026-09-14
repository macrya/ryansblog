import React, { useState, useEffect } from 'react';
import type { Poem, CuriosityEssay, ComputerArticle, DiaryPost } from '../types';
import { ImageUploader } from './ImageUploader';
import { getAllStoredImages, deletePersistentImage, type StoredImageRecord } from '../utils/persistentStorage';
import {
  X,
  UploadCloud,
  Feather,
  Compass,
  Terminal,
  BookOpen,
  Code2,
  CheckCircle2,
  Sparkles,
  Layers,
  FileCode,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

interface CMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPoem: (poem: Poem) => void;
  onAddCuriosity: (curiosity: CuriosityEssay) => void;
  onAddComputerArticle: (article: ComputerArticle) => void;
  onAddDiaryPost: (post: DiaryPost) => void;
}

type CMSTab = 'media' | 'poem' | 'curiosity' | 'code' | 'diary';

export function CMSModal({
  isOpen,
  onClose,
  onAddPoem,
  onAddCuriosity,
  onAddComputerArticle,
  onAddDiaryPost,
}: CMSModalProps) {
  const [activeTab, setActiveTab] = useState<CMSTab>('media');
  const [recentUploads, setRecentUploads] = useState<string[]>([]);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Load persisted images from IndexedDB + localStorage on modal open
    const loadStoredImages = async () => {
      try {
        const stored = await getAllStoredImages();
        const urls = stored.map((item) => item.dataUrl);

        // Also check localStorage
        const savedJson = localStorage.getItem('markryan_recent_uploads');
        if (savedJson) {
          try {
            const parsed = JSON.parse(savedJson);
            if (Array.isArray(parsed)) {
              for (const u of parsed) {
                if (!urls.includes(u)) urls.push(u);
              }
            }
          } catch (e) {
            console.warn('Failed parsing markryan_recent_uploads:', e);
          }
        }

        if (urls.length === 0) {
          urls.push('https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=85');
        }

        setRecentUploads(urls);
      } catch (err) {
        console.warn('Could not load stored images:', err);
      }
    };

    if (isOpen) {
      loadStoredImages();
    }
  }, [isOpen]);

  // New Poem Form State
  const [poemTitle, setPoemTitle] = useState('');
  const [poemSubtitle, setPoemSubtitle] = useState('');
  const [poemTheme, setPoemTheme] = useState<'Love' | 'Existentialism' | 'Memory' | 'Transience'>('Love');
  const [poemDedication, setPoemDedication] = useState('');
  const [poemStanzasRaw, setPoemStanzasRaw] = useState('');

  // New Curiosity Form State
  const [curiosityTitle, setCuriosityTitle] = useState('');
  const [curiosityCategory, setCuriosityCategory] = useState<'F1 Aerodynamics' | '90s Combustion' | 'Mechanical Horology' | 'Urban Geography'>('F1 Aerodynamics');
  const [curiosityReadTime, setCuriosityReadTime] = useState('6 min read');
  const [curiosityYear, setCuriosityYear] = useState('1990 — 2026');
  const [curiositySummary, setCuriositySummary] = useState('');
  const [curiosityContent, setCuriosityContent] = useState('');

  // New Code / Computer Form State
  const [compTitle, setCompTitle] = useState('');
  const [compSubtitle, setCompSubtitle] = useState('');
  const [compCategory, setCompCategory] = useState<'OSINT Reconnaissance' | 'Systems Philosophy' | 'Low-Level Networking'>('OSINT Reconnaissance');
  const [compThesis, setCompThesis] = useState('');
  const [compBody, setCompBody] = useState('');
  const [compFilename, setCompFilename] = useState('script.py');
  const [compCode, setCompCode] = useState('');

  if (!isOpen) return null;

  const handleUploadSuccess = (url: string) => {
    setRecentUploads((prev) => {
      const next = [url, ...prev.filter((u) => u !== url)].slice(0, 30);
      try {
        localStorage.setItem('markryan_recent_uploads', JSON.stringify(next));
      } catch (err) {
        console.warn('LocalStorage full, image persisted in IndexedDB');
      }
      return next;
    });
    setSuccessMessage('Asset successfully cropped (16:9) and permanently stored in media storage.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDeleteUploadedImage = async (urlToDelete: string) => {
    await deletePersistentImage(urlToDelete);
    setRecentUploads((prev) => {
      const next = prev.filter((u) => u !== urlToDelete);
      try {
        localStorage.setItem('markryan_recent_uploads', JSON.stringify(next));
      } catch (err) {
        // ignore
      }
      return next;
    });
    setSuccessMessage('Asset removed from media gallery.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCreatePoem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poemTitle.trim() || !poemStanzasRaw.trim()) return;

    const rawBlocks = poemStanzasRaw.split('\n\n').filter(Boolean);
    const stanzas = rawBlocks.map((b) => b.split('\n').filter(Boolean));

    const newPoem: Poem = {
      id: `poem-${Date.now()}`,
      title: poemTitle.trim(),
      subtitle: poemSubtitle.trim() || undefined,
      date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      theme: poemTheme,
      dedication: poemDedication.trim() || undefined,
      stanzas,
    };

    onAddPoem(newPoem);
    setPoemTitle('');
    setPoemSubtitle('');
    setPoemStanzasRaw('');
    setSuccessMessage(`Poem "${newPoem.title}" added to The Poet gallery.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleCreateCuriosity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!curiosityTitle.trim() || !curiositySummary.trim()) return;

    const paragraphs = curiosityContent.split('\n\n').filter(Boolean);

    const newCuriosity: CuriosityEssay = {
      id: `curiosity-${Date.now()}`,
      title: curiosityTitle.trim(),
      category: curiosityCategory,
      readTime: curiosityReadTime.trim() || '5 min read',
      year: curiosityYear.trim() || 'Modern Era',
      summary: curiositySummary.trim(),
      content: paragraphs.length > 0 ? paragraphs : [curiositySummary],
    };

    onAddCuriosity(newCuriosity);
    setCuriosityTitle('');
    setCuriositySummary('');
    setCuriosityContent('');
    setSuccessMessage(`Curiosity "${newCuriosity.title}" cataloged in Cabinet.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleCreateComputerArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compTitle.trim()) return;

    const paragraphs = compBody.split('\n\n').filter(Boolean);

    const newArticle: ComputerArticle = {
      id: `comp-${Date.now()}`,
      title: compTitle.trim(),
      subtitle: compSubtitle.trim() || 'Technical Architecture Brief',
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      category: compCategory,
      philosophicalThesis: compThesis.trim() || 'The machine is an ontological extension of thought.',
      body: paragraphs.length > 0 ? paragraphs : ['Documentation pending.'],
      codeBlocks: [
        {
          id: `code-${Date.now()}`,
          filename: compFilename.trim() || 'main.py',
          language: compFilename.endsWith('.sh') ? 'bash' : 'python',
          code: compCode.trim() || '# Production code module\nprint("Hello World")',
        },
      ],
    };

    onAddComputerArticle(newArticle);
    setCompTitle('');
    setCompSubtitle('');
    setCompThesis('');
    setCompBody('');
    setCompCode('');
    setSuccessMessage(`Computer Article "${newArticle.title}" published.`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in"
      id="cms-modal-backdrop"
    >
      <div
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden"
        id="cms-modal-card"
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#722F37] text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="font-cormorant text-2xl font-semibold text-stone-900 leading-none">
                MarkRyan CMS &amp; Media Studio
              </h3>
              <p className="text-[11px] text-stone-500 font-sans mt-0.5">
                Vercel Blob 16:9 Image Pipeline &middot; Multi-Domain Publishing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200 transition-colors"
            id="close-cms-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-200 bg-white overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'media'
                ? 'border-[#722F37] text-[#722F37]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Image Pipeline (16:9)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('poem')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'poem'
                ? 'border-[#722F37] text-[#722F37]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Feather className="w-3.5 h-3.5" />
            <span>New Poem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('curiosity')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'curiosity'
                ? 'border-[#722F37] text-[#722F37]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>New Curiosity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-all ${
              activeTab === 'code'
                ? 'border-[#722F37] text-[#722F37]'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Computer Script</span>
          </button>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: Media Uploader Pipeline */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-[#722F37]" />
                  <span>Pipeline Architecture Files</span>
                </div>
                <p>
                  Implemented using <code className="text-[#722F37] font-mono">react-image-crop</code>,{' '}
                  <code className="text-[#722F37] font-mono">/utils/cropImage.ts</code> (HTML5 Canvas export), and{' '}
                  <code className="text-[#722F37] font-mono">/app/api/upload/route.ts</code> (Vercel Blob client tokens).
                </p>
              </div>

              {/* The required ImageUploader Component */}
              <ImageUploader
                aspectRatio={16 / 9}
                onUploadComplete={handleUploadSuccess}
              />

              {/* Recent Media Gallery */}
              {recentUploads.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                    Recent 16:9 Uploaded Assets
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {recentUploads.map((url, i) => (
                      <div
                        key={i}
                        className="group relative aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shadow-2xs"
                      >
                        <img src={url} alt="Uploaded asset" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              setCopiedUrl(url);
                              setTimeout(() => setCopiedUrl(null), 2000);
                            }}
                            className="text-[10px] bg-white hover:bg-stone-100 text-stone-900 px-2 py-1 rounded font-medium shadow-xs flex items-center gap-1 transition-colors"
                          >
                            {copiedUrl === url ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-stone-600" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUploadedImage(url)}
                            title="Delete this image from storage"
                            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded shadow-xs transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: New Poem Form */}
          {activeTab === 'poem' && (
            <form onSubmit={handleCreatePoem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Poem Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., A Sonata in Rust"
                    value={poemTitle}
                    onChange={(e) => setPoemTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-cormorant text-stone-900 focus:outline-none focus:border-[#722F37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Theme</label>
                  <select
                    value={poemTheme}
                    onChange={(e) => setPoemTheme(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs text-stone-700 focus:outline-none focus:border-[#722F37]"
                  >
                    <option value="Love">Love</option>
                    <option value="Existentialism">Existentialism</option>
                    <option value="Memory">Memory</option>
                    <option value="Transience">Transience</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Subtitle / Epigraph</label>
                <input
                  type="text"
                  placeholder="e.g., On late night rain in Prague"
                  value={poemSubtitle}
                  onChange={(e) => setPoemSubtitle(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-baskerville text-stone-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Stanzas (separate stanzas with double enter) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Line one of stanza&#10;Line two of stanza&#10;&#10;Line one of stanza two&#10;Line two of stanza two"
                  value={poemStanzasRaw}
                  onChange={(e) => setPoemStanzasRaw(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-baskerville text-stone-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#722F37] hover:bg-[#581c24] text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                >
                  Publish Poem to Gallery
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: New Curiosity Form */}
          {activeTab === 'curiosity' && (
            <form onSubmit={handleCreateCuriosity} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Curiosity Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., The Co-Axial Escapement of George Daniels"
                    value={curiosityTitle}
                    onChange={(e) => setCuriosityTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-pecita text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={curiosityCategory}
                    onChange={(e) => setCuriosityCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-bricolage text-stone-700 focus:outline-none"
                  >
                    <option value="F1 Aerodynamics">F1 Aerodynamics</option>
                    <option value="90s Combustion">90s Combustion</option>
                    <option value="Mechanical Horology">Mechanical Horology</option>
                    <option value="Urban Geography">Urban Geography</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Concise thesis of this engineering or natural curiosity..."
                  value={curiositySummary}
                  onChange={(e) => setCuriositySummary(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-bricolage text-stone-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Essay Body
                </label>
                <textarea
                  rows={6}
                  placeholder="Detailed paragraphs exploring mechanics, history, and physics..."
                  value={curiosityContent}
                  onChange={(e) => setCuriosityContent(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-bricolage text-stone-800 focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                >
                  Save to Cabinet of Curiosities
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Computer Article Form */}
          {activeTab === 'code' && (
            <form onSubmit={handleCreateComputerArticle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., eBPF Kernel Tracing & Network Graphing"
                    value={compTitle}
                    onChange={(e) => setCompTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-bajaderka text-stone-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Category</label>
                  <select
                    value={compCategory}
                    onChange={(e) => setCompCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-700 focus:outline-none"
                  >
                    <option value="OSINT Reconnaissance">OSINT Reconnaissance</option>
                    <option value="Systems Philosophy">Systems Philosophy</option>
                    <option value="Low-Level Networking">Low-Level Networking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Philosophical Premise / Thesis
                </label>
                <input
                  type="text"
                  placeholder="e.g., Every software layer is an abstraction over entropy."
                  value={compThesis}
                  onChange={(e) => setCompThesis(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-nightingale text-stone-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Script Filename</label>
                  <input
                    type="text"
                    placeholder="recon_crawler.py"
                    value={compFilename}
                    onChange={(e) => setCompFilename(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-xs font-mono text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Code Script</label>
                <textarea
                  rows={8}
                  placeholder="# Enter Python, Bash, or C script..."
                  value={compCode}
                  onChange={(e) => setCompCode(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-900 text-stone-200 border border-stone-800 rounded-lg text-xs font-mono leading-relaxed focus:outline-none"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium rounded-lg shadow-sm transition-colors"
                >
                  Publish Code Module
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CMSModal;
