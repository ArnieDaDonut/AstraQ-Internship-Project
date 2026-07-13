/**
 * @file algorithms.ts
 * @description Custom-built research algorithms for the AstraQ Research Agent:
 * - URL Deduplication (A1)
 * - TF-IDF Vector Space Model (A2)
 * - Cosine Similarity Relevance Matcher (A3)
 * - Domain Credibility Scorer (A4)
 * - Text Cleaner (FR-007)
 * - Keyword Extractor (FR-008)
 * - Theme Clustering & Grouping (A5)
 * - Weighted Opportunity Scorer (A6)
 */

import { SourceType, OpportunityWeights } from '../types';

// Standard English stop words
export const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could', 
  'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 
  'have', 'having', 'he', 'her', 'here', 'hers', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 
  'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of', 
  'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 
  'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 
  'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 
  'would', 'you', 'your', 'yours', 'yourself', 'yourselves', 'will', 'shall', 'should', 'can', 'may',
  'us', 'also', 'its', 'has', 'have', 'had', 'done', 'get', 'got', 'make', 'made', 'take', 'took', 'using'
]);

/**
 * A1: URL Deduplication
 * Normalizes a URL to prevent analyzing the same source multiple times.
 */
export function normalizeUrl(url: string): string {
  try {
    let clean = url.trim().toLowerCase();
    
    // Ensure URL has protocol to parse correctly
    if (!/^https?:\/\//i.test(clean)) {
      clean = 'http://' + clean;
    }
    
    const parsed = new URL(clean);
    
    // Remove port, standard tracking parameters, and hash
    let hostname = parsed.hostname;
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }
    
    let pathname = parsed.pathname;
    // Remove trailing slash
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.substring(0, pathname.length - 1);
    }
    
    // Retain only important query parameters if any (remove utm_* and other common tracking)
    const filteredParams = new URLSearchParams();
    parsed.searchParams.forEach((value, key) => {
      if (!key.startsWith('utm_') && !['ref', 'fbclid', 'gclid', 's'].includes(key)) {
        filteredParams.append(key, value);
      }
    });
    
    const searchString = filteredParams.toString();
    const cleanUrl = hostname + pathname + (searchString ? '?' + searchString : '');
    return cleanUrl;
  } catch (e) {
    // Fallback if parsing fails
    return url.trim().toLowerCase().replace(/https?:\/\//, '').replace(/\/$/, '');
  }
}

/**
 * Checks if a list already contains a normalized URL
 */
export function isDuplicateUrl(existingUrls: string[], newUrl: string): boolean {
  const normNew = normalizeUrl(newUrl);
  return existingUrls.some(u => normalizeUrl(u) === normNew);
}

/**
 * FR-007: Clean Extracted Text
 * Prepares raw web body text for keyword/TF-IDF analysis.
 */
