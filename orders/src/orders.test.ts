import request from 'supertest';
import { createApp } from './index';
import { seedOrders, getAllOrders } from './store';

describe('Orders API', () => {
  beforeAll(() => {
    seedOrders();
  });

  const app = createApp();

  describe('GET /api/orders', () => {
    it('returns a list of orders', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('orders');
      expect(Array.isArray(res.body.orders)).toBe(true);
      expect(res.body.orders.length).toBeGreaterThan(0);
    });

    it('each order has required fields', async () => {
      const res = await request(app).get('/api/orders');
      for (const order of res.body.orders) {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('customerName');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('createdAt');
        expect(order).toHaveProperty('updatedAt');
      }
    });
  });

  describe('PATCH /api/orders/:id', () => {
    it('updates order status', async () => {
      const orders = getAllOrders();
      const target = orders[0];
      const res = await request(app)
        .patch(`/api/orders/${target.id}`)
        .send({ status: 'confirmed' });
      expect(res.status).toBe(200);
      expect(res.body.order.status).toBe('confirmed');
    });

    it('returns 400 for missing status', async () => {
      const orders = getAllOrders();
      const res = await request(app)
        .patch(`/api/orders/${orders[0].id}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('returns 400 for invalid status', async () => {
      const orders = getAllOrders();
      const res = await request(app)
        .patch(`/api/orders/${orders[0].id}`)
        .send({ status: 'bogus' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app)
        .patch('/api/orders/nonexistent-id')
        .send({ status: 'confirmed' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /admin', () => {
    it('serves the admin HTML page', async () => {
      const res = await request(app).get('/admin');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });
  });
});
