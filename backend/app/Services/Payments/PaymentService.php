<?php

namespace App\Services\Payments;

use App\Models\Order;
use App\Services\Payments\Contracts\PaymentGatewayInterface;
use App\Services\Payments\Gateways\KashierGateway;
use App\Services\Payments\Gateways\PaymobGateway;

class PaymentService
{
    /**
     * Get the appropriate payment gateway.
     */
    public function getGateway(string $gatewayName): PaymentGatewayInterface
    {
        // TODO: Implement gateway selection logic
        return match ($gatewayName) {
            'kashier' => new KashierGateway,
            'paymob' => new PaymobGateway,
            default => throw new \InvalidArgumentException("Unknown gateway: {$gatewayName}"),
        };
    }

    /**
     * Initialize payment process.
     */
    public function initiatePayment(Order $order, string $gatewayName, array $paymentData): array
    {
        $gateway = $this->getGateway($gatewayName);

        return $gateway->initiatePayment($order, $paymentData);
    }

    /**
     * Verify payment callback.
     */
    public function verifyPayment(string $gatewayName, string $transactionId, array $callbackData): bool
    {
        $gateway = $this->getGateway($gatewayName);

        return $gateway->verifyPayment($transactionId, $callbackData);
    }

    /**
     * Process refund.
     */
    public function refund(Order $order, string $gatewayName, float $amount): bool
    {
        $gateway = $this->getGateway($gatewayName);

        return $gateway->refund($order, $amount);
    }

    /**
     * Get payment status.
     */
    public function getPaymentStatus(string $gatewayName, string $transactionId): string
    {
        $gateway = $this->getGateway($gatewayName);

        return $gateway->getPaymentStatus($transactionId);
    }

    /**
     * Validate payment data.
     */
    public function validatePaymentData(string $gatewayName, array $paymentData): bool
    {
        $gateway = $this->getGateway($gatewayName);

        return $gateway->validatePaymentData($paymentData);
    }
}
