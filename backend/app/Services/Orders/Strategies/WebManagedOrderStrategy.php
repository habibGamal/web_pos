<?php

namespace App\Services\Orders\Strategies;

use App\DTOs\OrderPlacementData;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Orders\Contracts\OrderStrategyInterface;
use App\Services\Payments\PaymentService;
use App\Services\Stock\StockService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class WebManagedOrderStrategy implements OrderStrategyInterface
{
    public function __construct(
        protected CartService $cartService,
        protected PaymentService $paymentService,
        protected StockService $stockService
    ) {
    }

    /**
     * Place a new order with stock validation.
     */
    public function placeOrder(User $user, OrderPlacementData $placementData): Order
    {
        // Validate request first
        if (!$this->validateOrderPlacement($user, $placementData)) {
            throw new \InvalidArgumentException('Invalid checkout data or cart items.');
        }

        $paymentMethod = $placementData->paymentMethod ?? PaymentMethod::CASH_ON_DELIVERY;

        // Compute totals from cart
        $cart = $this->cartService->getCart($user);
        $cart->load(['items.product']);

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException('Cart is empty.');
        }

        // Validate stock availability BEFORE creating order
        // For bundles, validate child items (actual products), not the bundle parent
        $items = $cart->items->filter(function ($item) {
            // Skip bundle parent items (they don't have physical stock)
            if ($item->parent_id === null && $item->product->type === \App\Enums\ProductType::BUNDLE) {
                return false;
            }
            return true;
        })->map(fn($item) => [
            'product_id' => $item->product_id,
            'quantity' => $item->quantity * ($item->parent ? $item->parent->quantity : 1),
        ])->values()->toArray();

        if (!$this->validateStockAvailability($items)) {
            $stockCheck = $this->stockService->validateOrderStock($items);
            throw new \RuntimeException('Insufficient stock for some items: ' . json_encode($stockCheck['insufficient']));
        }

        $subtotal = $cart->items->reduce(fn($total, $item) => $total + $item->getTotalPrice(), 0.0);
        // Shipping cost and discount are not provided in DTO currently; default to 0
        $shippingCost = 0.0;
        $discount = 0.0;
        $couponCode = $placementData->couponCode;
        $total = max(0.0, ($subtotal + $shippingCost) - $discount);
        $shippingAddressId = (int) $placementData->addressId;

        return DB::transaction(function () use ($user, $paymentMethod, $subtotal, $shippingCost, $discount, $total, $couponCode, $shippingAddressId, $cart) {
            // COD: goes directly to PROCESSING (stock reserved logically via view)
            // Online: stays PENDING until payment succeeds
            $initialStatus = $paymentMethod->isCOD()
                ? OrderStatus::PROCESSING
                : OrderStatus::PENDING;

            /** @var Order $order */
            $order = Order::query()->create([
                'user_id' => $user->id,
                'order_status' => $initialStatus,
                'payment_status' => PaymentStatus::PENDING,
                'payment_method' => $paymentMethod,
                'subtotal' => $subtotal,
                'shipping_cost' => $shippingCost,
                'discount' => $discount,
                'total' => $total,
                'coupon_code' => $couponCode,
                'shipping_address_id' => $shippingAddressId,
                'notes' => Arr::get($cart, 'notes') ?? Arr::get($cart, 'note'),
            ]);

            // Create order items (preserve bundle parent-child structure)
            foreach ($cart->items as $item) {
                // Only process parent items (bundles and regular items)
                if ($item->parent_id !== null) {
                    continue;
                }

                $unitPrice = $item->getUnitPrice();
                $orderItem = $order->items()->create([
                    'product_id' => $item->product_id,
                    'parent_id' => null,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $item->quantity,
                    'options' => $item->options,
                ]);

                // If this is a bundle, create child order items
                if ($item->product->type === \App\Enums\ProductType::BUNDLE) {
                    $item->loadMissing('children.product');

                    foreach ($item->children as $childCartItem) {
                        $order->items()->create([
                            'product_id' => $childCartItem->product_id,
                            'parent_id' => $orderItem->id,
                            'quantity' => $childCartItem->quantity,
                            'unit_price' => 0,
                            'subtotal' => 0,
                            'options' => $childCartItem->options ?? [],
                        ]);
                    }
                }
            }

            // Stock is now logically reserved (for PROCESSING orders via view)
            // Physical deduction happens on markOutForDelivery

            $this->cartService->clear($user);

            return $order->refresh();
        });
    }

    /**
     * Mark order as out for delivery and consume stock.
     */
    public function markOutForDelivery(Order $order): void
    {
        if ($order->order_status !== OrderStatus::PROCESSING) {
            throw new \RuntimeException('Order must be in PROCESSING status to mark as out for delivery.');
        }

        // Revalidate stock before consuming
        // For bundles, validate child items (actual products), not the bundle parent
        $order->load('items.product');
        $items = $order->items->filter(function ($item) {
            // Skip bundle parent items (they don't have physical stock)
            if ($item->parent_id === null && $item->product->type === \App\Enums\ProductType::BUNDLE) {
                return false;
            }
            return true;
        })->map(fn($item) => [
            'product_id' => $item->product_id,
            'quantity' => $item->quantity * ($item->parent ? $item->parent->quantity : 1),
        ])->values()->toArray();

        if (!$this->validateStockAvailability($items)) {
            $stockCheck = $this->stockService->validateOrderStock($items);
            throw new \RuntimeException('Cannot fulfill order - insufficient stock: ' . json_encode($stockCheck['insufficient']));
        }

        DB::transaction(function () use ($order) {
            // Consume stock atomically
            $this->stockService->consumeOrderStock($order);

            $order->order_status = OrderStatus::OUT_FOR_DELIVERY;
            $order->save();
        });
    }

    /**
     * Complete the order (mark as delivered).
     */
    public function completeOrder(Order $order): void
    {
        if (!in_array($order->order_status, [OrderStatus::OUT_FOR_DELIVERY, OrderStatus::PROCESSING])) {
            throw new \RuntimeException('Order cannot be completed from current status.');
        }

        $order->order_status = OrderStatus::COMPLETED;
        $order->delivered_at = now();

        // If COD and still pending payment, mark paid on delivery
        if ($order->payment_method->isCOD() && $order->payment_status->isPending()) {
            $order->payment_status = PaymentStatus::PAID;
        }

        $order->save();
    }

    /**
     * Change payment method (only for pending orders).
     */
    public function changePaymentMethod(Order $order, PaymentMethod $method): void
    {
        if ($order->order_status !== OrderStatus::PENDING) {
            throw new \RuntimeException('Payment method can only be changed for PENDING orders.');
        }

        if ($order->payment_status->isPaid()) {
            throw new \RuntimeException('Cannot change payment method for paid orders.');
        }

        $order->payment_method = $method;

        // If switching to COD and stock available, move to PROCESSING
        if ($method->isCOD()) {
            $items = $order->items->map(fn($item) => [
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
            ])->toArray();

            if ($this->validateStockAvailability($items)) {
                $order->order_status = OrderStatus::PROCESSING;
            }
        }

        $order->save();
    }

    /**
     * Validate stock availability for order placement.
     */
    public function validateStockAvailability(array $items): bool
    {
        $stockCheck = $this->stockService->validateOrderStock($items);

        return $stockCheck['available'];
    }

    /**
     * Process payment for order.
     */
    public function payOrder(Order $order, array $paymentData): array
    {
        if (!$order->payment_method->requiresOnlineGateway()) {
            throw new \LogicException('Payment initiation is only applicable for online payment methods.');
        }

        $gatewayName = $paymentData['gateway'] ?? ($order->payment_method === PaymentMethod::CREDIT_CARD ? 'paymob' : 'paymob');

        if (!$this->paymentService->validatePaymentData($gatewayName, $paymentData)) {
            throw new \InvalidArgumentException('Invalid payment data for gateway.');
        }

        $result = $this->paymentService->initiatePayment($order, $gatewayName, $paymentData);

        $order->payment_id = $result['transaction_id'] ?? $result['id'] ?? $order->payment_id;
        $order->payment_details = json_encode([
            'gateway' => $gatewayName,
            'meta' => $result,
        ]);
        $order->payment_status = PaymentStatus::PENDING;
        $order->save();

        return $result;
    }

    /**
     * Confirm order (move to processing if conditions met).
     */
    public function confirmOrder(Order $order): void
    {
        if (in_array($order->order_status, [OrderStatus::CANCELLED, OrderStatus::COMPLETED, OrderStatus::OUT_FOR_DELIVERY], true)) {
            return;
        }

        if ($order->payment_method->requiresOnlineGateway() && !$order->payment_status->isPaid()) {
            return;
        }

        // Revalidate stock
        $items = $order->items->map(fn($item) => [
            'product_id' => $item->product_id,
            'quantity' => $item->quantity,
        ])->toArray();

        if (!$this->validateStockAvailability($items)) {
            $stockCheck = $this->stockService->validateOrderStock($items);
            $order->order_status = OrderStatus::REJECTED;
            $order->cancellation_reason = 'Stock unavailable: ' . json_encode($stockCheck['insufficient']);
            $order->save();

            // TODO: Initiate refund if payment was captured
            return;
        }

        $order->order_status = OrderStatus::PROCESSING;
        $order->save();
    }

    /**
     * Cancel order (legacy method).
     */
    public function cancelOrder(Order $order, ?string $reason = null): void
    {
        if ($order->order_status === OrderStatus::CANCELLED) {
            return;
        }

        DB::transaction(function () use ($order, $reason) {
            // Determine if stock was consumed (OUT_FOR_DELIVERY or COMPLETED)
            $wasConsumed = in_array($order->order_status, [OrderStatus::OUT_FOR_DELIVERY, OrderStatus::COMPLETED]);

            // Release stock if it was consumed
            if ($wasConsumed) {
                $this->stockService->releaseOrderStock($order, true);
            }

            $order->order_status = OrderStatus::CANCELLED;
            $order->cancelled_at = now();
            $order->cancellation_reason = $reason;
            $order->save();

            // TODO: implement refund pipeline
            // Handle refund if needed
            if ($order->needsRefund()) {
                $details = [];
                if (!empty($order->payment_details)) {
                    $decoded = json_decode($order->payment_details, true);
                    if (is_array($decoded)) {
                        $details = $decoded;
                    }
                }

                $gateway = $details['gateway'] ?? null;
                if ($gateway) {
                    try {
                        $refunded = $this->paymentService->refund($order, $gateway, (float) $order->total);
                        if ($refunded) {
                            $order->payment_status = PaymentStatus::REFUNDED;
                            $order->refunded_at = now();
                            $order->save();
                        }
                    } catch (\Throwable $e) {
                        // Swallow refund exception, business can re-try later
                        // TODO: Log for manual intervention
                    }
                }
            }
        });
    }

    /**
     * Handle order after payment.
     */
    public function handleOrderAfterPayment(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $order->payment_status = PaymentStatus::PAID;

            if ($order->order_status === OrderStatus::PENDING) {
                // Revalidate stock before moving to processing
                $items = $order->items->map(fn($item) => [
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                ])->toArray();

                if ($this->validateStockAvailability($items)) {
                    $order->order_status = OrderStatus::PROCESSING;
                } else {
                    $order->order_status = OrderStatus::REJECTED;
                    $order->cancellation_reason = 'Stock unavailable after payment';
                    // TODO: Initiate refund
                }
            }

            $order->save();
        });
    }

    /**
     * Validate order placement.
     */
    public function validateOrderPlacement(User $user, OrderPlacementData $placementData): bool
    {
        $cartValidation = $this->cartService->validateCartItems($user);
        if (!$cartValidation->isValid) {
            return false;
        }

        $shippingAddressId = $placementData->addressId;
        if (!$shippingAddressId || !Address::query()->whereKey($shippingAddressId)->where('user_id', $user->id)->exists()) {
            return false;
        }

        // PaymentMethod in DTO should already be a PaymentMethod instance, but validate defensively
        try {
            if ($placementData->paymentMethod instanceof PaymentMethod) {
                // valid
            } else {
                PaymentMethod::from((string) $placementData->paymentMethod);
            }
        } catch (\ValueError $e) {
            return false;
        }

        return true;
    }
}
