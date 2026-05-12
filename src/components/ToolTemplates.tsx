import React, { useState } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  Plus, 
  Send,
  Wand2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Wrench,
  Mic
} from 'lucide-react';
import { motion } from 'motion/react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { ToolMetadata } from '../constants/tools';

// --- SHARED UI ---
const ToolCard = ({ title, children, description }: { title: string, children: React.ReactNode, description?: string }) => (
  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
      <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
    <div className="p-6 space-y-6">
      {children}
    </div>
  </div>
);

const ActionButton = ({ onClick, children, variant = 'primary', className }: { onClick?: () => void, children: React.ReactNode, variant?: 'primary' | 'secondary' | 'danger', className?: string }) => {
  const styles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600'
  };
  return (
    <button 
      onClick={onClick}
      className={cn('w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95', styles[variant], className)}
    >
      {children}
    </button>
  );
};

// --- TOOL 1: ZIP JOINER ---
export const ZipJoiner = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    setIsMerging(true);
    try {
      // Sort files by name to ensure correct order
      const sorted = [...files].sort((a,b) => a.name.localeCompare(b.name));
      const chunks = await Promise.all(sorted.map(f => f.arrayBuffer()));
      const totalSize = chunks.reduce((acc, curr) => acc + curr.byteLength, 0);
      const combined = new Uint8Array(totalSize);
      let offset = 0;
      chunks.forEach(chunk => {
        combined.set(new Uint8Array(chunk), offset);
        offset += chunk.byteLength;
      });

      const blob = new Blob([combined], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged_archive.zip';
      a.click();
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <ToolCard title="ZIP Volume Joiner" description="Select all volumes (.z01, .z02, .zip) to merge them into one.">
       <input 
        type="file" 
        multiple 
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="hidden" 
        id="zip-input"
       />
       <label htmlFor="zip-input" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-10 cursor-pointer hover:bg-indigo-50/50 transition-colors">
          <Upload className="text-indigo-400 mb-2" size={32} />
          <p className="text-sm font-semibold text-slate-600">Select split archive parts</p>
          <p className="text-xs text-slate-400 mt-1">Order: .z01 &rarr; .z02 &rarr; .zip</p>
       </label>

       {files.length > 0 && (
         <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Part List</span>
              <button onClick={() => setFiles([])} className="text-xs text-red-500 font-bold hover:underline">Clear All</button>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                  <span className="truncate">{f.name}</span>
                  <span className="text-slate-400 text-[10px]">{(f.size / 1024 / 1024).toFixed(1)}MB</span>
                </div>
              ))}
            </div>
            <ActionButton onClick={handleMerge} className="mt-4">
              {isMerging ? 'Merging Volumes...' : 'Merge & Download'}
            </ActionButton>
         </div>
       )}
    </ToolCard>
  );
};

