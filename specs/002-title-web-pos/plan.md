
````markdown

# Implementation Plan: Web–POS Communication Service

**Branch**: `002-title-web-pos` | **Date**: 2025-10-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `E:\web_pos\specs\002-title-web-pos\spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
The Web–POS Communication Service enables bidirectional synchronization between the platform's Web backend (Laravel 11 + GraphQL) and an external Point-of-Sale system. The service manages order lifecycle states (Pending → Processing → Out For Delivery → Completed/Cancelled/Rejected) and real-time stock availability with configurable business rules, automated timeout handling, retry mechanisms with dead-letter queue, comprehensive audit logging, and observability. The system supports two operation modes: external-managed (POS controls orders) and internal-managed (Web admin controls orders), with flexible stock display percentages.

## Technical Context
**Language/Version**: PHP 8.4.8, TypeScript 5.x (Next.js 15+)  
**Primary Dependencies**: Laravel 11.45.1, Lighthouse GraphQL, Next.js 15, Apollo Client, Laravel Queues, Laravel Sanctum, Kafka (rdkafka-php), Filament 3.3 (admin panel)  
**Storage**: MySQL database, Laravel `failed_jobs` table for dead-letter queue, file-based Kafka message logs  
**Testing**: Pest 3.8.2 (backend), Jest (frontend), contract tests for GraphQL schema  
**Target Platform**: Linux/Windows server (backend), Web browsers (frontend), Mobile (future)  
**Project Type**: web (frontend + backend with GraphQL API layer)  
**Performance Goals**: <500ms API response time, near real-time stock updates via Kafka, <0.5% dead-letter rate post-retry  
**Constraints**: Single external POS authority, no cascading failures when POS unavailable, audit logs append-only  
**Scale/Scope**: Order management workflow, stock synchronization, configurable business rules, admin notifications, manual dead-letter reprocessing

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Documentation-First Development**
- ✅ Feature spec written for stakeholders
- ✅ All ambiguities resolved in Clarifications section
- ✅ Acceptance criteria testable and measurable
- ✅ No premature technology choices in spec

**II. Test-First Development (NON-NEGOTIABLE)**
- ✅ Will write contract tests for GraphQL mutations/queries before implementation
- ✅ Will write integration tests for order lifecycle flows before implementation
- ✅ Will follow Red-Green-Refactor cycle strictly
- ✅ Tests will fail initially proving they test real functionality

**III. GraphQL Contract-First API Design**
- ✅ Will define all API contracts in `/backend/graphql/` before implementation
- ✅ GraphQL serves: Frontend (Next.js) and POS system only (NOT admin panel)
- ✅ Admin functionality managed exclusively via Filament resources
- ✅ Will use Lighthouse directives (@validate, @rules, @can) for validation and authorization
- ✅ Frontend types will be generated via codegen from schema
- ✅ Schema changes validated before implementation
- ✅ POS API will be GraphQL-based with API key protection (not REST)

**IV. Bilingual-First Design**
- ✅ Database migrations will use `_en` and `_ar` suffixes for translatable fields (rejection reasons, notifications)
- ✅ GraphQL schema will include @localized directive where applicable
- ✅ All user-facing content includes both languages from start

**V. Component Reusability & Consistency**
- ✅ Will reuse existing error handling utilities (`error-extraction.ts`)
- ✅ Will follow existing form field patterns and UI components
- ✅ Will check for existing notification components before creating new ones
- ✅ Will extract reusable patterns (e.g., OrderStatusBadge, StockIndicator) into shared components

**VI. Migration Integrity**
- ✅ Fresh system implementation - no legacy migration needed
- ✅ GraphQL API supports both Inertia.js (existing features) and Next.js (new features)
- ✅ New order statuses (pending, rejected, processing, out_for_delivery, completed, cancelled) designed from scratch
- ✅ No backward compatibility requirements - clean slate implementation

**VII. Laravel & Next.js Ecosystem Best Practices**
- ✅ Will use Artisan commands for file generation
- ✅ Will use Laravel Queues with retry and failed job handling
- ✅ Will use Eloquent relationships and query builder
- ✅ Will use Pest for backend testing
- ✅ Will use shadcn/ui for frontend components
- ✅ Will run `vendor/bin/pint --dirty` before finalizing changes
- ✅ Will run `npm run codegen` after schema changes

**Initial Gate Status**: ✅ PASS

**Complexity Justification Required**: None - follows established patterns with Laravel Queues, Kafka integration, and GraphQL schema expansion.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
backend/
├── app/
│   ├── Enums/
│   │   └── OrderStatus.php          # Update with new statuses
│   ├── Models/
│   │   ├── Order.php                # Update with new fields and relationships
│   │   ├── OrderStatusHistory.php   # New model for audit trail
│   │   ├── Product.php              # Update with stock fields
│   │   └── Setting.php              # Existing configuration model
│   ├── Services/
│   │   ├── OrderStatusService.php   # New: State transition logic
│   │   ├── StockService.php         # New: Stock management facade
│   │   ├── SettingsService.php      # New: Configuration access
│   │   ├── KafkaService.php         # Update: Order/stock events
│   │   └── NotificationService.php  # New: Admin alerts
│   ├── Jobs/
│   │   ├── ProcessOrderTimeout.php  # New: Handle pending timeouts
│   │   ├── SyncStockFromPOS.php     # New: Periodic stock sync
│   │   └── RetryFailedSync.php      # New: Dead-letter reprocessing
│   ├── Http/
│   │   └── Middleware/
│   │       └── AuthenticatePosToken.php       # New: POS API key auth provider
│   ├── GraphQL/
│   │   ├── Mutations/
│   │   │   ├── UpdateOrderStatus.php          # Update with new logic
│   │   │   ├── CancelOrder.php                # Update with config checks
│   │   │   ├── PosAcceptOrder.php             # New: POS accepts order
│   │   │   ├── PosRejectOrder.php             # New: POS rejects order
│   │   │   └── PosUpdateOrderStatus.php       # New: POS status updates
│   │   └── Queries/
│   │       └── OrderHistory.php               # New: Status audit trail
│   ├── Observers/
│   │   └── OrderObserver.php        # New: Track status changes
│   └── Filament/
│       └── Resources/
│           ├── SettingResource.php  # Update with new configs
│           ├── FailedJobResource.php  # New: Dead-letter management (admin only)
│           └── OrderResource.php    # Update with status history relation
├── database/
│   ├── migrations/
│   │   ├── xxxx_update_order_status_enum.php
│   │   ├── xxxx_add_order_management_fields.php
│   │   ├── xxxx_add_product_stock_fields.php
│   │   ├── xxxx_create_order_status_history.php
│   │   └── xxxx_seed_communication_settings.php
│   ├── seeders/
│   │   └── CommunicationSettingsSeeder.php
│   └── factories/
│       └── OrderStatusHistoryFactory.php
├── graphql/
│   ├── orders.graphql               # Update with new statuses + POS mutations
│   ├── products.graphql             # Update with stock fields
│   └── settings.graphql             # New: Configuration queries (public frontend settings)
├── tests/
│   ├── Feature/
│   │   ├── OrderLifecycleTest.php   # New: End-to-end flows
│   │   ├── PosGraphQLTest.php       # New: POS GraphQL mutations
│   │   ├── StockSyncTest.php        # New: Kafka stock updates
│   │   └── DeadLetterTest.php       # New: Retry handling
│   ├── Unit/
│   │   ├── OrderStatusServiceTest.php
│   │   ├── StockServiceTest.php
│   │   └── SettingsServiceTest.php
│   └── Contract/
│       └── GraphQLOrderSchemaTest.php  # New: Schema validation
└── routes/
    └── console.php                  # Add stock sync command

frontend/
├── src/
│   ├── components/
│   │   ├── orders/
│   │   │   ├── OrderStatusBadge.tsx     # New: Display statuses
│   │   │   └── OrderTimeline.tsx        # New: History visualization
│   │   └── products/
│   │       └── StockIndicator.tsx       # New: Display availability
│   ├── lib/
│   │   ├── graphql/
│   │   │   ├── mutations/
│   │   │   │   └── order-status.ts      # New: Status updates
│   │   │   └── queries/
│   │   │       └── order-history.ts     # New: Audit trail
│   │   └── utils/
│   │       └── order-status-helpers.ts  # New: Status logic
│   ├── app/
│   │   └── [locale]/
│   │       └── orders/
│   │           └── [id]/
│   │               └── page.tsx         # Update: New statuses
│   └── types/
│       └── generated.ts             # Updated via codegen
└── messages/
    ├── en.json                      # Update: New status labels
    └── ar.json                      # Update: New status labels (Arabic)
```

