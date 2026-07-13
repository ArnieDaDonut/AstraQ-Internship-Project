/**
 * @file preseededData.ts
 * @description Highly realistic pre-seeded and dynamically generated source content for the research agent.
 * Fulfills FR-005 (Discover Sources), FR-006 (Extract Web Page Content) and provides immediate,
 * high-fidelity research scenarios for Arnav's learning workspace.
 */

import { ResearchProject, ResearchPlanItem, ResearchSource, ResearchDocument, SourceType, Keyword } from '../types';
import { cleanText, tokenize, scoreCredibility } from './algorithms';

// Simple helper to generate stable UUIDs/IDs
export const makeId = () => Math.random().toString(36).substring(2, 11);

export interface SeededProjectData {
  project: ResearchProject;
  plan: ResearchPlanItem[];
  sources: {
    source: ResearchSource;
    doc: ResearchDocument;
  }[];
}

// 1. Default Pre-Seeded Project: Healthcare SaaS
const healthcareId = 'project-healthcare-saas';

export const HEALTHCARE_PROJECT: ResearchProject = {
  id: healthcareId,
  title: 'Healthcare SaaS Market Research',
  question: 'Should AstraQ target healthcare SaaS companies?',
  description: 'An analysis of market size, patient portals, electronic health records compliance, testing challenges, and product-market fit for AstraQ\'s automation platform.',
  research_type: 'Market Research',
  status: 'Draft',
  opportunity_score: 0,
  recommendation: '',
  created_at: new Date(Date.now() - 24 * 3600 * 1000 * 2).toISOString(), // 2 days ago
  updated_at: new Date(Date.now() - 24 * 3600 * 1000 * 2).toISOString()
};

export const HEALTHCARE_PLAN_ITEMS: ResearchPlanItem[] = [
  {
    id: 'plan-1',
    project_id: healthcareId,
    category: 'Market Size & CAGR',
    description: 'Assess the current valuation of the digital healthcare SaaS segment and projected year-over-year compound growth.'
  },
  {
    id: 'plan-2',
    project_id: healthcareId,
    category: 'Customer Pain Points',
    description: 'Document major workflow bottlenecks in healthcare software development, particularly around manual regressions and EHR sync.'
  },
  {
    id: 'plan-3',
    project_id: healthcareId,
    category: 'Regulatory Considerations',
    description: 'Examine HIPAA, HITECH, and patient data safety constraints that restrict automated testing on live data.'
  },
  {
    id: 'plan-4',
    project_id: healthcareId,
    category: 'Testing Challenges',
    description: 'Analyze typical testing blockers: multi-platform user journeys, patient electronic medical record integrations, and HIPAA audit trails.'
  },
  {
    id: 'plan-5',
    project_id: healthcareId,
    category: 'Existing Competitors',
    description: 'Analyze current software quality platforms catering to healthcare (e.g., specialized medical testing setups).'
  },
  {
    id: 'plan-6',
    project_id: healthcareId,
    category: 'Buyer Personas',
    description: 'Identify the decision-makers in target clinics and healthtech startups (e.g., Chief Medical Officers, VPs of Engineering).'
  }
];