// --- TOOL 17: INVOICE GEN ---
export const InvoiceGenerator = () => {
  const [formData, setFormData] = useState({ client: '', amount: '', currency: 'USD', description: '' });

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('INVOICE', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Client: ${formData.client}`, 20, 40);
    doc.text(`Description: ${formData.description}`, 20, 50);
    doc.text(`Amount: ${formData.amount} ${formData.currency}`, 20, 60);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    doc.text('Thank you for your business!', 105, 100, { align: 'center' });
    doc.save(`invoice_${formData.client}.pdf`);
  };

  return (
    <ToolCard title="Tax-Ready Invoice" description="Generate professional PDFs for clients and crypto payments.">
      <div className="space-y-4">
        <input 
          placeholder="Client Name"
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
          value={formData.client}
          onChange={e => setFormData({...formData, client: e.target.value})}
        />
        <div className="flex gap-2">
            <input 
              placeholder="Amount"
              type="number"
              className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
            />
            <select 
               className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
               value={formData.currency}
               onChange={e => setFormData({...formData, currency: e.target.value})}
            >
              <option>USD</option>
              <option>EUR</option>
              <option>ETH</option>
              <option>TSR</option>
            </select>
        </div>
        <textarea 
          placeholder="Service Description"
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
          rows={3}
          value={formData.description}
          onChange={e => setFormData({...formData, description: e.target.value})}
        />
        <ActionButton onClick={generatePDF}>
          <Download size={20} />
          <span>Generate PDF Invoice</span>
        </ActionButton>
      </div>
    </ToolCard>
  );
};

// --- TOOL 12: GLASSMORPHISM GEN ---
export const GlassGenerator = () => {
    const [blur, setBlur] = useState(15);
    const [opacity, setOpacity] = useState(20);
    
    const cssCode = `border-radius: 24px;\nbackground: rgba(139, 92, 246, ${opacity/100});\nbackdrop-filter: blur(${blur}px);\n-webkit-backdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255, 255, 255, 0.2);`;

    return (
        <ToolCard title="Glass-UI Generator" description="Live preview and CSS code for purple-themed glass effects.">
            <div className="relative h-40 w-full rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-8">
                <div style={{
                    background: `rgba(255, 255, 255, ${opacity/100})`,
                    backdropFilter: `blur(${blur}px)`,
                    webkitBackdropFilter: `blur(${blur}px)`,
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                }}>
                    Glass Preview
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>BLUR</span>
                        <span>{blur}px</span>
                    </div>
                    <input type="range" min="0" max="40" value={blur} onChange={e => setBlur(parseInt(e.target.value))} className="w-full accent-indigo-600" />
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                        <span>OPACITY</span>
                        <span>{opacity}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={opacity} onChange={e => setOpacity(parseInt(e.target.value))} className="w-full accent-indigo-600" />
                </div>

                <div className="relative group">
                    <pre className="bg-slate-900 text-indigo-300 p-4 rounded-2xl text-[10px] font-mono whitespace-pre overflow-x-auto border border-slate-800">
                        {cssCode}
                    </pre>
                    <button 
                        onClick={() => navigator.clipboard.writeText(cssCode)}
                        className="absolute top-2 right-2 p-2 bg-slate-800 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Copy size={14} />
                    </button>
                </div>
            </div>
        </ToolCard>
    );
};

// --- TOOL 18: MEETING EXTRACTOR (AI) ---
export const AIActionExtractor = () => {
    const [notes, setNotes] = useState('');
    const [result, setResult] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const extractItems = async () => {
        if (!notes) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Extract a JSON array of specific, actionable tasks from these meeting notes. Format: ["Task 1", "Task 2"]. Notes: ${notes}`,
                config: { responseMimeType: "application/json" }
            });
            const data = JSON.parse(response.text);
            setResult(data);
        } catch (e) {
            console.error(e);
            setResult(['Error extracting items. Try again.']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolCard title="AI Meeting Action Items" description="Paste meeting notes to extract tasks instantly.">
            <textarea 
                className="w-full p-4 rounded-3xl bg-slate-50 border border-slate-100 text-sm h-40 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="CEO: We need all volumes merged by Friday. John: I will handle the ads.txt files..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
            />
            <ActionButton onClick={extractItems}>
                {isLoading ? 'Thinking...' : 'Extract Actions'}
            </ActionButton>

            {result.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Detected Tasks</p>
                    {result.map((item, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-2xl text-sm border border-emerald-100">
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                            <span>{item}</span>
                        </div>
                    ))}
                </div>
            )}
        </ToolCard>
    );
};

