
import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const AdminPage: React.FC = () => {
    const { firebaseAuthUser } = useContext(UserContext);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'developer' | 'vip' | 'reminder'>('developer');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const isAdmin = firebaseAuthUser?.email === "rashidali45112@gmail.com" || 
                    firebaseAuthUser?.email === "rashidali451128@gmail.com";

    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p className="text-brand-gray-500">You do not have permission to access this page.</p>
            </div>
        );
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !message) return;

        setLoading(true);
        setStatus(null);

        try {
            await addDoc(collection(db, 'system_notifications'), {
                title,
                message,
                type,
                date: new Date().toISOString(),
                read: false 
            });
            setStatus({ type: 'success', msg: 'Notification sent to all users!' });
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error("Error sending notification:", error);
            setStatus({ type: 'error', msg: 'Failed to send notification.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-2xl mx-auto">
            <div>
                <h1 className="text-3xl font-black text-brand-gray-900 dark:text-white">Admin Control</h1>
                <p className="text-brand-gray-500 text-sm">Send global notifications to all Trustrium users.</p>
            </div>

            <form onSubmit={handleSend} className="bg-white dark:bg-brand-gray-900 p-6 rounded-3xl border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-gray-400">Notification Title</label>
                    <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. System Maintenance"
                        className="w-full p-4 bg-brand-gray-50 dark:bg-brand-gray-950 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue transition-all"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-gray-400">Message Content</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Write your message here..."
                        rows={4}
                        className="w-full p-4 bg-brand-gray-50 dark:bg-brand-gray-950 rounded-2xl border-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-brand-gray-400">Notification Type</label>
                    <div className="grid grid-cols-3 gap-3">
                        {(['developer', 'vip', 'reminder'] as const).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`p-3 rounded-xl border-2 transition-all capitalize text-sm font-bold ${
                                    type === t 
                                    ? 'border-brand-blue bg-brand-blue/10 text-brand-blue' 
                                    : 'border-brand-gray-100 dark:border-brand-gray-800 text-brand-gray-400'
                                }`}
                            >
                                {t === 'vip' ? 'Elite' : t}
                            </button>
                        ))}
                    </div>
                </div>

                {status && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                        status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        {status.msg}
                    </div>
                )}

                <button 
                    type="submit"
                    disabled={loading}
                    className="w-full p-4 bg-brand-blue text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-brand-blue/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? 'Sending...' : (
                        <>
                            <Send size={18} />
                            Send to All Users
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AdminPage;
