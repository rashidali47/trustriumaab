

import React, { useContext, useEffect, useState, useRef } from 'react';
import { UserContext, MiningTierInfo } from '../contexts/UserContext';
import { Pickaxe, TrendingUp, History, CheckCircle, ChevronDown, ChevronUp, Star, Zap, Users, Gift, Coins } from 'lucide-react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { motion } from 'motion/react';

const CLAY_CLASSES = "bg-white dark:bg-brand-gray-900 rounded-[2rem] shadow-[8px_8px_16px_0_rgba(0,0,0,0.05),inset_-8px_-8px_12px_0_rgba(0,0,0,0.05),inset_8px_8px_12px_0_rgba(255,255,255,0.8)] dark:shadow-[8px_8px_16px_0_rgba(0,0,0,0.4),inset_-8px_-8px_12px_0_rgba(0,0,0,0.4),inset_8px_8px_12px_0_rgba(255,255,255,0.05)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]";

const StatCard: React.FC<{ 
    title: string; 
    value: string | number | null; 
    icon: React.ElementType; 
    unit?: string; 
    color: string;
    isLoading: boolean;
}> = ({ title, value, icon: Icon, unit, color, isLoading }) => (
    <div className={`p-5 ${CLAY_CLASSES} relative overflow-hidden group border-none`}>
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={48} />
        </div>
        <div className="relative z-10">
            <p className="text-xs font-bold text-brand-gray-500 dark:text-brand-gray-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Icon size={12} /> {title}
            </p>
            {isLoading ? (
                <div className="h-8 bg-brand-gray-200 dark:bg-brand-gray-800 rounded-xl animate-pulse w-24 mt-1"></div>
            ) : (
                <div className="flex items-baseline gap-1">
                    <h3 className="text-xl font-black text-brand-gray-900 dark:text-white tracking-tight">
                        {typeof value === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) : value}
                    </h3>
                    {unit && <span className="text-xs font-bold text-brand-blue">{unit}</span>}
                </div>
            )}
        </div>
    </div>
);

