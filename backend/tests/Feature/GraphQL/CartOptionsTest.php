<?php

use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

beforeEach(function () {
    $this->user = User::factory()->create();

    // Create category and brand
    $category = Category::factory()->create();
    $brand = Brand::factory()->create();

    // Create a simple product with manual setup to avoid factory issues
    $this->product = Product::create([
        'name_en' => 'Test Product',
        'name_ar' => 'منتج تجريبي',
        'slug' => 'test-product',
        'description_en' => 'Test description',
        'description_ar' => 'وصف تجريبي',
        'type' => 'simple',
        'parent_id' => null,
        'sku' => 'TEST-SKU-001',
        'price' => 100.00,
        'cost_price' => 50.00,
        'quantity' => 10,
        'images' => ['products/test.jpg'],
        'category_id' => $category->id,
        'brand_id' => $brand->id,
        'is_active' => true,
        'is_featured' => false,
        'is_default' => false,
    ]);
});

describe('Cart with Product Options', function () {
    it('adds product to cart with options', function () {
        $options = json_encode(['Color' => 'Red', 'Size' => 'Large']);

        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                    quantity
                    options
                    product {
                        id
                        name
                    }
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 2,
                'options' => $options,
            ],
        ]);

        $response->assertJson([
            'data' => [
                'addToCart' => [
                    'quantity' => 2,
                    'options' => $options,
                    'product' => [
                        'id' => (string) $this->product->id,
                    ],
                ],
            ],
        ]);

        // Verify cart item was created with options
        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 2,
            'options' => $options,
        ]);
    });

    it('treats same product with different options as separate cart items', function () {
        $options1 = json_encode(['Color' => 'Red', 'Size' => 'Large']);
        $options2 = json_encode(['Color' => 'Blue', 'Size' => 'Small']);

        // Add first item with options1
        $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 1,
                'options' => $options1,
            ],
        ]);

        // Add second item with options2
        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 1,
                'options' => $options2,
            ],
        ]);

        // Verify we have 2 separate cart items
        expect(CartItem::count())->toBe(2);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
            'options' => $options1,
        ]);

        $this->assertDatabaseHas('cart_items', [
            'product_id' => $this->product->id,
            'quantity' => 1,
            'options' => $options2,
        ]);
    });

    it('adds quantity when adding same product with same options', function () {
        $options = json_encode(['Color' => 'Red', 'Size' => 'Large']);

        // Add first time
        $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 2,
                'options' => $options,
            ],
        ]);

        // Add again with same options
        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    quantity
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 3,
                'options' => $options,
            ],
        ]);

        // Verify quantity was added (2 + 3 = 5)
        $response->assertJson([
            'data' => [
                'addToCart' => [
                    'quantity' => 5,
                ],
            ],
        ]);

        // Verify only 1 cart item exists
        expect(CartItem::count())->toBe(1);
    });

    it('validates options JSON format', function () {
        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 1,
                'options' => 'invalid json {',
            ],
        ]);

        $response->assertGraphQLErrorMessage('The options field must be valid JSON.');
    });

    it('allows adding product without options', function () {
        $response = $this->actingAs($this->user)->graphQL('
            mutation AddToCart($input: AddToCartInput!) {
                addToCart(input: $input) {
                    id
                    quantity
                    options
                }
            }
        ', [
            'input' => [
                'product_id' => (string) $this->product->id,
                'quantity' => 2,
            ],
        ]);

        $response->assertJson([
            'data' => [
                'addToCart' => [
                    'quantity' => 2,
                    'options' => null,
                ],
            ],
        ]);
    });
});
