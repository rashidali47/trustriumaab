
import React, { useContext, useState, useRef, useEffect } from 'react';
// Fix: Use named imports for react-router-dom to resolve module export issues.
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { User, Shield, Bell, Lock, LogOut, ChevronRight, CheckCircle, Clock, XCircle, AlertCircle, Edit, Save, X, Camera, Award, Star, UploadCloud, User as UserIcon, Globe2, FileText, ArrowLeft, Loader2, ShieldCheck as VerifiedShield, Share2, ExternalLink, RefreshCw, Smartphone, MapPin, CalendarClock, ShieldAlert } from 'lucide-react';
import { KycStatus, KycData, User as UserType } from '../src/types';
import { COUNTRIES } from '../lib/countries';
import ShareProfileCard from '../components/ui/ShareProfileCard';

const ShieldVerificationBadge: React.FC = () => (
    <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center" title="Verified Account">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
            <path d="M12 2L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-3z" fill="url(#paint0_linear_shield)"/>
            {/* Inner border for depth */}
            <path d="M12 3.34L4.5 6.22V11c0 4.54 3.2 8.79 7.5 9.95 4.3-1.16 7.5-5.41 7.5-9.95V6.22L12 3.34z" stroke="rgba(255,255,255,0.4)" strokeWidth="0.75"/>
            <path d="M9.5 14.5l-2.5-2.5 1.41-1.41L9.5 11.68l4.09-4.09L15 9l-5.5 5.5z" fill="white"/>
            <defs>
                <linearGradient id="paint0_linear_shield" x1="12" y1="2" x2="12" y2="23" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#60A5FA"/>
                </linearGradient>
            </defs>
        </svg>
    </div>
);

const SecurityInfoSection: React.FC<{ lastSignInTime: string | undefined }> = ({ lastSignInTime }) => {
    const [ipAddress, setIpAddress] = useState<string>('Loading...');
    const [deviceInfo, setDeviceInfo] = useState<string>('Unknown Device');

    useEffect(() => {
        // 1. Detect Device
        const ua = navigator.userAgent;
        let device = "Unknown Device";
        if (/android/i.test(ua)) device = "Android Device";
        else if (/iPad|iPhone|iPod/.test(ua)) device = "iOS Device";
        else if (/windows/i.test(ua)) device = "Windows PC";
        else if (/macintosh/i.test(ua)) device = "Mac OS";
        else if (/linux/i.test(ua)) device = "Linux Device";
        
        // Add browser name for more detail
        let browser = "";
        if(ua.indexOf("Chrome") > -1) browser = "Chrome";
        else if (ua.indexOf("Safari") > -1) browser = "Safari";
        else if (ua.indexOf("Firefox") > -1) browser = "Firefox";

        setDeviceInfo(`${device} ${browser ? `(${browser})` : ''}`);

        // 2. Fetch IP
        const fetchIp = async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                setIpAddress(data.ip);
            } catch (e) {
                setIpAddress('Unavailable');
            }
        };
        fetchIp();
    }, []);

    return (
        <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg space-y-4 border border-brand-gray-100 dark:border-brand-gray-800">
            <h3 className="font-bold text-lg flex items-center gap-2 text-brand-gray-700 dark:text-brand-gray-200">
                <ShieldAlert size={20} className="text-brand-blue"/> 
                Login Activity
            </h3>
            <div className="space-y-3">
                {/* Last Login */}
                <div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-lg">
                    <div className="p-2 bg-blue-500/10 rounded-full text-blue-500 shrink-0">
                        <CalendarClock size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-brand-gray-500 uppercase">Last Login</p>
                        <p className="text-sm font-medium text-brand-gray-800 dark:text-brand-gray-200">
                            {lastSignInTime ? new Date(lastSignInTime).toLocaleString() : 'Just now'}
                        </p>
                    </div>
                </div>

                {/* Device Info */}
                <div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-lg">
                    <div className="p-2 bg-green-500/10 rounded-full text-green-500 shrink-0">
                        <Smartphone size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-brand-gray-500 uppercase">Device</p>
                        <p className="text-sm font-medium text-brand-gray-800 dark:text-brand-gray-200">
                            {deviceInfo}
                        </p>
                    </div>
                </div>

                {/* IP Address */}
                <div className="flex items-start gap-3 p-3 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-lg">
                    <div className="p-2 bg-blue-500/10 rounded-full text-blue-500 shrink-0">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-brand-gray-500 uppercase">IP Address</p>
                        <p className="text-sm font-medium text-brand-gray-800 dark:text-brand-gray-200 font-mono">
                            {ipAddress}
                        </p>
                    </div>
                </div>
            </div>
            <p className="text-[10px] text-center text-brand-gray-400">
                This information is visible only to you for security purposes.
            </p>
        </div>
    );
};


