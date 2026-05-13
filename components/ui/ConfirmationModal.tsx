
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel", isLoading = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-brand-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl border border-brand-gray-100 dark:border-brand-gray-800 relative overflow-hidden">
                <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-brand-gray-400 hover:text-brand-gray-900 dark:hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-16 h-16 bg-brand-blue/10 rounded-2xl flex items-center justify-center text-brand-blue mb-4">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-brand-gray-500 mt-2 font-medium leading-relaxed">{message}</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-brand-gray-500 bg-brand-gray-50 dark:bg-brand-gray-800 rounded-2xl hover:bg-brand-gray-100 dark:hover:bg-brand-gray-700 transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-4 font-black uppercase tracking-widest text-xs text-white bg-brand-blue rounded-2xl hover:brightness-110 shadow-lg shadow-brand-blue/20 transition-all flex items-center justify-center gap-2"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