```

**Structure Decision**: Web application structure (Option 2) with separate `backend/` and `frontend/` directories. Backend uses Laravel 11 with GraphQL API layer (Lighthouse) for frontend and POS system. Admin panel managed exclusively via Filament (no GraphQL). Frontend uses Next.js 15 with App Router. Communication via GraphQL for client-server and POS integration, Kafka for event streaming.

---

## Filament Admin Panel Implementation

### Admin Resources to Implement/Update

1. **SettingResource** (Update existing)
   - **Purpose**: Manage all system configuration
   - **Groups**: ORDER_MANAGEMENT, STOCK_MANAGEMENT, POS_INTEGRATION, NOTIFICATIONS, BUSINESS_HOURS
   - **Features**:
     - Form fields based on setting type (string, integer, boolean, json, select)
     - Validation rules per setting type
     - Group-based filtering and tabs
     - Cache invalidation on save
     - Bilingual descriptions (_en, _ar)
   - **Key Settings**:
     - `order_manager_type`: order_pos_manager | order_web_manager
     - `order_timeout_notification_seconds`: integer (notify admin if pending exceeds this)
     - `cancel_allowed_statuses`: json array of statuses
     - `default_stock_manager`: stock_pos_manager | stock_web_manager
     - `pos_stock_display_percentage_global`: 0-100 integer
     - `pos_api_key`: encrypted string

2. **FailedJobResource** (New)
   - **Purpose**: Dead-letter queue management
   - **List View**:
     - Columns: Job Type, Order/Product ID, Exception, Failed At, Retry Count
     - Filters: Category (order_sync, stock_sync, notification), Date range
     - Search by order ID or product ID
     - Bulk selection enabled
   - **Actions**:
     - **Retry** (single): Re-queue the failed job
     - **Retry Selected** (bulk): Re-queue multiple jobs
     - **Delete** (single): Remove from failed_jobs table
     - **View Details**: Show full exception stack trace and payload
   - **Widgets**: Dead-letter stats (total failed, today's failures, rate)

3. **OrderResource** (Update existing)
   - **Purpose**: Add POS integration fields and status history
   - **Form Additions**:
     - Read-only: `order_manager` (badge: POS-Controlled | Web-Controlled)
     - Read-only: `pos_order_id`, `pos_confirmed_at`
     - Read-only: `rejected_reason_en`, `rejected_reason_ar` (when status = rejected)
   - **Relation Managers**:
     - **OrderStatusHistoryRelationManager** (new): Read-only audit trail
       - Columns: Old Status, New Status, Actor Type, Actor, Reason, Created At
       - Timeline view showing status flow
       - No create/edit/delete actions (append-only)
   - **Actions** (conditional on order_manager):
     - **Update Status** (Web Manager only): Transition to next allowed status
     - **Cancel Order**: Available based on `cancel_allowed_statuses` setting
     - View order in frontend (opens customer-facing page)

4. **ProductResource** (Update existing)
   - **Purpose**: Stock management and POS integration
   - **Form Additions**:
     - `stock_manager`: select (stock_pos_manager | stock_web_manager)
     - `pos_stock_quantity`: read-only display (if POS-managed)
     - `pos_stock_display_percentage`: nullable integer 0-100 (per-product override)
     - `pos_stock_updated_at`: read-only timestamp
   - **Bulk Actions**:
     - **Pull Stock from POS**: Calls POS API for selected products
       - Makes HTTP request to `GET /api/products/{id}/stock`
       - Updates `pos_stock_quantity` and `pos_stock_updated_at`
       - Shows success notification with count
       - Handles errors gracefully (network issues, POS unavailable)
   - **Widgets**:
     - Stock Sync Status: Last sync time, sync health
     - Products needing sync (not synced in X hours)

5. **OrderStatusHistoryResource** (New - Optional)
   - **Purpose**: Global audit trail view (all orders)
   - **List View**:
     - Columns: Order ID, Old Status → New Status, Actor, Reason, Timestamp
     - Filters: Status, Actor Type, Date range
     - Search by order ID
     - No create/edit/delete (read-only)
   - **Relations**: Links to Order, Actor (User)
   - **Use Case**: Compliance reporting, debugging status issues

### Admin Panel Actions

1. **Timeout Notification Action** (Order resource)
   - Triggered automatically by scheduled command
   - Creates Filament notification for admin
   - Links directly to order in admin panel
   - Shows: Order ID, Customer, Pending duration
   - Admin can click to view/update order

2. **POS Stock Pull Action** (Product resource bulk)
   - Makes parallel HTTP requests to POS API
   - Endpoint: `GET {POS_BASE_URL}/api/products/{product_id}/stock`
   - Authentication: Bearer token from `pos_api_key` setting
   - Response format: `{"product_id": 1, "stock_quantity": 150}`
   - Updates database in transaction
   - Shows progress notification
   - Error handling: Individual product failures don't block others

### Admin Panel Widgets

1. **Order Manager Dashboard Widget**
   - Pie chart: POS-managed vs Web-managed orders (last 30 days)
   - Stats: Pending count, Timeout count, Rejection rate

2. **Stock Sync Health Widget**
   - Last successful sync timestamp
   - Products out of sync (> 24 hours old)
   - Quick action: "Sync All from POS"

3. **Failed Jobs Overview Widget**
   - Total failed jobs count
   - Failed jobs by category
   - Quick action: "Retry All Failed Jobs"

---

## Phase 0: Outline & Research

---

## Filament Admin Panel Implementation

### Admin Resources to Implement

1. **SettingResource** (Update existing)
   - Configuration groups: ORDER_MANAGEMENT, STOCK_MANAGEMENT, POS_INTEGRATION, NOTIFICATIONS
   - Form fields for each setting type (string, integer, boolean, json, select)
   - Validation rules based on setting type
   - Group-based filtering and organization
   - Cache invalidation on save

2. **FailedJobResource** (New)
   - List view with category filtering (order_sync, stock_sync, notification)
   - Detail view showing payload, exception, and attempt count
   - Bulk actions: Retry All, Retry by Category, Flush All
   - Single record actions: Retry, Delete
   - Statistics widget: total failed, failed today, dead-letter rate
   - Search by order_id or product_id

3. **OrderResource** (Update existing)
   - Add status history relation manager (read-only table)
   - Show POS order ID when available
   - Display rejection reasons (bilingual)
   - Action: "View Status Timeline" (modal with history)
   - Filter by order_manager (pos/web)
   - Timeout notification badge for pending orders

4. **OrderStatusHistoryResource** (New - optional standalone)
   - Read-only audit log view
   - Filter by order, actor_type, status
   - Display actor details (user/admin name or "external"/"system")
   - Show reason field (bilingual)
   - Export to CSV for compliance

### Admin Actions

1. **Pull Stock from POS** (ProductResource action)
   - Button on product edit page or bulk action on list
   - Calls POS API endpoint to fetch current stock
   - Updates `pos_stock_quantity` and `pos_stock_updated_at`
   - Shows success/failure notification
   - Logs action in activity log

2. **Retry Failed Job** (FailedJobResource)
   - Single retry action with confirmation
   - Category-based bulk retry (e.g., all order_sync failures)
   - Retry all with warning modal
   - Shows progress bar for bulk operations

3. **Notify Admin on Timeout** (Dashboard notification)
   - Dashboard widget showing pending orders exceeding timeout
   - Click to view order details
   - Manual "Mark as Reviewed" action
   - Email digest sent daily with pending order summary

### Form Configuration Examples

**SettingResource Form Fields**:
```php
Forms\Components\Select::make('order_manager_type')
    ->options([
        'order_pos_manager' => 'POS Manager',
        'order_web_manager' => 'Web Manager',
    ])
    ->required();

