import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderPayload {
  customerName: string;
  items: OrderItem[];
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  order: Order;
}

async function seedOrder(request: APIRequestContext, payload: OrderPayload): Promise<Order> {
  const response = await request.post('/api/orders', { data: payload });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as OrderResponse;
  return body.order;
}

test.describe('Admin order management', () => {
  const seedPayloads: OrderPayload[] = [
    {
      customerName: 'Alice Admin',
      items: [
        { productId: 'espresso', name: 'Espresso', price: 3.00, quantity: 2 },
        { productId: 'croissant', name: 'Croissant', price: 3.50, quantity: 1 },
      ],
    },
    {
      customerName: 'Bob Builder',
      items: [
        { productId: 'latte', name: 'Latte', price: 4.50, quantity: 1 },
        { productId: 'muffin', name: 'Muffin', price: 3.00, quantity: 2 },
      ],
    },
    {
      customerName: 'Charlie Chef',
      items: [
        { productId: 'mocha', name: 'Mocha', price: 5.00, quantity: 1 },
      ],
    },
  ];

  let seededOrders: Order[] = [];

  test.beforeAll(async ({ request }) => {
    seededOrders = [];
    for (const payload of seedPayloads) {
      const order = await seedOrder(request, payload);
      seededOrders.push(order);
    }
  });

  test('admin page loads and displays seeded orders', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-table-orders"]')).toBeVisible();

    // Verify each seeded order appears in the table
    for (const order of seededOrders) {
      const shortId = order.id.slice(0, 8);
      await expect(page.locator(`[data-testid="admin-row-order-${shortId}"]`)).toBeVisible();
    }
  });

  test('summary cards show correct counts', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-container-summary"]')).toBeVisible();

    // All seeded orders start as pending
    const totalEl = page.locator('[data-testid="admin-value-total"]');
    await expect(totalEl).toBeVisible();
    const totalText = await totalEl.textContent();
    const totalCount = parseInt(totalText ?? '0', 10);
    expect(totalCount).toBeGreaterThanOrEqual(seededOrders.length);
  });

  test('status filter works', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-table-orders"]')).toBeVisible();

    // Filter to "pending" — seeded orders should remain visible
    await page.locator('[data-testid="admin-select-statusFilter"]').selectOption('pending');
    for (const order of seededOrders) {
      const shortId = order.id.slice(0, 8);
      await expect(page.locator(`[data-testid="admin-row-order-${shortId}"]`)).toBeVisible();
    }

    // Filter to "delivered" — seeded orders (still pending) should not appear
    await page.locator('[data-testid="admin-select-statusFilter"]').selectOption('delivered');
    for (const order of seededOrders) {
      const shortId = order.id.slice(0, 8);
      await expect(page.locator(`[data-testid="admin-row-order-${shortId}"]`)).not.toBeVisible();
    }

    // Reset filter to "All" (value is empty string)
    await page.locator('[data-testid="admin-select-statusFilter"]').selectOption('');
  });

  test('status dropdown updates order via PATCH', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-table-orders"]')).toBeVisible();

    const targetOrder = seededOrders[0];
    const shortId = targetOrder.id.slice(0, 8);
    const statusSelect = page.locator(`[data-testid="admin-select-status-${shortId}"]`);

    // Change status to "confirmed"
    await statusSelect.selectOption('confirmed');
    await expect(statusSelect).toHaveValue('confirmed');
    await expect(page.locator('[data-testid="admin-alert-error"]')).not.toBeVisible();

    // Change status to "preparing"
    await statusSelect.selectOption('preparing');
    await expect(statusSelect).toHaveValue('preparing');
  });

  test('search filters by customer name', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-table-orders"]')).toBeVisible();

    const searchInput = page.locator('[data-testid="admin-input-search"]');

    // Search for "Alice"
    await searchInput.fill('Alice');

    const aliceShortId = seededOrders[0].id.slice(0, 8);
    const bobShortId = seededOrders[1].id.slice(0, 8);

    await expect(page.locator(`[data-testid="admin-row-order-${aliceShortId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="admin-row-order-${bobShortId}"]`)).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page.locator(`[data-testid="admin-row-order-${bobShortId}"]`)).toBeVisible();
  });

  test('search filters by order ID', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-testid="admin-table-orders"]')).toBeVisible();

    const searchInput = page.locator('[data-testid="admin-input-search"]');
    const targetOrder = seededOrders[2];
    const shortId = targetOrder.id.slice(0, 8);

    // Search by partial order ID
    await searchInput.fill(shortId);
    await expect(page.locator(`[data-testid="admin-row-order-${shortId}"]`)).toBeVisible();
  });
});
