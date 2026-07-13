import React, { useState } from 'react';
import { 
  Plus, Search, Link as LinkIcon, Download, Globe, Shield, Activity, 
  Trash2, RefreshCw, Eye, FileText, CheckCircle2, AlertCircle, Sparkles, HelpCircle, X 
} from 'lucide-react';
import { ResearchProject, ResearchSource, ResearchDocument, SourceType } from '../types';
import { normalizeUrl } from '../utils/algorithms';

interface SourceExplorerViewProps {
  project: ResearchProject;
  sources: ResearchSource[];
  documents: ResearchDocument[];
  onAddSource: (title: string, url: string, type: SourceType, notes?: string) => void;
  onDiscoverSources: () => void;
  onAnalyzeSources: () => void;
  onRemoveSource: (id: string) => void;
  onReRunExtraction: (id: string) => void;
  isAnalyzing: boolean;
}

export default function SourceExplorerView({
  project, sources, documents, onAddSource, onDiscoverSources, onAnalyzeSources, onRemoveSource, onReRunExtraction, isAnalyzing
}: SourceExplorerViewProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Form Inputs
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addType, setAddType] = useState<SourceType>('Article');
  const [addNotes, setAddNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Selected source detail modal
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!addUrl.trim()) {
      setFormError('Source URL is required.');
      return;
    }

    // Basic URL validation
    try {
      let testUrl = addUrl.trim();
      if (!/^https?:\/\//i.test(testUrl)) {
        testUrl = 'https://' + testUrl;
      }
      new URL(testUrl);
    } catch (err) {
      setFormError('Please enter a valid web URL.');
      return;
    }

    // Check duplicate
    const normalizedNew = normalizeUrl(addUrl);
    const isDup = sources.some(s => normalizeUrl(s.url) === normalizedNew);
    if (isDup) {
      setFormError('This URL has already been added to the project.');
      return;
    }

    const titleToUse = addTitle.trim() || `Reference - ${new URL(addUrl.trim().startsWith('http') ? addUrl : 'https://' + addUrl).hostname}`;
    onAddSource(titleToUse, addUrl.trim(), addType, addNotes.trim());
    
    // Reset form
    setAddTitle('');
    setAddUrl('');
    setAddType('Article');
    setAddNotes('');
    setShowAddForm(false);
  };

  const activeSource = sources.find(s => s.id === selectedSourceId);
  const activeDoc = documents.find(d => d.source_id === selectedSourceId);

  const getCredibilityBadgeColor = (score: number) => {
    if (score >= 90) return 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/20';
    if (score >= 70) return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/20';
    if (score >= 50) return 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/20';
    return 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/20';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Extracted':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Extracted</span>;
      case 'Failed':
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500 animate-pulse"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pending</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Sources Control Card */}
      <div className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-[#121212]/40 dark:text-white/40" />
            <h2 className="text-2xl font-serif italic tracking-tight text-[#121212] dark:text-[#FAF9F6]">
              Source Crawler & Explorer
            </h2>
          </div>
          <p className="text-sm leading-relaxed font-light text-[#121212]/70 dark:text-[#FAF9F6]/70">
            Fulfill your data collection strategy. Add manual web URLs, discover suggestions automatically matching your question, and run the <strong className="font-semibold">Content Extractor</strong> to download and tokenize body contents.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onDiscoverSources()}
            className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#121212] dark:border-white/30 text-[#121212] dark:text-[#FAF9F6] hover:bg-[#121212] hover:text-white dark:hover:bg-white dark:hover:text-[#121212] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Discover Suggestions
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#121212] dark:border-white/30 text-[#121212] dark:text-[#FAF9F6] hover:bg-[#121212] hover:text-white dark:hover:bg-white dark:hover:text-[#121212] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Manual URL
          </button>

          {sources.length > 0 && (
            <button
              onClick={onAnalyzeSources}
              disabled={isAnalyzing}
              className={`px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold text-white transition flex items-center gap-2 shadow-sm cursor-pointer ${
                isAnalyzing 
                  ? 'bg-[#121212]/30 cursor-not-allowed dark:bg-white/10' 
                  : 'bg-[#121212] hover:opacity-90 dark:bg-white dark:text-[#121212]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Extracting & Tokenizing...' : 'Crawl & Analyze Sources'}
            </button>
          )}
        </div>
      </div>

      {/* Manual Add Form Overlay (Dropdown card style) */}
      {showAddForm && (
        <div className="bg-white/70 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 p-6 relative">
          <button 
            onClick={() => setShowAddForm(false)} 
            className="absolute top-4 right-4 text-[10px] uppercase tracking-widest font-bold hover:underline cursor-pointer"
          >
            Close
          </button>
          
          <h4 className="text-xs font-bold text-[#121212] dark:text-white uppercase tracking-[0.15em] mb-4">Add Source Manually</h4>
          
          <form onSubmit={handleManualAdd} className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-5 space-y-1">
              <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.1em]">Source Title (Optional)</label>
              <input
                type="text"
                placeholder="e.g., CDC Cloud Computing Policy"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6]"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.1em]">URL Link *</label>
              <input
                type="text"
                placeholder="e.g., https://cdc.gov/policy"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6]"
              />
            </div>

            <div className="md:col-span-3 space-y-1">
              <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.1em]">Source Type</label>
              <select
                value={addType}
                onChange={(e) => setAddType(e.target.value as SourceType)}
                className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6]"
              >
                <option value="Article">Article</option>
                <option value="Company Website">Company Website</option>
                <option value="Blog">Blog</option>
                <option value="Research Report">Research Report</option>
                <option value="Government Website">Government Website</option>
                <option value="University Source">University Source</option>
                <option value="Competitor Website">Competitor Website</option>
                <option value="Forum/Social Media">Forum/Social Media</option>
              </select>
            </div>

            <div className="md:col-span-12 flex justify-between items-center pt-2">
              <p className="text-xs text-rose-500 font-semibold">{formError}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#121212]/20 dark:border-white/20 text-[#121212] dark:text-[#FAF9F6] hover:bg-[#121212]/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 cursor-pointer"
                >
                  Save Source
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Sources List Grid */}
      {sources.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 space-y-6">
          <LinkIcon className="w-12 h-12 text-[#121212]/20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-serif italic text-[#121212] dark:text-[#FAF9F6]">
              No research sources added yet
            </h3>
            <p className="text-xs text-[#121212]/50 dark:text-white/40 max-w-sm mx-auto leading-relaxed">
              Add your custom links or use the <strong className="font-semibold">"Discover Suggestions"</strong> helper to populate articles with rich pre-loaded clinical, compliant, and startup-focused market data.
            </p>
          </div>
          <button
            onClick={() => onDiscoverSources()}
            className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity cursor-pointer"
          >
            Discover Suggestions Now
          </button>
        </div>
      ) : (
        <div className="bg-white/50 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#121212]/2 dark:bg-white/[0.01] border-b border-[#121212]/10 dark:border-white/10 text-[9px] font-bold text-[#121212]/50 dark:text-white/40 uppercase tracking-[0.2em]">
                  <th className="p-5 pl-8">Source Title / Link</th>
                  <th className="p-5">Type</th>
                  <th className="p-5 text-center">Credibility</th>
                  <th className="p-5 text-center">Relevance Score</th>
                  <th className="p-5">Extraction</th>
                  <th className="p-5 pr-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#121212]/5 dark:divide-white/5">
                {sources.map((s) => (
                  <tr key={s.id} className="hover:bg-[#121212]/2 dark:hover:bg-white/[0.005] transition-colors group text-sm">
                    {/* Title / URL */}
                    <td className="p-5 pl-8 max-w-sm sm:max-w-md">
                      <div className="space-y-1">
                        <p className="font-serif italic text-base text-[#121212] dark:text-[#FAF9F6] truncate" title={s.title}>
                          {s.title}
                        </p>
                        <a 
                          href={s.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-[#121212]/40 hover:text-[#121212] dark:hover:text-white flex items-center gap-1 w-fit truncate"
                        >
                          <LinkIcon className="w-3 h-3" />
                          {s.url}
                        </a>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-5">
                      <span className="inline-block px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-[#121212]/5 dark:bg-white/10 text-[#121212]/70 dark:text-white/70 rounded-none">
                        {s.source_type}
                      </span>
                    </td>

                    {/* Credibility */}
                    <td className="p-5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-mono font-bold rounded-none border ${getCredibilityBadgeColor(s.credibility_score)}`}>
                        {s.credibility_score}%
                      </span>
                    </td>

                    {/* Relevance Score */}
                    <td className="p-5">
                      {s.status === 'Extracted' ? (
                        <div className="flex items-center justify-center gap-3 w-40 mx-auto">
                          <span className="text-xs font-bold text-[#121212] dark:text-[#FAF9F6] font-mono w-8 text-right">
                            {s.relevance_score}%
                          </span>
                          <div className="flex-1 h-1.5 bg-[#121212]/5 dark:bg-white/10 rounded-none overflow-hidden">
                            <div 
                              className={`h-full rounded-none bg-[#121212] dark:bg-white`}
                              style={{ width: `${s.relevance_score}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-[#121212]/30 dark:text-white/30 text-center font-mono">Not calculated</p>
                      )}
                    </td>

                    {/* Extraction Status */}
                    <td className="p-5">
                      {getStatusBadge(s.status)}
                    </td>

                    {/* Actions */}
                    <td className="p-5 pr-8 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {s.status === 'Extracted' && (
                          <button
                            onClick={() => setSelectedSourceId(s.id)}
                            className="p-1.5 text-[#121212]/40 hover:text-[#121212] dark:text-white/40 dark:hover:text-white rounded-none hover:bg-[#121212]/5 transition-colors cursor-pointer"
                            title="View extracted content"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onReRunExtraction(s.id)}
                          className="p-1.5 text-[#121212]/40 hover:text-[#121212] dark:text-white/40 dark:hover:text-white rounded-none hover:bg-[#121212]/5 transition-colors cursor-pointer"
                          title="Re-run extraction"
                          disabled={isAnalyzing}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveSource(s.id)}
                          className="p-1.5 text-[#121212]/40 hover:text-rose-600 rounded-none hover:bg-rose-50/50 transition-colors cursor-pointer"
                          title="Remove source"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Crawl Details Drawer/Modal */}
      {selectedSourceId && activeSource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-[#FAF9F6] dark:bg-[#121212] w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-[#121212]/10 dark:border-white/10 animate-slide-left">
            
            {/* Header */}
            <div className="p-8 border-b border-[#121212]/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.2em] block">SOURCE EXTRACTOR UTILITY</span>
                <h3 className="text-xl font-serif italic text-[#121212] dark:text-[#FAF9F6] truncate max-w-md">
                  {activeSource.title}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedSourceId(null)}
                className="p-2 text-[#121212]/55 hover:text-[#121212] dark:text-white/55 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Source Details Metadata */}
            <div className="p-8 bg-[#121212]/2 dark:bg-white/[0.01] border-b border-[#121212]/10 dark:border-white/10 grid grid-cols-3 gap-6 text-xs text-[#121212]/60 dark:text-white/50">
              <div>
                <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-wider">Domain</p>
                <p className="font-serif italic text-sm text-[#121212] dark:text-white mt-0.5 truncate">{activeSource.domain}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-wider">Type</p>
                <p className="font-serif italic text-sm text-[#121212] dark:text-white mt-0.5">{activeSource.source_type}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-wider">Total Word Count</p>
                <p className="font-mono text-sm text-[#121212] dark:text-white mt-0.5">{activeDoc?.word_count || 0} words</p>
              </div>
            </div>

            {/* Split screen content views */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              {/* Raw Body Text */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Raw Extracted Body Text
                </h4>
                <div className="p-5 bg-white/50 dark:bg-[#121212] text-xs text-[#121212]/80 dark:text-white/80 leading-relaxed max-h-56 overflow-y-auto border border-[#121212]/10 dark:border-white/10 whitespace-pre-wrap font-sans font-light">
                  {activeDoc?.raw_text || 'No raw content extracted.'}
                </div>
              </div>

              {/* Cleaned tokens list */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4" />
                  Cleaned Tokens List (Stop Words Removed)
                </h4>
                <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light leading-normal">
                  This text has been lowercased, had special characters removed, and was filtered against standard stop words to prep for the TF-IDF engine vectorization.
                </p>
                <div className="p-5 bg-white/50 dark:bg-[#121212] text-xs font-mono text-[#121212]/70 dark:text-white/70 leading-relaxed max-h-56 overflow-y-auto border border-[#121212]/10 dark:border-white/10">
                  {activeDoc?.cleaned_text ? (
                    <div className="flex flex-wrap gap-1.5">
                      {activeDoc.cleaned_text.split(' ').map((word, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#FAF9F6] dark:bg-zinc-900 border border-[#121212]/5 dark:border-white/10 text-zinc-700 dark:text-zinc-300 text-[11px] rounded-none">
                          {word}
                        </span>
                      ))}
                    </div>
                  ) : 'No tokens processed.'}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-8 border-t border-[#121212]/10 dark:border-white/10 bg-[#121212]/2 dark:bg-white/[0.01] flex justify-end">
              <button
                onClick={() => setSelectedSourceId(null)}
                className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] cursor-pointer"
              >
                Close Viewer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
