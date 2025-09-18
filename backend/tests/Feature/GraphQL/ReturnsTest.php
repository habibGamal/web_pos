<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Enums\ReturnOrderStatus;
use App\Models\Address;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ReturnOrder;
use App\Models\ReturnOrderItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Returns GraphQL Operations', function () {
    beforeEach(function () {
        // Ensure returns are enabled for tests
        \App\Services\ReturnPolicyService::set('returns_enabled', true);
        \App\Services\ReturnPolicyService::set('return_window_days', 30);

        $this->user = User::factory()->create();
        $this->otherUser = User::factory()->create();

        // Create product data
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();
        $this->product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
        ]);
        $this->productVariant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
        ]);

        // Create address
        $this->address = Address::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Create order
        $this->order = Order::factory()->create([
            'user_id' => $this->user->id,
            'order_status' => OrderStatus::DELIVERED,
            'delivered_at' => now()->subDays(1), // Delivered yesterday, within return window
        ]);

        $this->orderItem = OrderItem::factory()->create([
            'order_id' => $this->order->id,
            'variant_id' => $this->productVariant->id,
            'quantity' => 2,
            'unit_price' => 50.0,
        ]);

        // Create return order
        $this->returnOrder = ReturnOrder::factory()->create([
            'order_id' => $this->order->id,
            'status' => ReturnOrderStatus::REQUESTED,
        ]);

        $this->returnOrderItem = ReturnOrderItem::factory()->create([
            'return_order_id' => $this->returnOrder->id,
            'order_item_id' => $this->orderItem->id,
            'quantity' => 1,
            'unit_price' => 50.0,
        ]);
    });

    describe('Returns Query', function () {
        it('returns paginated list of returns for authenticated user', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetReturns {
                    returns {
                        data {
                            id
                            status
                            reason
                            returnItems {
                                id
                                quantity
                                unit_price
                                orderItem {
                                    id
                                }
                            }
                            order {
                                id
                            }
                        }
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'returns' => [
                        'data' => [
                            [
                                'id' => (string) $this->returnOrder->id,
                                'status' => 'REQUESTED',
                                'reason' => $this->returnOrder->reason,
                                'returnItems' => [
                                    [
                                        'id' => (string) $this->returnOrderItem->id,
                                        'quantity' => 1,
                                        'unit_price' => 50.0,
                                        'orderItem' => [
                                            'id' => (string) $this->orderItem->id,
                                        ],
                                    ],
                                ],
                                'order' => [
                                    'id' => (string) $this->order->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

            expect($response->json('data.returns.data'))->toHaveCount(1);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                query GetReturns {
                    returns {
                        data {
                            id
                        }
                    }
                }
            ');

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

    describe('Create Return Mutation', function () {
        it('creates a return successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CreateReturn($input: CreateReturnInput!) {
                    createReturn(input: $input) {
                        id
                        status
                        reason
                        notes
                        returnItems {
                            id
                            quantity
                            unit_price
                            orderItem {
                                id
                            }
                        }
                        order {
                            id
                        }
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'DEFECTIVE',
                    'items' => [
                        [
                            'order_item_id' => (string) $this->orderItem->id,
                            'quantity' => 1,
                        ],
                    ],
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'createReturn' => [
                        'status' => 'REQUESTED',
                        'reason' => 'DEFECTIVE',
                        'returnItems' => [
                            [
                                'quantity' => 1,
                                'unit_price' => 50,
                                'orderItem' => [
                                    'id' => (string) $this->orderItem->id,
                                ],
                            ],
                        ],
                        'order' => [
                            'id' => (string) $this->order->id,
                        ],
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                mutation CreateReturn($input: CreateReturnInput!) {
                    createReturn(input: $input) {
                        id
                        status
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'DEFECTIVE',
                    'items' => [
                        [
                            'order_item_id' => (string) $this->orderItem->id,
                            'quantity' => 1,
                        ],
                    ],
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

    describe('Cancel Return Mutation', function () {
        it('cancels a return successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CancelReturn($return_id: ID!) {
                    cancelReturn(return_id: $return_id) {
                        id
                        status
                    }
                }
            ', [
                'return_id' => (string) $this->returnOrder->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'cancelReturn' => [
                        'id' => (string) $this->returnOrder->id,
                        'status' => 'CANCELLED',
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                mutation CancelReturn($return_id: ID!) {
                    cancelReturn(return_id: $return_id) {
                        id
                        status
                    }
                }
            ', [
                'return_id' => (string) $this->returnOrder->id,
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
});
