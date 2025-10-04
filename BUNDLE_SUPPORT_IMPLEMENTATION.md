# Bundle Product Support Implementation

## Overview
Updated the cart items and order items tables to support Bundle products with nested children structure.

## Database Changes

### Cart Items Table (`cart_items`)
Added the following column:
- `parent_id` (bigint unsigned, nullable): Self-referencing foreign key to `cart_items.id`
  - For bundle parent items: `parent_id` is NULL
  - For bundle child items: `parent_id` references the parent bundle cart item ID

**Indexes Added:**
- `['cart_id', 'parent_id']` - Composite index for efficient queries
- `parent_id` - Individual index for parent lookups

**Structure:**
- Parent cart item: Represents the bundle product itself
  - `product_id`: Points to the bundle product (type=BUNDLE)
  - `parent_id`: NULL
- Child cart items: Represent the selected products within the bundle
  - `product_id`: Points to the chosen variant or simple product
  - `parent_id`: Points to the parent bundle cart item

### Order Items Table (`order_items`)
Added the following column:
- `parent_id` (bigint unsigned, nullable): Self-referencing foreign key to `order_items.id`
  - For bundle parent items: `parent_id` is NULL
  - For bundle child items: `parent_id` references the parent bundle order item ID

**Indexes Added:**
- `['order_id', 'parent_id']` - Composite index for efficient queries
- `parent_id` - Individual index for parent lookups

**Structure:**
- Parent order item: Represents the bundle product itself
  - `product_id`: Points to the bundle product (type=BUNDLE)
  - `parent_id`: NULL
- Child order items: Represent the selected products within the bundle
  - `product_id`: Points to the chosen variant or simple product
  - `parent_id`: Points to the parent bundle order item

## Model Changes

### CartItem Model
**Added to fillable:**
- `parent_id`

**New Relationships:**
```php
// Get the parent cart item (for bundle child items)
public function parent(): BelongsTo

// Get the child cart items (for bundle parent items)
public function children(): HasMany
```

### OrderItem Model
**Added to fillable:**
- `parent_id`

**New Relationships:**
```php
// Get the parent order item (for bundle child items)
public function parent(): BelongsTo

// Get the child order items (for bundle parent items)
public function children(): HasMany
```

## Usage Examples

### Cart Items Structure for Bundle
```
Bundle Product (parent_id = NULL)
├── Variant 1 (parent_id = 1)
├── Variant 2 (parent_id = 1)
└── Simple Product (parent_id = 1)
```

### Database Example
```
cart_items:
id | cart_id | product_id | parent_id | quantity
1  | 10      | 100        | NULL      | 1         (Bundle)
2  | 10      | 101        | 1         | 2         (Child: Variant of Configurable)
3  | 10      | 102        | 1         | 1         (Child: Simple Product)
```

### Order Items Structure for Bundle
```
Bundle Product (parent_id = NULL)
├── Variant 1 (parent_id = 1) - with unit_price, subtotal
├── Variant 2 (parent_id = 1) - with unit_price, subtotal
└── Simple Product (parent_id = 1) - with unit_price, subtotal
```

## Benefits

1. **Flexibility**: Supports bundles containing both simple products and configurable products (via their variants)
2. **Traceability**: Maintains clear parent-child relationships for bundle components
3. **Consistency**: Same structure for both cart and orders
4. **Performance**: Indexed foreign keys for efficient queries
5. **Data Integrity**: Cascade deletes ensure child items are removed when parent is deleted

## Migration Files Updated

1. `2025_04_09_000003_create_cart_items_table.php`
   - Added `parent_id` column with foreign key constraint
   - Added composite and individual indexes
   - Removed unique constraint on `[cart_id, product_id]` (no longer applicable with bundles)

2. `2025_05_01_000006_create_order_items_table.php`
   - Added `parent_id` column with foreign key constraint
   - Added composite and individual indexes

3. `2025_10_01_231252_drop_unique_cart_item_constraint_from_cart_items.php`
   - Updated to handle case where constraint may not exist

## Additional Fixes

- Fixed `OrderSeeder.php` to use correct enum values:
  - Changed `OrderStatus::DELIVERED` → `OrderStatus::COMPLETED`
  - Changed `OrderStatus::SHIPPED` → `OrderStatus::OUT_FOR_DELIVERY`

## Next Steps

To use this structure in your application:

1. **CartService**: Update `add()` method to create parent and child cart items for bundles
2. **OrderService**: Update order placement to preserve bundle structure
3. **Bundle Display**: Query cart/order items with children relationship loaded
4. **Pricing Logic**: Calculate bundle pricing from child items or use bundle product price
5. **Stock Management**: Consider stock validation for bundle child products

## Query Examples

### Get Cart with Bundle Structure
```php
$cart = Cart::with(['items.children.product', 'items.product'])
    ->find($cartId);
```

### Get Order with Bundle Structure
```php
$order = Order::with(['items.children.product', 'items.product'])
    ->find($orderId);
```

### Get Only Parent Items (Bundle Products)
```php
$parentItems = $cart->items()->whereNull('parent_id')->get();
```

### Get Bundle Children for a Specific Parent
```php
$children = $cart->items()->where('parent_id', $parentItemId)->get();
```
