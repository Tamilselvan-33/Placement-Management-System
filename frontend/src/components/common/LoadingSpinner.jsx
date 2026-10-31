import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 24, text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 size={size} className="animate-spin text-indigo-600" />
      {text && <p className="text-sm text-slate-500 font-medium">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

