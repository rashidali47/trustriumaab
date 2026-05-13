
import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
import { Mail, RefreshCw, LogOut, CheckCircle, ArrowRight, Clock } from 'lucide-react';

const VerificationPendingPage: React.FC = () => {
    const { firebaseAuthUser, sendVerificationEmail, checkEmailVerification, logout } = useContext(UserContext);
    const { showSuccessToast, showErrorToast } = useContext(AppContext);
    
    const [isChecking, setIsChecking] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [cooldown]);

    const handleResend = async () => {
        if (isSending || cooldown > 0) return;
        setIsSending(true);
        try {
            const result = await sendVerificationEmail();
            if (result === 'SUCCESS') {
                showSuccessToast("Verification email resent! Check your inbox.");
                setCooldown(60); // 60 second cooldown
            } else if (result === 'TOO_MANY_REQUESTS') {
                showErrorToast("Please wait before requesting another email.");
                setCooldown(60);
            } else {
                showErrorToast("Failed to send email. Please try again later.");
            }
        } catch (e) {
            showErrorToast("An unexpected error occurred.");
        } finally {
            setIsSending(false);
        }
    };

    const handleCheckStatus = async () => {
        setIsChecking(true);
        try {
            const isVerified = await checkEmailVerification();
            if (isVerified) {
                showSuccessToast("Email verified! Entering the app...");
                // The App component will automatically re-render and show MainLayout
            } else {
                showErrorToast("Email not verified yet. Please check your inbox.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-gray-900 to-brand-gray-950 p-4">
            <div className="max-w-md w-full bg-white dark:bg-brand-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-brand-gray-200 dark:border-brand-gray-800 relative overflow-hidden">
                 {/* Decorative Background Elements */}
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-blue to-brand-blue-light"></div>
                 <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-blue/10 rounded-full blur-2xl"></div>
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

                <div className="relative mb-6 inline-block">
                    <div className="w-20 h-20 bg-brand-blue/10 rounded-full flex items-center justify-center animate-pulse">
                        <Mail size={40} className="text-brand-blue" />
                    </div>
                     <div className="absolute -bottom-1 -right-1 bg-white dark:bg-brand-gray-900 rounded-full p-1">
                        <Clock size={20} className="text-yellow-500" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verify Your Email</h2>
                <p className="text-brand-gray-500 dark:text-brand-gray-400 mb-6">
                    We've sent a verification link to <br/>
                    <span className="font-semibold text-brand-gray-800 dark:text-white">{firebaseAuthUser?.email}</span>
                </p>

                <div className="bg-brand-gray-50 dark:bg-brand-gray-800 rounded-lg p-4 mb-6 text-sm text-left">
                    <p className="text-brand-gray-600 dark:text-brand-gray-300 flex items-start gap-2">
                        <span className="text-brand-blue font-bold">•</span>
                        <span>Check your spam or junk folder if you don't see the email.</span>
                    </p>
                    <p className="text-brand-gray-600 dark:text-brand-gray-300 flex items-start gap-2 mt-2">
                        <span className="text-brand-blue font-bold">•</span>
                        <span>You must verify your email to access your mining dashboard.</span>
                    </p>
                </div>

                <div className="space-y-3">
                    <button 
                        onClick={handleCheckStatus} 
                        disabled={isChecking}
                        className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-blue/20 hover:shadow-brand-blue/40 hover:-translate-y-0.5"
                    >
                        {isChecking ? <RefreshCw size={20} className="animate-spin"/> : <CheckCircle size={20}/>}
                        I've Verified My Email
                    </button>

                    <button 
                        onClick={handleResend} 
                        disabled={isSending || cooldown > 0}
                        className="w-full py-3 bg-white dark:bg-brand-gray-800 border border-brand-gray-200 dark:border-brand-gray-700 text-brand-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all hover:bg-brand-gray-50 dark:hover:bg-brand-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {cooldown > 0 ? `Resend available in ${cooldown}s` : (isSending ? 'Sending...' : 'Resend Verification Email')}
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-gray-100 dark:border-brand-gray-800">
                    <button onClick={logout} className="text-brand-gray-500 hover:text-red-500 text-sm flex items-center justify-center gap-2 mx-auto transition-colors">
                        <LogOut size={16} /> Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationPendingPage;
