
import React, { useEffect, useState, useContext } from 'react';
import { Coins, Globe, Twitter, Send, Instagram, Users, Activity, Crown, ChevronUp, ChevronDown, Github, Pickaxe, Apple, Smartphone, Download } from 'lucide-react';
import { db } from '../lib/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { UserContext } from '../contexts/UserContext';
import { LeaderboardUser } from '../types';

const CARD_CLASSES = "bg-white dark:bg-brand-gray-900 rounded-3xl border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm transition-all duration-300 hover:shadow-md";

const Leaderboard: React.FC<{ users: LeaderboardUser[], unit: string }> = ({ users, unit }) => {
    const top3 = users.slice(0, 3);
    const others = users.slice(3);

    const p1 = top3.find(u => u.rank === 1);
    const p2 = top3.find(u => u.rank === 2);
    const p3 = top3.find(u => u.rank === 3);
    
    const hasEnoughForPodium = p1 && p2 && p3;

    return (
        <div>
            {hasEnoughForPodium ? (
                <>
                    <div className="flex justify-center items-end h-48 mb-6">
                        {/* 3rd Place */}
                        <div className="flex flex-col items-center justify-end w-1/3 px-1 h-[80%]">
                            <div className="relative z-10">
                                <img src={p3.avatar} alt={p3.username} className="w-12 h-12 rounded-full object-cover border-4 border-amber-600 dark:border-amber-500"/>
                            </div>
                            <p className="font-bold mt-2 truncate max-w-full text-center text-sm">{p3.username}</p>
                            <p className="text-xs text-brand-blue font-semibold">
                                {p3.value.toLocaleString(undefined, { maximumFractionDigits: unit === 'Trust' ? 2 : 0, minimumFractionDigits: unit === 'Trust' ? 2 : 0 })} <span className="text-brand-gray-500">{unit}</span>
                            </p>
                            <div className="w-full bg-amber-600 dark:bg-amber-500 rounded-t-lg mt-2 h-16 flex items-center justify-center">
                                <span className="text-2xl font-bold text-white/80">3</span>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="flex flex-col items-center justify-end w-1/3 px-1 h-[100%]">
                             <Crown size={32} className="text-yellow-400 -mb-4 z-10 drop-shadow-lg"/>
                            <div className="relative z-10">
                                <img src={p1.avatar} alt={p1.username} className="w-16 h-16 rounded-full object-cover border-4 border-yellow-400"/>
                            </div>
                            <p className="font-bold mt-2 truncate max-w-full text-center">{p1.username}</p>
                            <p className="text-sm text-brand-blue font-semibold">
                                {p1.value.toLocaleString(undefined, { maximumFractionDigits: unit === 'Trust' ? 2 : 0, minimumFractionDigits: unit === 'Trust' ? 2 : 0 })} <span className="text-brand-gray-500">{unit}</span>
                            </p>
                            <div className="w-full bg-yellow-400 rounded-t-lg mt-2 h-24 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white/80">1</span>
                            </div>
                        </div>
                        
                        {/* 2nd Place */}
                        <div className="flex flex-col items-center justify-end w-1/3 px-1 h-[90%]">
                            <div className="relative z-10">
                                <img src={p2.avatar} alt={p2.username} className="w-14 h-14 rounded-full object-cover border-4 border-slate-400 dark:border-slate-500"/>
                            </div>
                            <p className="font-bold mt-2 truncate max-w-full text-center">{p2.username}</p>
                            <p className="text-sm text-brand-blue font-semibold">
                                {p2.value.toLocaleString(undefined, { maximumFractionDigits: unit === 'Trust' ? 2 : 0, minimumFractionDigits: unit === 'Trust' ? 2 : 0 })} <span className="text-brand-gray-500">{unit}</span>
                            </p>
                            <div className="w-full bg-slate-400 dark:bg-slate-500 rounded-t-lg mt-2 h-20 flex items-center justify-center">
                                <span className="text-3xl font-bold text-white/80">2</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {others.map((user) => (
                             <div key={user.rank} className={`flex items-center justify-between p-3 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm`}>
                                <div className="flex items-center">
                                    <span className="font-bold w-8 text-center text-brand-gray-500">{user.rank}</span>
                                    <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full mx-3 border-2 border-white dark:border-brand-gray-800 shadow-sm"/>
                                    <span className="font-semibold">{user.username}</span>
                                </div>
                                <div className="font-bold text-brand-blue">
                                    {user.value.toLocaleString(undefined, { maximumFractionDigits: unit === 'Trust' ? 2 : 0, minimumFractionDigits: unit === 'Trust' ? 2 : 0 })} <span className="text-sm text-brand-gray-500">{unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="space-y-3">
                    {users.length > 0 ? users.map((user) => (
                        <div key={user.rank} className={`flex items-center justify-between p-3 bg-white dark:bg-brand-gray-900 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-800 shadow-sm`}>
                             <div className="flex items-center">
                                <span className="font-bold w-8 text-center">{user.rank}</span>
                                <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full mx-3 border-2 border-white dark:border-brand-gray-800 shadow-sm"/>
                                <span className="font-semibold">{user.username}</span>
                            </div>
                            <div className="font-bold text-brand-blue">
                                {user.value.toLocaleString(undefined, { maximumFractionDigits: unit === 'Trust' ? 2 : 0, minimumFractionDigits: unit === 'Trust' ? 2 : 0 })} <span className="text-sm text-brand-gray-500">{unit}</span>
                            </div>
                        </div>
                    )) : <p className="text-center text-brand-gray-500 py-8">Not enough data for leaderboards yet.</p>}
                </div>
            )}
        </div>
    );
};

const DiscordIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.36981C18.8824 3.73763 17.3314 3.2842 15.6984 3.03396C15.6453 3.1611 15.5869 3.29299 15.5231 3.42963C14.3948 3.22031 13.2263 3.125 12 3.125C10.7737 3.125 9.60519 3.22031 8.47686 3.42963C8.41305 3.29299 8.35465 3.1611 8.3016 3.03396C6.66859 3.2842 5.11765 3.73763 3.68305 4.36981C1.22902 6.78466 0.231213 9.77198 0.0526221 12.9157C0.0361284 13.136 0.0249051 13.3562 0.0192934 13.5763C0.0136817 13.7964 0.0136817 14.0166 0.0192934 14.2314C0.253903 18.026 2.0733 20.6152 4.67131 21.9443C5.59253 22.4289 6.55938 22.7834 7.55734 22.9927C7.63378 22.8443 7.70496 22.6906 7.77088 22.5369C7.21111 22.3063 6.67913 22.0284 6.17495 21.7032C6.12648 21.6769 6.07801 21.6453 6.03481 21.6189C5.98634 21.5873 5.94314 21.5557 5.89994 21.5242C5.89467 21.5189 5.88941 21.5137 5.88414 21.5084C5.40939 21.149 5.03518 20.6792 4.79058 20.1292C4.78531 20.1186 4.77478 20.0975 4.76424 20.0763C4.54201 19.5596 4.41484 18.9956 4.40957 18.4053C4.40431 18.3149 4.40431 18.2192 4.40431 18.1235C4.40431 18.0645 4.40431 17.995 4.41484 17.9359C4.45799 17.3037 4.64771 16.7134 4.93796 16.1818C4.94849 16.1606 4.96429 16.1342 4.97482 16.113C5.46503 15.0805 6.36643 14.199 7.55734 13.627C7.55734 13.627 7.55734 13.627 7.55734 13.6217C8.9558 12.9369 10.4283 12.562 12 12.562C13.5717 12.562 15.0442 12.9369 16.4427 13.6217C16.4427 13.627 16.4427 13.627 16.4427 13.627C17.6336 14.199 18.535 15.0805 19.0252 16.113C19.0357 16.1342 19.0515 16.1606 19.0621 16.1818C19.3523 16.7134 19.542 17.3037 19.5852 17.9359C19.5957 17.995 19.5957 18.0645 19.5957 18.1235C19.5957 18.2192 19.5957 18.3149 19.5904 18.4053C19.5852 18.9956 19.458 19.5596 19.2358 20.0763C19.2252 20.0975 19.2147 20.1186 19.2094 20.1292C18.9648 20.6792 18.5906 21.149 18.1159 21.5084C18.1106 21.5137 18.1053 21.5189 18.1001 21.5242C18.0569 21.5557 18.0137 21.5873 17.9652 21.6189C17.922 21.6453 17.8735 21.6769 17.825 21.7032C17.3209 22.0284 16.7889 22.3063 16.2291 22.5369C16.295 22.6906 16.3662 22.8443 16.4427 22.9927C17.4406 22.7834 18.4075 22.4289 19.3287 21.9443C21.9267 20.6152 23.7461 18.026 23.9807 14.2314C23.9863 14.0166 23.9863 13.7964 23.9807 13.5763C23.9751 13.3562 23.9639 13.136 23.9474 12.9157C23.7688 9.77198 22.771 6.78466 20.317 4.36981ZM8.43232 18.1447C7.43436 18.1447 6.61719 17.2901 6.61719 16.2576C6.61719 15.2251 7.4289 14.3705 8.43232 14.3705C9.43574 14.3705 10.2582 15.2251 10.2529 16.2576C10.2529 17.2901 9.43574 18.1447 8.43232 18.1447ZM15.5677 18.1447C14.5697 18.1447 13.7525 17.2901 13.7525 16.2576C13.7525 15.2251 14.5642 14.3705 15.5677 14.3705C16.5711 14.3705 17.3936 15.2251 17.3883 16.2576C17.3883 17.2901 16.5711 18.1447 15.5677 18.1447Z" />
    </svg>
);

const WhatsAppIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
       <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
);

const SocialLink: React.FC<{ icon: React.ElementType, href: string, label: string }> = ({ icon: Icon, href, label }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 text-brand-gray-500 dark:text-brand-gray-400 hover:text-brand-blue dark:hover:text-brand-blue-light transition-colors group">
        <div className={`w-12 h-12 ${CARD_CLASSES} flex items-center justify-center !rounded-full`}>
            <Icon size={20} />
        </div>
        <span className="text-xs font-semibold">{label}</span>
    </a>
);

const DownloadButton: React.FC<{ 
    src: string, 
    alt: string,
    isComingSoon?: boolean,
    onClick?: () => void 
}> = ({ src, alt, isComingSoon, onClick }) => (
    <button 
        onClick={onClick}
        disabled={isComingSoon}
        className={`bg-transparent p-0 border-none relative group transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${isComingSoon ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <img 
            src={src} 
            alt={alt} 
            className="w-full h-auto rounded-xl"
            referrerPolicy="no-referrer"
        />
        {isComingSoon && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-brand-blue/80 text-white text-[8px] font-bold rounded-full uppercase tracking-tighter backdrop-blur-sm">
                Coming Soon
            </div>
        )}
    </button>
);

const ExplorePage: React.FC = () => {
    const { leaderboards, totalEarnedTrust, circulatingSupply, totalUsers, isAuthLoading } = useContext(UserContext);

    const [showMinersLeaderboard, setShowMinersLeaderboard] = useState(true);
    const [showReferrersLeaderboard, setShowReferrersLeaderboard] = useState(true);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

  return (
    <div className="container mx-auto max-w-lg p-4 overflow-hidden">
        
        {/* Network Status Banner (Optional visual enhancement) */}
        <div className={`p-5 mb-8 text-white flex items-center justify-between border-none ${CARD_CLASSES} !bg-gradient-to-r from-brand-blue to-brand-blue-dark !shadow-none`}>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-0 w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
                </div>
                <div>
                    <p className="font-bold text-sm">Trustrium Network Live</p>
                    <p className="text-xs opacity-80">System operational</p>
                </div>
            </div>
            <Activity size={20} className="text-white opacity-80"/>
        </div>

        {/* Follow Our Journey Section - Moved Up */}
        <div className="text-center mb-12">
            <h2 className="text-xl font-bold">Follow Our Journey</h2>
            <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1">Stay updated with our latest progress.</p>
            <div className="flex justify-center gap-4 sm:gap-6 mt-4 flex-wrap">
                <SocialLink href="https://x.com/trustrium" icon={Twitter} label="X" />
                <SocialLink href="https://t.me/trustrium_chat" icon={Send} label="Telegram" />
                <SocialLink href="https://discord.gg/CrkfN7CXGc" icon={DiscordIcon} label="Discord" />
                <SocialLink href="https://github.com/Trustrium" icon={Github} label="GitHub" />
                <SocialLink href="https://www.instagram.com/trustrium_official" icon={Instagram} label="Instagram" />
                <SocialLink href="https://whatsapp.com/channel/0029Vb7N5ja0lwggklkWPh2p" icon={WhatsAppIcon} label="WhatsApp" />
            </div>
        </div>

        {/* Download App Section */}
        <div className="mb-12">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold">Download Our App</h2>
                <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1">Experience Trustrium on your mobile device.</p>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <DownloadButton 
                        src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/playstore.png"
                        alt="Download App Play Store" 
                        isComingSoon 
                    />
                    <DownloadButton 
                        src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/appstore.png"
                        alt="App Store" 
                        isComingSoon 
                    />
                </div>
                <div className="flex justify-center">
                    <div className="w-1/2">
                        <DownloadButton 
                            src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/riumdownload.png"
                            alt="APK Download" 
                            onClick={handleInstallClick}
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-8 mb-12">
            {/* All-Time Earned Trust Block */}
            <div className={`p-6 ${CARD_CLASSES} border-none`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center mr-4 bg-brand-blue/10 text-brand-blue">
                            <Pickaxe size={24}/>
                        </div>
                        <div>
                            <p className="font-bold text-brand-gray-900 dark:text-white">All-Time Earned Trust</p>
                            <p className="text-lg font-black text-brand-blue">{totalEarnedTrust.toFixed(2)} Trust</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-center mt-4 text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
                    This is a cumulative record of all Trust points you've ever earned from any source, including in-progress mining, unaffected by any swaps or expenditures.
                </p>
            </div>
        </div>
    </div>
  );
};

export default ExplorePage;
