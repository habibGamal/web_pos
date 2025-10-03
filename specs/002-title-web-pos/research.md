# Research: Web–POS Communication Service

**Feature**: 002-title-web-pos  
**Date**: 2025-10-02  
**Status**: Complete

## Overview
This document consolidates research findings for implementing bidirectional communication between Laravel backend and external POS system using Kafka messaging, REST callbacks, and configurable business rules.

---

## 1. Order State Management

### Decision: Extend Laravel Enum with New Statuses
**Chosen Approach**: Update `OrderStatus` enum to include: PENDING, REJECTED, PROCESSING, OUT_FOR_DELIVERY, COMPLETED, CANCELLED

**Rationale**:
- Laravel 11 supports native PHP 8.1+ enums with backing values
- Type-safe state transitions
- Database storage as string values for clarity
- GraphQL schema can directly map enum values

**Implementation**:
```php
enum OrderStatus: string {
    case PENDING = 'pending';
    case REJECTED = 'rejected';
    case PROCESSING = 'processing';
    case OUT_FOR_DELIVERY = 'out_for_delivery';
    case COMPLETED = 'completed';
    case CANCELLED = 'cancelled';
}
```

**Alternatives Considered**:
- State machine package (spatie/laravel-model-states): Adds complexity, enum sufficient for linear transitions
- String constants: Less type-safe, no IDE autocompletion

**References**:
- Laravel 11 Eloquent Enum Casting: https://laravel.com/docs/11.x/eloquent-mutators#enum-casting
- Constitution Principle VII: Use framework conventions

---

## 2. Audit Trail & History Tracking

### Decision: Separate `order_status_history` Table with Observer Pattern
**Chosen Approach**: Create dedicated table tracking every status change with Observer automatically recording transitions

**Rationale**:
- Immutable audit log (append-only)
- Captures: old_status, new_status, actor (user/system/external), reason, timestamp
- Eloquent observers handle recording without polluting business logic
- Supports NFR-008 (observability segmentation)

**Implementation**:
```php
// OrderObserver.php
public function updated(Order $order): void {
    if ($order->isDirty('status')) {
        OrderStatusHistory::create([
            'order_id' => $order->id,
            'old_status' => $order->getOriginal('status'),
            'new_status' => $order->status,
            'actor_type' => $this->determineActor(),
            'actor_id' => auth()->id(),
            'reason' => $order->status_change_reason,
            'idempotency_key' => $order->idempotency_key,
        ]);
    }
}
```

**Alternatives Considered**:
- JSON log column on orders table: Not queryable, violates audit best practices
- Laravel's built-in activity log (spatie/laravel-activitylog): Overkill, adds dependency

**References**:
- Constitution Principle II: Test-first (history entries testable via factories)
- FR-002: Record every state change attempt

---

## 3. Kafka Integration for Event Streaming

### Decision: Use Laravel Queues + rdkafka-php Extension
**Chosen Approach**: Dispatch Laravel jobs to Kafka topics using `junges/laravel-kafka` package

**Rationale**:
- Native PHP Kafka client (rdkafka) for performance
- Integrates with Laravel Queue system (retry, backoff, failed jobs)
- Supports multiple topics: `orders.created`, `orders.updated`, `products.stock.updated`
- Existing Laravel Boost infrastructure for queue management

**Implementation**:
```php
// KafkaService.php
public function publishOrderCreated(Order $order): void {
    KafkaFacade::publish()
        ->onTopic('orders.created')
        ->withBodyKey('order_id', $order->id)
        ->withMessage([
            'order_id' => $order->id,
            'status' => $order->status->value,
            'customer' => $order->customer->toArray(),
            'items' => $order->items->toArray(),
            'total' => $order->total_amount,
        ])
        ->send();
}
```

**Consumer Setup**:
```php
// Console/Commands/ConsumeStockUpdates.php
KafkaFacade::consumer(['products.stock.updated'])
    ->withHandler(new StockUpdateHandler)
    ->build()
    ->consume();
```

