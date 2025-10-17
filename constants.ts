
import type { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: 'Espresso', category: 'Hot Coffee', price: 3.00, imageUrl: 'https://picsum.photos/id/225/400/300' },
  { id: 2, name: 'Americano', category: 'Hot Coffee', price: 3.50, imageUrl: 'https://picsum.photos/id/431/400/300' },
  { id: 3, name: 'Latte', category: 'Hot Coffee', price: 4.50, imageUrl: 'https://picsum.photos/id/30/400/300' },
  { id: 4, name: 'Cappuccino', category: 'Hot Coffee', price: 4.50, imageUrl: 'https://picsum.photos/id/326/400/300' },
  { id: 5, name: 'Mocha', category: 'Hot Coffee', price: 5.00, imageUrl: 'https://picsum.photos/id/365/400/300' },
  { id: 6, name: 'Iced Coffee', category: 'Cold Coffee', price: 4.00, imageUrl: 'https://picsum.photos/id/1060/400/300' },
  { id: 7, name: 'Cold Brew', category: 'Cold Coffee', price: 5.00, imageUrl: 'https://picsum.photos/id/1080/400/300' },
  { id: 8, name: 'Iced Latte', category: 'Cold Coffee', price: 5.00, imageUrl: 'https://picsum.photos/id/175/400/300' },
  { id: 9, name: 'Croissant', category: 'Pastries', price: 3.50, imageUrl: 'https://picsum.photos/id/368/400/300' },
  { id: 10, name: 'Muffin', category: 'Pastries', price: 3.00, imageUrl: 'https://picsum.photos/id/201/400/300' },
  { id: 11, name: 'Brownie', category: 'Pastries', price: 3.75, imageUrl: 'https://picsum.photos/id/429/400/300' },
  { id: 12, name: 'Herbal Tea', category: 'Other', price: 3.00, imageUrl: 'https://picsum.photos/id/621/400/300' },
];

export const TAX_RATE = 0.08; // 8%
