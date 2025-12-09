import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', persist = false) => {
    const id = Date.now() + Math.random(); // Ensure unique ID
    setToasts(prev => [...prev, { id, message, type, persist }]);

    // Auto remove after 5 seconds if not persistent
    if (!persist) {
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message) => addToast(message, 'success');
  const error = (message) => addToast(message, 'error');
  const warning = (message) => addToast(message, 'warning');
  const info = (message) => addToast(message, 'info');

  // Loading toast: persistent until dismissed
  const loading = (message = 'Loading...') => addToast(message, 'loading', true);
  // Dismiss toast by ID (useful for loading)
  const dismiss = (id) => removeToast(id);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, loading, dismiss }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-icon">
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'warning' && '⚠'}
              {toast.type === 'info' && 'ⓘ'}
              {toast.type === 'loading' && <span className="spinner">↻</span>}
            </div>
            <div className="toast-message">{toast.message}</div>
            {(!toast.persist) && (
              <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .toast-container {
          position: fixed;
          top: 5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 400px;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: white;
          border-radius: var(--radius-lg);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          cursor: pointer;
          animation: slideIn 0.3s ease-out;
          border-left: 4px solid;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .spinner {
            display: inline-block;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            100% { transform: rotate(360deg); }
        }

        .toast:hover {
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
        }

        .toast-success { border-left-color: #10b981; }
        .toast-error { border-left-color: #ef4444; }
        .toast-warning { border-left-color: #f59e0b; }
        .toast-info { border-left-color: #3b82f6; }
        .toast-loading { border-left-color: #8b5cf6; }

        .toast-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .toast-success .toast-icon { background: #d1fae5; color: #10b981; }
        .toast-error .toast-icon { background: #fee2e2; color: #ef4444; }
        .toast-warning .toast-icon { background: #fef3c7; color: #f59e0b; }
        .toast-info .toast-icon { background: #dbeafe; color: #3b82f6; }
        .toast-loading .toast-icon { background: #f3e8ff; color: #8b5cf6; }

        .toast-message {
          flex: 1;
          color: var(--color-text);
          font-weight: 500;
        }

        .toast-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .toast-close:hover {
          color: var(--color-text);
        }

        @media (max-width: 640px) {
          .toast-container {
            left: 1rem;
            right: 1rem;
            max-width: none;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