**Alternatives Considered**:
- Direct HTTP polling: Not real-time, inefficient
- WebSockets (Laravel Reverb): Two-way but not message queue semantics
- RabbitMQ: More complex setup, Kafka better for event sourcing

**References**:
- Laravel Queues documentation (Laravel Boost search results)
- junges/laravel-kafka: https://github.com/mateusjunges/laravel-kafka
- FR-015: Structured retry policy (Laravel Queue --tries, --backoff)

---

## 4. GraphQL API for POS Communication

### Decision: Protected GraphQL Mutations with API Key Guard
**Chosen Approach**: POS uses same GraphQL endpoint as frontend but with API key authentication guard for POS-specific mutations

**Rationale**:
- POS system uses GraphQL mutations for order updates (acceptance, rejection, status changes)
- Shared GraphQL endpoint keeps API consistent
- API key guard in Lighthouse directives protects POS-specific mutations
- Lighthouse's `@guard` directive with custom guard for POS authentication
- No separate REST endpoint needed - unified GraphQL interface

**Implementation**:
```php
// config/lighthouse.php - Add custom guard
'guards' => ['web', 'sanctum', 'pos'],

// config/auth.php - POS guard configuration
'guards' => [
    'pos' => [
        'driver' => 'pos-token',
        'provider' => null,
    ],
],

// GraphQL schema with POS guard
extend type Mutation {
    """POS system accepts order (POS Manager mode)"""
    posAcceptOrder(input: PosAcceptOrderInput!): OrderStatusResponse
        @guard(with: ["pos"])
        @field(resolver: "App\\GraphQL\\Mutations\\PosAcceptOrder")
    
    """POS system rejects order"""
    posRejectOrder(input: PosRejectOrderInput!): OrderStatusResponse
        @guard(with: ["pos"])
        @field(resolver: "App\\GraphQL\\Mutations\\PosRejectOrder")
}

input PosAcceptOrderInput {
    order_id: ID!
    pos_order_id: String!
    idempotency_key: String!
}

input PosRejectOrderInput {
    order_id: ID!
    reason_en: String!
    reason_ar: String!
    idempotency_key: String!
}
```

**Authentication Provider**:
```php
// AuthServiceProvider.php
Auth::viaRequest('pos-token', function ($request) {
    $token = $request->bearerToken();
    if ($token && hash_equals(config('pos.api_key'), $token)) {
        return new \App\Models\PosSystem(); // Pseudo-user for authorization
    }
});
```

**Alternatives Considered**:
- REST callback endpoint: Creates API inconsistency, GraphQL better
- OAuth 2.0: Overkill for single trusted client
- Sanctum tokens: Too complex for system-to-system auth

**References**:
- FR-021: Token-based authentication
- FR-022: Reject unauthenticated callbacks
- Lighthouse Guards: https://lighthouse-php.com/master/security/authorization.html#guards

---

## 5. Configuration Management

### Decision: Database Settings Table with Laravel Cache (Managed via Filament)
**Chosen Approach**: Store all configuration in `settings` table, manage via Filament admin panel, use `SettingsService` with cache layer

**Rationale**:
- Settings model already exists in application
- Admin can modify via Filament UI without code deployment
- Cache prevents database hit on every request (NFR-009)
- Type-safe getters for each setting

**Implementation**:
```php
// SettingsService.php
public function getOrderManagerType(): string {
    return Cache::remember('setting.order_manager_type', 3600, fn() =>
        Setting::where('key', 'order_manager_type')->value('value') ?? 'order_web_manager'
    );
}

public function isOrderPOSManaged(): bool {
    return $this->getOrderManagerType() === 'order_pos_manager';
}

public function getCancellableStatuses(): array {
    $value = $this->get('cancel_allowed_statuses');
    return json_decode($value, true) ?? ['pending', 'processing'];
}
```

**Cache Invalidation**:
```php
// SettingObserver.php
public function updated(Setting $setting): void {
    Cache::forget("setting.{$setting->key}");
}
```

