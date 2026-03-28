import { v4 as uuidv4 } from 'uuid';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled';

export interface Product {
  id: string;
  name: string;
  category: 'coffee' | 'tea' | 'bakery' | 'juice';
  description: string;
  price: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  items: string[];
  orderItems: OrderItem[];
  total: number;
  status: OrderStatus;
  domain: string | null;
  portalUrl: string | null;
  shellUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  items: OrderItem[];
  domain?: string;
}

const products: Product[] = [
  { id: 'latte', name: 'Latte', category: 'coffee', description: 'Smooth espresso with steamed milk', price: 4.50 },
  { id: 'espresso', name: 'Espresso', category: 'coffee', description: 'Bold double shot espresso', price: 3.00 },
  { id: 'cappuccino', name: 'Cappuccino', category: 'coffee', description: 'Espresso with frothed milk foam', price: 4.50 },
  { id: 'americano', name: 'Americano', category: 'coffee', description: 'Espresso diluted with hot water', price: 3.50 },
  { id: 'mocha', name: 'Mocha', category: 'coffee', description: 'Espresso with chocolate and steamed milk', price: 5.00 },
  { id: 'green-tea', name: 'Green Tea', category: 'tea', description: 'Classic Japanese green tea', price: 3.00 },
  { id: 'chai-latte', name: 'Chai Latte', category: 'tea', description: 'Spiced tea with steamed milk', price: 4.50 },
  { id: 'croissant', name: 'Croissant', category: 'bakery', description: 'Buttery flaky French pastry', price: 3.50 },
  { id: 'muffin', name: 'Blueberry Muffin', category: 'bakery', description: 'Fresh-baked with real blueberries', price: 3.00 },
  { id: 'scone', name: 'Cranberry Scone', category: 'bakery', description: 'Tender scone with dried cranberries', price: 3.50 },
  { id: 'orange-juice', name: 'Orange Juice', category: 'juice', description: 'Freshly squeezed oranges', price: 4.00 },
  { id: 'smoothie', name: 'Berry Smoothie', category: 'juice', description: 'Mixed berry blend with yoghurt', price: 5.50 },
];

export function getAllProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

const orders: Map<string, Order> = new Map();

export function createOrder(input: CreateOrderInput): Order {
  const id = uuidv4();
  const now = new Date().toISOString();
  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemNames = input.items.map(i => `${i.name} x${i.quantity}`);
  const domain = input.domain ?? null;
  const portalUrl = domain ? `https://${domain}` : null;
  const shellUrl = `https://tmpclaw.io/#projects?project=${id}`;
  const order: Order = {
    id,
    customerName: input.customerName,
    items: itemNames,
    orderItems: input.items,
    total,
    status: 'pending',
    domain,
    portalUrl,
    shellUrl,
    createdAt: now,
    updatedAt: now,
  };
  orders.set(id, order);
  return order;
}

export function seedOrders(): void {
  const now = new Date().toISOString();
  const samples: Array<{ customerName: string; items: string[]; orderItems: OrderItem[]; total: number; status: OrderStatus; domain: string | null; portalUrl: string | null }> = [
    { customerName: 'Alice', items: ['Latte x1', 'Croissant x1'], orderItems: [{ productId: 'latte', name: 'Latte', price: 4.50, quantity: 1 }, { productId: 'croissant', name: 'Croissant', price: 3.50, quantity: 1 }], total: 8.00, status: 'pending', domain: null, portalUrl: null },
    { customerName: 'Bob', items: ['Espresso x1'], orderItems: [{ productId: 'espresso', name: 'Espresso', price: 3.00, quantity: 1 }], total: 3.00, status: 'confirmed', domain: null, portalUrl: null },
    { customerName: 'Carol', items: ['Cappuccino x1', 'Muffin x1', 'Orange Juice x1'], orderItems: [{ productId: 'cappuccino', name: 'Cappuccino', price: 4.50, quantity: 1 }, { productId: 'muffin', name: 'Blueberry Muffin', price: 3.00, quantity: 1 }, { productId: 'orange-juice', name: 'Orange Juice', price: 4.00, quantity: 1 }], total: 11.50, status: 'delivering', domain: null, portalUrl: null },
  ];
  for (const s of samples) {
    const id = uuidv4();
    const shellUrl = `https://tmpclaw.io/#projects?project=${id}`;
    orders.set(id, { id, ...s, shellUrl, createdAt: now, updatedAt: now });
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
