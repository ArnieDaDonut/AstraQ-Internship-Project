export type ProjectStatus = 'Draft' | 'Planning' | 'Sources Added' | 'Analysis In Progress' | 'Report Ready' | 'Completed';

export type ResearchType = 'Market Research' | 'Competitive Analysis' | 'Startup Validation' | 'Technology Trend' | 'Custom';

export interface ResearchProject {
  id: string;
  title: string;
  question: string;
  description: string;
  research_type: ResearchType;
  status: ProjectStatus;
  opportunity_score: number;
  recommendation: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchPlanItem {
  id: string;
  project_id: string;
  category: string;
  description: string;
}

export type SourceType = 'Article' | 'Company Website' | 'Blog' | 'Research Report' | 'Government Website' | 'University Source' | 'Competitor Website' | 'Forum/Social Media';

export type SourceStatus = 'Pending' | 'Extracted' | 'Failed';

export interface ResearchSource {
  id: string;
  project_id: string;
  url: string;
  title: string;
  domain: string;
  source_type: SourceType;
  credibility_score: number;
  relevance_score: number;
  status: SourceStatus;
  failure_reason?: string;
}

export interface ResearchDocument {
  id: string;
  source_id: string;
  raw_text: string;
  cleaned_text: string;
  word_count: number;
  extracted_at: string;
}

export interface Keyword {
  id: string;
  source_id: string;
  keyword: string;
  score: number; // TF-IDF score
  frequency: number;
}

export interface Theme {
  id: string;
  project_id: string;
  name: string;
  description: string;
  source_count: number;
  keywords: string[];
}

export interface Finding {
  id: string;
  project_id: string;
  theme_id: string;
  finding_text: string;
  supporting_source_count: number;
  confidence_score: number;
}

export interface ResearchReport {
  id: string;
  project_id: string;
  executive_summary: string;
  recommendation: string; // 'Strong Yes' | 'Yes, but validate further' | 'Maybe' | 'Not recommended' | 'Insufficient opportunity'
  reasoning: string;
  risks: string[];
  open_questions: string[];
  generated_at: string;
}

// Factor weights for Opportunity Scoring
export interface OpportunityWeights {
  marketRelevance: number; // 25%
  problemSeverity: number; // 20%
  productFit: number;      // 20%
  competitionLevel: number;// 15%
  buyerUrgency: number;    // 10%
  dataConfidence: number;  // 10%
}
