import React, { useState } from 'react';
import { X, HelpCircle, Briefcase, TrendingUp, Cpu, Award } from 'lucide-react';
import { ResearchType } from '../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, question: string, description: string, type: ResearchType) => void;
}

export default function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ResearchType>('Market Research');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Project title is required.';
    if (!question.trim()) newErrors.question = 'Research question is required.';
    if (question.trim().length < 15) newErrors.question = 'Please provide a more descriptive, complete question (min 15 chars).';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onCreate(title.trim(), question.trim(), description.trim(), type);
    // Reset state
    setTitle('');
    setQuestion('');
    setDescription('');
    setType('Market Research');
    setErrors({});
    onClose();
  };

  const setSuggestedQuestion = (suggestedTitle: string, suggestedType: ResearchType, suggestedQ: string) => {
    setTitle(suggestedTitle);
    setType(suggestedType);
    setQuestion(suggestedQ);
    setDescription(`Strategic evaluation of potential product-market fit, compliance gates, and buyer demographics for targeting ${suggestedTitle.replace(' Market Research', '')} software companies.`);
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-2xl border border-zinc-100 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 font-sans tracking-tight">
              Create Research Project
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Organize your research around a primary market hypothesis or business question.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick templates */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
              Quick Suggestions
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSuggestedQuestion(
                  'Healthcare SaaS Market Research',
                  'Market Research',
                  'Should AstraQ target healthcare SaaS companies?'
                )}
                className="text-left p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition group"
              >
                <div className="flex items-center gap-2 font-medium text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600">
                  <Briefcase className="w-3.5 h-3.5" />
                  Healthcare SaaS
                </div>
                <p className="text-xxs text-zinc-400 dark:text-zinc-500 mt-1">
                  "Should AstraQ target healthcare SaaS companies?"
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSuggestedQuestion(
                  'FinTech Audit Software Research',
                  'Startup Validation',
                  'Is there a viable market for AI testing in secure Fintech SaaS ledgers?'
                )}
                className="text-left p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition group"
              >
                <div className="flex items-center gap-2 font-medium text-xs text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Fintech Ledgers
                </div>
                <p className="text-xxs text-zinc-400 dark:text-zinc-500 mt-1">
                  "Is there a viable market for AI testing in secure Fintech SaaS?"
                </p>
              </button>
            </div>
          </div>

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
              Project Title
            </label>
            <input
              type="text"
              placeholder="e.g., Healthcare SaaS Market Research"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-800 dark:text-zinc-200 ${
                errors.title 
                  ? 'border-rose-500 focus:ring-rose-200 focus:border-rose-500' 
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-200 dark:focus:ring-zinc-800 focus:border-zinc-400'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-rose-500 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Research Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
              Research Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Market Research', 'Competitive Analysis', 'Startup Validation', 'Technology Trend'] as ResearchType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition ${
                    type === t
                      ? 'border-zinc-900 dark:border-zinc-200 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Research Question */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              Research Question
              <span className="text-zinc-400 hover:text-zinc-600 cursor-help" title="The exact prompt or query you want analyzed. Make it clear and analytical.">
                <HelpCircle className="w-3.5 h-3.5" />
              </span>
            </label>
            <input
              type="text"
              placeholder="e.g., Should AstraQ target healthcare SaaS companies?"
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (errors.question) setErrors(prev => ({ ...prev, question: '' }));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-800 dark:text-zinc-200 ${
                errors.question 
                  ? 'border-rose-500 focus:ring-rose-200 focus:border-rose-500' 
                  : 'border-zinc-200 dark:border-zinc-800 focus:ring-zinc-200 dark:focus:ring-zinc-800 focus:border-zinc-400'
              }`}
            />
            {errors.question && (
              <p className="text-xs text-rose-500 font-medium">{errors.question}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 block">
              Description (Optional)
            </label>
            <textarea
              placeholder="Provide a brief context or notes on this research endeavor..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800 focus:border-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/50 text-zinc-800 dark:text-zinc-200 resize-none"
            />
          </div>

        </form>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-sm font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 transition"
          >
            Save Project
          </button>
        </div>

      </div>
    </div>
  );
}
