import React from 'react';
import type { OrderItem, Discount } from '../types';
import { formatCurrency } from '../constants';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
  appliedDiscount: Discount | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, items, subtotal, tax, total, taxRate, appliedDiscount }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const discountAmount = appliedDiscount ? subtotal * appliedDiscount.percentage : 0;
  const orderId = new Date().getTime().toString().slice(-6);
  const orderDate = new Date().toLocaleString('id-ID');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
        <div 
            className="bg-slate-100 text-black rounded-lg shadow-2xl w-full max-w-sm m-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
        >
            <div id="receipt-content" className="p-6 font-mono text-sm">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Kopi Kiosk</h2>
                    <p>Terima kasih atas kunjungan Anda!</p>
                </div>
                <div className="flex justify-between border-b border-dashed border-black pb-1 mb-2 text-xs">
                    <span>ID Pesanan: {orderId}</span>
                    <span>{orderDate}</span>
                </div>
                <table className="w-full mb-4 text-black">
                    <thead>
                        <tr className="border-b border-dashed border-black">
                            <th className="font-semibold text-left py-1">JML</th>
                            <th className="font-semibold text-left py-1">ITEM</th>
                            <th className="font-semibold text-right py-1">SUBTOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="text-left align-top py-1 pr-1">{item.quantity}x</td>
                                <td className="text-left py-1">{item.name}</td>
                                <td className="text-right align-top py-1">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="space-y-1 border-t border-dashed border-black pt-2">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                    </div>
                    {appliedDiscount && (
                         <div className="flex justify-between">
                            <span>Diskon ({appliedDiscount.name})</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Pajak ({ (taxRate * 100).toFixed(0) }%)</span>
                        <span>{formatCurrency(tax)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-base border-t border-black mt-2 pt-2">
                        <span>TOTAL</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <p>Silakan datang kembali!</p>
                </div>
            </div>

            <div className="p-4 bg-slate-200 border-t border-slate-300 flex justify-end gap-3 no-print rounded-b-lg">
                <button 
                    onClick={onClose} 
                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Tutup
                </button>
                <button 
                    onClick={handlePrint} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Cetak Tanda Terima
                </button>
            </div>
        </div>
    </div>
  );
};