
import React, { useState, useEffect } from 'react';
import type { OrderItem as OrderItemType, Discount } from '../types';
import { formatCurrency, DEFAULT_TAX_RATE } from '../constants';
import { OrderItem } from './OrderItem';
import { PaymentModal } from './PaymentModal';
import { ReceiptModal } from './ReceiptModal';

interface OrderSummaryProps {
  items: OrderItemType[];
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onClear: () => void;
  onPay: () => void;
  payButtonText: string;
  isPayButtonDisabled: boolean;
  
  // Totals and Tax/Discount from parent
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number; // raw tax rate (e.g., 0.11)

  // Discount specific props
  discounts: Discount[];
  appliedDiscount: Discount | null;
  onApplyDiscount: (discountId: number | null) => void;
  showDiscount: boolean;

  // Table & Guest info
  tableNumber: string;
  onTableNumberChange: (tableNumber: string) => void;
  isTableNumberEditable: boolean;
  guestName: string;
  onGuestNameChange: (guestName: string) => void;
  isGuestNameEditable: boolean;

  onStartNewOrder?: () => void;
  showStartNewOrderButton?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  onUpdateQuantity,
  onClear,
  onPay,
  payButtonText,
  isPayButtonDisabled,
  subtotal,
  tax,
  total,
  taxRate,
  discounts,
  appliedDiscount,
  onApplyDiscount,
  showDiscount,
  tableNumber,
  onTableNumberChange,
  isTableNumberEditable,
  guestName,
  onGuestNameChange,
  isGuestNameEditable,
  onStartNewOrder,
  showStartNewOrderButton = false,
}) => {
  const discountAmount = appliedDiscount ? subtotal * appliedDiscount.percentage : 0;
  
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 sticky top-24">
      <h2 className="text-2xl font-bold text-white mb-6">Ringkasan Pesanan</h2>

      {/* Table Number & Guest Name Inputs */}
      <div className="mb-4 space-y-3">
        <div>
          <label htmlFor="tableNumber" className="block text-sm font-medium text-slate-300 mb-1">Nomor Meja</label>
          <input
            type="text"
            id="tableNumber"
            value={tableNumber}
            onChange={(e) => onTableNumberChange(e.target.value)}
            disabled={!isTableNumberEditable}
            className={`w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${!isTableNumberEditable ? 'opacity-70 cursor-not-allowed' : ''}`}
            placeholder="misal: 1A"
          />
        </div>
        <div>
          <label htmlFor="guestName" className="block text-sm font-medium text-slate-300 mb-1">Nama Pelanggan</label>
          <input
            type="text"
            id="guestName"
            value={guestName}
            onChange={(e) => onGuestNameChange(e.target.value)}
            disabled={!isGuestNameEditable}
            className={`w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm ${!isGuestNameEditable ? 'opacity-70 cursor-not-allowed' : ''}`}
            placeholder="misal: John Doe"
          />
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-hide mb-6">
        {items.length === 0 ? (
          <p className="text-slate-500 text-center py-4">Keranjang kosong.</p>
        ) : (
          items.map(item => (
            <OrderItem
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))
        )}
      </div>

      {showDiscount && (
        <div className="mb-4">
          <label htmlFor="discount" className="block text-sm font-medium text-slate-300 mb-1">Diskon</label>
          <select
            id="discount"
            value={appliedDiscount?.id || ''}
            onChange={(e) => onApplyDiscount(e.target.value ? parseInt(e.target.value, 10) : null)}
            className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
          >
            <option value="">Tidak ada diskon</option>
            {discounts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.percentage * 100}%)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2 border-t border-slate-700 pt-4 mb-6">
        <div className="flex justify-between text-slate-300">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        {appliedDiscount && (
          <div className="flex justify-between text-red-400 font-medium">
            <span>Diskon ({appliedDiscount.name})</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-slate-300">
          <span>Pajak ({ (taxRate * 100).toFixed(0) }%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-xl text-amber-400 border-t border-slate-700 pt-2 mt-2">
          <span>TOTAL</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={onPay}
          disabled={isPayButtonDisabled}
          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {payButtonText}
        </button>
        <button
          onClick={onClear}
          disabled={items.length === 0}
          className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Bersihkan Pesanan
        </button>
        {showStartNewOrderButton && onStartNewOrder && (
          <button
            onClick={onStartNewOrder}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Mulai Pesanan Baru
          </button>
        )}
      </div>
    </div>
  );
};
