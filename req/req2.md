# Order Placement & Lifecycle Requirements (Draft)

---

## 1. Domain Overview
An Order transitions across a constrained lifecycle driven by payment method, stock validation and explicit domain actions (NOT a generic update-status endpoint). Stock must only be consumed (physical deduction) when the order leaves preparation and is Out For Delivery. Online payment introduces asynchronous success/failure handling and potential refunds. Cancellation / return are governed by strict state + payment method rules.

## 2. Core Statuses (Current Enum Alignment)
Existing `OrderStatus` enum already contains:

| Status | Meaning | Notes |
|--------|---------|-------|
| pending | Order created but unpaid (online failure) OR waiting manual confirmation | No stock reserved yet unless strategy does so pre-confirmation. |
| processing | Stock is RESERVED (not yet deducted). Items being prepared. | Cancellation still allowed (with refund logic for online). |
| out_for_delivery | Stock consumption occurs here (quantity physically reduced). | Cancellation typically blocked (business optional) except admin emergency. |
| completed | Delivered to customer. | Returns workflow (future). |
| cancelled | Order fully voided. | Refund may be required. |
| rejected | (Legacy / optional) explicit rejection case. | Evaluate if still needed. |

## 3. Placement Logic by Payment Method

### 3.1 Cash (CASH_ON_DELIVERY)
Flow:
1. Validate stock sufficiency for all items.
2. If any item insufficient → REJECT placement (fail fast) (no partial acceptance now).
3. Create order with status = `processing` directly (or `pending` then immediately transition—prefer direct to simplify) and reserve stock (via reservation view logic, not hard decrement).
4. Notify user: order accepted & processing.
5. User/Admin may cancel while status = processing (no refund needed).

### 3.2 Online (CREDIT_CARD / WALLET)
Two branches depending on payment gateway outcome.

Success Case:
1. Gateway success + stock still sufficient at commit time (REVALIDATE before transition!).
2. Set status = `processing`.
3. Mark payment status = paid (existing `PaymentStatus`).
4. Reserve stock (not deduct yet).
5. User/Admin may cancel while status = processing → trigger refund process (TODO implement later) if payment already captured.
6. Add `// TODO: implement refund orchestration` placeholder in cancellation handler.

Failure Case:
1. Payment fails or user abandons → create order with status = `pending`, payment_status = failed/unpaid.
2. No stock reservation yet.
3. User can change payment method (only while pending).
4. Admin can cancel (status → cancelled) (no refund needed).

## 4. Cancellation Rules
| Actor | Allowed Statuses | Additional Conditions | Effects |
|-------|------------------|-----------------------|---------|
| User | processing (cash/online) | Not yet out_for_delivery/completed/cancelled | If online paid → mark refund needed (TODO). |
| User | pending (online failure case) | Payment not captured | Simple cancel. |
| Admin | pending, processing | Business override | If paid → refund path (TODO). |
| Admin (exception) | out_for_delivery | Only if emergency policy | Might require manual reverse logistics + refund. (Future) |

No cancellation once `completed` (use return flow later) or already `cancelled`.

## 5. Stock Handling Model
We introduce a clearer distinction:
- Reservation Phase: while `processing` — quantities reserved logically (derived using a DB view) but not decremented.
- Consumption Phase: at transition to `out_for_delivery` — actual decrement of product quantity.

### 5.1 Product Table Changes
Add columns (migration):
```
unit (string)            // e.g., 'packet', 'kg' (enum wrapper)
is_stockable (boolean)   // whether stock logic applies
stock_manager (string)   // strategy key (e.g., 'simple', 'per_batch', future extension)
pos_stock_display_percentage (unsigned tiny int nullable) // % threshold to show low stock in POS UI
```
Create PHP Enums:
- `ProductUnit: packet, kg` (extensible) → used in casts.
- `StockManagerStrategy` (string backed) for future composite/strategy interplay.

### 5.2 Reservation View
Create a DB VIEW: `product_stock_overview` with columns:
| product_id | quantity | unit | reserved | available |
Definitions:
- quantity: base on `products.quantity` (rename if conflicting) 
- reserved: `SUM(order_items.quantity)` for order_items joined to orders where orders.order_status = processing
- available: `quantity - reserved`

NOTE: Only include rows for `is_stockable = true` 

### 5.3 Validation Points
- On placeOrder (both methods) → check all items: `available >= requested`.
- On payment success (online) right before setting status processing (recheck race). If insufficient now → mark order `rejected` (or keep `pending` & notify user) and initiate refund if payment captured (edge case) (TODO: refund path design).
- On transition `processing -> out_for_delivery` → recheck + then decrement actual product stock inside transaction.

### 5.4 Race Condition Mitigation
- Use `SELECT ... FOR UPDATE` (where supported) / pessimistic locking on involved product rows during critical transition (processing → out_for_delivery + payment success commit step).
- Keep transitions atomic in a DB transaction.

## 6. Domain Actions (No Generic updateStatus)
| Action | Purpose | Pre-conditions | Side Effects | Notifications |
|--------|---------|---------------|--------------|--------------|
| placeOrder | Create order & initial status | Stock sufficient; cart valid | Reserve (logical) if processing; set payment intent if online | OrderPlaced |
| confirmOrder | (If needed in some strategies) escalate pending→processing | Revalidate stock | Reserve logical | OrderUpdated |
| cancelOrder | Cancel order | Allowed by rules table | Maybe mark refund-needed | OrderCancellation |
| outForDelivery | Move processing→out_for_delivery | Stock revalidated OK | Decrement physical stock | OrderStatusChange |
| completeOrder | out_for_delivery→completed | Delivery confirmed | None now (future: loyalty points) | OrderCompleted |

