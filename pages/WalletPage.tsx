

import React, { useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserContext } from '../contexts/UserContext';
import { ArrowDown, ArrowUp, Repeat, Copy, ShieldCheck, Eye, EyeOff, X, QrCode, AlertTriangle, ShieldX, Key, Mail, Clock, Send, Gift, Pickaxe, UserPlus, Share2, Search, User, ChevronRight, Filter, Loader2, Coins, Wallet, History, ArrowRightLeft, ChevronDown, ArrowUpRight, ArrowDownLeft, Plus, Globe, Check } from 'lucide-react';
import { Transaction, KycStatus } from '../types';
import { AppContext } from '../contexts/AppContext'; // Import AppContext
import { RewardAnimation } from '../components/ui/RewardAnimation';

const TransactionDetailModal: React.FC<{ tx: Transaction; onClose: () => void }> = ({ tx, onClose }) => {
    const { showSuccessToast } = useContext(AppContext); // Use showSuccessToast
    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      showSuccessToast("Copied to clipboard!"); // Use toast notification
    }

    const getTxIcon = () => {
        const props = { size: 32, className: "text-white" };
        switch (tx.type) {
            case 'send': return <ArrowUp {...props} />;
            case 'receive': return <ArrowDown {...props} />;
            case 'swap': return <Repeat {...props} />;
            case 'bonus': return <Gift {...props} />;
            case 'mining': return <Pickaxe {...props} />;
            case 'referral': return <UserPlus {...props} />;
            default: return <div />;
        }
    }

    const getTxColor = () => {
        if (tx.status === 'pending') return 'from-yellow-500 to-amber-500';
        switch (tx.type) {
            case 'send': return 'from-red-500 to-rose-500';
            case 'receive': case 'bonus': case 'mining': case 'referral': return 'from-green-500 to-emerald-500';
            case 'swap': return 'from-blue-500 to-sky-500';
            default: return 'from-brand-gray-500 to-brand-gray-600';
        }
    }
    
    const amountIsRIUM = (tx.amountRIUM ?? 0) !== 0;
    const amount = amountIsRIUM ? (tx.amountRIUM ?? 0) : (tx.amountTrust ?? 0);
    const unit = amountIsRIUM ? '$RIUM' : 'Trust';
    const amountPrefix = amount > 0 ? '+' : '';
    const formattedAmount = `${amountPrefix}${(amount ?? 0).toFixed(amountIsRIUM ? 4 : 2)}`;

    const shareAsText = () => {
        const shareText = `Trustrium Transaction Details:\nType: ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}\nAmount: ${formattedAmount} ${unit}\nDate: ${new Date(tx.date).toLocaleString()}\nTransaction ID: ${tx.trxId}`;
        if (navigator.share) {
            navigator.share({
                title: 'Trustrium Transaction',
                text: shareText,
            }).catch((error) => console.log('Error sharing text:', error));
        } else {
            navigator.clipboard.writeText(shareText);
            showSuccessToast("Transaction details copied to clipboard!"); // Use toast notification
        }
    };
    
    const handleShare = async () => {
        try {
            const canvas = document.createElement('canvas');
            const width = 400;
            const height = 600;
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                shareAsText();
                return;
            }

            const colorMap: { [key: string]: string } = {
                'from-red-500': '#ef4444', 'to-rose-500': '#f43f5e',
                'from-green-500': '#22c55e', 'to-emerald-500': '#10b981',
                'from-blue-500': '#3b82f6', 'to-sky-500': '#0ea5e9',
                'from-yellow-500': '#eab308', 'to-amber-500': '#f59e0b',
                'from-brand-gray-500': '#6b7280', 'to-brand-gray-600': '#4b5563',
            };
            const [fromColor, toColor] = getTxColor().split(' ').map(c => colorMap[c] || '#6b7280');

            // Backgrounds
            ctx.fillStyle = '#0B0C0F'; // dark:bg-brand-gray-950
            ctx.fillRect(0, 0, width, height);

            // Top Gradient Part
            const gradient = ctx.createLinearGradient(0, 0, 0, 250);
            gradient.addColorStop(0, fromColor);
            gradient.addColorStop(1, toColor);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0,0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, 250);
            ctx.lineTo(0, 250);
            ctx.closePath();
            ctx.fill();
            
            // Icon Circle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(width / 2, 70, 40, 0, 2 * Math.PI);
            ctx.fill();

            // Text content
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.font = '14px sans-serif';
            ctx.fillText(tx.to || tx.type.charAt(0).toUpperCase() + tx.type.slice(1), width / 2, 140);
            ctx.font = 'bold 40px sans-serif';
            ctx.fillText(formattedAmount, width / 2, 185);
            ctx.font = 'bold 16px sans-serif';
            ctx.fillText(unit, width / 2, 210);

            // Details section
            let y = 280;
            const drawDetailRow = (label: string, value: string, valueFont: string = '16px sans-serif', valueAlign: 'left'|'right'|'center' = 'right') => {
                ctx.fillStyle = '#6C7A9A'; // brand-gray-500
                ctx.textAlign = 'left';
                ctx.font = '16px sans-serif';
                ctx.fillText(label, 30, y);

                ctx.fillStyle = '#F1F2F6'; // brand-gray-50
                ctx.textAlign = valueAlign;
                ctx.font = valueFont;
                ctx.fillText(value, width - 30, y);
                y += 40;
            };
            
            drawDetailRow('Status:', tx.status.charAt(0).toUpperCase() + tx.status.slice(1));
            drawDetailRow('Date:', new Date(tx.date).toLocaleString());
            if (tx.from) drawDetailRow('From:', tx.from);
            if (tx.to) drawDetailRow('To:', tx.to);
            
            // Special handling for long transaction ID
            ctx.fillStyle = '#6C7A9A';
            ctx.textAlign = 'left';
            ctx.font = '16px sans-serif';
            ctx.fillText('Transaction ID:', 30, y);
            
            ctx.fillStyle = '#F1F2F6';
            ctx.textAlign = 'right';
            ctx.font = '11px monospace';

            const idParts = tx.trxId.match(/.{1,28}/g) || []; // Break into chunks of 28 chars
            idParts.forEach((part, index) => {
                ctx.fillText(part, width - 30, y + (index * 15));
            });
            y += (idParts.length * 15) + 25;


            // Watermark
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('RIUM Mining App', width / 2, height - 30);


            canvas.toBlob(async (blob) => {
                if (blob && navigator.share && navigator.canShare({ files: [new File([blob], 'tx.png', { type: 'image/png'})] })) {
                    const file = new File([blob], `trustrium-tx-${tx.id}.png`, { type: 'image/png' });
                    try {
                        await navigator.share({
                            title: 'Trustrium Transaction',
                            files: [file],
                        });
                    } catch (error) {
                        console.log('Error sharing image, falling back to text.', error);
                        shareAsText();
                    }
                } else {
                    shareAsText();
                }
            }, 'image/png');
        } catch(e) {
            console.error("Failed to create transaction image", e);
            shareAsText();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-brand-gray-100 dark:bg-brand-gray-950 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-brand-gray-200 dark:border-brand-gray-800"
            >
                <div className={`p-6 bg-gradient-to-br ${getTxColor()} text-white flex flex-col items-center text-center`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white/20 mb-4`}>
                        {getTxIcon()}
                    </div>
                    <p className="text-sm opacity-80">{tx.to || tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</p>
                    <p className="text-2xl font-bold tracking-tight">{formattedAmount}</p>
                    <p className="font-semibold">{unit}</p>
                </div>

                <div className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-brand-gray-500">Status:</span>
                        <span className={`font-semibold capitalize flex items-center gap-1.5 ${tx.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>
                           {tx.status === 'completed' ? <ShieldCheck size={14}/> : <Clock size={14}/>} {tx.status}
                        </span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-brand-gray-500">Date:</span>
                        <span className="font-semibold">{new Date(tx.date).toLocaleString()}</span>
                    </div>
                    {tx.from && <div className="flex justify-between">
                        <span className="text-brand-gray-500">From:</span>
                        <span className="font-semibold truncate max-w-[180px]">{tx.from}</span>
                    </div>}
                     {tx.to && <div className="flex justify-between">
                        <span className="text-brand-gray-500">To:</span>
                        <span className="font-semibold truncate max-w-[180px]">{tx.to}</span>
                    </div>}
                    <div className="flex justify-between items-center break-all">
                        <span className="text-brand-gray-500">Transaction ID:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{tx.trxId.substring(0,8)}...</span>
                            <button onClick={() => handleCopy(tx.trxId)} className="text-brand-blue"><Copy size={14}/></button>
                        </div>
                    </div>
                </div>
                 <div className="p-4 grid grid-cols-2 gap-2 bg-brand-gray-200 dark:bg-brand-gray-900">
                    <button onClick={handleShare} className="w-full py-2 font-semibold text-brand-gray-700 dark:text-brand-gray-200 bg-white dark:bg-brand-gray-800 rounded-lg hover:bg-brand-gray-50 dark:hover:bg-brand-gray-700 transition-colors flex items-center justify-center gap-2">
                        <Share2 size={16}/> Share
                    </button>
                    <button onClick={onClose} className="w-full py-2 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors">Close</button>
                 </div>
            </motion.div>
        </div>
    )
}


const PinLockScreen: React.FC = () => {
    const { unlockWallet, pinAttempts } = useContext(UserContext);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const handlePinChange = (value: string) => {
        if (value.length <= 4) {
            setPin(value);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!/^\d{4}$/.test(pin)) {
            setError('PIN must be 4 digits.');
            return;
        }
        if (!unlockWallet(pin)) {
            setError('Incorrect PIN. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full pt-10 text-center">
            <ShieldCheck size={32} className="text-brand-blue mb-4"/>
            <h2 className="text-xl font-bold">Enter Wallet PIN</h2>
            <p className="text-brand-gray-500 dark:text-brand-gray-400">Enter your 4-digit PIN to access your wallet.</p>
            <form onSubmit={handleSubmit} className="w-full max-w-xs p-4 space-y-4">
                <input
                    type="password"
                    value={pin}
                    onChange={e => handlePinChange(e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className="w-full p-4 text-center text-2xl tracking-[1em] bg-brand-gray-100 dark:bg-brand-gray-800 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                    />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <p className="text-sm text-brand-gray-500">Attempts remaining: {10 - pinAttempts}</p>
                 <button type="submit" className="w-full py-3 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors">Unlock</button>
            </form>
        </div>
    )
};

const PrivateKeyRecoveryScreen: React.FC = () => {
    const { unlockWithPrivateKey, user } = useContext(UserContext);
    const [privateKey, setPrivateKey] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');
        if (!privateKey) {
            setError('Private key cannot be empty.');
            return;
        }
        if(!unlockWithPrivateKey(privateKey)) {
            setError('Incorrect private key.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full pt-10 text-center p-4">
             <ShieldX size={32} className="text-red-500 mb-4"/>
             <h2 className="text-xl font-bold">Wallet Locked</h2>
            <p className="text-brand-gray-500 dark:text-brand-gray-400 mb-4">You have entered an incorrect PIN too many times. Unlock with your private key or contact support.</p>
            <div className="w-full max-w-sm space-y-4">
                 <div>
                    <label className="text-sm font-medium text-left block">Private Key</label>
                    <input type="password" value={privateKey} onChange={e => setPrivateKey(e.target.value)} className="w-full p-2 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-lg mt-1"/>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSubmit} className="w-full py-2 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center gap-2"><Key size={16}/> Unlock Wallet</button>
                <div className="text-sm">
                    <p>Lost your key?</p>
                    <a href="mailto:support@trustrium.app" className="text-brand-blue flex items-center justify-center gap-1"><Mail size={14}/> Contact Support</a>
                </div>
            </div>
        </div>
    );
};

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const isPositive = tx.type === 'receive' || tx.type === 'bonus' || tx.type === 'mining' || tx.type === 'referral';
    const isNegative = tx.type === 'send';
    
    let Icon, colorClasses, amountPrefix, amount;

    amount = (tx.amountRIUM ?? 0) !== 0 ? `${Math.abs(tx.amountRIUM ?? 0).toFixed(4)} RIUM` : `${Math.abs(tx.amountTrust ?? 0).toFixed(2)} Trust`;

    if (tx.status === 'pending') {
        Icon = Clock;
        colorClasses = 'bg-yellow-500/20 text-yellow-500';
        amountPrefix = '+';
    } else if (isPositive) {
        Icon = ArrowDown;
        colorClasses = 'bg-green-500/20 text-green-500';
        amountPrefix = '+';
    } else if (isNegative) {
        Icon = ArrowUp;
        colorClasses = 'bg-red-500/20 text-red-500';
        amountPrefix = '';
    } else { // Swap
        Icon = Repeat;
        colorClasses = 'bg-blue-500/20 text-blue-500';
        amountPrefix = '';
    }
    
    if (tx.type === 'swap') {
        amount = `${Math.abs(tx.amountRIUM ?? 0).toFixed(4)} RIUM`;
    }
    
    const txDescription = () => {
        switch(tx.type) {
            case 'send': return `Sent to ${tx.to}`;
            case 'receive': return `Received from ${tx.from || 'Unknown'}`;
            default: return tx.to || tx.type;
        }
    }
    
    return (
        <div className="flex items-center justify-between py-3 border-b border-brand-gray-200 dark:border-brand-gray-800">
            <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${colorClasses}`}>
                    <Icon size={20}/>
                </div>
                <div>
                    <p className="font-semibold capitalize truncate max-w-[150px]">{txDescription()}</p>
                    <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">{new Date(tx.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold ${colorClasses.split(' ')[1]}`}>
                    {amountPrefix}{amount}
                </p>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 capitalize">{tx.status}</p>
            </div>
        </div>
    );
};

const SendModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { riumBalance, sendRium } = useContext(UserContext);
    const { showSuccessToast, showErrorToast } = useContext(AppContext); // Use AppContext toasts
    const [step, setStep] = useState(1);
    const [recipient, setRecipient] = useState('');
    const [amount, setAmount] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleContinue = () => {
        setError('');
        const numAmount = parseFloat(amount);
        if (!recipient) {
            setError('Recipient is required.');
            return;
        }
        if (isNaN(numAmount) || numAmount <= 0) {
            setError('Invalid amount.');
            return;
        }
        if (numAmount > riumBalance) {
            setError('Insufficient balance.');
            return;
        }
        setStep(2);
    };

    const handleSend = async () => {
        setError('');
        if (!/^\d{4}$/.test(pin)) {
            setError('PIN must be 4 digits.');
            return;
        }
        setIsSending(true);
        const numAmount = parseFloat(amount);
        
        const result = await sendRium(recipient, numAmount, pin);
        setIsSending(false);
        if (result === 'SUCCESS') {
            showSuccessToast(`Successfully sent ${(numAmount ?? 0).toFixed(4)} $RIUM to ${recipient}`);
            onClose();
        } else if (result === 'INVALID_PIN') {
            showErrorToast('Incorrect PIN. Please try again.');
        } else if (result === 'INSUFFICIENT_FUNDS') {
            showErrorToast('Insufficient funds.');
            setStep(1);
        } else if (result === 'USER_NOT_FOUND') {
            showErrorToast('Recipient user not found.');
            setStep(1);
        } else if (result === 'SELF_TRANSFER_ERROR') {
            showErrorToast('You cannot send RIUM to yourself.');
            setStep(1);
        } else {
            showErrorToast('Transaction failed. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-brand-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-brand-gray-200 dark:border-brand-gray-800 transition-all duration-300"
            >
                <div className="flex justify-between items-center p-4 border-b border-brand-gray-200 dark:border-brand-gray-800">
                    <h2 className="text-xl font-bold">Send $RIUM</h2>
                    <button onClick={onClose} className="text-brand-gray-400 hover:text-brand-gray-800 dark:hover:text-white"><X size={24}/></button>
                </div>

                <div className="p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                             <div>
                                <label className="text-sm font-medium">Recipient</label>
                                <div className="relative mt-1">
                                    <User className="absolute w-5 h-5 text-brand-gray-400 top-3 left-3" />
                                    <input type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="@username or 0x..." className="w-full py-2.5 pl-10 pr-4 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Amount</label>
                                <div className="relative mt-1">
                                    <span className="absolute font-bold text-brand-gray-400 top-2.5 left-3">$RIUM</span>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full p-2.5 pl-16 text-right bg-brand-gray-100 dark:bg-brand-gray-800 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                                </div>
                                <div className="flex justify-between text-xs mt-1 text-brand-gray-500">
                                  <span>Balance: {(riumBalance ?? 0).toFixed(4)} $RIUM</span>
                                  <button onClick={() => setAmount((riumBalance ?? 0).toString())} className="font-semibold text-brand-blue">MAX</button>
                                </div>
                            </div>
                            {error && <p className="text-sm text-center text-red-500">{error}</p>}
                            <button onClick={handleContinue} className="w-full mt-4 py-3 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center gap-2">
                                Continue <ChevronRight size={18}/>
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400">You are sending</p>
                                <p className="text-2xl font-bold my-1 text-brand-blue">{(parseFloat(amount) || 0).toFixed(4)} $RIUM</p>
                                <div className="inline-flex items-center gap-2 bg-brand-gray-100 dark:bg-brand-gray-800 px-3 py-1 rounded-full text-sm">
                                    <span className="text-brand-gray-500">To:</span>
                                    <span className="font-semibold truncate max-w-[200px]">{recipient}</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-brand-gray-200 dark:border-brand-gray-700 my-4"></div>

                            <div>
                               <label className="text-sm font-medium text-center block mb-2">Enter your 4-digit PIN to confirm</label>
                               <input
                                    type="password"
                                    value={pin}
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                                    maxLength={4}
                                    className="w-full max-w-[200px] mx-auto p-3 text-center text-2xl tracking-[1em] bg-brand-gray-100 dark:bg-brand-gray-800 rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none"
                                />
                            </div>
                            {error && <p className="text-sm text-center text-red-500">{error}</p>}

                            <div className="grid grid-cols-2 gap-4 mt-4">
                               <button onClick={() => setStep(1)} className="py-3 font-semibold text-brand-gray-700 dark:text-brand-gray-200 bg-brand-gray-200 dark:bg-brand-gray-700 rounded-lg hover:bg-brand-gray-300 dark:hover:bg-brand-gray-600 transition-colors">
                                    Back
                               </button>
                                <button onClick={handleSend} disabled={isSending} className={`py-3 font-semibold text-white bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 disabled:from-brand-gray-500 disabled:to-brand-gray-600 disabled:shadow-none disabled:cursor-not-allowed ${isSending ? 'animate-pulse-glow' : 'hover:scale-105 active:scale-95'}`}>
                                    {isSending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Send size={16}/> Confirm & Send
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

const ReceiveModal: React.FC<{ address: string; username: string; onClose: () => void }> = ({ address, username, onClose }) => {
    const { showSuccessToast } = useContext(AppContext); // Use showSuccessToast
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showSuccessToast("Copied to clipboard!"); // Use toast notification
    }
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-brand-gray-900 rounded-2xl p-6 w-full max-w-md text-center"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Receive $RIUM</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <div className="p-4 bg-white rounded-lg inline-block">
                    <QrCode size={128} className="text-brand-gray-800 dark:text-black" />
                </div>
                <p className="mt-4 text-sm text-brand-gray-500">Share your username or address to receive $RIUM.</p>

                <div className="mt-4 space-y-2 text-left">
                  <div>
                      <label className="text-xs font-semibold text-brand-gray-500">Username</label>
                      <div className="flex items-center justify-between mt-1 bg-brand-gray-100 dark:bg-brand-gray-800 p-2 rounded-lg">
                          <p className="font-mono text-sm truncate mr-2">@{username}</p>
                          <button onClick={() => handleCopy(`@${username}`)} className="text-brand-blue hover:text-brand-blue-dark transition-colors"><Copy size={16}/></button>
                      </div>
                  </div>
                  <div>
                      <label className="text-xs font-semibold text-brand-gray-500">Wallet Address</label>
                      <div className="flex items-center justify-between mt-1 bg-brand-gray-100 dark:bg-brand-gray-800 p-2 rounded-lg">
                          <p className="font-mono text-xs truncate mr-2">{address}</p>
                          <button onClick={() => handleCopy(address)} className="text-brand-blue hover:text-brand-blue-dark transition-colors"><Copy size={16}/></button>
                      </div>
                  </div>
                </div>
                <button onClick={onClose} className="mt-6 w-full py-2 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors">Done</button>
            </motion.div>
        </div>
    )
}

const SwapModal: React.FC<{ onClose: () => void; onSwapSuccess: (amount: number) => void }> = ({ onClose, onSwapSuccess }) => {
    const { trustBalance, riumBalance, swapTrustToRIUM } = useContext(UserContext);
    const { showErrorToast, showSuccessToast } = useContext(AppContext);
    const [swapAmount, setSwapAmount] = useState('');

    const riumToReceive = swapAmount && !isNaN(parseFloat(swapAmount)) ? (parseFloat(swapAmount) / 1).toFixed(4) : '0.0000';

    const handleSwap = () => {
        const amount = parseFloat(swapAmount);
        if (isNaN(amount) || amount <= 0) {
            showErrorToast("Please enter a valid amount to swap.");
            return;
        }
        if (amount > trustBalance) {
            showErrorToast("Insufficient Trust balance.");
            return;
        }
        const result = swapTrustToRIUM(amount);
        if (result.success && result.riumReceived) {
            showSuccessToast(result.message);
            onSwapSuccess(result.riumReceived);
            setSwapAmount('');
            onClose();
        } else {
            showErrorToast(result.message);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-brand-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-brand-gray-200 dark:border-brand-gray-800 transition-all duration-300"
            >
                <div className="flex justify-between items-center p-4 border-b border-brand-gray-200 dark:border-brand-gray-800">
                    <h2 className="text-xl font-bold">Swap Trust to $RIUM</h2>
                    <button onClick={onClose} className="text-brand-gray-400 hover:text-brand-gray-800 dark:hover:text-white"><X size={24}/></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-brand-gray-100 dark:bg-brand-gray-800 p-3 rounded-lg">
                        <div className="flex justify-between items-center text-xs text-brand-gray-500 dark:text-brand-gray-400">
                            <span>You Pay</span>
                            <span>Balance: {(trustBalance ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <input 
                                type="number" 
                                value={swapAmount}
                                onChange={(e) => setSwapAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-transparent text-2xl font-semibold focus:outline-none text-brand-gray-800 dark:text-white"
                            />
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => setSwapAmount((trustBalance ?? 0).toFixed(2))} className="text-xs font-bold text-brand-blue bg-brand-blue/10 px-2 py-1 rounded">MAX</button>
                                <span className="font-semibold text-brand-gray-800 dark:text-white">Trust</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center my-2">
                        <div className="p-1.5 bg-brand-gray-200 dark:bg-brand-gray-700 rounded-full border-4 border-white dark:border-brand-gray-900 z-10">
                            <ArrowDown size={16} className="text-brand-gray-600 dark:text-brand-gray-300"/>
                        </div>
                    </div>
                    
                    <div className="bg-brand-gray-100 dark:bg-brand-gray-800 p-3 rounded-lg -mt-5">
                        <div className="flex justify-between items-center text-xs text-brand-gray-500 dark:text-brand-gray-400">
                            <span>You Receive</span>
                            <span>Balance: {(riumBalance ?? 0).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <span className="text-2xl font-semibold text-brand-gray-800 dark:text-white">{riumToReceive}</span>
                            <span className="font-semibold text-brand-gray-800 dark:text-white">$RIUM</span>
                        </div>
                    </div>
                    
                    <p className="text-xs text-center mt-3 text-brand-gray-500 dark:text-brand-gray-400">Rate: 1 $RIUM ≈ 1 Trust</p>
                    
                    <button 
                        onClick={handleSwap} 
                        disabled={!swapAmount || parseFloat(swapAmount) <= 0 || parseFloat(swapAmount) > trustBalance} 
                        className="w-full mt-4 py-3 font-semibold text-white bg-brand-blue rounded-lg hover:bg-brand-blue-dark transition-colors flex items-center justify-center gap-2 disabled:bg-brand-gray-500 disabled:cursor-not-allowed"
                    >
                        <Repeat size={18} /> Swap
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

const ImportTokenModal: React.FC<{ isOpen: boolean; onClose: () => void; onImport: (token: any) => void }> = ({ isOpen, onClose, onImport }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!search) return;
        setLoading(true);
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/search?query=${search}`);
            const data = await response.json();
            setResults(data.coins.slice(0, 5));
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                className="bg-white dark:bg-brand-gray-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-brand-gray-100 dark:border-brand-gray-800"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Import Tokens</h2>
                    <button onClick={onClose} className="p-2 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search token name or symbol..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-3 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-2xl border-2 border-transparent focus:border-brand-blue focus:outline-none transition-all"
                        />
                    </div>

                    <button 
                        onClick={handleSearch}
                        disabled={loading || !search}
                        className="w-full py-3 bg-brand-blue text-white font-bold rounded-2xl hover:bg-brand-blue-dark transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SEARCH'}
                    </button>

                    <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {results.map(coin => (
                            <div key={coin.id} className="flex items-center justify-between p-3 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-xl border border-brand-gray-100 dark:border-brand-gray-700">
                                <div className="flex items-center gap-3">
                                    <img src={coin.thumb} alt={coin.name} className="w-8 h-8 rounded-full" />
                                    <div>
                                        <p className="font-bold text-sm">{coin.name}</p>
                                        <p className="text-[10px] text-brand-gray-400 uppercase">{coin.symbol}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onImport(coin)}
                                    className="px-4 py-1.5 bg-brand-blue/10 text-brand-blue text-xs font-bold rounded-lg hover:bg-brand-blue hover:text-white transition-all"
                                >
                                    IMPORT
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

const WalletPage: React.FC = () => {
  const { user, riumBalance, trustBalance, unverifiedTrustBalance, swapTrustToRIUM, transactions, isWalletLocked, pinAttempts, totalEarnedTrust, isGuest, setShowGuestModal } = useContext(UserContext);
  const { showSuccessToast, showErrorToast } = useContext(AppContext); // Use AppContext toasts
  const [activeTab, setActiveTab] = useState<'assets' | 'transactions'>('assets');
  const [showKey, setShowKey] = useState(false);
  const [isSendOpen, setSendOpen] = useState(false);
  const [isReceiveOpen, setReceiveOpen] = useState(false);
  const [isSwapOpen, setSwapOpen] = useState(false);
  const [showTxDetail, setShowTxDetail] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rewardEffect, setRewardEffect] = useState<{ amount: number; key: number; unit: string } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  
  // CoinGecko Prices
  const [coinPrices, setCoinPrices] = useState<Record<string, { usd: number; usd_24h_change: number }>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [importedTokens, setImportedTokens] = useState<any[]>([]);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  // Network Assets Configuration
  const networkAssets: Record<string, any[]> = {
    'Trustrium Chain': [
      { id: 'rium', name: 'RIUM', symbol: 'RIUM', icon: 'https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png', balance: riumBalance, isRIUM: true },
      { id: 'trust', name: 'TRUST', symbol: 'Trust', icon: 'mining', balance: trustBalance, isTrust: true },
    ],
    'BNB Chain': [
      { id: 'binancecoin', name: 'BNB', symbol: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', balance: 0 },
      { id: 'tether', name: 'Tether', symbol: 'USDT', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png', balance: 0 },
    ],
    'Ethereum': [
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: 0 },
      { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC', icon: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', balance: 0 },
    ],
    'Bitcoin': [
      { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', balance: 0 },
    ],
    'Base': [
      { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', balance: 0 },
      { id: 'base', name: 'Base', symbol: 'BASE', icon: 'https://cryptologos.cc/logos/base-base-logo.png', balance: 0 },
    ],
  };

  // Real-time Price Simulation
  const [riumPrice, setRiumPrice] = useState(2.36);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const lastPriceRef = useRef(2.36);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Network Selector
  const [selectedNetwork, setSelectedNetwork] = useState('All Chain');
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const networks = [
    { name: 'Trustrium Chain', icon: 'https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png', color: 'bg-brand-blue' },
    { name: 'BNB Chain', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.png', color: 'bg-yellow-500' },
    { name: 'Ethereum', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', color: 'bg-blue-600' },
    { name: 'Bitcoin', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', color: 'bg-orange-500' },
    { name: 'Base', icon: 'https://cryptologos.cc/logos/base-base-logo.png', color: 'bg-blue-500' },
    { name: 'All Chain', icon: 'https://cdn-icons-png.flaticon.com/512/2152/2152539.png', color: 'bg-brand-gray-600' },
  ];

  const [allChainAssets, setAllChainAssets] = useState<any[]>([]);
  const [loadingMarkets, setLoadingMarkets] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() * 0.02 - 0.01); // -0.01 to +0.01
      let newPrice = lastPriceRef.current + change;
      
      // Keep within bounds 2.29 - 2.41
      if (newPrice < 2.29) newPrice = 2.29;
      if (newPrice > 2.41) newPrice = 2.41;
      
      if (newPrice > lastPriceRef.current) setPriceDirection('up');
      else if (newPrice < lastPriceRef.current) setPriceDirection('down');
      else setPriceDirection('neutral');
      
      setRiumPrice(newPrice);
      lastPriceRef.current = newPrice;
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchPrices = async () => {
      setLoadingPrices(true);
      try {
        const ids = ['bitcoin', 'ethereum', 'binancecoin', 'solana', 'cardano', 'ripple', 'dogecoin', 'polkadot', 'matic-network', 'tron', 'tether', 'usd-coin', 'base'].join(',');
        const response = await fetch(`/api/prices?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        const data = await response.json();
        setCoinPrices(data);
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setLoadingPrices(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchMarkets = async () => {
      if (selectedNetwork !== 'All Chain') return;
      setLoadingMarkets(true);
      try {
        const response = await fetch('/api/markets?per_page=50');
        const data = await response.json();
        setAllChainAssets(data);
      } catch (error) {
        console.error("Failed to fetch markets:", error);
      } finally {
        setLoadingMarkets(false);
      }
    };

    fetchMarkets();
    const interval = setInterval(fetchMarkets, 60000); // Fetch every minute
    return () => clearInterval(interval);
  }, [selectedNetwork]);

  const refreshBalances = async () => {
    setIsRefreshing(true);
    // Simulate API call to different networks
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    showSuccessToast("Balances updated from blockchain");
  };

  const calculateTotalBalance = () => {
    let total = (riumBalance ?? 0) * (riumPrice ?? 0);
    
    if (selectedNetwork === 'All Chain') {
        // For All Chain, we don't necessarily have balances for all, 
        // but we should include RIUM and Trust which are the primary assets.
        total += (trustBalance ?? 0) * 0; // Trust points are 0 USD for now
    } else {
        // Add other assets from current network
        const currentAssets = networkAssets[selectedNetwork] || [];
        currentAssets.forEach(asset => {
            if (!asset.isRIUM && !asset.isTrust) {
                const priceData = coinPrices[asset.id];
                if (priceData && priceData.usd) {
                    total += (asset.balance ?? 0) * priceData.usd;
                }
            }
        });
    }

    // Add imported tokens
    importedTokens.forEach(token => {
        const priceData = coinPrices[token.id];
        if (priceData && priceData.usd) {
            total += (token.balance ?? 0) * priceData.usd;
        }
    });

    return total;
  };

  const txTypes: Transaction['type'][] = ['send', 'receive', 'swap', 'bonus', 'mining', 'referral'];
  const txStatuses: Transaction['status'][] = ['completed', 'pending'];

  const isKycApproved = user?.kycStatus === KycStatus.Approved;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccessToast("Copied to clipboard!");
  }
  
  const handleSwapSuccess = (riumReceived: number) => {
    setRewardEffect({ amount: riumReceived, unit: '$RIUM', key: Date.now() });
  };
  
  const handleClearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    setFilterStartDate('');
    setFilterEndDate('');
  }

  const handleOpenSend = () => {
      if (isGuest) {
          setShowGuestModal(true);
          return;
      }
      setSendOpen(true);
  };

  const handleOpenSwap = () => {
      if (isGuest) {
          setShowGuestModal(true);
          return;
      }
      setSwapOpen(true);
  };

  const filteredTransactions = transactions.filter(tx => {
    const query = searchQuery.toLowerCase();
    const amountStr = (tx.amountRIUM ?? 0) !== 0 ? (tx.amountRIUM ?? 0).toString() : (tx.amountTrust ?? 0).toString();
    const recipient = tx.to || '';
    
    const searchMatch = !query || (
        tx.type.toLowerCase().includes(query) ||
        amountStr.includes(query) ||
        recipient.toLowerCase().includes(query) ||
        (tx.from || '').toLowerCase().includes(query) ||
        tx.trxId.toLowerCase().includes(query)
    );

    const typeMatch = filterType === 'all' || tx.type === filterType;
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;

    const txDate = new Date(tx.date);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;
    if (startDate) startDate.setHours(0, 0, 0, 0); // Start of day
    if (endDate) endDate.setHours(23, 59, 59, 999); // End of day
    
    const dateMatch = (!startDate || txDate >= startDate) && (!endDate || txDate <= endDate);

    return searchMatch && typeMatch && statusMatch && dateMatch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isWalletLocked) {
      if (pinAttempts >= 10) {
          return <PrivateKeyRecoveryScreen />
      }
      return <PinLockScreen />;
  }

  return (
    <div className="container mx-auto max-w-lg p-4 space-y-6 pb-20">
        {rewardEffect && <RewardAnimation key={rewardEffect.key} amount={rewardEffect.amount} unit={rewardEffect.unit} onAnimationEnd={() => setRewardEffect(null)} />}
        <AnimatePresence>
            {isSendOpen && <SendModal onClose={() => setSendOpen(false)} />}
            {isReceiveOpen && user?.walletAddress && <ReceiveModal address={user.walletAddress} username={user.username} onClose={() => setReceiveOpen(false)} />}
            {isSwapOpen && <SwapModal onClose={() => setSwapOpen(false)} onSwapSuccess={handleSwapSuccess} />}
            {showTxDetail && <TransactionDetailModal tx={showTxDetail} onClose={() => setShowTxDetail(null)} />}
            <ImportTokenModal 
                isOpen={isImportModalOpen} 
                onClose={() => setImportModalOpen(false)} 
                onImport={(token) => {
                    setImportedTokens([...importedTokens, { ...token, balance: 0 }]);
                    setImportModalOpen(false);
                    showSuccessToast(`${token.name} imported successfully!`);
                }} 
            />
        </AnimatePresence>

        {/* Header: Network Selector */}
        <div className="relative z-30">
            <button 
                onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                className="w-full bg-white dark:bg-brand-gray-900 rounded-2xl p-4 flex items-center justify-between shadow-sm border border-brand-gray-100 dark:border-brand-gray-800 active:scale-[0.98] transition-all"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 overflow-hidden">
                        <img 
                            src={networks.find(n => n.name === selectedNetwork)?.icon || 'https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png'} 
                            alt={selectedNetwork} 
                            className="w-6 h-6 object-contain" 
                            onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/trust/40/40')} 
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <span className="font-bold text-brand-gray-900 dark:text-white">{selectedNetwork}</span>
                </div>
                <ChevronDown size={20} className={`text-brand-gray-400 transition-transform duration-300 ${showNetworkDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {showNetworkDropdown && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowNetworkDropdown(false)}
                            className="fixed inset-0 bg-black/20 z-40"
                        />
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-xl border border-brand-gray-100 dark:border-brand-gray-800 overflow-hidden z-50"
                        >
                            <div className="p-2 space-y-1">
                                {networks.map((network) => (
                                    <button
                                        key={network.name}
                                        onClick={() => {
                                            setSelectedNetwork(network.name);
                                            setShowNetworkDropdown(false);
                                        }}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${selectedNetwork === network.name ? 'bg-brand-blue/10 text-brand-blue' : 'hover:bg-brand-gray-50 dark:hover:bg-brand-gray-800 text-brand-gray-600 dark:text-brand-gray-300'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg ${network.color}/10 flex items-center justify-center overflow-hidden`}>
                                                <img src={network.icon} alt={network.name} className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                                            </div>
                                            <span className="font-bold text-sm">{network.name}</span>
                                        </div>
                                        {selectedNetwork === network.name && <Check size={18} />}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>

        {/* Main Balance Card */}
        <div className="relative overflow-hidden rounded-[1.5rem] p-6 bg-gradient-to-br from-[#F8F9FF] via-[#F0F2FF] to-[#E8EBFF] dark:from-brand-gray-900 dark:to-brand-gray-950 shadow-xl border border-white/50 dark:border-brand-gray-800">
            {/* Decorative background elements */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
                <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute top-0 right-0 p-2 text-brand-blue/60 hover:text-brand-blue transition-colors"
                >
                    <Key size={24} className={showKey ? 'fill-brand-blue' : ''} />
                </button>

                <p className="text-[10px] font-black tracking-[0.2em] text-brand-gray-400 uppercase mb-2">Total Balance</p>
                
                <div className="flex flex-col items-center mb-6 relative">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-brand-gray-900 dark:text-white tracking-tighter">
                            ${(calculateTotalBalance() ?? 0).toFixed(2)}
                        </span>
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold mt-1 ${priceDirection === 'up' ? 'text-green-500' : priceDirection === 'down' ? 'text-red-500' : 'text-brand-gray-400'}`}>
                        {priceDirection === 'up' ? <ArrowUp size={10} /> : priceDirection === 'down' ? <ArrowDown size={10} /> : null}
                        {(riumPrice ?? 0).toFixed(4)} USDT
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/80 dark:bg-brand-gray-800/80 backdrop-blur-md px-4 py-2 rounded-full border border-white dark:border-brand-gray-700 shadow-sm">
                    <span className="font-mono text-[10px] text-brand-gray-500 dark:text-brand-gray-400">
                        {user?.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : '0x...'}
                    </span>
                    <button onClick={() => handleCopy(user?.walletAddress || '')} className="text-brand-gray-400 hover:text-brand-blue transition-colors">
                        <Copy size={14} />
                    </button>
                </div>

                {showKey && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-brand-blue/10 rounded-xl border border-brand-blue/20 w-full"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-bold text-brand-blue uppercase">Private Key</p>
                            <button onClick={() => handleCopy(user?.privateKey || '')} className="text-brand-blue hover:text-brand-blue-dark transition-colors">
                                <Copy size={12} />
                            </button>
                        </div>
                        <p className="font-mono text-[10px] break-all text-brand-gray-600 dark:text-brand-gray-300 text-left">{user?.privateKey}</p>
                    </motion.div>
                )}
            </div>
        </div>
      
        {/* Action Buttons */}
        <div className="flex justify-center gap-8 py-2">
            <div className="flex flex-col items-center gap-2">
                <button 
                    onClick={handleOpenSend} 
                    disabled={!isKycApproved && !isGuest}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-brand-gray-900 flex items-center justify-center shadow-lg border border-brand-gray-50 dark:border-brand-gray-800 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                >
                    <ArrowUpRight size={28} className="text-brand-gray-900 dark:text-white" />
                </button>
                <span className="text-[10px] font-black tracking-widest text-brand-gray-400 uppercase">Send</span>
            </div>

            <div className="flex flex-col items-center gap-2">
                <button 
                    onClick={() => {
                        if (isGuest) setShowGuestModal(true);
                        else setReceiveOpen(true);
                    }} 
                    disabled={!isKycApproved && !isGuest}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-brand-gray-900 flex items-center justify-center shadow-lg border border-brand-gray-50 dark:border-brand-gray-800 hover:scale-110 active:scale-95 transition-all disabled:opacity-50"
                >
                    <ArrowDownLeft size={28} className="text-brand-gray-900 dark:text-white" />
                </button>
                <span className="text-[10px] font-black tracking-widest text-brand-gray-400 uppercase">Receive</span>
            </div>

            <div className="flex flex-col items-center gap-2">
                <button 
                    onClick={handleOpenSwap} 
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-brand-gray-900 flex items-center justify-center shadow-lg border border-brand-gray-50 dark:border-brand-gray-800 hover:scale-110 active:scale-95 transition-all"
                >
                    <Repeat size={28} className="text-brand-gray-900 dark:text-white" />
                </button>
                <span className="text-[10px] font-black tracking-widest text-brand-gray-400 uppercase">Swap</span>
            </div>
        </div>

        {/* Tabs and Content */}
        <div className="bg-white/50 dark:bg-brand-gray-900/50 rounded-[1.5rem] p-4 shadow-sm border border-brand-gray-100 dark:border-brand-gray-800">
            <div className="flex p-1.5 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-2xl mb-6">
                <button 
                    onClick={() => setActiveTab('assets')}
                    className={`flex-1 py-3 text-[11px] font-black tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'assets' ? 'bg-white dark:bg-brand-gray-700 text-brand-gray-900 dark:text-white shadow-md' : 'text-brand-gray-400 hover:text-brand-gray-600'}`}
                >
                    ASSETS
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    className={`flex-1 py-3 text-[11px] font-black tracking-widest rounded-xl transition-all duration-300 ${activeTab === 'transactions' ? 'bg-white dark:bg-brand-gray-700 text-brand-gray-900 dark:text-white shadow-md' : 'text-brand-gray-400 hover:text-brand-gray-600'}`}
                >
                    TRANSACTIONS
                </button>
            </div>

            {activeTab === 'assets' ? (
                <div className="space-y-3">
                    {selectedNetwork === 'All Chain' ? (
                        <>
                            {/* Trustrium Assets First */}
                            {networkAssets['Trustrium Chain'].map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-50 dark:border-brand-gray-800 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border overflow-hidden ${asset.isTrust ? 'bg-green-500/10 border-green-500/20' : 'bg-brand-gray-50 dark:bg-brand-gray-800 border-brand-gray-100 dark:border-brand-gray-700'}`}>
                                            {asset.isTrust ? (
                                                <Pickaxe size={24} className="text-green-600" />
                                            ) : (
                                                <img src={asset.icon} alt={asset.symbol} className="w-7 h-7 object-contain" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/crypto/40/40')} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-brand-gray-900 dark:text-white">{asset.name}</p>
                                            <p className="text-[10px] font-bold text-brand-gray-400 uppercase">{asset.symbol}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-brand-gray-900 dark:text-white">{(asset.balance ?? 0).toFixed(asset.isRIUM ? 4 : 2)}</p>
                                        {asset.isRIUM ? (
                                            <p className={`text-[10px] font-bold ${priceDirection === 'up' ? 'text-green-500' : priceDirection === 'down' ? 'text-red-500' : 'text-brand-gray-400'}`}>
                                                ${(riumPrice ?? 0).toFixed(4)}
                                            </p>
                                        ) : (
                                            <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Points</p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* All Other Assets from CoinGecko */}
                            {loadingMarkets && allChainAssets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-brand-blue mb-2" />
                                    <p className="text-xs text-brand-gray-500">Fetching market data...</p>
                                </div>
                            ) : (
                                allChainAssets.map((coin) => (
                                    <div key={coin.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-50 dark:border-brand-gray-800 shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-brand-gray-50 dark:bg-brand-gray-800 flex items-center justify-center border border-brand-gray-100 dark:border-brand-gray-700 overflow-hidden">
                                                <img src={coin.image} alt={coin.name} className="w-7 h-7 object-contain" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-brand-gray-900 dark:text-white">{coin.name}</p>
                                                <p className="text-[10px] font-bold text-brand-gray-400 uppercase">{coin.symbol}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-brand-gray-900 dark:text-white">0.00</p>
                                            <div className="flex flex-col items-end">
                                                <p className="text-[10px] font-bold text-brand-gray-900 dark:text-white">
                                                    ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                                                </p>
                                                <p className={`text-[8px] font-bold ${(coin.price_change_percentage_24h ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {(coin.price_change_percentage_24h ?? 0) >= 0 ? '+' : ''}{(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </>
                    ) : (
                        <>
                            {/* Network Specific Assets */}
                            {(networkAssets[selectedNetwork] || []).map((asset) => (
                        <div key={asset.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-50 dark:border-brand-gray-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border overflow-hidden ${asset.isTrust ? 'bg-green-500/10 border-green-500/20' : 'bg-brand-gray-50 dark:bg-brand-gray-800 border-brand-gray-100 dark:border-brand-gray-700'}`}>
                                    {asset.isTrust ? (
                                        <Pickaxe size={24} className="text-green-600" />
                                    ) : (
                                        <img src={asset.icon} alt={asset.symbol} className="w-7 h-7 object-contain" onError={(e) => (e.currentTarget.src = 'https://picsum.photos/seed/crypto/40/40')} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-brand-gray-900 dark:text-white">{asset.name}</p>
                                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">{asset.symbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-brand-gray-900 dark:text-white">{(asset.balance ?? 0).toFixed(asset.isRIUM ? 4 : 2)}</p>
                                {asset.isRIUM ? (
                                    <p className={`text-[10px] font-bold ${priceDirection === 'up' ? 'text-green-500' : priceDirection === 'down' ? 'text-red-500' : 'text-brand-gray-400'}`}>
                                        ${(riumPrice ?? 0).toFixed(4)}
                                    </p>
                                ) : asset.isTrust ? (
                                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">Points</p>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-brand-gray-900 dark:text-white">
                                            ${coinPrices[asset.id]?.usd?.toFixed(2) || '0.00'}
                                        </p>
                                        {coinPrices[asset.id]?.usd_24h_change !== undefined && coinPrices[asset.id]?.usd_24h_change !== null && (
                                            <p className={`text-[8px] font-bold ${coinPrices[asset.id].usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {coinPrices[asset.id].usd_24h_change >= 0 ? '+' : ''}{(coinPrices[asset.id].usd_24h_change ?? 0).toFixed(2)}%
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Imported Tokens */}
                    {importedTokens.map((token) => (
                        <div key={token.id} className="flex items-center justify-between p-4 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-50 dark:border-brand-gray-800 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-brand-gray-50 dark:bg-brand-gray-800 flex items-center justify-center border border-brand-gray-100 dark:border-brand-gray-700 overflow-hidden">
                                    <img src={token.thumb || token.icon} alt={token.symbol} className="w-7 h-7 object-contain" />
                                </div>
                                <div>
                                    <p className="font-bold text-brand-gray-900 dark:text-white">{token.name}</p>
                                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase">{token.symbol}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-brand-gray-900 dark:text-white">{(token.balance ?? 0).toFixed(2)}</p>
                                <div className="flex flex-col items-end">
                                    <p className="text-[10px] font-bold text-brand-gray-900 dark:text-white">
                                        ${coinPrices[token.id]?.usd?.toFixed(2) || '0.00'}
                                    </p>
                                    {coinPrices[token.id]?.usd_24h_change !== undefined && coinPrices[token.id]?.usd_24h_change !== null && (
                                        <p className={`text-[8px] font-bold ${coinPrices[token.id].usd_24h_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {coinPrices[token.id].usd_24h_change >= 0 ? '+' : ''}{(coinPrices[token.id].usd_24h_change ?? 0).toFixed(2)}%
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                        </>
                    )}

                    <button 
                        onClick={() => setImportModalOpen(true)}
                        className="w-full py-4 flex items-center justify-center gap-2 text-[11px] font-black tracking-[0.2em] text-brand-blue hover:bg-brand-blue/5 rounded-2xl transition-colors mt-4"
                    >
                        <Plus size={16} />
                        IMPORT TOKENS
                    </button>
                </div>
            ) : (
            <>
                <div className="flex gap-2 items-center mb-4">
                    <div className="relative flex-grow">
                        <Search className="absolute w-5 h-5 text-brand-gray-400 top-1/2 -translate-y-1/2 left-3" />
                        <input 
                            type="text" 
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-2 pl-10 pr-4 text-brand-gray-800 dark:text-white bg-brand-gray-100 dark:bg-brand-gray-800 border-2 border-transparent rounded-lg focus:ring-2 focus:ring-brand-blue focus:outline-none transition-all"
                        />
                    </div>
                    <button onClick={() => setShowFilters(!showFilters)} className={`p-2 rounded-lg transition-colors ${showFilters ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30' : 'bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-500 hover:bg-brand-gray-200 dark:hover:bg-brand-gray-700'}`}>
                        <Filter size={20} />
                    </button>
                </div>
                
                {showFilters && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-xl mb-4 space-y-4 border border-brand-gray-200 dark:border-brand-gray-700"
                    >
                        <div>
                            <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider">Type</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterType === 'all' ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-white dark:bg-brand-gray-700 text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-200 dark:border-brand-gray-600'}`}>All</button>
                                {txTypes.map(type => (
                                    <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filterType === type ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-white dark:bg-brand-gray-700 text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-200 dark:border-brand-gray-600'}`}>{type}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider">Status</label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filterStatus === 'all' ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-white dark:bg-brand-gray-700 text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-200 dark:border-brand-gray-600'}`}>All</button>
                                {txStatuses.map(status => (
                                    <button key={status} onClick={() => setFilterStatus(status)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${filterStatus === status ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/20' : 'bg-white dark:bg-brand-gray-700 text-brand-gray-600 dark:text-brand-gray-300 border border-brand-gray-200 dark:border-brand-gray-600'}`}>{status}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-brand-gray-500 uppercase tracking-wider">Date Range</label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-brand-gray-700 border border-brand-gray-200 dark:border-brand-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue"/>
                                <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="w-full p-2 text-xs bg-white dark:bg-brand-gray-700 border border-brand-gray-200 dark:border-brand-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue"/>
                            </div>
                        </div>
                        <button onClick={handleClearFilters} className="w-full py-2 text-xs font-bold text-brand-blue hover:bg-brand-blue/5 rounded-lg transition-colors">Clear All Filters</button>
                    </motion.div>
                )}

                {filteredTransactions.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto pr-1 custom-scrollbar">
                        {filteredTransactions.map(tx => (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={tx.id} 
                                onClick={() => setShowTxDetail(tx)} 
                                className="cursor-pointer"
                            >
                                <TransactionItem tx={tx} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-full flex items-center justify-center text-brand-gray-400 mb-4">
                            <History size={32} />
                        </div>
                        <p className="text-brand-gray-500 dark:text-brand-gray-400 font-medium">No transactions found</p>
                        <p className="text-xs text-brand-gray-400 dark:text-brand-gray-500 mt-1">Try adjusting your filters or search query</p>
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
};

export default WalletPage;