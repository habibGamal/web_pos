<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Cart GraphQL Operations', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();
        $this->product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'price' => 100.00,
            'sale_price' => null,
        ]);
        $this->variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'quantity' => 100,
            'is_active' => true,
            'is_default' => true,
            'price' => null, // Use product price
            'sale_price' => null,
        ]);
    });

    describe('Cart Query', function () {
        it('returns current user cart', function () {
            // Arrange
            $cart = Cart::factory()->create(['user_id' => $this->user->id]);
            $cartItem = CartItem::factory()->create([
                'cart_id' => $cart->id,
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetCart {
                    cart {
                        id
                        user_id
                        total_price
                        total_items
                        total_quantity
                        is_empty
                        items {
                            id
                            quantity
                            unit_price
                            total_price
                            is_available
                            variant {
                                id
                                name
                                sku
                            }
                            product {
                                id
                                name
                                slug
                            }
                        }
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'cart' => [
                        'id' => (string) $cart->id,
                        'user_id' => (string) $this->user->id,
                        'total_price' => 200.0,
                        'total_items' => 1,
                        'total_quantity' => 2,
                        'is_empty' => false,
                        'items' => [
                            [
                                'id' => (string) $cartItem->id,
                                'quantity' => 2,
                                'unit_price' => 100.0,
                                'total_price' => 200.0,
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('returns empty cart for new user', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetCart {
                    cart {
                        id
                        total_price
                        total_items
                        total_quantity
                        is_empty
                        items {
                            id
                        }
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'cart' => [
                        'total_price' => 0.0,
                        'total_items' => 0,
                        'total_quantity' => 0,
                        'is_empty' => true,
                        'items' => [],
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            // Act
            Auth::logout();
            $response = $this->graphQL('
                query GetCart {
                    cart {
                        id
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

    describe('Add to Cart Mutation', function () {
        it('adds product variant to cart successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToCart($input: AddToCartInput!) {
                    addToCart(input: $input) {
                        id
                        quantity
                        unit_price
                        total_price
                        variant {
                            id
                        }
                        product {
                            id
                        }
                    }
                }
            ', [
                'input' => [
                    'product_variant_id' => (string) $this->variant->id,
                    'quantity' => 3,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'addToCart' => [
                        'quantity' => 3,
                        'unit_price' => 100.0,
                        'total_price' => 300.0,
                        'variant' => [
                            'id' => (string) $this->variant->id,
                        ],
                        'product' => [
                            'id' => (string) $this->product->id,
                        ],
                    ],
                ],
            ]);

            // Verify cart item was created
            $this->assertDatabaseHas('cart_items', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 3,
            ]);
        });

        it('increases quantity when adding existing item', function () {
            // Arrange - Add item first time
            $cart = Cart::factory()->create(['user_id' => $this->user->id]);
            CartItem::factory()->create([
                'cart_id' => $cart->id,
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);

            // Act - Add same item again
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToCart($input: AddToCartInput!) {
                    addToCart(input: $input) {
                        quantity
                        total_price
                    }
                }
            ', [
                'input' => [
                    'product_variant_id' => (string) $this->variant->id,
                    'quantity' => 1,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'addToCart' => [
                        'quantity' => 3, // 2 + 1
                    ],
                ],
            ]);
        });

        it('validates product variant exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToCart($input: AddToCartInput!) {
                    addToCart(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'product_variant_id' => '999999',
                    'quantity' => 1,
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [addToCart].',
                        'extensions' => [
                            'validation' => [
                                'input.product_variant_id' => [
                                    'The selected input.product variant id is invalid.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('validates quantity is positive', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToCart($input: AddToCartInput!) {
                    addToCart(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'product_variant_id' => (string) $this->variant->id,
                    'quantity' => 0,
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'The quantity field must be at least 1.',
                        'extensions' => [
                            'validation' => [
                                'quantity' => [
                                    'The quantity field must be at least 1.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('requires authentication', function () {
            Auth::logout();
            // Act
            $response = $this->graphQL('
                mutation AddToCart($input: AddToCartInput!) {
                    addToCart(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'product_variant_id' => (string) $this->variant->id,
                    'quantity' => 1,
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

    describe('Update Cart Item Mutation', function () {
        beforeEach(function () {
            $this->cart = Cart::factory()->create(['user_id' => $this->user->id]);
            $this->cartItem = CartItem::factory()->create([
                'cart_id' => $this->cart->id,
                'product_id' => $this->product->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 5,
            ]);
        });

        it('updates cart item quantity successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation UpdateCartItem($input: UpdateCartItemInput!) {
                    updateCartItem(input: $input) {
                        id
                        quantity
                        total_price
                    }
                }
            ', [
                'input' => [
                    'cart_item_id' => (string) $this->cartItem->id,
                    'quantity' => 3,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'updateCartItem' => [
                        'id' => (string) $this->cartItem->id,
                        'quantity' => 3,
                        'total_price' => 300.0,
                    ],
                ],
            ]);

            // Verify database was updated
            $this->assertDatabaseHas('cart_items', [
                'id' => $this->cartItem->id,
                'quantity' => 3,
            ]);
        });

        it('removes item when quantity is zero', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation UpdateCartItem($input: UpdateCartItemInput!) {
                    updateCartItem(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'cart_item_id' => (string) $this->cartItem->id,
                    'quantity' => 0,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'updateCartItem' => null,
                ],
            ]);

            // Verify item was deleted
            $this->assertDatabaseMissing('cart_items', [
                'id' => $this->cartItem->id,
            ]);
        });

        it('validates cart item exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation UpdateCartItem($input: UpdateCartItemInput!) {
                    updateCartItem(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'cart_item_id' => '999999',
                    'quantity' => 2,
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [updateCartItem].',
                        'extensions' => [
                            'validation' => [
                                'input.cart_item_id' => [
                                    'The selected input.cart item id is invalid.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('prevents updating other users cart items', function () {
            // Arrange
            $otherUser = User::factory()->create();
            $otherCart = Cart::factory()->create(['user_id' => $otherUser->id]);
            $otherCartItem = CartItem::factory()->create([
                'cart_id' => $otherCart->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation UpdateCartItem($input: UpdateCartItemInput!) {
                    updateCartItem(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'cart_item_id' => (string) $otherCartItem->id,
                    'quantity' => 5,
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Cart item not found or access denied.',
                    ],
                ],
            ]);
        });
    });

    describe('Remove from Cart Mutation', function () {
        beforeEach(function () {
            $this->cart = Cart::factory()->create(['user_id' => $this->user->id]);
            $this->cartItem = CartItem::factory()->create([
                'cart_id' => $this->cart->id,
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);
        });

        it('removes item from cart successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RemoveFromCart($input: RemoveFromCartInput!) {
                    removeFromCart(input: $input)
                }
            ', [
                'input' => [
                    'cart_item_id' => (string) $this->cartItem->id,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'removeFromCart' => true,
                ],
            ]);

            // Verify item was deleted
            $this->assertDatabaseMissing('cart_items', [
                'id' => $this->cartItem->id,
            ]);
        });

        it('validates cart item exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RemoveFromCart($input: RemoveFromCartInput!) {
                    removeFromCart(input: $input)
                }
            ', [
                'input' => [
                    'cart_item_id' => '999999',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [removeFromCart].',
                        'extensions' => [
                            'validation' => [
                                'input.cart_item_id' => [
                                    'The selected input.cart item id is invalid.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
    });

    describe('Clear Cart Mutation', function () {
        beforeEach(function () {
            $this->cart = Cart::factory()->create(['user_id' => $this->user->id]);
            CartItem::factory()->count(3)->create([
                'cart_id' => $this->cart->id,
                'product_variant_id' => $this->variant->id,
            ]);
        });

        it('clears all items from cart successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation ClearCart {
                    clearCart
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'clearCart' => true,
                ],
            ]);

            // Verify all items were deleted
            $this->assertDatabaseMissing('cart_items', [
                'cart_id' => $this->cart->id,
            ]);
        });

        it('returns true even for empty cart', function () {
            // Arrange - Clear cart first
            $this->cart->items()->delete();

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation ClearCart {
                    clearCart
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'clearCart' => true,
                ],
            ]);
        });
    });
});
