# Quickstart Guide: Web–POS Communication Service

**Feature**: 002-title-web-pos  
**Branch**: `002-title-web-pos`  
**Date**: 2025-10-02

## Purpose
This guide provides step-by-step instructions to validate the Web–POS communication feature after implementation. It covers all primary user scenarios from the feature specification.

---

## Prerequisites

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Run migrations
php artisan migrate

# Seed configuration settings
php artisan db:seed --class=CommunicationSettingsSeeder

# Start Laravel development server
php artisan serve --host=0.0.0.0

# Start queue worker (separate terminal)
php artisan queue:work --tries=3 --backoff=30

# Start Kafka consumer for stock updates (separate terminal)
php artisan kafka:consume products.stock.updated
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Regenerate GraphQL types
npm run codegen

# Start Next.js development server
npm run dev
```

### Test Environment Configuration
```bash
# Set POS Manager mode for testing
php artisan tinker
>>> Setting::where('key', 'order_manager_type')->update(['value' => 'order_pos_manager']);
>>> exit

# Generate POS API key
php artisan tinker
>>> config(['pos.api_key' => Str::random(64)]);
>>> echo config('pos.api_key');
```

---

## Test Scenarios

### Scenario 1: Order Lifecycle (POS Manager Mode)

**User Story**: Operations manager needs orders to flow through POS system for fulfillment

**Steps**:

1. **Create Order** (via GraphQL or frontend)
   ```graphql
   mutation {
     createOrder(input: {
       user_id: 1
       items: [{ product_id: 1, quantity: 2 }]
       total_amount: 100.00
     }) {
       id
       status
       order_manager
       created_at
     }
   }
   ```
   
   **Expected**:
   - Order created with `status: "pending"`
   - Order manager set to `order_pos_manager`
   - Kafka event published to `orders.created` topic
   - Order appears in admin dashboard

2. **Verify Kafka Event** (check logs)
   ```bash
   tail -f storage/logs/kafka.log | grep "orders.created"
   ```
   
   **Expected**:
   - Log entry showing event publication
   - Payload includes order ID, customer data, items

3. **Simulate POS Acceptance** (via GraphQL mutation)
   ```bash
   curl -X POST http://localhost:8000/graphql \
     -H "Authorization: Bearer YOUR_POS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "mutation($input: PosAcceptOrderInput!) { posAcceptOrder(input: $input) { success message order { id status pos_order_id pos_confirmed_at } } }",
       "variables": {
         "input": {
           "order_id": "1",
           "pos_order_id": "POS-2025-001"
         }
       }
     }'
   ```
   
   **Expected**:
   - HTTP 200 response
   - Order status updated to `processing`
   - `pos_order_id` stored
   - `pos_confirmed_at` timestamp set
   - Status history record created

4. **Query Order Status**
   ```graphql
   query {
     order(id: "ORDER_ID") {
       status
       pos_order_id
       pos_confirmed_at
       status_history {
         old_status
         new_status
         actor_type
         created_at
       }
     }
   }
   ```
   
   **Expected**:
   - Status shows `processing`
   - History shows: `null → pending → processing`
   - Actor types: `system`, `external`

5. **Advance to Out for Delivery**
   ```bash
   curl -X POST http://localhost:8000/graphql \
     -H "Authorization: Bearer YOUR_POS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "mutation($input: PosUpdateOrderStatusInput!) { posUpdateOrderStatus(input: $input) { success message order { status } } }",
       "variables": {
         "input": {
           "order_id": "ORDER_ID",
           "new_status": "out_for_delivery"
         }
       }
     }'
   ```
   
   **Expected**:
   - Status updated to `out_for_delivery`
   - Customer notification sent (database + push)

6. **Complete Order**
   ```bash
   curl -X POST http://localhost:8000/graphql \
     -H "Authorization: Bearer YOUR_POS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "mutation($input: PosUpdateOrderStatusInput!) { posUpdateOrderStatus(input: $input) { success message order { status } } }",
       "variables": {
         "input": {
           "order_id": "ORDER_ID",
           "new_status": "completed"
         }
       }
     }'
   ```
   
   **Expected**:
   - Status updated to `completed` (terminal state)
   - Customer completion notification sent
   - No further status changes allowed

---

### Scenario 2: Order Rejection by POS

**User Story**: POS system rejects an order (out of stock, closed, etc.)

**Steps**:

1. **Create Order** (as in Scenario 1)

2. **Simulate POS Rejection**
   ```bash
   curl -X POST http://localhost:8000/graphql \
     -H "Authorization: Bearer YOUR_POS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "mutation($input: PosRejectOrderInput!) { posRejectOrder(input: $input) { success message order { status rejected_reason } } }",
       "variables": {
         "input": {
           "order_id": "ORDER_ID",
           "reason_en": "Product out of stock at POS",
           "reason_ar": "المنتج غير متوفر في نقاط البيع"
         }
       }
     }'
   ```
   
   **Expected**:
   - Order status updated to `rejected`
   - `rejected_reason_en` and `rejected_reason_ar` stored
   - Customer notification sent with reason
   - Admin notification sent

3. **Verify Frontend Display**
   - Navigate to order detail page
   - Verify rejected badge shows
   - Verify reason displayed in user's language

---

### Scenario 3: Order Timeout Notification

**User Story**: Admin notified when POS doesn't respond within timeout period

**Steps**:

1. **Configure Short Timeout** (for testing)
   ```php
   php artisan tinker
   >>> Setting::where('key', 'pos_auto_confirm_timeout')->update(['value' => 300]); // 5 minutes
   ```

2. **Create Order** (don't send POS callback)

3. **Wait 5+ Minutes** or **Trigger Manually**
   ```bash
   php artisan schedule:run --no-interaction
   # Or directly run the job
   php artisan tinker
   >>> dispatch(new \App\Jobs\ProcessOrderTimeout);
   ```
   
   **Expected**:
   - Email sent to admin addresses in `admin_notification_emails` setting
   - `timeout_notified_at` timestamp set on order
   - Order remains in `pending` status (no auto-transition)

4. **Verify Email Content**
   - Check `storage/logs/laravel.log` or Mailtrap/local mail catcher
   - Email should contain: order ID, customer name, pending duration, action link

5. **Simulate Late Acceptance**
   ```bash
   curl -X POST http://localhost:8000/graphql \
     -H "Authorization: Bearer YOUR_POS_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "query": "mutation($input: PosAcceptOrderInput!) { posAcceptOrder(input: $input) { success message } }",
       "variables": {
         "input": {
           "order_id": "ORDER_ID",
           "pos_order_id": "POS-12345"
         }
       }
     }'
   ```
   
   **Expected**:
   - Order transitions to `processing` despite timeout
   - Notification email remains as historical alert

---

### Scenario 4: Stock Synchronization from POS

**User Story**: Inventory staff sees real-time stock updates from POS on frontend

**Steps**:

1. **Configure POS Stock Manager**
   ```php
   php artisan tinker
   >>> Product::find(1)->update([
       'stock_manager' => 'stock_pos_manager',
       'pos_stock_quantity' => 100,
       'pos_stock_display_percentage' => 70, // Show only 70%
   ]);
   ```

2. **Verify Initial Display**
   ```graphql
   query {
     product(id: 1) {
       quantity
       pos_stock_quantity
       displayed_stock  # Should be 70 (100 * 70%)
       is_in_stock      # Should be true
       stock_manager
     }
   }
   ```

3. **Simulate Kafka Stock Update**
   ```bash
   # Using tinker to simulate Kafka consumer receiving message
   php artisan tinker
   >>> $payload = [
       'product_id' => 1,
       'stock_quantity' => 50,
       'updated_at' => now()->toIso8601String(),
   ];
   >>> app(\App\Services\StockService::class)->updateFromPOS($payload);
   ```
   
   **Expected**:
   - `pos_stock_quantity` updated to 50
   - `displayed_stock` now 35 (50 * 70%)
   - `pos_stock_updated_at` timestamp refreshed

4. **Verify Frontend Updates**
   - Reload product page
   - Stock indicator shows 35 available
   - Last updated timestamp displayed

5. **Test Global Percentage Override**
   ```php
   php artisan tinker
   >>> Setting::where('key', 'pos_stock_display_percentage_global')->update(['value' => 80]);
   >>> Product::find(1)->update(['pos_stock_display_percentage' => null]); // Use global
   ```
   
   **Expected**:
   - Displayed stock now 40 (50 * 80%)

---

### Scenario 5: User Cancellation Rules

**User Story**: Customer can cancel order only in allowed statuses

**Steps**:

1. **Create Order and Advance to Processing**

2. **Configure Cancellation Rules**
   ```php
   php artisan tinker
   >>> Setting::where('key', 'cancel_allowed_statuses')->update([
       'value' => json_encode(['pending', 'processing'])
   ]);
   >>> Setting::where('key', 'user_can_cancel_order')->update(['value' => 'true']);
   ```

3. **Test Cancellation (as customer)**
   ```graphql
   mutation {
     cancelOrder(input: {
       order_id: "ORDER_ID"
       reason_en: "Changed my mind"
       reason_ar: "غيرت رأيي"
     }) {
       success
       message
       order {
         status
       }
     }
   }
   ```
   
   **Expected**:
   - Success response
   - Order status changed to `cancelled`
   - Notification sent to customer and admin

4. **Test Late Cancellation (Out for Delivery)**
   ```bash
   # First advance order
   curl -X POST http://localhost:8000/api/pos/callback ... "status": "out_for_delivery" ...
   
   # Then try to cancel (should fail)
   ```
   
   **Expected**:
   - Error message: "Order cannot be cancelled in current status"
   - Order remains `out_for_delivery`

------

### Scenario 6: Dead-Letter Queue Management

**User Story**: Admin reviews and retries failed synchronization attempts via Filament

**Steps**:

1. **Simulate Failed Job**
   ```php
   php artisan tinker
   >>> dispatch(new \App\Jobs\ProcessPOSCallback([
       'order_id' => 999999, // Non-existent order
       'event_type' => 'order.accepted',
   ]));
   >>> exit
   ```

2. **Wait for Job Failure** (after 3 retries)
   ```bash
   php artisan queue:failed
   ```

3. **Review Failed Jobs in Filament**
   - Navigate to Filament admin panel → Failed Jobs resource
   - View failed job details:
     - Job type (order sync, Kafka publish)
     - Related order ID
     - Exception message  
     - Failed timestamp
     - Retry count
   - Filter by job type or date range

4. **Retry Failed Job**
   - Select failed job in Filament table
   - Click "Retry" action button
   - Or use bulk action to retry multiple jobs

5. **Verify Retry Success**
   - Fix root cause (e.g., restore Kafka connection)
   - Restart queue worker: `php artisan queue:restart`
   - Check queue logs for successful processing
   - Verify job removed from failed_jobs:
     ```bash
     php artisan queue:failed
     ```
   - Check Filament notifications for success message

---

## Troubleshooting
       deleted_count
     }
   }
   ```

