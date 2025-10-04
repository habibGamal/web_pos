<?php

namespace App\Services\Orders\Contracts;

use App\DTOs\OrderPlacementData;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\User;

interface OrderStrategyInterface
{
    /**
     * Place order.
     */
    public function placeOrder(User $user, OrderPlacementData $placementData): Order;

    /**
     * Process payment for order.
     */
    public function payOrder(Order $order, array $paymentData): array;

    /**
     * Confirm order.
     */
    public function confirmOrder(Order $order): void;

    /**
     * Cancel order (legacy method - delegates to cancel).
     */
    public function cancelOrder(Order $order, ?string $reason = null): void;

    /**
     * Mark order as out for delivery and consume stock.
     */
    public function markOutForDelivery(Order $order): void;

    /**
     * Complete the order (mark as delivered).
     */
    public function completeOrder(Order $order): void;

    /**
     * Change payment method (only for pending orders).
     */
    public function changePaymentMethod(Order $order, PaymentMethod $method): void;

    /**
     * Handle order after payment.
     */
    public function handleOrderAfterPayment(Order $order): void;

    /**
     * Validate order placement.
     */
    public function validateOrderPlacement(User $user, OrderPlacementData $placementData): bool;
}
