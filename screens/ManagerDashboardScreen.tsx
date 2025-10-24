import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { User, Order, MenuItem } from '../types';
import { CogIcon, TrashIcon, CoffeeIcon, ChartBarIcon, ArchiveBoxIcon, FireIcon, KeyIcon } from '../components/Icons';
import * as db from '../services/db';
import { formatCurrency } from '../constants';
import { ChangePasswordModal } from '../components/ChangePasswordModal';

const IncomeRecapCard: React.FC<{ income: { today: number; week: number; month: number }; isLoading: boolean }> = ({ income, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-slate-800 p-6 rounded-lg col-span-1 lg:col-span-2 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-green-400" />
                Rekap Penghasilan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
                <div>
                    <p className="text-sm text-slate-400">Hari Ini</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(income.today)}</p>
                </div>
                <div className="sm:border-l sm:border-r border-slate-700 sm:px-4">
                    <p className="text-sm text-slate-400">Minggu Ini</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(income.week)}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Bulan Ini</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(income.month)}</p>
                </div>
            </div>
        </div>
    );
};

const StockStatusCard: React.FC<{ menuItems: MenuItem[]; isLoading: boolean }> = ({ menuItems, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-slate-800 p-6 rounded-lg col-span-1 lg:col-span-2 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-1/3 mb-6"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-700 rounded"></div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
            </div>
        );
    }
    
    const lowStockThreshold = 5;
    const lowStockItems = menuItems.filter(item => item.stock > 0 && item.stock <= lowStockThreshold);
    const outOfStockItems = menuItems.filter(item => item.stock === 0);

    return (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 col-span-1 lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <ArchiveBoxIcon className="w-6 h-6 text-blue-400" />
                Status Stok
            </h3>
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                    <p className="text-sm text-slate-400">Total Item</p>
                    <p className="text-2xl font-bold text-white">{menuItems.length}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Stok Menipis</p>
                    <p className="text-2xl font-bold text-yellow-400">{lowStockItems.length}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Habis</p>
                    <p className="text-2xl font-bold text-red-500">{outOfStockItems.length}</p>
                </div>
            </div>
            {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
                <div className="border-t border-slate-700 pt-3">
                    <p className="text-sm font-semibold text-slate-300 mb-2">Perlu perhatian:</p>
                    <div className="max-h-24 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                        {outOfStockItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-red-400">{item.name}</span>
                                <span className="font-mono font-medium text-red-400">Habis</span>
                            </div>
                        ))}
                        {lowStockItems.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-yellow-400">{item.name}</span>
                                <span className="font-mono font-medium text-yellow-400">Sisa {item.stock}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

interface ManagerDashboardScreenProps {
    onBack: () => void;
    currentUser: User;
    onLogout: () => void;
    onNavigateToCashierManagement: () => void;
    onNavigateToTransactionLog: () => void;
    onNavigateToCashierScreen: () => void;
    onNavigateToKitchenScreen: () => void;
    onOpenMenuManagement: () => void;
    onUserUpdate: (user: User) => void;
}

export const ManagerDashboardScreen: React.FC<ManagerDashboardScreenProps> = ({
    currentUser,
    onLogout,
    onNavigateToCashierManagement,
    onNavigateToTransactionLog,
    onNavigateToCashierScreen,
    onNavigateToKitchenScreen,
    onOpenMenuManagement,
    onUserUpdate,
}) => {
    const [income, setIncome] = useState({ today: 0, week: 0, month: 0 });
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [orders, items] = await Promise.all([
                db.getAllOrders(),
                db.getAllMenuItems()
            ]);

            // FIX: Count 'Prepared' orders as completed for income calculation.
            const completedOrders = orders.filter(o => o.status === 'Completed' || o.status === 'Prepared');

            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const startOfWeek = new Date(todayStart);
            const dayOfWeek = todayStart.getDay(); // Sunday - 0, Monday - 1
            const diff = todayStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when Sunday
            startOfWeek.setDate(diff);

            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            let todayIncome = 0;
            let weekIncome = 0;
            let monthIncome = 0;

            for (const order of completedOrders) {
                const orderDate = new Date(order.createdAt);
                if (orderDate >= todayStart) {
                    todayIncome += order.total;
                }
                if (orderDate >= startOfWeek) {
                    weekIncome += order.total;
                }
                if (orderDate >= startOfMonth) {
                    monthIncome += order.total;
                }
            }

            setIncome({ today: todayIncome, week: weekIncome, month: monthIncome });
            setMenuItems(items);

        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [fetchData]);
    
    const handleChangePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
        if (currentUser.password !== currentPassword) {
            return false;
        }
        try {
            const updatedUser = { ...currentUser, password: newPassword };
            await db.updateUser(updatedUser);
            onUserUpdate(updatedUser);
            alert('Password berhasil diubah.');
            return true;
        } catch (error) {
            console.error("Failed to change password:", error);
            alert('Gagal mengubah password. Silakan coba lagi.');
            return false;
        }
    };

    return (
        <div className="min-h-screen">
            <Header
                title="Dashboard Manajer"
                currentUser={currentUser}
                onLogout={onLogout}
                onManageMenuClick={onOpenMenuManagement}
            />
            <main className="container mx-auto px-4 py-6 max-w-7xl">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Selamat Datang, {currentUser.username}!</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <IncomeRecapCard income={income} isLoading={isLoading} />
                    <StockStatusCard menuItems={menuItems} isLoading={isLoading} />
                </div>
                
                <h3 className="text-2xl font-bold text-white tracking-tight mb-4">Akses Cepat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <DashboardButton
                        title="Buka Kasir"
                        description="Pantau pesanan masuk dan proses pembayaran."
                        onClick={onNavigateToCashierScreen}
                        icon={<CoffeeIcon className="w-8 h-8 text-purple-400" />}
                    />
                    <DashboardButton
                        title="Mode Dapur"
                        description="Lihat antrian pesanan yang perlu disiapkan."
                        onClick={onNavigateToKitchenScreen}
                        icon={<FireIcon className="w-8 h-8 text-orange-400" />}
                    />
                    <DashboardButton
                        title="Kelola Menu"
                        description="Atur item, kategori, diskon, dan pajak."
                        onClick={onOpenMenuManagement}
                        icon={<CoffeeIcon className="w-8 h-8 text-amber-400" />}
                    />
                    <DashboardButton
                        title="Kelola Staf"
                        description="Tambahkan atau hapus akun staf."
                        onClick={onNavigateToCashierManagement}
                        icon={<CogIcon className="w-8 h-8 text-blue-400" />}
                    />
                    <DashboardButton
                        title="Log Transaksi"
                        description="Lihat semua riwayat pesanan."
                        onClick={onNavigateToTransactionLog}
                        icon={<TrashIcon className="w-8 h-8 text-green-400" />}
                    />
                     <DashboardButton
                        title="Ganti Password"
                        description="Ubah password login Anda."
                        onClick={() => setIsChangePasswordModalOpen(true)}
                        icon={<KeyIcon className="w-8 h-8 text-gray-400" />}
                    />
                </div>
            </main>
            <ChangePasswordModal
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                onSave={handleChangePassword}
                currentUser={currentUser}
            />
        </div>
    );
};

interface DashboardButtonProps {
    title: string;
    description: string;
    onClick: () => void;
    icon: React.ReactNode;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ title, description, onClick, icon }) => (
    <button
        onClick={onClick}
        className="bg-slate-800 p-6 rounded-lg text-left hover:bg-slate-700 border border-slate-700 hover:border-amber-500 transition-all duration-300 transform hover:scale-105 flex items-start space-x-4 h-full"
    >
        <div className="flex-shrink-0 mt-1">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </button>
);