export const HEALTHCARE_SOURCES_RAW = [
  {
    title: 'HIPAA Security Standards for Cloud Systems and Patient Data Platforms',
    url: 'https://www.hhs.gov/hipaa/for-professionals/special-topics/cloud-computing/index.html',
    source_type: 'Government Website' as SourceType,
    raw_text: `The Health Insurance Portability and Accountability Act (HIPAA) Security Rule establishes national standards to protect individuals' electronic personal health information (ePHI).
Cloud computing providers hosting healthcare SaaS products must implement administrative, physical, and technical safeguards.
A major compliance challenge in testing healthcare applications is preventing the exposure of actual patient records in non-production environments.
Software testing automation tools must support secure, scrubbed database environments or execute on fully synthetic patient data to satisfy federal HIPAA audits.
Any vendor providing software testing systems that handle, log, or store patient health identifiers must sign a Business Associate Agreement (BAA) with the health provider.
Failure to implement adequate patient privacy gates during software release cycles can result in civil monetary penalties and severe reputational damage.
Therefore, automated testing suites must be explicitly designed for compliance-first workflows, ensuring zero leakage of ePHI in debugging console logs or reports.`
  },
  {
    title: 'Digital Health SaaS Adoption: Interoperability and Testing Workflows in Clinics',
    url: 'https://healthpolicy.hms.harvard.edu/insights/trends-digital-health-saas-adoption',
    source_type: 'University Source' as SourceType,
    raw_text: `Scholarly research into medical practice software indicates a rapid acceleration in clinical digital portal adoption.
Modern healthcare delivery relies on interconnected SaaS tools managing scheduling, electronic medical records (EMR), and doctor-patient communications.
However, clinical software systems face massive integration friction. Interoperability across different EHR networks is fragile, and minor software updates often break data pipelines.
To mitigate system downtime, healthcare software companies dedicate over 40% of their engineering hours to regression testing.
Manual software testing is the default because of the high complexity of clinical workflows. Doctors and medical administrators use diverse tablets, web portals, and mobile devices.
An automated testing solution that can emulate multi-device patient journeys while verifying HL7 and FHIR messaging protocols would cut testing cycles in half and decrease system crashes by 80%.
However, clinical IT managers express strong hesitation toward external SaaS testing tools that require deep data network access.`
  },
  {
    title: 'Gartner Global Healthcare SaaS Market Forecast: Growth, Barriers, and EHR Systems',
    url: 'https://www.gartner.com/en/documents/healthcare-saas-market-trends',
    source_type: 'Research Report' as SourceType,
    raw_text: `The global healthcare software-as-a-service market is projected to reach $112 billion by 2028, expanding at a CAGR of 18.4%.
Growth is propelled by hospital cloud migrations, telemedicine demand, and electronic health records (EHR) consolidation.
Despite high growth, development cycles are severely bottle-necked. While standard consumer SaaS releases multiple times per day, healthcare SaaS averages only one major release every six weeks.
This lag is attributed directly to intensive QA validation. Because software glitches can directly impact patient health or clinical safety, QA teams must verify thousands of diagnostic and data entry parameters.
Automation is underutilized; less than 20% of healthcare SaaS companies use modern low-code test automation.
Existing testing tools are too generic. They fail to understand standard healthcare database schemas, HIPAA compliance requirements, or the complex multi-step workflows of a patient clinical visit.
A specialized testing suite tailored specifically for healthcare SaaS represents a major blue ocean market, as startups are desperate to accelerate release velocity to compete.`
  },
  {
    title: 'QA Insights: Why Testing Healthcare and EMR Portals is Exceptionally Complex',
    url: 'https://qainsights.com/why-testing-healthcare-software-is-hard',
    source_type: 'Blog' as SourceType,
    raw_text: `Ask any software QA lead in a healthcare startup what their nightmare is, and they will tell you: EMR system integration testing.
Unlike a standard e-commerce site where a checkout bug costs a few dollars, an EMR portal bug can lead to mixed patient charts, incorrect drug dosages, or delayed clinical treatments.
Consequently, healthcare software testing requirements are incredibly rigorous. Here are the top three hurdles:
First, clinical data HIPAA compliance means we cannot copy live production databases to our staging environments. We must generate thousands of simulated patients with realistic medical codes (ICD-10).
Second, patient journeys are deeply asynchronous. A patient schedules a visit online, receives an SMS notification, visits the clinic where the doctor updates the charts, and then receives an automated pharmacy invoice. Testing this end-to-end requires complex multi-platform test logic.
Third, standard web testing systems fail because EMR portals rely on old frames, custom web components, and desktop-hybrid frameworks.
There is a massive demand for AI-driven testing tools that can adaptively learn these complex clinical layouts without constant test script maintenance.`
  },
  {
    title: 'HL7 FHIR Interoperability Standards and EHR API Testing Protocols',
    url: 'https://epic.com/developer/integration-standards',
    source_type: 'Company Website' as SourceType,
    raw_text: `Epic Systems represents the primary electronic health records database for over 250 million patients globally.
Interfacing with Epic requires adhering strictly to HL7 and FHIR (Fast Healthcare Interoperability Resources) data schemas.
When digital health developers build custom applications on top of the Epic system, they must validate that their APIs successfully read and write patient charts under peak load.
EHR API updates are frequent, and small changes in EHR payloads can break third-party patient portals.
Current automated API monitoring is insufficient. Developers need visual, model-driven testing tools that can continuously simulate patient workflows, verify FHIR payload structures, and ensure HIPAA data encryption standards (in-transit and at-rest).
Security sandboxing is mandatory; no testing tools are allowed to connect to active clinical databases without passing rigid enterprise security reviews and signing full business associate agreements.`
  }
];

