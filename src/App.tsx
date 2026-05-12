/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Shield, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronLeft,
  Wrench,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolGrid } from './components/Navigation';
import { ToolRenderer } from './components/ToolTemplates';
import { ToolMetadata, TOOLS } from './constants/tools';
import { cn } from './lib/utils';

// --- TYPES ---
interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('trustrium_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const handleLogin = () => {
    const mockUser = { name: 'Student Admin', email: 'rashid@trustrium.com', isLoggedIn: true };
    setUser(mockUser);
    localStorage.setItem('trustrium_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedTool(null);
    localStorage.removeItem('trustrium_user');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <Shield size={48} className="mb-4 text-red-500" />
        <h1 className="text-2xl font-black italic">SYSTEM ERROR</h1>
        <p className="mt-2 text-red-200/60 text-sm font-mono">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-8 bg-white text-red-950 px-8 py-3 rounded-2xl font-bold">
          REBOOT SYSTEM
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 text-center space-y-8"
        >
          <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-600/50 rotate-3">
            <Shield size={48} className="text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tightest italic">TRUSTRIUM</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">The Utility Fortress 2026</p>
          </div>
          <div className="w-full max-w-xs mx-auto pt-8">
            <button 
              onClick={handleLogin}
              className="w-full bg-white text-slate-950 font-black py-5 rounded-3xl transition-transform active:scale-95 shadow-xl"
            >
              INITIALIZE SECURE ACCESS
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Dynamic Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center gap-4">
          {selectedTool ? (
             <button 
              onClick={() => setSelectedTool(null)}
              className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter leading-none italic text-indigo-600">
               {selectedTool ? 'UTILITY' : 'TRUSTRIUM'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
               {selectedTool ? selectedTool.name : 'Vercel Node: TLS-Security'}
            </span>
          </div>
        </div>
        
        {!selectedTool && (
           <button className="relative p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
           </button>
        )}
      </header>

      {/* Content */}
      <main className="pt-28 pb-20 px-6 max-w-4xl mx-auto min-h-screen">
        <AnimatePresence mode="wait">
          {!selectedTool ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <ToolGrid onSelect={setSelectedTool} />
            </motion.div>
          ) : (
            <motion.div
              key="tool"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="pb-10"
            >
              <ToolRenderer tool={selectedTool} />
              
              <div className="mt-12 p-8 bg-slate-900 rounded-[2.5rem] text-white">
                 <h4 className="font-black text-lg mb-2">Strategy Tip</h4>
                 <p className="text-slate-400 text-sm">Target vertical long-tail keywords for this tool. For example: "Secure {selectedTool.name} for developers".</p>
                 <div className="flex gap-2 mt-6">
                    {selectedTool.keywords.slice(0, 3).map(kw => (
                       <span key={kw} className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-500 font-bold uppercase tracking-wider">#{kw.replace(/\s/g, '')}</span>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Navigation - Bottom bar style */}
      {!selectedTool && (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-md h-20 bg-slate-950 rounded-[2.5rem] shadow-2xl flex items-center justify-around px-2 z-[60] border border-white/5">
            <BottomNavBtn active={!selectedTool} icon={<LayoutGrid />} onClick={() => setSelectedTool(null)} />
            <BottomNavBtn active={false} icon={<User />} onClick={() => setIsSidebarOpen(true)} />
            <div className="w-12 h-1 bg-slate-800 absolute bottom-3 rounded-full opacity-20" />
        </nav>
      )}

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-md z-[70]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[80] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-12">
                <span className="font-black text-2xl italic">TRUSTRIUM</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 space-y-6">
                <MenuLink icon={<User />} label="Profile Access" />
                <MenuLink icon={<Shield />} label="Security Vault" />
                <MenuLink icon={<Settings />} label="Preferences" />
                <hr className="border-slate-100" />
                <MenuLink icon={<Wrench />} label="Developer mode" />
              </div>

              <button 
                onClick={handleLogout}
                className="w-full p-5 bg-red-50 text-red-600 rounded-3xl font-black flex items-center justify-center gap-3 hover:bg-red-100 transition-colors"
              >
                <LogOut size={20} />
                <span>TERMINATE CASE</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function BottomNavBtn({ active, icon, onClick }: { active: boolean, icon: React.ReactNode, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-4 rounded-3xl transition-all relative group",
        active ? "bg-white text-slate-950" : "text-slate-500 hover:text-white"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 3 : 2 })}
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full"
        />
      )}
    </button>
  );
}

function MenuLink({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors text-slate-600 font-bold">
      <div className="p-2 bg-slate-100 rounded-xl text-slate-400">
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <span>{label}</span>
    </div>
  );
}

