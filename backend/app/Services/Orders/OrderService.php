<?php

namespace App\Services\Orders;

use App\Models\Order;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Cart\CheckoutService;
use App\Services\Orders\Contracts\OrderStrategyInterface;
use App\Services\Orders\Strategies\PosManagedOrderStrategy;
use App\Services\Orders\Strategies\WebManagedOrderStrategy;
use App\Services\Payments\PaymentService;

class OrderService
{
    public function __construct(
        protected CartService $cartService,
        protected CheckoutService $checkoutService,
        protected PaymentService $paymentService
    ) {}

    /**
     * Get the appropriate order strategy.
     */
    public function getStrategy(?string $strategyType = null): OrderStrategyInterface
    {
        // TODO: Implement strategy selection logic based on settings
        // Default to web-managed for now
        return match ($strategyType) {
            'pos_managed' => new PosManagedOrderStrategy(
                $this->cartService,
                $this->checkoutService,
                $this->paymentService
            ),
            'web_managed' => new WebManagedOrderStrategy(
                $this->cartService,
                $this->checkoutService,
                $this->paymentService
            ),
            default => new WebManagedOrderStrategy(
                $this->cartService,
                $this->checkoutService,
                $this->paymentService
            ),
        };
    }

    /**
     * Place a new order.
     */
    public function placeOrder(User $user, array $checkoutData, ?string $promotionCode = null): Order
    {
        $strategy = $this->getStrategy();

        return $strategy->placeOrder($user, $checkoutData, $promotionCode);
    }

    /**
     * Process payment for order.
     */
    public function payOrder(Order $order, array $paymentData): array
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);

        return $strategy->payOrder($order, $paymentData);
    }

    /**
     * Confirm order.
     */
    public function confirmOrder(Order $order): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->confirmOrder($order);
    }

    /**
     * Cancel order.
     */
    public function cancelOrder(Order $order, ?string $reason = null): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->cancelOrder($order, $reason);
    }

    /**
     * Update order status.
     */
    public function updateOrderStatus(Order $order, string $status): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->updateOrderStatus($order, $status);
    }

    /**
     * Handle order after payment.
     */
    public function handleOrderAfterPayment(Order $order): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->handleOrderAfterPayment($order);
    }

    /**
     * Validate order placement.
     */
    public function validateOrderPlacement(User $user, array $checkoutData): bool
    {
        $strategy = $this->getStrategy();

        return $strategy->validateOrderPlacement($user, $checkoutData);
    }
}
