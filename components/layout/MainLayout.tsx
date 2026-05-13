
import React, { useContext } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { Home, Globe, Users, ListTodo } from 'lucide-react';
import { AppContext } from '../../contexts/AppContext';
import { UserContext } from '../../contexts/UserContext';
import VerificationSuccessModal from '../ui/VerificationSuccessModal';

const MainLogo = ({ className }: { className?: string }) => (
    <img src="https://raw.githubusercontent.com/Trustrium/Logos/refs/heads/main/logo.png" alt="Trustrium Logo" className={className} />
);

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all duration-300 ${isActive ? 'bg-brand-blue text-white scale-110 shadow-lg shadow-brand-blue/40' : 'text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-200'}`}
    >
      <Icon className="w-6 h-6" />
    </NavLink>
  );
};

const MainLayout: React.FC = () => {
    const { showVerificationSuccess, closeVerificationSuccess, user } = useContext(UserContext);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-brand-gray-950">
            {showVerificationSuccess && <VerificationSuccessModal onClose={closeVerificationSuccess} />}
            
            {/* Frozen Header - Shared across all pages */}
            <header className="sticky top-0 z-[100] px-6 py-4 bg-white/90 dark:bg-brand-gray-950/90 backdrop-blur-xl border-b border-brand-gray-100 dark:border-brand-gray-800">
                <div className="flex items-center justify-between max-w-lg mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <MainLogo className="w-10 h-10 object-contain" />
                        <span className="font-black text-sm tracking-tight text-brand-blue hidden xs:block">TRUSTRIUM</span>
                    </div>
                    <div className="bg-brand-gray-100 dark:bg-brand-gray-900 rounded-full p-1 flex items-center border border-brand-gray-200 dark:border-brand-gray-800">
                        <NavLink to="/" className={({ isActive }) => `px-6 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-brand-blue text-white shadow-lg' : 'text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-200'}`}>App</NavLink>
                        <NavLink to="/wallet" className={({ isActive }) => `px-6 py-1.5 rounded-full text-xs font-bold transition-all ${isActive ? 'bg-brand-blue text-white shadow-lg' : 'text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-200'}`}>Wallet</NavLink>
                    </div>
                    <Link to="/profile">
                        <div className="w-10 h-10 rounded-full bg-brand-gray-100 dark:bg-brand-gray-900 border-2 border-white dark:border-brand-gray-800 shadow-xl overflow-hidden transition-transform active:scale-90">
                            <img src={user?.avatar || `https://i.pravatar.cc/100?u=${user?.id}`} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                    </Link>
                </div>
            </header>

            <main className="flex-grow pb-28 overflow-y-auto">
                <Outlet />
            </main>
            
            {/* Professional Floating Bottom Nav */}
            <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
                <nav className="flex items-center justify-between gap-1 px-3 py-2 bg-brand-gray-100/90 dark:bg-brand-gray-900/90 backdrop-blur-xl rounded-[2.5rem] border border-brand-gray-200 dark:border-brand-gray-800 shadow-2xl pointer-events-auto max-w-sm w-full">
                    <NavItem to="/" icon={Home} label="Home" />
                    <NavItem to="/explore" icon={Globe} label="Explore" />
                    <NavItem to="/tasks" icon={ListTodo} label="Tasks" />
                    <NavItem to="/referrals" icon={Users} label="Referrals" />
                </nav>
            </div>
        </div>
    );
};

export default MainLayout;