---

### Scenario 8: Manual Stock Sync Trigger

**User Story**: Admin triggers full stock resync from POS on demand

**Steps**:

1. **Trigger Sync via GraphQL**
   ```graphql
   mutation {
     syncStockFromPOS {
       success
       message
       synced_count
       failed_count
       started_at
     }
   }
   ```
   
   **Expected**:
   - Background job dispatched
   - Response indicates sync started
   - Job processes all POS-managed products

2. **Monitor Sync Progress**
   ```bash
   # Check queue worker output
   tail -f storage/logs/laravel.log | grep "SyncStockFromPOS"
   ```

3. **Verify Results**
   ```graphql
   query {
     products(stock_manager: stock_pos_manager, first: 10) {
       data {
         id
         name
         pos_stock_quantity
         pos_stock_updated_at
       }
     }
   }
   ```
   
   **Expected**:
   - All products show recent `pos_stock_updated_at` timestamp

---

## Validation Checklist

### Backend Validation

- [ ] All GraphQL schema validated: `php artisan lighthouse:validate-schema`
- [ ] All tests passing: `php artisan test --filter=OrderLifecycle`
- [ ] Code formatted: `vendor/bin/pint --dirty`
- [ ] Kafka consumer running without errors
- [ ] Queue worker processing jobs successfully
- [ ] Failed jobs handled gracefully (3 retries + dead-letter)

