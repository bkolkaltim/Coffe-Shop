import { MenuItem, Discount, User } from './types';

export const DEFAULT_TAX_RATE = 0.11; // 11%

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const DEFAULT_CATEGORIES: string[] = ['Coffee', 'Pastry', 'Tea', 'Non-Coffee', 'Merchandise', 'Beans'];

export const DEFAULT_DISCOUNTS: Discount[] = [
    { id: 1, name: 'Promo Karyawan', percentage: 0.15 },
    { id: 2, name: 'Diskon Pelajar', percentage: 0.10 },
];

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'manager', password: 'admin', role: 'manager' },
  { id: 2, username: 'kasir', password: '123', role: 'cashier' },
  { id: 3, username: 'dapur', password: 'masak', role: 'kitchen' },
  { id: 4, username: 'pelanggan', password: 'pesan', role: 'customer' },
];


// Initial data to seed the database
export const INITIAL_MENU_ITEMS: Omit<MenuItem, 'id'>[] = [
  { name: 'Espresso', price: 18000, category: 'Coffee', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Espresso', stock: 100 },
  { name: 'Americano', price: 20000, category: 'Coffee', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Americano', stock: 100 },
  { name: 'Caffe Latte', price: 25000, category: 'Coffee', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Latte', stock: 80 },
  { name: 'Cappuccino', price: 25000, category: 'Coffee', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Cappuccino', stock: 80 },
  { name: 'Vanilla Latte', price: 28000, category: 'Coffee', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Vanilla+Latte', stock: 50 },
  { name: 'Croissant', price: 15000, category: 'Pastry', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Croissant', stock: 30 },
  { name: 'Pain au Chocolat', price: 18000, category: 'Pastry', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Pain+au+Chocolat', stock: 25 },
  { name: 'Kouign-Amann', price: 22000, category: 'Pastry', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Kouign-Amann', stock: 5 },
  { name: 'Iced Tea', price: 15000, category: 'Tea', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Iced+Tea', stock: 100 },
  { name: 'Matcha Latte', price: 28000, category: 'Tea', imageUrl: 'https://placehold.co/400x400/1e293b/94a3b8?text=Matcha+Latte', stock: 40 },
];