Forms\Components\TextInput::make('pending_order_timeout_minutes')
    ->numeric()
    ->suffix('minutes')
    ->helperText('Time before admin notification for pending orders')
    ->required();

Forms\Components\CheckboxList::make('cancel_allowed_statuses')
    ->options(OrderStatus::class)
    ->columns(3);
```

**FailedJobResource Table**:
```php
Tables\Columns\TextColumn::make('job_type')
    ->badge()
    ->color(fn ($state) => match($state) {
        'order_sync' => 'danger',
        'stock_sync' => 'warning',
        default => 'gray',
    });

Tables\Columns\TextColumn::make('failed_at')
    ->dateTime()
    ->sortable();
```

---

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:

The /tasks command will generate an ordered, atomic task list following TDD principles (Test-First Development). Tasks will be structured to:

1. **Contract Tests First** (Phase 3A): Validate GraphQL schema compliance
   - Validate enum definitions match OrderStatus cases
   - Test schema introspection for new types (OrderStatusHistory, FailedJob, etc.)
   - Validate @rules directives on inputs
   - Validate @can directives on mutations
   - Mark as [P] (parallel execution) - 5 contract test tasks

2. **Database Migrations** (Phase 3B): Create schema changes
   - Update OrderStatus enum with new values
   - Add order management fields to orders table
   - Add product stock fields to products table  
   - Create order_status_history table with indexes
   - Seed communication settings
   - Mark as [P] where safe (independent tables) - 5 migration tasks

3. **Model Layer** (Phase 3C): Eloquent models and relationships
   - Update Order model (fields, casts, relationships, accessors)
   - Create OrderStatusHistory model with factory
   - Update Product model (stock fields, accessors for displayed_stock)
   - Create OrderObserver for history tracking
   - Mark as [P] (independent models) - 4 model tasks

4. **Service Layer Tests** (Phase 3D): Unit tests for business logic
   - OrderStatusService tests (transition validation)
   - StockService tests (Web/POS managers, percentage calculation)
   - SettingsService tests (type coercion, caching, defaults)
   - KafkaService tests (event publishing, payload structure)
   - NotificationService tests (channel selection, admin routing)
   - Sequential (test dependencies) - 5 service test tasks

5. **Service Layer Implementation** (Phase 3E): Make tests pass
   - Create OrderStatusService (validateTransition, recordHistory)
   - Create StockService with manager pattern (WebStockManager, PosStockManager)
   - Create SettingsService (cached getters, type casting)
   - Update KafkaService (order events, stock events)
   - Create NotificationService (admin emails, user notifications)
   - Sequential (implement after tests fail) - 5 service tasks

6. **GraphQL Resolver Tests** (Phase 3F): Integration tests for API
   - Order queries/mutations tests (updateOrderStatus, cancelOrder)
   - POS mutations tests (posAcceptOrder, posRejectOrder, posUpdateOrderStatus)
   - Product queries tests (checkStockAvailability, displayed_stock)
   - Settings queries tests (publicSettings, config aggregators)
   - Sequential (API integration) - 5 resolver test tasks

7. **GraphQL Resolvers** (Phase 3G): Implement API layer
   - Create UpdateOrderStatus mutation (for internal/admin use via Filament)
   - Create CancelOrder mutation (customer action)
   - Create POS mutations (PosAcceptOrder, PosRejectOrder, PosUpdateOrderStatus)
   - Create Product field resolvers (displayedStock, isInStock)
   - Create Config query resolvers (orderManagementConfig, etc.)
   - Sequential (implement after tests) - 5 resolver tasks

8. **Jobs & Commands** (Phase 3H): Background processing
   - Create ProcessOrderTimeout job with tests
   - Create SyncStockFromPOS job with tests
   - Create RetryFailedSync job with tests
   - Create Kafka consumer command for stock updates
   - Sequential (infrastructure dependencies) - 4 job tasks

9. **POS Integration** (Phase 3I): GraphQL mutations and authentication
   - Create POS authentication guard (Auth::viaRequest)
   - Configure Lighthouse POS guard in config
   - Create POS GraphQL mutations with tests
   - Test authentication failure scenarios
   - Sequential (API layer) - 4 integration tasks

10. **Frontend Components** (Phase 3J): UI implementation
    - Create OrderStatusBadge component (bilingual labels)
    - Create OrderTimeline component (history visualization)
    - Create StockIndicator component (displayed_stock)
    - Update order detail page with new statuses
    - Mark as [P] where components independent - 4 frontend tasks

11. **Integration Tests** (Phase 3K): End-to-end scenarios
    - Test order lifecycle: pending → processing → completed (POS Manager)
    - Test order rejection flow with notifications
    - Test timeout notification without auto-transition
    - Test stock sync from Kafka events
    - Test cancellation rule enforcement
    - Test dead-letter retry mechanism
    - Sequential (full system integration) - 6 integration tasks

12. **Filament Admin** (Phase 3L): Admin UI resources
    - Update SettingResource with new config groups
    - Create/Update FailedJobResource with retry actions
    - Add order status history relation manager to OrderResource
    - Create OrderStatusHistoryResource (read-only audit view)
    - Test admin permissions for all operations
    - Mark as [P] (independent resources) - 5 admin tasks

13. **Validation & Cleanup** (Phase 3M): Final checks
    - Run lighthouse:validate-schema
    - Run npm run codegen
    - Run vendor/bin/pint --dirty
    - Run full test suite with coverage
    - Execute quickstart.md scenarios
    - Update translations (en.json, ar.json)
    - Sequential (quality gates) - 6 validation tasks

**Ordering Strategy**:
- **TDD Cycle**: Test → See fail → Implement → See pass → Refactor
- **Dependency Order**: Migrations → Models → Services → Resolvers → Integration
- **Parallel Markers [P]**: Independent file creation (contracts, migrations, models, components)
- **Sequential**: Business logic, integration, validation (must wait for dependencies)

**Estimated Task Count**: ~60-65 atomic tasks

**Task Metadata**:
- Each task includes: ID, title, description, dependencies, test command, file paths
- Test-first tasks marked with **[TEST]** prefix
- Implementation tasks reference failing test ID
- Validation tasks include success criteria
- **Filament tasks** for admin UI (no GraphQL for admin operations)
- **POS tasks** use GraphQL mutations with `@guard(with: ["pos"])`

**Example Task Structure**:
```markdown
### Task 15: [TEST] OrderStatusService Transition Validation

