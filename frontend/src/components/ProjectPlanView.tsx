import React, { useState } from 'react';
import { 
  Sparkles, Plus, Trash2, Edit3, Check, X, AlertCircle, HelpCircle, FileSpreadsheet, ListTodo 
} from 'lucide-react';
import { ResearchProject, ResearchPlanItem } from '../types';

interface ProjectPlanViewProps {
  project: ResearchProject;
  plan: ResearchPlanItem[];
  onGeneratePlan: () => void;
  onAddPlanItem: (category: string, description: string) => void;
  onUpdatePlanItem: (id: string, category: string, description: string) => void;
  onDeletePlanItem: (id: string) => void;
}

export default function ProjectPlanView({ 
  project, plan, onGeneratePlan, onAddPlanItem, onUpdatePlanItem, onDeletePlanItem 
}: ProjectPlanViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const handleSaveAdd = () => {
    if (!newCategory.trim()) return;
    onAddPlanItem(newCategory.trim(), newDesc.trim());
    setNewCategory('');
    setNewDesc('');
    setIsAdding(false);
  };

  const handleStartEdit = (item: ResearchPlanItem) => {
    setEditingId(item.id);
    setEditCategory(item.category);
    setEditDesc(item.description);
  };

  const handleSaveEdit = (id: string) => {
    if (!editCategory.trim()) return;
    onUpdatePlanItem(id, editCategory.trim(), editDesc.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      
      {/* Plan Header Card */}
      <div className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5">
            <ListTodo className="w-5 h-5 text-[#121212]/40 dark:text-white/40" />
            <h2 className="text-2xl font-serif italic tracking-tight text-[#121212] dark:text-[#FAF9F6]">
              Research Categories & Plan
            </h2>
          </div>
          <p className="text-sm leading-relaxed font-light text-[#121212]/70 dark:text-[#FAF9F6]/70">
            Before adding sources, break down your main question: <span className="font-mono text-xs font-semibold bg-[#121212]/5 dark:bg-white/10 px-1.5 py-0.5 rounded-none">"{project.question}"</span> into at least 5 structured category targets. This helps the TF-IDF engine classify documents.
          </p>
        </div>

        <div>
          {plan.length === 0 ? (
            <button
              onClick={onGeneratePlan}
              className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition flex items-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Generate Research Plan
            </button>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="px-5 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#121212] dark:border-white/30 text-[#121212] dark:text-[#FAF9F6] hover:bg-[#121212] hover:text-white dark:hover:bg-white dark:hover:text-[#121212] transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {plan.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 space-y-6">
          <Sparkles className="w-12 h-12 text-[#121212]/20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-serif italic text-[#121212] dark:text-[#FAF9F6]">
              No plan categories configured
            </h3>
            <p className="text-xs text-[#121212]/50 dark:text-white/40 max-w-sm mx-auto leading-relaxed">
              Let the system auto-generate a custom 5+ category research structure based on your research query.
            </p>
          </div>
          <button
            onClick={onGeneratePlan}
            className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity cursor-pointer"
          >
            Generate Plan Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Dynamic Categories */}
          {plan.map((item, index) => (
            <div
              key={item.id}
              className="bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 p-6 flex flex-col justify-between hover:border-[#121212]/30 dark:hover:border-white/30 transition-colors gap-4"
            >
              {editingId === item.id ? (
                /* Editing Mode */
                <div className="space-y-4 flex-1">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] block">Category Title</label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] block">Target Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6] resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-none border border-[#121212]/10 dark:border-white/10 text-[#121212]/50 hover:bg-[#121212]/5 hover:text-[#121212] cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleSaveEdit(item.id)}
                      className="p-1.5 rounded-none bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 cursor-pointer"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Static Mode */
                <div className="flex-1 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center">
                        <span className="text-sm font-serif italic text-[#121212]/40 dark:text-white/40 mr-2.5">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h4 className="font-serif italic text-base text-[#121212] dark:text-[#FAF9F6]">
                          {item.category}
                        </h4>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 text-[#121212]/40 hover:text-[#121212] dark:text-white/40 dark:hover:text-white rounded-none hover:bg-[#121212]/5 transition-colors cursor-pointer"
                          title="Edit category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeletePlanItem(item.id)}
                          className="p-1.5 text-[#121212]/40 hover:text-rose-600 rounded-none hover:bg-rose-50/50 transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-[#121212]/70 dark:text-white/60 leading-relaxed font-light pl-6">
                      {item.description || 'No description provided for this research vector.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Inline Add Card */}
          {isAdding ? (
            <div className="bg-white/50 dark:bg-white/[0.01] rounded-none border border-dashed border-[#121212]/30 dark:border-white/30 p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] block">Category Title</label>
                <input
                  type="text"
                  placeholder="e.g., Regulatory Compliance Gates"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] block">Target Description</label>
                <textarea
                  placeholder="What details should we look for to validate this category?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#121212]/20 dark:border-white/20 text-[#121212] dark:text-[#FAF9F6] hover:bg-[#121212]/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAdd}
                  className="px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="border border-dashed border-[#121212]/20 dark:border-white/20 hover:border-[#121212]/50 hover:bg-[#121212]/2 dark:hover:bg-white/[0.01] rounded-none p-6 flex flex-col items-center justify-center text-center gap-2 transition text-[#121212]/40 hover:text-[#121212] dark:hover:text-white h-full min-h-[140px] cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Add Custom Category</span>
              <span className="text-[10px] text-[#121212]/50 max-w-[220px] font-light leading-normal">Define an extra area to look for in your source documents.</span>
            </button>
          )}

        </div>
      )}

      {/* Workflow Reminder banner */}
      {plan.length > 0 && (
        <div className="bg-white/50 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 p-5 rounded-none flex items-center gap-4">
          <AlertCircle className="w-5 h-5 text-[#121212]/40 dark:text-white/40 shrink-0" />
          <p className="text-xs leading-relaxed text-[#121212]/60 dark:text-white/60 font-light">
            <strong className="font-bold text-[#121212] dark:text-white uppercase tracking-wider text-[9px] block mb-1">RECOMMENDED STEP</strong>
            Navigate to the <strong className="font-bold">"Sources"</strong> tab above to add manually selected reference links or click <strong className="font-bold">"Discover Sources"</strong> to let the analyst fetch matching material based on these {plan.length} target categories!
          </p>
        </div>
      )}

    </div>
  );
}
