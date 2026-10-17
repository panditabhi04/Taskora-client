import React, { useEffect } from 'react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  const bgStyle = isSuccess
    ? 'bg-emerald-600 text-white'
    : isError
    ? 'bg-red-600 text-white'
    : isWarning
    ? 'bg-amber-600 text-white'
    : 'bg-slate-800 text-white';

  return (
    <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-xs sm:text-sm font-medium transition-all duration-300 animate-fadeIn max-w-md">
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg ${bgStyle}`}>
        {isSuccess && (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {(isError || isWarning) && (
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        <span className="leading-snug">{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-white/80 hover:text-white font-bold text-base leading-none cursor-pointer"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