// Helper to generate realistic search results for any CUSTOM question!
export function generateDiscoveriesForQuestion(question: string): { title: string; url: string; source_type: SourceType; raw_text: string }[] {
  const cleanQ = question.toLowerCase();
  
  // FinTech SaaS detection
  if (cleanQ.includes('fintech') || cleanQ.includes('financial') || cleanQ.includes('bank') || cleanQ.includes('payment')) {
    return [
      {
        title: 'PCI-DSS Compliance Standards for Payment Gateway Infrastructure',
        url: 'https://www.pcisecuritystandards.org/document_library/pci-dss-specifications',
        source_type: 'Government Website',
        raw_text: `The Payment Card Industry Data Security Standard (PCI-DSS) regulates payment transactions and cardholder data security.
Fintech SaaS applications must enforce strict data encryption, network segmentation, and secure coding audits.
A primary obstacle in Fintech automated software testing is protecting sensitive customer credentials and banking tokens in testing environments.
Test automation platforms must execute testing scripts without logging raw credit card details, CVV codes, or transaction payloads.
Compliance audits mandate that all testing logs must be fully masked to prevent leakage. Automated tools must generate synthetic mock bank accounts and transaction numbers to test credit card routing and processing.
System failure in transaction routing or multi-factor authentication (MFA) can trigger instant regulatory penalties and massive customer churn.`
      },
      {
        title: 'Gartner Financial Technology Review: Growth in Neobanking and Embedded Finance',
        url: 'https://www.gartner.com/en/documents/fintech-saas-market-trends',
        source_type: 'Research Report',
        raw_text: `The global FinTech SaaS market is expanding at an impressive annual rate of 21.2%, driven by embedded banking API integrations and digital wallets.
Fintech startups release new software updates constantly to compete, but financial transaction errors can be catastrophic.
Up to 35% of engineering efforts are consumed by automated regression testing and compliance verification.
Current general-purpose testing systems are inadequate for financial workflows because they cannot simulate asynchronous payment callbacks, stock-market feeds, or complex multi-currency calculations.
Fintech product managers are actively seeking AI-driven software testing suites that can adaptively test secure transaction portals across iOS, Android, and web without breaking payment gateway compliance.`
      },
      {
        title: 'Stanford Center for Financial Research: API Security and Banking Interoperability',
        url: 'https://finresearch.stanford.edu/insights/banking-apis-and-security-testing',
        source_type: 'University Source',
        raw_text: `Modern digital banking depends entirely on secure API networks (Open Banking protocols).
Third-party budgeting apps and fintech investment dashboards must seamlessly connect with legacy bank data schemas.
However, banking APIs frequently experience schema changes and network rate limits, which cause immediate application crashes.
To maintain service reliability, fintech platforms require robust continuous integration/continuous deployment (CI/CD) testing pipelines.
Specialized automated API testing tools must simulate concurrent transaction spikes and verify ledger balance consistency.
The primary concern for financial institutions is the security footprint of third-party test automation tools accessing core ledgers.`
      },
      {
        title: 'TechBlog: Why Testing Ledger and Accounting Software is an Engineering Nightmare',
        url: 'https://techblog.com/fintech-testing-ledgers-challenges',
        source_type: 'Blog',
        raw_text: `Engineering teams in Fintech startups face a unique challenge: testing immutable financial ledgers.
Unlike standard database records, ledger logs cannot simply be deleted or updated; they represent double-entry accounting records.
When testing new ledger automation scripts, QA engineers must verify that every debit has a corresponding credit, and no decimal rounding errors occur across millions of mock accounts.
Generative testing scripts are mandatory to create realistic accounting transaction streams.
Generic browser testing tools do not support testing these ledger rules, leading to critical financial discrepancies in production.
There is a massive market opportunity for compliance-ready test tools built specifically for fintech ledgers.`
      },
      {
        title: 'Stripe Developer Portal: Sandboxing and Transaction Simulation Protocols',
        url: 'https://stripe.com/docs/testing/developer-sandbox-rules',
        source_type: 'Company Website',
        raw_text: `Stripe processes payments for millions of internet businesses worldwide.
Testing Stripe integrations requires using a secure sandbox environment with designated mock cards (e.g., 4242-4242...).
Developers must write test cases that handle diverse card responses: successful charges, card declines, fraud triggers, and bank network timeouts.
Asynchronous webhooks are highly fragile and represent the number one source of order fulfillment bugs.
Software quality assurance teams require advanced visual dashboards that can easily orchestrate and trigger simulated Stripe webhooks to verify invoice automation flows.`
      }
    ];
  }
  
  // AI or Machine Learning detection
  if (cleanQ.includes('ai') || cleanQ.includes('machine learning') || cleanQ.includes('llm')) {
    return [
      {
        title: 'NIST Standards for Trustworthy and Secure Artificial Intelligence Systems',
        url: 'https://www.nist.gov/ai/standards-trustworthy-ai-safeguards',
        source_type: 'Government Website',
        raw_text: `The National Institute of Standards and Technology (NIST) outlines rigorous evaluation frameworks for AI and Large Language Model safety.
Companies building generative AI SaaS applications must implement safeguards against bias, prompt injection, and hallucination.
Testing AI-native applications is uniquely challenging because LLM outputs are non-deterministic. Traditional assertion testing (expecting an exact string match) fails immediately.
Automated testing tools must adopt an AI-testing-AI model, evaluating semantic relevance, tone, safety, and correctness on a probabilistic scale.
System audits require comprehensive compliance metrics for all production AI prompts and responses.`
      },
      {
        title: 'Gartner Generative AI Software Market Analysis: The Shift to LLM-Native SaaS',
        url: 'https://www.gartner.com/en/documents/generative-ai-saas-market-trends',
        source_type: 'Research Report',
        raw_text: `The market for Enterprise Generative AI applications is experiencing an unprecedented CAGR of 34.6%.
Every major SaaS platform is embedding LLM agents, natural language interfaces, and automated copilots.
However, release quality is a massive issue. AI features frequently suffer from degradation, outputting bad suggestions or breaking user experience.
Engineers spend over 50% of their development cycles attempting to benchmark and validate AI outputs manually.
Standard selenium or playwrite scripts cannot evaluate if an AI agent successfully completed a multi-step workflow.
Startups are desperately seeking automated, model-driven evaluation suites that can run automated regression testing on generative AI prompts.`
      },
      {
        title: 'MIT Computer Science Lab: Evaluating Non-Deterministic Output in LLM Workflows',
        url: 'https://csail.mit.edu/research/llm-evaluation-and-testing-frameworks',
        source_type: 'University Source',
        raw_text: `Academic researchers are developing new testing methodologies to solve the "non-deterministic validation" crisis in AI engineering.
Unlike traditional deterministic programs, an LLM will return slightly different phrasing for the exact same input.
Our research proposes using cosine similarity over sentence embeddings to evaluate response consistency.
Additionally, tests must evaluate the safety boundaries of custom system instructions.
Automated evaluation requires orchestrating hundreds of adversarial prompts (red-teaming) to find vulnerabilities before release.
The study highlights that manual QA is completely unscalable for generative AI products.`
      },
      {
        title: 'DevOpsWeekly: Best Practices for Setting Up CI/CD Pipelines for GenAI Portals',
        url: 'https://devopsweekly.com/cicd-for-generative-ai-applications',
        source_type: 'Blog',
        raw_text: `Setting up a CI/CD pipeline for a generative AI app is entirely different from a standard web app.
In addition to running your unit tests and building assets, you must run "prompt unit tests."
This means sending structured test prompts to your model and scoring the output using semantic comparison algorithms.
Testing must also monitor latency and API cost spikes, as model calls can be exceptionally expensive.
Generative AI test suites require real-time cost indicators and rate-limiting alerts during continuous integration cycles.
Visual comparison dashboards are highly effective for developers to see prompt version variations.`
      },
      {
        title: 'OpenAI Developer Forum: Best Practices for Evaluating Model Fine-Tuning and Prompt Engineering',
        url: 'https://openai.com/developer/evals-and-prompt-testing-protocols',
        source_type: 'Company Website',
        raw_text: `Fine-tuning models on proprietary data requires continuous evaluation against a gold-standard benchmark dataset.
Developers must measure accuracy, recall, and hallucination rates across model iterations.
Using automated evals allows engineering teams to programmatically verify that an optimized model does not suffer from catastrophic forgetting.
Secure API key rotation, request retries, and rate limit backoff algorithms are essential for building robust AI software architectures.`
      }
    ];
  }
  
  // Generic Fallback (Dynamic matching using question words!)
  const words = question.split(/\s+/).filter(w => w.length > 4).map(w => w.replace(/[^a-zA-Z]/g, ''));
  const keyword1 = words[0] || 'Market';
  const keyword2 = words[1] || 'SaaS';
  const keyword3 = words[2] || 'Technology';
  
  return [
    {
      title: `${keyword1} Regulatory Frameworks and Consumer Data Security Guidelines`,
      url: `https://www.ftc.gov/guidance/${keyword1.toLowerCase()}-data-security-rules.html`,
      source_type: 'Government Website',
      raw_text: `The Federal Trade Commission establishes standard guidelines for security and data transparency in the digital ${keyword1} market.
SaaS providers targeting this domain must secure user profiles, prevent data leaks, and maintain transparent audit logs.
Testing software updates is crucial to avoid introducing security holes into live systems.
Developers must use synthetic test accounts instead of real client files during development and automated QA testing.
Federal compliance standards mandate regular regression testing and system validation prior to deploying production builds.
Failure to implement adequate validation protocols can result in major consumer compliance penalties.`
    },
    {
      title: `Global ${keyword1} and ${keyword2} Market Analysis: Future Projections and Vertical Demands`,
      url: `https://www.marketinsights.com/reports/${keyword2.toLowerCase()}-opportunities-and-growth`,
      source_type: 'Research Report',
      raw_text: `The market segment for ${keyword1} ${keyword2} applications is experiencing rapid growth, currently valued at over $45 billion.
Growth is powered by the digital transformation of enterprise workflows, mobile expansion, and embedded cloud automation.
However, product release velocities are severely restricted by outdated manual quality assurance practices.
Startups in this vertical spend up to 30% of development budgets on regression testing.
Generic test automation tools do not support the highly specialized schemas or integration interfaces of this niche.
A tailored visual automation system represents a major business opportunity with high margins and weak competition.`
    },
    {
      title: `Academic Research into Digital ${keyword2} Interoperability and Workflow Bottlenecks`,
      url: `https://research.university.edu/insights/${keyword1.toLowerCase()}-digital-integration`,
      source_type: 'University Source',
      raw_text: `A systematic study of digital software platforms reveals a critical integration barrier.
Modern ${keyword2} tools manage diverse data sets across multiple APIs and third-party systems.
These API integrations are highly fragile. Any database schema update can cause cascade failures across client portals.
To protect system reliability, software companies require continuous visual testing pipelines.
Specialized test systems must validate HL7 and schema formats dynamically to prevent production errors.
Security reviews are highly strict, and external test tools must prove their encryption compliance.`
    },
    {
      title: `Modern Tech: Why Building Test Automation for ${keyword2} Systems is Highly Complex`,
      url: `https://moderntech.com/challenges-of-testing-${keyword2.toLowerCase()}-portals`,
      source_type: 'Blog',
      raw_text: `QA engineering teams in the ${keyword1} space face a difficult task: automating test coverage for heavily customized user journeys.
Standard visual test suites fail because web components are dynamic and layout structures change constantly.
Furthermore, compliance mandates that test data must be fully anonymized. Generating synthetic data that mimics real financial and enterprise workflows is a complex process.
AI-native test engines can solve these challenges by dynamically adapting to UI changes without requiring constant manual code updates.
Engineering leads are desperate to acquire these specialized diagnostic test suites.`
    },
    {
      title: `${keyword3} Developer integration Hub and API Certification Guidelines`,
      url: `https://company-${keyword3.toLowerCase()}.com/developer-standards`,
      source_type: 'Company Website',
      raw_text: `Connecting with core ${keyword3} systems requires adhering strictly to our published JSON and API interface rules.
Third-party client systems must pass rigid certification testing to demonstrate data transaction integrity.
Current API monitoring systems are insufficient. Engineering teams need continuous API transaction simulators that verify payload encryption and standard schemas.
Sandboxed testing environments are provided, but developers must write extensive scripts to orchestrate and evaluate complex visual workflow loops.`
    }
  ];
}

