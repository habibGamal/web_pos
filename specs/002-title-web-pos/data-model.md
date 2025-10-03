# Data Model: Web–POS Communication Service

**Feature**: 002-title-web-pos  
**Date**: 2025-10-02  
**Status**: Complete

## Overview
This document defines the database schema, entities, relationships, and validation rules for the Web–POS communication system.

**Note**: This is a fresh implementation without legacy system migration. All entities and logic are designed from scratch for the new system.

---

## Entity Relationship Diagram

```
┌─────────────────┐         ┌──────────────────────┐
│     Order       │1      * │ OrderStatusHistory   │
│─────────────────│◄────────│──────────────────────│
│ id              │         │ id                   │
│ user_id         │         │ order_id  (FK)       │
│ status          │         │ old_status           │
│ order_manager   │         │ new_status           │
│ pos_order_id    │         │ actor_type           │
│ pos_confirmed_at│         │ actor_id             │
│ rejected_reason │         │ reason_en            │
│ stock_reserved  │         │ reason_ar            │
│ stock_consumed  │         │       │
│ timeout_notified│         │ created_at           │
└─────────────────┘         └──────────────────────┘

┌─────────────────┐
│    Product      │
│─────────────────│
│ id              │
│ quantity        │ ← Web-managed stock
│ is_stockable    │
│ stock_manager   │
│ pos_stock_qty   │ ← POS mirrored stock
│ pos_stock_pct   │ ← Per-product override
│ pos_stock_sync  │ ← Last sync timestamp
└─────────────────┘

┌─────────────────┐
│    Setting      │
│─────────────────│
│ id              │
│ key             │ ← Unique configuration key
│ value           │ ← JSON/string/int value
│ type            │ ← select|boolean|integer|json
│ group           │ ← ORDER_MANAGEMENT, STOCK_MANAGEMENT, etc.
│ description_en  │
│ description_ar  │
└─────────────────┘
```

---

## Entity Definitions

### 1. Order (Updated)

**Table**: `orders`  
**Purpose**: Core order entity with POS integration fields

#### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY | Order identifier |
| `user_id` | bigint | FOREIGN KEY (users.id), NOT NULL | Customer reference |
| `status` | enum/string | NOT NULL, INDEX | Current order status (enum values) |
| `order_manager` | string | NOT NULL, DEFAULT 'order_web_manager' | 'order_pos_manager' or 'order_web_manager' |
| `pos_order_id` | string | NULLABLE, INDEX | External POS system order ID |
| `pos_confirmed_at` | timestamp | NULLABLE | When POS confirmed order (POS manager only) |
| `rejected_reason_en` | text | NULLABLE | English rejection reason |
| `rejected_reason_ar` | text | NULLABLE | Arabic rejection reason |
| `total_amount` | decimal(10,2) | NOT NULL | Order total |
| `created_at` | timestamp | NOT NULL, INDEX | Order creation time |
| `updated_at` | timestamp | NOT NULL | Last modification time |

#### Computed Columns

| Column | Type | Expression | Description |
|--------|------|------------|-------------|
| `is_pos_controlled` | boolean | GENERATED ALWAYS AS (order_manager = 'order_pos_manager') STORED | Quick filter for POS-managed orders |

#### Indexes

```sql
INDEX idx_orders_status (status);
INDEX idx_orders_created_at (created_at);
```

#### Validation Rules

- **Status Transitions**: Must follow allowed flow (enforced by `OrderStatusService`)
- **POS Order ID**: Required when `order_manager = 'order_pos_manager'` and status not PENDING
- **Rejection Reason**: Required when status = REJECTED
- **Timeout Check**: Only applies to PENDING orders

#### Relationships

- **belongsTo**: User (customer)
- **hasMany**: OrderStatusHistory (audit trail)
- **hasMany**: OrderItem (line items)

#### Business Rules

1. **Cancellation Eligibility**: Determined by `cancel_allowed_statuses` setting
2. **Stock Consumption**: Triggered by status change to configured `consume_stock_on_status`
3. **Manager Type**: Set at order creation, immutable after
4. **Timeout Notification**: Admin notified when POS doesn't respond within configured timeout (order remains pending)

