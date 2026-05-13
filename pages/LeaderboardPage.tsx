
import React, { useContext, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Trophy, Medal, ChevronLeft, Search, TrendingUp, Award, Users, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const LeaderboardPage: React.FC = () => {
    const { leaderboards, user } = useContext(UserContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'global' | 'referral' | 'holders'>('global');
    const [searchQuery, setSearchQuery] = useState('');

    const displayData = activeTab === 'global' ? leaderboards.rium : activeTab === 'referral' ? leaderboards.referrals : leaderboards.holders;
    const unit = activeTab === 'global' ? 'Trust' : activeTab === 'referral' ? 'Refs' : '$RIUM';
    const maxDigits = activeTab === 'referral' ? 0 : activeTab === 'holders' ? 4 : 2;
    
    const filteredData = displayData.filter(u => 
        u.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const topThree = filteredData.slice(0, 3);
    const others = filteredData.slice(3);

    // Calculate my rank or show fallback
    const myRankInList = displayData.find(u => u.username === user?.username);
    const myRank = myRankInList || { 
        rank: '250+', 
        username: user?.username, 
        value: activeTab === 'global' ? (user?.totalTrustEarned || 0) : activeTab === 'referral' ? (user?.referrals || 0) : (user?.riumBalance || 0) 
    };

    return (
        <div className="min-h-screen bg-brand-gray-50 dark:bg-brand-gray-950 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-brand-gray-900/80 backdrop-blur-lg border-b border-brand-gray-100 dark:border-brand-gray-800 px-4 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 rounded-full transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight">LEADERBOARD</h1>
                    <div className="w-10"></div> {/* Spacer */}
                </div>
            </div>

            <div className="container mx-auto max-w-lg p-4 space-y-6">
                {/* Tabs */}
                <div className="flex p-1 bg-brand-gray-200 dark:bg-brand-gray-800 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('global')}
                        className={`flex-1 py-2.5 text-[10px] font-black tracking-widest rounded-xl transition-all ${activeTab === 'global' ? 'bg-white dark:bg-brand-gray-700 text-brand-blue shadow-sm' : 'text-brand-gray-500'}`}
                    >
                        MINERS
                    </button>
                    <button 
                        onClick={() => setActiveTab('referral')}
                        className={`flex-1 py-2.5 text-[10px] font-black tracking-widest rounded-xl transition-all ${activeTab === 'referral' ? 'bg-white dark:bg-brand-gray-700 text-brand-blue shadow-sm' : 'text-brand-gray-500'}`}
                    >
                        REFERRERS
                    </button>
                    <button 
                        onClick={() => setActiveTab('holders')}
                        className={`flex-1 py-2.5 text-[10px] font-black tracking-widest rounded-xl transition-all ${activeTab === 'holders' ? 'bg-white dark:bg-brand-gray-700 text-brand-blue shadow-sm' : 'text-brand-gray-500'}`}
                    >
                        HOLDERS
                    </button>
                </div>

                {/* Top 3 Podium */}
                <div className="flex items-end justify-center gap-2 pt-8 pb-4 min-h-[320px]">
                    {filteredData.length > 0 ? (
                        <>
                            {/* 2nd Place */}
                            {topThree[1] && (
                                <motion.div 
                                    key={`rank-2-${activeTab}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-2">
                                        <div className="w-16 h-16 rounded-full border-4 border-brand-gray-300 overflow-hidden bg-white">
                                            <img src={topThree[1].avatar} alt={topThree[1].username} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-gray-300 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-brand-gray-900">
                                            2
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold truncate w-20 text-center">{topThree[1].username}</p>
                                    <p className="text-[10px] text-brand-blue font-black">{topThree[1].value.toLocaleString(undefined, { maximumFractionDigits: maxDigits })} {unit}</p>
                                    <div className="w-20 h-24 bg-gradient-to-t from-brand-gray-200 to-brand-gray-100 dark:from-brand-gray-800 dark:to-brand-gray-700 rounded-t-xl mt-2 flex items-start justify-center pt-2">
                                        <Medal size={20} className="text-brand-gray-400" />
                                    </div>
                                </motion.div>
                            )}

                            {/* 1st Place */}
                            {topThree[0] && (
                                <motion.div 
                                    key={`rank-1-${activeTab}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center z-10"
                                >
                                    <div className="relative mb-4">
                                        <motion.div 
                                            animate={{ rotate: [0, 10, -10, 0] }}
                                            transition={{ repeat: Infinity, duration: 4 }}
                                            className="absolute -top-10 left-1/2 -translate-x-1/2"
                                        >
                                            <img 
                                                src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/trophy.png" 
                                                alt="Winner" 
                                                className="w-12 h-12 object-contain drop-shadow-xl dark:brightness-125 dark:drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                                                referrerPolicy="no-referrer"
                                            />
                                        </motion.div>
                                        <div className="w-24 h-24 rounded-full border-4 border-yellow-500 overflow-hidden bg-white shadow-xl shadow-yellow-500/20">
                                            <img src={topThree[0].avatar} alt={topThree[0].username} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold border-4 border-white dark:border-brand-gray-900">
                                            1
                                        </div>
                                    </div>
                                    <p className="text-sm font-black truncate w-24 text-center">{topThree[0].username}</p>
                                    <p className="text-xs text-brand-blue font-black">{topThree[0].value.toLocaleString(undefined, { maximumFractionDigits: maxDigits })} {unit}</p>
                                    <div className="w-24 h-32 bg-gradient-to-t from-yellow-500/20 to-yellow-500/10 dark:from-yellow-500/10 dark:to-yellow-500/5 border-x border-t border-yellow-500/30 rounded-t-2xl mt-2 flex items-start justify-center pt-4">
                                        <Star size={24} className="text-yellow-500" fill="currentColor" />
                                    </div>
                                </motion.div>
                            )}

                            {/* 3rd Place */}
                            {topThree[2] && (
                                <motion.div 
                                    key={`rank-3-${activeTab}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="relative mb-2">
                                        <div className="w-16 h-16 rounded-full border-4 border-orange-400 overflow-hidden bg-white">
                                            <img src={topThree[2].avatar} alt={topThree[2].username} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-brand-gray-900">
                                            3
                                        </div>
                                    </div>
                                    <p className="text-xs font-bold truncate w-20 text-center">{topThree[2].username}</p>
                                    <p className="text-[10px] text-brand-blue font-black">{topThree[2].value.toLocaleString(undefined, { maximumFractionDigits: maxDigits })} {unit}</p>
                                    <div className="w-20 h-20 bg-gradient-to-t from-orange-500/20 to-orange-500/10 dark:from-orange-500/10 dark:to-orange-500/5 border-x border-t border-orange-500/30 rounded-t-xl mt-2 flex items-start justify-center pt-2">
                                        <Medal size={20} className="text-orange-500" />
                                    </div>
                                </motion.div>
                            )}
                        </>
                    ) : (
                        <div className="w-full text-center py-12 text-brand-gray-500">
                            No data found for this category.
                        </div>
                    )}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800 focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all"
                    />
                </div>

                {/* List */}
                <div className="bg-white dark:bg-brand-gray-900 rounded-3xl overflow-hidden border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm">
                    <div className="p-4 border-b border-brand-gray-100 dark:border-brand-gray-800 flex justify-between items-center bg-brand-gray-50/50 dark:bg-brand-gray-800/50">
                        <p className="text-[10px] font-black tracking-widest text-brand-gray-400 uppercase">Rank & User</p>
                        <p className="text-[10px] font-black tracking-widest text-brand-gray-400 uppercase">{activeTab === 'global' ? 'Trust Points' : activeTab === 'referral' ? 'Referrals' : '$RIUM Balance'}</p>
                    </div>
                    <div className="divide-y divide-brand-gray-50 dark:divide-brand-gray-800">
                        {others.length > 0 ? others.map((u, idx) => (
                            <motion.div 
                                key={`${u.username}-${idx}`}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                                className="flex items-center justify-between p-4 hover:bg-brand-gray-50 dark:hover:bg-brand-gray-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="w-6 text-sm font-black text-brand-gray-400">#{u.rank}</span>
                                    <div className="w-10 h-10 rounded-full border border-brand-gray-100 dark:border-brand-gray-800 overflow-hidden">
                                        <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{u.username}</p>
                                        <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                                            <TrendingUp size={10} />
                                            Active
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-brand-blue">{u.value.toLocaleString(undefined, { maximumFractionDigits: maxDigits })}</p>
                                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">{unit}</p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="p-8 text-center text-brand-gray-500 text-sm italic">
                                {searchQuery ? 'No users match your search.' : 'More rankings coming soon...'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* My Rank Sticky Footer */}
            <div className="fixed bottom-20 left-0 right-0 px-4 z-40">
                <div className="max-w-lg mx-auto bg-brand-blue text-white p-4 rounded-3xl shadow-2xl shadow-brand-blue/40 flex items-center justify-between border border-white/20 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden bg-white/10">
                            <img src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} alt="Me" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black tracking-widest opacity-70 uppercase">Your Rank</p>
                            <p className="font-black text-lg">#{myRank.rank} <span className="text-xs font-bold opacity-80 ml-1">{user?.username}</span></p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black tracking-widest opacity-70 uppercase">{activeTab === 'global' ? 'Total Trust' : activeTab === 'referral' ? 'Total Referrals' : 'Total $RIUM'}</p>
                        <p className="font-black text-lg">{myRank.value.toLocaleString(undefined, { maximumFractionDigits: maxDigits })} <Award size={16} className="inline ml-1" /></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeaderboardPage;
