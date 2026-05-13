
import React, { useContext, useState, useEffect, useRef } from 'react';
import { UserContext, MissionWithProgress } from '../contexts/UserContext';
import { Users, Link, Bell, UserCheck, UserX, Zap, Send, PlusCircle, CheckCircle, ZapOff, Package, Share2, Award, Copy, ChevronUp, ChevronDown, Gift, ShieldCheck, AlertTriangle, Trophy } from 'lucide-react';
import { KycStatus, LeaderboardUser } from '../types';
import { AppContext } from '../contexts/AppContext'; // Import AppContext for toasts
import { RewardAnimation } from '../components/ui/RewardAnimation';
import { useNavigate } from 'react-router-dom';

const ReferralRewardGuide = () => (
    <div className="space-y-4 text-sm text-brand-gray-600 dark:text-brand-gray-300">
        <div className="flex items-start gap-3">
            <div className="p-2 bg-brand-blue/10 rounded-full text-brand-blue shrink-0"><Users size={20} /></div>
            <div>
                <p className="font-bold">1. Invite Your Friends</p>
                <p>Share your unique referral link. For every friend who signs up, you get a pending reward of 1 Trust.</p>
            </div>
        </div>
        <div className="flex items-start gap-3">
            <div className="p-2 bg-green-500/10 rounded-full text-green-500 shrink-0"><ShieldCheck size={20} /></div>
            <div>
                <p className="font-bold">2. They Get Verified</p>
                <p>When your friend completes their KYC verification, your pending reward becomes verified and is added to your main balance.</p>
            </div>
        </div>
        <div className="flex items-start gap-3">
             <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500 shrink-0"><Gift size={20} /></div>
            <div>
                <p className="font-bold">3. Earn Instant & Long-Term Rewards</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                    <li><span className="font-semibold text-green-500">+1 Trust</span> instantly added to your balance.</li>
                    <li><span className="font-semibold text-brand-blue">+0.25 Trust/Day</span> permanently added to your mining rate.</li>
                </ul>
                <p className="text-xs mt-2 text-brand-gray-500">The more verified referrals you have, the faster you mine!</p>
            </div>
        </div>
    </div>
);


const MissionItem: React.FC<{ mission: MissionWithProgress; onClaim: (id: string) => void }> = ({ mission, onClaim }) => {
    // A mission is claimable if it's completed and not claimed.
    // The `UserContext` `getMissionsWithProgress` already sets `isCompleted` appropriately for `social_share`.
    const isClaimableNow = (!mission.isClaimed && mission.isCompleted); 
    const progressPercentage = mission.goal > 0 ? Math.min((mission.progress / mission.goal) * 100, 100) : (mission.isCompleted ? 100 : 0);

    const getIcon = () => {
         if (mission.type === 'social_share') return <Share2 size={24} className="text-white" />;
         return <Users size={24} className="text-white" />;
    };
    
    // Determine card background based on status
    let cardClasses = 'p-4 rounded-lg transition-all';
    if (mission.isClaimed) {
        cardClasses += ' bg-brand-gray-50 dark:bg-brand-gray-800 opacity-60 grayscale'; // Dim and grayscale if claimed
    } else if (isClaimableNow) {
        cardClasses += ' bg-green-500/10 dark:bg-green-500/20 border border-green-500/50'; // Ready to claim
    } else {
        cardClasses += ' bg-brand-gray-50 dark:bg-brand-gray-800'; // In progress
    }
    
    // Determine button classes
    let buttonClasses = 'w-full mt-4 py-2 font-semibold text-white rounded-lg transition-colors';
    if (isClaimableNow) {
        buttonClasses += ' bg-green-500 hover:bg-green-600';
    } else {
        buttonClasses += ' bg-brand-blue/50 cursor-not-allowed';
    }

    return (
        <div className={cardClasses}>
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-lg flex items-center justify-center shrink-0">
                    {getIcon()}
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                           <p className="font-bold">{mission.title}</p>
                           <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">{mission.description}</p>
                        </div>
                         <div className="text-right shrink-0 ml-2">
                            <p className="font-bold text-lg text-yellow-500 flex items-center gap-1">
                               <Award size={16} /> +{mission.reward}
                            </p>
                            <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">Trust</p>
                        </div>
                    </div>
                </div>
            </div>

            {mission.type === 'referral_kyc' && (
              <div className="flex items-center gap-4 mt-3">
                  <div className="flex-grow">
                      <div className="w-full bg-brand-gray-200 dark:bg-brand-gray-700 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                      </div>
                  </div>
                  <span className="text-sm font-semibold text-brand-gray-500">{mission.progress} / {mission.goal}</span>
              </div>
            )}

            {mission.isClaimed ? (
                <div className="w-full mt-4 py-2 font-semibold text-green-500 bg-green-500/10 rounded-lg flex items-center justify-center gap-2 cursor-default">
                    <CheckCircle size={16} />
                    Reward Claimed
                </div>
            ) : (
                <button
                    onClick={() => onClaim(mission.id)}
                    disabled={!isClaimableNow}
                    className={buttonClasses}
                >
                    {isClaimableNow ? 'Claim Reward' : 'In Progress'}
                </button>
            )}
        </div>
    );
};

