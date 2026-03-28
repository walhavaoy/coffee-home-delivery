/** Product category in the catalogue. */
export type ProductCategory = 'coffee' | 'tea' | 'bakery' | 'juice';

/** A product available for purchase. */
export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  /** Unit price in dollars. */
  price: number;
}

/** Lifecycle status of an order. */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

/** A single item within a placed order (resolved product details). */
export interface OrderItem {
  productId: string;
  name: string;
  /** Unit price at time of order. */
  price: number;
  quantity: number;
}

/** An item in the shopping cart (before order placement). */
export interface CartItem {
  productId: string;
  quantity: number;
}

/** A placed order. */
export interface Order {
  id: string;
  customerName: string;
  /** Human-readable item summaries (e.g. "Latte x1"). */
  items: string[];
  orderItems: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/** Input payload for creating a new order. */
export interface CreateOrderInput {
  customerName: string;
  items: OrderItem[];
}
