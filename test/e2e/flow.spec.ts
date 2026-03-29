import { test, expect } from '@playwright/test';

test('full E2E flow: catalogue → cart → checkout → confirmation → admin status update', async ({ page }) => {
  // 1. Navigate to shop
  await page.goto('/');

  // 2. Verify product cards load
  const productGrid = page.locator('[data-testid="shop-grid-products"]');
  await expect(productGrid).toBeVisible();
  const productCards = productGrid.locator('.product-card');
  await expect(productCards.first()).toBeVisible();
  const cardCount = await productCards.count();
  expect(cardCount).toBeGreaterThan(0);

  // 3. Add 2 items to cart (Latte + Espresso)
  await page.locator('[data-testid="shop-btn-add-latte"]').click();
  await page.locator('[data-testid="shop-btn-add-espresso"]').click();
  await expect(page.locator('[data-testid="shop-badge-cartCount"]')).toHaveText('2');

  // 4. Navigate to cart
  await page.locator('[data-testid="shop-tab-cart"]').click();
  await expect(page.locator('[data-testid="shop-view-cart"]')).toBeVisible();

  // 5. Verify cart items and total
  const cartTable = page.locator('[data-testid="shop-table-cart"]');
  await expect(cartTable).toBeVisible();
  await expect(page.locator('[data-testid="shop-row-cart-latte"]')).toBeVisible();
  await expect(page.locator('[data-testid="shop-row-cart-espresso"]')).toBeVisible();

  // 6. Proceed to checkout
  await page.locator('[data-testid="shop-btn-checkout"]').click();
  await expect(page.locator('[data-testid="shop-view-checkout"]')).toBeVisible();

  // 7. Fill checkout form (only customerName — no address field exists)
  await page.locator('[data-testid="shop-input-customerName"]').fill('E2E Test User');

  // 8. Submit order
  await page.locator('[data-testid="shop-btn-placeOrder"]').click();
  await expect(page.locator('[data-testid="shop-view-confirmation"]')).toBeVisible();

  // 9. Verify confirmation
  await expect(page.locator('[data-testid="shop-text-confirmationTitle"]')).toContainText('Order Confirmed');
  const orderIdEl = page.locator('[data-testid="shop-text-confirmationOrderId"]');
  await expect(orderIdEl).not.toBeEmpty();

  // 10. Capture order ID
  const orderId = (await orderIdEl.textContent()) ?? '';
  expect(orderId.length).toBeGreaterThan(0);

  // 11. Navigate to admin
  await page.goto('/admin');
  await expect(page.locator('[data-testid="admin-table-orders"]')).toBeVisible();

  // 12. Find order row by truncated ID (first 8 chars)
  const shortId = orderId.slice(0, 8);
  const orderRow = page.locator(`[data-testid="admin-row-order-${shortId}"]`);
  await expect(orderRow).toBeVisible();

  // 13. Change status to "preparing"
  const statusSelect = page.locator(`[data-testid="admin-select-status-${shortId}"]`);
  await statusSelect.selectOption('preparing');

  // 14. Verify status updated to preparing
  await expect(statusSelect).toHaveValue('preparing');
  // Wait for the table to reload after PATCH
  await expect(page.locator('[data-testid="admin-alert-error"]')).not.toBeVisible();

  // 15. Change status to "delivered"
  await statusSelect.selectOption('delivered');
  await expect(statusSelect).toHaveValue('delivered');

  // 16. Verify summary cards reflect the change
  const deliveredCount = page.locator('[data-testid="admin-value-delivered"]');
  await expect(deliveredCount).not.toHaveText('0');
});