Remove/avoid generic `updateOrderStatus` usage where domain semantics exist; replace with purpose-specific methods.

## 7. Payment Failure Recovery
- While status = pending (unpaid) user can: change payment method → re-attempt pay; or cancel.
- If user switches from online→cash and stock still sufficient → move to processing.
- Expiration job (future) could auto-cancel stale pending orders (configurable TTL).

## 8. Refund Handling (Deferred TODO)
Placeholder only now:
```
// TODO: implement refund pipeline
// Steps: create RefundRequest record, enqueue job, call gateway, update payment_status (refunded/partial), notify user
```
Add boolean/computed `needs_refund` already present (reuse) to drive admin dashboards.

## 9. Edge Cases & Error Modes
- Stock changed between payment init and success → reject & refund.
- Partial stock unavailability (some items) → current rule: fail entire order (future: split shipments). Documented for clarity.
- Double action (user spam cancels) → idempotent guard: check current status first.
- Concurrency: two orders draining same low stock → last committer fails transition with domain exception.
- Non-stockable products mixed with stockable: only validate stockable lines.

## 10. Data Model / Migration Sketch
```
Schema::table('products', function (Blueprint $t) {
		$t->string('unit')->default('packet');
		$t->boolean('is_stockable')->default(true);
		$t->string('stock_manager')->default('simple');
		$t->unsignedTinyInteger('pos_stock_display_percentage')->nullable();
});
```
Add Enums & casts on Product model.

View creation (migration raw SQL example):
```
DB::statement(<<<SQL
CREATE OR REPLACE VIEW product_stock_overview AS
SELECT
	p.id AS product_id,
	p.quantity,
	p.unit,
	COALESCE( (
			SELECT SUM(oi.quantity)
			FROM order_items oi
			JOIN orders o ON o.id = oi.order_id
			WHERE oi.product_id = p.id AND o.order_status = 'processing'
	), 0) AS reserved,
	(p.quantity - COALESCE( (
			SELECT SUM(oi.quantity)
			FROM order_items oi
			JOIN orders o ON o.id = oi.order_id
			WHERE oi.product_id = p.id AND o.order_status = 'processing'
	), 0)) AS available
FROM products p
WHERE p.is_stockable = 1;
SQL);
```

## 11. Service Refactor Guidance
Existing `OrderService` uses a strategy pattern. Replace/augment `updateOrderStatus` usages by introducing explicit methods inside each strategy implementing the domain actions. Provide interface:
```
interface OrderLifecycleInterface {
	public function placeOrder(User $user, array $data, ?string $promotionCode = null): Order;
	public function cancel(Order $order, ?string $reason = null): void;
	public function markOutForDelivery(Order $order): void;
	public function complete(Order $order): void;
	public function changePaymentMethod(Order $order, PaymentMethod $method): void;
}
```


## 13. Acceptance Criteria (Phase 1)
- Cash order with sufficient stock → immediately processing.
- Online paid success with sufficient stock → processing.
- Online payment failure → pending; user can switch payment method or cancel.
- Cancellation while processing (cash) → no refund flag.
- Cancellation while processing (online paid) → refund TODO marker executed (flag set, no gateway call yet).
- Transition to out_for_delivery decrements stock exactly once (idempotent tested).
- Attempt to out_for_delivery with insufficient stock → domain exception + no state change.

---

## 14. Composite Pattern Proposal (Future Enhancement)
Goal: Model complex order item handling (bundles, variable weight, promotions) and stock operations cleanly. Composite lets us treat a single order line or a hierarchical bundle uniformly.

### 14.1 Structure
```
interface StockComponent {
	public function ensureAvailable(): void;            // throws Domain\OutOfStockException
	public function reserveLogical(): void;             // lightweight reservation (no decrement)
	public function consume(): void;                    // decrement physical stock
	public function releaseReservation(): void;         // on cancel
	public function getQuantity(): int|float;           // normalized base unit
}

class SimpleProductComponent implements StockComponent { /* handles single product */ }
class WeightedProductComponent implements StockComponent { /* handles kg fractional logic */ }
class BundleComponent implements StockComponent {
	 /** @var StockComponent[] */
	 public function __construct(private array $children) {}
	 // iterate children delegating calls
}
```

### 14.2 Integration Points
- During placeOrder: build a composite tree from cart lines; call `ensureAvailable()` then `reserveLogical()`.
- During cancellation: traverse & `releaseReservation()`.
- During outForDelivery: traverse & `consume()` inside transaction.

### 14.3 Advantages
- Extensible for future stock manager strategies (batch, serial numbers).
- Uniform error handling + easier unit testing (mock StockComponent).
- Cleaner separation from persistence models (SRP adherence).

### 14.4 Implementation Steps (Later)
1. Introduce interfaces + base abstract class with shared helpers.
2. Add factory `StockComponentFactory::fromOrder(Order $order): StockComponent` building a root composite.
3. Refactor strategy methods to use composite operations.
4. Add unit tests for bundle and weighted logic.

---

## 15. Open Questions / Decisions Needed
- Do we retain `rejected` vs using `pending` + error code when stock fails after payment? rejected
- Are emergency cancellations after out_for_delivery permitted? yes it should make a return request
- Should we implement an eventual consistency projection for stock (e.g., using events) instead of DB view? (Current: view is acceptable.)

---

End of document.