export function cleanText(rawText: string): string {
  if (!rawText) return '';
  
  let text = rawText;
  
  // 1. Remove HTML tags if present (just in case)
  text = text.replace(/<[^>]*>/g, ' ');
  
  // 2. Convert to lowercase
  text = text.toLowerCase();
  
  // 3. Replace common contractions and punctuation with space
  text = text.replace(/['’]s/g, ''); // e.g., consumer's -> consumer
  text = text.replace(/[^a-z0-9\s-]/g, ' ');
  
  // 4. Remove extra whitespace and convert duplicate lines to single space
  text = text.replace(/\s+/g, ' ');
  
  return text.trim();
}

/**
 * Tokenize cleaned text into lowercase word tokens, filtering out stop words.
 */
export function tokenize(cleanedText: string): string[] {
  return cleanedText
    .split(/\s+/)
    .filter(token => token.length > 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token));
}

/**
 * FR-008: Keyword Extraction & A2: TF-IDF Engine
 * Computes Term Frequency (TF) for a single document
 */
export function computeTF(tokens: string[]): Map<string, number> {
  const termCounts = new Map<string, number>();
  tokens.forEach(token => {
    termCounts.set(token, (termCounts.get(token) || 0) + 1);
  });
  
  const tf = new Map<string, number>();
  const totalTokens = tokens.length;
  if (totalTokens === 0) return tf;
  
  termCounts.forEach((count, term) => {
    // Normalization: Count / Total Words in Document
    tf.set(term, count / totalTokens);
  });
  
  return tf;
}

/**
 * A2: TF-IDF Engine
 * Computes Inverse Document Frequency (IDF) across a corpus of documents
 */
export function computeIDF(allDocumentsTokens: string[][]): Map<string, number> {
  const idf = new Map<string, number>();
  const N = allDocumentsTokens.length;
  if (N === 0) return idf;
  
  // Count how many documents contain each term
  const docCounts = new Map<string, number>();
  allDocumentsTokens.forEach(docTokens => {
    const uniqueTerms = new Set(docTokens);
    uniqueTerms.forEach(term => {
      docCounts.set(term, (docCounts.get(term) || 0) + 1);
    });
  });
  
  // Calculate smoothed IDF: log(1 + (N / (1 + doc_with_term)))
  docCounts.forEach((count, term) => {
    idf.set(term, Math.log(1 + (N / (count))));
  });
  
  return idf;
}

/**
 * Extracts the top keywords for each document based on local TF-IDF scores
 */
export function extractTopKeywords(
  docTokens: string[],
  idf: Map<string, number>,
  limit: number = 10
): { keyword: string; score: number; frequency: number }[] {
  const tf = computeTF(docTokens);
  
  // Count raw frequencies
  const rawCounts = new Map<string, number>();
  docTokens.forEach(t => rawCounts.set(t, (rawCounts.get(t) || 0) + 1));
  
  const tfIdfScores: { keyword: string; score: number; frequency: number }[] = [];
  
  tf.forEach((tfVal, term) => {
    const idfVal = idf.get(term) || 0.1; // Default low IDF if term is not in corpus
    tfIdfScores.push({
      keyword: term,
      score: tfVal * idfVal,
      frequency: rawCounts.get(term) || 1
    });
  });
  
  // Sort descending by TF-IDF score
  return tfIdfScores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * A3: Cosine Similarity
 * Calculates similarity between two word-frequency maps (vectors)
 */
export function calculateCosineSimilarity(
  vector1: Map<string, number>,
  vector2: Map<string, number>
): number {
  let dotProduct = 0;
  let magnitude1 = 0;
  let magnitude2 = 0;
  
  // Get unique terms across both vectors to compute dot product
  const terms1 = Array.from(vector1.keys());
  const terms2 = Array.from(vector2.keys());
  const allTerms = new Set([...terms1, ...terms2]);
  
  allTerms.forEach(term => {
    const val1 = vector1.get(term) || 0;
    const val2 = vector2.get(term) || 0;
    dotProduct += val1 * val2;
  });
  
  vector1.forEach(val => {
    magnitude1 += val * val;
  });
  
  vector2.forEach(val => {
    magnitude2 += val * val;
  });
  
  magnitude1 = Math.sqrt(magnitude1);
  magnitude2 = Math.sqrt(magnitude2);
  
  if (magnitude1 === 0 || magnitude2 === 0) return 0;
  
  const similarity = dotProduct / (magnitude1 * magnitude2);
  // Convert to 0 to 100 scale
  return Math.round(similarity * 100);
}

/**
 * Compares a research question against a document using TF-IDF and Cosine Similarity
 */
export function computeRelevanceScore(
  question: string,
  docCleanedText: string,
  corpusIdf: Map<string, number>
): number {
  const qClean = cleanText(question);
  const qTokens = tokenize(qClean);
  const docTokens = tokenize(docCleanedText);
  
  if (qTokens.length === 0 || docTokens.length === 0) return 10; // baseline fallback
  
  // Vector representation of question (TF-IDF vector)
  const qTF = computeTF(qTokens);
  const qVector = new Map<string, number>();
  qTF.forEach((tfVal, term) => {
    const idfVal = corpusIdf.get(term) || 1.0;
    qVector.set(term, tfVal * idfVal);
  });
  
  // Vector representation of document (TF-IDF vector)
  const docTF = computeTF(docTokens);
  const docVector = new Map<string, number>();
  docTF.forEach((tfVal, term) => {
    const idfVal = corpusIdf.get(term) || 1.0;
    docVector.set(term, tfVal * idfVal);
  });
  
  // Compute Cosine Similarity
  let score = calculateCosineSimilarity(qVector, docVector);
  
  // Boost score slightly if exact key phrases of the question overlap
  const queryTerms = qTokens.filter(t => t.length > 3);
  let matchCount = 0;
  queryTerms.forEach(term => {
    if (docTokens.includes(term)) matchCount++;
  });
  
  const overlapBoost = queryTerms.length > 0 ? (matchCount / queryTerms.length) * 15 : 0;
  score = Math.min(100, Math.max(0, score + Math.round(overlapBoost)));
  
  return score;
}

/**
 * A4: Credibility Scoring
 * Assigns a trust score from 0 to 100 based on the source type and domain extension.
 */
export function scoreCredibility(url: string, sourceType: SourceType): number {
  // 1. Initial base score from Source Type
  let baseScore = 50;
  switch (sourceType) {
    case 'Government Website':
      baseScore = 100;
      break;
    case 'University Source':
      baseScore = 90;
      break;
    case 'Research Report':
      baseScore = 85;
      break;
    case 'Company Website':
    case 'Competitor Website':
      baseScore = 75;
      break;
    case 'Article':
      baseScore = 70;
      break;
    case 'Blog':
      baseScore = 50;
      break;
    case 'Forum/Social Media':
      baseScore = 30;
      break;
  }
  
  // 2. Adjust based on domain extension
  try {
    const parsed = new URL(url.toLowerCase().startsWith('http') ? url : 'https://' + url);
    const domain = parsed.hostname;
    
    if (domain.endsWith('.gov') || domain.endsWith('.gov.us')) {
      return 100;
    }
    if (domain.endsWith('.edu')) {
      return 95;
    }
    if (domain.endsWith('.org')) {
      // Increase by 5 for non-profit organizations
      baseScore = Math.min(95, baseScore + 5);
    }
  } catch (e) {
    // Ignore URL parse errors
  }
  
  return baseScore;
}

/**
 * A5: Theme Grouping
 * Groups sources into themes based on keyword overlaps.
 */
export interface ClusteredTheme {
  name: string;
  description: string;
  sourceIds: string[];
  keywords: string[];
}

export function groupSourcesIntoThemes(
  sources: { id: string; title: string; cleanedText: string; keywords: { keyword: string; score: number }[] }[]
): ClusteredTheme[] {
  if (sources.length === 0) return [];
  
  // Count frequency of all keywords across all sources
  const globalKeywordCounts = new Map<string, number>();
  const sourceKeywordsMap = new Map<string, string[]>();
  
  sources.forEach(source => {
    const kws = source.keywords.slice(0, 5).map(k => k.keyword);
    sourceKeywordsMap.set(source.id, kws);
    kws.forEach(k => {
      globalKeywordCounts.set(k, (globalKeywordCounts.get(k) || 0) + 1);
    });
  });
  
  // Sort global keywords by popular usage
  const sortedGlobalKeywords = Array.from(globalKeywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  
  // We need at least 3 themes. Let's pick the top 3-4 keywords as seed theme names
  const themeSeeds = sortedGlobalKeywords.slice(0, Math.max(3, Math.min(5, sortedGlobalKeywords.length)));
  
  // Fallback seeds if not enough keywords
  while (themeSeeds.length < 3) {
    themeSeeds.push(['Growth', 'Technology', 'Market', 'Compliance'][themeSeeds.length]);
  }
  
  // Map seed keywords to readable, professional AstraQ themes
  const themeMetadata: Record<string, { name: string; desc: string }> = {
    'healthcare': { name: 'Healthcare System Integration', desc: 'Challenges and standards related to clinical integrations (EMR/EHR).' },
    'compliance': { name: 'Compliance & Data Regulation', desc: 'HIPAA, GDPR, and other crucial industry regulatory standards.' },
    'security': { name: 'Data Security & Trust', desc: 'Privacy controls, patient data protection, and vulnerability prevention.' },
    'testing': { name: 'QA & Testing Automation', desc: 'Platform workflows, test maintenance, and automated validation.' },
    'saas': { name: 'SaaS Market Growth', desc: 'Adoption rates, software-as-a-service market trends, and buyer trends.' },
    'competitors': { name: 'Competitive Landscape', desc: 'Analysis of market alternatives, differentiators, and entry barriers.' },
    'market': { name: 'Market Size & Opportunities', desc: 'Evaluation of demographic expansion and potential segment value.' },
    'challenges': { name: 'Operational Pain Points', desc: 'Primary friction areas experienced by target user segments.' }
  };
  
  const clusteredThemes: ClusteredTheme[] = themeSeeds.map(seed => {
    const meta = themeMetadata[seed] || { 
      name: seed.charAt(0).toUpperCase() + seed.slice(1) + ' Trends',
      desc: `Aggregated findings and strategic points concerning ${seed}.` 
    };
    
    // Find sources that share this seed keyword or related keywords
    const relatedSources = sources.filter(src => {
      const kws = sourceKeywordsMap.get(src.id) || [];
      return kws.includes(seed) || kws.some(k => k === seed || k.includes(seed) || seed.includes(k));
    });
    
    // Extract keywords specific to this cluster
    const clusterKeywords = new Set<string>([seed]);
    relatedSources.forEach(src => {
      const kws = sourceKeywordsMap.get(src.id) || [];
      kws.slice(0, 3).forEach(k => clusterKeywords.add(k));
    });
    
    return {
      name: meta.name,
      description: meta.desc,
      sourceIds: relatedSources.map(s => s.id),
      keywords: Array.from(clusterKeywords).slice(0, 6)
    };
  });
  
  // Ensure every source is in at least one theme (add to first theme if orphaned)
  sources.forEach(src => {
    const isInAny = clusteredThemes.some(t => t.sourceIds.includes(src.id));
    if (!isInAny && clusteredThemes.length > 0) {
      clusteredThemes[0].sourceIds.push(src.id);
    }
  });
  
  return clusteredThemes;
}

/**
 * A6: Opportunity Ranking & Weighted Opportunity Scorer
 * Computes an overall Opportunity Score (0-100) based on weighted parameters.
 */
export function calculateOpportunityScore(
  scores: {
    marketRelevance: number; // 0-100
    problemSeverity: number; // 0-100
    productFit: number;      // 0-100
    competitionLevel: number;// 0-100 (where 100 means favorable/low competition, 0 means high/barricaded)
    buyerUrgency: number;    // 0-100
    dataConfidence: number;  // 0-100
  },
  weights: OpportunityWeights = {
    marketRelevance: 0.25,
    problemSeverity: 0.20,
    productFit: 0.20,
    competitionLevel: 0.15,
    buyerUrgency: 0.10,
    dataConfidence: 0.10
  }
): number {
  const weightedSum =
    scores.marketRelevance * weights.marketRelevance +
    scores.problemSeverity * weights.problemSeverity +
    scores.productFit * weights.productFit +
    scores.competitionLevel * weights.competitionLevel +
    scores.buyerUrgency * weights.buyerUrgency +
    scores.dataConfidence * weights.dataConfidence;
    
  return Math.round(Math.min(100, Math.max(0, weightedSum)));
}

/**
 * Maps an overall Opportunity Score to a structured recommendation status and reasoning text.
 */
export interface RecommendationResult {
  recommendation: 'Strong Yes' | 'Yes, but validate further' | 'Maybe' | 'Not recommended' | 'Insufficient opportunity';
  color: string; // Tailwind class
  reasoning: string;
}

export function getRecommendation(score: number, question: string): RecommendationResult {
  if (score >= 85) {
    return {
      recommendation: 'Strong Yes',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      reasoning: `Based on an outstanding opportunity score of ${score}/100, the research strongly validates targeting this area. There is highly documented market demand, critical operational severity, and high compatibility with AstraQ capabilities. We recommend initiating a pilot scope or direct go-to-market execution immediately.`
    };
  } else if (score >= 70) {
    return {
      recommendation: 'Yes, but validate further',
      color: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
      reasoning: `The opportunity score is robust (${score}/100). The target segment shows highly compelling workflows and severe pain points. However, certain barriers like complex procurement compliance, specialized integrations, or enterprise privacy gates must be vetted first. We recommend validating these with direct client discovery calls.`
    };
  } else if (score >= 50) {
    return {
      recommendation: 'Maybe',
      color: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      reasoning: `A score of ${score}/100 indicates a moderate, conditional opportunity. While a clear market presence exists, the product-market fit is either specialized or the competitive intensity is high. Entry will require deep differentiation or heavy vertical customization to win.`
    };
  } else if (score >= 30) {
    return {
      recommendation: 'Not recommended',
      color: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
      reasoning: `An opportunity score of ${score}/100 suggests high market friction. The competitive barrier is significant, or the problem severity is not high enough to drive buyers to purchase. We advise pivoting or exploring adjacent market verticals.`
    };
  } else {
    return {
      recommendation: 'Insufficient opportunity',
      color: 'bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700',
      reasoning: `A score of ${score}/100 indicates highly unfavorable factors. Market size may be negligible, customer pain is low, or alternative solutions fully satisfy the current workflows. We strongly recommend withholding further development resources for this specific query.`
    };
  }
}
