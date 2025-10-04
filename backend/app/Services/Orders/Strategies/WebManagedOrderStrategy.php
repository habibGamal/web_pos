<?php

namespace App\Services\Orders\Strategies;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Order;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Cart\CheckoutService;
use App\Services\Orders\Contracts\OrderStrategyInterface;
use App\Services\Payments\PaymentService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class WebManagedOrderStrategy implements OrderStrategyInterface
{
    public function __construct(
        protected CartService $cartService,
        protected CheckoutService $checkoutService,
        protected PaymentService $paymentService
    ) {}

    /**
     * Place a new order.
     */
    public function placeOrder(User $user, array $checkoutData, ?string $promotionCode = null): Order
    {
        // Validate request first
        if (! $this->validateOrderPlacement($user, $checkoutData)) {
            throw new \InvalidArgumentException('Invalid checkout data or cart items.');
        }

        $paymentMethod = isset($checkoutData['payment_method'])
            ? PaymentMethod::from($checkoutData['payment_method'])
            : PaymentMethod::CASH_ON_DELIVERY;

        // Compute totals from cart
        $cart = $this->cartService->getCart($user);
        $cart->load(['items.product']);

        if ($cart->items->isEmpty()) {
            throw new \RuntimeException('Cart is empty.');
        }

        $subtotal = $cart->items->reduce(function ($total, $item) {
            return $total + $item->getTotalPrice();
        }, 0.0);

        $shippingCost = (float) ($checkoutData['shipping_cost'] ?? 0.0);
        $discount = (float) ($checkoutData['discount'] ?? 0.0);
        // Keep the provided promotion code on the order for traceability
        $couponCode = $promotionCode ?? Arr::get($checkoutData, 'coupon_code');

        $total = max(0.0, ($subtotal + $shippingCost) - $discount);

        // Ensure address exists and belongs to the user (already checked in validateOrderPlacement)
        $shippingAddressId = (int) $checkoutData['shipping_address_id'];

        return DB::transaction(function () use ($user, $paymentMethod, $subtotal, $shippingCost, $discount, $total, $couponCode, $shippingAddressId, $cart) {
            // Choose initial order status: for online payment start as pending; for COD start processing
            $initialStatus = $paymentMethod->requiresOnlineGateway()
                ? OrderStatus::PENDING
                : OrderStatus::PROCESSING;

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

            // Create order items from cart
            foreach ($cart->items as $item) {
                $unitPrice = $item->getUnitPrice();
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'unit_price' => $unitPrice,
                    'subtotal' => $unitPrice * $item->quantity,
                    'options' => $item->options,
                ]);
            }

            // For COD, immediately move forward with stock consumption
            if (! $paymentMethod->requiresOnlineGateway()) {
                // Consume inventory for each item
                $order->loadMissing('items.product');
                foreach ($order->items as $orderItem) {
                    // Use inventory service via cart service's dependency graph if needed
                    // Here we directly consume stock on web-managed strategy
                    app(\App\Services\Inventory\InventoryService::class)
                        ->consume($orderItem->product, $orderItem->quantity);
                }
            }

            // Clear the cart after order creation
            $this->cartService->clear($user);

            return $order->refresh();
        });
    }

    /**
     * Process payment for order.
     */
    public function payOrder(Order $order, array $paymentData): array
    {
        // Only applicable for gateways that require online payment
        if (! $order->payment_method->requiresOnlineGateway()) {
            throw new \LogicException('Payment initiation is only applicable for online payment methods.');
        }

        $gatewayName = $paymentData['gateway'] ?? ($order->payment_method === PaymentMethod::CREDIT_CARD ? 'paymob' : 'paymob');

        if (! $this->paymentService->validatePaymentData($gatewayName, $paymentData)) {
            throw new \InvalidArgumentException('Invalid payment data for gateway.');
        }

        $result = $this->paymentService->initiatePayment($order, $gatewayName, $paymentData);

        // Persist payment identifiers for later verification/refund
        $order->payment_id = $result['transaction_id'] ?? $result['id'] ?? $order->payment_id;
        $order->payment_details = json_encode([
            'gateway' => $gatewayName,
            'meta' => $result,
        ]);
        $order->payment_status = PaymentStatus::PENDING; // remains pending until callback confirms
        $order->save();

        return $result;
    }

    /**
     * Confirm order.
     */
    public function confirmOrder(Order $order): void
    {
        // Move order to processing if not cancelled/completed
        if (in_array($order->order_status, [OrderStatus::CANCELLED, OrderStatus::COMPLETED], true)) {
            return;
        }

        // If payment method is online, ensure it's paid or still valid to process
        if ($order->payment_method->requiresOnlineGateway() && ! $order->payment_status->isPaid()) {
            // Typically, we'll wait for payment callback before confirming
            return;
        }

        DB::transaction(function () use ($order) {
            $order->order_status = OrderStatus::PROCESSING;
            $order->save();

            // Ensure inventory is consumed (for online orders post-payment)
            $order->loadMissing('items.product');
            foreach ($order->items as $orderItem) {
                app(\App\Services\Inventory\InventoryService::class)
                    ->consume($orderItem->product, $orderItem->quantity);
            }
        });
    }

    /**
     * Cancel order.
     */
    public function cancelOrder(Order $order, ?string $reason = null): void
    {
        if ($order->order_status === OrderStatus::CANCELLED) {
            return;
        }

        DB::transaction(function () use ($order, $reason) {
            // Restock items if previously consumed (best-effort as we don't track reservations)
            $order->loadMissing('items.product');
            foreach ($order->items as $orderItem) {
                $product = $orderItem->product->fresh();
                if ($product) {
                    app(\App\Services\Inventory\InventoryService::class)
                        ->updateStock($product, max(0, $product->quantity + $orderItem->quantity));
                }
            }

            $order->order_status = OrderStatus::CANCELLED;
            $order->cancelled_at = now();
            $order->cancellation_reason = $reason;
            $order->save();

            // Process refund if needed and possible
            if ($order->needsRefund()) {
                $details = [];
                if (! empty($order->payment_details)) {
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
                    }
                }
            }
        });
    }

    /**
     * Update order status.
     */
    public function updateOrderStatus(Order $order, string $status): void
    {
        try {
            $newStatus = OrderStatus::from($status);
        } catch (\ValueError $e) {
            throw new \InvalidArgumentException('Invalid order status value.');
        }

        if ($newStatus === OrderStatus::CANCELLED) {
            $this->cancelOrder($order, $order->cancellation_reason);

            return;
        }

        $order->order_status = $newStatus;

        if ($newStatus === OrderStatus::COMPLETED) {
            $order->delivered_at = now();

            // If COD and still pending payment, mark paid on delivery
            if ($order->payment_method->isCOD() && $order->payment_status->isPending()) {
                $order->payment_status = PaymentStatus::PAID;
            }
        }

        $order->save();
    }

    /**
     * Handle order after payment.
     */
    public function handleOrderAfterPayment(Order $order): void
    {
        // Called when payment gateway confirms success
        DB::transaction(function () use ($order) {
            $order->payment_status = PaymentStatus::PAID;
            // Move from pending to processing after payment
            if ($order->order_status === OrderStatus::PENDING) {
                $order->order_status = OrderStatus::PROCESSING;
            }
            $order->save();

            // Consume inventory post-payment
            $order->loadMissing('items.product');
            foreach ($order->items as $orderItem) {
                app(\App\Services\Inventory\InventoryService::class)
                    ->consume($orderItem->product, $orderItem->quantity);
            }
        });
    }

    /**
     * Validate order placement.
     */
    public function validateOrderPlacement(User $user, array $checkoutData): bool
    {
        // Validate cart items availability
        $cartValidation = $this->checkoutService->validateCart($user);
        if (! ($cartValidation['is_valid'] ?? false)) {
            return false;
        }

        // Validate shipping address belongs to the user
        $shippingAddressId = Arr::get($checkoutData, 'shipping_address_id');
        if (! $shippingAddressId || ! Address::query()->whereKey($shippingAddressId)->where('user_id', $user->id)->exists()) {
            return false;
        }

        // Validate payment method
        $paymentMethod = Arr::get($checkoutData, 'payment_method');
        if ($paymentMethod) {
            try {
                PaymentMethod::from($paymentMethod);
            } catch (\ValueError $e) {
                return false;
            }
        }

        return true;
    }
}
