
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}