/**
 * Creates and seeds an entire workspace dataset for a project
 */
export function seedProjectWorkspace(project: ResearchProject, planItems: ResearchPlanItem[]): SeededProjectData {
  const isDefaultHealthcare = project.id === healthcareId;
  const rawSources = isDefaultHealthcare ? HEALTHCARE_SOURCES_RAW : generateDiscoveriesForQuestion(project.question);
  
  // Calculate a corpus of documents to compute a realistic IDF map
  const corpusTokens = rawSources.map(s => tokenize(cleanText(s.raw_text)));
  const docCounts = new Map<string, number>();
  corpusTokens.forEach(tokens => {
    new Set(tokens).forEach(t => docCounts.set(t, (docCounts.get(t) || 0) + 1));
  });
  
  const idf = new Map<string, number>();
  const N = corpusTokens.length;
  docCounts.forEach((count, term) => {
    idf.set(term, Math.log(1 + (N / count)));
  });
  
  const sourcesAndDocs = rawSources.map(raw => {
    const sId = 'src-' + makeId();
    const cleanBody = cleanText(raw.raw_text);
    const tokens = tokenize(cleanBody);
    
    const credibility = scoreCredibility(raw.url, raw.source_type);
    
    // Compute Cosine Relevance score against the project question
    // Question tokens
    const qClean = cleanText(project.question);
    const qTokens = tokenize(qClean);
    const qTF = new Map<string, number>();
    qTokens.forEach(t => qTF.set(t, (qTF.get(t) || 0) + 1 / qTokens.length));
    const qVector = new Map<string, number>();
    qTF.forEach((tfVal, term) => qVector.set(term, tfVal * (idf.get(term) || 1.0)));
    
    // Doc vector
    const docTF = new Map<string, number>();
    tokens.forEach(t => docTF.set(t, (docTF.get(t) || 0) + 1 / tokens.length));
    const docVector = new Map<string, number>();
    docTF.forEach((tfVal, term) => docVector.set(term, tfVal * (idf.get(term) || 1.0)));
    
    // Cosine similarity
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    const allTerms = new Set([...Array.from(qVector.keys()), ...Array.from(docVector.keys())]);
    allTerms.forEach(t => {
      dotProduct += (qVector.get(t) || 0) * (docVector.get(t) || 0);
    });
    qVector.forEach(v => mag1 += v * v);
    docVector.forEach(v => mag2 += v * v);
    mag1 = Math.sqrt(mag1);
    mag2 = Math.sqrt(mag2);
    
    let cosineSim = mag1 === 0 || mag2 === 0 ? 0 : dotProduct / (mag1 * mag2);
    let relevance = Math.round(cosineSim * 100);
    
    // Overlap boost
    let matchCount = 0;
    qTokens.forEach(t => {
      if (tokens.includes(t)) matchCount++;
    });
    const overlapBoost = qTokens.length > 0 ? (matchCount / qTokens.length) * 20 : 0;
    relevance = Math.min(100, Math.max(0, relevance + Math.round(overlapBoost)));
    
    // Give some realistic noise
    if (relevance < 30) relevance += 25; // baseline minimum relevance for discoverable items
    relevance = Math.min(100, relevance);

    const source: ResearchSource = {
      id: sId,
      project_id: project.id,
      url: raw.url,
      title: raw.title,
      domain: new URL(raw.url).hostname,
      source_type: raw.source_type,
      credibility_score: credibility,
      relevance_score: relevance,
      status: 'Extracted'
    };
    
    const doc: ResearchDocument = {
      id: 'doc-' + makeId(),
      source_id: sId,
      raw_text: raw.raw_text,
      cleaned_text: cleanBody,
      word_count: raw.raw_text.split(/\s+/).length,
      extracted_at: new Date().toISOString()
    };
    
    return { source, doc };
  });
  
  return {
    project,
    plan: planItems,
    sources: sourcesAndDocs
  };
}

