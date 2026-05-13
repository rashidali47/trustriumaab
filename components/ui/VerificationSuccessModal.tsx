
import React from 'react';
import { ShieldCheck, CheckCircle, ArrowRight, Zap } from 'lucide-react';

interface VerificationSuccessModalProps {
    onClose: () => void;
}

const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in-out" style={{ animation: 'none', opacity: 1 }}>
            <div className="bg-white dark:bg-brand-gray-900 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl border border-brand-blue/30 transform transition-all scale-100">
                
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/10 to-transparent pointer-events-none"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-blue/20 rounded-full blur-3xl"></div>

                {/* Icon Animation */}
                <div className="relative mb-6 flex justify-center">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
                         <ShieldCheck size={48} className="text-green-500" />
                    </div>
                    <div className="absolute top-0 right-1/3">
                        <CheckCircle size={24} className="text-green-500 fill-white dark:fill-brand-gray-900 animate-ping" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-brand-gray-900 dark:text-white mb-2">You're Verified!</h2>
                <p className="text-brand-gray-500 dark:text-brand-gray-300 mb-6">
                    Congratulations! Your identity has been successfully verified. You now have full access to the Trustrium ecosystem.
                </p>

                {/* Unlocked Features List */}
                <div className="bg-brand-gray-50 dark:bg-brand-gray-800 rounded-xl p-4 mb-6 text-left space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-500/10 rounded-full text-green-500"><Zap size={16} /></div>
                        <span className="text-sm font-medium">Wallet Transactions Unlocked</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-brand-blue/10 rounded-full text-brand-blue"><ShieldCheck size={16} /></div>
                        <span className="text-sm font-medium">Verified Badge on Profile</span>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full py-3.5 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl shadow-lg hover:shadow-brand-blue/25 transition-all flex items-center justify-center gap-2 group"
                >
                    Continue Mining <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </div>
            
            {/* Confetti CSS logic would ideally be here or imported, simplified for this component */}
            <style>{`
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.8); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default VerificationSuccessModal;
