import request from 'supertest';
import { createApp } from './index';
import { seedOrders, getAllOrders, getAllProducts } from './store';

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

  describe('GET /api/products', () => {
    it('returns a list of products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });

    it('each product has required fields', async () => {
      const res = await request(app).get('/api/products');
      for (const product of res.body.products) {
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('description');
        expect(product).toHaveProperty('price');
        expect(typeof product.price).toBe('number');
      }
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns a single product', async () => {
      const products = getAllProducts();
      const res = await request(app).get(`/api/products/${products[0].id}`);
      expect(res.status).toBe(200);
      expect(res.body.product.id).toBe(products[0].id);
    });

    it('returns 404 for non-existent product', async () => {
      const res = await request(app).get('/api/products/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/orders/:id', () => {
    it('returns a single order', async () => {
      const orders = getAllOrders();
      const res = await request(app).get(`/api/orders/${orders[0].id}`);
      expect(res.status).toBe(200);
      expect(res.body.order.id).toBe(orders[0].id);
    });

    it('returns 404 for non-existent order', async () => {
      const res = await request(app).get('/api/orders/nonexistent');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/orders', () => {
    it('creates a new order', async () => {
      const products = getAllProducts();
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerName: 'Test User',
          items: [
            { productId: products[0].id, name: products[0].name, price: products[0].price, quantity: 2 },
          ],
        });
      expect(res.status).toBe(201);
      expect(res.body.order).toHaveProperty('id');
      expect(res.body.order.customerName).toBe('Test User');
      expect(res.body.order.status).toBe('pending');
      expect(res.body.order.total).toBe(products[0].price * 2);
    });

    it('returns 400 for missing customerName', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: 'latte', name: 'Latte', price: 4.5, quantity: 1 }] });
      expect(res.status).toBe(400);
    });

    it('returns 400 for empty items', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customerName: 'Test', items: [] });
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid item', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customerName: 'Test', items: [{ productId: 'latte' }] });
      expect(res.status).toBe(400);
    });

    it('returns 400 for unknown product', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customerName: 'Test', items: [{ productId: 'nonexistent', name: 'X', price: 1, quantity: 1 }] });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin', () => {
    it('serves the admin HTML page', async () => {
      const res = await request(app).get('/admin');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });
  });

  describe('GET /', () => {
    it('serves the shop HTML page', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/html/);
    });
  });
});
