import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { MenuGrid } from '../components/MenuGrid';
import { OrderSummary } from '../components/OrderSummary';
import { DailySpecial } from '../components/DailySpecial';
import { PaymentModal } from '../components/PaymentModal';
import { ReceiptModal } from '../components/ReceiptModal';
import * as db from '../services/db';
import * as geminiService from '../services/geminiService';
import type { User, MenuItem, OrderItem, Order, Discount } from '../types';
// FIX: Added formatCurrency to the import statement.
import { DEFAULT_TAX_RATE, formatCurrency } from '../constants';

interface CashierScreenProps {
  currentUser: User;
  onLogout: () => void;
  onOpenMenuManagement: () => void;
}

export const CashierScreen: React.FC<CashierScreenProps> = ({ currentUser, onLogout, onOpenMenuManagement }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [tableNumber, setTableNumber] = useState('1');
  const [guestName, setGuestName] = useState('Tamu');
  const [appliedDiscount, setAppliedDiscount] = useState<Discount | null>(null);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [taxRate, setTaxRate] = useState<number>(DEFAULT_TAX_RATE);

  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [dailySpecial, setDailySpecial] = useState<string | null>(null);
  const [isDailySpecialLoading, setIsDailySpecialLoading] = useState(false);

  const [pendingGuestOrders, setPendingGuestOrders] = useState<Order[]>([]);
  const [selectedGuestOrder, setSelectedGuestOrder] = useState<Order | null>(null);

  const fetchMenuRelatedData = useCallback(async () => {
    try {
      const items = await db.getAllMenuItems();
      setMenuItems(items);
      setDiscounts(JSON.parse(localStorage.getItem('discounts') || '[]'));
      setTaxRate(parseFloat(localStorage.getItem('taxRate') || String(DEFAULT_TAX_RATE)));
    } catch (error) {
      console.error("Failed to fetch menu related data:", error);
    }
  }, []);

  const fetchPendingGuestOrders = useCallback(async () => {
    try {
      const allOrders = await db.getAllOrders();
      const pending = allOrders.filter(order => order.status === 'Pending');
      setPendingGuestOrders(pending.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()));
    } catch (error) {
      console.error("Failed to fetch pending guest orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchMenuRelatedData();
    fetchPendingGuestOrders();

    const interval = setInterval(() => {
      fetchMenuRelatedData();
      fetchPendingGuestOrders();
    }, 2000); // Poll for updates every 2 seconds

    return () => clearInterval(interval);
  }, [fetchMenuRelatedData, fetchPendingGuestOrders]);

  useEffect(() => {
    let newSubtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discountAmount = appliedDiscount ? newSubtotal * appliedDiscount.percentage : 0;
    newSubtotal -= discountAmount;
    
    const newTax = newSubtotal * taxRate;
    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal + discountAmount); // Display original subtotal before discount
    setTax(newTax);
    setTotal(newTotal);
  }, [orderItems, appliedDiscount, taxRate]);

  // Daily Special Generation
  const generateNewDailySpecial = useCallback(async () => {
    setIsDailySpecialLoading(true);
    try {
      const special = await geminiService.generateDailySpecial(menuItems);
      setDailySpecial(special);
    } catch (error) {
      console.error("Error generating daily special:", error);
      setDailySpecial("Chef's Choice: A delightful surprise awaits you today!");
    } finally {
      setIsDailySpecialLoading(false);
    }
  }, [menuItems]);

  useEffect(() => {
    if (menuItems.length > 0 && !dailySpecial && !isDailySpecialLoading) {
      generateNewDailySpecial();
    }
  }, [menuItems, dailySpecial, isDailySpecialLoading, generateNewDailySpecial]);

  const handleAddItem = (itemToAdd: MenuItem) => {
    if (itemToAdd.stock <= 0) return;

    setOrderItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemToAdd.id);
      const currentQuantity = existingItem ? existingItem.quantity : 0;
      
      if (currentQuantity >= itemToAdd.stock) {
        alert(`Stok ${itemToAdd.name} tidak cukup.`);
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

    if (validatedQuantity === 0) {
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
    setAppliedDiscount(null);
    setTableNumber('1');
    setGuestName('Tamu');
    setSelectedGuestOrder(null); // Explicitly clear selected guest order
  };

  const handleApplyDiscount = (discountId: number | null) => {
    if (discountId === null) {
      setAppliedDiscount(null);
    } else {
      const discount = discounts.find(d => d.id === discountId);
      setAppliedDiscount(discount || null);
    }
  };

  const handleProcessPayment = () => {
    if (orderItems.length === 0) {
      alert('Keranjang pesanan kosong.');
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    setIsPaymentModalOpen(false);

    try {
      // Update stock for each item
      for (const orderItem of orderItems) {
        const menuItem = menuItems.find(mi => mi.id === orderItem.id);
        if (menuItem) {
          const updatedStock = menuItem.stock - orderItem.quantity;
          await db.updateMenuItem({ ...menuItem, stock: updatedStock });
        }
      }

      // Add or update order in DB
      const newOrder: Order = {
        id: selectedGuestOrder?.id || Date.now(), // Use existing ID if it's a guest order
        tableNumber: tableNumber,
        guestName: guestName,
        items: orderItems,
        status: 'Completed',
        createdAt: selectedGuestOrder?.createdAt || new Date(), // Preserve original createdAt if guest order
        subtotal: subtotal,
        tax: tax,
        total: total,
        appliedDiscount: appliedDiscount,
      };

      if (selectedGuestOrder) {
        await db.updateOrder(newOrder); // Update status to completed
      } else {
        await db.addOrder(newOrder);
      }
      
      // Refresh menu items and pending orders
      fetchMenuRelatedData();
      fetchPendingGuestOrders();

      setIsReceiptModalOpen(true); // Open receipt after successful payment and order completion
    } catch (error) {
      console.error("Failed to process payment:", error);
      alert('Gagal memproses pembayaran. Silakan coba lagi.');
    }
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    handleClearOrder(); // Clear current order after receipt is closed
  };

  const handleSelectGuestOrder = (order: Order) => {
    setSelectedGuestOrder(order);
    setTableNumber(order.tableNumber);
    setGuestName(order.guestName || 'Tamu');
    setOrderItems(order.items);
    setAppliedDiscount(order.appliedDiscount);
  };

  const handleApproveGuestOrder = async (order: Order) => {
    try {
      const updatedOrder: Order = { ...order, status: 'Approved' };
      await db.updateOrder(updatedOrder);
      fetchPendingGuestOrders();
      alert(`Pesanan Meja #${order.tableNumber} disetujui.`);
    } catch (error) {
      console.error(`Failed to approve order ${order.id}:`, error);
      alert('Gagal menyetujui pesanan. Silakan coba lagi.');
    }
  };

  const handleCancelGuestOrder = async (order: Order) => {
    if (window.confirm(`Apakah Anda yakin ingin membatalkan pesanan Meja #${order.tableNumber} (${order.guestName})?`)) {
      try {
        const updatedOrder: Order = { ...order, status: 'Cancelled' };
        await db.updateOrder(updatedOrder);
        // If the cancelled order was the one currently selected, clear it from the summary
        if (selectedGuestOrder && selectedGuestOrder.id === order.id) {
          handleClearOrder();
        }
        fetchPendingGuestOrders();
        alert(`Pesanan Meja #${order.tableNumber} dibatalkan.`);
      } catch (error) {
        console.error(`Failed to cancel order ${order.id}:`, error);
        alert('Gagal membatalkan pesanan. Silakan coba lagi.');
      }
    }
  };


  const isPayButtonDisabled = orderItems.length === 0 || total <= 0;

  return (
    <div className="min-h-screen">
      <Header
        onBack={selectedGuestOrder ? handleClearOrder : undefined} // Allow going back from selected guest order
        title={selectedGuestOrder ? `Pesanan Meja ${selectedGuestOrder.tableNumber}` : "Kasir"}
        currentUser={currentUser}
        onLogout={onLogout}
        onManageMenuClick={onOpenMenuManagement}
      />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-6">
            <DailySpecial 
              special={dailySpecial} 
              isLoading={isDailySpecialLoading} 
              onRefresh={generateNewDailySpecial} 
            />
            {pendingGuestOrders.length > 0 && (
              <div className="bg-blue-900/50 border border-blue-500 text-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">Pesanan Tertunda ({pendingGuestOrders.length})</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto scrollbar-hide">
                  {pendingGuestOrders.map(order => {
                    const isOrderSelected = selectedGuestOrder?.id === order.id;
                    return (
                      <div key={order.id} className="bg-blue-800/70 p-3 rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-semibold">Meja #{order.tableNumber} <span className="text-sm text-blue-300">({order.guestName})</span></p>
                          <p className="text-sm text-blue-300">Total: {formatCurrency(order.total)}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleSelectGuestOrder(order)}
                            disabled={isOrderSelected}
                            className={`text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors ${isOrderSelected ? 'bg-blue-700 opacity-70 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
                          >
                            {isOrderSelected ? 'Dipilih' : 'Pilih'}
                          </button>
                          <button 
                            onClick={() => handleApproveGuestOrder(order)}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                          >
                            Setujui
                          </button>
                          <button 
                            onClick={() => handleCancelGuestOrder(order)}
                            className="bg-red-600 hover:bg-red-500 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {selectedGuestOrder && (
              <div className="bg-blue-900/50 border border-blue-500 text-blue-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex-grow">
                  <p className="font-bold text-lg text-white">
                    Mengelola Pesanan Tamu: Meja #{selectedGuestOrder.tableNumber} <span className="text-blue-300">({selectedGuestOrder.guestName})</span>
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button 
                    onClick={handleClearOrder}
                    className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-semibold py-1 px-2 rounded-md transition-colors"
                  >
                    Bersihkan Seleksi
                  </button>
                  <button 
                    onClick={() => handleCancelGuestOrder(selectedGuestOrder)}
                    className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold py-1 px-2 rounded-md transition-colors"
                  >
                    Batalkan Pesanan Tamu
                  </button>
                </div>
              </div>
            )}
            <MenuGrid menuItems={menuItems} onAddItem={handleAddItem} />
          </div>
          <div className="lg:col-span-1">
            <OrderSummary
              items={orderItems}
              onUpdateQuantity={handleUpdateQuantity}
              onClear={handleClearOrder}
              onPay={handleProcessPayment}
              payButtonText="Proses Pembayaran"
              isPayButtonDisabled={isPayButtonDisabled}
              subtotal={subtotal}
              tax={tax}
              total={total}
              taxRate={taxRate}
              discounts={discounts}
              appliedDiscount={appliedDiscount}
              onApplyDiscount={handleApplyDiscount}
              showDiscount={true}
              tableNumber={tableNumber}
              onTableNumberChange={setTableNumber}
              isTableNumberEditable={selectedGuestOrder === null}
              guestName={guestName}
              onGuestNameChange={setGuestName}
              isGuestNameEditable={selectedGuestOrder === null}
              showStartNewOrderButton={selectedGuestOrder !== null}
              onStartNewOrder={handleClearOrder}
            />
          </div>
        </div>
      </main>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handleConfirmPayment}
        total={total}
      />

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceiptModal}
        items={orderItems}
        subtotal={subtotal}
        tax={tax}
        total={total}
        taxRate={taxRate}
        appliedDiscount={appliedDiscount}
      />
    </div>
  );
};