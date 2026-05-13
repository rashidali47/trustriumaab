
import React, { createContext, useState, useEffect, ReactNode, useRef } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  orderBy, 
  limit, 
  setDoc, 
  arrayUnion,
  runTransaction,
  deleteField,
  addDoc,
  deleteDoc
} from 'firebase/firestore';
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { User, KycStatus, Transaction, KycData, AppNotification, UserSettings, Referral, LeaderboardUser, Mission, UserMissionProgress } from '../src/types';

const CUSTOM_EMAIL_CONFIG = {
    enabled: false, 
    mock: true, 
    apiUrl: 'https://your-api-endpoint.com/api', 
};

export interface MiningTier {
    tier: number;
    name: string;
    sessionsRequired: number;
    bonus: number;
    reward: number;
}

export interface MiningTierInfo extends MiningTier {
    progress: number;
    isMaxTier: boolean;
}

export interface MissionWithProgress extends Mission {
    progress: number;
    isCompleted: boolean;
    isClaimed: boolean;
}

const MISSIONS: Mission[] = [
    { id: 'ref_1', title: 'First Teammate', description: 'Invite 1 friend who completes KYC', reward: 1, goal: 1, type: 'referral_kyc' },
    { id: 'ref_5', title: 'Growing Team', description: 'Invite 5 friends who completes KYC', reward: 5, goal: 5, type: 'referral_kyc' },
    { id: 'ref_10', title: 'Team Leader', description: 'Invite 10 friends who complete KYC', reward: 10, goal: 10, type: 'referral_kyc' },
    { id: 'social_1', title: 'Share the Love', description: 'Share your referral link to earn a bonus', reward: 1, goal: 1, type: 'social_share' },
];

interface UserContextType {
  user: User | null;
  firebaseAuthUser: FirebaseUser | null;
  riumBalance: number;
  trustBalance: number;
  unverifiedTrustBalance: number;
  totalEarnedTrust: number;
  miningTierInfo: MiningTierInfo | null;
  baseMiningRate: number;
  referralMiningRate: number;
  totalMiningRate: number;
  isMining: boolean;
  miningEndTime: number | null;
  startMining: () => void;
  signup: (details: { email: string; name: string; username: string; phone: { countryCode: string; number: string; }, walletPin: string }, password: string, referralCode?: string | null, recaptchaToken?: string) => Promise<'SUCCESS' | 'EMAIL_EXISTS' | 'USERNAME_EXISTS' | 'WEAK_PASSWORD' | 'INVALID_EMAIL' | 'UNKNOWN_ERROR'>;
  attemptLogin: (email: string, password: string, recaptchaToken?: string) => Promise<'SUCCESS' | 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'TOO_MANY_REQUESTS' | 'USER_DISABLED' | 'UNKNOWN_ERROR'>;
  continueWithGoogle: () => Promise<'SUCCESS' | 'NEEDS_SETUP' | 'FAILED' | 'UNAUTHORIZED_DOMAIN' | 'CANCELLED'>;
  completeGoogleSignup: (details: { name: string; username: string; walletPin: string; phone: { countryCode: string; number: string; } }, referralCode?: string | null) => Promise<'SUCCESS' | 'USERNAME_EXISTS' | 'UNKNOWN_ERROR'>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  updateUserSettings: (settings: Partial<UserSettings>) => void;
  setKycStatus: (status: KycStatus) => void;
  addTrust: (amount: number) => void;
  swapTrustToRIUM: (trustAmount: number) => { success: boolean; message: string; riumReceived?: number; };
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'trxId'>) => void;
  sendRium: (recipient: string, amount: number, pin: string) => Promise<'SUCCESS' | 'INVALID_PIN' | 'INSUFFICIENT_FUNDS' | 'USER_NOT_FOUND' | 'SELF_TRANSFER_ERROR' | 'FAILED'>;
  submitKyc: (data: KycData) => void;
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (title: string, message: string, type?: 'developer' | 'vip' | 'reminder') => void;
  clearAllNotifications: () => void;
  referrals: Referral[];
  addReferral: (username: string) => void;
  verifyReferral: (referralId: string) => void;
  isWalletLocked: boolean;
  pinAttempts: number;
  unlockWallet: (pin: string) => boolean;
  unlockWithPrivateKey: (key: string) => boolean;
  lockWallet: () => void;
  handleCheckIn: () => Promise<{ success: boolean; message: string; reward: number; }>;
  canCheckIn: () => boolean;
  leaderboards: { rium: LeaderboardUser[]; referrals: LeaderboardUser[]; holders: LeaderboardUser[]; };
  changeWalletPin: (currentPin: string, newPin: string) => 'SUCCESS' | 'INVALID_PIN';
  resetWalletPin: (password: string, newPin: string) => Promise<'SUCCESS' | 'INVALID_PASSWORD' | 'FAILED'>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<'SUCCESS' | 'INVALID_PASSWORD' | 'REAUTH_REQUIRED' | 'FAILED'>;
  reauthenticateUser: (password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<'SUCCESS' | 'FAILED'>;
  confirmPasswordResetWithCode: (email: string, code: string, newPassword: string) => Promise<'SUCCESS' | 'FAILED' | 'INVALID_CODE'>;
  sendVerificationEmail: () => Promise<'SUCCESS' | 'FAILED' | 'TOO_MANY_REQUESTS'>;
  verifyEmailWithCode: (code: string) => Promise<'SUCCESS' | 'FAILED' | 'INVALID_CODE'>;
  checkEmailVerification: () => Promise<boolean>;
  missions: MissionWithProgress[];
  claimMissionReward: (missionId: string) => void;
  totalUsers: number;
  circulatingSupply: number;
  isAuthLoading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  showGuestModal: boolean;
  setShowGuestModal: (show: boolean) => void;
  showVerificationSuccess: boolean;
  closeVerificationSuccess: () => void;
  emailSystemType: 'link' | 'code';
  // Challenge & Social functions
  submitAiTask: (correct: boolean) => Promise<void>;
  submitXFollowTask: (xUsername: string) => Promise<boolean>;
}

export const UserContext = createContext<UserContextType>({} as UserContextType);

