
import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import * as db from '../services/db';
import type { Order, User } from '../types';

interface KitchenDisplayScreenProps {
  onLogout: () => void;
  currentUser: User;
}

const ORDERS_PER_PAGE = 5;

export const KitchenDisplayScreen: React.FC<KitchenDisplayScreenProps> = ({ onLogout, currentUser }) => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<Order[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchKitchenOrders = useCallback(async () => {
    try {
      const allOrders = await db.getAllOrders();
      
      const active = allOrders
        .filter(order => order.status === 'Approved' || order.status === 'Completed')
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Oldest first for active queue

      const prepared = allOrders
        .filter(order => order.status === 'Prepared')
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Newest first for history

      setActiveOrders(active);
      setPreparedOrders(prepared);
    } catch (error) {
      console.error("Failed to fetch orders for kitchen display:", error);
    }
  }, []);

  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 3000); 
    return () => clearInterval(interval);
  }, [fetchKitchenOrders]);

  const handleCompleteOrder = async (order: Order) => {
    try {
      const updatedOrder: Order = { ...order, status: 'Prepared' };
      await db.updateOrder(updatedOrder);
      fetchKitchenOrders();
    } catch (error) {
      console.error(`Failed to update order status for order ${order.id} to Prepared:`, error);
      alert('Gagal memperbarui status pesanan. Silakan coba lagi.');
    }
  };
  
  // Pagination logic
  const totalPages = Math.ceil(preparedOrders.length / ORDERS_PER_PAGE);
  const indexOfLastOrder = currentPage * ORDERS_PER_PAGE;
  const indexOfFirstOrder = indexOfLastOrder - ORDERS_PER_PAGE;
  const currentPreparedOrders = preparedOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [preparedOrders, currentPage, totalPages]);


  const getStatusClasses = (status: Order['status']) => {
    switch (status) {
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-teal-100 text-teal-800';
      case 'Prepared': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBorderClasses = (status: Order['status']) => {
    switch (status) {
      case 'Approved': return 'border-blue-500';
      case 'Completed': return 'border-teal-500';
      case 'Prepared': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'Approved': return 'Disetujui Kasir';
      case 'Completed': return 'Lunas, Siap Diproses';
      case 'Prepared': return 'Selesai Disiapkan';
      default: return 'Status Tidak Diketahui';
    }
  };

  return (
    <div className="min-h-screen">
      <Header onLogout={onLogout} title="Layar Dapur" currentUser={currentUser} /> 
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="space-y-8">
            {/* Active Orders Section */}
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                  Pesanan Aktif ({activeOrders.length})
              </h3>
              {activeOrders.length === 0 ? (
                <p className="text-slate-500 text-center py-8">Tidak ada pesanan aktif.</p>
              ) : (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
                  {activeOrders.map(order => (
                    <div key={order.id} className={`bg-slate-700/50 p-4 rounded-lg border-l-4 ${getBorderClasses(order.status)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-lg text-white">Meja #{order.tableNumber} <span className="text-sm text-slate-400">({order.guestName})</span></p>
                        <span className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleTimeString('id-ID')}</span>
                      </div>
                      <div className="mb-3">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-slate-300 mb-3 space-y-1">
                        {order.items.map(item => (
                          <li key={item.id}>{item.name} x {item.quantity}</li>
                        ))}
                      </ul>
                      <button
                          onClick={() => handleCompleteOrder(order)}
                          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                          Selesai Siapkan
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Prepared Orders History Section */}
            <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Riwayat Pesanan Selesai</h3>
                {preparedOrders.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">Belum ada pesanan yang diselesaikan.</p>
                ) : (
                    <>
                        <div className="space-y-4">
                            {currentPreparedOrders.map(order => (
                                <div key={order.id} className={`bg-slate-700/50 p-4 rounded-lg border-l-4 opacity-80 ${getBorderClasses(order.status)}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-lg text-white">Meja #{order.tableNumber} <span className="text-sm text-slate-400">({order.guestName})</span></p>
                                        <span className="text-sm text-slate-400">{new Date(order.createdAt).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="mb-3">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </div>
                                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                                        {order.items.map(item => (
                                            <li key={item.id}>{item.name} x {item.quantity}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sebelumnya
                                </button>
                                <span className="text-slate-400">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </main>
    </div>
  );
};
