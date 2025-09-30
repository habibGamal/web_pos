<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\WishlistItem;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Wishlist GraphQL Operations', function () {
    beforeEach(function () {
        $this->user = User::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();
        $this->product = Product::factory()->create([
            'category_id' => $this->category->id,
            'brand_id' => $this->brand->id,
            'is_active' => true,
        ]);
        $this->variant = ProductVariant::factory()->create([
            'product_id' => $this->product->id,
            'quantity' => 100,
            'is_active' => true,
            'is_default' => true,
        ]);
    });

    describe('Wishlist Query', function () {
        it('returns user wishlist items', function () {
            // Arrange
            $wishlistItem = WishlistItem::factory()->create([
                'user_id' => $this->user->id,
                'product_id' => $this->product->id,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetWishlist {
                    wishlist {
                        id
                        user_id
                        product_id
                        created_at
                        product {
                            id
                            name
                            slug
                            price
                            effective_price
                            is_in_stock
                            featured_image
                            category {
                                id
                                name
                            }
                            brand {
                                id
                                name
                            }
                        }
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'wishlist' => [
                        [
                            'id' => (string) $wishlistItem->id,
                            'user_id' => (string) $this->user->id,
                            'product_id' => (string) $this->product->id,
                            'product' => [
                                'id' => (string) $this->product->id,
                                'slug' => $this->product->slug,
                            ],
                        ],
                    ],
                ],
            ]);

            // Verify the wishlist has one item
            $responseData = $response->json();
            expect($responseData['data']['wishlist'])->toHaveCount(1);

            // Verify the created_at field is present and properly formatted
            expect($responseData['data']['wishlist'][0]['created_at'])->toBeString();
            expect($responseData['data']['wishlist'][0]['created_at'])->toMatch('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/');

            // Verify the product details are present
            expect($responseData['data']['wishlist'][0]['product']['name'])->toBeString();
            expect($responseData['data']['wishlist'][0]['product']['price'])->toBeFloat();
            expect($responseData['data']['wishlist'][0]['product']['effective_price'])->toBeFloat();
            expect($responseData['data']['wishlist'][0]['product']['is_in_stock'])->toBeBool();
        });

        it('returns empty array for user with no wishlist items', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetWishlist {
                    wishlist {
                        id
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'wishlist' => [],
                ],
            ]);
        });

        it('returns empty array for unauthenticated user', function () {
            // Act
            $response = $this->graphQL('
                query GetWishlist {
                    wishlist {
                        id
                    }
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'wishlist' => [],
                ],
            ]);
        });
    });

    describe('Wishlist Count Query', function () {
        it('returns correct wishlist count', function () {
            // Arrange
            WishlistItem::factory()->count(3)->create([
                'user_id' => $this->user->id,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetWishlistCount {
                    wishlistCount
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'wishlistCount' => 3,
                ],
            ]);
        });

        it('returns zero for empty wishlist', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                query GetWishlistCount {
                    wishlistCount
                }
            ');

            // Assert
            $response->assertJson([
                'data' => [
                    'wishlistCount' => 0,
                ],
            ]);
        });
    });

    describe('Add to Wishlist Mutation', function () {
        it('adds product to wishlist successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToWishlist($input: AddToWishlistInput!) {
                    addToWishlist(input: $input) {
                        id
                        user_id
                        product_id
                        product {
                            id
                            name
                        }
                    }
                }
            ', [
                'input' => [
                    'product_id' => (string) $this->product->id,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'addToWishlist' => [
                        'user_id' => (string) $this->user->id,
                        'product_id' => (string) $this->product->id,
                        'product' => [
                            'id' => (string) $this->product->id,
                        ],
                    ],
                ],
            ]);

            // Verify wishlist item was created
            $this->assertDatabaseHas('wishlist_items', [
                'user_id' => $this->user->id,
                'product_id' => $this->product->id,
            ]);
        });

        it('prevents duplicate wishlist items', function () {
            // Arrange - Add item first
            WishlistItem::factory()->create([
                'user_id' => $this->user->id,
                'product_id' => $this->product->id,
            ]);

            // Act - Try to add same item again
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToWishlist($input: AddToWishlistInput!) {
                    addToWishlist(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'product_id' => (string) $this->product->id,
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Product is already in your wishlist.',
                    ],
                ],
            ]);

            // Verify only one item exists
            $this->assertDatabaseCount('wishlist_items', 1);
        });

        it('validates product exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation AddToWishlist($input: AddToWishlistInput!) {
                    addToWishlist(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'product_id' => '999999',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [addToWishlist].',
                        'extensions' => [
                            'validation' => [
                                'input.product_id' => [
                                    'The selected input.product id is invalid.',
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
                mutation AddToWishlist($input: AddToWishlistInput!) {
                    addToWishlist(input: $input) {
                        id
                    }
                }
            ', [
                'input' => [
                    'product_id' => (string) $this->product->id,
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

    describe('Remove from Wishlist Mutation', function () {
        beforeEach(function () {
            $this->wishlistItem = WishlistItem::factory()->create([
                'user_id' => $this->user->id,
                'product_id' => $this->product->id,
            ]);
        });

        it('removes product from wishlist successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RemoveFromWishlist($input: RemoveFromWishlistInput!) {
                    removeFromWishlist(input: $input)
                }
            ', [
                'input' => [
                    'product_id' => (string) $this->product->id,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'removeFromWishlist' => true,
                ],
            ]);

            // Verify item was deleted
            $this->assertDatabaseMissing('wishlist_items', [
                'id' => $this->wishlistItem->id,
            ]);
        });

        it('returns false when product not in wishlist', function () {
            // Arrange
            $otherProduct = Product::factory()->create([
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RemoveFromWishlist($input: RemoveFromWishlistInput!) {
                    removeFromWishlist(input: $input)
                }
            ', [
                'input' => [
                    'product_id' => (string) $otherProduct->id,
                ],
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'removeFromWishlist' => false,
                ],
            ]);
        });

        it('validates product exists', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
                mutation RemoveFromWishlist($input: RemoveFromWishlistInput!) {
                    removeFromWishlist(input: $input)
                }
            ', [
                'input' => [
                    'product_id' => '999999',
                ],
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [removeFromWishlist].',
                        'extensions' => [
                            'validation' => [
                                'input.product_id' => [
                                    'The selected input.product id is invalid.',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
    });

    describe('Move Wishlist to Cart Mutation', function () {
        beforeEach(function () {
            $this->wishlistItem = WishlistItem::factory()->create([
                'user_id' => $this->user->id,
                'product_id' => $this->product->id,
            ]);
        });

        it('moves item from wishlist to cart successfully', function () {
            // Act
            $response = $this->actingAs($this->user)->graphQL('
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
                        variant {
                            id
                        }
                        product {
                            id
                        }
                    }
                }
            ', [
                'product_id' => (string) $this->product->id,
                'product_variant_id' => (string) $this->variant->id,
                'quantity' => 2,
            ]);

            // Assert
            $response->assertJson([
                'data' => [
                    'moveWishlistToCart' => [
                        'quantity' => 2,
                        'variant' => [
                            'id' => (string) $this->variant->id,
                        ],
                        'product' => [
                            'id' => (string) $this->product->id,
                        ],
                    ],
                ],
            ]);

            // Verify item was added to cart
            $this->assertDatabaseHas('cart_items', [
                'product_variant_id' => $this->variant->id,
                'quantity' => 2,
            ]);

            // Verify item was removed from wishlist
            $this->assertDatabaseMissing('wishlist_items', [
                'id' => $this->wishlistItem->id,
            ]);
        });

        it('validates product is in wishlist', function () {
            // Arrange
            $otherProduct = Product::factory()->create([
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
            ]);
            $otherVariant = ProductVariant::factory()->create([
                'product_id' => $otherProduct->id,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
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
                    }
                }
            ', [
                'product_id' => (string) $otherProduct->id,
                'product_variant_id' => (string) $otherVariant->id,
                'quantity' => 1,
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Product not found in your wishlist.',
                    ],
                ],
            ]);
        });

        it('validates variant belongs to product', function () {
            // Arrange
            $otherProduct = Product::factory()->create([
                'category_id' => $this->category->id,
                'brand_id' => $this->brand->id,
            ]);
            $otherVariant = ProductVariant::factory()->create([
                'product_id' => $otherProduct->id,
            ]);

            // Act
            $response = $this->actingAs($this->user)->graphQL('
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
                    }
                }
            ', [
                'product_id' => (string) $this->product->id,
                'product_variant_id' => (string) $otherVariant->id,
                'quantity' => 1,
            ]);

            // Assert
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Product variant does not belong to the specified product.',
                    ],
                ],
            ]);
        });
    });
});
