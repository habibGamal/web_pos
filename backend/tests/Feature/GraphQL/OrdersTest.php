<?php

declare(strict_types=1);

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Orders GraphQL Operations', function () {
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
        $this->variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'quantity' => 100,
            'is_active' => true,
            'is_default' => true,
            'price' => 100.00,
        ]);

        // Create cart with items for order creation tests
        $this->cart = Cart::factory()->create(['user_id' => $this->user->id]);
        $this->cartItem = CartItem::factory()->create([
            'cart_id' => $this->cart->id,
            'product_id' => $this->product->id,
            'product_variant_id' => $this->variant->id,
            'quantity' => 2,
        ]);
    });

    describe('Orders Query', function () {
        beforeEach(function () {
            $this->order = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => OrderStatus::PROCESSING,
                'payment_status' => PaymentStatus::PENDING,
                'subtotal' => 200.00,
                'shipping_cost' => 10.00,
                'total' => 230.00,
            ]);

            $this->orderItem = OrderItem::factory()->create([
                'order_id' => $this->order->id,
                'product_id' => $this->product->id,
                'variant_id' => $this->variant->id,
                'quantity' => 2,
                'unit_price' => 100.00,
                'subtotal' => 200.00,
            ]);
        });

        it('returns user orders with pagination', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrders($first: Int) {
                    orders(first: $first) {
                        data {
                            id
                            order_number
                            status
                            payment_status
                            subtotal
                            tax_amount
                            shipping_cost
                            total_amount
                            currency
                            created_at
                            can_be_cancelled
                            can_be_returned
                            items {
                                id
                                quantity
                                unit_price
                                total_price
                                product {
                                    id
                                    name_en
                                    name_ar
                                }
                                variant {
                                    id
                                }
                            }
                        }
                        paginatorInfo {
                            total
                            count
                            currentPage
                        }
                    }
                }
            ', [
                'first' => 10,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'orders' => [
                        'data' => [
                            [
                                'id' => (string) $this->order->id,
                                'order_number' => 'ORD-' . str_pad((string) $this->order->id, 6, '0', STR_PAD_LEFT),
                                'status' => 'PROCESSING',
                                'payment_status' => 'PENDING',
                                'subtotal' => 200.0,
                                'tax_amount' => 20.0, // 10% of subtotal
                                'shipping_cost' => 10.0,
                                'total_amount' => 230.0,
                                'currency' => 'EGP',
                                'items' => [
                                    [
                                        'id' => (string) $this->orderItem->id,
                                        'quantity' => 2,
                                        'unit_price' => 100.0,
                                        'total_price' => 200.0,
                                        'product' => [
                                            'id' => (string) $this->product->id,
                                            'name_en' => $this->product->name_en,
                                            'name_ar' => $this->product->name_ar,
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'paginatorInfo' => [
                            'total' => 1,
                            'count' => 1,
                        ],
                    ],
                ],
            ]);
        });

        it('filters orders by status', function () {
            // Arrange
            Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => OrderStatus::DELIVERED,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrdersByStatus($status: OrderStatus) {
                    orders(status: $status) {
                        data {
                            id
                            status
                        }
                    }
                }
            ', [
                'status' => 'PROCESSING',
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'orders' => [
                        'data' => [
                            [
                                'id' => (string) $this->order->id,
                                'status' => 'PROCESSING',
                            ],
                        ],
                    ],
                ],
            ]);

            expect($response->json('data.orders.data'))->toHaveCount(1);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                query GetOrders {
                    orders {
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

    describe('Single Order Query', function () {
        beforeEach(function () {
            $this->order = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => OrderStatus::PROCESSING,
            ]);
        });

        it('returns single order by ID', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrder($id: ID!) {
                    order(id: $id) {
                        id
                        order_number
                        status
                        user_id
                        can_be_cancelled
                        can_be_returned
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
                        'order_number' => 'ORD-' . str_pad((string) $this->order->id, 6, '0', STR_PAD_LEFT),
                        'status' => 'PROCESSING',
                        'user_id' => (string) $this->user->id,
                    ],
                ],
            ]);
        });

        it('prevents accessing other users orders', function () {
            // Arrange
            $otherUser = User::factory()->create();
            $otherOrder = Order::factory()->create(['user_id' => $otherUser->id]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrder($id: ID!) {
                    order(id: $id) {
                        id
                    }
                }
            ', [
                'id' => (string) $otherOrder->id,
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

        it('validates order exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrder($id: ID!) {
                    order(id: $id) {
                        id
                    }
                }
            ', [
                'id' => '999999',
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [order].',
                    ],
                ],
            ]);
        });
    });

    describe('Create Order Mutation', function () {
        it('creates order from cart successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CreateOrder($input: CreateOrderInput!) {
                    createOrder(input: $input) {
                        id
                        order_number
                        status
                        payment_status
                        subtotal
                        total_amount
                        shipping_address {
                            full_name
                            phone
                            address_line_1
                            city
                            country
                        }
                        items {
                            id
                            quantity
                            unit_price
                            total_price
                        }
                    }
                }
            ', [
                'input' => [
                    'shipping_address' => [
                        'full_name' => 'John Doe',
                        'phone' => '+1234567890',
                        'address_line_1' => '123 Main St',
                        'city' => 'Cairo',
                        'state' => 'Cairo',
                        'postal_code' => '12345',
                        'country' => 'Egypt',
                    ],
                    'payment_method' => 'COD',
                    'notes' => 'Please call before delivery',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'createOrder' => [
                        'status' => 'PROCESSING',
                        'payment_status' => 'PENDING',
                        'shipping_address' => [
                            'full_name' => 'John Doe',
                            'phone' => '+1234567890',
                            'address_line_1' => '123 Main St',
                            'city' => 'Cairo',
                            'country' => 'Egypt',
                        ],
                        'items' => [
                            [
                                'quantity' => 2,
                                'unit_price' => 100,
                                'total_price' => 200,
                            ],
                        ],
                    ],
                ],
            ]);

            // Verify order was created
            $this->assertDatabaseHas('orders', [
                'user_id' => $this->user->id,
                'order_status' => 'processing',
            ]);

            // Verify cart was cleared
            $this->assertDatabaseMissing('cart_items', [
                'cart_id' => $this->cart->id,
            ]);
        });

        it('validates required shipping address fields', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CreateOrder($input: CreateOrderInput!) {
                    createOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'shipping_address' => [
                        'full_name' => null,
                        'phone' => null,
                        'address_line_1' => null,
                        'city' => null,
                        'state' => null,
                        'postal_code' => null,
                        'country' => null,
                    ],
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value null at "input.shipping_address.full_name"; Expected non-nullable type "String!" not to be null.',
                    ],
                ],
            ]);
        });

        it('fails when cart is empty', function () {
            // Arrange - Clear cart
            $this->cart->items()->delete();

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CreateOrder($input: CreateOrderInput!) {
                    createOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'shipping_address' => [
                        'full_name' => 'John Doe',
                        'phone' => '+1234567890',
                        'address_line_1' => '123 Main St',
                        'city' => 'Cairo',
                        'state' => 'Cairo',
                        'postal_code' => '12345',
                        'country' => 'Egypt',
                    ],
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Cannot perform this action with an empty cart',
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                mutation CreateOrder($input: CreateOrderInput!) {
                    createOrder(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'shipping_address' => [
                        'full_name' => 'John Doe',
                        'phone' => '+1234567890',
                        'address_line_1' => '123 Main St',
                        'city' => 'Cairo',
                        'state' => 'Cairo',
                        'postal_code' => '12345',
                        'country' => 'Egypt',
                    ],
                    'payment_method' => 'COD',
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

    describe('Cancel Order Mutation', function () {
        beforeEach(function () {
            $this->order = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => OrderStatus::PROCESSING,
            ]);
        });

        it('cancels order successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CancelOrder($input: CancelOrderInput!) {
                    cancelOrder(input: $input) {
                        id
                        status
                    }
                }
            ', [
                'input' => [
                    'order_id' => (string) $this->order->id,
                    'reason' => 'Changed my mind',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'cancelOrder' => [
                        'id' => (string) $this->order->id,
                        'status' => 'CANCELLED',
                    ],
                ],
            ]);

            // Verify order status was updated
            $this->assertDatabaseHas('orders', [
                'id' => $this->order->id,
                'order_status' => 'cancelled',
            ]);
        });

        it('prevents cancelling non-cancellable orders', function () {
            // Arrange - Update order to delivered status
            $this->order->update(['order_status' => OrderStatus::DELIVERED]);

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
                    'reason' => 'Changed my mind',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'This order cannot be cancelled.',
                    ],
                ],
            ]);
        });

        it('prevents cancelling other users orders', function () {
            // Arrange
            $otherUser = User::factory()->create();
            $otherOrder = Order::factory()->create([
                'user_id' => $otherUser->id,
                'order_status' => OrderStatus::PROCESSING,
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
                    'order_id' => (string) $otherOrder->id,
                    'reason' => 'Changed my mind',
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
    });
});
