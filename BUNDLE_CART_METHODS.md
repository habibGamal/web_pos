# Bundle Cart Methods Implementation

## Overview
Added three new methods to `CartService` to handle bundle products in the cart, including adding bundles with variant selection, updating variant choices, and removing bundles.

---

## Methods Added

### 1. `addBundle()`

Adds a bundle product to the cart with selected variants for configurable products.

**Signature:**
```php
public function addBundle(
    User $user, 
    Product $bundle, 
    array $selectedVariants = [], 
    float $quantity = 1, 
    array $options = []
): void
```

**Parameters:**
- `$user`: The user adding the bundle
- `$bundle`: The bundle product (must be of type BUNDLE)
- `$selectedVariants`: Array mapping configurable product IDs to selected variant IDs
  - Format: `['product_id' => 'variant_id']`
- `$quantity`: Quantity of the bundle (default: 1)
- `$options`: Additional options for the bundle (default: [])

**Example Usage:**
```php
use App\Models\Product;
use App\Models\User;
use App\Services\Cart\CartService;

$cartService = app(CartService::class);
$user = User::find(1);
$bundle = Product::find(100); // Bundle product

// Bundle A contains:
// - 1x Product B (simple product, ID: 101)
// - 1x Product C (configurable product, ID: 102 with variants C1: 201, C2: 202)

$selectedVariants = [
    102 => 201, // Selected variant C1 for configurable product C
];

$cartService->addBundle($user, $bundle, $selectedVariants, quantity: 1);
```

**Cart Structure Created:**
```
cart_items:
id | cart_id | product_id | parent_id | quantity
1  | 10      | 100        | NULL      | 1         (Bundle A)
2  | 10      | 101        | 1         | 1         (Simple Product B)
3  | 10      | 201        | 1         | 1         (Variant C1 of Product C)
```

**Validations Performed:**
- Bundle product exists and is active
- Bundle product type is BUNDLE
- Quantity is greater than 0
- Bundle has items
- All products in bundle are active
- For configurable products: variant is selected, valid, and active
- Stock is available for all selected products/variants
- Calculates required quantity as: `bundle_item.quantity * bundle.quantity`

**Features:**
- Uses database transaction for atomicity
- Creates parent cart item for the bundle
- Creates child cart items for each selected product/variant
- Automatic cascade delete (when parent is deleted, children are deleted)

---

### 2. `updateBundle()`

Updates an existing bundle in the cart by changing the selected variants.

**Signature:**
```php
public function updateBundle(
    User $user, 
    int $parentCartItemId, 
    array $selectedVariants
): void
```

**Parameters:**
- `$user`: The user updating the bundle
- `$parentCartItemId`: The parent cart item ID (the bundle cart item)
- `$selectedVariants`: New array of selected variants/products
  - Format: `['product_id' => 'variant_id']`

**Example Usage:**
```php
// User wants to change variant selection in existing bundle
$cartService->updateBundle($user, parentCartItemId: 1, selectedVariants: [
    102 => 202, // Changed from C1 (201) to C2 (202)
]);
```

**What Happens:**
1. Validates the parent cart item exists and is a bundle
2. Validates the bundle is still active
3. Validates all new variant selections
4. Validates stock availability for new selections
5. Deletes old child cart items
6. Creates new child cart items with updated selections
7. Preserves parent cart item quantity

**Validations Performed:**
- Parent cart item exists and belongs to user
- Parent cart item is a bundle (parent_id is NULL)
- Bundle product is still active
- All products in bundle are still active
- New variant selections are valid and active
- Stock is available for all new selections

**Features:**
- Uses database transaction for atomicity
- Maintains parent cart item and its quantity
- Only updates the child items (selected products/variants)
- Re-validates everything to ensure data integrity

---

### 3. `removeBundle()`

Removes a bundle and all its child items from the cart.

**Signature:**
```php
public function removeBundle(User $user, int $parentCartItemId): void
```

**Parameters:**
- `$user`: The user
- `$parentCartItemId`: The parent cart item ID (the bundle)

**Example Usage:**
```php
$cartService->removeBundle($user, parentCartItemId: 1);
```

**What Happens:**
- Validates parent cart item exists and belongs to user
- Deletes parent cart item
- Child items are automatically deleted via cascade foreign key constraint

---

## Data Structure

### Bundle in Cart
```
Parent Item (Bundle):
├── product_id: Bundle product ID
├── parent_id: NULL
├── quantity: Number of bundles
└── options: Additional bundle options

Child Items (Components):
├── product_id: Selected variant ID or simple product ID
├── parent_id: Parent cart item ID
├── quantity: Quantity per bundle (from bundle_items.quantity)
└── options: Empty array (component-specific options if needed)
```