**Alternatives Considered**:
- Config files: Requires deployment for changes
- Feature flags (Laravel Pennant): Overkill for simple toggles
- Environment variables: Not admin-configurable

**References**:
- FR-019: Configuration without redeployment
- NFR-009: Cached configuration reads

---

## 7. Dead-Letter Queue & Retry Strategy

### Decision: Laravel Failed Jobs Table + Custom Reprocess Action
**Chosen Approach**: Use Laravel's native `failed_jobs` table, add Filament resource for admin UI

**Rationale**:
- Laravel Queue handles retry automatically (--tries, --backoff)
- Failed jobs stored in database after max retries (FR-016)
- Filament resource provides admin view + manual retry action
- Meets NFR-003 (<0.5% dead-letter rate target)

**Implementation**:
```php
// Jobs/ProcessPOSCallback.php
public $tries = 3;
public $backoff = [30, 120, 600]; // 30s, 2m, 10m exponential

public function handle(): void {
    // Process callback...
}

public function failed(Throwable $exception): void {
    Log::error('POS callback permanently failed', [
        'order_id' => $this->orderId,
        'exception' => $exception->getMessage(),
    ]);
    
    // Notify admin via NotificationService
}

// Filament/Resources/FailedJobResource.php
Actions\Action::make('retry')
    ->action(fn (FailedJob $record) => 
        Artisan::call('queue:retry', ['id' => $record->uuid])
    );
```

**Alternatives Considered**:
- Custom dead_letter_queue table: Reinventing Laravel Queue
- External DLQ service (AWS SQS DLQ): Adds infrastructure dependency
- No dead-letter: Violates FR-016

**References**:
- Laravel Queue retry documentation (Laravel Boost search results)
- FR-015: Configurable retry policy
- FR-017: Administrative view of failed items

---

## 8. Stock Display Percentage Calculation

### Decision: Computed Property with Global + Per-Product Override
**Chosen Approach**: Store `pos_stock_quantity` (authoritative), calculate displayed stock at query time

**Rationale**:
- Simple calculation: `displayed = floor(pos_stock * percentage / 100)`
- Global default in settings, per-product override in products table
- No cron job needed, always accurate
- Floor() prevents fractional stock display

**Implementation**:
```php
// Product.php (Model)
protected $appends = ['displayed_stock'];

public function getDisplayedStockAttribute(): int {
    if (!$this->is_stockable || $this->stock_manager !== 'stock_pos_manager') {
        return $this->quantity; // Web-managed stock
    }
    
    $percentage = $this->pos_stock_display_percentage 
        ?? app(SettingsService::class)->get('pos_stock_display_percentage_global', 100);
    
    return (int) floor($this->pos_stock_quantity * ($percentage / 100));
}

// GraphQL products.graphql
type Product {
    id: ID!
    quantity: Int!              # Web-managed stock
    pos_stock_quantity: Int     # POS-managed (mirrored)
    displayed_stock: Int!       # Computed for display
}
```

**Alternatives Considered**:
- Store displayed_stock in database: Requires recalculation on settings change
- Calculate in frontend: Business logic leakage, inconsistent
- Show exact POS stock: Violates FR-010 (configurable reduction)

**References**:
- FR-010: Configurable global percentage
- FR-011: Per-item override
- Clarification: Round down after percentage

---

## 9. Notification System

### Decision: Laravel Notifications with Database + Email Channels
**Chosen Approach**: Use Laravel's notification system for admin alerts, existing push notification integration for users

**Rationale**:
- Laravel notifications support multiple channels (database, mail, push)
- Configurable per-event via settings
- Existing `notify_on_*` settings pattern
- Queue notifications for async delivery

