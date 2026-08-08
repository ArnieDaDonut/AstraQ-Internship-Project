import React from 'react';
import { Bot, Sparkles, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { MasterPromptResponse } from '../types';

interface AgentPromptViewProps {
  promptData: MasterPromptResponse;
  isGenerating: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AgentPromptView({ 
  promptData, 
  isGenerating, 
  onConfirm, 
  onCancel 
}: AgentPromptViewProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none">
        
        <div className="flex items-center gap-3 mb-6">
          <Bot className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-serif italic text-[#121212] dark:text-[#FAF9F6]">
            Agentic AI Workflow
          </h2>
        </div>

        <div className="space-y-8">
          {/* Workflow Summary Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              What to Expect
            </h3>
            <p className="text-sm leading-relaxed font-light text-[#121212]/80 dark:text-[#FAF9F6]/80 bg-zinc-50 dark:bg-zinc-900/50 p-4 border border-zinc-200 dark:border-zinc-800">
              {promptData.workflow_summary}
            </p>
          </div>

          {/* Master Prompt Section */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Master Prompt
            </h3>
            <div className="relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>
              <pre className="text-xs leading-relaxed font-mono text-[#121212]/70 dark:text-white/70 bg-[#121212]/5 dark:bg-white/5 p-6 pl-8 overflow-x-auto whitespace-pre-wrap">
                {promptData.prompt_text}
              </pre>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-[#121212]/10 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={onCancel}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212]/60 hover:text-[#121212] dark:text-white/60 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                Executing Agent...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                Confirm & Run Agent
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