const MiningTiersTable: React.FC<{ miningTierInfo: MiningTierInfo | null }> = ({ miningTierInfo }) => {
    const TIERS = [
        { tier: 1, name: 'Genesis', sessionsRequired: 0, reward: 0, iconColor: 'text-brand-gray-400' },
        { tier: 2, name: 'Alpha', sessionsRequired: 10, reward: 2, iconColor: 'text-yellow-600' },
        { tier: 3, name: 'Beta', sessionsRequired: 30, reward: 5, iconColor: 'text-blue-500' },
        { tier: 4, name: 'Growth', sessionsRequired: 60, reward: 10, iconColor: 'text-blue-400' },
        { tier: 5, name: 'Expansion', sessionsRequired: 100, reward: 25, iconColor: 'text-red-500' },
        { tier: 6, name: 'Global', sessionsRequired: 150, reward: 50, iconColor: 'text-orange-500' },
    ];

    if (!miningTierInfo) return null;

    return (
        <div className="space-y-2">
            {TIERS.map(tier => {
                const isCurrent = miningTierInfo.tier === tier.tier;
                const isAchieved = miningTierInfo.tier > tier.tier;
                const progress = isCurrent ? miningTierInfo.progress : (isAchieved ? 100 : 0);

                return (
                    <div key={tier.tier} className={`p-3 rounded-lg transition-all ${isCurrent ? 'bg-brand-blue/20 border-2 border-brand-blue' : 'bg-brand-gray-100 dark:bg-brand-gray-800'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Star size={20} className={`mr-3 ${tier.iconColor}`} fill={miningTierInfo.tier >= tier.tier ? 'currentColor' : 'none'} />
                                <div>
                                    <p className="font-bold">{tier.name} (Tier {tier.tier})</p>
                                    <p className="text-xs text-brand-gray-500">Requires {tier.sessionsRequired} sessions</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-500">+{tier.reward} Trust</p>
                                <p className="text-xs text-brand-gray-500">Reward</p>
                            </div>
                        </div>
                        <div className="mt-2">
                            <div className="w-full bg-brand-gray-200 dark:bg-brand-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-brand-blue-light to-brand-blue h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                            </div>
                            {isCurrent && !miningTierInfo.isMaxTier &&
                                <p className="text-xs text-right text-brand-gray-500 mt-1">{progress.toFixed(0)}% to next tier</p>
                            }
                        </div>
                    </div>
                )
            })}
        </div>
    );
};


const MiningHistory: React.FC<{ transactions: Transaction[], miningSessionsCompleted: number }> = ({ transactions, miningSessionsCompleted }) => {
    // Fix: Simplified filter logic as daily check-ins are no longer of 'mining' type.
    const miningSessions = transactions.filter(tx => tx.type === 'mining');
    const totalTrustMined = miningSessions.reduce((sum, tx) => sum + tx.amountTrust, 0);

    return (
        <div className="space-y-3">
            <div className="bg-brand-gray-100 dark:bg-brand-gray-800 p-4 rounded-lg mb-4 grid grid-cols-2 gap-4 text-center">
                <div>
                    <p className="text-brand-gray-500 dark:text-brand-gray-400 text-sm">Sessions Completed</p>
                    <p className="font-bold text-xl text-brand-blue">{miningSessionsCompleted}</p>
                </div>
                <div>
                    <p className="text-brand-gray-500 dark:text-brand-gray-400 text-sm">Total Trust Mined</p>
                    <p className="font-bold text-xl text-green-500">{totalTrustMined.toFixed(2)}</p>
                </div>
            </div>
            <div className="max-h-60 overflow-y-auto pr-2">
                {miningSessions.length > 0 ? miningSessions.map(session => (
                    <div key={session.id} className="p-3 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-lg mb-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <CheckCircle size={20} className="mr-3 text-green-500 shrink-0" />
                                <div>
                                    <p className="font-semibold">Session Completed</p>
                                    <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">{new Date(session.date).toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-500">+{session.amountTrust.toFixed(2)}</p>
                                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">Trust</p>
                            </div>
                        </div>
                        {(session.miningTier || session.miningRate) && (
                            <div className="mt-2 pt-2 border-t border-brand-gray-200 dark:border-brand-gray-700 flex justify-between items-center text-xs text-brand-gray-500 dark:text-brand-gray-400">
                                {session.miningTier && (
                                    <span className="flex items-center gap-1">
                                        <Star size={12} /> Tier: <strong>{session.miningTier}</strong>
                                    </span>
                                )}
                                {session.miningRate !== undefined && (
                                    <span className="flex items-center gap-1">
                                        <Zap size={12} /> Rate: <strong>{session.miningRate?.toFixed(3)}/Day</strong>
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )) : (
                    <p className="text-center text-brand-gray-500 py-8">No completed mining sessions yet.</p>
                )}
            </div>
        </div>
    );
}


const WaterBar = (props: any) => {
    const { x, y, width, height, index, activeIndex, totalUsers, data } = props;
    const isActive = index === activeIndex;
    const isCompleted = index < activeIndex;
    
    let fillPercent = 0;
    if (isCompleted) {
        fillPercent = 100;
    } else if (isActive) {
        const prevThreshold = index === 0 ? 0 : data[index-1].threshold;
        const range = data[index].threshold - prevThreshold;
        fillPercent = Math.min(100, ((totalUsers - prevThreshold) / range) * 100);
    }

    return (
        <g>
            {/* Background Bar */}
            <rect x={x} y={y} width={width} height={height} fill="#E2E8F0" rx={4} ry={4} className="dark:fill-brand-gray-800" />
            
            {/* Liquid Fill */}
            <mask id={`trustrium-mask-${index}`}>
                <rect x={x} y={y} width={width} height={height} fill="white" rx={4} ry={4} />
            </mask>
            
            <motion.rect 
                x={x} 
                y={y + height * (1 - fillPercent / 100)} 
                width={width} 
                height={height * (fillPercent / 100)} 
                fill={isActive ? "url(#waterGradient)" : "#fef3c7"}
                mask={`url(#trustrium-mask-${index})`}
                animate={{ height: height * (fillPercent / 100), y: y + height * (1 - fillPercent / 100) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />

            {isActive && (
                <motion.path
                    d={`M ${x} ${y + height * (1 - fillPercent / 100)} Q ${x + width/4} ${y + height * (1 - fillPercent / 100) - 4} ${x + width/2} ${y + height * (1 - fillPercent / 100)} T ${x + width} ${y + height * (1 - fillPercent / 100)}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="2"
                    animate={{
                        d: [
                            `M ${x} ${y + height * (1 - fillPercent / 100)} Q ${x + width/4} ${y + height * (1 - fillPercent / 100) - 4} ${x + width/2} ${y + height * (1 - fillPercent / 100)} T ${x + width} ${y + height * (1 - fillPercent / 100)}`,
                            `M ${x} ${y + height * (1 - fillPercent / 100)} Q ${x + width/4} ${y + height * (1 - fillPercent / 100) + 4} ${x + width/2} ${y + height * (1 - fillPercent / 100)} T ${x + width} ${y + height * (1 - fillPercent / 100)}`,
                            `M ${x} ${y + height * (1 - fillPercent / 100)} Q ${x + width/4} ${y + height * (1 - fillPercent / 100) - 4} ${x + width/2} ${y + height * (1 - fillPercent / 100)} T ${x + width} ${y + height * (1 - fillPercent / 100)}`,
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}
        </g>
    );
};

const TrustriumChart = () => {
    const { totalUsers } = useContext(UserContext);
    
    const data = [
        { name: '1K', value: 12, threshold: 1000, label: '12', tier: 'Tier 1' },
        { name: '10K', value: 6, threshold: 10000, label: '6', tier: 'Tier 2' },
        { name: '100K', value: 3, threshold: 100000, label: '3', tier: 'Tier 3' },
        { name: '1M', value: 1.50, threshold: 1000000, label: '1.50', tier: 'Tier 4' },
        { name: '10M', value: 0.75, threshold: 10000000, label: '0.75', tier: 'Tier 5' },
        { name: '>10M', value: 0.375, threshold: 100000000, label: '0.375', tier: 'Tier 6' },
    ];

    // Determine current step and progress within that step
    const currentStepIndex = data.findIndex((d, i) => {
        const prevThreshold = i === 0 ? 0 : data[i-1].threshold;
        return totalUsers >= prevThreshold && totalUsers < d.threshold;
    });
    
    const activeIndex = currentStepIndex === -1 ? data.length - 1 : currentStepIndex;

    return (
        <div className="w-full bg-white dark:bg-brand-gray-900 rounded-2xl p-4 shadow-sm border border-brand-gray-100 dark:border-brand-gray-800">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="font-bold text-brand-gray-800 dark:text-white">Trustrium Chart</h3>
                        <p className="text-[10px] text-brand-gray-500 font-bold">{totalUsers.toLocaleString()} Total Users</p>
                    </div>
                </div>
                <div className="px-3 py-1 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-full">
                    <p className="text-[10px] font-bold text-brand-gray-500 uppercase tracking-wider">Deflationary Model</p>
                </div>
            </div>

            <div className="h-64 w-full relative">
                <svg width="0" height="0" className="absolute">
                    <defs>
                        <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                    </defs>
                </svg>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                            label={{ value: 'Users growth scale', position: 'bottom', offset: 0, fontSize: 10, fill: '#94a3b8', fontWeight: 500 }}
                        />
                        <YAxis 
                            axisLine={false} 
                            tick={false}
                            label={{ value: 'Trustrium (Trust/Day)', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: '#94a3b8', fontWeight: 700 }}
                        />
                        <Tooltip 
                            cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white dark:bg-brand-gray-800 p-2 shadow-lg rounded-lg border border-brand-gray-100 dark:border-brand-gray-700">
                                            <p className="text-xs font-bold text-amber-600">{payload[0].payload.tier}</p>
                                            <p className="text-sm font-bold">{payload[0].value} Trust/Day</p>
                                            <p className="text-[9px] text-brand-gray-500">Threshold: {payload[0].payload.threshold.toLocaleString()}</p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="value" shape={<WaterBar activeIndex={activeIndex} totalUsers={totalUsers} data={data} />} barSize={40} isAnimationActive={false}>
                            <LabelList dataKey="label" position="top" style={{ fontSize: 10, fontWeight: 800, fill: '#475569' }} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>

                {/* NOW Indicator */}
                <div 
                    className="absolute top-[55%] -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-1000"
                    style={{ left: `${(activeIndex / (data.length - 1)) * 80 + 10}%` }}
                >
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[1px] rounded-md shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    >
                        <div className="bg-white dark:bg-brand-gray-900 px-2 py-0.5 rounded-[5px]">
                            <span className="text-[10px] font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-500 to-amber-700">NOW</span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

const MinePage: React.FC = () => {
    const { user, isMining, miningEndTime, totalMiningRate, baseMiningRate, referralMiningRate, transactions, startMining, totalUsers, circulatingSupply, isAuthLoading, isGuest, setShowGuestModal } = useContext(UserContext);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [rateIncreased, setRateIncreased] = useState(false);
    const [showTiers, setShowTiers] = useState(false);
    const [showHistory, setShowHistory] = useState(true);
    const prevRateRef = useRef(totalMiningRate);

    const progress = miningEndTime ? Math.max(0, ((24 * 3600000 - timeRemaining) / (24 * 3600000)) * 100) : 0;

    useEffect(() => {
        if (totalMiningRate > prevRateRef.current) {
            setRateIncreased(true);
            const timer = setTimeout(() => setRateIncreased(false), 800); // Animation duration
            return () => clearTimeout(timer);
        }
        prevRateRef.current = totalMiningRate;
    }, [totalMiningRate]);

    useEffect(() => {
        if (!isMining || !miningEndTime) {
            setTimeRemaining(0);
            return;
        }

        const interval = setInterval(() => {
            const remaining = Math.max(0, miningEndTime - Date.now());
            setTimeRemaining(remaining);
            if (remaining === 0) {
                clearInterval(interval);
            }
        }, 1000);

        setTimeRemaining(Math.max(0, miningEndTime - Date.now()));
        return () => clearInterval(interval);
    }, [isMining, miningEndTime]);

    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    const { miningTierInfo } = useContext(UserContext); // Added to pass to MiningTiersTable

    const handleStartMining = () => {
        if (isGuest) {
            setShowGuestModal(true);
            return;
        }
        startMining();
    };

    return (
        <div className="container mx-auto max-w-lg p-4 space-y-6 pb-24">
            {/* Header with Logo */}
            <div className="flex flex-col items-center justify-center pt-4 pb-2">
                <h1 className="text-xl font-black tracking-tight text-brand-gray-800 dark:text-white">TRUSTRIUM</h1>
            </div>

            {/* Ecosystem Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <StatCard 
                    title="Circulating Supply" 
                    value={circulatingSupply} 
                    unit="$RIUM"
                    icon={Coins} 
                    color="text-brand-blue"
                    isLoading={isAuthLoading}
                />
                <StatCard 
                    title="Total Miners" 
                    value={totalUsers} 
                    icon={Users} 
                    color="text-blue-500"
                    isLoading={isAuthLoading}
                />
            </div>

            {/* Trustrium Chart */}
            <TrustriumChart />

            <div className="p-6 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg flex flex-col items-center justify-center space-y-4 border border-brand-gray-100 dark:border-brand-gray-800">
                <div className="relative w-36 h-36">
                    <div style={{ background: `conic-gradient(#3B82F6 ${progress}%, transparent ${progress}%)`}} className="w-full h-full rounded-full flex items-center justify-center transition-all duration-500">
                        <div className="absolute w-full h-full rounded-full bg-brand-gray-200 dark:bg-brand-gray-800" style={{ transform: 'scale(0.98)' }}></div>
                         <div className="absolute w-[85%] h-[85%] bg-white dark:bg-brand-gray-900 rounded-full flex flex-col items-center justify-center text-center">
                            <Pickaxe size={32} className={`transition-colors duration-500 ${isMining ? 'text-brand-blue animate-pulse' : 'text-brand-gray-400'}`} />
                             <p className="text-xl font-bold text-brand-gray-800 dark:text-white mt-2">
                                { isMining 
                                    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` 
                                    : 'Inactive'
                                }
                            </p>
                            <p className="text-sm text-brand-gray-500">{isMining ? 'Remaining' : 'Session Ended'}</p>
                         </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-sm font-medium text-brand-gray-500 dark:text-brand-gray-400">Total Mining Rate</p>
                    <p className={`flex items-center justify-center text-2xl font-bold my-1 text-green-500 transition-all duration-300 ${rateIncreased ? 'animate-rate-increase-pulse' : ''}`}>
                         <Zap size={24} className="mr-2"/> {totalMiningRate.toFixed(3)}
                         <span className="text-lg font-semibold ml-2 text-brand-gray-500">Trust/Day</span>
                    </p>
                </div>
                 
                <div className="flex justify-around w-full pt-4 border-t border-brand-gray-200 dark:border-brand-gray-700">
                     <div className="text-center">
                        <p className="text-sm font-medium text-brand-gray-500 dark:text-brand-gray-400">Base Rate</p>
                        <p className="text-lg font-bold text-blue-500">
                            {baseMiningRate.toFixed(3)}<span className="text-xs ml-1 opacity-50">/Day</span>
                        </p>
                    </div>
                     <div className="text-center">
                        <p className="text-sm font-medium text-brand-gray-500 dark:text-brand-gray-400">Team Bonus</p>
                        <p className="text-lg font-bold text-brand-blue">
                            +{referralMiningRate.toFixed(3)}<span className="text-xs ml-1 opacity-50">/Day</span>
                        </p>
                    </div>
                </div>

                {!isMining && (
                    <button 
                        onClick={handleStartMining}
                        className="w-full py-4 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg shadow-brand-blue/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <Zap size={20} fill="currentColor" />
                        START MINING
                    </button>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg">
                <button onClick={() => setShowTiers(!showTiers)} className="w-full flex justify-between items-center text-left">
                    <h3 className="text-lg font-bold flex items-center"><TrendingUp size={20} className="mr-2 text-brand-blue" /> Mining Tiers</h3>
                    {showTiers ? <ChevronUp /> : <ChevronDown />}
                </button>
                {showTiers && (
                    <div className="mt-4 border-t border-brand-gray-200 dark:border-brand-gray-700 pt-4">
                        <p className="text-sm text-brand-gray-500 mb-4">Complete 24-hour mining sessions to advance to higher tiers and increase your base mining rate.</p>
                        <MiningTiersTable miningTierInfo={miningTierInfo} />
                    </div>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg">
                <button onClick={() => setShowHistory(!showHistory)} className="w-full flex justify-between items-center text-left">
                    <h3 className="text-lg font-bold flex items-center"><History size={20} className="mr-2 text-brand-blue" /> Mining History</h3>
                    {showHistory ? <ChevronUp /> : <ChevronDown />}
                </button>
                {showHistory && (
                    <div className="mt-4 border-t border-brand-gray-200 dark:border-brand-gray-700 pt-4">
                        <MiningHistory 
                            transactions={transactions} 
                            miningSessionsCompleted={user?.miningSessionsCompleted ?? 0}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MinePage;