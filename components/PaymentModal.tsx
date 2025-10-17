
import React from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onConfirm, total }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-2xl p-8 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">Payment</h2>
        <p className="text-slate-400 text-center mb-6">Confirm payment for the order.</p>

        <div className="bg-slate-900 rounded-lg p-6 mb-6 text-center">
            <span className="text-slate-400 text-lg">Total Amount</span>
            <p className="text-5xl font-extrabold text-amber-400 tracking-tight">{`$${total.toFixed(2)}`}</p>
        </div>

        <div className="space-y-4">
             <button
                onClick={onConfirm}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-4 rounded-lg transition-colors text-lg"
              >
                Confirm Payment
              </button>
             <button
                onClick={onClose}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
              >
                Cancel
             </button>
        </div>
      </div>
    </div>
  );
};