// Generate realistic plans for any custom question
export function generatePlanForQuestion(projectId: string, question: string): ResearchPlanItem[] {
  const cleanQ = question.toLowerCase();
  
  if (cleanQ.includes('fintech') || cleanQ.includes('financial') || cleanQ.includes('bank') || cleanQ.includes('payment')) {
    return [
      {
        id: 'plan-f1',
        project_id: projectId,
        category: 'Payment Compliance',
        description: 'Analyze PCI-DSS audits, bank data security regulations, and transaction masking guidelines.'
      },
      {
        id: 'plan-f2',
        project_id: projectId,
        category: 'Ledger Audit Workflows',
        description: 'Examine immutable ledger records, double-entry accounting testing complexity, and balancing rules.'
      },
      {
        id: 'plan-f3',
        project_id: projectId,
        category: 'Asynchronous API Webhooks',
        description: 'Investigate payment processing callbacks, webhook synchronization triggers, and retry handlers.'
      },
      {
        id: 'plan-f4',
        project_id: projectId,
        category: 'Mock Data Generation',
        description: 'Establish secure standards for synthesizing banking tokens and credit card sequences for stage environments.'
      },
      {
        id: 'plan-f5',
        project_id: projectId,
        category: 'Competitor Quality Platforms',
        description: 'Assess existing software quality systems focused on banking API rate limits and ledger consistency.'
      }
    ];
  }
  
  if (cleanQ.includes('ai') || cleanQ.includes('machine learning') || cleanQ.includes('llm')) {
    return [
      {
        id: 'plan-ai1',
        project_id: projectId,
        category: 'NIST Safety Controls',
        description: 'Review federal NIST frameworks on bias mitigation, prompt injection prevention, and LLM toxicity gates.'
      },
      {
        id: 'plan-ai2',
        project_id: projectId,
        category: 'Probabilistic Evaluation',
        description: 'Devise non-deterministic assertion testing methodologies utilizing semantic embedding comparisons.'
      },
      {
        id: 'plan-ai3',
        project_id: projectId,
        category: 'Adversarial Prompting',
        description: 'Design automated systems to conduct continuous red-teaming checks and vulnerability fuzzing.'
      },
      {
        id: 'plan-ai4',
        project_id: projectId,
        category: 'CI/CD Prompt Integration',
        description: 'Formulate prompt regression benchmark pipelines and cost tracking for expensive API calls.'
      },
      {
        id: 'plan-ai5',
        project_id: projectId,
        category: 'AstraQ Model Fit',
        description: 'Evaluate AstraQ platform compatibility with continuous evaluation workflows and system prompt versions.'
      }
    ];
  }
  
  // Generic Fallback
  return [
    {
      id: 'plan-g1',
      project_id: projectId,
      category: 'Market Relevance & Volume',
      description: 'Evaluate overall industry size, target buyer spending thresholds, and expansion demographics.'
    },
    {
      id: 'plan-g2',
      project_id: projectId,
      category: 'Target Segment Pain Points',
      description: 'Identify primary workflow friction, manual processes, and software delivery bottlenecks.'
    },
    {
      id: 'plan-g3',
      project_id: projectId,
      category: 'Regulatory Guidelines',
      description: 'Analyze data compliance, federal privacy rules, and regional operational licensing requirements.'
    },
    {
      id: 'plan-g4',
      project_id: projectId,
      category: 'Existing Alternatives',
      description: 'Review current legacy software competitors, alternative solutions, and barriers to switching.'
    },
    {
      id: 'plan-g5',
      project_id: projectId,
      category: 'AstraQ Platform Fit',
      description: 'Assess engineering requirements for adapting AstraQ custom test engines to target visual layouts.'
    }
  ];
}