---

### 2. OrderStatusHistory (New)

**Table**: `order_status_history`  
**Purpose**: Immutable audit trail of all status changes

#### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY | History record identifier |
| `order_id` | bigint | FOREIGN KEY (orders.id), NOT NULL, INDEX | Order reference |
| `old_status` | enum/string | NULLABLE | Previous status (null for initial creation) |
| `new_status` | enum/string | NOT NULL | New status after transition |
| `actor_type` | enum | NOT NULL | 'user', 'admin', 'system', 'external' |
| `actor_id` | bigint | NULLABLE | User ID if actor = user/admin |
| `reason_en` | text | NULLABLE | English transition reason |
| `reason_ar` | text | NULLABLE | Arabic transition reason |
| `metadata` | json | NULLABLE | Additional context (IP, user agent, POS event ID) |
| `created_at` | timestamp | NOT NULL, INDEX | When transition occurred |

#### Indexes

```sql
INDEX idx_history_order_id (order_id);
INDEX idx_history_created_at (created_at);
```

#### Validation Rules

- **Actor Type**: Required, must be one of enum values
- **Actor ID**: Required when `actor_type` IN ('user', 'admin')
- **Old/New Status**: Cannot be identical
- **Reason**: Required when new_status = rejected or cancelled

#### Relationships

- **belongsTo**: Order

#### Business Rules

1. **Append-Only**: No updates or deletes allowed (database-level constraint)
2. **Audit Immutability**: Created records never modified

---

### 3. Product (Updated)

**Table**: `products`  
**Purpose**: Product catalog with stock management configuration

#### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY | Product identifier |
| `name_en` | string | NOT NULL | English product name |
| `name_ar` | string | NOT NULL | Arabic product name |
| `quantity` | integer | NOT NULL, DEFAULT 0 | Web-managed stock quantity |
| `is_stockable` | boolean | NOT NULL, DEFAULT TRUE | Whether product tracks stock |
| `stock_manager` | string | NOT NULL, DEFAULT 'stock_web_manager' | 'stock_pos_manager' or 'stock_web_manager' |
| `pos_stock_quantity` | integer | NOT NULL, DEFAULT 0 | Mirrored POS stock (authoritative when POS-managed) |
| `pos_stock_display_percentage` | integer | NULLABLE, CHECK (0-100) | Per-product override (NULL = use global setting) |
| `pos_stock_updated_at` | timestamp | NULLABLE | Last sync from POS |
| `created_at` | timestamp | NOT NULL | Product creation time |
| `updated_at` | timestamp | NOT NULL | Last modification time |

#### Computed Properties (Model Accessors)

```php
// Product.php
public function getDisplayedStockAttribute(): int {
    if (!$this->is_stockable) return 0;
    
    if ($this->stock_manager === 'stock_web_manager') {
        return $this->quantity;
    }
    
    // POS-managed: apply percentage
    $percentage = $this->pos_stock_display_percentage 
        ?? app(SettingsService::class)->get('pos_stock_display_percentage_global', 100);
    
    return (int) floor($this->pos_stock_quantity * ($percentage / 100));
}

public function isInStock(): bool {
    return $this->displayed_stock > 0;
}
```

#### Validation Rules

- **Stock Manager**: Must be 'stock_pos_manager' OR 'stock_web_manager'
- **Display Percentage**: If set, must be 0-100 (database CHECK constraint)
- **POS Stock Quantity**: Must be >= 0 (negative allowed only if global setting permits)
- **Quantity**: Web-managed stock, always >= 0

#### Relationships

- **hasMany**: OrderItem (product line items)

#### Business Rules

1. **Stock Source**: When `stock_manager = 'stock_pos_manager'`, `pos_stock_quantity` is authoritative
2. **Display Calculation**: Always use `displayed_stock` accessor for frontend
3. **Sync Frequency**: POS stock updates via Kafka real-time + periodic full sync
4. **Negative Stock**: Configurable via `allow_negative_stock` setting (default: false)

