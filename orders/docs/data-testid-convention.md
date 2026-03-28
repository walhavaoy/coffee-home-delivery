# data-testid Naming Convention

All interactive and key UI elements in orders HTML files must include a `data-testid` attribute following a strict naming convention. This enables reliable automated testing and consistent element selection across the codebase.

## Format

```
{bundle}-{elementType}-{identifier}
```

| Segment       | Description                                                        | Examples                    |
|---------------|--------------------------------------------------------------------|-----------------------------|
| `bundle`      | One prefix per HTML file. Matches the page context.                | `shop`, `admin`             |
| `elementType` | Short, lowercase name for the element's role.                      | `btn`, `input`, `select`    |
| `identifier`  | camelCase name describing the element's purpose.                   | `placeOrder`, `statusFilter`|

### Dynamic identifiers

For elements rendered inside loops (product cards, cart rows, order rows), append a hyphen and the entity ID:

```
{bundle}-{elementType}-{noun}-{entityId}
```

Examples: `shop-btn-add-espresso`, `admin-row-order-a1b2c3d4`

## Allowed element types

| Type        | Used for                                   |
|-------------|--------------------------------------------|
| `btn`       | `<button>` or clickable span with `role`   |
| `input`     | `<input>` fields                           |
| `select`    | `<select>` dropdowns                       |
| `tab`       | Navigation tab buttons                     |
| `link`      | Clickable text that navigates or opens     |
| `badge`     | Small status/count indicators              |
| `text`      | Read-only text or labels                   |
| `heading`   | `<h1>`-`<h6>` headings                    |
| `alert`     | Error/warning banners                      |
| `view`      | Top-level page view containers             |
| `grid`      | Grid layout containers                     |
| `table`     | `<table>` elements                         |
| `row`       | `<tr>` table rows                          |
| `card`      | Card-style containers                      |
| `summary`   | Summary/aggregation sections               |
| `details`   | Detail display sections                    |
| `container` | Generic structural containers              |
| `modal`     | Modal/dialog overlays                      |
| `filter`    | Filter control groups                      |
| `icon`      | Decorative or semantic icons               |
| `value`     | Numeric/metric display elements            |

## Rules

1. **One prefix per file.** `shop.html` uses `shop-`, `admin.html` uses `admin-`.
2. **Use `btn`, not `button`.** Keep element type names short and consistent.
3. **camelCase identifiers.** Multi-word identifiers use camelCase: `placeOrder`, `cartCount`, `browseCatalogue`.
4. **Escape dynamic IDs.** When building `data-testid` in JavaScript, always pass the entity ID through `escapeHtml()` to prevent injection.
5. **No `id`-only selectors for tests.** Every testable element must have a `data-testid`. The `id` attribute is for DOM manipulation, not test selection.

## Reference: shop.html

| data-testid                        | Element           | Description                    |
|------------------------------------|-------------------|--------------------------------|
| `shop-tab-catalogue`               | button            | Catalogue nav tab              |
| `shop-tab-cart`                    | button            | Cart nav tab                   |
| `shop-btn-viewCart`                | button            | Header cart button             |
| `shop-badge-cartCount`             | span              | Cart item count badge          |
| `shop-alert-error`                 | div               | Error banner                   |
| `shop-view-catalogue`              | div               | Catalogue view container       |
| `shop-filter-category`             | div               | Category filter group          |
| `shop-grid-products`               | div               | Product grid                   |
| `shop-view-cart`                   | div               | Cart view container            |
| `shop-view-checkout`               | div               | Checkout view container        |
| `shop-input-customerName`          | input             | Customer name field            |
| `shop-summary-checkoutItems`       | div               | Checkout items summary         |
| `shop-text-checkoutTotal`          | span              | Checkout total amount          |
| `shop-btn-placeOrder`              | button            | Place order button             |
| `shop-view-confirmation`           | div               | Confirmation view container    |
| `shop-card-product-{id}`           | div (dynamic)     | Product card                   |
| `shop-btn-add-{id}`               | button (dynamic)  | Add to cart button             |
| `shop-text-cartEmpty`              | div               | Empty cart message             |
| `shop-btn-browseCatalogue`         | button            | Browse menu from empty cart    |
| `shop-table-cart`                  | table             | Cart items table               |
| `shop-row-cart-{id}`              | tr (dynamic)      | Cart item row                  |
| `shop-btn-decrement-{id}`         | button (dynamic)  | Decrease quantity              |
| `shop-btn-increment-{id}`         | button (dynamic)  | Increase quantity              |
| `shop-btn-remove-{id}`            | button (dynamic)  | Remove item from cart          |
| `shop-summary-cart`                | div               | Cart summary section           |
| `shop-btn-checkout`                | button            | Proceed to checkout            |
| `shop-icon-confirmationCheck`      | div               | Confirmation checkmark icon    |
| `shop-text-confirmationTitle`      | h2                | Confirmation heading           |
| `shop-details-confirmation`        | div               | Confirmation details section   |
| `shop-text-confirmationOrderId`    | span              | Confirmed order ID             |
| `shop-btn-continueShopping`        | button            | Continue shopping button       |

## Reference: admin.html

| data-testid                        | Element           | Description                    |
|------------------------------------|-------------------|--------------------------------|
| `admin-container-header`           | div               | Page header                    |
| `admin-heading-title`              | h1                | Page title                     |
| `admin-badge-live`                 | span              | Live status badge              |
| `admin-text-lastUpdated`           | span              | Last updated timestamp         |
| `admin-btn-refresh`                | button            | Refresh orders button          |
| `admin-alert-error`                | div               | Error banner                   |
| `admin-text-errorMessage`          | span              | Error message text             |
| `admin-container-summary`          | div               | Summary cards container        |
| `admin-value-total`                | div               | Total orders count             |
| `admin-value-pending`              | div               | Pending orders count           |
| `admin-value-preparing`            | div               | Preparing orders count         |
| `admin-value-delivering`           | div               | Delivering orders count        |
| `admin-value-delivered`            | div               | Delivered orders count         |
| `admin-value-cancelled`            | div               | Cancelled orders count         |
| `admin-container-toolbar`          | div               | Filter toolbar                 |
| `admin-select-statusFilter`        | select            | Status filter dropdown         |
| `admin-input-search`               | input             | Search input field             |
| `admin-text-orderCount`            | span              | Filtered order count text      |
| `admin-container-table`            | div               | Table wrapper                  |
| `admin-table-orders`               | table             | Orders table                   |
| `admin-container-ordersBody`       | tbody             | Table body                     |
| `admin-row-order-{id8}`           | tr (dynamic)      | Order row (first 8 chars of ID)|
| `admin-link-orderId-{id8}`        | span (dynamic)    | Clickable order ID             |
| `admin-select-status-{id8}`       | select (dynamic)  | Status change dropdown         |
| `admin-modal-detail`               | div               | Order detail modal overlay     |
| `admin-heading-modalTitle`         | span              | Modal title                    |
| `admin-container-modalBody`        | div               | Modal body content             |
| `admin-text-detailId`              | span              | Detail: order ID               |
| `admin-text-detailCustomer`        | span              | Detail: customer name          |
| `admin-text-detailItems`           | span              | Detail: items list             |
| `admin-text-detailCreated`         | span              | Detail: created timestamp      |
| `admin-text-detailUpdated`         | span              | Detail: updated timestamp      |