const generateRandomHex = (length: number) => 
  [...Array(length)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');

const MOCK_NOTIFICATIONS: AppNotification[] = [
    { id: 'dev_1', title: 'Trustrium V2.0 is Live!', message: 'We have updated the mining protocol for better efficiency. Check out the new tiers!', date: new Date().toISOString(), read: false, type: 'developer' },
    { id: 'dev_2', title: 'Security Update', message: 'Your wallet security is our priority. Ensure your PIN is strong.', date: new Date(Date.now() - 86400000).toISOString(), read: true, type: 'developer' },
    { id: '1', title: 'Welcome to Trustrium!', message: 'Start mining now to earn Trust points.', date: new Date(Date.now() - 172800000).toISOString(), read: true, type: 'vip' },
];

const DEFAULT_SETTINGS: UserSettings = {
    notifications: { 
        push: true, 
        email: false,
        soundEnabled: true,
        notificationSound: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'
    },
    security: {}
};

const MINING_TIERS: MiningTier[] = [
    { tier: 1, name: 'Genesis', sessionsRequired: 0, bonus: 0, reward: 0 },
    { tier: 2, name: 'Alpha', sessionsRequired: 10, bonus: 0, reward: 2 },
    { tier: 3, name: 'Beta', sessionsRequired: 30, bonus: 0, reward: 5 },
    { tier: 4, name: 'Growth', sessionsRequired: 60, bonus: 0, reward: 10 },
    { tier: 5, name: 'Expansion', sessionsRequired: 100, bonus: 0, reward: 25 },
    { tier: 6, name: 'Global', sessionsRequired: 150, bonus: 0, reward: 50 },
];

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In production, we might want to show a toast or alert if it's a fatal setup error
}

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [isWalletLocked, setIsWalletLocked] = useState(true);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [leaderboards, setLeaderboards] = useState<{ rium: LeaderboardUser[]; referrals: LeaderboardUser[]; holders: LeaderboardUser[]; }>({ rium: [], referrals: [], holders: [] });
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(() => localStorage.getItem('trustrium_guest_mode') === 'true');
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [rawRiumLeaderboard, setRawRiumLeaderboard] = useState<User[]>([] );
  const [totalUsers, setTotalUsers] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [miningSettings, setMiningSettings] = useState({ baseMiningRate: 0.75, perReferralRate: 0.25 });
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [systemNotifications, setSystemNotifications] = useState<AppNotification[]>([]);
  const prevKycStatusRef = useRef<KycStatus | null>(null);

  useEffect(() => {
    if (user && Notification.permission === 'default') {
        Notification.requestPermission();
    }
  }, [user]);

  useEffect(() => {
    if (!firebaseAuthUser) return;

    const q = query(collection(db, 'system_notifications'), orderBy('date', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppNotification[];
      setSystemNotifications(notifs);
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'system_notifications');
    });
    return () => unsubscribe();
  }, [firebaseAuthUser]);

  // Processing incoming referrals from other nodes (Secure Relational Write)
  useEffect(() => {
    if (!firebaseAuthUser || !user) return;

    const inboxRef = collection(db, 'users', firebaseAuthUser.uid, 'referral_notifications');
    const unsubscribe = onSnapshot(inboxRef, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const refereeUsername = data.username;
          const refereeId = data.refereeId;

          // Apply referral reward locally in the referrer's state/doc
          const newReferralForReferrer: Referral = {
            id: `ref_${generateRandomHex(8)}`,
            username: refereeUsername,
            avatar: `https://i.pravatar.cc/40?u=${refereeUsername}`,
            kycStatus: data.kycStatus || KycStatus.NotSubmitted,
            miningStatus: 'inactive',
          };
          
          const referralBonusTx: Transaction = {
            id: `tx_${generateRandomHex(10)}`,
            trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
            date: new Date().toISOString(),
            type: 'referral',
            amountTrust: 1,
            amountRIUM: 0,
            to: `Referral: @${refereeUsername}`,
            status: 'pending',
          };

          const newReferralsCount = (user.referrals || 0) + 1;

          try {
            await updateDoc(doc(db, 'users', firebaseAuthUser.uid), {
              referralTeam: arrayUnion(newReferralForReferrer),
              referrals: newReferralsCount,
              transactions: arrayUnion(referralBonusTx)
            });

            // Sync public profile
            await setDoc(doc(db, 'users_public', firebaseAuthUser.uid), {
              referrals: newReferralsCount,
              updatedAt: new Date().toISOString()
            }, { merge: true });

            // Clean up the inbox notification
            await deleteDoc(change.doc.ref);
            
            addNotification("New Teammate Joined", `@${refereeUsername} joined using your link. +1 Pending Trust!`, "vip");
          } catch (err) {
            console.error("Error processing referral inbox:", err);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [firebaseAuthUser, user?.id]);

  useEffect(() => {
    // We removed the global collection listener for users_public counting
    // and supply calculation as it scales horribly and crashes mobile apps (OOM).
    // In a real app, these should be pulled from a single 'global_stats' document
    // updated via Cloud Functions.
    setTotalUsers(5420); // Default estimate
    setCirculatingSupply(125000); 

    const statsDocRef = doc(db, 'app_settings', 'stats'); 
    getDoc(statsDocRef).then(snap => {
        if (snap.exists()) {
            const data = snap.data();
            setTotalUsers(data.totalUsers || 5420);
            setCirculatingSupply(data.circulatingSupply || 125000);
        }
    }).catch(() => {});
    
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const settingsDocRef = doc(db, 'app_settings', 'mining');
            const docSnap = await getDoc(settingsDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data) {
                    setMiningSettings({
                        baseMiningRate: data.baseMiningRate ?? 0.75,
                        perReferralRate: 0.25, // Updated to 0.25 Trust Daily
                    });
                }
            }
        } catch (error) {
            console.error("Error fetching mining settings:", error);
        }
    };
    fetchSettings();
  }, []);

  // Global Migration: Removed from client side. 
  // It is extremely dangerous to iterate ALL users on every client boot.
  // This causes Permission Denied errors for users, and OOM/Crash for admins.

    const getMiningTierInfo = (completedSessions: number): MiningTierInfo => {
    const currentTier = [...MINING_TIERS].reverse().find(t => completedSessions >= t.sessionsRequired) || MINING_TIERS[0];
    const nextTierIndex = MINING_TIERS.findIndex(t => t.tier === currentTier.tier) + 1;
    const nextTier = MINING_TIERS[nextTierIndex];
    const isMaxTier = !nextTier;

    let progress = 100;
    if (nextTier) {
        const sessionsInCurrentTier = completedSessions - currentTier.sessionsRequired;
        const sessionsForNextTier = nextTier.sessionsRequired - currentTier.sessionsRequired;
        progress = (sessionsInCurrentTier / sessionsForNextTier) * 100;
    }

    return { ...currentTier, progress, isMaxTier };
  }
  
  const getBaseMiningRate = (users: number) => {
    if (users < 1000) return 12;
    if (users < 10000) return 6;
    if (users < 100000) return 3;
    if (users < 1000000) return 1.5;
    if (users < 10000000) return 0.75;
    return 0.375;
  };

  const miningTierInfo = user ? getMiningTierInfo(user.miningSessionsCompleted) : null;
  const baseMiningRate = getBaseMiningRate(totalUsers);
  const referralMiningRate = user ? (user.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length || 0) * miningSettings.perReferralRate : 0;
  const totalMiningRate = baseMiningRate + referralMiningRate;
  const isMining = !!(user?.miningEndTime && user.miningEndTime > Date.now());

  useEffect(() => {
    console.log("Setting up onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.uid}` : "No user");
      setFirebaseAuthUser(firebaseUser);
      if (!firebaseUser) {
        if (!isGuest) {
          setUser(null);
        }
        setIsAuthLoading(false);
      }
    }, (error) => {
      console.error("onAuthStateChanged error:", error);
      setIsAuthLoading(false);
    });

    // Safety timeout to prevent infinite white screen if Firebase hangs
    const timeoutId = setTimeout(() => {
      setIsAuthLoading(prev => {
        if (prev) {
          console.warn("Auth loading timed out after 5 seconds. Forcing load completion.");
          return false;
        }
        return prev;
      });
    }, 5000);

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [isGuest]);

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('trustrium_guest_mode', 'true');
    setUser({
      id: 'guest',
      email: 'guest@trustrium.com',
      name: 'Guest User',
      username: 'guest',
      phone: { countryCode: '', number: '' },
      kycStatus: KycStatus.NotSubmitted,
      walletAddress: '',
      privateKey: '',
      walletPin: '',
      referrals: 0,
      riumBalance: 0,
      trustBalance: 0,
      transactions: [],
      referralTeam: [],
      notifications: [],
      createdAt: new Date().toISOString(),
      settings: DEFAULT_SETTINGS,
      miningSessionsCompleted: 0,
      miningTier: 1,
    });
    setIsAuthLoading(false);
  };

  useEffect(() => {
    if (!firebaseAuthUser) return;

    const userDocRef = doc(db, 'users', firebaseAuthUser.uid);
    
    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      try {
        if (docSnap.exists()) {
            let userData = docSnap.data() as User;
            const now = Date.now();
            let needsUpdate = false;
            let updatePayload: any = {};

            if (userData.miningTier === undefined) {
                const currentSessions = userData.miningSessionsCompleted || 0;
                const calculatedTierInfo = getMiningTierInfo(currentSessions);
                updatePayload.miningTier = calculatedTierInfo.tier;
                userData.miningTier = calculatedTierInfo.tier;
                needsUpdate = true;
            }

            const totalSwappedOut = (userData.transactions || [])
                .filter(tx => tx.type === 'swap' && tx.amountTrust < 0)
                .reduce((acc, tx) => acc + Math.abs(tx.amountTrust), 0);
            
            const calculatedTotalEarned = (userData.trustBalance || 0) + totalSwappedOut;
            
            if (Math.abs((userData.totalTrustEarned || 0) - calculatedTotalEarned) > 0.01) {
                updatePayload.totalTrustEarned = calculatedTotalEarned;
                userData.totalTrustEarned = calculatedTotalEarned;
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await updateDoc(userDocRef, updatePayload);
            }

            const currentStatus = userData.kycStatus;
            const prevStatus = prevKycStatusRef.current;
            
            if (prevStatus && prevStatus !== KycStatus.Approved && currentStatus === KycStatus.Approved) {
                setShowVerificationSuccess(true);
                addNotification("Identity Verified", "Congratulations! Your KYC is approved. You can now access full wallet features.", 'vip');
            }
            prevKycStatusRef.current = currentStatus;

            // --- AUTOMATIC REMINDERS ---
            const today = new Date().toISOString().split('T')[0];
            const lastReminderDate = localStorage.getItem('last_reminder_date');
            
            if (lastReminderDate !== today) {
                // Daily Reward Reminder
                if (canCheckIn()) {
                    addNotification("Daily Reward Available", "Your daily Trust reward is ready to be collected! Don't break your streak.", "reminder");
                    localStorage.setItem('last_reminder_date', today);
                }
                
                // Mining Reminder
                if (!isMining) {
                    addNotification("Mining Inactive", "Your mining terminal is idle. Start synthesis now to maximize your RIUM earnings.", "reminder");
                    localStorage.setItem('last_reminder_date', today);
                }
            }

            if (userData.miningEndTime && userData.miningEndTime <= now) {
                if (userData.miningSessionStartBalance !== undefined && userData.miningSessionStartBalance !== null) {
                    const tempTierInfo = getMiningTierInfo(userData.miningSessionsCompleted);
                    const tempBaseRate = miningSettings.baseMiningRate + (tempTierInfo?.bonus ?? 0);
                    const tempRefRate = (userData.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length || 0) * miningSettings.perReferralRate;
                    const tempTotalRate = tempBaseRate + tempRefRate;
                    
                    const finalRateForSession = userData.currentMiningRate ?? tempTotalRate;
                    const minedAmount = finalRateForSession; // Daily rate for 24h session
                    const newSessions = (userData.miningSessionsCompleted || 0) + 1;
                    
                    const newTierObj = [...MINING_TIERS].reverse().find(t => newSessions >= t.sessionsRequired) || MINING_TIERS[0];
                    const newTier = newTierObj.tier;
                    
                    let tierRewardAmount = 0;
                    let tierRewardTx: Transaction | null = null;
                    
                    if (newTier > (userData.miningTier || 1)) {
                        // User reached a new tier
                        tierRewardAmount = newTierObj.reward;
                        tierRewardTx = {
                            id: `tx_${generateRandomHex(10)}`,
                            trxId: `RIUM-TIER-${generateRandomHex(24).toUpperCase()}`,
                            date: new Date().toISOString(),
                            type: 'bonus',
                            amountRIUM: 0,
                            amountTrust: tierRewardAmount,
                            to: `Tier ${newTier} Achievement Reward`,
                            status: 'completed',
                        };
                    }

                    const newTx: Transaction = {
                        id: `tx_${generateRandomHex(10)}`,
                        trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
                        date: new Date(userData.miningEndTime).toISOString(),
                        type: 'mining',
                        amountRIUM: 0,
                        amountTrust: minedAmount,
                        to: '24h Mining Session',
                        status: 'completed',
                        miningRate: finalRateForSession,
                        miningTier: newTierObj.name,
                    };
                    
                    const sessionPayload: Partial<User> = {
                        trustBalance: userData.miningSessionStartBalance + minedAmount + tierRewardAmount,
                        miningSessionsCompleted: newSessions,
                        miningTier: newTier,
                        miningEndTime: null,
                        miningSessionStartBalance: null,
                        currentMiningRate: null,
                        transactions: tierRewardTx ? [tierRewardTx, newTx, ...userData.transactions] : [newTx, ...userData.transactions],
                        totalTrustEarned: (userData.totalTrustEarned || 0) + minedAmount + tierRewardAmount,
                    };

                    await updateDoc(userDocRef, sessionPayload as { [x: string]: any; });
                    userData = { ...userData, ...sessionPayload };
                    addNotification("Mining Complete", "Your 24h mining session has finished. Mined Trust has been added to your balance.", "reminder");
                } else {
                    const sessionPayload: Partial<User> = { miningEndTime: null, miningSessionStartBalance: null, currentMiningRate: null };
                    await updateDoc(userDocRef, sessionPayload as { [x: string]: any; });
                    userData = { ...userData, ...sessionPayload };
                }
            }
            
            const isUserMining = !!(userData.miningEndTime && userData.miningEndTime > now);
            if(isUserMining && userData.miningSessionStartBalance !== undefined && userData.miningSessionStartBalance !== null) {
                const tempTierInfo = getMiningTierInfo(userData.miningSessionsCompleted);
                const tempBaseRate = miningSettings.baseMiningRate + (tempTierInfo?.bonus ?? 0);
                const tempRefRate = (userData.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length || 0) * miningSettings.perReferralRate;
                const tempTotalRate = tempBaseRate + tempRefRate;

                const rateForSession = userData.currentMiningRate ?? tempTotalRate;
                const startTime = userData.miningEndTime! - (24 * 60 * 60 * 1000);
                const elapsedMs = now - startTime;
                const minedSoFar = (rateForSession / (24 * 60 * 60 * 1000)) * elapsedMs;

                userData.trustBalance = userData.miningSessionStartBalance + minedSoFar;
            }

            setUser(userData);
            
            const publicDocRef = doc(db, 'users_public', userData.id);
            setDoc(publicDocRef, {
                id: userData.id,
                username: userData.username,
                avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
                riumBalance: userData.riumBalance || 0,
                totalTrustEarned: userData.totalTrustEarned || 0,
                referrals: userData.referrals || 0,
                updatedAt: new Date().toISOString()
            }, { merge: true }).catch(err => console.error("Error syncing public profile:", err));

            if (isAuthLoading) setIsWalletLocked(true); 
        } else {
            setUser(null);
        }
      } catch (err) {
          console.error("Error in user snapshot processor:", err);
      } finally {
          setIsAuthLoading(false);
      }
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, `users/${firebaseAuthUser?.uid}`);
        setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, [firebaseAuthUser, miningSettings]);

  useEffect(() => {
      if (user && user.kycStatus === KycStatus.Approved) {
          const isPending = localStorage.getItem('trustrium_kyc_pending');
          if (isPending === 'true') {
              setShowVerificationSuccess(true);
              addNotification("Identity Verified", "Congratulations! Your KYC is approved. You can now access full wallet features.", 'vip');
              localStorage.removeItem('trustrium_kyc_pending');
          }
      }
  }, [user]);

  const closeVerificationSuccess = () => setShowVerificationSuccess(false);

  useEffect(() => {
    const publicRef = collection(db, 'users_public');
    
    const riumQuery = query(publicRef, orderBy('totalTrustEarned', 'desc'), limit(250));
    const unsubscribeRium = onSnapshot(riumQuery, (snapshot) => {
        const users = snapshot.docs.map(doc => doc.data() as any);
        setRawRiumLeaderboard(users);
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users_public (rium)');
    });

    const refQuery = query(publicRef, orderBy('referrals', 'desc'), limit(250));
    const unsubscribeRef = onSnapshot(refQuery, (snapshot) => {
        const refBoard = snapshot.docs.map((doc, i) => {
            const u = doc.data() as any;
            return {
                rank: i + 1,
                avatar: u.avatar,
                username: u.username,
                value: u.referrals || 0
            };
        });
        setLeaderboards(prev => ({ ...prev, referrals: refBoard }));
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users_public (referrals)');
    });

    const holdersQuery = query(publicRef, orderBy('riumBalance', 'desc'), limit(250));
    const unsubscribeHolders = onSnapshot(holdersQuery, (snapshot) => {
        const holdersBoard = snapshot.docs.map((doc, i) => {
            const u = doc.data() as any;
            return {
                rank: i + 1,
                avatar: u.avatar,
                username: u.username,
                value: u.riumBalance || 0
            };
        });
        setLeaderboards(prev => ({ ...prev, holders: holdersBoard }));
    }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'users_public (holders)');
    });
        
    return () => {
        unsubscribeRium();
        unsubscribeRef();
        unsubscribeHolders();
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
        if (rawRiumLeaderboard.length === 0) return;
        
        const realTimeRiumBoard = rawRiumLeaderboard
            .map(u => {
                let inProgressMining = 0;
                const isCurrentlyMining = !!(u.miningEndTime && u.miningEndTime > Date.now());

                if (isCurrentlyMining && u.miningSessionStartBalance !== undefined && u.miningSessionStartBalance !== null) {
                    const tempTierInfo = getMiningTierInfo(u.miningSessionsCompleted);
                    const tempBaseRate = miningSettings.baseMiningRate + (tempTierInfo?.bonus ?? 0);
                    const tempRefRate = (u.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length || 0) * miningSettings.perReferralRate;
                    const tempTotalRate = tempBaseRate + tempRefRate;

                    const rateForSession = u.currentMiningRate ?? tempTotalRate;
                    const startTime = u.miningEndTime! - (24 * 60 * 60 * 1000);
                    const elapsedMs = Date.now() - startTime;
                    inProgressMining = (rateForSession / 3600000) * elapsedMs;
                }
                
                const realTimeValue = (u.totalTrustEarned || 0) + inProgressMining;

                return {
                    id: u.id,
                    avatar: u.avatar || `https://i.pravatar.cc/40?u=${u.id}`,
                    username: u.username,
                    value: realTimeValue,
                };
            })
            .sort((a, b) => b.value - a.value)
            .slice(0, 250)
            .map((u, i) => ({
                rank: i + 1,
                avatar: u.avatar,
                username: u.username,
                value: u.value,
            }));

        setLeaderboards(prev => ({ ...prev, rium: realTimeRiumBoard }));
    }, 2000); 

    return () => clearInterval(intervalId);
  }, [rawRiumLeaderboard, miningSettings]);

  const sendVerificationEmail = async (): Promise<'SUCCESS' | 'FAILED' | 'TOO_MANY_REQUESTS'> => {
    try {
        if (CUSTOM_EMAIL_CONFIG.enabled) {
            if (CUSTOM_EMAIL_CONFIG.mock) {
                console.log("[MOCK] Sending verification code to:", auth.currentUser?.email);
                await new Promise(resolve => setTimeout(resolve, 1000));
                return 'SUCCESS';
            }
            const res = await fetch(`${CUSTOM_EMAIL_CONFIG.apiUrl}/send-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: auth.currentUser?.email, uid: auth.currentUser?.uid })
            });
            if (res.ok) return 'SUCCESS';
            return 'FAILED';
        } else {
            if (auth.currentUser) {
                await firebaseSendEmailVerification(auth.currentUser);
                return 'SUCCESS';
            }
            return 'FAILED';
        }
    } catch (error: any) {
        console.error("Error sending verification email:", error);
        if (error.code === 'auth/too-many-requests') return 'TOO_MANY_REQUESTS';
        return 'FAILED';
    }
  };

  const verifyEmailWithCode = async (code: string): Promise<'SUCCESS' | 'FAILED' | 'INVALID_CODE'> => {
      if (CUSTOM_EMAIL_CONFIG.enabled) {
          if (CUSTOM_EMAIL_CONFIG.mock) {
               if (code === '123456') return 'SUCCESS';
               return 'INVALID_CODE';
          }
          try {
              const res = await fetch(`${CUSTOM_EMAIL_CONFIG.apiUrl}/verify-email`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: auth.currentUser?.email, code })
              });
              if (res.ok) {
                  await auth.currentUser?.reload();
                  return 'SUCCESS';
              }
              if (res.status === 400) return 'INVALID_CODE';
              return 'FAILED';
          } catch (e) { return 'FAILED'; }
      }
      return 'FAILED';
  };

  const resetPassword = async (email: string): Promise<'SUCCESS' | 'FAILED'> => {
    try {
        if (CUSTOM_EMAIL_CONFIG.enabled) {
            if (CUSTOM_EMAIL_CONFIG.mock) return 'SUCCESS';
            const res = await fetch(`${CUSTOM_EMAIL_CONFIG.apiUrl}/send-password-reset`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email })
            });
            if (res.ok) return 'SUCCESS';
            return 'FAILED';
        } else {
            await firebaseSendPasswordResetEmail(auth, email);
            return 'SUCCESS';
        }
    } catch (error) {
        console.error("Error sending password reset:", error);
        return 'FAILED';
    }
  };

  const confirmPasswordResetWithCode = async (email: string, code: string, newPassword: string): Promise<'SUCCESS' | 'FAILED' | 'INVALID_CODE'> => {
       if (CUSTOM_EMAIL_CONFIG.enabled) {
          if (CUSTOM_EMAIL_CONFIG.mock) {
                if (code !== '123456') return 'INVALID_CODE'; 
                return 'SUCCESS';
          }
          try {
              const res = await fetch(`${CUSTOM_EMAIL_CONFIG.apiUrl}/reset-password`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, code, newPassword })
              });
              if (res.ok) return 'SUCCESS';
              if (res.status === 400) return 'INVALID_CODE';
              return 'FAILED';
          } catch (e) { return 'FAILED'; }
      }
      return 'FAILED'; 
  };
  
  const checkEmailVerification = async (): Promise<boolean> => {
      if (auth.currentUser) {
          try {
              await auth.currentUser.reload();
              setFirebaseAuthUser({ ...auth.currentUser });
              return auth.currentUser.emailVerified;
          } catch (error) {
              console.error("Error reloading user:", error);
              return false;
          }
      }
      return false;
  };

  const signup = async (details: { email: string; name: string; username: string; phone: { countryCode: string; number: string; }, walletPin: string }, password: string, referralCode: string | null = null, recaptchaToken?: string): Promise<'SUCCESS' | 'EMAIL_EXISTS' | 'USERNAME_EXISTS' | 'WEAK_PASSWORD' | 'INVALID_EMAIL' | 'UNKNOWN_ERROR'> => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("username", "==", details.username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return 'USERNAME_EXISTS';
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, details.email, password);
      const firebaseUser = userCredential.user;
      if (!firebaseUser) return 'UNKNOWN_ERROR';

      try {
          await sendVerificationEmail(); 
      } catch (emailErr) {
          console.warn("Failed to send initial verification email:", emailErr);
      }

      try {
        const newUser: User = {
          id: firebaseUser.uid,
          email: details.email,
          name: details.name,
          username: details.username,
          phone: details.phone,
          walletPin: details.walletPin,
          kycStatus: KycStatus.NotSubmitted,
          walletAddress: `0x${generateRandomHex(40)}`,
          privateKey: `rium_${generateRandomHex(64)}`,
          referrals: 0,
          createdAt: new Date().toISOString(),
          settings: DEFAULT_SETTINGS,
          miningSessionsCompleted: 0,
          miningTier: 1,
          riumBalance: 2, 
          trustBalance: 2, // Tier 1 reward
          totalTrustEarned: 2,
          transactions: [
            {
              id: `tx_${generateRandomHex(10)}`,
              trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
              date: new Date().toISOString(),
              type: 'bonus', amountRIUM: 2, amountTrust: 0, status: 'completed', to: 'Signup Bonus'
            },
            {
              id: `tx_${generateRandomHex(10)}`,
              trxId: `RIUM-TIER-${generateRandomHex(24).toUpperCase()}`,
              date: new Date().toISOString(),
              type: 'bonus', amountRIUM: 0, amountTrust: 2, status: 'completed', to: 'Tier 1 Achievement Reward'
            }
          ],
          referralTeam: [],
          notifications: MOCK_NOTIFICATIONS,
          missionProgress: MISSIONS.map(m => ({ missionId: m.id, claimed: false })),
          fatherName: '',
          dateOfBirth: '',
          nationality: '',
          idCountry: '',
          idNumber: '',
          identitySubmitted: false,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // Initial public profile sync
        await setDoc(doc(db, 'users_public', firebaseUser.uid), {
          id: newUser.id,
          username: newUser.username,
          avatar: newUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`,
          riumBalance: newUser.riumBalance || 0,
          totalTrustEarned: newUser.totalTrustEarned || 0,
          referrals: newUser.referrals || 0,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        if (referralCode) {
          await applyReferralLogic(referralCode, newUser);
        }
        
        return 'SUCCESS';
      } catch (firestoreError: any) {
        console.error("Firestore error during signup. Rolling back auth user.", firestoreError);
        await deleteUser(firebaseUser);
        return 'UNKNOWN_ERROR';
      }
    } catch (authError: any) {
      if (authError.code === 'auth/email-already-in-use') return 'EMAIL_EXISTS';
      if (authError.code === 'auth/weak-password') return 'WEAK_PASSWORD';
      if (authError.code === 'auth/invalid-email') return 'INVALID_EMAIL';
      console.error("Signup auth error:", authError);
      return 'UNKNOWN_ERROR';
    }
  };
  
  const applyReferralLogic = async (referralCode: string, newUser: User) => {
      try {
        // Use users_public for lookup as it has open read permissions for authenticated users
        const referrerQuery = query(collection(db, 'users_public'), where('username', '==', referralCode.toLowerCase()));
        const referrerSnap = await getDocs(referrerQuery);
        
        if (!referrerSnap.empty) {
          const referrerPublicDoc = referrerSnap.docs[0];
          const referrerId = referrerPublicDoc.id;
          
          // Send a referral notification to the referrer's inbox (Secure Relational Write)
          const inboxRef = collection(db, 'users', referrerId, 'referral_notifications');
          await addDoc(inboxRef, {
            refereeId: newUser.id,
            username: newUser.username,
            kycStatus: newUser.kycStatus,
            timestamp: new Date().toISOString()
          });
        } else {
            console.warn("Referrer not found for code:", referralCode);
        }
      } catch (referralError) {
          console.error("Failed to apply referral logic:", referralError);
      }
  }

  const continueWithGoogle = async (): Promise<'SUCCESS' | 'NEEDS_SETUP' | 'FAILED' | 'UNAUTHORIZED_DOMAIN' | 'CANCELLED'> => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const userDocRef = doc(db, 'users', result.user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
            return 'SUCCESS';
        } else {
            return 'NEEDS_SETUP';
        }
    } catch (error: any) {
        console.error("Google Sign-In Error:", error);
        if (error.code === 'auth/unauthorized-domain') return 'UNAUTHORIZED_DOMAIN';
        if (error.code === 'auth/popup-closed-by-user') return 'CANCELLED';
        return 'FAILED';
    }
  };

  const completeGoogleSignup = async (details: { name: string; username: string; walletPin: string; phone: { countryCode: string; number: string; } }, referralCode?: string | null): Promise<'SUCCESS' | 'USERNAME_EXISTS' | 'UNKNOWN_ERROR'> => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return 'UNKNOWN_ERROR';

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("username", "==", details.username.toLowerCase()));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
          return 'USERNAME_EXISTS';
      }
      
      try {
        const newUser: User = {
          id: firebaseUser.uid, 
          email: firebaseUser.email || '',
          name: details.name,
          username: details.username,
          phone: details.phone,
          walletPin: details.walletPin,
          kycStatus: KycStatus.NotSubmitted,
          walletAddress: `0x${generateRandomHex(40)}`,
          privateKey: `rium_${generateRandomHex(64)}`,
          referrals: 0,
          createdAt: new Date().toISOString(),
          settings: DEFAULT_SETTINGS,
          miningSessionsCompleted: 0,
          miningTier: 1,
          riumBalance: 2,
          trustBalance: 2, // Tier 1 reward
          totalTrustEarned: 2, 
          transactions: [
            {
              id: `tx_${generateRandomHex(10)}`,
              trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
              date: new Date().toISOString(),
              type: 'bonus', amountRIUM: 2, amountTrust: 0, status: 'completed', to: 'Signup Bonus'
            },
            {
              id: `tx_${generateRandomHex(10)}`,
              trxId: `RIUM-TIER-${generateRandomHex(24).toUpperCase()}`,
              date: new Date().toISOString(),
              type: 'bonus', amountRIUM: 0, amountTrust: 2, status: 'completed', to: 'Tier 1 Achievement Reward'
            }
          ],
          referralTeam: [],
          notifications: MOCK_NOTIFICATIONS,
          missionProgress: MISSIONS.map(m => ({ missionId: m.id, claimed: false })),
          avatar: firebaseUser.photoURL || undefined,
          fatherName: '',
          dateOfBirth: '',
          nationality: '',
          idCountry: '',
          idNumber: '',
          identitySubmitted: false,
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        
        // Initial public profile sync
        await setDoc(doc(db, 'users_public', firebaseUser.uid), {
          id: newUser.id,
          username: newUser.username,
          avatar: newUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`,
          riumBalance: newUser.riumBalance || 0,
          totalTrustEarned: newUser.totalTrustEarned || 0,
          referrals: newUser.referrals || 0,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        if (referralCode) {
            await applyReferralLogic(referralCode, newUser);
        }
        
        return 'SUCCESS';
      } catch (e) {
          console.error("Error completing Google signup:", e);
          return 'UNKNOWN_ERROR';
      }
  }

  const attemptLogin = async (emailOrUsername: string, password: string, recaptchaToken?: string): Promise<'SUCCESS' | 'INVALID_CREDENTIALS' | 'NETWORK_ERROR' | 'TOO_MANY_REQUESTS' | 'USER_DISABLED' | 'UNKNOWN_ERROR'> => {
      try {
        let email = emailOrUsername;
        
        // Handle login with username
        if (!emailOrUsername.includes('@')) {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where("username", "==", emailOrUsername.toLowerCase()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                email = querySnapshot.docs[0].data().email;
            } else {
                // If username not found, still try to login with it as email (Firebase will handle the error)
                // or we can return early
                return 'INVALID_CREDENTIALS';
            }
        }

        await signInWithEmailAndPassword(auth, email, password);
        return 'SUCCESS';
      } catch (error: any) {
        console.error("Login failed:", error);
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            return 'INVALID_CREDENTIALS';
        }
        if (error.code === 'auth/network-request-failed') {
            return 'NETWORK_ERROR';
        }
        if (error.code === 'auth/too-many-requests') {
            return 'TOO_MANY_REQUESTS';
        }
        if (error.code === 'auth/user-disabled') {
            return 'USER_DISABLED';
        }
        return 'UNKNOWN_ERROR';
      }
  };
  
  const logout = async () => {
    try {
      if (isGuest) {
        setIsGuest(false);
        localStorage.removeItem('trustrium_guest_mode');
        setUser(null);
      } else {
        await signOut(auth);
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.id);
      try {
        await updateDoc(userDocRef, data as { [x: string]: any });
      } catch (error) {
        console.error("Failed to update user:", error);
      }
    }
  };

  const updateUserSettings = (newSettings: Partial<UserSettings>) => {
    if (user) {
        const updatedSettings = {
            ...user.settings, ...newSettings,
            notifications: { ...user.settings.notifications, ...newSettings.notifications },
            security: { ...user.settings.security, ...newSettings.security },
        };
        const payload: Partial<User> = { settings: updatedSettings };
        updateUser(payload);
    }
  };
  
  const setKycStatus = (status: KycStatus) => {
    updateUser({ kycStatus: status });
  };

  const submitKyc = (data: KycData) => {
      setKycStatus(KycStatus.Pending);
  };

  const addTrust = (amount: number) => {
    if(user) {
        const updatePayload: Partial<User> = { 
            trustBalance: user.trustBalance + amount,
            totalTrustEarned: (user.totalTrustEarned || 0) + amount
        };
        if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
            updatePayload.miningSessionStartBalance = user.miningSessionStartBalance + amount;
        }
        updateUser(updatePayload);
    }
  }

  const swapTrustToRIUM = (trustAmount: number): { success: boolean; message: string; riumReceived?: number } => {
    if (!user || trustAmount <= 0) return { success: false, message: 'Invalid amount.' };
    if (user.trustBalance < trustAmount) return { success: false, message: 'Insufficient Trust balance.' };

    const riumReceived = trustAmount; // 1:1 Rate
    const newTrust = user.trustBalance - trustAmount;
    const newRium = user.riumBalance + riumReceived;
    
    const newTx: Transaction = {
        id: `tx_${generateRandomHex(10)}`, trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
        date: new Date().toISOString(), type: 'swap', amountRIUM: riumReceived, amountTrust: -trustAmount, status: 'completed'
    };
    
    const updatePayload: Partial<User> = { 
        trustBalance: newTrust, 
        riumBalance: newRium, 
        transactions: [newTx, ...user.transactions] 
    };

    if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
      updatePayload.miningSessionStartBalance = user.miningSessionStartBalance - trustAmount;
    }
    
    updateUser(updatePayload);
    return { success: true, message: `Swapped ${trustAmount.toFixed(2)} Trust for ${riumReceived.toFixed(4)} $RIUM.`, riumReceived };
  }

  const sendRium = async (recipientIdentifier: string, amount: number, pin: string): Promise<'SUCCESS' | 'INVALID_PIN' | 'INSUFFICIENT_FUNDS' | 'USER_NOT_FOUND' | 'SELF_TRANSFER_ERROR' | 'FAILED'> => {
    if (!user || user.kycStatus !== KycStatus.Approved) return 'FAILED';
    if (user.walletPin !== pin) return 'INVALID_PIN';
    if (user.riumBalance < amount || amount <= 0) return 'INSUFFICIENT_FUNDS';

    const usersRef = collection(db, 'users');
    let recipientQuery;
    
    const normalizedIdentifier = recipientIdentifier.trim();
    const isUsername = normalizedIdentifier.startsWith('@');
    
    if (isUsername) {
        const username = normalizedIdentifier.substring(1).toLowerCase();
        recipientQuery = query(usersRef, where("username", "==", username));
    } else {
        recipientQuery = query(usersRef, where("walletAddress", "==", normalizedIdentifier));
    }

    try {
        const querySnapshot = await getDocs(recipientQuery);
        if (querySnapshot.empty) return 'USER_NOT_FOUND';
        
        const recipientDoc = querySnapshot.docs[0];
        const recipientData = recipientDoc.data() as User;

        if (recipientData.id === user.id) return 'SELF_TRANSFER_ERROR';

        await runTransaction(db, async (transaction) => {
            const senderDocRef = doc(db, 'users', user.id);
            const recipientDocRef = recipientDoc.ref;

            const senderDoc = await transaction.get(senderDocRef);
            const freshRecipientDoc = await transaction.get(recipientDocRef);

            if (!senderDoc.exists() || !freshRecipientDoc.exists()) {
                throw new Error("User document not found in transaction.");
            }

            const senderData = senderDoc.data() as User;
            const recipientDataFromTx = freshRecipientDoc.data() as User;
            
            if (senderData.riumBalance < amount) {
                throw new Error('INSUFFICIENT_FUNDS');
            }

            const newSenderBalance = senderData.riumBalance - amount;
            const newRecipientBalance = recipientDataFromTx.riumBalance + amount;
            const nowISO = new Date().toISOString();
            const trxId = `RIUM-TX-${generateRandomHex(24).toUpperCase()}`;

            const senderTx: Transaction = {
                id: `tx_${generateRandomHex(10)}`,
                trxId: trxId,
                date: nowISO,
                type: 'send',
                amountRIUM: -amount,
                amountTrust: 0,
                status: 'completed',
                to: `@${recipientDataFromTx.username}`
            };

            const recipientTx: Transaction = {
                id: `tx_${generateRandomHex(10)}`,
                trxId: trxId,
                date: nowISO,
                type: 'receive',
                amountRIUM: amount,
                amountTrust: 0,
                status: 'completed',
                from: `@${senderData.username}`
            };

            transaction.update(senderDocRef, { 
                riumBalance: newSenderBalance,
                transactions: arrayUnion(senderTx)
            });

            transaction.update(recipientDocRef, {
                riumBalance: newRecipientBalance,
                transactions: arrayUnion(recipientTx)
            });
        });
        
        return 'SUCCESS';

    } catch (e: any) {
        console.error("Transaction failed: ", e);
        if (e.message === 'INSUFFICIENT_FUNDS') return 'INSUFFICIENT_FUNDS';
        return 'FAILED';
    }
  };
  
  const addTransaction = (txData: Omit<Transaction, 'id' | 'date' | 'trxId'>) => {
      if (!user) return;
      const newTx: Transaction = {
          id: `tx_${generateRandomHex(10)}`, trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
          date: new Date().toISOString(), ...txData,
      };
      updateUser({ transactions: [newTx, ...user.transactions] });
  };
  
  const addNotification = (title: string, message: string, type: 'developer' | 'vip' | 'reminder' = 'vip') => {
        if (!user) return;
        const newNotif: AppNotification = {
            id: `notif_${generateRandomHex(8)}`, title, message, date: new Date().toISOString(), read: false, type
        };
        updateUser({ notifications: [newNotif, ...user.notifications] });
        
        // Native Push Notification
        if (Notification.permission === 'granted') {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, {
                    body: message,
                    icon: '/logo.png',
                    badge: '/logo.svg',
                    vibrate: [100, 50, 100],
                    data: {
                        url: window.location.href
                    }
                } as any);
            });
        }

        // Play sound
        if (user.settings.notifications.soundEnabled) {
            try {
                const soundUrl = user.settings.notifications.notificationSound || 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
                const audio = new Audio(soundUrl);
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio play blocked by browser"));
            } catch (e) {
                console.error("Error playing notification sound:", e);
            }
        }

        // Browser Notification
        if (user.settings.notifications.push && typeof window !== 'undefined' && "Notification" in window) {
            if (Notification.permission === "granted") {
                new Notification(title, { body: message, icon: 'https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png' });
            } else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification(title, { body: message, icon: 'https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png' });
                    }
                });
            }
        }
    };

    const markNotificationAsRead = (id: string) => {
      if (!user) return;
      const isSystem = systemNotifications.some(n => n.id === id);
      
      if (isSystem) {
          if (!user.readSystemNotifications?.includes(id)) {
              updateUser({ readSystemNotifications: arrayUnion(id) as any });
          }
      } else {
          updateUser({ notifications: user.notifications.map(n => n.id === id ? { ...n, read: true } : n) });
      }
    }

    const clearAllNotifications = () => {
        if (!user) return;
        const systemIds = systemNotifications.map(n => n.id);
        updateUser({ 
            notifications: [],
            readSystemNotifications: arrayUnion(...systemIds) as any
        });
    };

  const addReferral = (username: string) => {
    if (!user) return;
    const newReferral: Referral = {
        id: `ref_${generateRandomHex(8)}`,
        username,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        kycStatus: KycStatus.NotSubmitted,
        miningStatus: Math.random() > 0.3 ? 'active' : 'inactive',
    };
    
    const newTx: Transaction = {
        id: `tx_${generateRandomHex(10)}`,
        trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
        date: new Date().toISOString(),
        type: 'referral',
        amountTrust: 1,
        amountRIUM: 0,
        to: `Referral: @${username}`,
        status: 'pending',
    };
    
    updateUser({
        referralTeam: [...user.referralTeam, newReferral],
        referrals: user.referralTeam.length + 1,
        transactions: [newTx, ...user.transactions],
    });
  };

  const verifyReferral = (referralId: string) => {
    if (!user) return;
    const refToUpdate = user.referralTeam.find(ref => ref.id === referralId);
    if (!refToUpdate || refToUpdate.kycStatus === KycStatus.Approved) return;

    const updatedReferralTeam = user.referralTeam.map(ref =>
      ref.id === referralId ? { ...ref, kycStatus: KycStatus.Approved } : ref
    );
    
    let txUpdated = false;
    const newTxs = user.transactions.map(tx => {
      if (!txUpdated && tx.type === 'referral' && tx.status === 'pending' && tx.to === `Referral: @${refToUpdate.username}`) {
        txUpdated = true;
        return { ...tx, status: 'completed' as const };
      }
      return tx;
    });

    const reward = 1;
    const updatePayload: Partial<User> = {
        referralTeam: updatedReferralTeam,
        trustBalance: user.trustBalance + reward,
        totalTrustEarned: (user.totalTrustEarned || 0) + reward,
        transactions: newTxs,
    };
    
    if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
        updatePayload.miningSessionStartBalance = user.miningSessionStartBalance + reward;
    }
    
    updateUser(updatePayload);
  };
  
  const startMining = () => {
    if (user && !isMining) {
      const endTime = Date.now() + 24 * 60 * 60 * 1000;
      updateUser({ 
        miningEndTime: endTime,
        miningSessionStartBalance: user.trustBalance,
        currentMiningRate: totalMiningRate,
      });
      addNotification(
          "Mining Synthesis Started",
          "Your node is now active. You will earn Trust points for the next 24 hours.",
          "vip"
      );
    }
  };

  useEffect(() => {
      let intervalId: ReturnType<typeof setInterval> | undefined;
      if (isMining && user?.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null && user.miningEndTime) {
          intervalId = setInterval(() => {
              const now = Date.now();
              if (now >= user.miningEndTime!) {
                  clearInterval(intervalId);
                  return;
              }
              const startTime = user.miningEndTime! - (24 * 60 * 60 * 1000);
              const elapsedMs = now - startTime;
              const rateForSession = user.currentMiningRate ?? totalMiningRate;
              const minedSoFar = (rateForSession / (24 * 60 * 60 * 1000)) * elapsedMs;
              
              setUser(currentUser => {
                  if (!currentUser || currentUser.miningSessionStartBalance === undefined || currentUser.miningSessionStartBalance === null) return null;
                  return { ...currentUser, trustBalance: currentUser.miningSessionStartBalance + minedSoFar };
              });
          }, 1000);
      }
      return () => { if (intervalId) clearInterval(intervalId); };
  }, [isMining, user?.id, user?.miningEndTime, user?.miningSessionStartBalance, totalMiningRate, user?.currentMiningRate]);

  useEffect(() => {
      if (!user || !isMining || !user.miningEndTime || user.miningSessionStartBalance === undefined || user.miningSessionStartBalance === null) return;
      const timeToFinish = user.miningEndTime - Date.now();
      if (timeToFinish <= 0) return;

      const timer = setTimeout(() => {
        const rateForSession = user.currentMiningRate ?? totalMiningRate;
        const minedAmount = rateForSession; // Daily rate
        const newBalance = user.miningSessionStartBalance! + minedAmount;
        const newSessions = (user.miningSessionsCompleted || 0) + 1;
        
        const newTierObj = [...MINING_TIERS].reverse().find(t => newSessions >= t.sessionsRequired) || MINING_TIERS[0];
        const newTier = newTierObj.tier;

        const newTx: Transaction = {
            id: `tx_${generateRandomHex(10)}`, trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
            date: new Date().toISOString(), type: 'mining', amountRIUM: 0, amountTrust: minedAmount,
            to: '24h Mining Session', status: 'completed',
            miningRate: rateForSession,
            miningTier: miningTierInfo?.name,
        };
        updateUser({
            trustBalance: newBalance,
            miningSessionsCompleted: newSessions,
            miningTier: newTier,
            miningEndTime: null,
            miningSessionStartBalance: null,
            currentMiningRate: null,
            transactions: [newTx, ...user.transactions],
            totalTrustEarned: (user.totalTrustEarned || 0) + minedAmount,
        });
      }, timeToFinish);

      return () => clearTimeout(timer);
  }, [isMining, user?.id, user?.miningEndTime, user?.miningSessionStartBalance, totalMiningRate, user?.currentMiningRate]);


  const canCheckIn = () => {
        if (!user || !user.lastCheckIn) return true;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const lastDay = new Date(user.lastCheckIn); lastDay.setHours(0, 0, 0, 0);
        return today > lastDay;
    };
    
    const handleCheckIn = async (): Promise<{ success: boolean; message: string; reward: number; }> => {
        if (!user || !canCheckIn()) return { success: false, message: "You've already checked in today!", reward: 0 };
        
        // --- NEW STREAK LOGIC ---
        const today = new Date(); today.setHours(0,0,0,0);
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1); yesterday.setHours(0,0,0,0);
        
        let nextStreak = 1;
        if (user.lastCheckIn) {
            const lastCheckDate = new Date(user.lastCheckIn); lastCheckDate.setHours(0,0,0,0);
            
            // If the last check-in was exactly yesterday, continue streak. Otherwise reset.
            if (lastCheckDate.getTime() === yesterday.getTime()) {
                nextStreak = (user.checkInStreak || 0) + 1;
            } else {
                nextStreak = 1; // Reset due to missed day
            }
        }
        
        // Loop back after 7 days
        const streakDay = ((nextStreak - 1) % 7) + 1;
        
        let reward = 0;
        const getGiftReward = (): number => {
            const rand = Math.random() * 100;
            // 0.1-0.5: 70%
            if (rand < 70) return parseFloat((Math.random() * (0.5 - 0.1) + 0.1).toFixed(2));
            // 0.51-0.69: 15% (70 + 15 = 85)
            if (rand < 85) return parseFloat((Math.random() * (0.69 - 0.51) + 0.51).toFixed(2));
            // 0.7-0.8: 10% (85 + 10 = 95)
            if (rand < 95) return parseFloat((Math.random() * (0.8 - 0.7) + 0.7).toFixed(2));
            // 0.81-0.91: 4.5% (95 + 4.5 = 99.5)
            if (rand < 99.5) return parseFloat((Math.random() * (0.91 - 0.81) + 0.81).toFixed(2));
            // 0.92-1.0: 0.5% (Remaining)
            return parseFloat((Math.random() * (1.0 - 0.92) + 0.92).toFixed(2));
        };

        switch(streakDay) {
            case 1: reward = 0.2; break;
            case 2: reward = 0.35; break;
            case 3: reward = 0.5; break;
            case 4: reward = getGiftReward(); break;
            case 5: reward = 0.55; break;
            case 6: reward = 0.6; break;
            case 7: reward = getGiftReward(); break;
        }

        const newTrustBalance = user.trustBalance + reward;
        const isGift = (streakDay === 4 || streakDay === 7);
        
        const newTx: Transaction = {
            id: `tx_${generateRandomHex(10)}`,
            trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
            date: new Date().toISOString(),
            type: 'bonus',
            amountRIUM: 0,
            amountTrust: reward,
            to: isGift ? `Daily Mystery Gift (Day ${streakDay})` : `Daily Check-in Day ${streakDay}`,
            status: 'completed'
        };

        const updatePayload: Partial<User> = {
            trustBalance: newTrustBalance,
            transactions: [newTx, ...user.transactions],
            checkInStreak: nextStreak,
            lastCheckIn: new Date().toISOString(),
            totalTrustEarned: (user.totalTrustEarned || 0) + reward,
        };

        if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
            updatePayload.miningSessionStartBalance = user.miningSessionStartBalance + reward;
        }

        await updateUser(updatePayload);
        addNotification(
            isGift ? 'Mystery Gift Opened!' : 'Daily Reward Collected',
            isGift ? `You found ${reward} Trust in your mystery box!` : `You've successfully claimed your Day ${streakDay} reward.`,
            'vip'
        );
        return { 
            success: true, 
            message: isGift ? `Surprise! You found ${reward} Trust in your gift box.` : `Day ${streakDay} complete! +${reward} Trust.`, 
            reward 
        };
    };

  const lockWallet = () => setIsWalletLocked(true);
  const unlockWallet = (pin: string): boolean => {
    if (user?.walletPin === pin) {
      setIsWalletLocked(false); setPinAttempts(0); return true;
    } else {
      setPinAttempts(prev => prev + 1); return false;
    }
  };
  const unlockWithPrivateKey = (key: string): boolean => {
    if (user?.privateKey === key) {
      setIsWalletLocked(false); setPinAttempts(0); return true;
    }
    return false;
  };

  const changeWalletPin = (currentPin: string, newPin: string): 'SUCCESS' | 'INVALID_PIN' => {
    if (!user || user.walletPin !== currentPin) return 'INVALID_PIN';
    updateUser({ walletPin: newPin });
    return 'SUCCESS';
  };
  
  const resetWalletPin = async (password: string, newPin: string): Promise<'SUCCESS' | 'INVALID_PASSWORD' | 'FAILED'> => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) return 'FAILED';

      try {
        const credential = EmailAuthProvider.credential(firebaseUser.email, password);
        await reauthenticateWithCredential(firebaseUser, credential);
        updateUser({ walletPin: newPin });
        return 'SUCCESS';
      } catch (error: any) {
          if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') return 'INVALID_PASSWORD';
          return 'FAILED';
      }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string): Promise<'SUCCESS' | 'INVALID_PASSWORD' | 'REAUTH_REQUIRED' | 'FAILED'> => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) return 'FAILED';
      
      try {
        const credential = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, credential);
        await updatePassword(firebaseUser, newPassword);
        return 'SUCCESS';
      } catch (error: any) {
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') return 'INVALID_PASSWORD';
        if (error.code === 'auth/requires-recent-login') return 'REAUTH_REQUIRED';
        return 'FAILED';
      }
  };

  const reauthenticateUser = async (password: string): Promise<boolean> => {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser || !firebaseUser.email) return false;
      
      try {
          const credential = EmailAuthProvider.credential(firebaseUser.email, password);
          await reauthenticateWithCredential(firebaseUser, credential);
          return true;
      } catch (error) {
          console.error("Reauthentication failed:", error);
          return false;
      }
  };

    const getMissionsWithProgress = (user: User | null): MissionWithProgress[] => {
        if (!user) return [];
        const verifiedReferrals = user.referralTeam.filter(r => r.kycStatus === KycStatus.Approved).length;

        return MISSIONS.map(mission => {
            const userProgress = (user.missionProgress || []).find(p => p.missionId === mission.id) || { missionId: mission.id, claimed: false };
            const isClaimed = userProgress.claimed;
            let currentProgress = 0;
            let isCompleted = false;

            if (mission.type === 'referral_kyc') {
                currentProgress = verifiedReferrals;
                isCompleted = currentProgress >= mission.goal;
            } else if (mission.type === 'social_share') {
                isCompleted = !isClaimed; 
                currentProgress = isClaimed ? 1 : 0;
            }

            return { ...mission, progress: currentProgress, isCompleted, isClaimed };
        });
    };

    const missions = getMissionsWithProgress(user);

    const mergedNotifications = React.useMemo(() => {
        const personal = user?.notifications || [];
        const readSystemIds = user?.readSystemNotifications || [];
        
        const system = systemNotifications.map(n => ({
            ...n,
            read: readSystemIds.includes(n.id)
        }));
        
        return [...personal, ...system].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user?.notifications, user?.readSystemNotifications, systemNotifications]);

    const claimMissionReward = (missionId: string) => {
        const mission = missions.find(m => m.id === missionId);
        if (!user || !mission || mission.isClaimed || !mission.isCompleted) return;

        let updatedMissionProgress = [...(user.missionProgress || [])];
        const progressIndex = updatedMissionProgress.findIndex(p => p.missionId === missionId);

        if (progressIndex > -1) {
            updatedMissionProgress[progressIndex] = { ...updatedMissionProgress[progressIndex], claimed: true };
        } else {
            updatedMissionProgress.push({ missionId, claimed: true });
        }

        const newTrustBalance = user.trustBalance + mission.reward;
        const newTx: Transaction = {
            id: `tx_${generateRandomHex(10)}`,
            trxId: `RIUM-TX-${generateRandomHex(24).toUpperCase()}`,
            date: new Date().toISOString(),
            type: 'bonus',
            amountRIUM: 0,
            amountTrust: mission.reward,
            to: `Mission: ${mission.title}`,
            status: 'completed'
        };

        const updatePayload: Partial<User> = {
            trustBalance: newTrustBalance,
            transactions: [newTx, ...user.transactions],
            missionProgress: updatedMissionProgress,
            totalTrustEarned: (user.totalTrustEarned || 0) + mission.reward,
        };

        if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
            updatePayload.miningSessionStartBalance = user.miningSessionStartBalance + mission.reward;
        }

        updateUser(updatePayload);
        addNotification('Reward Claimed!', `You received ${mission.reward} Trust for completing the "${mission.title}" mission.`, 'vip');
    };

    const totalEarnedTrust = React.useMemo(() => {
        if (!user) return 0;
        let inProgressMining = 0;
        const isCurrentlyMining = !!(user.miningEndTime && user.miningEndTime > Date.now());

        if (isCurrentlyMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
            const startTime = user.miningEndTime! - (24 * 60 * 60 * 1000);
            const elapsedMs = Date.now() - startTime;
            const rateForSession = user.currentMiningRate ?? totalMiningRate;
            inProgressMining = (rateForSession / (24 * 60 * 60 * 1000)) * elapsedMs;
        }
        return (user.totalTrustEarned || 0) + inProgressMining;
    }, [user, isMining, totalMiningRate, user?.currentMiningRate]);

    // Challenge Task
    const submitAiTask = async (correct: boolean) => {
        if (!user) return;
        
        const today = new Date().toISOString().split('T')[0];
        const updatePayload: Partial<User> = {
            lastAiTaskDate: today,
            aiTaskAttempted: true,
            aiTaskCorrect: correct
        };

        if (correct) {
            const reward = 0.5;
            const newTrust = user.trustBalance + reward;
            const newTotal = (user.totalTrustEarned || 0) + reward;

            const newTx: Transaction = {
                id: `tx_${generateRandomHex(10)}`,
                trxId: `RIUM-SYS-${generateRandomHex(24).toUpperCase()}`,
                date: new Date().toISOString(),
                type: 'ai_task',
                amountRIUM: 0,
                amountTrust: reward,
                to: 'Daily System Check',
                status: 'completed'
            };

            updatePayload.trustBalance = newTrust;
            updatePayload.totalTrustEarned = newTotal;
            updatePayload.transactions = [newTx, ...user.transactions];

            if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
                updatePayload.miningSessionStartBalance = user.miningSessionStartBalance + reward;
            }
        }

        await updateUser(updatePayload);
    };

    // Social Task
    const submitXFollowTask = async (xUsername: string): Promise<boolean> => {
        if (!user || user.xFollowed) return false;
        
        const reward = 0.50;
        const newTrust = user.trustBalance + reward;
        const newTotal = (user.totalTrustEarned || 0) + reward;

        const newTx: Transaction = {
            id: `tx_${generateRandomHex(10)}`,
            trxId: `RIUM-X-${generateRandomHex(24).toUpperCase()}`,
            date: new Date().toISOString(),
            type: 'social_task',
            amountRIUM: 0,
            amountTrust: reward,
            to: `X Follow: @${xUsername.replace('@','')}`,
            status: 'completed'
        };

        const updatePayload: Partial<User> = {
            xFollowed: true,
            trustBalance: newTrust,
            totalTrustEarned: newTotal,
            transactions: [newTx, ...user.transactions]
        };

        if (isMining && user.miningSessionStartBalance !== undefined && user.miningSessionStartBalance !== null) {
            updatePayload.miningSessionStartBalance = user.miningSessionStartBalance + reward;
        }

        await updateUser(updatePayload);
        return true;
    };


  return (
    <UserContext.Provider value={{ 
        user, firebaseAuthUser, signup, attemptLogin, logout, updateUser, updateUserSettings, 
        continueWithGoogle, completeGoogleSignup,
        riumBalance: user?.riumBalance ?? 0, 
        trustBalance: user?.trustBalance ?? 0,
        unverifiedTrustBalance: user ? user.transactions.filter(tx => tx.type === 'referral' && tx.status === 'pending').reduce((acc, tx) => acc + tx.amountTrust, 0) : 0,
        totalEarnedTrust,
        miningTierInfo, baseMiningRate, referralMiningRate, totalMiningRate, isMining, miningEndTime: user?.miningEndTime ?? null, startMining,
        setKycStatus, addTrust, swapTrustToRIUM, 
        transactions: user?.transactions ?? [], addTransaction, sendRium, 
        submitKyc, 
        notifications: mergedNotifications, markNotificationAsRead, addNotification, clearAllNotifications,
        referrals: user?.referralTeam ?? [], addReferral, verifyReferral, 
        isWalletLocked, pinAttempts, unlockWallet, unlockWithPrivateKey, lockWallet,
        handleCheckIn, canCheckIn,
        leaderboards,
        changeWalletPin, resetWalletPin, changePassword, reauthenticateUser, resetPassword, confirmPasswordResetWithCode, 
        sendVerificationEmail, verifyEmailWithCode, checkEmailVerification,
        missions, claimMissionReward,
        totalUsers,
        circulatingSupply,
        isAuthLoading,
        isGuest,
        continueAsGuest,
        showGuestModal,
        setShowGuestModal,
        showVerificationSuccess,
        closeVerificationSuccess,
        emailSystemType: CUSTOM_EMAIL_CONFIG.enabled ? 'code' : 'link',
        submitAiTask,
        submitXFollowTask
    }}>
      {children}
    </UserContext.Provider>
  );
};
