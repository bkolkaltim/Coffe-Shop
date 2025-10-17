
import React from 'react';
import type { OrderItem as OrderItemType } from '../types';
import { OrderItem } from './OrderItem';
import { TAX_RATE } from '../constants';

interface OrderSummaryProps {
  items: OrderItemType[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onClear: () => void;
  onPay: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ items, onUpdateQuantity, onClear, onPay }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col h-full sticky top-24">
      <h2 className="text-2xl font-bold border-b border-slate-700 pb-2 mb-4 text-white">Current Order</h2>
      {items.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-500">No items in order.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-2 scrollbar-hide -mr-2">
            <div className="space-y-3">
              {items.map(item => (
                <OrderItem key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} />
              ))}
            </div>
        </div>
      )}
      <div className="mt-auto border-t border-slate-700 pt-4">
        <div className="space-y-2 text-slate-300">
            <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{`$${subtotal.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
                <span>Tax ({ (TAX_RATE * 100).toFixed(0) }%)</span>
                <span>{`$${tax.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-white">
                <span>Total</span>
                <span>{`$${total.toFixed(2)}`}</span>
            </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
            <button 
                onClick={onClear} 
                disabled={items.length === 0}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Clear
            </button>
            <button 
                onClick={onPay} 
                disabled={items.length === 0}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Pay
            </button>
        </div>
      </div>
    </div>
  );
};
