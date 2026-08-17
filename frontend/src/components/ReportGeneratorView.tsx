import React from 'react';
import { Sparkles, FileText, Target, ArrowRight } from 'lucide-react';
import { ResearchProject } from '../types';

interface ReportGeneratorViewProps {
  project: ResearchProject;
  contextLinks?: string[];
  contextFileContents?: string[];
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function ReportGeneratorView({
  project,
  contextLinks = [],
  contextFileContents = [],
  onGenerate,
  isGenerating
}: ReportGeneratorViewProps) {
  const linkCount = contextLinks.filter(l => l.trim() !== '').length;
  const fileCount = contextFileContents.length;
  const totalChars = contextFileContents.reduce((sum, text) => sum + text.length, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-10 rounded-none flex flex-col items-center text-center">
        
        <div className="w-16 h-16 bg-[#121212]/5 dark:bg-white/5 flex items-center justify-center rounded-full mb-6">
          <FileText className="w-8 h-8 text-[#121212] dark:text-[#FAF9F6]" />
        </div>
        
        <h2 className="text-3xl font-serif italic text-[#121212] dark:text-[#FAF9F6] mb-4">
          Ready to Generate Report
        </h2>
        
        <p className="text-sm font-light text-[#121212]/70 dark:text-[#FAF9F6]/70 max-w-xl mx-auto leading-relaxed mb-8">
          We have saved your preferences and context. The AI agent will now synthesize the final strategic report using all provided materials.
        </p>

        <div className="w-full max-w-2xl bg-white dark:bg-[#121212]/50 border border-[#121212]/10 dark:border-white/10 p-6 rounded-none text-left mb-10 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-[#121212]/50 dark:text-white/40 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
              <Target className="w-3 h-3" />
              Research Objective
            </span>
            <p className="font-serif italic text-sm text-[#121212] dark:text-white">
              "{project.question}"
            </p>
          </div>

          {/* Attached Context Summary */}
          {(linkCount > 0 || fileCount > 0) && (
            <div className="pt-4 border-t border-[#121212]/10 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-bold text-[#121212]/50 dark:text-white/40 uppercase tracking-[0.2em] block">
                ATTACHED CONTEXT & SOURCES NOTED
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {linkCount > 0 && (
                  <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                    🔗 {linkCount} Link{linkCount > 1 ? 's' : ''} Included
                  </span>
                )}
                {fileCount > 0 && (
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                    📄 {fileCount} Document{fileCount > 1 ? 's' : ''} ({(totalChars / 1000).toFixed(1)}k chars)
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="group relative flex items-center gap-3 px-8 py-4 bg-[#121212] text-white dark:bg-white dark:text-[#121212] rounded-full hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer shadow-lg"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
              <span className="font-bold text-sm tracking-widest uppercase">Synthesizing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400 group-hover:animate-pulse" />
              <span className="font-bold text-sm tracking-widest uppercase">Generate Final Report</span>
              <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </button>

      </div>
    </div>
  );
}
