import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  items: string[];
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

const orders: Map<string, Order> = new Map();

export function seedOrders(): void {
  const now = new Date().toISOString();
  const samples: Array<{ customerName: string; items: string[]; status: OrderStatus }> = [
    { customerName: 'Alice', items: ['Latte', 'Croissant'], status: 'pending' },
    { customerName: 'Bob', items: ['Espresso'], status: 'confirmed' },
    { customerName: 'Carol', items: ['Cappuccino', 'Muffin', 'Orange Juice'], status: 'delivering' },
  ];
  for (const s of samples) {
    const id = uuidv4();
    orders.set(id, { id, ...s, createdAt: now, updatedAt: now });
  }
}

export function getAllOrders(): Order[] {
  return Array.from(orders.values());
}

export function getOrderById(id: string): Order | undefined {
  return orders.get(id);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  return order;
}

const validStatuses: ReadonlySet<string> = new Set<OrderStatus>([
  'pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled',
]);

export function isValidStatus(value: unknown): value is OrderStatus {
  return typeof value === 'string' && validStatuses.has(value);
}