---

### 4. Setting (Existing - Extended)

**Table**: `settings`  
**Purpose**: Application-wide configuration without code deployment

#### Fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | bigint | PRIMARY KEY | Setting identifier |
| `key` | string | UNIQUE, NOT NULL, INDEX | Configuration key (e.g., 'order_manager_type') |
| `value` | text | NOT NULL | Configuration value (JSON for complex types) |
| `type` | enum | NOT NULL | 'string', 'integer', 'boolean', 'json', 'select' |
| `group` | string | NOT NULL, INDEX | Logical grouping (e.g., 'ORDER_MANAGEMENT') |
| `description_en` | text | NULLABLE | English setting description |
| `description_ar` | text | NULLABLE | Arabic setting description |
| `is_public` | boolean | NOT NULL, DEFAULT FALSE | Whether exposed to frontend |
| `created_at` | timestamp | NOT NULL | Setting creation time |
| `updated_at` | timestamp | NOT NULL | Last modification time |

#### Configuration Groups

1. **ORDER_MANAGEMENT**
   - `order_manager_type`: 'order_pos_manager' | 'order_web_manager'
   - `pos_auto_confirm_timeout`: integer (seconds, 0 = disabled)
   - `user_can_cancel_order`: boolean
   - `cancel_allowed_statuses`: json array

2. **STOCK_MANAGEMENT**
   - `default_stock_manager`: 'stock_pos_manager' | 'stock_web_manager'
   - `pos_stock_display_percentage_global`: integer (0-100)
   - `reserve_stock_on_pending`: boolean
   - `consume_stock_on_status`: string (enum value)
   - `allow_negative_stock`: boolean
   - `stock_sync_interval_minutes`: integer

3. **BUSINESS_HOURS**
   - `accept_orders_anytime`: boolean
   - `business_hours`: json (per-day schedule)
   - `timezone`: string (IANA timezone)

4. **NOTIFICATIONS**
   - `admin_email_notifications`: boolean
   - `admin_notification_emails`: json array
   - `notify_on_order_pending`: boolean
   - `notify_on_order_cancelled`: boolean
   - `user_notification_channels`: json array

#### Validation Rules

- **Key Uniqueness**: Enforced via unique index
- **Type Matching**: Value must be parseable as declared type
- **Select Options**: Validated against allowed values (enforced in SettingsService)

#### Relationships

- None (independent configuration table)

#### Business Rules

1. **Caching**: All reads cached with 1-hour TTL, invalidated on update
2. **Type Coercion**: SettingsService automatically casts values to correct type
3. **Defaults**: Missing keys return sensible defaults (defined in service)

---

## State Machine: Order Status Transitions

### Allowed Transitions

```
                    ┌─────────────┐
                    │   PENDING   │◄─── Order Created
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
              ▼                         ▼
       ┌─────────────┐          ┌─────────────┐
       │  REJECTED   │          │ PROCESSING  │
       └─────────────┘          └──────┬──────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ OUT_FOR_DELIVERY│
                              └────────┬─────────┘
                                       │
                                       ▼
                                ┌─────────────┐
                                │  COMPLETED  │
                                └─────────────┘

       ┌─────────────┐
       │  CANCELLED  │◄─── From PENDING or PROCESSING (configurable)
       └─────────────┘
```

### Transition Rules

| From Status | To Status | Allowed By | Conditions |
|-------------|-----------|------------|------------|
| PENDING | REJECTED | POS (external) or Admin | POS Manager: POS decision<br>Web Manager: Admin action |
| PENDING | PROCESSING | POS (external) or Admin | POS Manager: POS confirms<br>Web Manager: Admin confirms + stock check |
| PENDING | CANCELLED | User or Admin | If 'pending' in `cancel_allowed_statuses` |
| PROCESSING | OUT_FOR_DELIVERY | POS (external) or Admin | Order being shipped |
| PROCESSING | CANCELLED | User or Admin | If 'processing' in `cancel_allowed_statuses` |
| OUT_FOR_DELIVERY | COMPLETED | POS (external) or Admin | Delivery successful |
| OUT_FOR_DELIVERY | CANCELLED | Admin only | Delivery failed/refused |
| * | CANCELLED | Admin (override) | Emergency cancellation |

