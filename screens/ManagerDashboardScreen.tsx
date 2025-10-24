import React from 'react';
import { Header } from '../components/Header';
import { User } from '../types';
import { CogIcon, TrashIcon, CoffeeIcon } from '../components/Icons';

interface ManagerDashboardScreenProps {
    onBack: () => void;
    currentUser: User;
    onLogout: () => void;
    onNavigateToCashierManagement: () => void;
    onNavigateToTransactionLog: () => void;
    onNavigateToCashierScreen: () => void;
    onOpenMenuManagement: () => void;
}

export const ManagerDashboardScreen: React.FC<ManagerDashboardScreenProps> = ({
    onBack,
    currentUser,
    onLogout,
    onNavigateToCashierManagement,
    onNavigateToTransactionLog,
    onNavigateToCashierScreen,
    onOpenMenuManagement,
}) => {
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <DashboardButton
                        title="Kelola Staf"
                        description="Tambahkan atau hapus akun kasir dan dapur."
                        onClick={onNavigateToCashierManagement}
                        icon={<CogIcon className="w-8 h-8 text-blue-400" />}
                    />
                    <DashboardButton
                        title="Log Transaksi"
                        description="Lihat semua riwayat pesanan (tertunda, disetujui, selesai)."
                        onClick={onNavigateToTransactionLog}
                        icon={<TrashIcon className="w-8 h-8 text-green-400" />}
                    />
                    <DashboardButton
                        title="Kelola Menu"
                        description="Tambah, edit, hapus item menu, kategori, diskon, dan tarif pajak."
                        onClick={onOpenMenuManagement}
                        icon={<CoffeeIcon className="w-8 h-8 text-amber-400" />}
                    />
                     <DashboardButton
                        title="Layar Kasir"
                        description="Pantau pesanan masuk secara real-time dan proses pembayaran."
                        onClick={onNavigateToCashierScreen}
                        icon={<CoffeeIcon className="w-8 h-8 text-purple-400" />}
                    />
                </div>
            </main>
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
        className="bg-slate-800 p-6 rounded-lg text-left hover:bg-slate-700 border border-slate-700 hover:border-amber-500 transition-all duration-300 transform hover:scale-105 flex items-center space-x-4"
    >
        <div className="flex-shrink-0">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
            <p className="text-slate-400 text-sm">{description}</p>
        </div>
    </button>
);