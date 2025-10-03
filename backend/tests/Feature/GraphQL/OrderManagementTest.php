<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Order Management GraphQL Operations', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();

        $this->product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'price' => 100.00,
        ]);

        $this->variant = Product::factory()->variant()->create([
            'product_id' => $this->product->id,
            'quantity' => 100,
            'is_active' => true,
            'is_default' => true,
            'price' => null,
        ]);
    });

    describe('Cancel Order Mutation', function () {
        beforeEach(function () {
            $this->order = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => 'PENDING',
                'payment_status' => 'PENDING',
                'subtotal' => 100.0,
                'shipping_cost' => 25.0,
                'total' => 125.0,
            ]);

            OrderItem::factory()->create([
                'order_id' => $this->order->id,
                'product_id' => $this->product->id,
                'variant_id' => $this->variant->id,
                'quantity' => 1,
                'unit_price' => 100.0,
                'total_price' => 100.0,
            ]);
        });

        it('cancels pending order successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                        order_status
                        payment_status
                        can_be_cancelled
                        statusHistory {
                            previous_status
                            new_status
                            notes
                        }
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'Customer requested cancellation',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'cancelOrder' => [
                        'id' => (string) $this->order->id,
                        'order_status' => 'CANCELLED',
                        'payment_status' => 'CANCELLED',
                        'can_be_cancelled' => false,
                    ],
                ],
            ]);

            // Verify order was updated in database
            $this->assertDatabaseHas('orders', [
                'id' => $this->order->id,
                'order_status' => 'CANCELLED',
                'payment_status' => 'CANCELLED',
            ]);

            // Verify status history was created
            $this->assertDatabaseHas('order_status_histories', [
                'order_id' => $this->order->id,
                'previous_status' => 'PENDING',
                'new_status' => 'CANCELLED',
                'notes' => 'Customer requested cancellation',
            ]);

            // Verify inventory was restored
            $this->variant->refresh();
            expect($this->variant->quantity)->toBe(101); // Original 100 + 1 restored
        });

        it('prevents cancelling already shipped order', function () {
            // Arrange - Update order to shipped
            $this->order->update([
                'order_status' => 'SHIPPED',
                'payment_status' => 'PAID',
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'Customer requested cancellation',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Cannot cancel order that has already been shipped.',
                    ],
                ],
            ]);
        });

        it('prevents cancelling already cancelled order', function () {
            // Arrange - Update order to cancelled
            $this->order->update([
                'order_status' => 'CANCELLED',
                'payment_status' => 'CANCELLED',
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'Customer requested cancellation',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Order is already cancelled.',
                    ],
                ],
            ]);
        });

        it('validates order exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'order_id' => '999999',
                    'reason' => 'Test cancellation',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [cancelOrder].',
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

        it('prevents cancelling other users order', function () {
            // Arrange
            $otherUser = User::factory()->create();

            // Act
            $response = $this->actingAs($otherUser)->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'Unauthorized cancellation',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Order not found or access denied.',
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'Test cancellation',
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

    describe('Order Status Tracking', function () {
        beforeEach(function () {
            $this->order = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => 'CONFIRMED',
                'payment_status' => 'PAID',
                'tracking_number' => 'TRK123456789',
                'estimated_delivery_date' => now()->addDays(3),
            ]);
        });

        it('retrieves order with tracking information', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrderTracking($id: ID!) {
                    order(id: $id) {
                        id
                        order_status
                        tracking_number
                        estimated_delivery_date
                        delivered_at
                        statusHistory {
                            previous_status
                            new_status
                            notes
                            created_at
                        }
                    }
                }
            ', [
                'id' => (string) $this->order->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'order' => [
                        'id' => (string) $this->order->id,
                        'order_status' => 'CONFIRMED',
                        'tracking_number' => 'TRK123456789',
                        'delivered_at' => null,
                    ],
                ],
            ]);

            // Verify tracking fields are present
            $orderData = $response->json('data.order');
            expect($orderData['estimated_delivery_date'])->toBeString();
            expect($orderData['statusHistory'])->toBeArray();
        });

        it('tracks order status changes chronologically', function () {
            // Simulate status changes by creating history records
            $this->order->statusHistory()->create([
                'previous_status' => null,
                'new_status' => 'PENDING',
                'notes' => 'Order created',
                'created_at' => now()->subHours(2),
            ]);

            $this->order->statusHistory()->create([
                'previous_status' => 'PENDING',
                'new_status' => 'CONFIRMED',
                'notes' => 'Payment confirmed',
                'created_at' => now()->subHour(),
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrderHistory($id: ID!) {
                    order(id: $id) {
                        statusHistory {
                            previous_status
                            new_status
                            notes
                            created_at
                        }
                    }
                }
            ', [
                'id' => (string) $this->order->id,
            ]);

            // Assert chronological order (latest first)
            $statusHistory = $response->json('data.order.statusHistory');
            expect($statusHistory)->toHaveCount(2);
            expect($statusHistory[0]['new_status'])->toBe('CONFIRMED');
            expect($statusHistory[1]['new_status'])->toBe('PENDING');
        });
    });

    describe('Order Business Logic', function () {
        it('calculates order totals correctly', function () {
            // Create order with multiple items
            $order = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => 'PENDING',
                'subtotal' => 0, // Will be calculated
                'shipping_cost' => 50.0,
                'discount' => 25.0,
                'total' => 0, // Will be calculated
            ]);

            // Add order items
            OrderItem::factory()->create([
                'order_id' => $order->id,
                'quantity' => 2,
                'unit_price' => 100.0,
                'total_price' => 200.0,
            ]);

            OrderItem::factory()->create([
                'order_id' => $order->id,
                'quantity' => 1,
                'unit_price' => 75.0,
                'total_price' => 75.0,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrderTotals($id: ID!) {
                    order(id: $id) {
                        subtotal
                        shipping_cost
                        discount
                        total
                        items {
                            quantity
                            unit_price
                            total_price
                        }
                    }
                }
            ', [
                'id' => (string) $order->id,
            ]);

            // Assert correct calculations
            $response->assertJson([
                'data' => [
                    'order' => [
                        'subtotal' => 275.0, // 200 + 75
                        'shipping_cost' => 50.0,
                        'discount' => 25.0,
                        'total' => 300.0, // 275 + 50 - 25
                        'items' => [
                            [
                                'quantity' => 2,
                                'unit_price' => 100.0,
                                'total_price' => 200.0,
                            ],
                            [
                                'quantity' => 1,
                                'unit_price' => 75.0,
                                'total_price' => 75.0,
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('determines cancellation eligibility correctly', function () {
            // Test different order statuses
            $testCases = [
                ['PENDING', true],
                ['CONFIRMED', true],
                ['PROCESSING', false],
                ['SHIPPED', false],
                ['DELIVERED', false],
                ['CANCELLED', false],
                ['REFUNDED', false],
            ];

            foreach ($testCases as [$status, $canCancel]) {
                $order = Order::factory()->create([
                    'user_id' => $this->user->id,
                    'order_status' => $status,
                ]);

                // Act
                $response = $this->actingAs($this->user)->graphQL('
                    query CanCancelOrder($id: ID!) {
                        order(id: $id) {
                            order_status
                            can_be_cancelled
                        }
                    }
                ', [
                    'id' => (string) $order->id,
                ]);

                // Assert
                $response->assertJson([
                    'data' => [
                        'order' => [
                            'order_status' => $status,
                            'can_be_cancelled' => $canCancel,
                        ],
                    ],
                ]);
            }
        });

        it('determines return eligibility correctly', function () {
            // Test different order statuses
            $testCases = [
                ['PENDING', false],
                ['CONFIRMED', false],
                ['PROCESSING', false],
                ['SHIPPED', false],
                ['DELIVERED', true],
                ['CANCELLED', false],
                ['REFUNDED', false],
            ];

            foreach ($testCases as [$status, $canReturn]) {
                $order = Order::factory()->create([
                    'user_id' => $this->user->id,
                    'order_status' => $status,
                    'delivered_at' => $status === 'DELIVERED' ? now()->subDays(1) : null,
                ]);

                // Act
                $response = $this->actingAs($this->user)->graphQL('
                    query CanReturnOrder($id: ID!) {
                        order(id: $id) {
                            order_status
                            can_be_returned
                        }
                    }
                ', [
                    'id' => (string) $order->id,
                ]);

                // Assert
                $response->assertJson([
                    'data' => [
                        'order' => [
                            'order_status' => $status,
                            'can_be_returned' => $canReturn,
                        ],
                    ],
                ]);
            }
        });
    });
});
