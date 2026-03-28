import express from 'express';
import path from 'path';
import pino from 'pino';
import {
  getAllOrders, getOrderById, updateOrderStatus, isValidStatus, seedOrders,
  getAllProducts, getProductById, createOrder,
} from './store';
import type { CreateOrderInput, OrderItem } from './store';

const logger = pino({ name: 'orders' });

function isValidOrderItem(item: unknown): item is OrderItem {
  if (typeof item !== 'object' || item === null) return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj['productId'] === 'string' &&
    typeof obj['name'] === 'string' &&
    typeof obj['price'] === 'number' && obj['price'] > 0 &&
    typeof obj['quantity'] === 'number' && Number.isInteger(obj['quantity']) && obj['quantity'] > 0
  );
}

export function createApp(): express.Application {
  const app = express();
  app.use(express.json());

  // GET /api/products — list all products
  app.get('/api/products', (_req, res) => {
    const products = getAllProducts();
    res.json({ products });
  });

  // GET /api/products/:id — single product
  app.get('/api/products/:id', (req, res) => {
    const product = getProductById(req.params['id']);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ product });
  });

  // GET /api/orders — list all orders
  app.get('/api/orders', (_req, res) => {
    const orders = getAllOrders();
    res.json({ orders });
  });

  // GET /api/orders/:id — single order
  app.get('/api/orders/:id', (req, res) => {
    const order = getOrderById(req.params['id']);
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.json({ order });
  });

  // POST /api/orders — create a new order
  app.post('/api/orders', (req, res) => {
    const body = req.body as Record<string, unknown>;
    const customerName = body['customerName'];
    const items = body['items'];

    if (typeof customerName !== 'string' || customerName.trim().length === 0) {
      res.status(400).json({ error: 'Missing or empty "customerName"' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Missing or empty "items" array' });
      return;
    }

    for (const item of items) {
      if (!isValidOrderItem(item)) {
        res.status(400).json({ error: 'Each item must have productId, name, price (>0), and quantity (integer >0)' });
        return;
      }
      const product = getProductById((item as OrderItem).productId);
      if (!product) {
        res.status(400).json({ error: `Unknown product: ${String((item as OrderItem).productId)}` });
        return;
      }
    }

    const domain = typeof body['domain'] === 'string' && body['domain'].trim().length > 0
      ? body['domain'].trim()
      : undefined;

    const input: CreateOrderInput = {
      customerName: customerName.trim(),
      items: items as OrderItem[],
      domain,
    };

    const order = createOrder(input);
    logger.info({ orderId: order.id, customerName: order.customerName }, 'Order created');
    res.status(201).json({ order });
  });

  // PATCH /api/orders/:id — update order status
  app.patch('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status?: unknown };

    if (!status) {
      res.status(400).json({ error: 'Missing "status" in request body' });
      return;
    }

    if (!isValidStatus(status)) {
      res.status(400).json({ error: `Invalid status: ${String(status)}` });
      return;
    }

    const existing = getOrderById(id);
    if (!existing) {
      res.status(404).json({ error: `Order not found: ${id}` });
      return;
    }

    const updated = updateOrderStatus(id, status);
    res.json({ order: updated });
  });

  // GET / — serve customer shop page
  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'shop.html'));
  });

  // GET /admin — serve static admin page
  app.get('/admin', (_req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
  });

  return app;
}

if (require.main === module) {
  const port = parseInt(process.env['PORT'] ?? '3000', 10);
  seedOrders();
  const app = createApp();
  app.listen(port, () => {
    logger.info({ port }, 'Orders service started');
  });
}
