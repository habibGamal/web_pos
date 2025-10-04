<?php

namespace App\Services\Payments\Contracts;

use App\Models\Order;

interface PaymentGatewayInterface
{
    /**
     * Initialize payment process.
     */
    public function initiatePayment(Order $order, array $paymentData): array;

    /**
     * Verify payment callback.
     */
    public function verifyPayment(string $transactionId, array $callbackData): bool;

    /**
     * Process refund.
     */
    public function refund(Order $order, float $amount): bool;

    /**
     * Get payment status.
     */
    public function getPaymentStatus(string $transactionId): string;

    /**
     * Get gateway name.
     */
    public function getGatewayName(): string;

    /**
     * Validate payment data.
     */
    public function validatePaymentData(array $paymentData): bool;
}
