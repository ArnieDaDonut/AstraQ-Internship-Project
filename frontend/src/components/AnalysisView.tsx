import React, { useState } from 'react';
import { 
  Network, Settings, BarChart2, Info, ArrowUpRight, Scale, Sparkles, 
  Table, ChevronDown, CheckSquare, Plus, Trash2, HelpCircle 
} from 'lucide-react';
import { ResearchProject, ResearchSource, ResearchDocument, Keyword, Theme, OpportunityWeights } from '../types';
import { tokenize, computeTF, STOP_WORDS } from '../utils/algorithms';

interface AnalysisViewProps {
  project: ResearchProject;
  sources: ResearchSource[];
  documents: ResearchDocument[];
  keywords: Keyword[];
  themes: Theme[];
  weights: OpportunityWeights;
  onUpdateWeights: (newWeights: OpportunityWeights) => void;
  // Slider scores
  opportunityScores: {
    marketRelevance: number;
    problemSeverity: number;
    productFit: number;
    competitionLevel: number;
    buyerUrgency: number;
    dataConfidence: number;
  };
  onUpdateOpportunityScores: (scores: {
    marketRelevance: number;
    problemSeverity: number;
    productFit: number;
    competitionLevel: number;
    buyerUrgency: number;
    dataConfidence: number;
  }) => void;
  onGenerateRecommendation?: () => void;
  isGeneratingReport?: boolean;
}