### Example Scenario

**Bundle Definition:**
```
Bundle "Gaming Setup" (ID: 500)
├── 1x Gaming Mouse (Simple, ID: 101)
├── 1x Gaming Keyboard (Configurable, ID: 102)
│   ├── RGB Variant (ID: 201)
│   └── Mechanical Variant (ID: 202)
└── 2x Monitor (Simple, ID: 103)
```

**Adding Bundle to Cart:**
```php
$selectedVariants = [
    102 => 201, // RGB Keyboard variant
];

$cartService->addBundle($user, $gamingBundle, $selectedVariants, quantity: 2);
```

**Resulting Cart Items:**
```
id | cart_id | product_id | parent_id | quantity | product_name
1  | 10      | 500        | NULL      | 2        | Gaming Setup (Bundle)
2  | 10      | 101        | 1         | 1        | Gaming Mouse
3  | 10      | 201        | 1         | 1        | RGB Keyboard (Variant)
4  | 10      | 103        | 1         | 2        | Monitor
```

**Stock Validation:**
- Gaming Mouse: 1 * 2 = 2 units required
- RGB Keyboard: 1 * 2 = 2 units required  
- Monitor: 2 * 2 = 4 units required

---

## Error Handling

All methods throw exceptions with descriptive messages:

### Common Exceptions:
- `\InvalidArgumentException`: Invalid input (inactive products, wrong type, missing selections)
- `\RuntimeException`: Business rule violations (insufficient stock)

### Example Error Messages:
```php
// Bundle validation
"Bundle not found or inactive"
"Product is not a bundle"
"Bundle has no items"

// Component validation
"Product {name} in bundle is inactive"
"Variant must be selected for configurable product: {name}"
"Invalid or inactive variant selected for: {name}"

// Stock validation
"Insufficient stock for variant: {name}"
"Insufficient stock for product: {name}"

// Update/Remove validation
"Bundle cart item not found"
"Cart item is not a bundle"
"Bundle is no longer active"
```

---

## Transaction Safety

All write operations use database transactions:
```php
\DB::transaction(function () {
    // Multiple database operations here
    // All committed together or rolled back on error
});
```

This ensures:
- Atomicity: All changes happen together or none at all
- Consistency: No partial bundle additions/updates
- Isolation: No interference from concurrent requests
- Durability: Changes are persisted correctly

---

## Stock Validation Logic

Stock is validated for:
1. **Simple Products**: Direct quantity check
2. **Configurable Products**: Check on selected variant

**Calculation:**
```php
$requiredQuantity = $bundleItem->quantity * $parentItem->quantity;
```

**Example:**
- Bundle quantity: 3
- Component quantity in bundle: 2
- Required stock: 2 * 3 = 6 units

---

## Integration with Existing Methods

These bundle methods work alongside existing cart methods:

### Compatible Methods:
- `getCart()`: Returns cart with all items including bundles
- `clear()`: Clears entire cart including bundles
- `validateCartItems()`: Should be extended to validate bundle children

### Methods to Avoid for Bundles:
- `add()`: Use `addBundle()` instead for bundle products
- `remove()`: Use `removeBundle()` for bundles (to ensure children are handled)
- `increment()/decrement()`: Should only be used on parent items, not children
- `updateQuantity()`: Can be used on parent items, but children quantities are fixed by bundle definition

---

## Best Practices

1. **Always use `addBundle()` for bundles**: Don't use the regular `add()` method
2. **Update variants with `updateBundle()`**: Don't manually manipulate child items
3. **Remove bundles with `removeBundle()`**: Ensures proper cleanup
4. **Query with relationships**: Always load `children` when displaying bundles
5. **Validate before checkout**: Check bundle integrity and stock before order placement

---

## Query Examples

### Get Cart with Bundles:
```php
$cart = Cart::with([
    'items' => function ($query) {
        $query->whereNull('parent_id'); // Only parent items
    },
    'items.children.product', // Bundle children
    'items.product' // Parent products
])->find($cartId);
```

### Check if Cart Item is Bundle:
```php
$isBundleItem = $cartItem->parent_id === null 
    && $cartItem->product->type === ProductType::BUNDLE;
```

### Get Bundle Total Items:
```php
$totalItems = $parentCartItem->children()->count();
```

---

## Future Enhancements

Consider adding:
1. Bundle-specific validation in `validateCartItems()`
2. Method to update bundle quantity (updates parent and recalculates children)
3. Method to get bundle price calculation
4. Support for bundle-level options/customization
5. Partial bundle updates (change only specific components)
6. Bundle inventory validation method
7. Bundle cloning/duplication method
