import React, { useState } from 'react';
import { FileText, Sparkles, ArrowLeft } from 'lucide-react';

interface ReportPreferenceViewProps {
  isSaving: boolean;
  onSubmit: (preference: string) => void;
  onCancel: () => void;
}

export default function ReportPreferenceView({ 
  isSaving, 
  onSubmit, 
  onCancel 
}: ReportPreferenceViewProps) {
  const [preference, setPreference] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none">
        
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-serif italic text-[#121212] dark:text-[#FAF9F6]">
            Final Report Preferences
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-light text-[#121212]/70 dark:text-[#FAF9F6]/70 leading-relaxed">
            How would you like the final AI-generated report to be structured?
          </p>
          <div className="relative">
            <textarea
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="e.g., I want a highly technical executive summary, and exactly 5 bullet points for risks. Keep the tone professional and concise."
              className="w-full h-32 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-amber-500 text-sm font-light text-[#121212] dark:text-[#FAF9F6] resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 pt-6 border-t border-[#121212]/10 dark:border-white/10 flex items-center justify-between">
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#121212]/60 hover:text-[#121212] dark:text-white/60 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <button
            onClick={() => onSubmit(preference)}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                Save Preferences & Continue
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
