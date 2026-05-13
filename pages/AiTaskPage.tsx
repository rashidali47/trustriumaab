
import React, { useState, useEffect, useContext } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { Sparkles, Brain, Cpu, ShieldCheck, ShieldAlert, Clock, ArrowRight, Loader2, Info } from 'lucide-react';
import { RewardAnimation } from '../components/ui/RewardAnimation';

interface AiQuestion {
    question: string;
    options: string[];
    correctIndex: number;
}

const AiTaskPage: React.FC = () => {
    const { user, submitAiTask, isGuest, setShowGuestModal } = useContext(UserContext);
    const { showSuccessToast, showErrorToast } = useContext(AppContext);
    
    const [loading, setLoading] = useState(true);
    const [aiQuestion, setAiQuestion] = useState<AiQuestion | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [timeLeft, setTimeLeft] = useState("");

    const today = new Date().toISOString().split('T')[0];
    const isAttemptedToday = user?.lastAiTaskDate === today;

    useEffect(() => {
        if (!isAttemptedToday) {
            generateDailyQuestion();
        } else {
            calculateTimeUntilNext();
            setLoading(false);
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

    const generateDailyQuestion = async () => {
        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: 'Ask a high-quality multiple choice question about either Web3 concepts (blockchain, DeFi, keys, wallet security) or the project Trustrium (www.trustrium.com). Trustrium is a simulated mining network where users earn Trust points and RIUM tokens. The question should be challenging but fair.',
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                            options: { 
                                type: Type.ARRAY, 
                                items: { type: Type.STRING },
                                minItems: 4,
                                maxItems: 4
                            },
                            correctIndex: { type: Type.INTEGER }
                        },
                        required: ["question", "options", "correctIndex"]
                    }
                }
            });

            if (response.text && response.text !== "undefined") {
                setAiQuestion(JSON.parse(response.text));
            }
        } catch (error) {
            console.error("AI Generation Error:", error);
            // Fallback question
            setAiQuestion({
                question: "What is the primary utility token of the Trustrium network?",
                options: ["BTC", "RIUM", "ETH", "TRUST"],
                correctIndex: 1
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChoice = (index: number) => {
        if (submitting || isAttemptedToday) return;
        setSelectedIndex(index);
    };

    const handleSubmit = async () => {
        if (isGuest) {
            setShowGuestModal(true);
            return;
        }
        if (selectedIndex === null || !aiQuestion || submitting) return;
        
        setSubmitting(true);
        const isCorrect = selectedIndex === aiQuestion.correctIndex;
        
        await submitAiTask(isCorrect);
        
        if (isCorrect) {
            setShowReward(true);
            showSuccessToast("Neural Link Stable. 0.5 Trust Credited.");
        } else {
            showErrorToast("Neural Link Severed. Access denied until tomorrow.");
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="container mx-auto max-w-lg p-8 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-brand-blue/10 border-t-brand-blue animate-spin"></div>
                    <Cpu size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-blue animate-pulse" />
                </div>
                <h2 className="text-xl font-black text-brand-gray-900 dark:text-white uppercase tracking-widest">Initializing Neural Link</h2>
                <p className="text-sm text-brand-gray-500 animate-pulse">Syncing with Trustrium AI Node...</p>
            </div>
        );
    }

    if (isAttemptedToday) {
        return (
            <div className="container mx-auto max-w-lg p-6 space-y-6">
                <div className="bg-white dark:bg-brand-gray-900 rounded-[2.5rem] p-8 border border-brand-gray-100 dark:border-brand-gray-800 text-center shadow-2xl relative overflow-hidden">
                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${user?.aiTaskCorrect ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {user?.aiTaskCorrect ? <ShieldCheck size={48} /> : <ShieldAlert size={48} />}
                    </div>
                    <h2 className="text-2xl font-black text-brand-gray-900 dark:text-white uppercase tracking-tight">
                        {user?.aiTaskCorrect ? 'Neural Session Complete' : 'Attempt Exhausted'}
                    </h2>
                    <p className="text-brand-gray-500 mt-2 text-sm leading-relaxed max-w-xs mx-auto">
                        {user?.aiTaskCorrect 
                            ? "You've successfully completed today's AI challenge. Return in 24 hours for fresh credentials."
                            : "Your neural attempt failed to validate. Access is locked for security. Please return tomorrow."}
                    </p>
                    
                    <div className="mt-8 pt-8 border-t border-brand-gray-100 dark:border-brand-gray-800">
                        <div className="flex items-center justify-center gap-2 text-brand-blue">
                            <Clock size={18} />
                            <span className="font-black text-sm uppercase tracking-widest">Next Link: {timeLeft}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-6 rounded-[2rem] border border-dashed border-brand-gray-200 dark:border-brand-gray-800">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
                            <Info size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-brand-gray-900 dark:text-white">Neural Integrity</h4>
                            <p className="text-xs text-brand-gray-500 mt-1">Trustrium AI tasks are used to verify human node behavior. Correct answers improve network decentralization and reward active miners.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-lg p-6 space-y-6 pb-32">
            {showReward && <RewardAnimation amount={0.5} unit="Trust" onAnimationEnd={() => setShowReward(false)} />}
            
            <header className="space-y-1">
                <div className="flex items-center gap-2 text-brand-blue">
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Protocol</span>
                </div>
                <h1 className="text-4xl font-bold text-brand-gray-900 dark:text-white tracking-tight">Daily Neural Link</h1>
                <p className="text-brand-gray-500 text-sm">Validate your status to earn 0.5 Trust bonus.</p>
            </header>

            <div className="bg-white dark:bg-brand-gray-900 rounded-[3rem] p-8 border border-brand-gray-100 dark:border-brand-gray-800 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Brain size={120} />
                </div>

                <div className="relative z-10">
                    <div className="bg-brand-blue/5 p-6 rounded-[2rem] border border-brand-blue/10">
                        <p className="text-lg font-bold text-brand-gray-800 dark:text-white leading-relaxed italic">
                            "{aiQuestion?.question}"
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 relative z-10">
                    {aiQuestion?.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => handleChoice(i)}
                            className={`w-full p-5 text-left rounded-[1.5rem] font-bold text-sm transition-all flex items-center justify-between group active:scale-98 ${
                                selectedIndex === i 
                                ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/20 translate-x-2' 
                                : 'bg-brand-gray-50 dark:bg-brand-gray-950 text-brand-gray-600 dark:text-brand-gray-300 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800'
                            }`}
                        >
                            <span className="flex-1">{opt}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIndex === i ? 'border-white/40 bg-white/20' : 'border-brand-gray-200 dark:border-brand-gray-700'}`}>
                                {selectedIndex === i && <div className="w-2 h-2 rounded-full bg-white animate-scale-in" />}
                            </div>
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={selectedIndex === null || submitting}
                    className={`w-full py-5 rounded-[2rem] font-black text-lg tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl relative overflow-hidden group ${selectedIndex === null || submitting ? 'bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-400' : 'bg-brand-blue text-white active:scale-95 shadow-brand-blue/30'}`}
                >
                    {submitting ? (
                        <Loader2 className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span>VALIDATE ANSWER</span>
                            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
            
            <p className="text-center text-[10px] font-black text-brand-gray-400 uppercase tracking-widest px-8 leading-relaxed opacity-60">
                Warning: Neural links are encrypted and restricted to one session per miner per day. Incorrect signatures will trigger a 24h cooldown.
            </p>
        </div>
    );
};

export default AiTaskPage;