**Type**: Unit Test  
**Dependencies**: Task 10 (OrderStatusHistory model)  
**Files**: tests/Unit/OrderStatusServiceTest.php

**Description**: Write failing tests for OrderStatusService transition validation logic

**Test Cases**:
- Validate allowed transitions (pending → processing, processing → out_for_delivery)
- Reject invalid transitions (processing → pending, completed → anything)
- Require rejection reason when transitioning to rejected status
- Allow manual regression only in Web Manager mode

**Test Command**: php artisan test --filter=OrderStatusServiceTest

**Expected Outcome**: All tests fail with "Class OrderStatusService not found"
```

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan. The /plan command STOPS here.

**Estimated Output**: `specs/002-title-web-pos/tasks.md` with ~60-65 numbered, ordered tasks ready for implementation.

**Key Architecture Notes**:
- **Admin Operations**: Exclusively via Filament resources (settings, failed jobs, order management, stock pull actions)
- **GraphQL API**: Serves frontend (Next.js) and POS system only (no admin GraphQL)
- **POS Authentication**: Custom guard using `Auth::viaRequest` with API key
- **POS Mutations**: Protected with `@guard(with: ["pos"])` directive in schema (order acceptance, rejection, status updates)
- **Stock Synchronization**: Admin triggers "Pull from POS" action in Filament → calls POS API → updates web database
- **Timeout Notification**: Scheduled command checks pending orders older than configured timeout → notifies admin (order stays pending)
- **Fresh System**: No legacy migration, all entities designed from scratch

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS (no new violations)
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (N/A - none required)

**Artifacts Generated**:
- ✅ research.md (Phase 0 - all decisions documented, POS uses GraphQL not REST)
- ✅ data-model.md (Phase 1 - entities, relationships, validation)
- ✅ contracts/*.graphql (Phase 1 - API schemas: orders, products, settings, pos)
- ✅ quickstart.md (Phase 1 - validation scenarios with GraphQL mutations)
- ✅ .github/copilot-instructions.md (Phase 1 - agent context updated)
- ⏳ tasks.md (Phase 2 - awaiting /tasks command)

**Architecture Clarifications**:
- 🎯 GraphQL serves: Frontend (Next.js) + POS system (with API key guard)
- 🎯 Admin panel: Filament resources only (no GraphQL for admin operations)
- 🎯 POS API: GraphQL mutations (posAcceptOrder, posRejectOrder, posUpdateOrderStatus)
- 🎯 Dead-letter management: Filament FailedJobResource (not GraphQL)

**Ready for**: `/tasks` command to generate implementation task list

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
