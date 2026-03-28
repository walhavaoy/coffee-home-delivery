import express from 'express';
import path from 'path';
import pino from 'pino';
import { getAllOrders, getOrderById, updateOrderStatus, isValidStatus, seedOrders } from './store';

const logger = pino({ name: 'orders' });

export function createApp(): express.Application {
  const app = express();
  app.use(express.json());

  // GET /api/orders — list all orders
  app.get('/api/orders', (_req, res) => {
    const orders = getAllOrders();
    res.json({ orders });
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
