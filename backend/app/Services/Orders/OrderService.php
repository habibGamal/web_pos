<?php

namespace App\Services\Orders;

use App\DTOs\OrderPlacementData;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\User;
use App\Services\Cart\CartService;
use App\Services\Orders\Contracts\OrderStrategyInterface;
use App\Services\Orders\Strategies\PosManagedOrderStrategy;
use App\Services\Orders\Strategies\WebManagedOrderStrategy;
use App\Services\Payments\PaymentService;
use App\Services\Stock\StockService;

class OrderService
{
    public function __construct(
        protected CartService $cartService,
        protected PaymentService $paymentService,
        protected StockService $stockService
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
                $this->paymentService
            ),
            'web_managed' => new WebManagedOrderStrategy(
                $this->cartService,
                $this->paymentService,
                $this->stockService
            ),
            default => new WebManagedOrderStrategy(
                $this->cartService,
                $this->paymentService,
                $this->stockService
            ),
        };
    }

    /**
     * Place a new order.
     */
    public function placeOrder(User $user, OrderPlacementData $placementData): Order
    {
        $strategy = $this->getStrategy();

        return $strategy->placeOrder($user, $placementData);
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

    public function markOutForDelivery(Order $order): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->markOutForDelivery($order);
    }

    public function completeOrder(Order $order): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->completeOrder($order);
    }

    public function changePaymentMethod(Order $order, PaymentMethod $method): void
    {
        $strategy = $this->getStrategy($order->order_manager ?? null);
        $strategy->changePaymentMethod($order, $method);
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
    public function validateOrderPlacement(User $user, OrderPlacementData $placementData): bool
    {
        $strategy = $this->getStrategy();

        return $strategy->validateOrderPlacement($user, $placementData);
    }
}
