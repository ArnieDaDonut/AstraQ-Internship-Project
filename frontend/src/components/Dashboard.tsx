import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Calendar, BarChart3, Trash2, ArrowRight, Sparkles, 
  BookOpen, Layers, Network, CheckCircle2, ChevronRight, FileText, AlertCircle 
} from 'lucide-react';
import { ResearchProject, ResearchType, ProjectStatus } from '../types';

interface DashboardProps {
  projects: ResearchProject[];
  onCreateClick: () => void;
  onOpenProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onLoadDemo: () => void;
}

export default function Dashboard({ projects, onCreateClick, onOpenProject, onDeleteProject, onLoadDemo }: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Unique types from projects
  const availableTypes = Array.from(new Set(projects.map(p => p.research_type)));

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.question.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'All' || p.research_type === selectedType;
    const matchesStatus = selectedStatus === 'All' || p.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate high-level stats
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'Completed' || p.status === 'Report Ready').length;
  const projectsWithScores = projects.filter(p => p.opportunity_score > 0);
  const avgScore = projectsWithScores.length > 0 
    ? Math.round(projectsWithScores.reduce((sum, p) => sum + p.opportunity_score, 0) / projectsWithScores.length)
    : 0;
  
  const topRecommended = projectsWithScores.length > 0
    ? [...projectsWithScores].sort((a, b) => b.opportunity_score - a.opportunity_score)[0]
    : null;

  const getStatusStyle = (status: ProjectStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
      case 'Planning':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
      case 'Sources Added':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
      case 'Analysis In Progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900 animate-pulse';
      case 'Report Ready':
        return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900';
      case 'Completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-12 py-10 selection:bg-[#E2D1C3] dark:selection:bg-[#4A3B32]">
      
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/50 dark:bg-white/[0.02] p-8 md:p-10 rounded-none border border-[#121212]/10 dark:border-white/10">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#121212] text-white dark:bg-white dark:text-[#121212] text-[9px] font-bold rounded-full uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
            AI-Native Business Analyst
          </div>
          <h1 className="text-4xl font-serif italic text-[#121212] dark:text-[#FAF9F6] tracking-tight">
            AstraQ Research Agent 2.0
          </h1>
          <p className="text-sm leading-relaxed font-light text-[#121212]/80 dark:text-[#FAF9F6]/80">
            Input any complex business research query. Our engine will structure a comprehensive research plan, 
            crawl reference materials, extract terms, perform <strong className="font-semibold">TF-IDF & Cosine Similarity matches</strong>, and calculate weighted Opportunity Scores.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 shrink-0">
          {projects.length === 0 && (
            <button
              onClick={onLoadDemo}
              className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold border border-[#121212]/20 dark:border-white/20 hover:bg-[#121212] hover:text-white dark:hover:bg-white dark:hover:text-[#121212] transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Network className="w-3.5 h-3.5" />
              Load Seed Demo
            </button>
          )}
          <button
            onClick={onCreateClick}
            className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Research Project
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white/50 dark:bg-white/[0.01] p-6 rounded-none border border-[#121212]/10 dark:border-white/10 flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#121212]/40 dark:text-white/40">Total Projects</span>
          <span className="text-4xl font-serif text-[#121212] dark:text-white">{totalProjects}</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white/50 dark:bg-white/[0.01] p-6 rounded-none border border-[#121212]/10 dark:border-white/10 flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#121212]/40 dark:text-white/40">Completed Reports</span>
          <span className="text-4xl font-serif text-[#121212] dark:text-white">{completedProjects}</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white/50 dark:bg-white/[0.01] p-6 rounded-none border border-[#121212]/10 dark:border-white/10 flex flex-col justify-between min-h-[120px]">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#121212]/40 dark:text-white/40">Avg Opportunity Score</span>
          <span className="text-4xl font-serif text-[#121212] dark:text-white">
            {avgScore > 0 ? `${avgScore}%` : '—'}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white/50 dark:bg-white/[0.01] p-6 rounded-none border border-[#121212]/10 dark:border-white/10 flex flex-col justify-between min-h-[120px] overflow-hidden">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#121212]/40 dark:text-white/40">Top Sector Pick</span>
          <p className="text-sm font-serif italic text-[#121212] dark:text-[#FAF9F6] truncate mt-1" title={topRecommended?.title || 'N/A'}>
            {topRecommended ? `${topRecommended.title.replace(' Market Research', '')} (${topRecommended.opportunity_score}%)` : 'None evaluated'}
          </p>
        </div>

      </div>

      {/* Workspace Controls */}
      <div className="bg-white/50 dark:bg-white/[0.02] p-5 rounded-none border border-[#121212]/10 dark:border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-[#121212]/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Search projects or research questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#121212]/10 dark:border-white/10 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white bg-[#FAF9F6] dark:bg-[#121212] text-[#121212] dark:text-[#FAF9F6]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[#FAF9F6] dark:bg-[#121212] border border-[#121212]/10 dark:border-white/10 rounded-none px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#121212]/40" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent border-none text-[10px] uppercase tracking-wider font-semibold text-[#121212]/70 dark:text-white/70 focus:outline-none pr-2 py-0.5 cursor-pointer"
            >
              <option value="All">All Types</option>
              {availableTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-[#FAF9F6] dark:bg-[#121212] border border-[#121212]/10 dark:border-white/10 rounded-none px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#121212]/40" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none text-[10px] uppercase tracking-wider font-semibold text-[#121212]/70 dark:text-white/70 focus:outline-none pr-2 py-0.5 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Planning">Planning</option>
              <option value="Sources Added">Sources Added</option>
              <option value="Analysis In Progress">Analysis In Progress</option>
              <option value="Report Ready">Report Ready</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

      </div>

      {/* Projects List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 space-y-6">
          <BookOpen className="w-12 h-12 text-[#121212]/20 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-serif italic text-[#121212] dark:text-[#FAF9F6]">
              No research projects found
            </h3>
            <p className="text-xs text-[#121212]/50 dark:text-white/40 max-w-sm mx-auto">
              Create a new project above, or load the pre-seeded Healthcare SaaS market research demo.
            </p>
          </div>
          {projects.length === 0 && (
            <button
              onClick={onLoadDemo}
              className="px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold bg-[#121212] text-white dark:bg-white dark:text-[#121212] hover:opacity-90 transition-opacity"
            >
              Load Healthcare Demo Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              className="bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 hover:border-[#121212]/30 dark:hover:border-white/30 transition flex flex-col justify-between group h-[280px] overflow-hidden relative"
            >
              {/* Card Header */}
              <div className="p-8 space-y-4 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] bg-[#121212]/5 dark:bg-white/10 text-[#121212]/70 dark:text-white/70 rounded-none">
                    {p.research_type}
                  </span>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] rounded-none border ${getStatusStyle(p.status)}`}>
                    {p.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h3 
                    onClick={() => onOpenProject(p.id)}
                    className="text-xl font-serif italic text-[#121212] dark:text-[#FAF9F6] cursor-pointer hover:underline line-clamp-1"
                  >
                    {p.title}
                  </h3>
                  <p className="text-[10px] font-mono text-[#121212]/50 dark:text-white/40 tracking-tight line-clamp-1">
                    "{p.question}"
                  </p>
                  <p className="text-xs text-[#121212]/70 dark:text-white/60 line-clamp-3 mt-2 leading-relaxed font-light">
                    {p.description || 'No additional description provided.'}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-8 py-4 bg-[#121212]/2 dark:bg-white/[0.01] border-t border-[#121212]/10 dark:border-white/10 flex items-center justify-between">
                
                {/* Score Indicator */}
                <div className="flex items-center gap-2.5">
                  <span className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em]">Opp Score</span>
                  <div className={`px-2 py-0.5 rounded-none text-[10px] font-mono font-bold ${
                    p.opportunity_score > 0 
                      ? p.opportunity_score >= 70 
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' 
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400'
                      : 'bg-[#121212]/5 text-[#121212]/40 dark:bg-white/5 dark:text-white/40'
                  }`}>
                    {p.opportunity_score > 0 ? `${p.opportunity_score}%` : 'N/A'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteProject(p.id);
                    }}
                    className="text-[#121212]/30 dark:text-white/30 hover:text-rose-600 dark:hover:text-rose-500 p-1.5 rounded-none hover:bg-rose-50/50 dark:hover:bg-rose-950/10 transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Open button */}
                  <button
                    onClick={() => onOpenProject(p.id)}
                    className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-[#121212] dark:text-white hover:underline cursor-pointer"
                  >
                    Open
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>
      )}

      {/* Informative footer */}
      <div className="p-6 bg-white/50 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 rounded-none flex flex-col sm:flex-row items-center gap-4 text-xs text-[#121212]/60 dark:text-white/50 leading-relaxed font-light">
        <AlertCircle className="w-5 h-5 text-[#121212]/40 dark:text-white/40 shrink-0" />
        <div>
          <span className="font-bold text-[#121212] dark:text-white uppercase tracking-wider text-[10px] block mb-1">Academic / Internship Project Focus</span> 
          This agent demonstrates the exact algorithms behind natural language intelligence. Inside, you can examine the raw TF frequencies, IDF values, and Cosine similarity math calculated live using plain-text algorithms, helping you learn full-stack AI engineering without hiding the complexity behind generic wrappers.
        </div>
      </div>

    </div>
  );
}
