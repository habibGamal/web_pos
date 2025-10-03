# Testing Notes

This document contains common testing patterns and solutions encountered during test fixes.

## GraphQL Schema Issues

### Missing Localized Field Variations
**Problem**: Tests fail because schema only exposes `@localized` fields like `name` but tests need access to both `name_en` and `name_ar`.

**Solution**: Add explicit language-specific fields alongside the localized field in the GraphQL schema:

```graphql
type Attribute {
    "Attribute name in current locale"
    name: String! @localized
    
    "Attribute name in English"
    name_en: String!
    
    "Attribute name in Arabic"
    name_ar: String!
    ...
}
```

**Note**: After schema changes, always run `php artisan lighthouse:clear-cache`.

### Product Variant Creation in Tests
**Problem**: Tests fail when creating variants because `product_id` doesn't exist - should use `parent_id`.

**Solution**: Use the factory's `variant($parent)` method correctly:

```php
// ❌ Wrong - don't override parent_id
$variant = Product::factory()->variant()->create(['parent_id' => $product->id]);

// ✅ Correct - pass parent as parameter
$variant = Product::factory()->variant($product)->create();
```

**Also**: Ensure parent product is `configurable()` type to have variants:

```php
$product = Product::factory()->configurable()->create();
$variant = Product::factory()->variant($product)->create();
```

**Common Places This Occurs**:
- Test `beforeEach()` setup blocks
- Individual test cases creating variants
- Look for patterns like `Product::factory()->variant()->create(['product_id' => ...])` and fix them

### Cart Items Use product_id Only
**Problem**: Tests incorrectly used `product_variant_id` field in cart operations.

**Root Cause**:
- Database: `cart_items` table has `product_id` column only
- GraphQL schema: `AddToCartInput` uses `product_id` field
- Cart items reference products directly (including variants) via `product_id`
- No separate `variant` field needed

**Solution**:
```php
// ❌ Wrong - using product_variant_id
CartItem::factory()->create([
    'product_variant_id' => $variant->id,
]);

// ✅ Correct - using product_id
CartItem::factory()->create([
    'product_id' => $variant->id,
]);

// ✅ Mutation input
'input' => [
    'product_id' => (string) $variant->id,
    'quantity' => 1,
]
```

### Missing GraphQL Field Resolvers
**Problem**: Test queries field that doesn't exist in schema (e.g., `grouped_attributes`).

**Solution**: 
1. Add field to GraphQL schema with resolver:
```graphql
type ProductVariant {
    grouped_attributes: [GroupedAttribute!]! @field(resolver: "App\\GraphQL\\Types\\ProductVariantType@groupedAttributes")
}
```

2. Implement resolver method in the Type class:
```php
public function groupedAttributes(Product $variant): array
{
    return $variant->attributeValues()
        ->with('attribute')
        ->get()
        ->groupBy('attribute_id')
        ->map(function ($values) {
            return [
                'attribute' => $values->first()->attribute,
                'values' => $values->pluck('display_value')->toArray(),
            ];
        })
        ->values()
        ->toArray();
}
```

## Broadcasting & Pusher Issues

### Problem
Tests fail with Pusher connection errors:
```
Pusher error: cURL error 7: Failed to connect to localhost port 8095
BroadcastException
```

### Solution
Set broadcast driver to `null` in test setup to prevent external connections:

```php
beforeEach(function () {
    // Set broadcast driver to null to prevent Pusher connection errors during testing
    config(['broadcasting.default' => 'null']);
    
    // ... rest of setup
});
```

**Note**: Don't use `Broadcast::fake()` - this method doesn't exist. Use config override instead.

## GraphQL Testing

### Missing GraphQL Helper Methods
If tests fail with "Call to undefined method graphQL()", add the GraphQL test helper trait:

```php
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);
```

### Authentication Error Assertions
Don't use `assertGraphQLError()` with strings. Use `assertJson()` instead:

```php
// ❌ Wrong
$response->assertGraphQLError('Unauthenticated.');

// ✅ Correct
$response->assertJson([
    'errors' => [
        [
            'message' => 'Unauthenticated.',
        ],
    ],
]);
```

### Testing Unauthenticated Requests
To test unauthenticated GraphQL requests:

```php
it('requires authentication', function () {
    auth()->logout()
    $response = $this->graphQL('...');
    
    $response->assertJson([
        'errors' => [
            ['message' => 'Unauthenticated.'],
        ],
    ]);
});
```

**Note**: use `auth()->logout()` note `$this->actingAs(null)` this cause errors.

## Laravel Notifications

### Database Notification Data Access
Laravel's `DatabaseNotification->data` is already an array, not JSON:

```php
// ❌ Wrong
$data = json_decode($dbNotification->data, true);

// ✅ Correct
$data = $dbNotification->data; // data is already an array in Laravel
```

### Notification Order in Tests
When testing read/unread notifications, be careful about creation order:

```php
// Create notifications in the order you expect them
$this->user->notify(new GeneralNotification('Read', '...', 'info'));
$this->user->notify(new GeneralNotification('Unread', '...', 'info'));

// Mark the first (oldest) notification as read
$readNotification = $this->user->notifications()->oldest()->first();
$readNotification->markAsRead();
```

## Common Test Patterns

### Test Setup for Notification Tests
```php
uses(RefreshDatabase::class, GraphQLTestHelpers::class);

beforeEach(function () {
    // Set broadcast driver to null to prevent Pusher connection errors during testing
    config(['broadcasting.default' => 'null']);
    
    $this->user = User::factory()->create();
    $this->actingAs($this->user, 'sanctum');
});
```

## DateTime Scalar Issues (Previously Fixed)

For reference, GraphQL DateTime scalar issues were fixed by updating the schema to use `DateTimeUtc`:

```graphql
# Updated from DateTime to DateTimeUtc scalar
scalar DateTime @scalar(class: "Nuwave\\Lighthouse\\Schema\\Types\\Scalars\\DateTimeUtc")
```

This allows proper serialization of Laravel's timestamp format with microseconds.
