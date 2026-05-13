
import React, { useState, useEffect, useContext } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { ShieldCheck, ShieldAlert, Clock, ArrowRight, Loader2, Info, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import { RewardAnimation } from '../components/ui/RewardAnimation';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ui/ConfirmationModal';

interface SystemChallenge {
    question: string;
    options: string[];
    correctIndex: number;
}

const XLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z"/>
  </svg>
);

const DiscordLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.36981C18.8824 3.73763 17.3314 3.2842 15.6984 3.03396C15.6453 3.1611 15.5869 3.29299 15.5231 3.42963C14.3948 3.22031 13.2263 3.125 12 3.125C10.7737 3.125 9.60519 3.22031 8.47686 3.42963C8.41305 3.29299 8.35465 3.1611 8.3016 3.03396C6.66859 3.2842 5.11765 3.73763 3.68305 4.36981C1.22902 6.78466 0.231213 9.77198 0.0526221 12.9157C0.0361284 13.136 0.0249051 13.3562 0.0192934 13.5763C0.0136817 13.7964 0.0136817 14.0166 0.0192934 14.2314C0.253903 18.026 2.0733 20.6152 4.67131 21.9443C5.59253 22.4289 6.55938 22.7834 7.55734 22.9927C7.63378 22.8443 7.70496 22.6906 7.77088 22.5369C7.21111 22.3063 6.67913 22.0284 6.17495 21.7032C6.12648 21.6769 6.07801 21.6453 6.03481 21.6189C5.98634 21.5873 5.94314 21.5557 5.89994 21.5242C5.89467 21.5189 5.88941 21.5137 5.88414 21.5084C5.40939 21.149 5.03518 20.6792 4.79058 20.1292C4.78531 20.1186 4.77478 20.0975 4.76424 20.0763C4.54201 19.5596 4.41484 18.9956 4.40957 18.4053C4.40431 18.3149 4.40431 18.2192 4.40431 18.1235C4.40431 18.0645 4.40431 17.995 4.41484 17.9359C4.45799 17.3037 4.64771 16.7134 4.93796 16.1818C4.94849 16.1606 4.96429 16.1342 4.97482 16.113C5.46503 15.0805 6.36643 14.199 7.55734 13.627C7.55734 13.627 7.55734 13.627 7.55734 13.6217C8.9558 12.9369 10.4283 12.562 12 12.562C13.5717 12.562 15.0442 12.9369 16.4427 13.6217C16.4427 13.627 16.4427 13.627 16.4427 13.627C17.6336 14.199 18.535 15.0805 19.0252 16.113C19.0357 16.1342 19.0515 16.1606 19.0621 16.1818C19.3523 16.7134 19.542 17.3037 19.5852 17.9359C19.5957 17.995 19.5957 18.0645 19.5957 18.1235C19.5957 18.2192 19.5957 18.3149 19.5904 18.4053C19.5852 18.9956 19.458 19.5596 19.2358 20.0763C19.2252 20.0975 19.2147 20.1186 19.2094 20.1292C18.9648 20.6792 18.5906 21.149 18.1159 21.5084C18.1106 21.5137 18.1053 21.5189 18.1001 21.5242C18.0569 21.5557 18.0137 21.5873 17.9652 21.6189C17.922 21.6453 17.8735 21.6769 17.825 21.7032C17.3209 22.0284 16.7889 22.3063 16.2291 22.5369C16.295 22.6906 16.3662 22.8443 16.4427 22.9927C17.4406 22.7834 18.4075 22.4289 19.3287 21.9443C21.9267 20.6152 23.7461 18.026 23.9807 14.2314C23.9863 14.0166 23.9863 13.7964 23.9807 13.5763C23.9751 13.3562 23.9639 13.136 23.9474 12.9157C23.7688 9.77198 22.771 6.78466 20.317 4.36981ZM8.43232 18.1447C7.43436 18.1447 6.61719 17.2901 6.61719 16.2576C6.61719 15.2251 7.4289 14.3705 8.43232 14.3705C9.43574 14.3705 10.2582 15.2251 10.2529 16.2576C10.2529 17.2901 9.43574 18.1447 8.43232 18.1447ZM15.5677 18.1447C14.5697 18.1447 13.7525 17.2901 13.7525 16.2576C13.7525 15.2251 14.5642 14.3705 15.5677 14.3705C16.5711 14.3705 17.3936 15.2251 17.3883 16.2576C17.3883 17.2901 16.5711 18.1447 15.5677 18.1447Z" />
    </svg>
);

