import React from 'react';
import { 
  Home, 
  Search, 
  Grid, 
  Menu, 
  X,
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';
import { TOOLS, ToolMetadata } from '../constants/tools';
import { cn } from '../lib/utils';

export const ToolGrid = ({ onSelect }: { onSelect: (tool: ToolMetadata) => void }) => {
  const [search, setSearch] = React.useState('');
  
  const filtered = TOOLS.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.keywords.some(k => k.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
          Professional <span className="text-indigo-600 italic">Utilities</span>
        </h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search 20+ professional tools..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles size={14} />
            <span>2026 Strategy Update</span>
          </div>
          <h2 className="text-2xl font-black">Vertical Micro-SaaS Pack</h2>
          <p className="text-slate-400 text-sm max-w-[240px]">High-growth tools built for specialized professional workflows.</p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
          <TrendingUp size={200} strokeWidth={3} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((tool) => (
          <motion.div 
            key={tool.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(tool)}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-start gap-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="p-3 bg-slate-50 rounded-2xl">
              {React.cloneElement(tool.icon as React.ReactElement, { size: 28 })}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{tool.name}</h3>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{tool.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-slate-400">
          <Search size={40} className="mx-auto mb-4 opacity-20" />
          <p className="font-bold">No tools found matching "{search}"</p>
        </div>
      )}
    </div>
  );
};
