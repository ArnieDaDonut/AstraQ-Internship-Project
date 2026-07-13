import React, { useState, useEffect } from 'react';
import { 
  Plus, ArrowLeft, BarChart2, CheckCircle2, ChevronRight, FileText, 
  Globe, Layers, ListTodo, Network, RefreshCw, Scale, ShieldCheck, 
  Sparkles, Trash2, LayoutDashboard, Database, HelpCircle, BookOpen 
} from 'lucide-react';

// Type definitions
import { 
  ResearchProject, ResearchPlanItem, ResearchSource, ResearchDocument, 
  Keyword, Theme, OpportunityWeights, ProjectStatus, ResearchType, SourceType 
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
import ProjectPlanView from './components/ProjectPlanView';
import SourceExplorerView from './components/SourceExplorerView';
import AnalysisView from './components/AnalysisView';
import RecommendationReportView from './components/RecommendationReportView';

export default function App() {
  // --- STATE DECLARATIONS ---
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [planItems, setPlanItems] = useState<ResearchPlanItem[]>([]);
  const [sources, setSources] = useState<ResearchSource[]>([]);
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  
  // Selection & UI flow
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'plan' | 'sources' | 'analysis' | 'report'>('plan');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Opportunity Scores slider states mapped per project ID
  const [projectScores, setProjectScores] = useState<Record<string, {
    marketRelevance: number;
    problemSeverity: number;
    productFit: number;
    competitionLevel: number;
    buyerUrgency: number;
    dataConfidence: number;
  }>>({});

  // Model Weights distribution
  const [weights, setWeights] = useState<OpportunityWeights>({
    marketRelevance: 0.25,
    problemSeverity: 0.20,
    productFit: 0.20,
    competitionLevel: 0.15,
    buyerUrgency: 0.10,
    dataConfidence: 0.10
  });

  // --- LOCAL STORAGE SYNC ---
  // Initial load
  useEffect(() => {
    const storedProjects = localStorage.getItem('astraq_projects');
    const storedPlanItems = localStorage.getItem('astraq_plan_items');
    const storedSources = localStorage.getItem('astraq_sources');
    const storedDocuments = localStorage.getItem('astraq_documents');
    const storedKeywords = localStorage.getItem('astraq_keywords');
    const storedThemes = localStorage.getItem('astraq_themes');
    const storedScores = localStorage.getItem('astraq_project_scores');
    const storedWeights = localStorage.getItem('astraq_weights');

    if (storedProjects) setProjects(JSON.parse(storedProjects));
    if (storedPlanItems) setPlanItems(JSON.parse(storedPlanItems));
    if (storedSources) setSources(JSON.parse(storedSources));
    if (storedDocuments) setDocuments(JSON.parse(storedDocuments));
    if (storedKeywords) setKeywords(JSON.parse(storedKeywords));
    if (storedThemes) setThemes(JSON.parse(storedThemes));
    if (storedScores) setProjectScores(JSON.parse(storedScores));
    if (storedWeights) setWeights(JSON.parse(storedWeights));
  }, []);

  // Save changes
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('astraq_projects', JSON.stringify(projects));
      localStorage.setItem('astraq_plan_items', JSON.stringify(planItems));
      localStorage.setItem('astraq_sources', JSON.stringify(sources));
      localStorage.setItem('astraq_documents', JSON.stringify(documents));
      localStorage.setItem('astraq_keywords', JSON.stringify(keywords));
      localStorage.setItem('astraq_themes', JSON.stringify(themes));
      localStorage.setItem('astraq_project_scores', JSON.stringify(projectScores));
      localStorage.setItem('astraq_weights', JSON.stringify(weights));
    }
  }, [projects, planItems, sources, documents, keywords, themes, projectScores, weights]);

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
    setActiveTab('plan');
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

  // Generate research plan categories
  const handleGeneratePlan = () => {
    if (!selectedProjectId || !activeProject) return;

    const generatedCategories = generatePlanForQuestion(selectedProjectId, activeProject.question);
    setPlanItems(prev => [...generatedCategories, ...prev]);

    // Update project status to Planning
    updateProjectStatus(selectedProjectId, 'Planning');
  };

  const handleAddPlanItem = (category: string, description: string) => {
    if (!selectedProjectId) return;
    const newItem: ResearchPlanItem = {
      id: 'plan-' + makeId(),
      project_id: selectedProjectId,
      category,
      description
    };
    setPlanItems(prev => [newItem, ...prev]);
    updateProjectStatus(selectedProjectId, 'Planning');
  };

  const handleUpdatePlanItem = (id: string, category: string, description: string) => {
    setPlanItems(prev => prev.map(item => item.id === id ? { ...item, category, description } : item));
  };

  const handleDeletePlanItem = (id: string) => {
    setPlanItems(prev => prev.filter(item => item.id !== id));
  };

  // Add source URL manually
  const handleAddSource = (title: string, url: string, type: SourceType, notes?: string) => {
    if (!selectedProjectId) return;

    const sourceId = 'src-' + makeId();
    const credibility = scoreCredibility(url, type);

    const newSource: ResearchSource = {
      id: sourceId,
      project_id: selectedProjectId,
      url,
      title,
      domain: new URL(url.startsWith('http') ? url : 'https://' + url).hostname,
      source_type: type,
      credibility_score: credibility,
      relevance_score: 0,
      status: 'Pending'
    };

    setSources(prev => [newSource, ...prev]);
    updateProjectStatus(selectedProjectId, 'Sources Added');
  };

  // Discover matching sources automatically based on question
  const handleDiscoverSources = () => {
    if (!selectedProjectId || !activeProject) return;

    const discoveries = generateDiscoveriesForQuestion(activeProject.question);
    
    const newSources: ResearchSource[] = discoveries.map(raw => {
      const sId = 'src-' + makeId();
      return {
        id: sId,
        project_id: selectedProjectId,
        url: raw.url,
        title: raw.title,
        domain: new URL(raw.url).hostname,
        source_type: raw.source_type,
        credibility_score: scoreCredibility(raw.url, raw.source_type),
        relevance_score: 0,
        status: 'Pending'
      };
    });

    // Populate temporary raw documents, which will be crawled during analysis
    const newDocs: ResearchDocument[] = discoveries.map((raw, idx) => {
      const sId = newSources[idx].id;
      return {
        id: 'doc-' + makeId(),
        source_id: sId,
        raw_text: raw.raw_text,
        cleaned_text: cleanText(raw.raw_text),
        word_count: raw.raw_text.split(/\s+/).length,
        extracted_at: new Date().toISOString()
      };
    });

    setSources(prev => [...newSources, ...prev]);
    setDocuments(prev => [...newDocs, ...prev]);
    updateProjectStatus(selectedProjectId, 'Sources Added');
  };

  // Re-run single extraction
  const handleReRunExtraction = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, status: 'Pending' } : s));
  };

  // Remove source
  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
    setDocuments(prev => prev.filter(d => d.source_id !== id));
    setKeywords(prev => prev.filter(k => k.source_id !== id));
  };

  // Run full crawling, text extraction, tokenization, and vector space analysis
  const handleAnalyzeSources = () => {
    if (!selectedProjectId || !activeProject) return;

    setIsAnalyzing(true);
    updateProjectStatus(selectedProjectId, 'Analysis In Progress');

    // Simulate 2-second processing time for full analytical depth
    setTimeout(() => {
      const projectSources = sources.filter(s => s.project_id === selectedProjectId);
      const projectDocs = documents.filter(d => projectSources.some(s => s.id === d.source_id));

      if (projectSources.length === 0) {
        setIsAnalyzing(false);
        updateProjectStatus(selectedProjectId, 'Planning');
        return;
      }

      // 1. Term tokenization
      const allDocsTokens = projectDocs.map(d => tokenize(d.cleaned_text));
      
      // 2. Compute IDF across corpus
      const idf = computeIDF(allDocsTokens);

      // 3. Compute relevance score and extract keywords for each source
      const updatedSources = sources.map(s => {
        if (s.project_id !== selectedProjectId) return s;
        
        const doc = projectDocs.find(d => d.source_id === s.id);
        if (!doc) return s;

        // Compute Cosine similarity relevance
        const relevance = computeRelevanceScore(activeProject.question, doc.cleaned_text, idf);

        return {
          ...s,
          relevance_score: relevance,
          status: 'Extracted' as const
        };
      });

      // 4. Extract and save top keywords
      const newKeywords: Keyword[] = [];
      projectSources.forEach(s => {
        const doc = projectDocs.find(d => d.source_id === s.id);
        if (doc) {
          const docTokens = tokenize(doc.cleaned_text);
          const topKws = extractTopKeywords(docTokens, idf, 10);
          topKws.forEach(kw => {
            newKeywords.push({
              id: 'kw-' + makeId(),
              source_id: s.id,
              keyword: kw.keyword,
              score: kw.score,
              frequency: kw.frequency
            });
          });
        }
      });

      // 5. Group sources into themes based on keyword overlaps
      const sourcesForThemes = updatedSources
        .filter(s => s.project_id === selectedProjectId)
        .map(s => ({
          id: s.id,
          title: s.title,
          cleanedText: projectDocs.find(d => d.source_id === s.id)?.cleaned_text || '',
          keywords: newKeywords.filter(k => k.source_id === s.id).map(k => ({ keyword: k.keyword, score: k.score }))
        }));

      const clusteredThemes = groupSourcesIntoThemes(sourcesForThemes);
      const newThemes: Theme[] = clusteredThemes.map(t => ({
        id: 'theme-' + makeId(),
        project_id: selectedProjectId,
        name: t.name,
        description: t.description,
        source_count: t.sourceIds.length,
        keywords: t.keywords
      }));

      // 6. Compute automatic opportunity sliders baseline
      const avgRelevance = Math.round(
        sourcesForThemes.reduce((sum, s) => sum + (updatedSources.find(us => us.id === s.id)?.relevance_score || 0), 0) / sourcesForThemes.length
      );
      const avgCredibility = Math.round(
        updatedSources.filter(s => s.project_id === selectedProjectId).reduce((sum, s) => sum + s.credibility_score, 0) / sourcesForThemes.length
      );

      const calculatedScores = {
        marketRelevance: Math.min(95, Math.max(30, avgRelevance + 5)),
        problemSeverity: 80, // healthy default severity
        productFit: 75,      // healthy default product-market compatibility
        competitionLevel: 65, // moderate competitive favorability
        buyerUrgency: 70,    // high baseline urgency
        dataConfidence: avgCredibility
      };

      const finalOpportunityScore = calculateOpportunityScore(calculatedScores, weights);

      // Save everything
      setSources(updatedSources);
      setKeywords(prev => [...newKeywords, ...prev.filter(k => !projectSources.some(s => s.id === k.source_id))]);
      setThemes(prev => [...newThemes, ...prev.filter(t => t.project_id !== selectedProjectId)]);
      setProjectScores(prev => ({
        ...prev,
        [selectedProjectId]: calculatedScores
      }));

      // Update project final recommendation & score
      setProjects(prev => prev.map(p => {
        if (p.id === selectedProjectId) {
          return {
            ...p,
            status: 'Report Ready',
            opportunity_score: finalOpportunityScore,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      }));

      setIsAnalyzing(false);
      setActiveTab('analysis'); // navigate to visual dashboard
    }, 2000);
  };

  // Update Weights and recalculate overall score
  const handleUpdateWeights = (newWeights: OpportunityWeights) => {
    setWeights(newWeights);
    
    if (selectedProjectId && projectScores[selectedProjectId]) {
      const finalScore = calculateOpportunityScore(projectScores[selectedProjectId], newWeights);
      setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, opportunity_score: finalScore } : p));
    }
  };

  // Update Scores from sliders and recalculate overall score
  const handleUpdateOpportunityScores = (scores: typeof projectScores[string]) => {
    if (!selectedProjectId) return;
    
    setProjectScores(prev => ({
      ...prev,
      [selectedProjectId]: scores
    }));

    const finalScore = calculateOpportunityScore(scores, weights);
    setProjects(prev => prev.map(p => p.id === selectedProjectId ? { ...p, opportunity_score: finalScore } : p));
  };

  // Helper to change status
  const updateProjectStatus = (projectId: string, status: ProjectStatus) => {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status, updated_at: new Date().toISOString() } : p));
  };

  // Filter local lists relative to active project workspace
  const currentPlan = planItems.filter(item => item.project_id === selectedProjectId);
  const currentSources = sources.filter(s => s.project_id === selectedProjectId);
  const currentThemes = themes.filter(t => t.project_id === selectedProjectId);
  const currentScores = selectedProjectId ? projectScores[selectedProjectId] || {
    marketRelevance: 50,
    problemSeverity: 50,
    productFit: 50,
    competitionLevel: 50,
    buyerUrgency: 50,
    dataConfidence: 50
  } : {
    marketRelevance: 50,
    problemSeverity: 50,
    productFit: 50,
    competitionLevel: 50,
    buyerUrgency: 50,
    dataConfidence: 50
  };

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

        {selectedProjectId && (
          <button
            onClick={() => setSelectedProjectId(null)}
            className="text-[10px] uppercase tracking-widest font-bold px-4 py-2 border border-[#121212] dark:border-white/30 rounded-full hover:bg-[#121212] hover:text-white dark:hover:bg-white dark:hover:text-[#121212] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Dashboard
          </button>
        )}
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

            {/* Stage/Workflow Steps Tabs */}
            <div className="flex flex-wrap bg-white/40 dark:bg-white/[0.01] p-1 rounded-none border border-[#121212]/10 dark:border-white/10 gap-1">
              {[
                { key: 'plan', label: '1. Research Plan', icon: ListTodo },
                { key: 'sources', label: '2. Crawler & Sources', icon: Globe },
                { key: 'analysis', label: '3. TF-IDF & Clustered Themes', icon: BarChart2 },
                { key: 'report', label: '4. Recommendation Report', icon: ShieldCheck }
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
              {activeTab === 'plan' && (
                <ProjectPlanView
                  project={activeProject}
                  plan={currentPlan}
                  onGeneratePlan={handleGeneratePlan}
                  onAddPlanItem={handleAddPlanItem}
                  onUpdatePlanItem={handleUpdatePlanItem}
                  onDeletePlanItem={handleDeletePlanItem}
                />
              )}

              {activeTab === 'sources' && (
                <SourceExplorerView
                  project={activeProject}
                  sources={currentSources}
                  documents={documents}
                  onAddSource={handleAddSource}
                  onDiscoverSources={handleDiscoverSources}
                  onAnalyzeSources={handleAnalyzeSources}
                  onRemoveSource={handleRemoveSource}
                  onReRunExtraction={handleReRunExtraction}
                  isAnalyzing={isAnalyzing}
                />
              )}

              {activeTab === 'analysis' && (
                <AnalysisView
                  project={activeProject}
                  sources={currentSources}
                  documents={documents}
                  keywords={keywords}
                  themes={currentThemes}
                  weights={weights}
                  onUpdateWeights={handleUpdateWeights}
                  opportunityScores={currentScores}
                  onUpdateOpportunityScores={handleUpdateOpportunityScores}
                />
              )}

              {activeTab === 'report' && (
                <RecommendationReportView
                  project={activeProject}
                  sources={currentSources}
                  documents={documents}
                  themes={currentThemes}
                  opportunityScore={activeProject.opportunity_score}
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
