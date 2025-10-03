# Configurable Business Logic - High-Level Implementation Plan

## Overview
This document outlines the implementation plan for a configurable business logic system that manages order workflows between the Web application and POS system via API + Kafka integration.

## Table of Contents
1. [New Order Status Flow](#new-order-status-flow)
2. [System Architecture](#system-architecture)
3. [Configuration Settings](#configuration-settings)
4. [Database Schema Updates](#database-schema-updates)
5. [Implementation Phases](#implementation-phases)
6. [Critical Questions & Decisions](#critical-questions--decisions)
7. [Technical Components](#technical-components)

---

## 1. New Order Status Flow

### Current vs New Status
**Current Status** (OrderStatus Enum):
- PROCESSING
- SHIPPED
- DELIVERED
- CANCELLED

**New Status** (Based on Diagrams):
- **PENDING** - Order created, waiting for admin/POS confirmation
- **REJECTED** - Admin/POS rejected the order
- **PROCESSING** - Order confirmed and being prepared
- **OUT_FOR_DELIVERY** - Order shipped/out for delivery
- **COMPLETED** - Order delivered successfully
- **CANCELLED** - Order cancelled (by user or admin)

### Status Transitions & Notifications

```
┌─────────┐
│ PENDING │ ← Order Created (Web/Mobile)
└────┬────┘
     │
     ├─→ Admin/POS Confirms ──→ PROCESSING
     │                           ↓
     │                      Notification: User
     │                           ↓
     ├─→ Admin/POS Rejects ──→ REJECTED
     │                           ↓
     │                      Notification: User
     │
     └─→ Admin/User Cancels ──→ CANCELLED
                                 ↓
                            Notification: User + Admin

PROCESSING ──→ Stock Reserved/Consumed
     ↓
     └─→ Order Prepared ──→ OUT_FOR_DELIVERY
                            ↓
                       Notification: User
                            ↓
                       Delivered ──→ COMPLETED
                            ↓
                       Notification: User
```

---

## 2. System Architecture

### Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   Web Application (Laravel)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                    ┌──────────────────┐   │
│  │   Order      │                    │   Settings       │   │
│  │   Service    │◄───────────────────┤   Service        │   │
│  └──────┬───────┘                    └──────────────────┘   │
│         │                                                     │
│         ├──► API Endpoints (GraphQL/REST)                   │
│         │                                                     │
│         └──► Kafka Producer                                  │
│                 │                                             │
└─────────────────┼─────────────────────────────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │  Kafka Broker   │
         └────────┬───────┘
                  │
      ┌───────────┴────────────┐
      │                        │
      ▼                        ▼
┌─────────────┐        ┌─────────────┐
│  Web Kafka  │        │  POS API    │
│  Consumer   │        │  Endpoint   │
└─────────────┘        └─────────────┘
      │                        │
      │                        ▼
      │                ┌─────────────┐
      │                │ POS System  │
      │                └─────────────┘
      │                        │
      └────────────────────────┘
         Updates from POS
```

### Order Manager Types

#### 1. **Order POS Manager** (`order_pos_manager`)
**Full POS Control** - Orders are fully managed by POS system

**Workflow**:
1. Web → sends order creation event to POS (via Kafka)
2. POS receives order and makes decision:
   - Accept: POS confirms order
   - Reject: POS rejects order with reason
3. POS → sends order updates back to Web (via API callback)
4. Web cannot modify order states directly (read-only for Web admin)
5. POS controls all order state transitions (PENDING → PROCESSING → OUT_FOR_DELIVERY → COMPLETED)

**Key Points**:
- Web admin can **view** orders but cannot change status
- All status changes originate from POS
- POS has full authority over order lifecycle
- Web listens to POS updates via API callbacks

#### 2. **Order Web Manager** (`order_web_manager`)
**Full Web Control** - Orders are fully managed by Web admin

**Workflow**:
1. Web → sends order creation event to POS (via Kafka) for reporting/mirroring only
2. Web admin confirms order (moves to PROCESSING)
3. **Stock Check** (if using Stock POS Manager):
   - Web → checks stock availability from POS (via API)
   - If stock available: proceed
   - If stock unavailable: reject or hold order
4. Web admin manages all order state transitions
5. Web → sends updated order status to POS (via Kafka) for mirroring
6. POS only mirrors order data for reporting purposes (no control)

**Key Points**:
- Web admin has full control over order status
- POS receives updates but cannot modify orders
- Web must check POS stock availability before confirming (if using Stock POS Manager)
- POS is a passive observer for reporting only

---

### Stock Manager Types

#### 1. **Stock POS Manager** (`stock_pos_manager`)
**POS Controls Stock** - POS is responsible for stock consumption

**Workflow**:
1. POS manages actual inventory and deducts stock when orders are processed
2. Products on Web show a **mirrored percentage** of POS stock (0–100%)
   - Global setting: `pos_stock_display_percentage_global` (default: 100%)
   - Per-product override: `products.pos_stock_display_percentage` (can override global)
   - Example: POS has 100 items, global setting 70% → Web displays 70 items
3. POS → sends Kafka messages to Web to update stock quantities
4. Web → stores mirrored POS stock in `products.pos_stock_quantity`
5. Web displays calculated stock: `pos_stock_quantity * (display_percentage / 100)`

**Key Points**:
- POS is source of truth for stock
- Web cannot manually set stock levels
- Web displays conservative estimate to prevent overselling
- Real-time sync via Kafka + periodic full sync (backup)

#### 2. **Stock Web Manager** (`stock_web_manager`)
**Web Controls Stock** - Web is responsible for its own stock management

**Workflow**:
1. Web manages its own inventory in `products.quantity`
2. Web admin manually sets product quantities
3. POS does **not** deduct stock when orders are placed
4. Web → sends order updates to POS (via Kafka) for reporting only
5. POS mirrors order data but doesn't affect its inventory

**Key Points**:
- Web is source of truth for stock
- Product quantities set manually by Web admin
- POS has no control over Web inventory
- POS receives order data for reporting/analytics only

---

## 3. Configuration Settings

### Settings Table Structure
```sql
CREATE TABLE settings (
    id BIGINT PRIMARY KEY,
    key VARCHAR UNIQUE,
    group VARCHAR,
    type VARCHAR,  -- enum: select, boolean, integer, json, time
    value TEXT,
    label_en VARCHAR,
    label_ar VARCHAR,
    description_en TEXT,
    description_ar TEXT,
    is_required BOOLEAN,
    display_order INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Configuration Groups

#### **ORDER_MANAGEMENT** Group
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `order_manager_type` | select | 'order_web_manager' | 'order_pos_manager' or 'order_web_manager' |
| `pos_auto_confirm_timeout` | integer | 3600 | Seconds before auto-confirm (0=disabled, POS Manager only) |
| `web_admin_can_modify_pos_orders` | boolean | false | Allow Web admin to override POS orders (not recommended) |
| `user_can_cancel_order` | boolean | true | Allow users to cancel |
| `cancel_allowed_statuses` | json | ['pending','processing'] | Which statuses allow cancel |

#### **STOCK_MANAGEMENT** Group
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `default_stock_manager` | select | 'stock_web_manager' | 'stock_pos_manager' or 'stock_web_manager' |
| `product_stockable_by_default` | boolean | true | New products stockable? |
| `pos_stock_display_percentage_global` | integer | 100 | Global % of POS stock to display (0-100) |
| `reserve_stock_on_pending` | boolean | false | Reserve stock immediately? (Web Manager only) |
| `consume_stock_on_status` | select | 'processing' | When to consume stock (Web Manager only) |
| `stock_sync_interval_minutes` | integer | 15 | Periodic POS stock sync interval (0=disabled) |

#### **BUSINESS_HOURS** Group
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `accept_orders_anytime` | boolean | true | Accept 24/7? |
| `business_hours` | json | {...} | Per-day operating hours |
| `timezone` | select | 'Africa/Cairo' | Business timezone |
| `order_rejection_outside_hours` | boolean | false | Auto-reject or queue? |

#### **NOTIFICATIONS** Group
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `admin_email_notifications` | boolean | true | Email admin on events? |
| `admin_notification_emails` | json | [] | List of admin emails |
| `notify_on_order_pending` | boolean | true | Notify admin on new order |
| `notify_on_order_cancelled` | boolean | true | Notify admin on cancellation |
| `notify_on_return_request` | boolean | true | Notify admin on return |
| `user_notification_channels` | json | ['database','push'] | User notification methods |

---

## 4. Database Schema Updates

### 4.1 Update OrderStatus Enum
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

### 4.2 Add Product Configuration Columns
```sql
ALTER TABLE products ADD COLUMN is_stockable BOOLEAN DEFAULT TRUE;
ALTER TABLE products ADD COLUMN stock_manager VARCHAR DEFAULT 'stock_web_manager'; -- 'stock_pos_manager' or 'stock_web_manager'
ALTER TABLE products ADD COLUMN pos_stock_quantity INTEGER DEFAULT 0; -- Mirrored POS stock
ALTER TABLE products ADD COLUMN pos_stock_display_percentage INTEGER NULL; -- Override global setting (0-100, NULL=use global)
ALTER TABLE products ADD COLUMN pos_stock_updated_at TIMESTAMP NULL; -- Last sync from POS
```

### 4.3 Order Additional Fields
```sql
ALTER TABLE orders ADD COLUMN order_manager VARCHAR DEFAULT 'order_web_manager'; -- 'order_pos_manager' or 'order_web_manager'
ALTER TABLE orders ADD COLUMN pos_order_id VARCHAR NULL; -- POS system order reference
ALTER TABLE orders ADD COLUMN pos_confirmed_at TIMESTAMP NULL; -- When POS confirmed (POS Manager only)
ALTER TABLE orders ADD COLUMN rejected_reason TEXT NULL; -- Rejection reason from POS or Web
ALTER TABLE orders ADD COLUMN stock_reserved_at TIMESTAMP NULL; -- When stock was reserved (Web Manager only)
ALTER TABLE orders ADD COLUMN stock_consumed_at TIMESTAMP NULL; -- When stock was consumed
ALTER TABLE orders ADD COLUMN is_pos_controlled BOOLEAN GENERATED ALWAYS AS (order_manager = 'order_pos_manager') STORED; -- Helper for queries
```

### 4.4 New Table: Order Status History
```sql
CREATE TABLE order_status_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT,
    from_status VARCHAR,
    to_status VARCHAR,
    changed_by_id BIGINT NULL,
    changed_by_type VARCHAR, -- 'user', 'admin', 'pos', 'system'
    reason TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
```

### 4.5 File-based Kafka Message Logger (Recommended)
configure file based logger for kafka

## 5. Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Goal**: Set up configuration system and database schema

**Tasks**:
1. ✅ Create/Update settings table migration
2. ✅ Create Settings model with caching
3. ✅ Create SettingsService with type-safe getters
4. ✅ Update OrderStatus enum with new statuses
5. ✅ Create product configuration migrations
6. ✅ Create order additional fields migration
7. ✅ Create order_status_history table
8. ✅ Seed default settings
9. ✅ Create Filament settings management page

**Deliverables**:
- Migrations for all new tables/columns
- Settings seeder with defaults
- SettingsService with type-safe config access
- Admin UI to manage settings (Filament)

---

### Phase 2: Order Status Flow (Week 3-4)
**Goal**: Implement new order status workflow

**Tasks**:
1. ✅ Update Order model with new statuses
2. ✅ Create OrderStatusService for transitions
3. ✅ Implement status transition validation rules
4. ✅ Create OrderStatusHistory observer
5. ✅ Update canBeCancelled() logic based on settings
6. ✅ Create order state machine (optional: use Laravel State Machines)
7. ✅ Update GraphQL schema with new statuses
8. ✅ Update frontend to handle new statuses

**Deliverables**:
- OrderStatusService with transition methods
- Validated status flow with history tracking
- Updated GraphQL mutations
- Frontend order status display updates

---

### Phase 3: Stock Management (Week 5-6)
**Goal**: Implement configurable stock logic

**Tasks**:
1. ✅ Create StockManager interface
2. ✅ Implement WebStockManager
3. ✅ Implement PosStockManager
4. ✅ Create StockService with factory pattern
5. ✅ Add product-level stock configuration
6. ✅ Implement stock reservation logic
7. ✅ Implement stock consumption on status change
8. ✅ Create Kafka consumer for POS stock updates
9. ✅ Implement stock indicator display logic
10. ✅ Create stock sync command (for POS integration)

**Deliverables**:
- StockService with configurable managers
- Stock reservation/consumption workflows
- POS stock sync via Kafka
- Updated product display with correct stock levels

---

### Phase 4: POS Integration (Week 7-8)
**Goal**: Integrate with POS system via API + Kafka

**Tasks**:
1. ✅ Design Kafka message formats
2. ✅ Update KafkaService with order events
3. ✅ Create Kafka consumer for POS responses
4. ✅ Implement POS API callback endpoint
5. ✅ Create POS confirmation/rejection handlers
6. ✅ Implement order timeout & auto-confirm logic
7. ✅ Add retry logic for failed Kafka messages
8. ✅ Implement file-based Kafka message logging, rotation and CLI helpers
9. ✅ Test POS communication flows

**Kafka Topics**:
- `orders.created` - Web → POS
- `orders.updated` - Web → POS
- `orders.status.changed` - POS → Web
- `products.stock.updated` - POS → Web

**Deliverables**:
- Kafka producers for order events
- Kafka consumers for POS updates
- API endpoints for POS callbacks
- Message logging and retry logic

---

### Phase 5: Business Hours & Validation (Week 9)
**Goal**: Implement business hours and order acceptance rules

**Tasks**:
1. ✅ Create BusinessHoursService
2. ✅ Implement time validation middleware
3. ✅ Add checkout validation for business hours
4. ✅ Create order queue for outside-hours orders (optional)
5. ✅ Update frontend with business hours display
6. ✅ Add timezone handling

**Deliverables**:
- BusinessHoursService with validation
- Middleware for time-based restrictions
- Frontend business hours indicator

---

### Phase 6: Notifications & Admin Alerts (Week 10)
**Goal**: Implement configurable notification system

**Tasks**:
1. ✅ Create notification event listeners
2. ✅ Implement admin email notifications
3. ✅ Create user notifications for status changes
4. ✅ Add push notifications integration
5. ✅ Create notification preferences per admin
6. ✅ Test all notification channels

**Events to Notify**:
- Order placed (Pending) → Admin
- Order confirmed (Processing) → User
- Order rejected → User
- Order cancelled → User + Admin
- Order out for delivery → User
- Order completed → User
- Return requested → Admin

**Deliverables**:
- Event listeners for all order events
- Email notification templates
- Admin notification management UI
- User notification preferences

---

### Phase 7: Testing & Documentation (Week 11-12)
**Goal**: Comprehensive testing and documentation

**Tasks**:
1. ✅ Write unit tests for services
2. ✅ Write feature tests for order flows
3. ✅ Write integration tests for Kafka
4. ✅ Write API tests for POS endpoints
5. ✅ Create admin user guide
6. ✅ Create developer documentation
7. ✅ Create POS integration guide
8. ✅ Performance testing
9. ✅ Load testing Kafka consumers

**Deliverables**:
- Full test coverage (>80%)
- Admin documentation
- Developer API documentation
- POS integration guide

---

## 6. Critical Questions & Decisions

### 6.1 Order Manager Selection
**Question**: How does the system determine which order manager to use?

**Decision**: ✅ **Option A** - Global setting applies to all orders

**Rationale**:
- Simpler to manage and understand
- Clear separation of responsibilities
- Avoids complexity of mixed order management
- Business typically uses one primary system

**Implementation**:
- Setting: `order_manager_type` = 'order_pos_manager' or 'order_web_manager'
- Applied globally to all new orders
- Stored in `orders.order_manager` column for reference
- Cannot be changed per-order after creation

---

### 6.2 Stock Reservation Timing
**Question**: When should stock be reserved?

**Decision**: ✅ **Option C** - Configurable setting (Web Manager only)

**Implementation**:
- **Stock Web Manager**:
  - Setting: `reserve_stock_on_pending` (boolean)
  - If TRUE: Reserve on order creation (PENDING status)
  - If FALSE: Reserve on confirmation (PROCESSING status)
  - Consumption happens separately based on `consume_stock_on_status`

- **Stock POS Manager**:
  - No reservation by Web
  - POS manages its own stock deduction
  - Web only checks availability via API before confirming order

**Implications**:
- Immediate reservation (Web): Prevents overselling, but locks stock
- Delayed reservation (Web): More flexible, but risk of overselling
- POS Manager: Web has no control over stock reservation

---

### 6.3 POS Confirmation Timeout
**Question**: What happens if POS doesn't respond within timeout?

**Options**:
- [ ] **A**: Auto-reject the order
- [ ] **B**: Auto-confirm the order
- [ ] **C**: Keep in pending indefinitely
- [ ] **D**: Notify admin for manual action

**Recommendation**: Option B + D
- Auto-confirm after timeout (configurable)
- Send notification to admin
- Admin can manually reject if needed
- Setting: `auto_confirm_timeout` (seconds, 0=disabled)

---

### 6.4 Stock Display Strategy
**Question**: How to display stock levels when using POS stock?

**Decision**: ✅ **Option B + D** - Show percentage with per-product override

**Implementation**:
- **Global Setting**: `pos_stock_display_percentage_global` (0-100, default: 100)
- **Per-Product Override**: `products.pos_stock_display_percentage` (NULL = use global)
- **Calculation**: `display_stock = pos_stock_quantity * (percentage / 100)`

**Examples**:
- POS has 100 items, global 70% → Display 70 items
- POS has 100 items, product override 50% → Display 50 items
- POS has 100 items, global 100% → Display 100 items (exact)

**Rationale**:
- Shows conservative estimate to avoid overselling
- Flexible per-product customization
- Simple calculation and configuration

---

### 6.5 Failed Kafka Messages
**Question**: How to handle failed Kafka message delivery?

**Options**:
- [ ] **A**: Retry with exponential backoff
- [ ] **B**: Dead letter queue
- [ ] **C**: Manual admin intervention
- [ ] **D**: All of the above

**Recommendation**: Option D
- Automatic retry (3 attempts)
- Move to dead letter queue
- Admin dashboard to view/retry failed messages
- Alert admin on critical failures

---

### 6.6 User Cancellation Rules
**Question**: Which order statuses allow user cancellation?

**Options**:
- [ ] **A**: Only PENDING
- [ ] **B**: PENDING + PROCESSING
- [ ] **C**: Any status before OUT_FOR_DELIVERY
- [x] **D**: Configurable setting

**Recommendation**: Option D - Configurable
- Setting: `cancel_allowed_statuses` (JSON array)
- Default: `['pending', 'processing']`
- Admin can adjust based on business needs

---

### 6.7 Order Outside Business Hours
**Question**: What happens when order is placed outside business hours?

**Options**:
- [ ] **A**: Reject immediately
- [ ] **B**: Queue and process when open
- [ ] **C**: Accept normally
- [x] **D**: Configurable

**Recommendation**: Option D - Configurable
- Setting: `accept_orders_anytime` (boolean)
- If FALSE: Show message, optionally queue
- If TRUE: Accept 24/7
- Consider order preparation time in messaging

---

### 6.8 Multiple POS Systems
**Question**: Will there be multiple POS systems (locations)?

Single POS system

---

### 6.9 Stock Sync Frequency
**Question**: How often should POS stock sync with web?

**Options**:
- [x] **A**: Real-time via Kafka events
- [ ] **B**: Scheduled sync (every X minutes)
- [x] **C**: On-demand via admin action
- [ ] **D**: A + B (real-time + periodic full sync)

**Recommendation**: Option D
- Real-time: POS pushes stock changes via Kafka
- Periodic: Full sync every 15 minutes as backup
- On-demand: Admin can trigger manual sync
- Handle sync conflicts (last-write-wins vs merge)

---

### 6.10 Return/Refund in New Flow
**Question**: How do returns work with new status flow?

**Current**: Returns allowed for DELIVERED orders

**Considerations**:
- Only COMPLETED orders eligible for return?
- What about orders completed by POS vs Web?
- Stock return to POS vs Web inventory?

**Recommendation**:
- Returns only for COMPLETED orders
- Stock returns to original source (POS/Web)
- Kafka event to POS on return completion
- Refund follows existing payment method logic

---

## 7. Technical Components

### 7.1 Core Services

#### **SettingsService**
```php
class SettingsService {
    public function get(string $key, $default = null)
    public function set(string $key, $value): void
    public function getGroup(string $group): Collection
    
    // Order Management
    public function getOrderManagerType(): OrderManagerType // 'order_pos_manager' or 'order_web_manager'
    public function isOrderPosManaged(): bool
    public function isOrderWebManaged(): bool
    
    // Stock Management
    public function getStockManagerType(): StockManagerType // 'stock_pos_manager' or 'stock_web_manager'
    public function isStockPosManaged(): bool
    public function isStockWebManaged(): bool
    public function getPosStockDisplayPercentageGlobal(): int // 0-100
    
    // Business Hours
    public function isOrderAcceptanceAllowed(): bool
    public function getBusinessHours(): array
}
```

#### **OrderStatusService**
```php
class OrderStatusService {
    public function canTransition(Order $order, OrderStatus $to): bool
    public function transition(Order $order, OrderStatus $to, ?string $reason): void
    public function getAvailableTransitions(Order $order): array
    public function isUserCancellationAllowed(Order $order): bool
}
```

#### **StockService**
```php
class StockService {
    public function getManager(Product $product): StockManagerInterface
    
    // Stock Operations (delegates to appropriate manager)
    public function reserve(Product $product, int $quantity): void // Web Manager only
    public function release(Product $product, int $quantity): void // Web Manager only
    public function consume(Product $product, int $quantity): void // Depends on manager
    
    // Stock Display
    public function getAvailableStock(Product $product): int // Returns display stock
    public function getDisplayStockPercentage(Product $product): int // Product or global setting
    
    // POS Stock Sync
    public function syncFromPOS(Product $product, int $posQuantity): void
    public function checkPosStockAvailability(Product $product, int $quantity): bool // API call to POS
}
```

#### **BusinessHoursService**
```php
class BusinessHoursService {
    public function isBusinessHoursNow(): bool
    public function getNextBusinessHour(): ?Carbon
    public function canAcceptOrders(): bool
    public function getBusinessHours(string $day): ?array
}
```

### 7.2 Kafka Message Formats

#### Order Created Event (Web → POS)
```json
{
    "event": "order.created",
    "message_id": "uuid",
    "timestamp": "2025-10-02T10:00:00Z",
    "data": {
        "order_id": 123,
        "order_number": "ORD-2025-0001",
        "user": {
            "id": 456,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+20123456789"
        },
        "items": [
            {
                "product_id": 789,
                "sku": "PROD-001",
                "name_en": "Product Name",
                "quantity": 2,
                "unit_price": 100.00,
                "options": {"size": "L", "color": "Red"}
            }
        ],
        "totals": {
            "subtotal": 200.00,
            "shipping": 50.00,
            "discount": 10.00,
            "total": 240.00
        },
        "shipping_address": {
            "content": "123 Street",
            "phone": "+20123456789",
            "area": "Cairo",
            "gov": "Cairo"
        },
        "payment_method": "cash_on_delivery"
    }
}
```

#### Order Status Changed (POS → Web)
```json
{
    "event": "order.status.changed",
    "message_id": "uuid",
    "timestamp": "2025-10-02T10:05:00Z",
    "data": {
        "order_id": 123,
        "pos_order_id": "POS-789",
        "from_status": "pending",
        "to_status": "processing",
        "changed_by": "POS",
        "reason": "Order confirmed by staff",
        "metadata": {
            "confirmed_by_user": "admin@pos.com",
            "estimated_ready_time": "2025-10-02T11:00:00Z"
        }
    }
}
```

#### Stock Updated (POS → Web)
```json
{
    "event": "product.stock.updated",
    "message_id": "uuid",
    "timestamp": "2025-10-02T10:00:00Z",
    "data": {
        "updates": [
            {
                "product_id": 789,
                "sku": "PROD-001",
                "quantity": 50,
                "location": "main_warehouse"
            }
        ]
    }
}
```

### 7.3 API Endpoints (POS Callbacks)

#### POST /api/pos/orders/{order}/confirm
```php
// POS confirms order acceptance
{
    "pos_order_id": "POS-789",
    "estimated_ready_time": "2025-10-02T11:00:00Z",
    "notes": "Order confirmed"
}
```

#### POST /api/pos/orders/{order}/reject
```php
// POS rejects order
{
    "reason": "Product out of stock",
    "alternative_products": [123, 456]
}
```

#### POST /api/pos/stock/sync
```php
// POS pushes stock updates
{
    "products": [
        {"sku": "PROD-001", "quantity": 50},
        {"sku": "PROD-002", "quantity": 0}
    ]
}
```

### 7.4 Middleware

#### CheckBusinessHours
```php
class CheckBusinessHours {
    public function handle(Request $request, Closure $next) {
        if (!$this->businessHoursService->canAcceptOrders()) {
            return response()->json([
                'message' => 'Orders not accepted outside business hours',
                'next_business_hour' => $this->businessHoursService->getNextBusinessHour()
            ], 422);
        }
        return $next($request);
    }
}
```

### 7.5 Events & Listeners

#### Events
- `OrderCreated`
- `OrderStatusChanged`
- `OrderConfirmed`
- `OrderRejected`
- `OrderCancelled`
- `OrderCompleted`
- `StockReserved`
- `StockConsumed`

#### Listeners
- `PublishOrderToKafka` (OrderCreated)
- `NotifyAdminOfNewOrder` (OrderCreated)
- `NotifyUserOfStatusChange` (OrderStatusChanged)
- `ConsumeStockOnProcessing` (OrderConfirmed)
- `ReleaseReservedStock` (OrderRejected, OrderCancelled)
- `SendOrderToPos` (OrderCreated + POS_MANAGER)

---

## 8. Testing Strategy

### 8.1 Unit Tests
- SettingsService
- OrderStatusService
- StockService (Web & POS managers)
- BusinessHoursService
- Kafka message serialization

### 8.2 Feature Tests
- Order creation flow
- Status transitions
- Stock reservation/consumption
- User cancellation
- Admin confirmation/rejection
- Business hours validation
- Notification dispatch

### 8.3 Integration Tests
- Kafka producer/consumer
- POS API callbacks
- Stock sync
- Multi-step order flows


## 10. Metrics & Monitoring

### Key Metrics
- Order creation success rate
- POS confirmation rate
- POS rejection rate
- Average confirmation time
- Stock sync accuracy
- Kafka message delivery rate
- Order cancellation rate
- Notification delivery rate

### Monitoring
- Kafka consumer lag
- Failed message queue
- Order status transition times
- Stock sync delays
- API response times

### Alerts
- POS not responding
- High rejection rate
- Stock sync failures
- Kafka consumer down
- High cancellation rate

---

## 11. Risk Mitigation

### Risk 1: Kafka Connection Failure
**Mitigation**:
- Implement retry logic with exponential backoff
- Dead letter queue for failed messages
- Fallback to API calls if Kafka unavailable
- Admin dashboard to monitor and replay

### Risk 2: POS Never Responds
**Mitigation**:
- Auto-confirm timeout setting
- Admin notification on timeout
- Manual override capability
- Order queue management

### Risk 3: Stock Sync Drift
**Mitigation**:
- Periodic full stock reconciliation
- Conflict resolution strategy
- Manual sync trigger
- Stock audit logs

### Risk 4: High Order Volume
**Mitigation**:
- Kafka partitioning
- Horizontal scaling of consumers
- Order queue management
- Rate limiting if needed

---

## 12. Next Steps

### Immediate Actions
1. **Review & Approve Plan**: Stakeholder sign-off
2. **Clarify Questions**: Answer all critical questions (Section 6)
3. **Define POS API Contract**: Work with POS team on specs
4. **Set Up Infrastructure**: Kafka topics, environments
5. **Create Project Timeline**: Assign tasks and deadlines

### Dependencies
- [ ] POS system API specification
- [ ] Kafka infrastructure setup
- [ ] Admin approval on business rules
- [ ] Design team: UI mockups for new statuses
- [ ] DevOps: Staging environment setup

---

## Appendix A: Settings Examples

### Example JSON Settings

#### Business Hours
```json
{
    "monday": {"open": "09:00", "close": "21:00", "enabled": true},
    "tuesday": {"open": "09:00", "close": "21:00", "enabled": true},
    "wednesday": {"open": "09:00", "close": "21:00", "enabled": true},
    "thursday": {"open": "09:00", "close": "21:00", "enabled": true},
    "friday": {"open": "09:00", "close": "21:00", "enabled": true},
    "saturday": {"open": "10:00", "close": "20:00", "enabled": true},
    "sunday": {"open": "10:00", "close": "20:00", "enabled": false}
}
```

#### Admin Notification Emails
```json
[
    "admin1@example.com",
    "admin2@example.com",
    "manager@example.com"
]
```

#### Cancel Allowed Statuses
```json
["pending", "processing"]
```

---

## Appendix B: Migration Checklist

- [ ] Create new enum for OrderStatus
- [ ] Add columns to products table
- [ ] Add columns to orders table
- [ ] Create settings table (if not exists)
- [ ] Create order_status_history table
- [ ] Create kafka_message_logs table (optional)
- [ ] Implement file-based Kafka message logging (rotating files)
- [ ] Seed default settings
- [ ] Update existing orders with new status logic
- [ ] Backfill order_status_history for existing orders

---

## Document Control

**Version**: 1.0
**Date**: October 2, 2025
**Author**: GitHub Copilot
**Status**: Draft - Pending Review
**Next Review**: After stakeholder feedback
