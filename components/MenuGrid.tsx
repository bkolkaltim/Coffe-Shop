
import React from 'react';
import type { MenuItem } from '../types';
import { MenuItemCard } from './MenuItemCard';

interface MenuGridProps {
  menuItems: MenuItem[];
  onAddItem: (item: MenuItem) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ menuItems, onAddItem }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {menuItems.map((item) => (
        <MenuItemCard key={item.id} item={item} onAddItem={onAddItem} />
      ))}
    </div>
  );
};