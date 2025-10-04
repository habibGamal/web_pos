<?php

namespace App\Services\Orders\Contracts;

use App\Models\Order;
use App\Models\User;

interface OrderStrategyInterface
{
    /**
     * Place a new order.
     */
    public function placeOrder(User $user, array $checkoutData, ?string $promotionCode = null): Order;

    /**
     * Process payment for order.
     */
    public function payOrder(Order $order, array $paymentData): array;

    /**
     * Confirm order.
     */
    public function confirmOrder(Order $order): void;

    /**
     * Cancel order.
     */
    public function cancelOrder(Order $order, ?string $reason = null): void;

    /**
     * Update order status.
     */
    public function updateOrderStatus(Order $order, string $status): void;

    /**
     * Handle order after payment.
     */
    public function handleOrderAfterPayment(Order $order): void;

    /**
     * Validate order placement.
     */
    public function validateOrderPlacement(User $user, array $checkoutData): bool;
}
