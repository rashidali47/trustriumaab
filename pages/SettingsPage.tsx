
import React, { useContext, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { AppContext } from '../contexts/AppContext';
// Fix: Add missing 'X' icon import from lucide-react.
import { User as UserIcon, Bell, Lock, ChevronLeft, ChevronRight, Key, Loader2, Mail, ShieldCheck, Eye, EyeOff, Globe2, Phone, Save, LogOut, X, Volume2, Play, Check } from 'lucide-react';
import { COUNTRIES } from '../lib/countries';

const NOTIFICATION_SOUNDS = [
    { id: 'crystal', name: 'Crystal Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
    { id: 'zen', name: 'Zen Harmony', url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' },
    { id: 'elegant', name: 'Elegant Ping', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
    { id: 'celestial', name: 'Celestial Alert', url: 'https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3' },
];

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { changePassword } = useContext(UserContext);
    const { showSuccessToast, showErrorToast } = useContext(AppContext);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        setError('');
        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        
        setIsLoading(true);
        const result = await changePassword(currentPassword, newPassword);
        setIsLoading(false);
        
        if (result === 'SUCCESS') {
            showSuccessToast("Password updated successfully!");
            onClose();
        } else if (result === 'INVALID_PASSWORD') {
            setError("Incorrect current password.");
        } else if (result === 'REAUTH_REQUIRED') {
            setError("Re-authentication required. Please login again.");
        } else {
            setError("Update failed. Please try again.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
            <div className="bg-white dark:bg-brand-gray-900 rounded-3xl p-8 w-full max-w-md shadow-2xl border border-brand-gray-100 dark:border-brand-gray-800">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Security Update</h2>
                    <button onClick={onClose} className="p-2 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 rounded-full transition-colors"><X size={24}/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-brand-gray-500 uppercase ml-1">Current Password</label>
                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full p-4 mt-1 bg-brand-gray-50 dark:bg-brand-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-brand-gray-500 uppercase ml-1">New Password</label>
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-4 mt-1 bg-brand-gray-50 dark:bg-brand-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-brand-gray-500 uppercase ml-1">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 mt-1 bg-brand-gray-50 dark:bg-brand-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none"/>
                    </div>
                    {error && <p className="text-sm text-red-500 font-medium px-2">{error}</p>}
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-4 font-bold rounded-2xl bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-600 dark:text-brand-gray-300">Cancel</button>
                    <button onClick={handleSubmit} disabled={isLoading} className="flex-2 px-8 py-4 font-bold text-white bg-brand-blue rounded-2xl hover:bg-brand-blue-dark flex items-center justify-center gap-2 disabled:opacity-50">
                        {isLoading ? <Loader2 size={20} className="animate-spin"/> : <Lock size={20}/>}
                        Update
                    </button>
                </div>
            </div>
        </div>
    )
}

const SettingsPage: React.FC = () => {
    const { page } = useParams();
    const navigate = useNavigate();
    const { user, updateUser, updateUserSettings, logout, addNotification } = useContext(UserContext);
    const { showSuccessToast } = useContext(AppContext);
    
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for Account page
    const [name, setName] = useState(user?.name || '');
    const [countryCode, setCountryCode] = useState(user?.phone.countryCode || '+1');
    const [phoneNumber, setPhoneNumber] = useState(user?.phone.number || '');

    if (!user) return null;

    const handleAccountSave = async () => {
        setIsSaving(true);
        await updateUser({
            name,
            phone: { countryCode, number: phoneNumber }
        });
        setIsSaving(false);
        showSuccessToast("Account settings updated!");
    };

    const renderHeader = (title: string) => (
        <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigate('/profile')} className="p-2 rounded-full bg-brand-gray-50 dark:bg-brand-gray-900 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 transition-colors">
                <ChevronLeft size={24} />
            </button>
            <h1 className="text-3xl font-black text-brand-gray-900 dark:text-white uppercase tracking-tighter">{title}</h1>
        </div>
    );

    if (page === 'account') {
        return (
            <div className="container mx-auto max-w-lg p-6 space-y-8 pb-32">
                {renderHeader("Account")}
                
                <div className="bg-white dark:bg-brand-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-brand-gray-100 dark:border-brand-gray-800 space-y-6">
                    <div className="flex flex-col items-center mb-4">
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-brand-gray-50 dark:border-brand-gray-800">
                            <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.id}`} className="w-full h-full object-cover" />
                        </div>
                        <p className="mt-2 text-xs font-black text-brand-blue uppercase tracking-[0.2em]">Current Node Identity</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative mt-1">
                                <UserIcon className="absolute left-4 top-4 text-brand-gray-400" size={18} />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 pl-12 bg-brand-gray-50 dark:bg-brand-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium"/>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                            <div className="flex gap-2 mt-1">
                                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-24 p-4 bg-brand-gray-50 dark:bg-brand-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none text-sm appearance-none text-center">
                                    {COUNTRIES.map(c => <option key={c.code} value={c.dial_code}>{c.code} {c.dial_code}</option>)}
                                </select>
                                <div className="relative flex-1">
                                    <Phone className="absolute left-4 top-4 text-brand-gray-400" size={18} />
                                    <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full p-4 pl-12 bg-brand-gray-50 dark:bg-brand-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-brand-blue focus:outline-none font-medium"/>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button onClick={handleAccountSave} disabled={isSaving} className="w-full py-5 rounded-[1.8rem] bg-brand-blue text-white font-black tracking-widest uppercase text-sm shadow-xl shadow-brand-blue/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                                Commit Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (page === 'notifications') {
        const [playingId, setPlayingId] = useState<string | null>(null);

        const playPreview = (id: string, url: string) => {
            setPlayingId(id);
            const audio = new Audio(url);
            audio.volume = 0.5;
            audio.onended = () => setPlayingId(null);
            audio.play().catch(e => {
                console.log("Preview blocked");
                setPlayingId(null);
            });
        };

        return (
            <div className="container mx-auto max-w-lg p-6 space-y-8 pb-32">
                {renderHeader("Alerts")}
                <div className="bg-white dark:bg-brand-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-brand-gray-100 dark:border-brand-gray-800 space-y-8">
                    {/* Push Notifications */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="font-bold text-brand-gray-900 dark:text-white">Push Notifications</p>
                            <p className="text-xs text-brand-gray-500">Real-time mining and transaction alerts</p>
                            {typeof window !== 'undefined' && "Notification" in window && Notification.permission !== 'granted' && (
                                <button 
                                    onClick={() => Notification.requestPermission()}
                                    className="text-[10px] text-brand-blue font-bold uppercase tracking-wider hover:underline"
                                >
                                    Enable Browser Permissions
                                </button>
                            )}
                        </div>
                        <button 
                            onClick={() => updateUserSettings({ notifications: { ...user.settings.notifications, push: !user.settings.notifications.push } })}
                            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${user.settings.notifications.push ? 'bg-brand-blue' : 'bg-brand-gray-200 dark:bg-brand-gray-800'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${user.settings.notifications.push ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Volume2 size={16} className="text-brand-blue" />
                                <p className="font-bold text-brand-gray-900 dark:text-white">Notification Sound</p>
                            </div>
                            <p className="text-xs text-brand-gray-500">Play audio alert for new notifications</p>
                        </div>
                        <button 
                            onClick={() => updateUserSettings({ notifications: { ...user.settings.notifications, soundEnabled: !user.settings.notifications.soundEnabled } })}
                            className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${user.settings.notifications.soundEnabled ? 'bg-brand-blue' : 'bg-brand-gray-200 dark:bg-brand-gray-800'}`}
                        >
                            <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-md ${user.settings.notifications.soundEnabled ? 'left-7' : 'left-1'}`}></div>
                        </button>
                    </div>

                    {/* Sound Selection */}
                    {user.settings.notifications.soundEnabled && (
                        <div className="space-y-4 pt-4 border-t border-brand-gray-100 dark:border-brand-gray-800">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-brand-gray-400 uppercase tracking-widest ml-1">Select Alert Tone</p>
                                <button 
                                    onClick={() => addNotification("System Test", "This is a test notification to verify your alert settings.", "developer")}
                                    className="text-[10px] font-black text-brand-blue uppercase tracking-widest hover:underline"
                                >
                                    Test Alert
                                </button>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {NOTIFICATION_SOUNDS.map((sound) => (
                                    <div 
                                        key={sound.id}
                                        onClick={() => updateUserSettings({ notifications: { ...user.settings.notifications, notificationSound: sound.url } })}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                            user.settings.notifications.notificationSound === sound.url 
                                            ? 'border-brand-blue bg-brand-blue/5' 
                                            : 'border-brand-gray-100 dark:border-brand-gray-800 hover:border-brand-gray-200 dark:hover:border-brand-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full transition-colors ${user.settings.notifications.notificationSound === sound.url ? 'bg-brand-blue text-white' : 'bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-400'}`}>
                                                {user.settings.notifications.notificationSound === sound.url ? <Check size={14} /> : <Bell size={14} />}
                                            </div>
                                            <p className={`font-bold text-sm ${user.settings.notifications.notificationSound === sound.url ? 'text-brand-blue' : 'text-brand-gray-900 dark:text-white'}`}>
                                                {sound.name}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playPreview(sound.id, sound.url);
                                            }}
                                            className={`p-2 rounded-full transition-all ${playingId === sound.id ? 'bg-brand-blue text-white scale-110' : 'hover:bg-brand-blue/10 text-brand-blue'}`}
                                        >
                                            {playingId === sound.id ? (
                                                <div className="flex gap-0.5 items-end h-4 w-4 justify-center">
                                                    <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.1s] h-full"></div>
                                                    <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.2s] h-2/3"></div>
                                                    <div className="w-1 bg-white animate-[bounce_0.6s_infinite_0.3s] h-full"></div>
                                                </div>
                                            ) : (
                                                <Play size={16} fill="currentColor" />
                                            )}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between opacity-50 pt-4 border-t border-brand-gray-100 dark:border-brand-gray-800">
                        <div className="space-y-1">
                            <p className="font-bold text-brand-gray-900 dark:text-white">Email Communications</p>
                            <p className="text-xs text-brand-gray-500">Weekly reports and security updates</p>
                        </div>
                        <button className="w-14 h-8 rounded-full bg-brand-gray-200 dark:bg-brand-gray-800 cursor-not-allowed">
                            <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md"></div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (page === 'security') {
        return (
            <div className="container mx-auto max-w-lg p-6 space-y-8 pb-32">
                {renderHeader("Security")}
                {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
                
                <div className="space-y-4">
                    <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-6 bg-white dark:bg-brand-gray-900 rounded-[2rem] shadow-md border border-brand-gray-50 dark:border-brand-gray-800 hover:scale-[1.02] active:scale-98 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-2xl">
                                <Key size={24}/>
                            </div>
                            <div className="text-left">
                                <p className="font-bold">Access Password</p>
                                <p className="text-xs text-brand-gray-500">Update your login credentials</p>
                            </div>
                        </div>
                        <ChevronRight size={20} className="text-brand-gray-400" />
                    </button>

                    <div className="p-8 bg-brand-gray-50 dark:bg-brand-gray-950 rounded-[2.5rem] border border-dashed border-brand-gray-200 dark:border-brand-gray-800 text-center">
                        <ShieldCheck size={40} className="mx-auto text-brand-blue mb-3 opacity-30" />
                        <h3 className="font-black text-xs uppercase tracking-widest text-brand-gray-400 mb-1">Protected Node</h3>
                        <p className="text-[10px] text-brand-gray-500 leading-relaxed max-w-[200px] mx-auto italic">Your wallet is secured with high-entropy military grade encryption.</p>
                    </div>
                    
                    <button onClick={logout} className="w-full flex items-center justify-center gap-2 p-6 text-red-500 font-bold hover:bg-red-500/5 rounded-3xl transition-colors">
                        <LogOut size={20}/>
                        Terminate Session
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default SettingsPage;
