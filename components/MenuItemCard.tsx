import React from 'react';
import type { MenuItem } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddItem: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onAddItem }) => {
  return (
    <div 
      className="relative bg-slate-800 rounded-lg shadow-lg overflow-hidden cursor-pointer group transform transition-transform hover:scale-105 hover:shadow-amber-500/20"
      onClick={() => onAddItem(item)}
    >
      <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg text-white truncate">{item.name}</h3>
        <p className="text-slate-400 text-sm">{`$${item.price.toFixed(2)}`}</p>
      </div>
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
         <span className="text-white font-bold text-xl">Add to Order</span>
      </div>
    </div>
  );
};