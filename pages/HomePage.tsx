
import React, { useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { KycStatus } from '../types';
import { ArrowUpRight, X, Gift, Zap, ShieldCheck, ChevronRight, Activity, Sparkles, Wallet, Star, Sun, Moon, PackageOpen, Bell } from 'lucide-react';
import NotificationPanel from '../components/ui/NotificationPanel';

const DailyCheckInModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, handleCheckIn, canCheckIn } = useContext(UserContext);
    const rewards = ["0.2", "0.35", "0.5", "GIFT", "0.55", "0.6", "GIFT"];
    
    // Check if streak reset is pending before rendering modal
    const streak = user?.checkInStreak || 0;
    const lastCheckIn = user?.lastCheckIn ? new Date(user.lastCheckIn) : null;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0);
    
    // Virtual streak for UI display
    let displayStreak = streak;
    if (lastCheckIn) {
        const lastDate = new Date(lastCheckIn); lastDate.setHours(0,0,0,0);
        if (lastDate.getTime() < yesterday.getTime() && canCheckIn()) {
            displayStreak = 0; // It will reset on claim
        }
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-brand-gray-900 w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border border-brand-gray-100 dark:border-brand-gray-800 relative overflow-hidden">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-brand-gray-400 hover:text-brand-gray-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-brand-blue/10 rounded-[2rem] flex items-center justify-center text-brand-blue mb-4">
                        <img 
                            src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/calendar.png" 
                            alt="Daily Signin" 
                            className="w-12 h-12 object-contain" 
                            referrerPolicy="no-referrer" 
                        />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-gray-900 dark:text-white">Daily Rewards</h3>
                    <p className="text-sm text-brand-gray-500 mt-1 font-medium">Claim your Trust rewards</p>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-8">
                    {rewards.map((reward, index) => {
                        const isCompleted = index < (displayStreak % 7);
                        const isCurrent = index === (displayStreak % 7);
                        const isGift = reward === "GIFT";
                        
                        return (
                            <div key={index} className={`flex flex-col items-center py-4 rounded-3xl border transition-all duration-500 ${
                                isCurrent 
                                ? 'bg-brand-blue border-brand-blue text-white shadow-lg scale-105 z-10' 
                                : isCompleted 
                                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                                    : 'bg-brand-gray-50 dark:bg-brand-gray-800 border-transparent text-brand-gray-500'
                            }`}>
                                <span className="text-[10px] font-bold opacity-50 mb-1">Day {index + 1}</span>
                                {isGift ? (
                                    <div className="relative">
                                        <PackageOpen size={20} className={isCurrent ? 'animate-bounce' : ''} />
                                    </div>
                                ) : (
                                    <span className="text-sm font-black">{reward}</span>
                                )}
                                <span className="text-[8px] font-bold opacity-60 uppercase">{isGift ? 'Mystery' : 'Trust'}</span>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={async () => {
                        await handleCheckIn();
                        onClose();
                    }}
                    disabled={!canCheckIn()}
                    className="w-full py-4 font-black uppercase tracking-[0.1em] text-sm text-white bg-brand-blue rounded-[1.5rem] hover:brightness-110 disabled:bg-brand-gray-100 dark:disabled:bg-brand-gray-800 dark:disabled:text-brand-gray-600 shadow-xl shadow-brand-blue/20 transition-all active:scale-[0.98]"
                >
                    {canCheckIn() ? `Claim Reward` : 'Next in 24h'}
                </button>
                
                {displayStreak === 0 && user?.lastCheckIn && (
                    <p className="text-[10px] text-center text-red-500 font-bold mt-4 animate-pulse">
                        STREAK MISSED! RESTARTING FROM DAY 1
                    </p>
                )}
            </div>
        </div>
    );
};

const ZigzagLine: React.FC<{ progress: number; variant?: 'gold' | 'default' }> = ({ progress, variant = 'default' }) => {
    const width = 100;
    const height = 10;
    const points = 10;
    const step = width / points;
    let path = `M 0 ${height / 2}`;
    for (let i = 1; i <= points; i++) {
        const x = i * step;
        const y = i % 2 === 0 ? height : 0;
        path += ` L ${x} ${y}`;
    }

    const baseColor = variant === 'gold' ? 'rgba(255,255,255,0.2)' : 'rgba(59,130,246,0.1)';
    const progressColor = variant === 'gold' ? '#FFFFFF' : '#3B82F6';

    return (
        <div className="relative w-full h-4 mt-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path d={path} fill="none" stroke={baseColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <motion.path 
                    d={path} 
                    fill="none" 
                    stroke={progressColor} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: progress / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />
            </svg>
        </div>
    );
};

const WavyProgress: React.FC<{ isMining: boolean; progress: number }> = ({ isMining, progress }) => {
    return (
        <div className="w-full space-y-2">
            <div className="flex justify-between text-[10px] font-black text-brand-gray-400 uppercase tracking-widest px-1">
                <span>Protocol Sync</span>
                <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="relative h-6 w-full bg-brand-gray-100 dark:bg-brand-gray-800 rounded-full overflow-hidden">
                <motion.div 
                    className={`absolute inset-y-0 left-0 bg-brand-blue ${isMining ? 'animate-pulse' : ''}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "linear" }}
                >
                    <div className="absolute inset-0 flex items-center overflow-hidden opacity-60">
                        <span className="text-[18px] whitespace-nowrap text-white font-black tracking-[-0.2em] animate-pulse">
                            〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰〰
                        </span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const Logo = ({ className }: { className?: string }) => (
    <img src="https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png" alt="Trustrium Logo" className={className} />
);

const HomePage: React.FC = () => {
    const { 
        user, riumBalance, trustBalance, isMining, miningEndTime, startMining, 
        canCheckIn, totalMiningRate, baseMiningRate, referralMiningRate, miningTierInfo 
    } = useContext(UserContext);
    const { theme, toggleTheme } = useContext(AppContext);
    const navigate = useNavigate();
    
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [isBonusOpen, setIsBonusOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    
    const unreadCount = user?.notifications.filter(n => !n.read).length || 0;

    useEffect(() => {
        if (!isMining || !miningEndTime) {
            setTimeRemaining(0);
            return;
        }
        const interval = setInterval(() => {
            const remaining = Math.max(0, miningEndTime - Date.now());
            setTimeRemaining(remaining);
        }, 1000);
        return () => clearInterval(interval);
    }, [isMining, miningEndTime]);

    const miningProgress = miningEndTime ? Math.max(0, ((24 * 3600000 - timeRemaining) / (24 * 3600000)) * 100) : 0;
    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    return (
        <div className="container mx-auto max-w-lg flex flex-col min-h-full font-sans bg-white dark:bg-brand-gray-950 transition-colors duration-300">
            <DailyCheckInModal isOpen={isBonusOpen} onClose={() => setIsBonusOpen(false)} />
            <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            <div className="px-6 space-y-6 pt-6">
                {/* Greeting with Theme Toggle */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-gray-900 dark:text-white tracking-tight">Welcome!</h1>
                        <p className="text-brand-gray-400 font-medium text-sm">Hi @{user?.username}, have a great day.</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setIsNotificationsOpen(true)}
                            className="p-3 bg-brand-gray-100 dark:bg-brand-gray-900 rounded-2xl text-brand-gray-600 dark:text-brand-gray-200 shadow-sm border border-brand-gray-200 dark:border-brand-gray-800 active:scale-95 transition-all relative group"
                            aria-label="Notifications"
                        >
                            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-brand-gray-900 animate-pulse"></span>
                            )}
                        </button>
                        <button 
                            onClick={toggleTheme}
                            className="p-3 bg-brand-gray-100 dark:bg-brand-gray-900 rounded-2xl text-brand-gray-600 dark:text-brand-gray-200 shadow-sm border border-brand-gray-200 dark:border-brand-gray-800 active:scale-95 transition-all"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>

                {/* Box 1: Premium Balance Card with Low Transparency Logo */}
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue via-brand-blue-dark to-blue-800 rounded-[1.5rem] p-6 text-white shadow-2xl shadow-brand-blue/40 group transition-all hover:scale-[1.01]">
                    <div className="absolute -right-10 -top-10 opacity-[0.08] group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 pointer-events-none">
                        <Logo className="w-64 h-64 object-contain" />
                    </div>
                    <div className="relative z-10 space-y-5">
                        <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                            <Sparkles size={12} className="text-blue-200" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Native RIUM Asset</span>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tighter tabular-nums mb-1">
                                {riumBalance.toFixed(5)}
                            </h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xl font-bold text-blue-200 tracking-wide">$RIUM</span>
                                <div className="w-1 h-1 rounded-full bg-white/30"></div>
                                <span className="text-sm font-semibold text-white/70">≈ ${(riumBalance * 2.36).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT</span>
                            </div>
                        </div>
                        <button onClick={() => navigate('/wallet')} className="bg-white text-brand-blue px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-opacity-90 transition-all active:scale-95 shadow-xl">
                            Wallet Dashboard
                        </button>
                    </div>
                </div>

                {/* Middle Grid: Box 2 & 3 */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Box 2: Trust Card */}
                    <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[1.5rem] p-5 border border-brand-gray-100 dark:border-brand-gray-800 flex flex-col justify-between min-h-[160px] shadow-sm relative overflow-hidden group">
                        <div className="z-10">
                            <p className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest mb-1">Mining Power</p>
                            <h3 className="text-2xl font-black text-brand-gray-900 dark:text-white tabular-nums">
                                {totalMiningRate.toFixed(2)}<span className="text-xs ml-1 opacity-50">/Day</span>
                            </h3>
                        </div>
                        <div className="z-10 pt-4 border-t border-brand-gray-200 dark:border-brand-gray-800 mt-2">
                            <p className="text-[10px] font-black text-brand-blue uppercase tracking-[0.2em] mb-1">Trust</p>
                            <p className="text-2xl font-black text-brand-gray-900 dark:text-white tabular-nums truncate">
                                {trustBalance.toFixed(5)}
                            </p>
                        </div>
                        <div className="absolute right-[-20px] top-[-20px] opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
                            <Activity size={140} className="text-brand-blue" />
                        </div>
                    </div>

                    {/* Box 3: Gold Tier Card */}
                    <button 
                        onClick={() => navigate('/mine')}
                        className="bg-gradient-to-br from-[#FDB931] via-[#FFD700] to-[#CF9911] rounded-[1.5rem] p-5 border border-[#EAC04E] flex flex-col justify-between min-h-[160px] shadow-xl shadow-yellow-500/20 group text-left active:scale-95 transition-all overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                        <div className="z-10">
                            <div className="flex items-center gap-1.5 mb-1">
                                <Star size={12} className="text-white fill-white drop-shadow" />
                                <p className="text-[10px] font-black text-white/90 uppercase tracking-widest">Efficiency Tier</p>
                            </div>
                            <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow">
                                {miningTierInfo?.name || 'Novice'}
                            </h3>
                        </div>
                        <div className="z-10 space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-[8px] font-black text-white/80 uppercase">Progress</span>
                                <span className="text-[10px] font-black text-white">{miningTierInfo?.progress.toFixed(0)}%</span>
                            </div>
                            <ZigzagLine progress={miningTierInfo?.progress || 0} variant="gold" />
                            <div className="flex items-center gap-1 text-[8px] text-white/80 font-black uppercase tracking-widest mt-1">
                                View Tiers <ChevronRight size={10} />
                            </div>
                        </div>
                    </button>
                </div>

                {/* Box 4: Interactive Mining Terminal */}
                <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[2rem] p-6 border border-brand-gray-100 dark:border-brand-gray-800 relative overflow-hidden shadow-2xl">
                    <div className="flex flex-col items-center text-center space-y-10">
                        
                        {/* Unique Animated Globe Visual */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-brand-blue/10 blur-[100px] rounded-full scale-150"></div>
                            <div className="relative z-10 flex flex-col items-center">
                                <div className="relative w-56 h-56 flex items-center justify-center">
                                    {/* Rotating Ring */}
                                    <div className={`absolute inset-0 rounded-full border-4 border-dashed border-brand-blue/20 ${isMining ? 'animate-spin-slow' : 'opacity-20'}`}></div>
                                    <div className={`absolute inset-4 rounded-full border border-brand-blue/10 ${isMining ? 'animate-spin' : 'opacity-10'}`} style={{ animationDirection: 'reverse', animationDuration: '10s' }}></div>
                                    
                                    {/* Central Hub - BIG LOGO */}
                                    <div className={`relative z-10 w-32 h-32 bg-white dark:bg-brand-gray-800 rounded-full p-6 shadow-2xl border border-brand-gray-100 dark:border-brand-gray-700 flex items-center justify-center transform transition-all duration-1000 ${isMining ? 'scale-110 shadow-brand-blue/30' : 'grayscale brightness-75 rotate-12 opacity-50'}`}>
                                        <Logo className={`w-full h-full object-contain ${isMining ? 'animate-pulse' : ''}`} />
                                    </div>
                                    
                                    {/* Orbiting Widgets */}
                                    <div className={`absolute top-4 right-4 w-16 h-16 rounded-full bg-brand-blue shadow-lg flex items-center justify-center text-white transition-all duration-700 ${isMining ? 'scale-100' : 'scale-0'}`}>
                                        <Zap size={28} className="fill-white" />
                                    </div>
                                    <div className={`absolute bottom-4 left-4 w-14 h-14 rounded-2xl bg-white dark:bg-brand-gray-800 shadow-md flex items-center justify-center border border-brand-gray-100 dark:border-brand-gray-700 transition-all duration-700 ${isMining ? 'scale-100' : 'scale-0'}`}>
                                        <ShieldCheck size={24} className="text-green-500" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-brand-gray-900 dark:text-white uppercase tracking-tight">Mining Terminal</h2>
                            <p className="text-xs text-brand-gray-400 font-medium max-w-[280px] mx-auto opacity-70 italic leading-relaxed">Global consensus protocol initiated.</p>
                        </div>

                        {isMining && (
                            <div className="w-full space-y-8 pt-2">
                                <WavyProgress isMining={isMining} progress={miningProgress} />

                                <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-brand-gray-800 rounded-[1.5rem] shadow-lg border border-brand-gray-100 dark:border-brand-gray-700">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-brand-gray-400 uppercase tracking-widest mb-1">Session Ends In</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-brand-blue animate-ping"></div>
                                            <p className="text-2xl font-black text-brand-gray-900 dark:text-white tabular-nums tracking-wider">
                                                {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-[9px] font-black text-brand-gray-400 uppercase tracking-widest mb-1">Status</p>
                                        <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-4 py-1.5 rounded-full uppercase tracking-tighter">Active Node</span>
                                    </div>
                                </div>

                                {/* Rate Breakdown */}
                                <div className="grid grid-cols-3 gap-3 px-1">
                                    <div className="p-4 bg-brand-gray-100/50 dark:bg-brand-gray-800/50 rounded-2xl border border-transparent transition-all hover:bg-white dark:hover:bg-brand-gray-800 shadow-sm">
                                        <p className="text-[9px] font-black text-brand-gray-400 uppercase tracking-widest mb-1">Base</p>
                                        <p className="text-md font-black text-brand-gray-900 dark:text-white">{baseMiningRate.toFixed(2)}<span className="text-[10px] ml-0.5 opacity-50">/D</span></p>
                                    </div>
                                    <div className="p-4 bg-brand-gray-100/50 dark:bg-brand-gray-800/50 rounded-2xl border border-transparent transition-all hover:bg-white dark:hover:bg-brand-gray-800 shadow-sm relative overflow-hidden">
                                        <p className="text-[9px] font-black text-brand-gray-400 uppercase tracking-widest mb-1">Referral</p>
                                        <p className="text-md font-black text-brand-blue">+{referralMiningRate.toFixed(2)}<span className="text-[10px] ml-0.5 opacity-50">/D</span></p>
                                        {user && user.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length > 0 && (
                                            <span className="absolute -bottom-1 -right-1 text-[8px] font-black bg-brand-blue text-white px-1.5 py-0.5 rounded-tl-lg">
                                                {user.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length} Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4 bg-brand-blue/5 dark:bg-brand-blue/10 rounded-2xl border border-brand-blue/30 scale-105 shadow-xl shadow-brand-blue/10">
                                        <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest mb-1">Total</p>
                                        <p className="text-md font-black text-brand-blue">{totalMiningRate.toFixed(2)}<span className="text-[10px] ml-0.5 opacity-50">/D</span></p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-2 w-full">
                            <button 
                                onClick={startMining}
                                disabled={isMining}
                                className={`w-full py-4 rounded-[1.5rem] font-black text-lg tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group ${isMining ? 'bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-400 cursor-default' : 'bg-brand-blue text-white active:scale-95 shadow-brand-blue/40 border-b-4 border-b-brand-blue-dark active:translate-y-1 active:border-b-0'}`}
                            >
                                <span className="relative z-10">{isMining ? 'SYNTHESIS ACTIVE' : 'ACTIVATE TERMINAL'}</span>
                                {!isMining && <ArrowUpRight size={24} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Loyalty Trigger */}
            <button 
                onClick={() => setIsBonusOpen(true)}
                className="fixed bottom-28 right-6 w-16 h-16 bg-white dark:bg-brand-gray-900 rounded-[2rem] shadow-2xl border-2 border-brand-gray-100 dark:border-brand-gray-800 flex items-center justify-center text-brand-blue group transition-all active:scale-90 z-[90] hover:border-brand-blue/50 hover:scale-110"
            >
                <div className="relative">
                    <img 
                        src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/calendar.png" 
                        alt="Daily Signin" 
                        className="w-[30px] h-[30px] object-contain" 
                        referrerPolicy="no-referrer" 
                    />
                    {canCheckIn() && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full border-2 border-white dark:border-brand-gray-900 animate-pulse shadow-lg flex items-center justify-center text-[10px] font-black text-white">!</span>}
                </div>
            </button>
        </div>
    );
};

export default HomePage;