const ReferralPage: React.FC = () => {
    // Fix: Include unverifiedTrustBalance in UserContext destructuring to resolve property error.
    const { user, referrals, addNotification, leaderboards, missions, claimMissionReward, unverifiedTrustBalance, verifyReferral, isGuest, setShowGuestModal } = useContext(UserContext);
    const { showSuccessToast } = useContext(AppContext);
    const navigate = useNavigate();
    const [rewardEffect, setRewardEffect] = useState<{ amount: number; key: number; unit: string; } | null>(null);
    const [showReferralGuide, setShowReferralGuide] = useState(false);
    
    const [showReferralMissions, setShowReferralMissions] = useState(true);

    const handleMiningRemind = (name: string) => {
        addNotification('Reminder Sent!', `A mining reminder has been sent to @${name}.`);
    };

    const handleKycRemind = (name: string) => {
        addNotification('Reminder Sent!', `A reminder to complete KYC has been sent to @${name}.`);
    };

    const handlePingAll = () => {
        const inactiveCount = referrals.filter(r => r.miningStatus === 'inactive' && r.kycStatus === KycStatus.Approved).length;
        if(inactiveCount > 0) {
            addNotification('Pings Sent!', `You've pinged ${inactiveCount} inactive (but verified) team members.`);
        } else {
            addNotification('Team is Active!', "All your verified team members are currently active.");
        }
    };

    const triggerClaimMission = (missionId: string) => {
        if (isGuest) {
            setShowGuestModal(true);
            return;
        }
        const mission = missions.find(m => m.id === missionId);
        if (mission && mission.isCompleted && !mission.isClaimed) {
            setRewardEffect({ amount: mission.reward, unit: 'Trust', key: Date.now() });
            claimMissionReward(missionId);
        }
    };

    // Updated Referral Link Format: webappURL/signup?ref={username}
    const referralLink = `${window.location.origin}/signup?ref=${user?.username}`;
    
    const handleShare = () => {
        if (isGuest) {
            setShowGuestModal(true);
            return;
        }
        claimMissionReward('social_1');

        if (navigator.share) {
            navigator.share({
                title: 'Join me on Trustrium Mining!',
                text: `Start mining Trust and Earn $RIUM with me. Use my referral code: ${user?.username}`,
                url: referralLink,
            })
            .then(() => showSuccessToast('Shared successfully!'))
            .catch((error) => console.log('Error sharing', error));
        } else {
            navigator.clipboard.writeText(referralLink);
            showSuccessToast('Link copied to clipboard!');
        }
    };
    
    const activeReferrals = referrals.filter(r => r.kycStatus === KycStatus.Approved);
    const miningBonus = (activeReferrals.length || 0) * 0.25;
    const verifiedEarnings = activeReferrals.length * 1;

    return (
        <div className="container mx-auto max-w-lg p-4 space-y-6 relative">
            <button 
                onClick={() => navigate('/leaderboard')}
                className="absolute top-4 right-4 p-1.5 bg-white dark:bg-brand-gray-900 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all z-20 border border-brand-gray-100 dark:border-brand-gray-800 group"
            >
                <img 
                    src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/trophy.png" 
                    alt="Leaderboard" 
                    className="w-8 h-8 object-contain dark:brightness-110 dark:drop-shadow-[0_0_8px_rgba(234,179,8,0.3)] group-hover:rotate-12 transition-transform"
                    referrerPolicy="no-referrer"
                />
            </button>

            {rewardEffect && <RewardAnimation key={rewardEffect.key} amount={rewardEffect.amount} unit={rewardEffect.unit} onAnimationEnd={() => setRewardEffect(null)} />}

            <div className="p-6 bg-gradient-to-br from-brand-blue to-brand-blue-dark text-white rounded-2xl shadow-lg shadow-brand-blue/30 text-center relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-20 rotate-12 pointer-events-none">
                    <img 
                        src="https://raw.githubusercontent.com/Trustrium/Icon/refs/heads/main/trophy.png" 
                        alt="" 
                        className="w-16 h-16 object-contain brightness-0 invert"
                        referrerPolicy="no-referrer"
                    />
                </div>
                <h1 className="text-xl font-bold mb-2 relative z-10">Build Your Team</h1>
                <p className="opacity-80 relative z-10">
                    Invite friends to boost your mining rate and earn rewards together.
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg text-center">
                    <Users className="w-6 h-6 mx-auto text-brand-blue"/>
                    <p className="text-xl font-bold mt-2">{referrals.length || 0}</p>
                    <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400">Total Referrals</p>
                </div>
                 <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg text-center">
                    <UserCheck className="w-6 h-6 mx-auto text-green-500"/>
                    <p className="text-xl font-bold mt-2">{activeReferrals.length || 0}</p>
                    <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400">Verified Referrals</p>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg text-center">
                    <Zap className="w-6 h-6 mx-auto text-brand-blue"/>
                    <p className="text-xl font-bold mt-2">+{(miningBonus ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400">Mining Bonus/Day</p>
                </div>
                <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg text-center">
                    <Gift className="w-6 h-6 mx-auto text-brand-blue"/>
                    <p className="text-xl font-bold mt-2">{(verifiedEarnings ?? 0).toFixed(2)}</p>
                    <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400">Total Rewards</p>
                </div>
            </div>

            <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 bg-yellow-500/20 text-yellow-500">
                            <AlertTriangle size={20}/>
                        </div>
                        <div>
                            <p className="font-semibold">Unverified Balance</p>
                            <p className="text-xl font-bold text-yellow-500">{(unverifiedTrustBalance ?? 0).toFixed(2)} Trust</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-center mt-2 text-brand-gray-500 dark:text-brand-gray-400">
                    This balance is from unverified referrals. It will be moved to your main Trust balance after they complete KYC.
                </p>
            </div>

            <div className="p-6 bg-gradient-to-tr from-brand-blue to-brand-blue-dark text-white rounded-2xl shadow-lg shadow-brand-blue/30">
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Link size={20}/> Share Your Link</h3>
                <p className="text-sm opacity-80 mb-4">Invite friends and earn rewards for every successful referral.</p>
                <div className="bg-black/20 p-2 rounded-lg flex items-center justify-between">
                    <p className="font-mono text-xs truncate flex-grow mr-2">{referralLink}</p>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(referralLink);
                            showSuccessToast('Referral link copied!');
                        }}
                        className="flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-white/30 transition-colors shrink-0"
                        title="Copy link"
                    >
                        <Copy size={14}/>
                        Copy
                    </button>
                </div>
                <button 
                    onClick={handleShare}
                    className="w-full mt-4 py-2.5 font-semibold text-brand-blue bg-white rounded-lg hover:bg-brand-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                    <Share2 size={18}/> Share Now
                </button>
            </div>
            
            <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg">
                <button onClick={() => setShowReferralGuide(!showReferralGuide)} className="w-full flex justify-between items-center text-left">
                    <h3 className="text-lg font-bold flex items-center"><Users size={20} className="mr-2 text-brand-blue" /> Referral Rewards Guide</h3>
                    {showReferralGuide ? <ChevronUp /> : <ChevronDown />}
                </button>
                {showReferralGuide && (
                    <div className="mt-4 border-t border-brand-gray-200 dark:border-brand-gray-700 pt-4">
                        <ReferralRewardGuide />
                    </div>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg">
                <button onClick={() => setShowReferralMissions(!showReferralMissions)} className="w-full flex justify-between items-center text-left">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Package size={22}/> Referral Missions</h2>
                    {showReferralMissions ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                {showReferralMissions && (
                    <div className="mt-4 border-t border-brand-gray-200 dark:border-brand-gray-700 pt-4">
                        <div className="space-y-3">
                            {missions.length > 0 ? missions.map(mission => (
                                <MissionItem key={mission.id} mission={mission} onClaim={triggerClaimMission} />
                            )) : (
                                <p className="text-center text-brand-gray-500 py-8">No missions available.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 bg-white dark:bg-brand-gray-900 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Your Team ({referrals.length})</h3>
                     <button onClick={handlePingAll} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-brand-blue border-2 border-brand-blue rounded-full hover:bg-brand-blue/10 transition-colors">
                        <Bell size={14}/> Ping All Inactive
                    </button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {referrals.map((ref) => (
                        <div key={ref.id} className="flex justify-between items-center p-3 bg-brand-gray-5 dark:bg-brand-gray-800 rounded-lg">
                            <div className="flex items-center">
                                <img src={ref.avatar} alt={ref.username} className="w-10 h-10 rounded-full mr-3"/>
                                <div>
                                    <p className="font-semibold">{ref.username}</p>
                                    <div className="flex items-center gap-2">
                                        {ref.kycStatus === KycStatus.Approved ? (
                                            <p className="text-xs text-green-500 flex items-center"><UserCheck size={12} className="mr-1"/> Verified</p>
                                        ) : (
                                            <p className="text-xs text-yellow-500 flex items-center"><UserX size={12} className="mr-1"/> Unverified</p>
                                        )}
                                        {ref.miningStatus === 'active' ? (
                                             <p className="text-xs text-green-500 flex items-center"><Zap size={12} className="mr-1"/> Active</p>
                                        ) : (
                                             <p className="text-xs text-brand-gray-500 flex items-center"><ZapOff size={12} className="mr-1"/> Inactive</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                {ref.kycStatus !== KycStatus.Approved ? (
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleKycRemind(ref.username)} className="p-2 text-brand-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-500/10 transition-colors" title="Remind to complete KYC">
                                            <Bell size={18}/>
                                        </button>
                                    </div>
                                ) : (
                                    ref.miningStatus === 'inactive' ? (
                                         <button onClick={() => handleMiningRemind(ref.username)} className="p-2 text-brand-gray-500 hover:text-brand-blue rounded-full hover:bg-brand-blue/10 transition-colors" title="Remind to mine">
                                            <Bell size={18}/>
                                        </button>
                                    ) : (
                                         <div className="p-2 text-green-500" title="Actively mining">
                                            <Zap size={18}/>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                     {referrals.length === 0 && (
                        <p className="text-center text-brand-gray-500 py-8">You haven't referred anyone yet. Share your link to build your team!</p>
                     )}
                </div>
            </div>
        </div>
    );
};

export default ReferralPage;