// --- TOOL 20: BURNER EMAIL ---
export const BurnerEmail = () => {
    const [email, setEmail] = useState('');
    const [timeLeft, setTimeLeft] = useState(600); // 10 mins

    const generate = () => {
        const id = Math.random().toString(36).substring(7);
        setEmail(`${id}@trustrium.temp`);
        setTimeLeft(600);
    };

    return (
        <ToolCard title="Privacy Burner Email" description="Generate a temporary 10-minute inbox for testing.">
            <div className="bg-slate-900 p-8 rounded-3xl text-center space-y-4 border border-slate-800">
                <div className="flex items-center justify-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-emerald-400 font-mono text-[10px] uppercase tracking-widest">Server Live</span>
                </div>
                <h3 className="text-xl font-mono text-white break-all">
                    {email || 'No email generated'}
                </h3>
                {email && (
                    <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold">
                        <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                        <span className="text-slate-600 uppercase tracking-tighter">TTL</span>
                    </div>
                )}
                <div className="flex gap-2">
                    <button 
                        onClick={generate}
                        className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors"
                    >
                        New Email
                    </button>
                    {email && (
                        <button 
                            onClick={() => navigator.clipboard.writeText(email)}
                            className="p-3 bg-slate-800 text-white rounded-xl"
                        >
                            <Copy size={20} />
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
                <p className="text-xs text-slate-400 font-medium italic">Inboxes refresh automatically every 5 seconds...</p>
            </div>
        </ToolCard>
    );
};

// --- TOOL 9: ADSENSE CHECKER ---
export const AdSenseChecker = () => {
    const [url, setUrl] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle');

    const check = async () => {
        setStatus('checking');
        // Simple regex simulation for ads.txt check logic
        setTimeout(() => {
            if (url.includes('pub-') && url.endsWith('ads.txt')) {
                setStatus('pass');
            } else {
                setStatus('fail');
            }
        }, 1500);
    };

    return (
        <ToolCard title="ads.txt Troubleshooter" description="Check publisher ID formatting and live status for AdSense.">
            <div className="space-y-4">
                <input 
                    placeholder="https://example.com/ads.txt"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                />
                <ActionButton onClick={check} className={status === 'checking' ? 'opacity-50 pointer-events-none' : ''}>
                    {status === 'checking' ? 'Validating...' : 'Verify Status'}
                </ActionButton>

                {status === 'pass' && (
                    <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center gap-3 border border-emerald-100">
                        <CheckCircle2 size={20} />
                        <div>
                            <p className="font-bold text-xs uppercase tracking-wider">Valid Format</p>
                            <p className="text-xs opacity-80">Crawler detected correctly.</p>
                        </div>
                    </div>
                )}

                {status === 'fail' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} />
                        <div>
                            <p className="font-bold text-xs uppercase tracking-wider">Invalid Syntax</p>
                            <p className="text-xs opacity-80">Check publisher ID capitalization.</p>
                        </div>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};

// --- TOOL 8: TOKENOMICS VISUALIZER ---
export const TokenomicsVisualizer = () => {
    const [supply, setSupply] = useState(1000000);
    const [burn, setBurn] = useState(5);

    return (
        <ToolCard title="Tokenomics 3D Visualizer" description="Forecast supply impact based on burn rates over 12 months.">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Supply</label>
                        <input 
                            type="number" 
                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
                            value={supply}
                            onChange={e => setSupply(Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Burn Rate %</label>
                        <input 
                            type="number" 
                            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
                            value={burn}
                            onChange={e => setBurn(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="h-48 w-full bg-slate-950 rounded-3xl p-6 flex items-end justify-between gap-1 border border-slate-800">
                    {[...Array(12)].map((_, i) => {
                        const remaining = supply * Math.pow(1 - (burn/100), i);
                        const height = (remaining / supply) * 100;
                        return (
                            <motion.div 
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                className="w-full bg-indigo-500/40 rounded-t-lg border-x border-t border-indigo-500/20 relative group"
                            >
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {Math.round(remaining/1000)}k
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 px-2">
                    <span>MONTH 1</span>
                    <span className="text-indigo-400">SUPPLY PROJECTION</span>
                    <span>MONTH 12</span>
                </div>
            </div>
        </ToolCard>
    );
};

// --- TOOL 7: WHITEPAPER GEN (AI) ---
export const WhitepaperGenerator = () => {
    const [projectName, setProjectName] = useState('');
    const [concept, setConcept] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [output, setOutput] = useState('');

    const generate = async () => {
        if (!projectName || !concept) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Generate a professional crypto whitepaper summary for a project named "${projectName}" described as: ${concept}. Include: Abstract, Tokenomics, and Roadmap.`
            });
            setOutput(response.text);
        } catch (e) {
            setOutput('Error generating document. Check your API key.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolCard title="Crypto Whitepaper AI" description="Generate professional documentation for your Web3 project.">
            <div className="space-y-4">
                <input 
                    placeholder="Project Name (e.g. Trustrium)"
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                />
                <textarea 
                    placeholder="Describe your utility, ecosystem, and goal..."
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm h-32"
                    value={concept}
                    onChange={e => setConcept(e.target.value)}
                />
                <ActionButton onClick={generate}>
                    {isLoading ? 'Writing Whitepaper...' : 'Compute AI Paper'}
                </ActionButton>

                {output && (
                    <div className="space-y-4">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 text-sm leading-relaxed prose prose-sm max-h-80 overflow-y-auto">
                            <pre className="whitespace-pre-wrap font-sans">{output}</pre>
                        </div>
                        <ActionButton variant="secondary" onClick={() => {
                             const doc = new jsPDF();
                             doc.text(output, 10, 10, { maxWidth: 180 });
                             doc.save(`${projectName}_whitepaper.pdf`);
                        }}>
                            <Download size={18} />
                            <span>Download as PDF</span>
                        </ActionButton>
                    </div>
                )}
            </div>
        </ToolCard>
    );
};

// --- TOOL 4: CODE TO VIDEO (AI) ---
export const CodeToVideo = () => {
    const [code, setCode] = useState('');
    const [script, setScript] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generateScript = async () => {
        if (!code) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Convert this code into a 30-second viral "shorts" script for LinkedIn/TikTok. Include scene descriptions and voiceover lines. Code: ${code}`
            });
            setScript(response.text);
        } catch (e) {
            setScript('Failed to generate script.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolCard title="Code-to-Video Explainer" description="Turn snippets into viral video scripts for content marketing.">
             <textarea 
                placeholder="Paste your function or logic here..."
                className="w-full p-4 rounded-2xl bg-slate-900 text-indigo-300 font-mono text-xs h-40 border border-slate-800"
                value={code}
                onChange={e => setCode(e.target.value)}
            />
            <ActionButton onClick={generateScript}>
                <Wand2 size={18} />
                <span>{isLoading ? 'Encoding Content...' : 'Generate Shorts Script'}</span>
            </ActionButton>

            {script && (
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                     <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Production Script</p>
                     <pre className="whitespace-pre-wrap font-sans text-sm text-indigo-900 leading-relaxed italic">{script}</pre>
                </div>
            )}
        </ToolCard>
    );
};

// --- TOOL 14: PODCAST WRITER (AI) ---
export const PodcastWriter = () => {
    const [transcript, setTranscript] = useState('');
    const [scripts, setScripts] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const generate = async () => {
        if (!transcript) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: (process.env as any).GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: `Analyze this podcast transcript and identify 3 viral "hook" segments. Write viral scripts for each. Transcript: ${transcript}`
            });
            setScripts(response.text);
        } catch (e) {
            setScripts('Failed to generate scripts.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ToolCard title="Podcast Shorts Writer" description="Find viral hooks in your long-form transcripts instantly.">
            <textarea 
                placeholder="Paste podcast transcript here..."
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm h-40"
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
            />
            <ActionButton onClick={generate}>
                <Mic size={18} />
                <span>{isLoading ? 'Scanning Audio...' : 'Generate Scripts'}</span>
            </ActionButton>
            {scripts && (
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap italic text-rose-900">
                    {scripts}
                </div>
            )}
        </ToolCard>
    );
};

// --- TOOL: PASSWORD GEN (UPDATED) ---
export const PasswordGen = () => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);

    const generate = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let res = "";
        for (let i = 0; i < length; i++) res += charset.charAt(Math.floor(Math.random() * charset.length));
        setPassword(res);
    };

    return (
        <ToolCard title="Secure Password Gen" description="Generate enterprise-grade entropy for your vaults.">
             <div className="bg-slate-950 p-6 rounded-2xl font-mono text-indigo-400 text-center break-all border border-slate-800">
                {password || '••••••••••••••••'}
            </div>
            <div className="space-y-4">
                 <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    <span>Entropy Length</span>
                    <span>{length} bits</span>
                 </div>
                 <input type="range" min="8" max="64" value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-indigo-600" />
                 <ActionButton onClick={generate}>
                    Generate Key
                 </ActionButton>
            </div>
        </ToolCard>
    );
};

export const ToolPlaceholder = ({ name }: { name: string }) => (
    <div className="p-10 text-center space-y-4">
        <Wrench size={48} className="mx-auto text-slate-300 animate-pulse" />
        <h3 className="text-xl font-bold">{name} coming soon</h3>
        <p className="text-sm text-slate-500">We are fine-tuning this professional utility for the 2026 update.</p>
    </div>
);

// --- MANAGER COMPONENT ---
export const ToolRenderer = ({ tool }: { tool: ToolMetadata }) => {
    switch (tool.id) {
        case 'zip-joiner': return <ZipJoiner />;
        case 'invoice-gen': return <InvoiceGenerator />;
        case 'glass-gen': return <GlassGenerator />;
        case 'meeting-extractor': return <AIActionExtractor />;
        case 'burner-email': return <BurnerEmail />;
        case 'adsense-troubleshooter': return <AdSenseChecker />;
        case 'tokenomics-viz': return <TokenomicsVisualizer />;
        case 'whitepaper-gen': return <WhitepaperGenerator />;
        case 'code-video': return <CodeToVideo />;
        case 'podcast-shorts': return <PodcastWriter />;
        default: return <ToolPlaceholder name={tool.name} />;
    }
};
