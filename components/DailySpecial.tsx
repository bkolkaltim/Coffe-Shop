
import React from 'react';
import { SparklesIcon, RefreshIcon } from './Icons';

interface DailySpecialProps {
  special: string | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const DailySpecial: React.FC<DailySpecialProps> = ({ special, isLoading, onRefresh }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
        <div className="h-6 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }

  const [title, description] = special ? special.split(':') : ["Today's Special", "Unavailable"];

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <SparklesIcon className="w-8 h-8 text-amber-400 flex-shrink-0" />
        <div>
          <h2 className="font-semibold text-amber-300">{title.trim()}:</h2>
          <p className="text-lg font-bold text-white">{description ? description.trim() : ''}</p>
        </div>
      </div>
      <button 
        onClick={onRefresh} 
        className="p-2 rounded-full hover:bg-slate-700 transition-colors"
        aria-label="Refresh Special"
        >
        <RefreshIcon className="w-5 h-5 text-slate-400" />
      </button>
    </div>
  );
};
