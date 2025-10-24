import React, { useState } from 'react';
import { CoffeeIcon } from './Icons';
import * as db from '../services/db';
import type { User } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const users = await db.getAllUsers();
      const authenticatedUser = users.find(
        user => user.username.toLowerCase() === username.toLowerCase() && user.password === password
      );

      if (authenticatedUser) {
        onLoginSuccess(authenticatedUser);
      } else {
        setError('Nama pengguna atau password salah.');
        setPassword('');
      }
    } catch (err) {
      console.error("Error during login:", err);
      setError('Terjadi kesalahan saat mencoba login.');
    }
  };

  return (
    <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
            <CoffeeIcon className="w-16 h-16 text-amber-500" />
            <h1 className="text-4xl font-bold text-white tracking-tight mt-2">Kopi Kiosk</h1>
            <p className="text-slate-400">Silakan login untuk melanjutkan</p>
        </div>
        
        <form 
            onSubmit={handleSubmit} 
            className="bg-slate-800 shadow-2xl rounded-lg px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="username">
              Nama Pengguna
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="contoh: pelanggan, kasir, manager"
              required
              className="shadow appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-amber-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="shadow appearance-none border border-slate-700 rounded w-full py-3 px-4 bg-slate-700 text-white mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-amber-500"
            />
             {error && <p className="text-red-500 text-xs italic">{error}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};