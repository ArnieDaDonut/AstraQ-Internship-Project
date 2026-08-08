import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePictureUpload from './components/ProfilePictureUpload';
import { 
  Plus, ArrowLeft, BarChart2, CheckCircle2, ChevronRight, FileText, 
  Globe, Layers, ListTodo, Network, RefreshCw, Scale, ShieldCheck, 
  Sparkles, Trash2, LayoutDashboard, Database, HelpCircle, BookOpen 
} from 'lucide-react';

// Type definitions
import { 
  ResearchProject, ResearchPlanItem, ResearchSource, ResearchDocument, 
  Keyword, Theme, OpportunityWeights, ProjectStatus, ResearchType, SourceType, ResearchReport 
} from './types';

// Algorithms & Seed Utilities
import { 
  cleanText, tokenize, computeIDF, extractTopKeywords, computeRelevanceScore, 
  groupSourcesIntoThemes, calculateOpportunityScore, scoreCredibility 
} from './utils/algorithms';
import { 
  HEALTHCARE_PROJECT, HEALTHCARE_PLAN_ITEMS, seedProjectWorkspace, 
  generatePlanForQuestion, generateDiscoveriesForQuestion, makeId 
} from './utils/preseededData';

// UI Subcomponents
import Dashboard from './components/Dashboard';
import CreateProjectModal from './components/CreateProjectModal';
import ReportPreferenceView from './components/ReportPreferenceView';
import ReportGeneratorView from './components/ReportGeneratorView';
import RecommendationReportView from './components/RecommendationReportView';

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // --- STATE DECLARATIONS ---
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [planItems, setPlanItems] = useState<ResearchPlanItem[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  
  // Selection & UI flow
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preferences' | 'generator' | 'report'>('preferences');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Scoring & Reports
  const [projectScores, setProjectScores] = useState<Record<string, any>>({});
  const [generatedReport, setGeneratedReport] = useState<ResearchReport | null>(null);

  // Model Weights distribution
  const [weights, setWeights] = useState<OpportunityWeights>({
    marketRelevance: 0.25,
    problemSeverity: 0.20,
    productFit: 0.20,
    competitionLevel: 0.15,
    buyerUrgency: 0.10,
    dataConfidence: 0.10
  });

  // --- USER-ISOLATED LOCAL STORAGE SYNC ---
  const userKey = user?.email ? user.email.toLowerCase() : 'guest';


  // Load data for the current logged-in user email
  useEffect(() => {
    if (!userKey) return;

    const storedProjects = localStorage.getItem(`astraq_projects_${userKey}`);
    const storedPlanItems = localStorage.getItem(`astraq_plan_items_${userKey}`);
    const storedSources = localStorage.getItem(`astraq_sources_${userKey}`);
    const storedDocuments = localStorage.getItem(`astraq_documents_${userKey}`);
    const storedKeywords = localStorage.getItem(`astraq_keywords_${userKey}`);
    const storedThemes = localStorage.getItem(`astraq_themes_${userKey}`);
    const storedScores = localStorage.getItem(`astraq_project_scores_${userKey}`);
    const storedWeights = localStorage.getItem(`astraq_weights_${userKey}`);

    setProjects(storedProjects ? JSON.parse(storedProjects) : []);
    setPlanItems(storedPlanItems ? JSON.parse(storedPlanItems) : []);
    setSources(storedSources ? JSON.parse(storedSources) : []);
    setDocuments(storedDocuments ? JSON.parse(storedDocuments) : []);
    setKeywords(storedKeywords ? JSON.parse(storedKeywords) : []);
    setThemes(storedThemes ? JSON.parse(storedThemes) : []);
    if (storedScores) setProjectScores(JSON.parse(storedScores));
    if (storedWeights) setWeights(JSON.parse(storedWeights));

    // Reset selected project view when switching users
    setSelectedProjectId(null);
  }, [userKey]);

  // Save changes for the current logged-in user email
  useEffect(() => {
    if (!userKey) return;
    localStorage.setItem(`astraq_projects_${userKey}`, JSON.stringify(projects));
    localStorage.setItem(`astraq_plan_items_${userKey}`, JSON.stringify(planItems));
    localStorage.setItem(`astraq_sources_${userKey}`, JSON.stringify(sources));
    localStorage.setItem(`astraq_documents_${userKey}`, JSON.stringify(documents));
    localStorage.setItem(`astraq_keywords_${userKey}`, JSON.stringify(keywords));
    localStorage.setItem(`astraq_themes_${userKey}`, JSON.stringify(themes));
    localStorage.setItem(`astraq_project_scores_${userKey}`, JSON.stringify(projectScores));
    localStorage.setItem(`astraq_weights_${userKey}`, JSON.stringify(weights));
  }, [userKey, projects, planItems, sources, documents, keywords, themes, projectScores, weights]);

  const activeProject = projects.find(p => p.id === selectedProjectId);

  // --- ACTIONS ---

  // Load Seed Healthcare demo
  const handleLoadDemo = () => {
    // Check if demo already exists to prevent duplication
    if (projects.some(p => p.id === HEALTHCARE_PROJECT.id)) {
      setSelectedProjectId(HEALTHCARE_PROJECT.id);
      return;
    }

    const { project, plan, sources: seededSourcesAndDocs } = seedProjectWorkspace(HEALTHCARE_PROJECT, HEALTHCARE_PLAN_ITEMS);
    
    // Unpack sources & documents
    const seededSources = seededSourcesAndDocs.map(sd => sd.source);
    const seededDocs = seededSourcesAndDocs.map(sd => sd.doc);

    // Seed keywords for these docs
    const corpusTokens = seededDocs.map(d => tokenize(d.cleaned_text));
    const idf = computeIDF(corpusTokens);
    
    const seededKeywords: Keyword[] = [];
    seededSources.forEach((src) => {
      const doc = seededDocs.find(d => d.source_id === src.id);
      if (doc) {
        const docTokens = tokenize(doc.cleaned_text);
        const topKws = extractTopKeywords(docTokens, idf, 10);
        topKws.forEach(kw => {
          seededKeywords.push({
            id: 'kw-' + makeId(),
            source_id: src.id,
            keyword: kw.keyword,
            score: kw.score,
            frequency: kw.frequency
          });
        });
      }
    });

    // Seed themes
    const themesData = groupSourcesIntoThemes(seededSources.map(s => ({
      id: s.id,
      title: s.title,
      cleanedText: seededDocs.find(d => d.source_id === s.id)?.cleaned_text || '',
      keywords: seededKeywords.filter(k => k.source_id === s.id).map(k => ({ keyword: k.keyword, score: k.score }))
    })));

    const seededThemes: Theme[] = themesData.map(t => ({
      id: 'theme-' + makeId(),
      project_id: HEALTHCARE_PROJECT.id,
      name: t.name,
      description: t.description,
      source_count: t.sourceIds.length,
      keywords: t.keywords
    }));

    // Pre-calculate realistic opportunity scores
    const scores = {
      marketRelevance: 85,
      problemSeverity: 90,
      productFit: 80,
      competitionLevel: 70, // moderately favorable
      buyerUrgency: 85,
      dataConfidence: 95
    };

    const finalScore = calculateOpportunityScore(scores, weights);

    // Update demo project status
    const demoProject: ResearchProject = {
      ...project,
      status: 'Completed',
      opportunity_score: finalScore,
      recommendation: 'Yes, but validate further'
    };

    setProjects(prev => [demoProject, ...prev]);
    setPlanItems(prev => [...plan, ...prev]);
    setSources(prev => [...seededSources, ...prev]);
    setDocuments(prev => [...seededDocs, ...prev]);
    setKeywords(prev => [...seededKeywords, ...prev]);
    setThemes(prev => [...seededThemes, ...prev]);
    setProjectScores(prev => ({
      ...prev,
      [HEALTHCARE_PROJECT.id]: scores
    }));

    setSelectedProjectId(HEALTHCARE_PROJECT.id);
    setActiveTab('report');
  };

  // Create manual custom project
  const handleCreateProject = (title: string, question: string, description: string, type: ResearchType) => {
    const pId = 'project-' + makeId();
    const newProj: ResearchProject = {
      id: pId,
      title,
      question,
      description,
      research_type: type,
      status: 'Draft',
      opportunity_score: 0,
      recommendation: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setProjects(prev => [newProj, ...prev]);
    
    // Set default zero scores for sliders
    setProjectScores(prev => ({
      ...prev,
      [pId]: {
        marketRelevance: 50,
        problemSeverity: 50,
        productFit: 50,
        competitionLevel: 50,
        buyerUrgency: 50,
        dataConfidence: 50
      }
    }));

    setSelectedProjectId(pId);
    setActiveTab('preferences');
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setActiveTab('preferences');
  };

  // Delete project and clear associated relations
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setPlanItems(prev => prev.filter(item => item.project_id !== projectId));
    
    const sourceIdsToDelete = sources.filter(s => s.project_id === projectId).map(s => s.id);
    setSources(prev => prev.filter(s => s.project_id !== projectId));
    setDocuments(prev => prev.filter(d => !sourceIdsToDelete.includes(d.source_id)));
    setKeywords(prev => prev.filter(k => !sourceIdsToDelete.includes(k.source_id)));
    setThemes(prev => prev.filter(t => t.project_id !== projectId));
    
    const copyScores = { ...projectScores };
    delete copyScores[projectId];
    setProjectScores(copyScores);

    if (selectedProjectId === projectId) {
      setSelectedProjectId(null);
    }
  };

  const handleSaveReportPreference = async (preference: string) => {
    if (!activeProject) return;
    setIsSavingPreference(true);
    try {
      await fetch('/api/research-projects/save-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_type: activeProject.research_type,
          preference: preference
        })
      });
      // Move to Generator view after saving preference
      setActiveTab('generator');
    } catch (err) {
      console.error('Failed to save preference:', err);
    } finally {
      setIsSavingPreference(false);
    }
  };

  const handleGenerateFinalRecommendation = async () => {
    if (!selectedProjectId || !activeProject) return;
    
    setIsGeneratingReport(true);
    setProjects(prev => prev.map(p => 
      p.id === selectedProjectId ? { ...p, status: 'Completed', updated_at: new Date().toISOString() } : p
    ));
    
    try {
      const res = await fetch('/api/research-projects/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          research_type: activeProject.research_type,
          question: activeProject.question
        })
      });
      
      if (res.ok) {
        const reportData = await res.json();
        setGeneratedReport({
          id: 'report-' + makeId(),
          project_id: selectedProjectId,
          title: reportData.title,
          subtitle: reportData.subtitle,
          abstract: reportData.abstract,
          introduction: reportData.introduction,
          market_and_technical_analysis: reportData.market_and_technical_analysis,
          key_findings: reportData.key_findings,
          risk_assessment: reportData.risk_assessment,
          phased_roadmap: reportData.phased_roadmap,
          conclusion: reportData.conclusion,
          references: reportData.references,
          
          // Legacy fallbacks if needed
          executive_summary: reportData.abstract || reportData.executive_summary,
          recommendation: reportData.conclusion || reportData.recommendation,
          reasoning: reportData.market_and_technical_analysis || reportData.reasoning,
          generated_at: new Date().toISOString()
        });
        setActiveTab('report');
      } else {
        alert('Failed to generate report. Check API quota or server logs.');
      }
    } catch (err) {
      console.error('Failed to generate final report:', err);
      alert('Network error while generating report.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // --- AUTH GATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#121212]/20 dark:border-white/20 border-t-[#121212] dark:border-t-white rounded-full animate-spin" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#121212]/40 dark:text-white/40">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] font-sans antialiased text-[#121212] dark:text-[#FAF9F6] flex flex-col selection:bg-[#E2D1C3] dark:selection:bg-[#4A3B32]">
      
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 bg-[#FAF9F6]/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[#121212]/10 dark:border-white/10 z-40 px-12 py-6 flex items-end justify-between print:hidden">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-1">
            Research Manifest
          </span>
          <span className="text-2xl font-serif italic tracking-tighter text-[#121212] dark:text-[#FAF9F6]">
            AstraQ <span className="font-sans text-xs tracking-widest uppercase font-semibold opacity-50 not-italic ml-2">Research Agent</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {selectedProjectId && (
            <button
              onClick={() => setSelectedProjectId(null)}
              className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-[#121212] dark:border-white/30 rounded-full hover:bg-[#121212] hover:text-white dark:hover:bg-white dark:hover:text-[#121212] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Dashboard
            </button>
          )}

          {/* User profile + logout */}
          {user && (
            <div className="flex items-center gap-3 border-l border-[#121212]/10 dark:border-white/10 pl-4">
              <ProfilePictureUpload size={34} />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#121212] dark:text-[#FAF9F6] tracking-wide">
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#121212]/40 dark:text-white/40 hover:text-red-600 dark:hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Area */}
      <main className="flex-1">
        {selectedProjectId && activeProject ? (
          
          /* VIEW 2: ACTIVE WORKSPACE */
          <div className="max-w-7xl mx-auto px-12 py-10 space-y-10">
            
            {/* Workspace Banner */}
            <div className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] bg-[#121212] text-white dark:bg-white dark:text-[#121212] rounded-full">
                    {activeProject.research_type}
                  </span>
                  <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.15em] rounded-full border ${
                    activeProject.status === 'Completed' || activeProject.status === 'Report Ready'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                      : 'bg-[#E2D1C3] text-[#4A3B32] border-[#E2D1C3]/30 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/50'
                  }`}>
                    {activeProject.status}
                  </span>
                </div>
                <h1 className="text-3xl font-serif tracking-tight leading-tight text-[#121212] dark:text-[#FAF9F6]">
                  {activeProject.title}
                </h1>
                <p className="text-xs font-semibold font-mono text-[#121212]/50 dark:text-white/40">
                  Question: "{activeProject.question}"
                </p>
              </div>

              {/* Opportunity Score Gauge */}
              {activeProject.opportunity_score > 0 && (
                <div className="flex items-center gap-6 border-l border-[#121212]/10 dark:border-white/10 pl-8 shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-[#121212]/50 dark:text-white/40 uppercase tracking-[0.2em] block">OPPORTUNITY INDEX</span>
                    <span className="text-4xl font-serif text-[#121212] dark:text-white">
                      {activeProject.opportunity_score}%
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-full border border-[#121212] dark:border-white flex items-center justify-center font-bold text-xs tracking-widest uppercase">
                    {activeProject.opportunity_score >= 70 ? 'GO' : 'WAIT'}
                  </div>
                </div>
              )}
            </div>

            {/* Simplified Stage/Workflow Steps Tabs */}
            <div className="flex flex-wrap bg-white/40 dark:bg-white/[0.01] p-1 rounded-none border border-[#121212]/10 dark:border-white/10 gap-1 mb-8">
              {[
                { key: 'preferences', label: '1. Preferences', icon: FileText },
                { key: 'generator', label: '2. Generate Report', icon: Sparkles },
                { key: 'report', label: '3. Final Report', icon: ShieldCheck }
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-3 rounded-none text-[10px] uppercase tracking-widest font-bold transition flex items-center gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#121212] text-white dark:bg-white dark:text-[#121212]'
                        : 'text-[#121212]/60 hover:text-[#121212] dark:text-[#FAF9F6]/60 dark:hover:text-[#FAF9F6] hover:bg-[#121212]/5 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="space-y-8">
              {activeTab === 'preferences' && (
                <ReportPreferenceView
                  isSaving={isSavingPreference}
                  onSubmit={handleSaveReportPreference}
                  onCancel={() => setSelectedProjectId(null)}
                />
              )}

              {activeTab === 'generator' && (
                <ReportGeneratorView
                  project={activeProject}
                  onGenerate={handleGenerateFinalRecommendation}
                  isGenerating={isGeneratingReport}
                />
              )}

              {activeTab === 'report' && (
                <RecommendationReportView
                  project={activeProject}
                  sources={[]}
                  documents={[]}
                  themes={[]}
                  opportunityScore={projectScores[selectedProjectId] || 0}
                  report={generatedReport}
                />
              )}
            </div>

          </div>
        ) : (
          
          /* VIEW 1: PROJECTS DASHBOARD */
          <Dashboard
            projects={projects}
            onCreateClick={() => setIsCreateModalOpen(true)}
            onOpenProject={(id) => {
              setSelectedProjectId(id);
              setActiveTab('plan');
            }}
            onDeleteProject={handleDeleteProject}
            onLoadDemo={handleLoadDemo}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-150 dark:border-zinc-850 py-6 text-center text-xs text-zinc-400 font-mono print:hidden mt-auto">
        ASTRAQ COGNITIVE SUITE • CRAWLING & PARSING V2.0 • BUILT WITH DEEP RESEARCH SCHEMAS
      </footer>

      {/* CREATE MODAL */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateProject}
      />

    </div>
  );
}
