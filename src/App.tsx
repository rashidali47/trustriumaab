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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- TYPES ---
interface UserProfile {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Mock checking for auth - in a real app, check your persistent storage
  useEffect(() => {
    // Check if we are running in an Android container
    const isNative = (window as any).Capacitor?.isNative;
    console.log('Running on Native:', !!isNative);
    
    // Simulate auth check
    const savedUser = localStorage.getItem('trustrium_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = () => {
    // In a real app, redirect to your auth provider
    const mockUser = { name: 'Student Admin', email: 'rashid@trustrium.com', isLoggedIn: true };
    setUser(mockUser);
    localStorage.setItem('trustrium_user', JSON.stringify(mockUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('trustrium_user');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/50">
            <Shield size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Trustrium</h1>
          <p className="text-slate-400 mt-2">Secure Mobile Access</p>
        </motion.div>

        <div className="w-full max-w-sm space-y-4">
          <button 
            id="login-button"
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            Connect to trustrium.com
          </button>
          <p className="text-xs text-slate-500 mt-4 px-4 leading-relaxed">
            By logging in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      {/* Mobile Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-50">
        <button 
          id="menu-toggle"
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg tracking-tight text-indigo-600">Trustrium</span>
        <button 
          id="notification-bell"
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative"
        >
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-24 px-4 max-w-2xl mx-auto">
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold mb-1">Welcome back, {user.name}</h2>
              <p className="text-slate-500 text-sm">Your security status is healthy</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <DashboardCard icon={<Shield className="text-green-500" />} label="Identity" value="98%" />
              <DashboardCard icon={<Settings className="text-blue-500" />} label="Devices" value="2 Active" />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-slate-700 ml-1">Recent Activity</h3>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 rounded-xl flex items-center justify-between border border-slate-200 shadow-sm active:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <Search size={18} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Login from Chrome</p>
                      <p className="text-xs text-slate-400">2 hours ago</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Other tabs can go here */}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex items-center justify-around px-2 z-40">
        <NavButton active={activeTab === 'home'} icon={<Home />} label="Home" onClick={() => setActiveTab('home')} />
        <NavButton active={activeTab === 'profile'} icon={<User />} label="Profile" onClick={() => setActiveTab('profile')} />
        <NavButton active={activeTab === 'settings'} icon={<Settings />} label="Settings" onClick={() => setActiveTab('settings')} />
      </nav>

      {/* Sidebar Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[70] shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="font-bold text-xl">Menu</span>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <MenuLink icon={<User />} label="Account Settings" />
                <MenuLink icon={<Shield />} label="Security Privacy" />
                <hr className="border-slate-100 my-4" />
                <button 
                  id="logout-button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 text-red-500 font-medium p-3 w-full hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
      <div className="mb-3">{icon}</div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 w-20 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 font-medium'}`}
    >
      <div className={`p-1 rounded-lg ${active ? 'bg-indigo-50' : ''}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function MenuLink({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors text-slate-600 font-medium">
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      <span>{label}</span>
    </div>
  );
}