export default function AnalysisView({
  project, sources, documents, keywords, themes, weights, onUpdateWeights, opportunityScores, onUpdateOpportunityScores, onGenerateRecommendation, isGeneratingReport
}: AnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<'tfidf' | 'themes' | 'opportunity'>('tfidf');

  // Find all extracted sources
  const extractedSources = sources.filter(s => s.status === 'Extracted');

  // Sliders handler
  const handleScoreChange = (factor: keyof typeof opportunityScores, val: number) => {
    onUpdateOpportunityScores({
      ...opportunityScores,
      [factor]: val
    });
  };

  // Weight adjustments handler (ensure sum = 100%)
  const handleWeightChange = (factor: keyof OpportunityWeights, val: number) => {
    // Basic implementation: let user adjust weights (and normalize or show warning if sum != 100%)
    const newVal = val / 100;
    onUpdateWeights({
      ...weights,
      [factor]: newVal
    });
  };

  const weightsSum = Math.round((
    weights.marketRelevance + 
    weights.problemSeverity + 
    weights.productFit + 
    weights.competitionLevel + 
    weights.buyerUrgency + 
    weights.dataConfidence
  ) * 100);

  return (
    <div className="space-y-8">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-[#121212]/10 dark:border-white/10">
        <button
          onClick={() => setActiveTab('tfidf')}
          className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tfidf'
              ? 'border-[#121212] text-[#121212] dark:border-white dark:text-white'
              : 'border-transparent text-[#121212]/40 hover:text-[#121212] dark:text-white/40 dark:hover:text-white'
          }`}
        >
          <Table className="w-3.5 h-3.5" />
          TF-IDF & Cosine Vectors
        </button>
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'themes'
              ? 'border-[#121212] text-[#121212] dark:border-white dark:text-white'
              : 'border-transparent text-[#121212]/40 hover:text-[#121212] dark:text-white/40 dark:hover:text-white'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          Theme Grouping
        </button>
        <button
          onClick={() => setActiveTab('opportunity')}
          className={`px-6 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'opportunity'
              ? 'border-[#121212] text-[#121212] dark:border-white dark:text-white'
              : 'border-transparent text-[#121212]/40 hover:text-[#121212] dark:text-white/40 dark:hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          Opportunity Scoring Model
        </button>
      </div>

      {/* TF-IDF & Cosine Math Tab */}
      {activeTab === 'tfidf' && (
        <div className="space-y-8">
          
          {/* Explanation banner */}
          <div className="p-6 bg-white/40 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 rounded-none flex items-start gap-4">
            <Info className="w-5 h-5 text-[#121212]/40 dark:text-white/40 shrink-0 mt-0.5" />
            <div className="space-y-2.5 text-xs text-[#121212]/70 dark:text-[#FAF9F6]/70 leading-relaxed font-light">
              <p className="font-serif italic text-base text-[#121212] dark:text-[#FAF9F6]">Arnav's Learning Corner: Term Frequency - Inverse Document Frequency</p>
              <p>
                <strong className="font-semibold text-[#121212] dark:text-white">Term Frequency (TF)</strong> measures how frequently a term occurs in a specific article, normalized by the total tokens in that article.
                <strong className="font-semibold text-[#121212] dark:text-white"> Inverse Document Frequency (IDF)</strong> measures how rare or unique that term is across your entire corpus of sources.
                By multiplying them, we assign high scores to words that are descriptive of a specific document, while discounting universal stop words.
              </p>
              <p>
                The <strong className="font-semibold text-[#121212] dark:text-white">Cosine Similarity Match</strong> calculates the angle between the multi-dimensional TF-IDF vector representing your <strong className="font-semibold text-[#121212] dark:text-white">Research Question</strong> and each source document vector. A higher similarity score (closer to 100%) indicates a strong semantic relevance overlap.
              </p>
            </div>
          </div>

          {extractedSources.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 space-y-4">
              <BarChart2 className="w-12 h-12 text-[#121212]/20 mx-auto" />
              <h3 className="text-lg font-serif italic text-[#121212] dark:text-[#FAF9F6]">No analytical data calculated yet</h3>
              <p className="text-xs text-[#121212]/50 dark:text-white/40 max-w-sm mx-auto leading-relaxed">
                Navigate to the <strong className="font-semibold">Sources</strong> tab first, and click <strong className="font-semibold">"Crawl & Analyze Sources"</strong> to run our TF-IDF scoring engine on extracted body text!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Top Keywords list */}
              <div className="lg:col-span-6 bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none space-y-6">
                <h3 className="font-serif text-xl italic text-[#121212] dark:text-[#FAF9F6]">
                  Top Extracted Keywords (Per Document)
                </h3>
                
                <div className="space-y-6 overflow-y-auto max-h-[500px] pr-2">
                  {extractedSources.map(src => {
                    const srcKeywords = keywords.filter(k => k.source_id === src.id);
                    return (
                      <div key={src.id} className="space-y-3 border-b border-[#121212]/10 dark:border-white/10 pb-5 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs font-bold text-[#121212] dark:text-white uppercase tracking-wider truncate max-w-[280px]">
                            {src.title}
                          </p>
                          <span className="text-[10px] font-mono bg-[#121212]/5 dark:bg-white/10 text-[#121212] dark:text-white px-2 py-0.5 rounded-none border border-[#121212]/5">
                            Sim: {src.relevance_score}%
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {srcKeywords.length > 0 ? (
                            srcKeywords.map((k) => (
                              <div 
                                key={k.id}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 rounded-none text-xs"
                                title={`TF-IDF Score: ${k.score.toFixed(4)} | Frequency: ${k.frequency}`}
                              >
                                <span className="text-xs font-light text-[#121212]/80 dark:text-[#FAF9F6]/80">
                                  {k.keyword}
                                </span>
                                <span className="text-[9px] font-mono font-bold text-[#121212] dark:text-white">
                                  {k.frequency}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-[#121212]/40 italic">No keywords extracted yet.</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Vector space & Cosine Similarity Explanation */}
              <div className="lg:col-span-6 bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none space-y-6">
                <h3 className="font-serif text-xl italic text-[#121212] dark:text-[#FAF9F6]">
                  Vector Dot-Product Math
                </h3>
                
                <div className="space-y-6">
                  {/* Research Question Vector Representation */}
                  <div className="p-5 bg-white/40 dark:bg-[#121212] border border-[#121212]/10 dark:border-white/10 rounded-none space-y-3">
                    <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] block">Question Vector (V_q)</p>
                    <p className="text-xs text-[#121212]/70 dark:text-white/70">
                      Query: <span className="font-mono italic text-[#121212] dark:text-white font-semibold">"{project.question}"</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tokenize(project.question).map((tok, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-[#121212]/5 text-[#121212] dark:bg-white/15 dark:text-white text-[10px] font-mono rounded-none">
                          {tok}: 1.0 (Unit TF)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Documents Cosine Ranks */}
                  <div className="space-y-3.5">
                    <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-[0.15em] block">Cosine Alignment Ranks</p>
                    
                    <div className="space-y-3">
                      {extractedSources.map(src => (
                        <div key={src.id} className="p-4 border border-[#121212]/10 dark:border-white/10 rounded-none flex items-center justify-between gap-4 bg-white/30 dark:bg-transparent">
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="text-xs font-serif italic text-[#121212] dark:text-white truncate">
                              {src.title}
                            </p>
                            <p className="text-[10px] font-mono text-[#121212]/40 dark:text-white/40">
                              cos(θ) = V_q • V_doc / (||V_q|| * ||V_doc||)
                            </p>
                          </div>
                          
                          <div className="text-right shrink-0">
                            <p className="text-base font-bold text-[#121212] dark:text-white font-mono">
                              {src.relevance_score}%
                            </p>
                            <span className="text-[9px] text-[#121212]/40 dark:text-white/40 uppercase tracking-wider font-semibold block">Similarity</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Themes Clustering Tab */}
      {activeTab === 'themes' && (
        <div className="space-y-8">
          <div className="p-6 bg-white/40 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 rounded-none flex items-start gap-4">
            <Network className="w-5 h-5 text-[#121212]/40 dark:text-white/40 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs text-[#121212]/70 dark:text-[#FAF9F6]/70 leading-relaxed font-light">
              <p className="font-serif italic text-base text-[#121212] dark:text-[#FAF9F6]">A5: Automatic Theme Clustering & Grouping</p>
              <p>
                Our theme generator uses <strong className="font-semibold">keyword overlap clustering</strong>. It isolates high-scoring TF-IDF words, counts their occurrences across all sources, and forms coherent thematic clusters. Sources sharing several top keywords are grouped together automatically.
              </p>
            </div>
          </div>

          {themes.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-white/[0.01] rounded-none border border-[#121212]/10 dark:border-white/10 space-y-4">
              <Network className="w-12 h-12 text-[#121212]/20 mx-auto" />
              <h3 className="text-lg font-serif italic text-[#121212] dark:text-[#FAF9F6]">No themes clustered yet</h3>
              <p className="text-xs text-[#121212]/50 dark:text-white/40 max-w-sm mx-auto leading-relaxed">
                Themes are generated during source analysis. Crawl and analyze some sources first to see theme clustering in action.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {themes.map((theme) => {
                return (
                  <div
                    key={theme.id}
                    className="bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 rounded-none p-6 flex flex-col justify-between hover:border-[#121212]/30 dark:hover:border-white/30 transition-all gap-5"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2 border-b border-[#121212]/10 dark:border-white/10 pb-3">
                        <h4 className="font-serif italic text-base text-[#121212] dark:text-[#FAF9F6]">
                          {theme.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#121212]/5 text-[#121212]/70 dark:bg-white/10 dark:text-white/70 rounded-none">
                          {theme.source_count} {theme.source_count === 1 ? 'source' : 'sources'}
                        </span>
                      </div>

                      <p className="text-xs text-[#121212]/70 dark:text-white/70 leading-relaxed font-light">
                        {theme.description}
                      </p>

                      <div className="space-y-1.5">
                        <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-widest">Cluster Keywords</p>
                        <div className="flex flex-wrap gap-1">
                          {theme.keywords.map((kw, i) => (
                            <span key={i} className="text-[10px] font-mono bg-[#121212]/5 border border-transparent text-[#121212]/70 dark:bg-white/10 dark:text-white/70 px-1.5 py-0.5 rounded-none">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sources in Theme */}
                    <div className="space-y-2 pt-3 border-t border-[#121212]/10 dark:border-white/10">
                      <p className="text-[9px] font-bold text-[#121212]/40 dark:text-white/40 uppercase tracking-widest">Grouped Documents</p>
                      <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                        {sources.filter(s => {
                          return theme.keywords.some(k => s.title.toLowerCase().includes(k.toLowerCase()) || (documents.find(d => d.source_id === s.id)?.cleaned_text.includes(k)));
                        }).slice(0, 3).map(s => (
                          <p key={s.id} className="text-xs font-serif italic text-[#121212]/70 dark:text-white/60 truncate" title={s.title}>
                            • {s.title}
                          </p>
                        ))}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Opportunity Scorer Tab */}
      {activeTab === 'opportunity' && (
        <div className="space-y-8">
          
          {/* Explanation */}
          <div className="p-6 bg-white/40 dark:bg-white/[0.01] border border-[#121212]/10 dark:border-white/10 rounded-none flex items-start gap-4">
            <Scale className="w-5 h-5 text-[#121212]/40 dark:text-white/40 shrink-0 mt-0.5" />
            <div className="space-y-2 text-xs text-[#121212]/70 dark:text-[#FAF9F6]/70 leading-relaxed font-light">
              <p className="font-serif italic text-base text-[#121212] dark:text-[#FAF9F6]">A6: Opportunity Ranking Scoring Weights</p>
              <p>
                Adjust the sliders below to score each business evaluation vector (0 to 100) based on your market discoveries. You can also adjust the <strong className="font-semibold">weight distribution percentage</strong> for each factor. Fulfills <strong className="font-semibold">FR-013</strong> and <strong className="font-semibold">Epic 7</strong>!
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Factor Sliders */}
            <div className="lg:col-span-7 bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none space-y-6">
              <h3 className="font-serif text-xl italic text-[#121212] dark:text-[#FAF9F6]">
                Business Evaluation Sliders
              </h3>

              <div className="space-y-6">
                {/* 1. Market Relevance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif italic text-sm text-[#121212] dark:text-white">1. Market Relevance (Weight: {Math.round(weights.marketRelevance * 100)}%)</span>
                    <span className="font-mono font-bold text-[#121212] dark:text-white">{opportunityScores.marketRelevance}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opportunityScores.marketRelevance}
                    onChange={(e) => handleScoreChange('marketRelevance', parseInt(e.target.value))}
                    className="w-full h-[2px] bg-[#121212]/10 dark:bg-white/10 appearance-none cursor-pointer accent-[#121212] dark:accent-white"
                  />
                  <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light">How large and expand-ready is the addressable market segment?</p>
                </div>

                {/* 2. Problem Severity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif italic text-sm text-[#121212] dark:text-white">2. Problem Severity (Weight: {Math.round(weights.problemSeverity * 100)}%)</span>
                    <span className="font-mono font-bold text-[#121212] dark:text-white">{opportunityScores.problemSeverity}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opportunityScores.problemSeverity}
                    onChange={(e) => handleScoreChange('problemSeverity', parseInt(e.target.value))}
                    className="w-full h-[2px] bg-[#121212]/10 dark:bg-white/10 appearance-none cursor-pointer accent-[#121212] dark:accent-white"
                  />
                  <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light">Are the clinical or administrative bottlenecks severe enough to warrant purchase?</p>
                </div>

                {/* 3. Product Fit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif italic text-sm text-[#121212] dark:text-white">3. AstraQ Product Fit (Weight: {Math.round(weights.productFit * 100)}%)</span>
                    <span className="font-mono font-bold text-[#121212] dark:text-white">{opportunityScores.productFit}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opportunityScores.productFit}
                    onChange={(e) => handleScoreChange('productFit', parseInt(e.target.value))}
                    className="w-full h-[2px] bg-[#121212]/10 dark:bg-white/10 appearance-none cursor-pointer accent-[#121212] dark:accent-white"
                  />
                  <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light">Can our automation test engines natively solve these layout challenges?</p>
                </div>

                {/* 4. Competition Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif italic text-sm text-[#121212] dark:text-white">4. Competitive Favorability (Weight: {Math.round(weights.competitionLevel * 100)}%)</span>
                    <span className="font-mono font-bold text-[#121212] dark:text-white">{opportunityScores.competitionLevel}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opportunityScores.competitionLevel}
                    onChange={(e) => handleScoreChange('competitionLevel', parseInt(e.target.value))}
                    className="w-full h-[2px] bg-[#121212]/10 dark:bg-white/10 appearance-none cursor-pointer accent-[#121212] dark:accent-white"
                  />
                  <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light">How weak or generic is current clinical software QA competition? (100 = Highly Favorable/No competition)</p>
                </div>

                {/* 5. Buyer Urgency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif italic text-sm text-[#121212] dark:text-white">5. Buyer Urgency (Weight: {Math.round(weights.buyerUrgency * 100)}%)</span>
                    <span className="font-mono font-bold text-[#121212] dark:text-white">{opportunityScores.buyerUrgency}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opportunityScores.buyerUrgency}
                    onChange={(e) => handleScoreChange('buyerUrgency', parseInt(e.target.value))}
                    className="w-full h-[2px] bg-[#121212]/10 dark:bg-white/10 appearance-none cursor-pointer accent-[#121212] dark:accent-white"
                  />
                  <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light">Are companies under release bottlenecks or compliance threats right now?</p>
                </div>

                {/* 6. Data Confidence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-serif italic text-sm text-[#121212] dark:text-white">6. Data Confidence (Weight: {Math.round(weights.dataConfidence * 100)}%)</span>
                    <span className="font-mono font-bold text-[#121212] dark:text-white">{opportunityScores.dataConfidence}/100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={opportunityScores.dataConfidence}
                    onChange={(e) => handleScoreChange('dataConfidence', parseInt(e.target.value))}
                    className="w-full h-[2px] bg-[#121212]/10 dark:bg-white/10 appearance-none cursor-pointer accent-[#121212] dark:accent-white"
                  />
                  <p className="text-[10px] text-[#121212]/40 dark:text-white/40 font-light">Do we have highly credible sources (.gov/.edu) supporting our evidence?</p>
                </div>

              </div>
            </div>

            {/* Model Weights Editor */}
            <div className="lg:col-span-5 bg-white/50 dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-8 rounded-none space-y-6">
              <div>
                <h3 className="font-serif text-xl italic text-[#121212] dark:text-[#FAF9F6]">
                  Weight Distribution %
                </h3>
                <p className="text-xs text-[#121212]/50 dark:text-white/40 mt-1.5 font-light leading-relaxed">Adjust how much priority each category gets. Weights should sum to <strong className="font-semibold text-[#121212] dark:text-white">100%</strong>.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'marketRelevance', label: 'Market Relevance' },
                  { key: 'problemSeverity', label: 'Problem Severity' },
                  { key: 'productFit', label: 'Product Fit' },
                  { key: 'competitionLevel', label: 'Competition level' },
                  { key: 'buyerUrgency', label: 'Buyer Urgency' },
                  { key: 'dataConfidence', label: 'Data Confidence' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 text-xs border-b border-[#121212]/5 dark:border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <span className="text-[#121212]/70 dark:text-white/70 font-light">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(weights[item.key as keyof OpportunityWeights] * 100)}
                        onChange={(e) => handleWeightChange(item.key as keyof OpportunityWeights, parseInt(e.target.value) || 0)}
                        className="w-14 px-2.5 py-1 border border-[#121212]/10 dark:border-white/10 rounded-none font-mono text-center text-xs bg-white/55 focus:outline-none focus:ring-1 focus:ring-[#121212] dark:focus:ring-white"
                      />
                      <span className="text-[#121212]/40 dark:text-white/40">%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Weight total warning */}
              <div className={`p-4 rounded-none text-xs flex items-center gap-2 border ${
                weightsSum === 100 
                  ? 'bg-emerald-50/50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                  : 'bg-rose-50/50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
              }`}>
                <Info className="w-4 h-4 shrink-0" />
                <span className="font-light">Current Weight Sum: <strong className="font-semibold">{weightsSum}%</strong> {weightsSum === 100 ? '(Perfect)' : '(Weights must sum to 100%)'}</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