**Implementation**:
```php
// Notifications/OrderTimeoutNotification.php
class OrderTimeoutNotification extends Notification {
    public function via($notifiable): array {
        if (!app(SettingsService::class)->get('notify_on_order_pending')) {
            return [];
        }
        return ['mail', 'database'];
    }
    
    public function toMail($notifiable): MailMessage {
        return (new MailMessage)
            ->subject('Order Pending Timeout')
            ->line("Order #{$this->order->id} has exceeded timeout.")
            ->action('View Order', route('admin.orders.show', $this->order));
    }
}

// Usage in ProcessOrderTimeout.php
$adminEmails = app(SettingsService::class)->get('admin_notification_emails', []);
foreach ($adminEmails as $email) {
    Notification::route('mail', $email)
        ->notify(new OrderTimeoutNotification($order));
}
```

**Alternatives Considered**:
- Manual email sending: No tracking, less structured
- Third-party service (SendGrid, Mailgun): Already using Laravel Mail
- Real-time push only: Admins need durable notifications

**References**:
- FR-025: Configurable alert thresholds
- Constitution Principle IV: Bilingual (notifications in en/ar)

---

## 10. Testing Strategy

### Decision: Three-Layer Testing (Contract, Integration, Unit)
**Chosen Approach**: 
1. **Contract tests**: Validate GraphQL schema compliance (Lighthouse validation + Pest assertions)
2. **Integration tests**: Full order lifecycle flows with Kafka mocking
3. **Unit tests**: Services, business logic in isolation

**Rationale**:
- Constitution Principle II: Test-first (NON-NEGOTIABLE)
- Contract tests ensure API stability
- Integration tests validate user scenarios from spec
- Unit tests for edge cases and error handling

**Implementation**:
```php
// tests/Contract/GraphQLOrderSchemaTest.php
it('validates order status enum matches schema', function () {
    $schema = file_get_contents(base_path('graphql/orders.graphql'));
    $enumValues = OrderStatus::cases();
    
    foreach ($enumValues as $case) {
        expect($schema)->toContain($case->value);
    }
});

// tests/Feature/OrderLifecycleTest.php
it('transitions order from pending to processing when POS accepts', function () {
    $order = Order::factory()->create(['status' => OrderStatus::PENDING]);
    
    $this->postJson('/api/pos/callback', [
        'event_type' => 'order.accepted',
        'order_id' => $order->id,
        'status' => 'processing',
        'idempotency_key' => Str::uuid(),
    ])->assertOk();
    
    expect($order->fresh()->status)->toBe(OrderStatus::PROCESSING);
});

// tests/Unit/OrderStatusServiceTest.php
it('prevents regression transitions', function () {
    $service = app(OrderStatusService::class);
    
    expect(fn() => $service->transition($order, OrderStatus::PENDING))
        ->toThrow(InvalidStatusTransitionException::class);
});
```

**Mock Strategy for Kafka**:
```php
// Use Queue fake for Kafka jobs
Queue::fake();

// Dispatch job
app(KafkaService::class)->publishOrderCreated($order);

// Assert job dispatched
Queue::assertPushed(PublishToKafka::class, function ($job) use ($order) {
    return $job->topic === 'orders.created' 
        && $job->payload['order_id'] === $order->id;
});
```

**Alternatives Considered**:
- End-to-end with real Kafka: Too slow for CI, integration tests sufficient
- Only unit tests: Misses integration failures (FR-034: functional behaviors testable)
- Manual testing: Violates constitution

**References**:
- Constitution Principle II: TDD Red-Green-Refactor
- FR-034: Automated testable scenarios
- Laravel Boost: Use `php artisan test --filter` for targeted runs

---

## 11. Performance & Observability

### Decision: Laravel Horizon for Queue Monitoring + File-based Kafka Logs
**Chosen Approach**: 
- Laravel Horizon dashboard for queue metrics, failed jobs, throughput
- Structured file logs for Kafka messages (rotation via Laravel logging)
- Database indexes on `orders.status`, `order_status_history.idempotency_key`

**Rationale**:
- Horizon provides real-time queue insights (NFR-008: segmentation by outcome)
- File logs for Kafka retain message payloads for debugging
- Indexes ensure <500ms query performance (Technical Context constraint)

