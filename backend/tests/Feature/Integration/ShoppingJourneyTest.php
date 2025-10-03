<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Complete Shopping Journey Integration', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();

        // Create products with variants
        $this->product1 = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'price' => 100.00,
        ]);

        $this->variant1 = Product::factory()->variant()->create([
            'product_id' => $this->product1->id,
            'quantity' => 100,
            'is_active' => true,
            'is_default' => true,
            'price' => null, // Use product price
        ]);

        $this->product2 = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
            'price' => 75.00,
        ]);

        $this->variant2 = Product::factory()->variant()->create([
            'product_id' => $this->product2->id,
            'quantity' => 50,
            'is_active' => true,
            'is_default' => true,
            'price' => null, // Use product price
        ]);
    });

    it('completes full shopping journey: wishlist → cart → manage cart', function () {
        // Step 1: User adds products to wishlist
        $this->actingAs($this->user)->graphQL('
            mutation AddToWishlist($input: AddToWishlistInput!) {
                addToWishlist(input: $input) {
                    id
                    product_id
                }
            }
        ', [
            'input' => ['product_id' => (string) $this->product1->id],
        ])->assertJson([
            'data' => [
                'addToWishlist' => [
                    'product_id' => (string) $this->product1->id,
                ],
            ],
        ]);

        $this->actingAs($this->user)->graphQL('
            mutation AddToWishlist($input: AddToWishlistInput!) {
                addToWishlist(input: $input) {
                    id
                    product_id
                }
            }
        ', [
            'input' => ['product_id' => (string) $this->product2->id],
        ])->assertJson([
            'data' => [
                'addToWishlist' => [
                    'product_id' => (string) $this->product2->id,
                ],
            ],
        ]);

        // Step 2: Verify wishlist count
        $this->actingAs($this->user)->graphQL('
            query GetWishlistCount {
                wishlistCount
            }
        ')->assertJson([
            'data' => ['wishlistCount' => 2],
        ]);

        // Step 3: Move one item from wishlist to cart
        $this->actingAs($this->user)->graphQL('
            mutation MoveWishlistToCart(
                $product_id: ID!
                $product_variant_id: ID!
                $quantity: Int!
            ) {
                moveWishlistToCart(
                    product_id: $product_id
                    product_variant_id: $product_variant_id
                    quantity: $quantity
                ) {
                    id
                    quantity
                    total_price
                }
            }
        ', [
            'product_id' => (string) $this->product1->id,
            'product_variant_id' => (string) $this->variant1->id,
            'quantity' => 2,
        ])->assertJson([
            'data' => [
                'moveWishlistToCart' => [
                    'quantity' => 2,
                    'total_price' => 200.0,
                ],
            ],
        ]);

        // Step 4: Add second product directly to cart
        $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                    quantity
                    total_price
                }
            }
        ', [
            'input' => [
                'product_variant_id' => (string) $this->variant2->id,
                'quantity' => 1,
            ],
        ])->assertJson([
            'data' => [
                'addToCart' => [
                    'quantity' => 1,
                    'total_price' => 75.0,
                ],
            ],
        ]);

        // Step 5: Verify cart state
        $cartResponse = $this->actingAs($this->user)->graphQL('
            query GetCart {
                cart {
                    total_price
                    total_items
                    total_quantity
                    is_empty
                    items {
                        id
                        quantity
                        total_price
                        product {
                            id
                            name
                        }
                    }
                }
            }
        ');

        $cartResponse->assertJson([
            'data' => [
                'cart' => [
                    'total_price' => 275.0, // 200 + 75
                    'total_items' => 2,
                    'total_quantity' => 3, // 2 + 1
                    'is_empty' => false,
                ],
            ],
        ]);

        // Step 6: Update cart item quantity
        $cartData = $cartResponse->json('data.cart');
        $firstCartItemId = $cartData['items'][0]['id'];

        $this->actingAs($this->user)->graphQL('
            mutation UpdateCartItem($input: UpdateCartItemInput!) {
                updateCartItem(input: $input) {
                    id
                    quantity
                    total_price
                }
            }
        ', [
            'input' => [
                'cart_item_id' => $firstCartItemId,
                'quantity' => 3,
            ],
        ]);

        // Step 7: Verify updated cart totals
        $this->actingAs($this->user)->graphQL('
            query GetCart {
                cart {
                    total_price
                    total_quantity
                }
            }
        ')->assertJson([
            'data' => [
                'cart' => [
                    'total_price' => 375.0, // (3 * 100) + 75
                    'total_quantity' => 4, // 3 + 1
                ],
            ],
        ]);

        // Step 8: Remove item from cart
        $secondCartItemId = $cartData['items'][1]['id'];
        $this->actingAs($this->user)->graphQL('
            mutation RemoveFromCart($input: RemoveFromCartInput!) {
                removeFromCart(input: $input)
            }
        ', [
            'input' => ['cart_item_id' => $secondCartItemId],
        ])->assertJson([
            'data' => ['removeFromCart' => true],
        ]);

        // Step 9: Verify final cart state
        $this->actingAs($this->user)->graphQL('
            query GetCart {
                cart {
                    total_price
                    total_items
                    total_quantity
                    items {
                        quantity
                        product {
                            id
                        }
                    }
                }
            }
        ')->assertJson([
            'data' => [
                'cart' => [
                    'total_price' => 300.0, // 3 * 100
                    'total_items' => 1,
                    'total_quantity' => 3,
                    'items' => [
                        [
                            'quantity' => 3,
                            'product' => [
                                'id' => (string) $this->product1->id,
                            ],
                        ],
                    ],
                ],
            ],
        ]);

        // Step 10: Verify wishlist only has one item left
        $this->actingAs($this->user)->graphQL('
            query GetWishlistCount {
                wishlistCount
            }
        ')->assertJson([
            'data' => ['wishlistCount' => 1],
        ]);

        // Verify database state
        $this->assertDatabaseCount('cart_items', 1);
        $this->assertDatabaseCount('wishlist_items', 1);
        $this->assertDatabaseHas('wishlist_items', [
            'user_id' => $this->user->id,
            'product_id' => $this->product2->id,
        ]);
    });

    it('handles cart persistence across sessions', function () {
        // Step 1: Add items to cart
        $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_variant_id' => (string) $this->variant1->id,
                'quantity' => 2,
            ],
        ]);

        // Step 2: Simulate logout/login by creating new request
        $this->actingAs($this->user)->graphQL('
            query GetCart {
                cart {
                    total_items
                    total_quantity
                    items {
                        quantity
                        product {
                            id
                        }
                    }
                }
            }
        ')->assertJson([
            'data' => [
                'cart' => [
                    'total_items' => 1,
                    'total_quantity' => 2,
                    'items' => [
                        [
                            'quantity' => 2,
                            'product' => [
                                'id' => (string) $this->product1->id,
                            ],
                        ],
                    ],
                ],
            ],
        ]);
    });

    it('prevents adding out of stock items to cart', function () {
        // Set variant to out of stock
        $this->variant1->update(['quantity' => 0]);

        // Attempt to add to cart
        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_variant_id' => (string) $this->variant1->id,
                'quantity' => 1,
            ],
        ]);

        // Should fail validation or business logic
        $response->assertJsonStructure([
            'errors' => [
                ['message'],
            ],
        ]);
    });

    it('handles concurrent cart modifications gracefully', function () {
        // Add initial item
        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_variant_id' => (string) $this->variant1->id,
                'quantity' => 5,
            ],
        ]);

        $cartItemId = $response->json('data.addToCart.id');

        // Simulate concurrent updates
        $this->actingAs($this->user)->graphQL('
            mutation UpdateCartItem($input: UpdateCartItemInput!) {
                updateCartItem(input: $input) {
                    quantity
                }
            }
        ', [
            'input' => [
                'cart_item_id' => $cartItemId,
                'quantity' => 3,
            ],
        ])->assertJson([
            'data' => [
                'updateCartItem' => [
                    'quantity' => 3,
                ],
            ],
        ]);

        // Another update should work on the current state
        $this->actingAs($this->user)->graphQL('
            mutation UpdateCartItem($input: UpdateCartItemInput!) {
                updateCartItem(input: $input) {
                    quantity
                }
            }
        ', [
            'input' => [
                'cart_item_id' => $cartItemId,
                'quantity' => 1,
            ],
        ])->assertJson([
            'data' => [
                'updateCartItem' => [
                    'quantity' => 1,
                ],
            ],
        ]);
    });

    it('clears entire cart successfully', function () {
        // Add multiple items
        $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) { id }
            }
        ', [
            'input' => [
                'product_variant_id' => (string) $this->variant1->id,
                'quantity' => 2,
            ],
        ]);

        $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) { id }
            }
        ', [
            'input' => [
                'product_variant_id' => (string) $this->variant2->id,
                'quantity' => 1,
            ],
        ]);

        // Clear cart
        $this->actingAs($this->user)->graphQL('
            mutation ClearCart {
                clearCart
            }
        ')->assertJson([
            'data' => ['clearCart' => true],
        ]);

        // Verify cart is empty
        $this->actingAs($this->user)->graphQL('
            query GetCart {
                cart {
                    is_empty
                    total_items
                    items {
                        id
                    }
                }
            }
        ')->assertJson([
            'data' => [
                'cart' => [
                    'is_empty' => true,
                    'total_items' => 0,
                    'items' => [],
                ],
            ],
        ]);

        $this->assertDatabaseCount('cart_items', 0);
    });
});