### Terminal States

- **REJECTED**: No further transitions allowed
- **COMPLETED**: No further transitions allowed
- **CANCELLED**: No further transitions allowed

### Regression Prevention

- **Rule**: Cannot transition from higher state to lower state (e.g., PROCESSING → PENDING)
- **Exception**: Manual admin regression in Web Manager mode only (requires explicit override)
- **Enforcement**: Validated in `OrderStatusService::validateTransition()`

---

## Migration Strategy

### New Tables

1. **order_status_history** (create)
2. **settings** (already exists - seed with new configs)

### Modified Tables

1. **orders**
   - Add: `order_manager`, `pos_order_id`, `pos_confirmed_at`, `rejected_reason_en`, `rejected_reason_ar`, `stock_reserved_at`, `stock_consumed_at`, `timeout_notified_at`
   - Add: Computed column `is_pos_controlled`
   - Add: Indexes for performance

2. **products**
   - Add: `is_stockable`, `stock_manager`, `pos_stock_quantity`, `pos_stock_display_percentage`, `pos_stock_updated_at`
   - Add: Check constraint on `pos_stock_display_percentage`

### Data Migration

**Existing Orders** (status mapping):
```php
// Migration: xxxx_migrate_existing_orders_status.php
public function up(): void {
    // All existing orders are Web-managed by default
    DB::table('orders')
        ->whereIn('status', ['processing', 'shipped', 'delivered', 'cancelled'])
        ->update(['order_manager' => 'order_web_manager']);
    
    // Map legacy statuses to new enum
    DB::table('orders')->where('status', 'shipped')->update(['status' => 'out_for_delivery']);
    DB::table('orders')->where('status', 'delivered')->update(['status' => 'completed']);
    
    // Create initial history entries for migrated orders
    DB::table('orders')->each(function ($order) {
        DB::table('order_status_history')->insert([
            'order_id' => $order->id,
            'old_status' => null,
            'new_status' => $order->status,
            'actor_type' => 'system',
            'reason_en' => 'Migrated from legacy system',
            'reason_ar' => 'تم الترحيل من النظام القديم',
            'created_at' => $order->created_at,
        ]);
    });
}
```

**Existing Products** (stock setup):
```php
// Migration: xxxx_migrate_existing_products_stock.php
public function up(): void {
    // All existing products use Web stock manager by default
    DB::table('products')->update([
        'is_stockable' => true,
        'stock_manager' => 'stock_web_manager',
        'pos_stock_quantity' => 0,
    ]);
}
```

---

## Validation Rules Summary

### Order Entity

```php
// FormRequest: UpdateOrderStatusRequest.php
public function rules(): array {
    return [
        'status' => ['required', Rule::enum(OrderStatus::class)],
        'reason_en' => ['required_if:status,rejected,cancelled', 'string', 'max:1000'],
        'reason_ar' => ['required_if:status,rejected,cancelled', 'string', 'max:1000'],
    ];
}

public function authorize(): bool {
    // Web Manager: Admin can modify
    // POS Manager: Only external system can modify (via API)
    $order = $this->route('order');
    
    if ($order->order_manager === 'order_pos_manager') {
        return $this->user()?->isAdmin() || $this->isExternalRequest();
    }
    
    return $this->user()?->isAdmin();
}
```

### Product Entity

```php
// Model: Product.php
protected function rules(): array {
    return [
        'stock_manager' => ['required', Rule::in(['stock_web_manager', 'stock_pos_manager'])],
        'pos_stock_display_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
        'pos_stock_quantity' => ['required_if:stock_manager,stock_pos_manager', 'integer'],
    ];
}

// Custom validation
public function validateStockUpdate(int $newQuantity): void {
    $allowNegative = app(SettingsService::class)->get('allow_negative_stock', false);
    
    if (!$allowNegative && $newQuantity < 0) {
        throw new ValidationException('Negative stock not allowed');
    }
}
```

