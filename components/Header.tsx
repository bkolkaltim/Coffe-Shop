
import React from 'react';
import { CoffeeIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 border-b border-slate-800">
      <div className="container mx-auto px-4 py-3 max-w-7xl">
        <div className="flex items-center space-x-3">
          <CoffeeIcon className="w-8 h-8 text-amber-500" />
          <h1 className="text-2xl font-bold text-white tracking-tight">Kopi Kiosk</h1>
        </div>
      </div>
    </header>
  );
};
