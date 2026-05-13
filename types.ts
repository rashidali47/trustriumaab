
export enum KycStatus {
  NotSubmitted = 'Not Submitted',
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface UserSettings {
    notifications: {
        push: boolean;
        email: boolean;
        soundEnabled: boolean;
        notificationSound: string;
    };
    security: {};
}

export interface Mission {
    id: string;
    title: string;
    description: string;
    reward: number; // Trust points
    goal: number;
    type: 'referral_kyc' | 'social_share';
}

export interface UserMissionProgress {
    missionId: string;
    claimed: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  phone: {
    countryCode: string;
    number: string;
  };
  avatar?: string;
  kycStatus: KycStatus;
  kycRejectionReason?: string;
  walletAddress: string;
  privateKey: string;
  walletPin: string;
  referrals: number;
  riumBalance: number;
  trustBalance: number;
  transactions: Transaction[];
  referralTeam: Referral[];
  notifications: AppNotification[];
  createdAt: string;
  settings: UserSettings;
  miningSessionsCompleted: number;
  miningTier: number;
  miningEndTime?: number | null;
  miningSessionStartBalance?: number;
  currentMiningRate?: number | null;
  lastCheckIn?: string;
  checkInStreak?: number;
  fatherName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  nationality?: string;
  idCountry?: string;
  idNumber?: string;
  identitySubmitted?: boolean;
  missionProgress?: UserMissionProgress[];
  totalTrustEarned?: number;
  // System Challenge Fields
  lastAiTaskDate?: string; 
  aiTaskAttempted?: boolean;
  aiTaskCorrect?: boolean;
  // Social Tasks
  xFollowed?: boolean;
  readSystemNotifications?: string[];
}

export interface KycData {
    fullName: string;
    country: string;
    idCardFront: File | null;
    selfieWithId: File | null;
}

export interface Transaction {
  id: string;
  trxId: string;
  type: 'send' | 'receive' | 'swap' | 'bonus' | 'mining' | 'referral' | 'ai_task' | 'social_task';
  amountRIUM: number;
  amountTrust: number;
  date: string;
  status: 'completed' | 'pending';
  from?: string;
  to?: string;
  miningRate?: number;
  miningTier?: string;
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    date: string;
    read: boolean;
    type?: 'developer' | 'vip' | 'reminder';
}

export interface LeaderboardUser {
    rank: number;
    avatar: string;
    username: string;
    value: number;
}

export interface Referral {
    id: string;
    username: string;
    avatar: string;
    kycStatus: KycStatus;
    miningStatus: 'active' | 'inactive';
}
