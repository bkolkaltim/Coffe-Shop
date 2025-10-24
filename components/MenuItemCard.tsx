import React from 'react';
import type { MenuItem } from '../types';
import { formatCurrency } from '../constants';
import { PlusIcon } from './Icons';

interface MenuItemCardProps {
  item: MenuItem;
  onAddItem: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddItem }) => {
  const isOutOfStock = item.stock === 0;
  const isLowStock = item.stock > 0 && item.stock <= 5;

  return (
    <button
      onClick={() => onAddItem(item)}
      disabled={isOutOfStock}
      className={`bg-slate-800 rounded-lg shadow-md overflow-hidden flex flex-col group relative text-left w-full transition-transform hover:scale-105 ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      
      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <span className="text-white font-bold text-lg bg-red-600/80 px-4 py-2 rounded-md">Habis</span>
        </div>
      )}
      
      {isLowStock && (
         <div className="absolute top-2 left-2 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-10">
          {item.stock} tersisa
        </div>
      )}

      <div className="relative">
        <img src={item.imageUrl} alt={item.name} className={`w-full h-40 object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
        {/* Visual feedback icon */}
        <div
          className="absolute top-2 right-2 bg-amber-500/80 text-white rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-200"
        >
          <PlusIcon className="w-6 h-6" />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-white">{item.name}</h3>
        <p className="text-sm text-slate-400 mb-2">{item.category}</p>
        <p className="text-xl font-semibold text-amber-400 mt-auto">{formatCurrency(item.price)}</p>
      </div>
    </button>
  );
};