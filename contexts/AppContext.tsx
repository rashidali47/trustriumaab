
import React, { createContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ToastState {
  message: string;
  type: 'success' | 'error';
  id: number;
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  showSuccessToast: (message: string) => void;
  showErrorToast: (message: string) => void;
  toasts: ToastState[];
  removeToast: (id: number) => void;
}

export const AppContext = createContext<AppContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  isLoading: false,
  setIsLoading: () => {},
  showSuccessToast: () => {},
  showErrorToast: () => {},
  toasts: [],
  removeToast: () => {},
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const toastIdCounter = React.useRef(0);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    const id = toastIdCounter.current++;
    setToasts((prevToasts) => [...prevToasts, { message, type, id }]);
  };

  const showSuccessToast = (message: string) => showToast(message, 'success');
  const showErrorToast = (message: string) => showToast(message, 'error');

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };
  
  return (
    <AppContext.Provider value={{ theme, toggleTheme, isLoading, setIsLoading, showSuccessToast, showErrorToast, toasts, removeToast }}>
      {children}
    </AppContext.Provider>
  );
};