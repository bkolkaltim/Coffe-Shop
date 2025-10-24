import React from 'react';
import type { OrderItem as OrderItemType } from '../types';
import { MinusIcon, PlusIcon, TrashIcon } from './Icons';
import { formatCurrency } from '../constants';

interface OrderItemProps {
  item: OrderItemType;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  isEditable?: boolean;
}

export const OrderItem: React.FC<OrderItemProps> = ({ item, onUpdateQuantity, isEditable = true }) => {
  return (
    <div className="flex items-center space-x-3 bg-slate-700/50 p-2 rounded-lg">
      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
      <div className="flex-grow">
        <p className="font-semibold text-white">{item.name}</p>
        <p className="text-sm text-slate-400">{formatCurrency(item.price)}</p>
      </div>
      {isEditable && (
        <div className="flex items-center space-x-2">
          <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors">
            <MinusIcon className="w-4 h-4 text-white" />
          </button>
          <span className="font-bold w-6 text-center text-white">{item.quantity}</span>
          <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-slate-600 hover:bg-slate-500 transition-colors">
            <PlusIcon className="w-4 h-4 text-white" />
          </button>
        </div>
      )}
      <div className="font-bold text-right w-24 text-white">
        {isEditable ? formatCurrency(item.price * item.quantity) : `${item.quantity}x`}
      </div>
       {isEditable && (
        <button onClick={() => onUpdateQuantity(item.id, 0)} className="p-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors">
            <TrashIcon className="w-5 h-5" />
          </button>
       )}
    </div>
  );
};