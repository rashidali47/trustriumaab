
import React, { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import { LogIn, UserPlus, X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GuestModal: React.FC = () => {
  const { showGuestModal, setShowGuestModal, logout } = useContext(UserContext);

  if (!showGuestModal) return null;

  return (
    <AnimatePresence>
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="w-full max-w-md bg-white dark:bg-brand-gray-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <button 
              onClick={() => setShowGuestModal(false)}
              className="absolute top-4 right-4 p-2 text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-brand-purple/10 rounded-full flex items-center justify-center text-brand-purple mb-2">
                <ShieldAlert size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-brand-gray-900 dark:text-white">Account Required</h3>
              <p className="text-brand-gray-500 dark:text-brand-gray-400">
                You are currently in <span className="font-bold text-brand-purple">Guest Mode</span>. To start mining, earn RIUM, and access all features, please create an account or sign in.
              </p>

              <div className="grid grid-cols-1 gap-3 w-full mt-6">
                <button 
                  onClick={() => {
                    setShowGuestModal(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple-dark transition-all shadow-lg shadow-brand-purple/20"
                >
                  <UserPlus size={20} />
                  Create Account
                </button>
                
                <button 
                  onClick={() => {
                    setShowGuestModal(false);
                    logout();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-brand-gray-100 dark:bg-brand-gray-800 text-brand-gray-900 dark:text-white font-bold rounded-xl hover:bg-brand-gray-200 dark:hover:bg-brand-gray-700 transition-all"
                >
                  <LogIn size={20} />
                  Sign In
                </button>
                
                <button 
                  onClick={() => setShowGuestModal(false)}
                  className="text-sm text-brand-gray-500 hover:text-brand-gray-700 dark:hover:text-brand-gray-300 font-medium py-2"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GuestModal;
