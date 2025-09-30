# Testing Notes

This document contains common testing patterns and solutions encountered during test fixes.

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