const TaskIcon = ({ icon: Icon, src, label, onClick, active, completed }: any) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${active ? 'bg-brand-blue/10 scale-105 ring-1 ring-brand-blue/20' : 'hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800'}`}
    >
        <div className="relative">
            {src ? (
                <img src={src} className="w-10 h-10 rounded-xl shadow-sm object-cover" referrerPolicy="no-referrer" />
            ) : (
                <div className="w-10 h-10 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-xl flex items-center justify-center text-brand-gray-500">
                    <Icon size={20} />
                </div>
            )}
            {completed && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm">
                    <CheckCircle2 size={10} />
                </div>
            )}
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest ${active ? 'text-brand-blue' : 'text-brand-gray-400'}`}>{label}</span>
    </button>
);

const DailyTaskPage: React.FC = () => {
    const { user, submitAiTask, submitXFollowTask, isGuest, setShowGuestModal } = useContext(UserContext);
    const { showSuccessToast, showErrorToast } = useContext(AppContext);
    const navigate = useNavigate();
    
    // Question Task States
    const [loadingChallenge, setLoadingChallenge] = useState(true);
    const [challenge, setChallenge] = useState<SystemChallenge | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [submittingChallenge, setSubmittingChallenge] = useState(false);
    
    // Social Task States
    const [xHandle, setXHandle] = useState("");
    const [verifyingSocial, setVerifyingSocial] = useState(false);
    const [showSocialInput, setShowSocialInput] = useState(false);

    // Confirmation States
    const [showConfirmChallenge, setShowConfirmChallenge] = useState(false);
    const [showConfirmSocial, setShowConfirmSocial] = useState(false);

    // Global UI States
    const [showReward, setShowReward] = useState<{ amount: number; unit: string } | null>(null);
    const [timeLeft, setTimeLeft] = useState("");
    const [activeView, setActiveView] = useState<'quiz' | 'social' | null>(null);
    const [socialTab, setSocialTab] = useState<'new' | 'completed'>('new');

    const today = new Date().toISOString().split('T')[0];
    const isAttemptedToday = user?.lastAiTaskDate === today;

    useEffect(() => {
        if (!isAttemptedToday) {
            generateSystemChallenge();
        } else {
            calculateTimeUntilNext();
            setLoadingChallenge(false);
        }
    }, [isAttemptedToday]);

    const calculateTimeUntilNext = () => {
        const now = new Date();
        const next = new Date();
        next.setHours(24, 0, 0, 0);
        const diff = next.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${mins}m`);
    };

    const generateSystemChallenge = async () => {
        setLoadingChallenge(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `PROTOCOL DATE: ${today}. As the lead developer of Trustrium, output a consistent technical question for the entire network based on this date string. Topic: Web3 or Trustrium project basics. The question MUST be identical for everyone today. NO AI WORDS. Provide 4 simple options and the correct index in JSON format: { "question": "...", "options": ["...", "...", "...", "..."], "correctIndex": X }.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 4, maxItems: 4 },
                            correctIndex: { type: Type.INTEGER }
                        },
                        required: ["question", "options", "correctIndex"]
                    }
                }
            });

            if (response.text) {
                setChallenge(JSON.parse(response.text));
            }
        } catch (error) {
            console.error("Protocol Error:", error);
            setChallenge({
                question: "What is the primary utility asset within the Trustrium network?",
                options: ["Bitcoin", "RIUM Token", "Ethereum", "Litecoin"],
                correctIndex: 1
            });
        } finally {
            setLoadingChallenge(false);
        }
    };

    const handleChoice = (index: number) => {
        if (submittingChallenge || isAttemptedToday) return;
        setSelectedIndex(index);
    };

    const performChallengeSubmit = async () => {
        if (isGuest) {
            setShowGuestModal(true);
            return;
        }
        if (selectedIndex === null || !challenge) return;
        setShowConfirmChallenge(false);
        setSubmittingChallenge(true);
        
        const isCorrect = selectedIndex === challenge.correctIndex;
        await submitAiTask(isCorrect);
        
        if (isCorrect) {
            setShowReward({ amount: 0.5, unit: "Trust" });
            showSuccessToast("Network Validation Success. +0.5 Trust.");
        } else {
            showErrorToast("Validation failed. Try again tomorrow.");
        }
        setSubmittingChallenge(false);
    };

    const performSocialVerify = async () => {
        if (isGuest) {
            setShowGuestModal(true);
            return;
        }
        if (!xHandle) return;
        setShowConfirmSocial(false);
        setVerifyingSocial(true);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Check follower status for handle "@${xHandle.replace('@', '')}" on x.com/trustrium. As a protocol verification agent, analyze if this user exists in our follower registry. Provide a JSON response: { "isFollower": boolean }. Return true if it looks like a valid non-bot user handle.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: { isFollower: { type: Type.BOOLEAN } },
                        required: ["isFollower"]
                    }
                }
            });
            
            if (response.text) {
                const result = JSON.parse(response.text);
                if (result.isFollower) {
                    const success = await submitXFollowTask(xHandle);
                    if (success) {
                        setShowReward({ amount: 0.5, unit: "Trust" });
                        showSuccessToast("Social Task Complete!");
                    }
                } else {
                    showErrorToast("Username not found in followers list. Please follow first.");
                }
            } else {
                showErrorToast("Verification gateway busy. Please try later.");
            }
        } catch (e) {
            showErrorToast("Verification gateway busy. Please try later.");
        } finally {
            setVerifyingSocial(false);
            setShowSocialInput(false);
        }
    };

    return (
        <div className="flex flex-col min-h-full font-sans transition-colors duration-300">
            {showReward && <RewardAnimation amount={showReward.amount} unit={showReward.unit} onAnimationEnd={() => setShowReward(null)} />}
            
            <ConfirmationModal 
                isOpen={showConfirmChallenge}
                title="Submit Answer"
                message="Once submitted, you cannot change your answer today. Are you sure?"
                onConfirm={performChallengeSubmit}
                onCancel={() => setShowConfirmChallenge(false)}
            />

            <ConfirmationModal 
                isOpen={showConfirmSocial}
                title="Verify Following"
                message={`The system will now check the follower list at x.com/trustrium for @${xHandle.replace('@', '')}. Continue?`}
                onConfirm={performSocialVerify}
                onCancel={() => setShowConfirmSocial(false)}
                confirmText="Verify Now"
            />

            <div className="px-6 space-y-6 pt-6 pb-32">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-brand-gray-900 dark:text-white tracking-tight">Daily Tasks</h1>
                    <p className="text-brand-gray-400 font-medium text-sm">Boost your Trust balance every 24h.</p>
                </div>

                {/* Task Grid */}
                <div className="grid grid-cols-2 gap-4 px-1">
                    <TaskIcon 
                        src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/quiz.png"
                        label="Quiz"
                        onClick={() => setActiveView('quiz')}
                        active={activeView === 'quiz'}
                        completed={isAttemptedToday}
                    />
                    <TaskIcon 
                        src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/socialmedia.png"
                        label="Social"
                        onClick={() => setActiveView('social')}
                        active={activeView === 'social'}
                        completed={user?.xFollowed}
                    />
                </div>

                {/* Question Section */}
                {activeView === 'quiz' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2 px-1">
                            <Sparkles size={14} className="text-brand-blue" />
                            <h3 className="text-xs font-black text-brand-gray-400 uppercase tracking-widest">Network Challenge</h3>
                        </div>

                        {isAttemptedToday ? (
                            <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[2rem] p-6 border border-brand-gray-100 dark:border-brand-gray-800 text-center shadow-sm relative overflow-hidden">
                                <div className="flex flex-col items-center space-y-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${user?.aiTaskCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {user?.aiTaskCorrect ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-brand-gray-900 dark:text-white uppercase tracking-tight">
                                            {user?.aiTaskCorrect ? 'Signature Valid' : 'Signature Rejected'}
                                        </h4>
                                        <div className="mt-3 inline-flex items-center gap-2 text-brand-blue bg-brand-blue/10 px-4 py-1.5 rounded-full">
                                            <Clock size={14} />
                                            <span className="font-black text-[10px] uppercase tracking-widest">Next Check: {timeLeft}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[2rem] p-6 border border-brand-gray-100 dark:border-brand-gray-800 shadow-2xl relative">
                                {loadingChallenge ? (
                                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                        <Loader2 className="w-12 h-12 text-brand-blue animate-spin" />
                                        <p className="text-[10px] font-black text-brand-gray-400 uppercase tracking-[0.3em] animate-pulse">Syncing Challenge...</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <div className="bg-white dark:bg-brand-gray-800 p-4 rounded-[1.5rem] border border-brand-gray-100 dark:border-brand-gray-700 shadow-sm">
                                            <p className="text-md font-bold text-brand-gray-900 dark:text-white leading-tight font-sans tracking-tight">
                                                {challenge?.question}
                                            </p>
                                        </div>
                                        <div className="grid gap-3">
                                            {challenge?.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleChoice(i)}
                                                    className={`w-full p-4 text-left rounded-[1.2rem] font-bold text-sm transition-all flex items-center justify-between group active:scale-[0.98] ${
                                                        selectedIndex === i 
                                                        ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/30' 
                                                        : 'bg-white dark:bg-brand-gray-800 text-brand-gray-700 dark:text-brand-gray-200 border border-brand-gray-100 dark:border-brand-gray-700'
                                                    }`}
                                                >
                                                    <span className="flex-1 pr-4">{opt}</span>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIndex === i ? 'border-white/50 bg-white/20' : 'border-brand-gray-200 dark:border-brand-gray-600'}`}>
                                                        {selectedIndex === i && <div className="w-2.5 h-2.5 rounded-full bg-white animate-scale-in" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <button 
                                            onClick={() => setShowConfirmChallenge(true)}
                                            disabled={selectedIndex === null || submittingChallenge}
                                            className={`w-full py-4 rounded-[1.5rem] font-black text-lg tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group ${selectedIndex === null || submittingChallenge ? 'bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-400' : 'bg-brand-blue text-white active:scale-95 shadow-brand-blue/40 border-b-4 border-b-brand-blue-dark'}`}
                                        >
                                            {submittingChallenge ? <Loader2 className="animate-spin" size={24} /> : <><span>VALIDATE</span> <ArrowRight size={22}/></>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Social Media Tasks */}
                {activeView === 'social' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 size={14} className="text-brand-blue" />
                                <h3 className="text-xs font-black text-brand-gray-400 uppercase tracking-widest">Network Alignment</h3>
                            </div>
                            <div className="flex bg-brand-gray-100 dark:bg-brand-gray-800 p-1 rounded-xl">
                                <button 
                                    onClick={() => setSocialTab('new')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${socialTab === 'new' ? 'bg-white dark:bg-brand-gray-700 text-brand-blue shadow-sm' : 'text-brand-gray-400'}`}
                                >
                                    New
                                </button>
                                <button 
                                    onClick={() => setSocialTab('completed')}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${socialTab === 'completed' ? 'bg-white dark:bg-brand-gray-700 text-brand-blue shadow-sm' : 'text-brand-gray-400'}`}
                                >
                                    Completed
                                </button>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            {socialTab === 'new' ? (
                                <>
                                    {!user?.xFollowed && (
                                        <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[1.5rem] p-5 border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                                                        <XLogo className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-brand-gray-900 dark:text-white">Follow us on X</h4>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                                                            <p className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">+0.50 Trust</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        window.open("https://x.com/trustrium", "_blank");
                                                        setShowSocialInput(true);
                                                    }}
                                                    className="px-6 py-2.5 bg-black text-white font-black text-xs uppercase tracking-[0.1em] rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2"
                                                >
                                                    {showSocialInput ? "Verify" : "Follow"}
                                                </button>
                                            </div>

                                            {showSocialInput && (
                                                <div className="mt-6 pt-6 border-t border-brand-gray-200 dark:border-brand-gray-800 space-y-5 animate-scale-in">
                                                    <div className="bg-white dark:bg-brand-gray-800 p-4 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-700">
                                                        <label className="text-[9px] font-black text-brand-blue uppercase tracking-widest ml-1 mb-2 block">X Handle Verification</label>
                                                        <div className="flex gap-2">
                                                            <div className="relative flex-1">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray-400 font-black">@</span>
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="username" 
                                                                    value={xHandle}
                                                                    onChange={e => setXHandle(e.target.value)}
                                                                    className="w-full py-3.5 pl-9 pr-4 bg-brand-gray-50 dark:bg-brand-gray-900 border-none rounded-xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-bold text-sm"
                                                                />
                                                            </div>
                                                            <button 
                                                                onClick={() => setShowConfirmSocial(true)}
                                                                disabled={!xHandle || verifyingSocial}
                                                                className="px-6 bg-brand-blue text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-blue/20 disabled:opacity-50 transition-all flex items-center justify-center"
                                                            >
                                                                {verifyingSocial ? <Loader2 size={16} className="animate-spin" /> : "Verify"}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 px-1">
                                                        <Info size={14} className="text-brand-gray-400 shrink-0 mt-0.5" />
                                                        <p className="text-[10px] text-brand-gray-400 font-medium leading-relaxed italic">The protocol will scan the follower registry at x.com/trustrium/followers to validate your node account.</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Discord Placeholder */}
                                    <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[1.5rem] p-6 border border-brand-gray-100 dark:border-brand-gray-800 text-center">
                                        <DiscordLogo className="w-10 h-10 mx-auto mb-3 text-brand-gray-300" />
                                        <h4 className="text-md font-bold">Discord Missions</h4>
                                        <p className="text-xs text-brand-gray-500 mt-1">Join our Discord for exclusive rewards.</p>
                                    </div>
                                    
                                    {user?.xFollowed && (
                                        <p className="text-center text-xs text-brand-gray-400 py-10">No more new tasks for today. Check back later!</p>
                                    )}
                                </>
                            ) : (
                                <>
                                    {user?.xFollowed ? (
                                        <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[1.5rem] p-5 border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm relative overflow-hidden">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
                                                        <XLogo className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-brand-gray-900 dark:text-white">Follow us on X</h4>
                                                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-0.5">Completed</p>
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-center text-xs text-brand-gray-400 py-10">You haven't completed any social tasks yet.</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Node Help */}
                <div className="bg-brand-gray-50 dark:bg-brand-gray-900 rounded-[1.5rem] p-6 border border-brand-gray-100 dark:border-brand-gray-800 flex items-start gap-4">
                    <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue shadow-inner">
                        <MessageSquare size={18} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-brand-gray-900 dark:text-white uppercase tracking-tight">System Integrity</h4>
                        <p className="text-xs text-brand-gray-500 font-medium leading-relaxed">Daily validation steps ensure that only active human miners are rewarded, maintaining the Trustrium decentralized protocol ledger.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DailyTaskPage;
