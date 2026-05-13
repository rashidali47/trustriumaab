
import { db, auth } from "./lib/firebase";

import React, { useContext, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, UserContext } from './contexts/UserContext';
import { AppContext } from './contexts/AppContext';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import MinePage from './pages/MinePage';
import WalletPage from './pages/WalletPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import ReferralPage from './pages/ReferralPage';
import SettingsPage from './pages/SettingsPage';
import KycPage from './pages/KycPage'; 
import DailyTaskPage from './pages/DailyTaskPage';
import LeaderboardPage from './pages/LeaderboardPage';
import VerificationPendingPage from './pages/VerificationPendingPage'; 
import AdminPage from './pages/AdminPage';
import MainLayout from './components/layout/MainLayout';
import ToastContainer from './components/ui/ToastContainer'; 
import SplashScreen from './components/layout/SplashScreen'; 
import GuestModal from './components/ui/GuestModal';

const App: React.FC = () => {
  const { theme } = useContext(AppContext);

  React.useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    let refCode = searchParams.get('ref');

    if (!refCode) {
        const hash = window.location.hash;
        if (hash.includes('?')) {
             const urlParams = new URLSearchParams(hash.split('?')[1]);
             refCode = urlParams.get('ref');
        }
    }

    if (refCode) {
      sessionStorage.setItem('trustrium-referral-code', refCode);
    }
  }, []);

  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

const AppContent: React.FC = () => {
  const { user, firebaseAuthUser, isAuthLoading } = useContext(UserContext); 

  if (isAuthLoading) {
    return <SplashScreen />; 
  }

  if (user && firebaseAuthUser && !firebaseAuthUser.emailVerified) {
      return <VerificationPendingPage />;
  }

  return (
    <div className="min-h-screen font-sans text-brand-gray-800 dark:text-brand-gray-200">
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" />} />
          </>
        ) : (
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/mine" element={<MinePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/tasks" element={<DailyTaskPage />} />
            <Route path="/referrals" element={<ReferralPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin_board" element={<AdminPage />} />
            <Route path="/settings/:page" element={<SettingsPage />} />
            <Route path="/kyc" element={<KycPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        )}
      </Routes>
      <GuestModal />
      <ToastContainer />
    </div>
  );
};

export default App;
