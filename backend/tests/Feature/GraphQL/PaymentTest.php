<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Payment GraphQL Operations', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->order = Order::factory()->create([
            'user_id' => $this->user->id,
            'order_status' => 'CONFIRMED',
            'payment_status' => 'PENDING',
            'total' => 275.0,
            'currency' => 'EGP',
        ]);
    });

    describe('Initiate Payment Mutation', function () {
        it('initiates card payment successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation InitiatePayment($input: InitiatePaymentInput!) {
                    initiatePayment(input: $input) {
                        payment_id
                        order_id
                        amount
                        currency
                        payment_url
                        payment_method
                        gateway
                        status
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'payment_method' => 'CARD',
                    'success_url' => 'https://example.com/success',
                    'cancel_url' => 'https://example.com/cancel',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'initiatePayment' => [
                        'order_id' => (string) $this->order->id,
                        'amount' => 275.0,
                        'currency' => 'EGP',
                        'payment_method' => 'CARD',
                        'gateway' => 'kashier',
                        'status' => 'PENDING',
                    ],
                ],
            ]);

            $paymentData = $response->json('data.initiatePayment');
            expect($paymentData['payment_url'])->toBeString();
            expect($paymentData['payment_id'])->toBeString();

            // Verify payment was created in database
            $this->assertDatabaseHas('payments', [
                'order_id' => $this->order->id,
                'payment_method' => 'CARD',
                'gateway' => 'kashier',
                'amount' => 275.0,
                'status' => 'PENDING',
            ]);
        });

        it('handles COD payment method', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation InitiatePayment($input: InitiatePaymentInput!) {
                    initiatePayment(input: $input) {
                        payment_id
                        payment_method
                        status
                        payment_url
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'initiatePayment' => [
                        'payment_method' => 'COD',
                        'status' => 'PENDING',
                        'payment_url' => null, // No redirect for COD
                    ],
                ],
            ]);

            // Verify payment was created
            $this->assertDatabaseHas('payments', [
                'order_id' => $this->order->id,
                'payment_method' => 'COD',
                'amount' => 275.0,
                'status' => 'PENDING',
            ]);
        });

        it('validates order exists and belongs to user', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation InitiatePayment($input: InitiatePaymentInput!) {
                    initiatePayment(input: $input) {
                        payment_id
                    }
                }
            ', [
                'input' => [
                    'order_id' => '999999',
                    'payment_method' => 'CARD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [initiatePayment].',
                        'extensions' => [
                            'validation' => [
                                'input.order_id' => [
                                    'The selected input.order id is invalid.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('prevents payment for already paid order', function () {
            // Arrange - Mark order as paid
            $this->order->update(['payment_status' => 'PAID']);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation InitiatePayment($input: InitiatePaymentInput!) {
                    initiatePayment(input: $input) {
                        payment_id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'payment_method' => 'CARD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Order is already paid.',
                    ],
                ],
            ]);
        });

        it('prevents payment for cancelled order', function () {
            // Arrange - Cancel order
            $this->order->update([
                'order_status' => 'CANCELLED',
                'payment_status' => 'CANCELLED',
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation InitiatePayment($input: InitiatePaymentInput!) {
                    initiatePayment(input: $input) {
                        payment_id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'payment_method' => 'CARD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Cannot process payment for cancelled order.',
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                mutation InitiatePayment($input: InitiatePaymentInput!) {
                    initiatePayment(input: $input) {
                        payment_id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'payment_method' => 'CARD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Unauthenticated.',
                    ],
                ],
            ]);
        });
    });

    describe('Payment Webhook Processing', function () {
        beforeEach(function () {
            $this->payment = Payment::factory()->create([
                'order_id' => $this->order->id,
                'payment_method' => 'CARD',
                'gateway' => 'kashier',
                'amount' => 275.0,
                'status' => 'PENDING',
                'gateway_transaction_id' => 'kashier_123456',
            ]);
        });

        it('processes successful payment webhook', function () {
            // Mock webhook payload
            $webhookPayload = json_encode([
                'order_id' => 'kashier_123456',
                'status' => 'SUCCESS',
                'transaction_id' => 'txn_789012',
                'amount' => 27500, // Amount in cents
                'currency' => 'EGP',
            ]);

            // Act
            $response = $this->graphQL('
                mutation ProcessWebhook($input: ProcessWebhookInput!) {
                    processPaymentWebhook(input: $input) {
                        success
                        message
                        order {
                            id
                            payment_status
                            order_status
                        }
                    }
                }
            ', [
                'input' => [
                    'gateway' => 'kashier',
                    'payload' => $webhookPayload,
                    'signature' => 'valid_signature_hash',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'processPaymentWebhook' => [
                        'success' => true,
                        'message' => 'Payment processed successfully',
                        'order' => [
                            'id' => (string) $this->order->id,
                            'payment_status' => 'PAID',
                            'order_status' => 'CONFIRMED',
                        ],
                    ],
                ],
            ]);

            // Verify payment was updated
            $this->assertDatabaseHas('payments', [
                'id' => $this->payment->id,
                'status' => 'PAID',
                'gateway_transaction_id' => 'txn_789012',
            ]);

            // Verify order was updated
            $this->assertDatabaseHas('orders', [
                'id' => $this->order->id,
                'payment_status' => 'PAID',
            ]);
        });

        it('processes failed payment webhook', function () {
            // Mock failed webhook payload
            $webhookPayload = json_encode([
                'order_id' => 'kashier_123456',
                'status' => 'FAILED',
                'transaction_id' => 'txn_failed_123',
                'error_message' => 'Insufficient funds',
            ]);

            // Act
            $response = $this->graphQL('
                mutation ProcessWebhook($input: ProcessWebhookInput!) {
                    processPaymentWebhook(input: $input) {
                        success
                        message
                        order {
                            payment_status
                        }
                    }
                }
            ', [
                'input' => [
                    'gateway' => 'kashier',
                    'payload' => $webhookPayload,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'processPaymentWebhook' => [
                        'success' => true,
                        'message' => 'Payment failed: Insufficient funds',
                        'order' => [
                            'payment_status' => 'FAILED',
                        ],
                    ],
                ],
            ]);

            // Verify payment was updated
            $this->assertDatabaseHas('payments', [
                'id' => $this->payment->id,
                'status' => 'FAILED',
            ]);
        });

        it('validates webhook signature', function () {
            // Mock webhook with invalid signature
            $webhookPayload = json_encode([
                'order_id' => 'kashier_123456',
                'status' => 'SUCCESS',
            ]);

            // Act
            $response = $this->graphQL('
                mutation ProcessWebhook($input: ProcessWebhookInput!) {
                    processPaymentWebhook(input: $input) {
                        success
                        message
                    }
                }
            ', [
                'input' => [
                    'gateway' => 'kashier',
                    'payload' => $webhookPayload,
                    'signature' => 'invalid_signature',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Invalid webhook signature.',
                    ],
                ],
            ]);
        });

        it('handles duplicate webhook processing', function () {
            // First webhook - mark payment as paid
            $this->payment->update(['status' => 'PAID']);

            $webhookPayload = json_encode([
                'order_id' => 'kashier_123456',
                'status' => 'SUCCESS',
                'transaction_id' => 'txn_789012',
            ]);

            // Act - Process same webhook again
            $response = $this->graphQL('
                mutation ProcessWebhook($input: ProcessWebhookInput!) {
                    processPaymentWebhook(input: $input) {
                        success
                        message
                    }
                }
            ', [
                'input' => [
                    'gateway' => 'kashier',
                    'payload' => $webhookPayload,
                ],
            ]);

            // Assert - Should handle gracefully
            $response->assertJson([
                'data' => [
                    'processPaymentWebhook' => [
                        'success' => true,
                        'message' => 'Payment already processed',
                    ],
                ],
            ]);
        });
    });

    describe('Payment Queries', function () {
        beforeEach(function () {
            $this->payment1 = Payment::factory()->create([
                'order_id' => $this->order->id,
                'payment_method' => 'CARD',
                'amount' => 275.0,
                'status' => 'PAID',
            ]);

            $this->payment2 = Payment::factory()->create([
                'order_id' => $this->order->id,
                'payment_method' => 'COD',
                'amount' => 275.0,
                'status' => 'PENDING',
            ]);
        });

        it('retrieves payment by ID', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetPayment($id: ID!) {
                    payment(id: $id) {
                        id
                        order_id
                        payment_method
                        gateway
                        amount
                        currency
                        status
                        created_at
                        order {
                            id
                            total
                        }
                    }
                }
            ', [
                'id' => (string) $this->payment1->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'payment' => [
                        'id' => (string) $this->payment1->id,
                        'order_id' => (string) $this->order->id,
                        'payment_method' => 'CARD',
                        'amount' => 275.0,
                        'status' => 'PAID',
                        'order' => [
                            'id' => (string) $this->order->id,
                            'total' => 275.0,
                        ],
                    ],
                ],
            ]);
        });

        it('retrieves order payments', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrderPayments($order_id: ID!) {
                    orderPayments(order_id: $order_id) {
                        id
                        payment_method
                        amount
                        status
                    }
                }
            ', [
                'order_id' => (string) $this->order->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'orderPayments' => [
                        [
                            'id' => (string) $this->payment2->id, // Latest first
                            'payment_method' => 'COD',
                            'status' => 'PENDING',
                        ],
                        [
                            'id' => (string) $this->payment1->id,
                            'payment_method' => 'CARD',
                            'status' => 'PAID',
                        ],
                    ],
                ],
            ]);
        });

        it('retrieves available payment methods', function () {
            // Act
            $response = $this->graphQL('
                query GetPaymentMethods {
                    availablePaymentMethods {
                        method
                        name
                        description
                        enabled
                        currencies
                    }
                }
            ');

            // Assert
            $paymentMethods = $response->json('data.availablePaymentMethods');
            expect($paymentMethods)->toBeArray();
            expect($paymentMethods)->not->toBeEmpty();

            // Check that common payment methods are available
            $methods = collect($paymentMethods)->pluck('method')->toArray();
            expect($methods)->toContain('CARD');
            expect($methods)->toContain('COD');
        });

        it('prevents access to other users payment data', function () {
            // Arrange
            $otherUser = User::factory()->create();

            // Act
            $response = $this->actingAs($otherUser)->graphQL('
                query GetPayment($id: ID!) {
                    payment(id: $id) {
                        id
                    }
                }
            ', [
                'id' => (string) $this->payment1->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'payment' => null,
                ],
            ]);
        });
    });

    describe('Refund Payment Mutation', function () {
        beforeEach(function () {
            $this->paidPayment = Payment::factory()->create([
                'order_id' => $this->order->id,
                'payment_method' => 'CARD',
                'amount' => 275.0,
                'status' => 'PAID',
                'gateway_transaction_id' => 'txn_12345',
            ]);

            // Update order to delivered status for refund eligibility
            $this->order->update([
                'order_status' => 'DELIVERED',
                'payment_status' => 'PAID',
            ]);
        });

        it('processes full refund successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RefundPayment($input: RefundPaymentInput!) {
                    refundPayment(input: $input) {
                        id
                        status
                        amount
                        gateway_response
                    }
                }
            ', [
                'input' => [
                    'payment_id' => (string) $this->paidPayment->id,
                    'reason' => 'Customer requested refund',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'refundPayment' => [
                        'id' => (string) $this->paidPayment->id,
                        'status' => 'REFUNDED',
                        'amount' => 275.0,
                    ],
                ],
            ]);

            // Verify payment was updated
            $this->assertDatabaseHas('payments', [
                'id' => $this->paidPayment->id,
                'status' => 'REFUNDED',
            ]);

            // Verify order status updated
            $this->assertDatabaseHas('orders', [
                'id' => $this->order->id,
                'payment_status' => 'REFUNDED',
            ]);
        });

        it('processes partial refund successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RefundPayment($input: RefundPaymentInput!) {
                    refundPayment(input: $input) {
                        id
                        status
                        amount
                    }
                }
            ', [
                'input' => [
                    'payment_id' => (string) $this->paidPayment->id,
                    'amount' => 100.0,
                    'reason' => 'Partial refund for returned item',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'refundPayment' => [
                        'id' => (string) $this->paidPayment->id,
                        'status' => 'PARTIALLY_REFUNDED',
                        'amount' => 275.0, // Original amount
                    ],
                ],
            ]);

            // Verify order status updated
            $this->assertDatabaseHas('orders', [
                'id' => $this->order->id,
                'payment_status' => 'PARTIALLY_REFUNDED',
            ]);
        });

        it('validates refund amount does not exceed payment amount', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RefundPayment($input: RefundPaymentInput!) {
                    refundPayment(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'payment_id' => (string) $this->paidPayment->id,
                    'amount' => 500.0, // More than payment amount
                    'reason' => 'Invalid refund amount',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Refund amount cannot exceed payment amount.',
                    ],
                ],
            ]);
        });

        it('prevents refunding already refunded payment', function () {
            // Arrange - Mark payment as refunded
            $this->paidPayment->update(['status' => 'REFUNDED']);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RefundPayment($input: RefundPaymentInput!) {
                    refundPayment(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'payment_id' => (string) $this->paidPayment->id,
                    'reason' => 'Duplicate refund attempt',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Payment is already refunded.',
                    ],
                ],
            ]);
        });
    });
});
