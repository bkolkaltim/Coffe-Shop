
import React, { useState, useEffect, useCallback } from 'react';
import { MenuGrid } from './components/MenuGrid';
import { OrderSummary } from './components/OrderSummary';
import { Header } from './components/Header';
import { DailySpecial } from './components/DailySpecial';
import { PaymentModal } from './components/PaymentModal';
import { MENU_ITEMS } from './constants';
import type { MenuItem, OrderItem } from './types';
import { generateDailySpecial } from './services/geminiService';

const App: React.FC = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [dailySpecial, setDailySpecial] = useState<string | null>(null);
  const [isSpecialLoading, setIsSpecialLoading] = useState(true);

  const fetchSpecial = useCallback(async () => {
    setIsSpecialLoading(true);
    try {
      const special = await generateDailySpecial(MENU_ITEMS);
      setDailySpecial(special);
    } catch (error) {
      console.error("Failed to generate daily special:", error);
      setDailySpecial("Could not fetch today's special. Please try again later.");
    } finally {
      setIsSpecialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddItem = (item: MenuItem) => {
    setOrderItems((prevItems) => {
      const existingItem = prevItems.find((orderItem) => orderItem.id === item.id);
      if (existingItem) {
        return prevItems.map((orderItem) =>
          orderItem.id === item.id
            ? { ...orderItem, quantity: orderItem.quantity + 1 }
            : orderItem
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };
  
  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
    } else {
      setOrderItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const handleClearOrder = () => {
    setOrderItems([]);
  };

  const handlePaymentSuccess = () => {
    setOrderItems([]);
    setPaymentModalOpen(false);
  };
  
  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header />
      <main className="container mx-auto p-4 max-w-7xl">
        <DailySpecial special={dailySpecial} isLoading={isSpecialLoading} onRefresh={fetchSpecial} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <div className="lg:col-span-2">
            <MenuGrid menuItems={MENU_ITEMS} onAddItem={handleAddItem} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onClear={handleClearOrder}
              onPay={() => setPaymentModalOpen(true)}
            />
          </div>
        </div>
      </main>
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onConfirm={handlePaymentSuccess}
        total={total}
      />
    </div>
  );
};

export default App;