### Frontend Validation

- [ ] Types regenerated: `npm run codegen`
- [ ] Order status badges display correctly (all 6 statuses)
- [ ] Status history timeline renders
- [ ] Stock indicators show computed values
- [ ] Cancellation button respects configuration
- [ ] Bilingual content displays correctly (en/ar)
- [ ] Admin dead-letter dashboard functional

### Integration Validation

- [ ] POS callback endpoint accepts valid requests (HTTP 200)
- [ ] POS callback rejects invalid API keys (HTTP 401)
- [ ] Kafka events published for order creation
- [ ] Stock updates received via Kafka consumer
- [ ] Idempotency prevents duplicate processing
- [ ] Timeout notifications sent to admins
- [ ] Terminal states prevent further transitions

### Performance Validation

- [ ] Order status query <500ms
- [ ] Stock computation <100ms (accessor)
- [ ] Failed jobs dashboard loads <1s (paginated)
- [ ] Kafka message processing <2s per event
- [ ] Database indexes utilized (check EXPLAIN queries)

---

## Troubleshooting

### Issue: Kafka Consumer Not Receiving Messages

**Solution**:
```bash
# Check Kafka connection
php artisan tinker
>>> app(\App\Services\KafkaService::class)->testConnection();

# Verify topic exists
php artisan kafka:list-topics

# Restart consumer with debug logging
php artisan kafka:consume products.stock.updated --verbose
```

