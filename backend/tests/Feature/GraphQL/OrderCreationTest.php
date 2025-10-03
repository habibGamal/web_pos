<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Order Creation GraphQL Operations', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();

        // Create shipping address
        $this->shippingAddress = Address::factory()->create([
            'user_id' => $this->user->id,
        ]);

        // Create products and variants for cart
        $this->product1 = Product::factory()->configurable()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'price' => 100.00,
        ]);

        $this->variant1 = Product::factory()->variant($this->product1)->create([
            'quantity' => 100,
            'is_active' => true,
            'is_default' => true,
            'price' => $this->product1->price,
        ]);

        $this->product2 = Product::factory()->configurable()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'price' => 75.00,
        ]);

        $this->variant2 = Product::factory()->variant($this->product2)->create([
            'quantity' => 50,
            'is_active' => true,
            'is_default' => true,
            'price' => $this->product2->price,
        ]);

        // Create cart with items
        $this->cart = Cart::factory()->create(['user_id' => $this->user->id]);
        CartItem::factory()->create([
            'cart_id' => $this->cart->id,
            'product_id' => $this->variant1->id,
            'quantity' => 2,
        ]);
        CartItem::factory()->create([
            'cart_id' => $this->cart->id,
            'product_id' => $this->variant2->id,
            'quantity' => 1,
        ]);
    });

    describe('Create Order Mutation', function () {
        it('creates order from cart successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CreateOrder($input: CreateOrderInput!) {
                    createOrder(input: $input) {
                        id
                        user_id
                        order_status
                        payment_status
                        subtotal
                        shipping_cost
                        total
                        currency
                        notes
                        can_be_cancelled
                        can_be_returned
                        items {
                            id
                            quantity
                            unit_price
                            subtotal
                            product {
                                id
                                name
                            }
                        }
                        shipping_address {
                            content
                            phone
                        }
                    }
                }
            ', [
                'input' => [
                    'shipping_address_id' => $this->shippingAddress->id,
                    'payment_method' => 'CASH_ON_DELIVERY',
                    'notes' => 'Test order notes',
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'createOrder' => [
                        'user_id' => (string) $this->user->id,
                        'order_status' => 'PROCESSING',
                        'payment_status' => 'PENDING',
                        'subtotal' => 275, // (2 * 100) + (1 * 75)
                        'currency' => 'EGP',
                        'notes' => 'Test order notes',
                        'can_be_cancelled' => true,
                        'can_be_returned' => false, // Pending orders cannot be returned
                        'items' => [
                            [
                                'quantity' => 2,
                                'unit_price' => 100,
                                'subtotal' => 200,
                                'product' => [
                                    'id' => (string) $this->variant1->id,
                                ],
                            ],
                            [
                                'quantity' => 1,
                                'unit_price' => 75,
                                'subtotal' => 75,
                                'product' => [
                                    'id' => (string) $this->variant2->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]);

            // Verify order was created in database
            $this->assertDatabaseHas('orders', [
                'user_id' => $this->user->id,
                'order_status' => 'PENDING',
                'payment_status' => 'PENDING',
                'subtotal' => 275.0,
            ]);

            // Verify order items were created
            $this->assertDatabaseCount('order_items', 2);

            // Verify cart was cleared
            $this->assertDatabaseCount('cart_items', 0);
        });

        it('calculates shipping cost correctly', function () {
            // Mock shipping calculation
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation CreateOrder($input: CreateOrderInput!) {
                    createOrder(input: $input) {
                        subtotal
                        shipping_cost
                        total
                    }
                }
            ', [
                'input' => [
                    'shipping_address' => [
                        'full_name' => 'John Doe',
                        'phone' => '+1234567890',
                        'address_line_1' => '123 Test Street',
                        'city' => 'Test City',
                        'state' => 'Test State',
                        'postal_code' => '12345',
                        'country' => 'Test Country',
                    ],
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert shipping cost is calculated
            $responseData = $response->json('data.createOrder');
            expect($responseData['shipping_cost'])->toBeFloat();
            expect($responseData['total'])->toBe($responseData['subtotal'] + $responseData['shipping_cost']);
        });

        it('validates empty cart', function () {
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
                        'address_line_1' => '123 Test Street',
                        'city' => 'Test City',
                        'state' => 'Test State',
                        'postal_code' => '12345',
                        'country' => 'Test Country',
                    ],
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Cannot create order with empty cart.',
                    ],
                ],
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
                        'full_name' => '',
                        'phone' => '',
                        'address_line_1' => '',
                        'city' => '',
                        'state' => '',
                        'postal_code' => '',
                        'country' => '',
                    ],
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [createOrder].',
                        'extensions' => [
                            'validation' => [
                                'input.shipping_address.full_name' => [
                                    'The input.shipping address.full name field is required.',
                                ],
                                'input.shipping_address.phone' => [
                                    'The input.shipping address.phone field is required.',
                                ],
                                'input.shipping_address.address_line_1' => [
                                    'The input.shipping address.address line 1 field is required.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('validates payment method', function () {
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
                        'address_line_1' => '123 Test Street',
                        'city' => 'Test City',
                        'state' => 'Test State',
                        'postal_code' => '12345',
                        'country' => 'Test Country',
                    ],
                    'payment_method' => 'INVALID_METHOD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Variable "$input" got invalid value "INVALID_METHOD" at "input.payment_method"; Value "INVALID_METHOD" does not exist in "PaymentMethod" enum.',
                    ],
                ],
            ]);
        });

        it('handles out of stock items', function () {
            // Arrange - Set variant out of stock
            $this->variant1->update(['quantity' => 0]);

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
                        'address_line_1' => '123 Test Street',
                        'city' => 'Test City',
                        'state' => 'Test State',
                        'postal_code' => '12345',
                        'country' => 'Test Country',
                    ],
                    'payment_method' => 'COD',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Some items in your cart are out of stock.',
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
                        'address_line_1' => '123 Test Street',
                        'city' => 'Test City',
                        'state' => 'Test State',
                        'postal_code' => '12345',
                        'country' => 'Test Country',
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

    describe('Order Queries', function () {
        beforeEach(function () {
            // Create test orders for query testing
            $this->order1 = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => 'PENDING',
                'payment_status' => 'PENDING',
                'subtotal' => 200.0,
                'shipping_cost' => 50.0,
                'total' => 250.0,
            ]);

            $this->order2 = Order::factory()->create([
                'user_id' => $this->user->id,
                'order_status' => 'CONFIRMED',
                'payment_status' => 'PAID',
                'subtotal' => 100.0,
                'shipping_cost' => 25.0,
                'total' => 125.0,
            ]);

            // Create order items
            OrderItem::factory()->create([
                'order_id' => $this->order1->id,
                'product_id' => $this->variant1->id,
                'quantity' => 2,
                'unit_price' => 100.0,
                'subtotal' => 200.0,
            ]);
        });

        it('retrieves user orders with pagination', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrders {
                    orders {
                        data {
                            id
                            order_status
                            payment_status
                            total
                            created_at
                        }
                        paginatorInfo {
                            total
                            count
                            currentPage
                        }
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'orders' => [
                        'data' => [
                            [
                                'id' => (string) $this->order2->id, // Latest first
                                'order_status' => 'CONFIRMED',
                                'payment_status' => 'PAID',
                                'total' => 125.0,
                            ],
                            [
                                'id' => (string) $this->order1->id,
                                'order_status' => 'PENDING',
                                'payment_status' => 'PENDING',
                                'total' => 250.0,
                            ],
                        ],
                        'paginatorInfo' => [
                            'total' => 2,
                            'count' => 2,
                        ],
                    ],
                ],
            ]);
        });

        it('retrieves single order by ID', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrder($id: ID!) {
                    order(id: $id) {
                        id
                        order_status
                        payment_status
                        subtotal
                        shipping_cost
                        total
                        currency
                        items {
                            id
                            quantity
                            unit_price
                            total_price
                            product {
                                id
                                name
                            }
                        }
                    }
                }
            ', [
                'id' => (string) $this->order1->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'order' => [
                        'id' => (string) $this->order1->id,
                        'order_status' => 'PENDING',
                        'payment_status' => 'PENDING',
                        'subtotal' => 200.0,
                        'shipping_cost' => 50.0,
                        'total' => 250.0,
                        'items' => [
                            [
                                'quantity' => 2,
                                'unit_price' => 100.0,
                                'total_price' => 200.0,
                                'product' => [
                                    'id' => (string) $this->product1->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('filters orders by status', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetOrdersByStatus($status: OrderStatus!) {
                    orders(status: $status) {
                        data {
                            id
                            order_status
                        }
                    }
                }
            ', [
                'status' => 'PENDING',
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'orders' => [
                        'data' => [
                            [
                                'id' => (string) $this->order1->id,
                                'order_status' => 'PENDING',
                            ],
                        ],
                    ],
                ],
            ]);

            // Verify only one order returned
            $orders = $response->json('data.orders.data');
            expect($orders)->toHaveCount(1);
        });

        it('prevents access to other users orders', function () {
            // Arrange
            $otherUser = User::factory()->create();

            // Act
            $response = $this->actingAs($otherUser)->graphQL('
                query GetOrder($id: ID!) {
                    order(id: $id) {
                        id
                    }
                }
            ', [
                'id' => (string) $this->order1->id,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'order' => null,
                ],
            ]);
        });
    });
});
