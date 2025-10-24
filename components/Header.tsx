import React from 'react';
import { CoffeeIcon, CogIcon, LogoutIcon } from './Icons';
import type { User } from '../types';

interface HeaderProps {
  onManageMenuClick?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
  onBack?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onManageMenuClick, currentUser, onLogout, onBack, title = "Kopi Kiosk" }) => {
  const isManager = currentUser?.role === 'manager';

  return (
    <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800">
      <div className="container mx-auto px-4 py-3 max-w-7xl flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {onBack && (
             <button onClick={onBack} className="text-slate-300 hover:text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
             </button>
          )}
          <CoffeeIcon className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        </div>
        
        {currentUser && onLogout && (
          <div className="flex items-center gap-4">
              <div className="text-right">
                  <span className="text-sm font-medium text-white capitalize">{currentUser.username}</span>
                  <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
            {onManageMenuClick && (
              <button 
                onClick={onManageMenuClick}
                className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-lg transition-colors"
                aria-label="Manage Menu"
              >
                <CogIcon className="w-5 h-5" />
                <span>Kelola Menu</span>
              </button>
            )}
             <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-sm bg-red-800 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};