import React from 'react';
import { 
  FileArchive, 
  Image as ImageIcon, 
  Code, 
  FileText, 
  Globe, 
  BarChart3, 
  BadgeCheck, 
  Layout, 
  Video, 
  Mic, 
  Settings2, 
  Briefcase, 
  Coins, 
  Search,
  Wrench,
  Mail,
  Receipt,
  Users,
  ShieldCheck,
  Zap
} from 'lucide-react';

export interface ToolMetadata {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: 'file' | 'web3' | 'dev' | 'content' | 'lifestyle';
  keywords: string[];
}

export const TOOLS: ToolMetadata[] = [
  {
    id: 'zip-joiner',
    name: 'Multi-Volume Zip Joiner',
    description: 'Merge split ZIP files (.z01, .z02) into a single archive.',
    icon: <FileArchive className="text-amber-500" />,
    category: 'file',
    keywords: ['zip joiner', 'merge zip', 'split archive joiner', 'free online zip tool']
  },
  {
    id: 'image-upscaler',
    name: 'AI Image Clean Upscaler',
    description: 'Remove AI artifacts and upscale images using intelligent processing.',
    icon: <ImageIcon className="text-indigo-500" />,
    category: 'file',
    keywords: ['ai upscaler', 'clean image artifacts', 'unwatermark ai', 'hd photo enhancer']
  },
  {
    id: 'glass-mockup',
    name: 'HEIC to Glass UI Mockup',
    description: 'Convert iPhone photos into 3D glass-style marketing assets.',
    icon: <Layout className="text-pink-500" />,
    category: 'file',
    keywords: ['glassmorphism mockup', 'heic to marketing', '3d ui assets', 'glass style designer']
  },
  {
    id: 'code-video',
    name: 'Code-to-Video Explainer',
    description: 'Turn your code snippets into 30-second AI video explainer scripts.',
    icon: <Video className="text-purple-500" />,
    category: 'file',
    keywords: ['code to video', 'ai code explanation', 'developer content tool', 'code shorts']
  },
  {
    id: 'contract-humanizer',
    name: 'Web3 Contract Humanizer',
    description: 'Translate complex ABI/Hex data into readable transaction receipts.',
    icon: <Coins className="text-yellow-600" />,
    category: 'web3',
    keywords: ['web3 receipt', 'abi decoder', 'smart contract reader', 'readable transactions']
  },
  {
    id: 'domain-health',
    name: 'Web3 Domain Health',
    description: 'Check DNS, SSL, and Registry status for custom TLDs like .tsr.',
    icon: <Globe className="text-blue-500" />,
    category: 'web3',
    keywords: ['web3 dns check', '.tsr domain status', 'blockchain domain health', 'domain scanner']
  },
  {
    id: 'whitepaper-gen',
    name: 'Crypto Whitepaper AI',
    description: 'Generate professional project whitepapers using structured AI templates.',
    icon: <FileText className="text-slate-700" />,
    category: 'web3',
    keywords: ['whitepaper generator', 'crypto docs builder', 'ai project paper', 'ico whitepaper']
  },
  {
    id: 'tokenomics-viz',
    name: 'Tokenomics Visualizer',
    description: 'Input supply and burn rates to see 3D interactive growth charts.',
    icon: <BarChart3 className="text-emerald-500" />,
    category: 'web3',
    keywords: ['tokenomics chart', 'crypto supply visualizer', 'burn rate calculator', '3d crypto charts']
  },
  {
    id: 'adsense-troubleshooter',
    name: 'AdSense ads.txt Checker',
    description: 'Instantly validate your ads.txt formatting and live status.',
    icon: <BadgeCheck className="text-orange-500" />,
    category: 'dev',
    keywords: ['ads.txt checker', 'adsense troubleshooter', 'publisher id validator', 'seo audit']
  },
  {
    id: 'schema-autofixer',
    name: 'Schema Markup Auto-Fixer',
    description: 'Generate missing JSON-LD schema by scanning any webpage URL.',
    icon: <Search className="text-cyan-500" />,
    category: 'dev',
    keywords: ['schema markup generator', 'json-ld fixer', 'seo schema audit', 'structured data tool']
  },
  {
    id: 'api-doc-gen',
    name: 'Comment-to-API Doc',
    description: 'Parse code comments to generate professional GitBook-style documentation.',
    icon: <Code className="text-indigo-400" />,
    category: 'dev',
    keywords: ['api doc generator', 'code to docs', 'gitbook from comments', 'jsdoc visualizer']
  },
  {
    id: 'glass-gen',
    name: 'Tailwind Glassmorphism',
    description: 'Interactive slider tool to generate purple-themed glass CSS code.',
    icon: <Zap className="text-violet-500" />,
    category: 'dev',
    keywords: ['glassmorphism generator', 'tailwind glass css', 'ui glass designer', 'modern css tool']
  },
  {
    id: 'yt-to-li',
    name: 'YouTube to LinkedIn',
    description: 'Extract video key points into a high-converting PDF carousel deck.',
    icon: <Briefcase className="text-blue-700" />,
    category: 'content',
    keywords: ['youtube to linkedin', 'pdf carousel generator', 'video summary', 'content repurposing']
  },
  {
    id: 'podcast-shorts',
    name: 'Podcast Shorts Writer',
    description: 'Find viral segments in audio transcripts and write viral scripts.',
    icon: <Mic className="text-rose-500" />,
    category: 'content',
    keywords: ['podcast scripts', 'viral video hooks', 'audio to shorts', 'content AI']
  },
  {
    id: 'seo-meta-batcher',
    name: 'SEO Meta-Tag Batcher',
    description: 'Bulk update meta-tags and descriptions for high-volume SEO growth.',
    icon: <Settings2 className="text-slate-600" />,
    category: 'content',
    keywords: ['bulk meta tags', 'seo batch editor', 'meta description generator', 'seo scaler']
  },
  {
    id: 'wardrobe-planner',
    name: '3D Wardrobe Planner',
    description: 'Visualize furniture layouts and room colors on your own photos.',
    icon: <Layout className="text-orange-600" />,
    category: 'lifestyle',
    keywords: ['wardrobe planner', 'room visualizer', '3d furniture layout', 'interior design app']
  },
  {
    id: 'invoice-gen',
    name: 'Tax-Ready Invoices',
    description: 'Generate multi-currency and crypto invoices ready for tax filing.',
    icon: <Receipt className="text-emerald-600" />,
    category: 'lifestyle',
    keywords: ['crypto invoice', 'tax ready invoices', 'freelance billing', 'multi-currency bills']
  },
  {
    id: 'meeting-extractor',
    name: 'AI meeting Item Extractor',
    description: 'Sync action items from meeting notes directly to Trello or Notion.',
    icon: <Users className="text-indigo-600" />,
    category: 'lifestyle',
    keywords: ['meeting notes ai', 'action items extractor', 'notion sync tools', 'productive meeting']
  },
  {
    id: 'job-scraper',
    name: 'Local Job Board UI',
    description: 'Aggregates regional job boards into a single high-performance interface.',
    icon: <Briefcase className="text-slate-800" />,
    category: 'lifestyle',
    keywords: ['job board aggregator', 'regional jobs search', 'lahore jobs finder', 'hiring dashboard']
  },
  {
    id: 'burner-email',
    name: 'Privacy Burner Email',
    description: 'Temporary high-security inboxes for safe testing and AdSense signup.',
    icon: <Mail className="text-red-500" />,
    category: 'lifestyle',
    keywords: ['burner email', 'temporary mailbox', 'privacy email', 'fake email generator']
  }
];