**Implementation**:
```php
// config/logging.php
'kafka' => [
    'driver' => 'daily',
    'path' => storage_path('logs/kafka.log'),
    'level' => 'info',
    'days' => 14,
],

// KafkaService.php
Log::channel('kafka')->info('Order event published', [
    'topic' => 'orders.created',
    'order_id' => $order->id,
    'status' => $order->status,
    'timestamp' => now()->toIso8601String(),
]);

// Database indexes (migration)
$table->index(['status', 'created_at']);
$table->index('idempotency_key');
$table->index(['order_id', 'created_at']); // History queries
```

**Alternatives Considered**:
- Elasticsearch/Kibana: Overkill for MVP, file logs sufficient
- CloudWatch/Datadog: External dependency, Laravel logs adequate
- No observability: Violates NFR-008

**References**:
- NFR-008: Metrics segmentation by outcome
- Technical Context: <500ms response time

---

## 12. Timeout Handling

### Decision: Scheduled Job with Configurable Threshold (Email Only)
**Chosen Approach**: Artisan command scheduled every 5 minutes checking pending orders exceeding timeout, sends email notification WITHOUT auto-transition

**Rationale**:
- FR-007: Notify admins only (no automatic state change per clarification)
- Scheduled task simpler than individual timers per order
- Configurable timeout in settings (default 3600 seconds = 1 hour)

**Implementation**:
```php
// Jobs/ProcessOrderTimeout.php
public function handle(): void {
    $timeout = app(SettingsService::class)->get('pos_auto_confirm_timeout', 3600);
    
    if ($timeout === 0) {
        return; // Timeout disabled
    }
    
    $thresholdTime = now()->subSeconds($timeout);
    
    Order::where('status', OrderStatus::PENDING)
        ->where('created_at', '<=', $thresholdTime)
        ->whereNull('timeout_notified_at') // Notify once
        ->each(function (Order $order) {
            app(NotificationService::class)->notifyAdminsOrderTimeout($order);
            $order->update(['timeout_notified_at' => now()]);
        });
}

// Console/Kernel.php
$schedule->job(new ProcessOrderTimeout)->everyFiveMinutes();
```

**Alternatives Considered**:
- Auto-confirm on timeout: Rejected per clarification (email only)
- Individual delayed jobs per order: Memory inefficient for high volume
- Real-time checks: Unnecessary, 5-minute granularity acceptable

**References**:
- FR-007: Configurable timeout with admin notification
- Clarification: Late acceptance still processed (no auto-advance)

---

## Summary of Key Decisions

| Area | Decision | Rationale |
|------|----------|-----------|
| State Management | PHP 8.1 Enum | Type-safe, Laravel 11 native |
| Audit Trail | Separate table + Observer | Immutable, queryable history |
| Event Streaming | Kafka + Laravel Queues | Real-time, retry support |
| POS Callbacks | REST API + Token Auth | Simple, secure, separate from GraphQL |
| Idempotency | DB unique constraint + 7-day prune | Race-condition safe, per clarification |
| Configuration | Database settings + cache | Admin-configurable, performant |
| Dead-Letter | Laravel failed_jobs + Filament UI | Native support, admin visibility |
| Stock Display | Computed property with override | Accurate, flexible, no cron |
| Notifications | Laravel Notifications multi-channel | Structured, configurable, async |
| Testing | Contract + Integration + Unit | TDD compliance, comprehensive coverage |
| Observability | Horizon + file logs + indexes | Real-time metrics, debugging, performance |
| Timeout | Scheduled job + email | Non-invasive, clarification-compliant |

---

## Open Questions Resolved
All NEEDS CLARIFICATION items from Technical Context resolved:
- ✅ Idempotency retention: 7 days (clarification)
- ✅ Timeout behavior: Email only, no auto-transition (clarification)
- ✅ Stock rounding: Floor/round down (clarification)
- ✅ Authentication: Token-based API keys (clarification)
- ✅ Negative stock: Configurable setting (clarification)
- ✅ Manual regression: Required in internal-managed mode (clarification)

**Status**: Ready for Phase 1 (Design & Contracts)
