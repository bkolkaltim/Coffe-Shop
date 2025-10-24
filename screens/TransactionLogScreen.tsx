import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import * as db from '../services/db';
import type { Order, User } from '../types';
import { formatCurrency } from '../constants';

interface TransactionLogScreenProps {
  onBack: () => void;
  currentUser: User | null;
  onLogout: () => void;
}

export const TransactionLogScreen: React.FC<TransactionLogScreenProps> = ({ onBack, currentUser, onLogout }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('All'); // 'All', 'Pending', 'Approved', 'Prepared', 'Completed', 'Cancelled'

  const fetchOrders = useCallback(async () => {
    try {
      const allOrders = await db.getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Poll every 5 seconds for updates
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'All') return true;
    return order.status === filterStatus;
  });

  const getStatusClasses = (status: Order['status']) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Prepared': return 'bg-lime-100 text-lime-800'; 
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-amber-100 text-amber-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen">
      <Header onBack={onBack} title="Log Transaksi" currentUser={currentUser} onLogout={onLogout} />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Riwayat Pesanan</h2>

        <div className="mb-6 flex gap-4 items-center">
            <label htmlFor="statusFilter" className="text-slate-300 font-medium">Filter Status:</label>
            <select
                id="statusFilter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
                <option value="All">Semua</option>
                <option value="Pending">Tertunda</option>
                <option value="Approved">Disetujui</option>
                <option value="Prepared">Dipersiapkan</option> 
                <option value="Completed">Selesai</option>
                <option value="Cancelled">Dibatalkan</option>
            </select>
        </div>

        {filteredOrders.length === 0 ? (
          <p className="text-slate-500 text-center py-16">Tidak ada pesanan yang ditemukan dengan status ini.</p>
        ) : (
          <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    ID Pesanan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Meja / Pelanggan
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Item
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      Meja {order.tableNumber} {order.guestName ? `(${order.guestName})` : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                      {order.items.map(item => `${item.name} x${item.quantity}`).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-400">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                      {order.createdAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};