
import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { X, Bell, Info, Zap, Sparkles, CheckCircle2, Trash2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
    const { notifications, markNotificationAsRead, clearAllNotifications } = useContext(UserContext);

    const getIcon = (type?: string) => {
        switch (type) {
            case 'developer': return <Info className="text-blue-500" size={18} />;
            case 'reminder': return <Zap className="text-amber-500" size={18} />;
            case 'vip': return <Crown className="text-amber-500" size={18} />;
            default: return <Bell className="text-brand-gray-400" size={18} />;
        }
    };

    const getTypeLabel = (type?: string) => {
        switch (type) {
            case 'developer': return 'System Update';
            case 'reminder': return 'Reminder';
            case 'vip': return 'Elite Reward';
            default: return 'Notification';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120]"
                    />

                    {/* Panel */}
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-brand-gray-950 shadow-2xl z-[130] flex flex-col border-l border-brand-gray-100 dark:border-brand-gray-800"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-brand-gray-100 dark:border-brand-gray-800 flex items-center justify-between bg-brand-gray-50/50 dark:bg-brand-gray-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-blue/10 rounded-xl text-brand-blue">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-brand-gray-900 dark:text-white">Notifications</h2>
                                    <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-widest">Stay updated with Trustrium</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button 
                                        onClick={clearAllNotifications}
                                        className="p-2 text-brand-gray-400 hover:text-red-500 transition-colors"
                                        title="Clear All"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="p-2 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-xl text-brand-gray-500 hover:text-brand-gray-900 dark:hover:text-white transition-all active:scale-90"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {notifications.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                                    <div className="w-20 h-20 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-full flex items-center justify-center">
                                        <Bell size={40} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-brand-gray-900 dark:text-white">No notifications yet</p>
                                        <p className="text-xs">We'll notify you when something important happens.</p>
                                    </div>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <motion.div 
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`relative p-4 rounded-3xl border transition-all ${
                                            notif.read 
                                            ? 'bg-white dark:bg-brand-gray-900 border-brand-gray-100 dark:border-brand-gray-800' 
                                            : 'bg-brand-blue/5 dark:bg-brand-blue/10 border-brand-blue/20 shadow-sm'
                                        }`}
                                        onClick={() => markNotificationAsRead(notif.id)}
                                    >
                                        {!notif.read && (
                                            <div className="absolute top-4 right-4 w-2 h-2 bg-brand-blue rounded-full"></div>
                                        )}
                                        <div className="flex gap-4">
                                            <div className="mt-1">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">
                                                        {getTypeLabel(notif.type)}
                                                    </span>
                                                    <span className="text-[10px] text-brand-gray-400">
                                                        {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-brand-gray-900 dark:text-white text-sm leading-tight">
                                                    {notif.title}
                                                </h3>
                                                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
                                                    {notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer / Logo */}
                        <div className="p-6 border-t border-brand-gray-100 dark:border-brand-gray-800 flex flex-col items-center gap-4 bg-brand-gray-50/30 dark:bg-brand-gray-900/30">
                            <img 
                                src="https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png" 
                                alt="Trustrium" 
                                className="h-8 opacity-20 grayscale"
                                referrerPolicy="no-referrer"
                            />
                            <p className="text-[10px] font-bold text-brand-gray-400 uppercase tracking-[0.3em]">Trustrium</p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default NotificationPanel;
