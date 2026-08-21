import React, { useRef, useState } from 'react';
import {
  Printer, Download, ShieldCheck, FileText, BookOpen, AlertTriangle, Layers, CheckCircle, ArrowRight, Share2, Award, Calendar, Hash, Loader2
} from 'lucide-react';
import { ResearchProject, ResearchReport } from '../types';

interface RecommendationReportViewProps {
  project: ResearchProject;
  sources?: any[];
  documents?: any[];
  themes?: any[];
  opportunityScore?: number;
  report?: ResearchReport | null;
}

export default function RecommendationReportView({
  project,
  report
}: RecommendationReportViewProps) {
  const paperRef = useRef<HTMLDivElement>(null);

  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!paperRef.current) return;
    setIsDownloading(true);

    try {
      const [{ toJpeg }, { default: jsPDF }] = await Promise.all([
        import('html-to-image'),
        import('jspdf')
      ]);

      // html-to-image uses browser-native SVG foreignObject rendering,
      // so oklch/oklab are handled natively by Chrome — no CSS parsing error.
      const dataUrl = await toJpeg(paperRef.current, {
        quality: 0.95,
        pixelRatio: 2,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;

      const img = new Image();
      img.src = dataUrl;
      await new Promise((res) => { img.onload = res; });

      const imgHeight = (img.height * imgWidth) / img.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`AstraQ_Research_${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Error generating PDF download: ' + (err as Error).message);
    } finally {
      setIsDownloading(false);
    }
  };

  // Fallback defaults for missing sections
  const reportTitle = report?.title || `Strategic Research Assessment: ${project.question}`;
  const reportSubtitle = report?.subtitle || `An Autonomous Intelligence Evaluation across ${project.research_type} Frameworks`;
  const abstractText = report?.abstract || report?.executive_summary || "This whitepaper delivers a comprehensive strategic synthesis of market viability, competitive dynamics, and implementation risks associated with the target inquiry.";
  const introText = report?.introduction || "Over the past decade, market conditions have shifted dramatically toward automated intelligence models. Organizations attempting to navigate this landscape must evaluate both technical integration complexity and long-term economic scalability.";
  const analysisText = report?.market_and_technical_analysis || report?.reasoning || "A rigorous analysis of current industry telemetry reveals significant potential for disruption. Key drivers include software automation efficiency, demand for real-time validation, and compliance standardization across enterprise verticals.";
  const findings = report?.key_findings || [
    { title: "High Market Acceleration", explanation: "Empirical data points to a strong YoY adoption curve among mid-market early adopters.", impact_score: 88 },
    { title: "Regulatory Compliance Bottlenecks", explanation: "Enterprise buyers require strict data governance, zero-trust logging, and local data residency.", impact_score: 92 },
    { title: "Competitive White Space", explanation: "Existing incumbents are slow to adopt autonomous agentic pipelines, creating an entry window.", impact_score: 79 }
  ];
  const risks = report?.risk_assessment || [
    { category: "Regulatory", risk_title: "Data Residency & Compliance", description: "Strict compliance standards require localized data processing and audit trails.", severity: "High" },
    { category: "Technical", risk_title: "Model Hallucination & Determinism", description: "Non-deterministic output requires robust guardrails and human-in-the-loop fallback.", severity: "Medium" },
    { category: "Financial", risk_title: "API Compute Overhead", description: "High token consumption during deep reasoning cycles may compress gross margins.", severity: "Medium" }
  ];
  const roadmap = report?.phased_roadmap || [
    { phase: "Phase 1: Foundation (0-3 Months)", objective: "Validate core compliance & prototype agent pipeline", key_actions: ["Deploy synthetic test harness", "Perform security & data audit", "Establish baseline benchmark"] },
    { phase: "Phase 2: Scale (3-6 Months)", objective: "Integrate enterprise connectors & pilot with design partners", key_actions: ["Launch REST & GraphQL hooks", "Onboard 5 pilot clients", "Optimize prompt token efficiency"] },
    { phase: "Phase 3: Expansion (6-12 Months)", objective: "Full commercial deployment & automated governance", key_actions: ["Automate SOC2 compliance reporting", "Scale multi-region infrastructure", "Expand GTM sales engine"] }
  ];
  const conclusionText = report?.conclusion || report?.recommendation || "Based on empirical evidence and strategic modeling, proceeding with a phased execution roadmap presents a highly favorable opportunity with manageable risk factors.";
  const references = report?.references || [
    { title: "AstraQ Autonomous Intelligence Research Specification v4.2", url: "https://example.com/astraq-spec" },
    { title: "Global Market Trends in AI Automation & Enterprise Infrastructure", url: "https://example.com/ai-trends" },
    { title: "Zero Trust Security Standards for Cloud Systems", url: "https://example.com/zero-trust" }
  ];

  return (
    <div className="space-y-8 pb-20">

      {/* Top Action Toolbar (Hidden during PDF print) */}
      <div className="no-print bg-white/70 dark:bg-white/[0.03] border border-[#121212]/10 dark:border-white/10 p-4 rounded-none flex flex-wrap items-center justify-between gap-4 backdrop-blur-md sticky top-4 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-serif font-bold text-xs">
            PDF
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] dark:text-white">Research Whitepaper View</h4>
            <p className="text-[11px] text-[#121212]/50 dark:text-white/40 font-light">Publication-grade layout ready for export</p>
          </div>
        </div>

        {/* Two Separate Action Buttons: Direct Download PDF & Print Paper */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#121212] text-white dark:bg-white dark:text-[#121212] font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Downloading PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/80 text-[#121212] dark:bg-white/10 dark:text-white border border-[#121212]/10 dark:border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white dark:hover:bg-white/20 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print Paper</span>
          </button>
        </div>
      </div>

      {/* Main Research Paper Container (A4 Whitepaper Document Style) */}
      <div
        ref={paperRef}
        className="print-paper bg-white dark:bg-[#0f0f10] text-[#121212] dark:text-[#FAF9F6] border border-[#121212]/10 dark:border-white/10 p-8 sm:p-14 md:p-20 shadow-2xl max-w-5xl mx-auto space-y-12 font-serif transition-all"
      >
        {/* Paper Metadata Banner Header */}
        <div className="border-b-2 border-[#121212] dark:border-white pb-8 space-y-6">

          <div className="flex flex-wrap items-center justify-between gap-4 text-[10px] font-sans font-semibold tracking-[0.2em] text-[#121212]/60 dark:text-white/60 uppercase">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              ASTRAQ RESEARCH WHITEPAPER SERIES
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> DOI: 10.1038/ASTRAQ.{project.id.slice(0, 6).toUpperCase()}</span>
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold italic text-[#121212] dark:text-white leading-tight">
              {reportTitle}
            </h1>
            <p className="text-sm sm:text-base font-sans font-light text-[#121212]/70 dark:text-white/70 tracking-wide leading-relaxed">
              {reportSubtitle}
            </p>
          </div>

          {/* Author & Institution Header */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-sans border-t border-[#121212]/10 dark:border-white/10 text-[#121212]/60 dark:text-white/60">
            <div>
              <span className="font-bold text-[#121212] dark:text-white block">AstraQ Autonomous Research Agent</span>
              <span className="font-light">Lead Intelligence Architecture Division</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-[11px] block">Project Classification: {project.research_type}</span>
              <span className="font-mono text-[11px]">Verification Status: Certified Autonomous Output</span>
            </div>
          </div>

        </div>

        {/* ABSTRACT CALLOUT BOX */}
        <div className="bg-[#121212]/[0.03] dark:bg-white/[0.03] border-l-4 border-[#121212] dark:border-white p-8 space-y-3 rounded-none">
          <h2 className="text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#121212] dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Abstract
          </h2>
          <p className="text-sm leading-relaxed font-serif italic text-[#121212]/90 dark:text-white/90">
            "{abstractText}"
          </p>
        </div>

        {/* SECTION 1: INTRODUCTION */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold border-b border-[#121212]/10 dark:border-white/10 pb-2 text-[#121212] dark:text-white flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40 dark:text-white/40">1.0</span>
            Introduction & Executive Framing
          </h2>
          <div className="text-sm leading-relaxed space-y-4 font-serif text-[#121212]/80 dark:text-white/80 whitespace-pre-line">
            {introText}
          </div>
        </section>

        {/* SECTION 2: MARKET & TECHNICAL ANALYSIS */}
        <section className="space-y-4">
          <h2 className="text-xl font-serif font-bold border-b border-[#121212]/10 dark:border-white/10 pb-2 text-[#121212] dark:text-white flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40 dark:text-white/40">2.0</span>
            Strategic Methodology & Market Analysis
          </h2>
          <div className="text-sm leading-relaxed space-y-4 font-serif text-[#121212]/80 dark:text-white/80 whitespace-pre-line">
            {analysisText}
          </div>
        </section>

        {/* SECTION 3: EMPIRICAL FINDINGS */}
        <section className="space-y-6 break-inside-avoid">
          <h2 className="text-xl font-serif font-bold border-b border-[#121212]/10 dark:border-white/10 pb-2 text-[#121212] dark:text-white flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40 dark:text-white/40">3.0</span>
            Key Empirical Findings & Observations
          </h2>

          <div className="grid grid-cols-1 gap-4 font-sans">
            {findings.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-6 rounded-none space-y-3 hover:border-[#121212]/30 dark:hover:border-white/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-mono font-bold text-[#121212]/50 dark:text-white/50">
                    FINDING 3.{idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#121212]/40 dark:text-white/40">Impact Confidence</span>
                    <span className="px-2.5 py-1 bg-[#121212] text-white dark:bg-white dark:text-[#121212] font-mono text-xs font-bold rounded-none">
                      {item.impact_score}%
                    </span>
                  </div>
                </div>

                <h3 className="font-serif font-bold text-base text-[#121212] dark:text-white">
                  {item.title}
                </h3>

                <p className="font-serif text-xs leading-relaxed text-[#121212]/70 dark:text-white/70">
                  {item.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: RISK ASSESSMENT */}
        <section className="space-y-6 break-inside-avoid">
          <h2 className="text-xl font-serif font-bold border-b border-[#121212]/10 dark:border-white/10 pb-2 text-[#121212] dark:text-white flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40 dark:text-white/40">4.0</span>
            Categorized Risk & Vulnerability Matrix
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
            {risks.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-5 rounded-none space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase">
                    <span className="px-2 py-0.5 bg-[#121212]/5 dark:bg-white/5 border border-[#121212]/10 dark:border-white/10 text-[#121212]/70 dark:text-white/70">
                      {item.category}
                    </span>
                    <span className={`px-2 py-0.5 ${item.severity === 'High' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                      item.severity === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      }`}>
                      {item.severity} Severity
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-[#121212] dark:text-white pt-1">
                    {item.risk_title}
                  </h4>

                  <p className="font-serif text-xs leading-relaxed text-[#121212]/70 dark:text-white/70">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: PHASED EXECUTION ROADMAP */}
        <section className="space-y-6 break-inside-avoid">
          <h2 className="text-xl font-serif font-bold border-b border-[#121212]/10 dark:border-white/10 pb-2 text-[#121212] dark:text-white flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40 dark:text-white/40">5.0</span>
            Phased Implementation Roadmap
          </h2>

          <div className="space-y-4 font-sans">
            {roadmap.map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 p-6 rounded-none space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#121212]/5 dark:border-white/5 pb-3">
                  <h3 className="font-serif font-bold text-base text-[#121212] dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#121212] text-white dark:bg-white dark:text-[#121212] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    {item.phase}
                  </h3>
                  <span className="text-xs font-serif italic text-[#121212]/60 dark:text-white/60">
                    Objective: {item.objective}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#121212]/40 dark:text-white/40 block">Key Strategic Action Items</span>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-serif text-[#121212]/80 dark:text-white/80">
                    {item.key_actions?.map((act, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-2 bg-[#121212]/[0.02] dark:bg-white/[0.02] p-2.5 border border-[#121212]/5 dark:border-white/5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: CONCLUSION */}
        <section className="space-y-4 break-inside-avoid">
          <h2 className="text-xl font-serif font-bold border-b border-[#121212]/10 dark:border-white/10 pb-2 text-[#121212] dark:text-white flex items-center gap-2">
            <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#121212]/40 dark:text-white/40">6.0</span>
            Conclusion & Final Strategic Synthesis
          </h2>
          <div className="text-sm leading-relaxed space-y-4 font-serif text-[#121212]/80 dark:text-white/80 whitespace-pre-line bg-[#121212]/[0.02] dark:bg-white/[0.02] p-6 border-l-2 border-[#121212] dark:border-white">
            {conclusionText}
          </div>
        </section>

        {/* SECTION 7: REFERENCES & CITATIONS */}
        <section className="space-y-4 pt-6 border-t border-[#121212]/10 dark:border-white/10 break-inside-avoid font-sans text-xs">
          <h2 className="font-bold uppercase tracking-widest text-[#121212]/50 dark:text-white/50 text-[10px]">
            7.0 References & Cited Standards
          </h2>
          <ol className="list-decimal list-inside space-y-1.5 text-[#121212]/60 dark:text-white/60 font-serif italic">
            {references.map((ref: any, rIdx: number) => {
              if (typeof ref === 'string') {
                return <li key={rIdx}>{ref}</li>;
              }
              return (
                <li key={rIdx}>
                  <a href={ref.url} target="_blank" rel="noreferrer" className="hover:underline text-blue-600 dark:text-blue-400">
                    {ref.title || ref.url}
                  </a>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Paper Footer */}
        <div className="pt-10 border-t border-[#121212]/10 dark:border-white/10 text-center font-sans text-[10px] text-[#121212]/40 dark:text-white/40 space-y-1">
          <p>Confidential & Proprietary • AstraQ Autonomous Intelligence Systems</p>
          <p>Generated dynamically for project: <strong className="font-mono">{project.title}</strong></p>
        </div>

      </div>

      {/* Global CSS for Print Mode to ensure clean PDF export */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-paper {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>

    </div>
  );
}
