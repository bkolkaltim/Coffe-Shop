// FIX: Defined core types for the application.
export interface User {
  id: number;
  username: string;
  password: string;
  role: 'cashier' | 'manager' | 'kitchen' | 'customer';
}

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

export interface Discount {
  id: number;
  name: string;
  percentage: number; // e.g., 0.10 for 10%
}

export interface OrderItem {
  id: number; // MenuItem ID
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: number;
  tableNumber: string;
  guestName: string | null;
  items: OrderItem[];
  status: 'Pending' | 'Approved' | 'Completed' | 'Cancelled' | 'Prepared'; // FIX: Added 'Prepared' status
  createdAt: Date;
  subtotal: number;
  tax: number;
  total: number;
  appliedDiscount: Discount | null;
}