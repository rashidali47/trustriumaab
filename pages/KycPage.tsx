import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink } from 'lucide-react';

const KycPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
     // Optional: Auto-redirect back to profile if someone lands here manually
     // navigate('/profile');
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-gray-950 text-white p-6 text-center">
        <div className="mb-6 p-4 bg-brand-blue/10 rounded-full">
            <ExternalLink size={48} className="text-brand-blue"/>
        </div>
        <h1 className="text-2xl font-bold mb-2">Verification Moved</h1>
        <p className="text-brand-gray-400 mb-8 max-w-sm">
            KYC Verification is now handled by our secure external verification portal. Please access it via your Profile page.
        </p>
        <button 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-6 py-3 bg-brand-gray-800 hover:bg-brand-gray-700 rounded-xl font-semibold transition-colors"
        >
            <ArrowLeft size={20} />
            Back to Profile
        </button>
    </div>
  );
};

export default KycPage;