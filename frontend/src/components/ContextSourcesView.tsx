import React, { useState, useRef } from 'react';
import { Plus, Trash2, Link, FileText, ArrowRight, Loader2 } from 'lucide-react';

interface ContextSourcesViewProps {
    onSubmit: (links: string[], fileContents: string[]) => void;
    onSkip: () => void;
}

export default function ContextSourcesView({ onSubmit, onSkip }: ContextSourcesViewProps) {
    const [links, setLinks] = useState<string[]>(['']);
    const [fileContents, setFileContents] = useState<{ name: string; content: string }[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddLink = () => setLinks(prev => [...prev, '']);
    const handleLinkChange = (idx: number, val: string) => {
        setLinks(prev => prev.map((l, i) => i == idx ? val : l));
    };
    const handleRemoveLink = (idx: number) => {
        setLinks(prev => prev.filter((_, i) => i != idx));
    };
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;

        setIsParsing(true);

        for (const file of files) {
            const ext = file.name.split('.').pop()?.toLowerCase();
            try {
                let text = '';

                if (ext === 'pdf') {
                    try {
                        const pdfjsLib = await import('pdfjs-dist');
                        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
                        const arrayBuffer = await file.arrayBuffer();
                        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                        const pageTexts: string[] = [];
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const content = await page.getTextContent();
                            pageTexts.push(content.items.map((item: any) => item.str).join(' '));
                        }
                        text = pageTexts.join('\n\n');
                    } catch (pdfErr) {
                        console.warn('pdfjs extraction fallback:', pdfErr);
                        text = await file.text();
                    }

                } else if (ext === 'docx' || ext === 'doc') {
                    try {
                        const mammoth = await import('mammoth');
                        const arrayBuffer = await file.arrayBuffer();
                        const result = await mammoth.extractRawText({ arrayBuffer });
                        text = result.value;
                    } catch (docErr) {
                        console.warn('docx extraction fallback:', docErr);
                        text = await file.text();
                    }

                } else {
                    text = await file.text();
                }

                setFileContents(prev => [...prev, { name: file.name, content: text }]);
            } catch (err) {
                console.error(`Failed to parse ${file.name}:`, err);
                alert(`Could not extract text from ${file.name}.`);
            }
        }
        setIsParsing(false);
    };

    const handleRemoveFile = (idx: number) => {
        setFileContents(prev => prev.filter((_, i) => i !== idx));
    };

    const handleSubmit = () => {
        const validLinks = links.filter(l => l.trim() !== '');
        const contents = fileContents.map(f => f.content);
        onSubmit(validLinks, contents);
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            <div className="space-y-2">
                <h2 className="text-2xl font-serif font-bold text-[#121212] dark:text-white">
                    Context & Sources
                </h2>
                <p className="text-sm text-[#121212]/60 dark:text-white/50">
                    Optionally provide relevant links or documents. Their content will be included in the AI prompt to ground the report with real-world context.
                </p>
            </div>

            {/* Links Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-[#121212]/60 dark:text-white/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212]/60 dark:text-white/50">
                        Relevant Links / URLs
                    </h3>
                </div>
                <div className="space-y-2">
                    {links.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input
                                type="url"
                                value={link}
                                onChange={e => handleLinkChange(idx, e.target.value)}
                                placeholder="https://example.com/article"
                                className="flex-1 px-4 py-2.5 text-sm font-mono bg-white dark:bg-white/[0.03] border border-[#121212]/10 dark:border-white/10 text-[#121212] dark:text-white placeholder:text-[#121212]/30 dark:placeholder:text-white/20 focus:outline-none focus:border-[#121212]/40 dark:focus:border-white/30 transition-colors"
                            />
                            {links.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveLink(idx)}
                                    className="p-2 text-[#121212]/40 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={handleAddLink}
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#121212]/50 dark:text-white/40 hover:text-[#121212] dark:hover:text-white transition-colors cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Another Link
                </button>
            </div>

            {/* File Upload Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#121212]/60 dark:text-white/50" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212]/60 dark:text-white/50">
                        Upload Files (.txt, .md, .csv, .pdf, .docx)
                    </h3>
                </div>

                <button
                    type="button"
                    disabled={isParsing}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#121212]/15 dark:border-white/10 p-8 flex flex-col items-center gap-3 hover:border-[#121212]/30 dark:hover:border-white/25 transition-colors cursor-pointer group disabled:opacity-50"
                >
                    {isParsing ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#121212]/60 dark:text-white/60">
                                Parsing Document Text...
                            </span>
                        </>
                    ) : (
                        <>
                            <Plus className="w-6 h-6 text-[#121212]/30 dark:text-white/20 group-hover:text-[#121212]/60 dark:group-hover:text-white/40 transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#121212]/40 dark:text-white/30 group-hover:text-[#121212]/70 dark:group-hover:text-white/50 transition-colors">
                                Click to Upload Files
                            </span>
                        </>
                    )}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {fileContents.length > 0 && (
                    <div className="space-y-2">
                        {fileContents.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between bg-white dark:bg-white/[0.02] border border-[#121212]/10 dark:border-white/10 px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-emerald-500" />
                                    <span className="text-xs font-mono text-[#121212] dark:text-white">{file.name}</span>
                                    <span className="text-[10px] text-[#121212]/40 dark:text-white/30">
                                        {(file.content.length / 1000).toFixed(1)}k chars
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(idx)}
                                    className="p-1.5 text-[#121212]/30 hover:text-red-500 dark:text-white/20 dark:hover:text-red-400 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#121212]/10 dark:border-white/10">
                <button
                    type="button"
                    onClick={onSkip}
                    className="text-xs font-bold uppercase tracking-widest text-[#121212]/40 dark:text-white/30 hover:text-[#121212] dark:hover:text-white transition-colors cursor-pointer"
                >
                    Skip — No Additional Context
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex items-center gap-2 px-6 py-3 bg-[#121212] text-white dark:bg-white dark:text-[#121212] text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
                >
                    Save Context & Continue
                    <ArrowRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
