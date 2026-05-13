
import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Use named import for HashRouter to resolve module export issue.
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught crash at index:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#111827',
          color: 'white',
          padding: '2rem',
          fontFamily: 'sans-serif'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: '#1f2937',
            borderRadius: '1rem',
            padding: '2rem',
            border: '1px solid #ef4444',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '1rem' }}>Critical System Error</h1>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>The application failed to start correctly. This usually happens when required services like Firebase are blocked or misconfigured.</p>
            <div style={{ backgroundColor: 'black', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', maxHeight: '10rem', marginBottom: '1.5rem' }}>
              <code style={{ fontSize: '0.75rem', color: '#f87171' }}>{this.state.error?.message}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 'bold',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Restart Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW registration failed:', err));
  });
}

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </HashRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