### Setting Entity

```php
// SettingsService.php
public function validate(string $key, mixed $value): bool {
    $setting = Setting::where('key', $key)->firstOrFail();
    
    return match ($setting->type) {
        'integer' => is_numeric($value) && (int)$value == $value,
        'boolean' => in_array($value, [true, false, 'true', 'false', 1, 0], strict: true),
        'json' => is_string($value) && json_decode($value) !== null,
        'select' => in_array($value, $setting->options ?? []),
        default => is_string($value),
    };
}
```

---

## Performance Considerations

### Database Indexes Strategy

1. **Hot Query Paths**:
   - Order status + created_at (timeout checks, pending orders)
   - POS order ID (callback lookups)
   - Order history (audit trail queries)

2. **Composite Indexes**:
   - `(status, created_at)`: Timeout queries
   - `(order_id, created_at DESC)`: History pagination

3. **Avoid**:
   - Indexing low-cardinality columns in isolation (e.g., `is_stockable` alone)
   - Full-text indexes on reason fields (search not required)

### Caching Strategy

1. **Settings**: Redis cache, 1-hour TTL, invalidated on update
2. **Product Stock**: No cache (real-time accuracy critical)
3. **Order Status**: No cache (state changes frequent)

### Query Optimization

```php
// ❌ Bad: N+1 queries
$orders = Order::where('status', OrderStatus::PENDING)->get();
foreach ($orders as $order) {
    $history = $order->history; // N queries
}

// ✅ Good: Eager loading
$orders = Order::with('history')
    ->where('status', OrderStatus::PENDING)
    ->get();

// ✅ Better: Selective eager loading
$orders = Order::with(['history' => fn($q) => $q->latest()->limit(5)])
    ->where('status', OrderStatus::PENDING)
    ->get();
```

---

## Bilingual Support

### Translation Fields

- **Orders**: `rejected_reason_en`, `rejected_reason_ar`
- **OrderStatusHistory**: `reason_en`, `reason_ar`
- **Settings**: `description_en`, `description_ar`
- **Products**: `name_en`, `name_ar` (existing)

### GraphQL Localized Directive

```graphql
type Order {
    rejected_reason: String @localized
}

type OrderStatusHistory {
    reason: String @localized
}
```

**Note**: Admin operations (order management, settings configuration, dead-letter queue) are handled exclusively via **Filament** resources, not GraphQL. The GraphQL API serves:
- Frontend (customer-facing Next.js app)
- POS system (protected mutations with `@guard(with: ["pos"])`)

### Frontend i18n Keys

```json
// messages/en.json
{
  "order.status.pending": "Pending",
  "order.status.rejected": "Rejected",
  "order.status.processing": "Processing",
  "order.status.out_for_delivery": "Out for Delivery",
  "order.status.completed": "Completed",
  "order.status.cancelled": "Cancelled"
}

// messages/ar.json
{
  "order.status.pending": "قيد الانتظار",
  "order.status.rejected": "مرفوض",
  "order.status.processing": "قيد المعالجة",
  "order.status.out_for_delivery": "قيد التوصيل",
  "order.status.completed": "مكتمل",
  "order.status.cancelled": "ملغى"
}
```

---

## Security Considerations

### Access Control

1. **POS Callback Endpoint**: Token-based authentication via middleware
2. **Order Status Updates**: Authorized by `authorize()` method in FormRequest
3. **Dead-Letter Reprocessing**: Admin-only action
4. **Settings Management**: Admin-only via Filament

### Audit Trail

- **All status changes recorded**: Who, when, why, from where
- **Immutable history**: No updates/deletes allowed
- **Metadata tracking**: IP address, user agent, correlation IDs

### Data Exposure

- **API Responses**: Do not expose internal POS identifiers to customers
- **Error Messages**: Generic messages for external requests (no stack traces)
- **Logs**: Sensitive data masked (customer details, payment info)

---

**Status**: Ready for contract generation (Phase 1 next step)
