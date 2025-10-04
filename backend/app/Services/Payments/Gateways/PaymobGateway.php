<?php

namespace App\Services\Payments\Gateways;

use App\Models\Order;
use App\Services\Payments\Contracts\PaymentGatewayInterface;

class PaymobGateway implements PaymentGatewayInterface
{
    /**
     * Initialize payment process.
     */
    public function initiatePayment(Order $order, array $paymentData): array
    {
        // TODO: Implement Paymob payment initiation
        return [];
    }

    /**
     * Verify payment callback.
     */
    public function verifyPayment(string $transactionId, array $callbackData): bool
    {
        // TODO: Implement Paymob payment verification
        return false;
    }

    /**
     * Process refund.
     */
    public function refund(Order $order, float $amount): bool
    {
        // TODO: Implement Paymob refund logic
        return false;
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatus(string $transactionId): string
    {
        // TODO: Implement Paymob payment status check
        return '';
    }

    /**
     * Get gateway name.
     */
    public function getGatewayName(): string
    {
        return 'paymob';
    }

    /**
     * Validate payment data.
     */
    public function validatePaymentData(array $paymentData): bool
    {
        // TODO: Implement Paymob payment data validation
        return false;
    }
}
