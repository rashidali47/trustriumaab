
import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  id: number;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, id, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      // Animate out
      setIsVisible(false);
      // Remove from DOM after animation
      setTimeout(() => onDismiss(id), 300); 
    }, 4000); // Auto-dismiss after 4 seconds

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const bgColor = type === 'success' ? 'from-green-500 to-emerald-600' : 'from-red-500 to-rose-600';
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

  return (
    <div
      className={`fixed bottom-6 z-50 p-4 rounded-xl shadow-xl max-w-sm w-full transition-all duration-300 transform 
                  ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
      style={{ left: '50%', transform: isVisible ? 'translateX(-50%)' : 'translate(-50%, 100%)' }}
      role="alert"
      aria-live="assertive"
    >
      <div className={`flex items-center gap-3 p-4 text-white bg-gradient-to-r ${bgColor} rounded-xl`}>
        <Icon size={24} className="flex-shrink-0" />
        <span className="flex-grow text-sm font-semibold">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(id), 300);
          }}
          className="p-1 rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useContext(AppContext);

  return (
    <>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={removeToast} />
      ))}
    </>
  );
};

export default ToastContainer;