### Issue: POS GraphQL Mutation Returns 401 Unauthorized

**Solution**:
```bash
# Verify API key configuration
php artisan tinker
>>> config('pos.api_key');

# Check POS guard is registered
php artisan tinker
>>> config('auth.guards.pos');

# Test POS authentication
curl -X POST http://localhost:8000/graphql \
  -H "Authorization: Bearer YOUR_POS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query": "query { posSystemInfo { order_manager_type api_version } }"}'
```

### Issue: Orders Stuck in Pending

**Solution**:
```bash
# Check timeout configuration
php artisan tinker
>>> Setting::where('key', 'pos_auto_confirm_timeout')->value('value');

# Manually trigger timeout job
php artisan schedule:run

# Check for failed callbacks
php artisan queue:failed
```

### Issue: Stock Display Incorrect

**Solution**:
```php
php artisan tinker
>>> $product = Product::find(1);
>>> $product->pos_stock_quantity; // POS stock
>>> $product->pos_stock_display_percentage ?? app(\App\Services\SettingsService::class)->get('pos_stock_display_percentage_global');
>>> floor($product->pos_stock_quantity * ($percentage / 100)); // Expected
```

---

## Clean-Up (After Testing)

```bash
# Reset configuration to production defaults
php artisan tinker
>>> Setting::where('key', 'order_manager_type')->update(['value' => 'order_web_manager']);
>>> Setting::where('key', 'pos_auto_confirm_timeout')->update(['value' => 3600]);
>>> exit

# Clear test data
php artisan tinker
>>> Order::where('created_at', '>', now()->subHour())->delete();
>>> OrderStatusHistory::where('created_at', '>', now()->subHour())->delete();

# Flush failed jobs
php artisan queue:flush

# Clear Kafka logs
rm storage/logs/kafka.log
```

---

## Success Criteria

All scenarios completed successfully:
- ✅ Order lifecycle flows through all statuses
- ✅ POS acceptance/rejection processed correctly
- ✅ Timeout notifications sent without auto-transition
- ✅ Stock updates synchronized in real-time
- ✅ Cancellation rules enforced
- ✅ Idempotency prevents duplicates
- ✅ Dead-letter queue manageable via admin UI
- ✅ Manual stock sync functional

**Feature Status**: ✅ VALIDATED | ❌ ISSUES FOUND

---

**Next Steps**: If all validations pass, create pull request for code review. If issues found, document in GitHub Issues and address before merging.
