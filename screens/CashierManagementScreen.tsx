import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import * as db from '../services/db';
import type { User } from '../types';
import { PlusIcon, TrashIcon } from '../components/Icons';

const usePolling = (callback: () => void, delay: number | null) => {
    useEffect(() => {
        if (delay !== null) {
            callback();
            const interval = setInterval(callback, delay);
            return () => clearInterval(interval);
        }
    }, [callback, delay]);
};

interface CashierManagementScreenProps {
    onBack: () => void;
    currentUser: User;
    onLogout: () => void;
}

export const CashierManagementScreen: React.FC<CashierManagementScreenProps> = ({ onBack, currentUser, onLogout }) => {
    const [staff, setStaff] = useState<User[]>([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [newRole, setNewRole] = useState<'cashier' | 'kitchen'>('cashier');
    const [error, setError] = useState('');

    const fetchStaff = useCallback(async () => {
        try {
            const allUsers = await db.getAllUsers();
            const filteredStaff = allUsers.filter(user => user.role === 'cashier' || user.role === 'kitchen');
            setStaff(filteredStaff);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        }
    }, []);

    usePolling(fetchStaff, 10000);

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newUsername.trim() === '' || newPassword.trim() === '') {
            setError('Nama pengguna dan password harus diisi.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Password tidak cocok.');
            return;
        }
        const allUsers = await db.getAllUsers();
        if (allUsers.some(u => u.username.toLowerCase() === newUsername.toLowerCase())) {
            setError('Nama pengguna sudah ada.');
            return;
        }

        try {
            const newStaffMember: Omit<User, 'id'> = {
                username: newUsername.trim(),
                password: newPassword.trim(),
                role: newRole,
            };
            await db.addUser(newStaffMember);
            setNewUsername('');
            setNewPassword('');
            setConfirmPassword('');
            setNewRole('cashier');
            fetchStaff();
        } catch (err) {
            console.error("Failed to add staff member:", err);
            setError('Gagal menambahkan staf. Silakan coba lagi.');
        }
    };

    const handleDeleteStaff = async (id: number) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus akun staf ini?')) {
            try {
                await db.deleteUser(id);
                fetchStaff();
            } catch (err) {
                console.error("Failed to delete staff member:", err);
                alert('Gagal menghapus staf. Silakan coba lagi.');
            }
        }
    };

    return (
        <div className="min-h-screen">
            <Header onBack={onBack} title="Manajemen Staf" currentUser={currentUser} onLogout={onLogout} />
            <main className="container mx-auto px-4 py-6 max-w-7xl">
                <h2 className="text-3xl font-bold text-white tracking-tight mb-6">Manajemen Akun Staf</h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Tambah Staf Baru</h3>
                        <form onSubmit={handleAddStaff} className="space-y-4">
                            <div>
                                <label htmlFor="newUsername" className="block text-sm font-medium text-slate-300">Nama Pengguna</label>
                                <input
                                    type="text"
                                    id="newUsername"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">Password</label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">Konfirmasi Password</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="newRole" className="block text-sm font-medium text-slate-300">Peran</label>
                                <select
                                    id="newRole"
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as 'cashier' | 'kitchen')}
                                    className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                >
                                    <option value="cashier">Kasir</option>
                                    <option value="kitchen">Dapur</option>
                                </select>
                            </div>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Tambah Staf
                            </button>
                        </form>
                    </div>

                    <div className="bg-slate-800 rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-white mb-4">Staf Terdaftar</h3>
                        {staff.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                                {staff.map(staffMember => (
                                    <div key={staffMember.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-white">{staffMember.username}</p>
                                            <p className="text-sm text-slate-400 capitalize">{staffMember.role}</p>
                                        </div>
                                        {staffMember.id !== currentUser.id && (
                                            <button
                                                onClick={() => handleDeleteStaff(staffMember.id)}
                                                className="p-2 rounded-full hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                                                aria-label={`Hapus ${staffMember.username}`}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-center py-8">Tidak ada akun staf terdaftar.</p>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};