import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { MenuGrid } from '../components/MenuGrid';
import { OrderSummary } from '../components/OrderSummary';
import * as db from '../services/db';
import type { User, MenuItem, OrderItem, Order } from '../types';
import { DEFAULT_TAX_RATE, DEFAULT_DISCOUNTS } from '../constants';

interface CustomerOrderingScreenProps {
    currentUser: User;
    onLogout: () => void;
}

export const CustomerOrderingScreen: React.FC<CustomerOrderingScreenProps> = ({ currentUser, onLogout }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState('');
  const [guestName, setGuestName] = useState(currentUser.username);
  const [orderTotals, setOrderTotals] = useState({ subtotal: 0, tax: 0, total: 0 });
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const CUSTOMER_SESSION_KEY = `customerSession_${currentUser.id}`;
  const isEditing = activeOrderId !== null;

  useEffect(() => {
    const newSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newTax = newSubtotal * DEFAULT_TAX_RATE;
    const newTotal = newSubtotal + newTax;
    setOrderTotals({ subtotal: newSubtotal, tax: newTax, total: newTotal });
  }, [orderItems]);

  const fetchMenuItems = useCallback(async () => {
    try {
      const items = await db.getAllMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(CUSTOMER_SESSION_KEY);
    setActiveOrderId(null);
    setOrderItems([]);
    setTableNumber('');
    setGuestName(currentUser.username);
    setSubmissionSuccess(false);
  }, [CUSTOMER_SESSION_KEY, currentUser.username]);
  
  // Effect to load session on mount
  useEffect(() => {
    fetchMenuItems();
    const loadSession = async () => {
        const session = sessionStorage.getItem(CUSTOMER_SESSION_KEY);
        if (session) {
            const { orderId } = JSON.parse(session);
            const existingOrder = await db.getOrderById(orderId);
            if (existingOrder && (existingOrder.status === 'Pending' || existingOrder.status === 'Approved')) {
                setTableNumber(existingOrder.tableNumber);
                setOrderItems(existingOrder.items);
                setGuestName(existingOrder.guestName || currentUser.username);
                setActiveOrderId(existingOrder.id);
                setSubmissionSuccess(true); // Show the 'waiting' screen
            } else {
                clearSession();
            }
        }
    };
    loadSession();
  }, [fetchMenuItems, clearSession, CUSTOMER_SESSION_KEY, currentUser.username]);
  
  // Effect to poll for order status changes (e.g., cashier completing the order)
  useEffect(() => {
    if (!activeOrderId) return;

    const pollInterval = setInterval(async () => {
        try {
            const order = await db.getOrderById(activeOrderId);
            if (!order || order.status === 'Completed' || order.status === 'Cancelled') {
                alert('Transaksi pesanan Anda telah selesai atau dibatalkan. Layar akan diatur ulang.');
                clearSession();
            }
        } catch (error) {
            console.error('Error polling order status:', error);
        }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [activeOrderId, clearSession]);

  const handleAddItem = (itemToAdd: MenuItem) => {
    if (itemToAdd.stock <= 0) return;

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      
      if (currentQuantity >= itemToAdd.stock) {
        return prevItems;
      }

      if (existingItem) {
        return prevItems.map(item =>
          item.id === itemToAdd.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    const stockItem = menuItems.find(item => item.id === itemId);
    if (!stockItem) return;
    const validatedQuantity = Math.max(0, Math.min(newQuantity, stockItem.stock));
    if (validatedQuantity <= 0) {
      setOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } else {
      setOrderItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: validatedQuantity } : item
        )
      );
    }
  };

  const handleClearOrder = () => {
    setOrderItems([]);
    if (!isEditing) {
        setTableNumber('');
        setGuestName(currentUser.username);
    }
  };
  
  const handleStartNewOrder = () => {
      if (orderItems.length > 0 && !submissionSuccess) {
          if (window.confirm("Apakah Anda yakin ingin memulai pesanan baru? Pesanan saat ini akan dibersihkan.")) {
              clearSession();
          }
      } else {
          clearSession();
      }
  };
  
  const handleSubmitOrder = async () => {
      if (tableNumber.trim() === '') {
          alert('Silakan masukkan nomor meja Anda.');
          return;
      }
      if (orderItems.length === 0) {
          alert('Keranjang pesanan Anda kosong.');
          return;
      }

      setIsSubmitting(true);

      const orderPayload = {
          tableNumber: tableNumber.trim(),
          guestName: guestName.trim() || currentUser.username,
          items: orderItems,
          status: 'Pending' as const,
          createdAt: new Date(),
          subtotal: orderTotals.subtotal,
          tax: orderTotals.tax,
          total: orderTotals.total,
          appliedDiscount: null,
      };

      try {
        const newOrder = await db.addOrder(orderPayload);
        setActiveOrderId(newOrder.id);
        sessionStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify({ orderId: newOrder.id }));
        setSubmissionSuccess(true);
      } catch (error) {
          console.error("Failed to submit order:", error);
          alert('Gagal mengirim pesanan. Silakan coba lagi.');
      } finally {
        setIsSubmitting(false);
      }
  };

  const payButtonDisabled = isSubmitting || tableNumber.trim() === '' || orderItems.length === 0;

  return (
    <>
      <Header currentUser={currentUser} onLogout={onLogout} title="Pesan Sekarang" />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {submissionSuccess ? (
             <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-3xl font-bold text-white mb-2">Pesanan Terkirim!</h2>
                <p className="text-slate-300 max-w-md mb-8">
                    Pesanan Anda telah dikirim ke kasir. Silakan tunggu konfirmasi dan lakukan pembayaran di kasir jika sudah disetujui.
                </p>
                <button
                    onClick={handleStartNewOrder}
                    className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                >
                    Buat Pesanan Baru
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-6">
                <MenuGrid menuItems={menuItems} onAddItem={handleAddItem} />
            </div>
            <div className="lg:col-span-1">
                <OrderSummary 
                    items={orderItems} 
                    onUpdateQuantity={handleUpdateQuantity}
                    onClear={handleClearOrder}
                    onPay={handleSubmitOrder}
                    payButtonText={"Kirim Pesanan"}
                    isPayButtonDisabled={payButtonDisabled}
                    taxRate={DEFAULT_TAX_RATE}
                    subtotal={orderTotals.subtotal}
                    tax={orderTotals.tax}
                    total={orderTotals.total}
                    discounts={[]}
                    appliedDiscount={null}
                    onApplyDiscount={() => {}}
                    showDiscount={false}
                    tableNumber={tableNumber}
                    onTableNumberChange={setTableNumber}
                    isTableNumberEditable={true}
                    guestName={guestName}
                    onGuestNameChange={setGuestName}
                    isGuestNameEditable={true}
                />
            </div>
            </div>
        )}
      </main>
    </>
  );
};