const EditProfileModal: React.FC<{ user: UserType; onClose: () => void }> = ({ user, onClose }) => {
    const { updateUser } = useContext(UserContext);
    const [name, setName] = useState(user.name);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
    const avatarFileRef = useRef<File | null>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            avatarFileRef.current = file;
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        updateUser({ name, avatar: avatarPreview || undefined });
        onClose();
    };

    return (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-brand-gray-900 rounded-2xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Profile</h2>
                    <button onClick={onClose}><X size={24}/></button>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col items-center">
                        <label htmlFor="avatar-upload" className="relative cursor-pointer">
                            <img src={avatarPreview || `https://i.pravatar.cc/150?u=${user.id}`} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover"/>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white"/>
                            </div>
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-brand-gray-100 dark:bg-brand-gray-800 rounded-lg mt-1"/>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-brand-gray-200 dark:bg-brand-gray-700">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-brand-blue text-white flex items-center gap-2">
                        <Save size={16}/> Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}

const ProfilePage: React.FC = () => {
  const { user, logout, miningTierInfo, firebaseAuthUser, isGuest, setShowGuestModal } = useContext(UserContext);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  // Fix: Use named useNavigate hook from react-router-dom.
  const navigate = useNavigate();
  
  const TIERS = [
      { tier: 1, name: 'Novice', iconColor: 'text-brand-gray-400' },
      { tier: 2, name: 'Apprentice', iconColor: 'text-yellow-600' },
      { tier: 3, name: 'Journeyman', iconColor: 'text-blue-500' },
      { tier: 4, name: 'Expert', iconColor: 'text-blue-400' },
      { tier: 5, name: 'Master', iconColor: 'text-red-500' },
  ];
  const currentTierStyle = TIERS.find(t => t.tier === miningTierInfo?.tier) || TIERS[0];


  if (!user) return null; 

  // Allow button click if Not Submitted or Rejected.
  // If Pending or Approved, button logic is different or disabled in UI.
  const isKycButtonEnabled = (user.kycStatus === KycStatus.NotSubmitted || user.kycStatus === KycStatus.Rejected) && user.identitySubmitted;

  const handleKycRedirect = () => {
      if (isGuest) {
          setShowGuestModal(true);
          return;
      }
      // Set flag to check status upon return
      localStorage.setItem('trustrium_kyc_pending', 'true');
      
      // REPLACE THIS WITH YOUR ACTUAL EXTERNAL KYC APP URL
      const EXTERNAL_KYC_URL = "https://kyc.trustrium.com/";
      
      // We pass the user ID so the external app knows who to verify
      const redirectUrl = `${EXTERNAL_KYC_URL}?uid=${user.id}`;
      
      window.open(redirectUrl, '_blank');
  }

  return (
    <div className="container mx-auto max-w-lg p-4 space-y-6">
      {showEditProfileModal && <EditProfileModal user={user} onClose={() => setShowEditProfileModal(false)} />}
      {showShareModal && miningTierInfo && <ShareProfileCard user={user} miningTierInfo={miningTierInfo} onClose={() => setShowShareModal(false)} />}


      <div className="flex flex-col items-center p-6 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg relative">
        <button 
            onClick={() => setShowShareModal(true)} 
            className="absolute top-4 right-4 p-2 text-brand-gray-500 hover:text-brand-blue rounded-full hover:bg-brand-blue/10 transition-colors"
            title="Share Profile"
        >
            <Share2 size={20} />
        </button>
        <div className="relative">
            <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt="User Avatar" className="w-24 h-24 rounded-full mb-4 ring-4 ring-brand-blue/50 object-cover"/>
            <button 
                onClick={() => {
                    if (isGuest) setShowGuestModal(true);
                    else setShowEditProfileModal(true);
                }} 
                className="absolute bottom-4 right-0 w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center text-white hover:bg-brand-blue-dark transition-colors"
            >
                <Edit size={16}/>
            </button>
            {user.kycStatus === KycStatus.Approved && <ShieldVerificationBadge />}
        </div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
            {user.name}
            {user.kycStatus === KycStatus.Approved && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-500/20 text-green-500" title="Verified Account">
                <VerifiedShield size={14} /> Verified
                </span>
            )}
        </h2>
        {miningTierInfo && (
            <div className="flex items-center gap-1.5 mt-2 bg-brand-gray-100 dark:bg-brand-gray-800 px-2.5 py-1 rounded-full text-xs font-semibold">
                <Star size={14} className={`${currentTierStyle.iconColor}`} fill="currentColor" />
                <span className={currentTierStyle.iconColor}>{miningTierInfo.name} Tier</span>
            </div>
        )}
        <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-2">@{user.username}</p>
        <p className="text-brand-gray-500 dark:text-brand-gray-400 mt-1">{user.email}</p>
      </div>

      {/* KYC STATUS SECTION */}
      <div className="space-y-4">
          {/* 1. REJECTED STATUS */}
          {user.kycStatus === KycStatus.Rejected && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl animate-fade-in">
                  <div className="flex items-start gap-3">
                      <XCircle size={24} className="text-red-500 shrink-0 mt-0.5"/>
                      <div>
                          <h3 className="text-red-500 font-bold">Verification Rejected</h3>
                          <p className="text-sm text-brand-gray-600 dark:text-brand-gray-300 mt-1">
                              Your KYC application was not approved.
                          </p>
                          {user.kycRejectionReason && (
                              <div className="mt-2 p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                                  <p className="text-xs font-semibold text-brand-gray-500 uppercase mb-1">Reason:</p>
                                  <p className="text-sm font-medium text-brand-gray-800 dark:text-brand-gray-200">
                                      {user.kycRejectionReason}
                                  </p>
                              </div>
                          )}
                          <button 
                            onClick={handleKycRedirect}
                            className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors"
                          >
                              <RefreshCw size={16}/> Try Again
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* 2. PENDING STATUS */}
          {user.kycStatus === KycStatus.Pending && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                      <Clock size={24} className="text-yellow-500 shrink-0 mt-0.5"/>
                      <div>
                          <h3 className="text-yellow-600 dark:text-yellow-500 font-bold">Verification Pending</h3>
                          <p className="text-sm text-brand-gray-600 dark:text-brand-gray-300 mt-1">
                              Your documents are currently under review. This usually takes 24-48 hours.
                          </p>
                      </div>
                  </div>
              </div>
          )}

          {/* 3. APPROVED STATUS */}
          {user.kycStatus === KycStatus.Approved && (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                  <div className="flex items-start gap-3">
                      <VerifiedShield size={24} className="text-green-500 shrink-0 mt-0.5"/>
                      <div>
                          <h3 className="text-green-600 dark:text-green-500 font-bold">Account Verified</h3>
                          <p className="text-sm text-brand-gray-600 dark:text-brand-gray-300 mt-1">
                              You have successfully verified your identity. All wallet features are unlocked.
                          </p>
                      </div>
                  </div>
              </div>
          )}
      </div>

      <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg space-y-2">
        {/* Main KYC Button (Only shown if Not Submitted or Rejected to allow retry) */}
        {(user.kycStatus === KycStatus.NotSubmitted || user.kycStatus === KycStatus.Rejected) && (
            <>
                <button 
                    className={`w-full flex justify-between items-center p-3 rounded-lg transition-colors ${isKycButtonEnabled ? 'hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => { if(isKycButtonEnabled) handleKycRedirect() }}
                    disabled={!isKycButtonEnabled}
                >
                    <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-3 text-brand-blue"/>
                        <span className="font-semibold">
                            {user.kycStatus === KycStatus.Rejected ? 'Retry Verification' : 'KYC Verification'}
                        </span>
                        <ExternalLink size={14} className="ml-2 text-brand-gray-400"/>
                    </div>
                    <ChevronRight className="w-5 h-5 text-brand-gray-400"/>
                </button>
                {!user.identitySubmitted && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 p-3 rounded-lg -mt-2 flex items-start gap-2">
                        <AlertCircle size={18} className="shrink-0"/>
                        <span>Please complete your identity information in <Link to="/settings/account" className="underline text-yellow-700 dark:text-yellow-300">Account Settings</Link> before applying for KYC.</span>
                    </p>
                )}
            </>
        )}
        
        {/* If verified or pending, we can show a disabled list item just to keep the menu structure consistent, or hide it. Hiding is usually cleaner, but let's show a status row */}
        {(user.kycStatus === KycStatus.Pending || user.kycStatus === KycStatus.Approved) && (
             <div className="w-full flex justify-between items-center p-3 opacity-75">
                <div className="flex items-center">
                    <Shield className="w-5 h-5 mr-3 text-brand-blue"/>
                    <span className="font-semibold">KYC Verification</span>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.kycStatus === KycStatus.Approved ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                    {user.kycStatus.toUpperCase()}
                </span>
            </div>
        )}

      </div>
      
      <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg space-y-2">
        <Link to="/settings/account" className="w-full flex justify-between items-center p-3 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 rounded-lg transition-colors">
            <div className="flex items-center">
                <UserIcon className="w-5 h-5 mr-3 text-brand-blue"/>
                <span className="font-semibold">Account Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-gray-400"/>
        </Link>
         <Link to="/settings/notifications" className="w-full flex justify-between items-center p-3 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 rounded-lg transition-colors">
            <div className="flex items-center">
                <Bell className="w-5 h-5 mr-3 text-brand-blue"/>
                <span className="font-semibold">Notifications</span>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-gray-400"/>
        </Link>
         <Link to="/settings/security" className="w-full flex justify-between items-center p-3 hover:bg-brand-gray-100 dark:hover:bg-brand-gray-800 rounded-lg transition-colors">
            <div className="flex items-center">
                <Lock className="w-5 h-5 mr-3 text-brand-blue"/>
                <span className="font-semibold">Security & Privacy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-brand-gray-400"/>
        </Link>
      </div>
      
      {/* New Security Info Section */}
      <SecurityInfoSection lastSignInTime={firebaseAuthUser?.metadata.lastSignInTime} />

      <div className="p-2">
        <button onClick={logout} className="w-full flex justify-center items-center p-3 text-red-500 font-semibold hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut className="w-5 h-5 mr-2"/>
            <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
