<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Brands GraphQL Queries', function () {
    describe('Brands Query', function () {
        it('returns all active brands in hierarchical structure', function () {
            // Arrange
            $parentBrand = Brand::factory()->create([
                'name_en' => 'Apple Inc.',
                'name_ar' => 'شركة أبل',
                'is_active' => true,
                'parent_id' => null,
                'display_order' => 1,
            ]);

            $childBrand = Brand::factory()->create([
                'name_en' => 'iPhone',
                'name_ar' => 'آيفون',
                'is_active' => true,
                'parent_id' => $parentBrand->id,
                'display_order' => 1,
            ]);

            $inactiveBrand = Brand::factory()->create([
                'is_active' => false,
            ]);

            // Act
            $response = $this->graphQL('
                query GetBrands($is_active: Boolean) {
                    brands(is_active: $is_active) {
                        id
                        name_en
                        name_ar
                        name
                        slug
                        display_image
                        image_url
                        is_active
                        display_order
                        parent_id
                        url
                        products_count
                        active_products_count
                        has_products
                        parent {
                            id
                            name
                        }
                        children {
                            id
                            name
                            parent_id
                        }
                    }
                }
            ', [
                'is_active' => true,
            ]);

            // Assert - This test should FAIL until we implement the brands query
            $response->assertJson([
                'data' => [
                    'brands' => [
                        [
                            'id' => (string) $parentBrand->id,
                            'name_en' => 'Apple Inc.',
                            'name_ar' => 'شركة أبل',
                            'is_active' => true,
                            'parent_id' => null,
                            'children' => [
                                [
                                    'id' => (string) $childBrand->id,
                                    'parent_id' => (string) $parentBrand->id,
                                ],
                            ],
                        ],
                        [
                            'id' => (string) $childBrand->id,
                            'parent' => [
                                'id' => (string) $parentBrand->id,
                            ],
                        ],
                    ],
                ],
            ]);

            // Should not include inactive brand
            $brandIds = collect($response->json('data.brands'))->pluck('id');
            expect($brandIds)->not->toContain((string) $inactiveBrand->id);
        });

        it('returns only parent brands when parents_only is true', function () {
            // Arrange
            $parentBrand = Brand::factory()->create([
                'is_active' => true,
                'parent_id' => null,
            ]);

            $childBrand = Brand::factory()->create([
                'is_active' => true,
                'parent_id' => $parentBrand->id,
            ]);

            // Act
            $response = $this->graphQL('
                query GetParentBrands($parents_only: Boolean) {
                    brands(parents_only: $parents_only) {
                        id
                        parent_id
                    }
                }
            ', [
                'parents_only' => true,
            ]);

            // Assert - This test should FAIL until we implement parent filtering
            $brands = $response->json('data.brands');
            expect($brands)->toHaveCount(1);
            expect($brands[0]['id'])->toBe((string) $parentBrand->id);
            expect($brands[0]['parent_id'])->toBeNull();
        });
    });

    describe('Brand Query (Single)', function () {
        it('returns brand by ID with products', function () {
            // Arrange
            $brand = Brand::factory()->create([
                'name_en' => 'Test Brand',
                'is_active' => true,
            ]);

            $category = Category::factory()->create();

            $products = Product::factory(3)->create([
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetBrand($id: ID!) {
                    brand(id: $id) {
                        id
                        name_en
                        name
                        slug
                        display_image
                        url
                        products_count
                        active_products_count
                        has_products
                        products {
                            id
                            name
                        }
                    }
                }
            ', [
                'id' => (string) $brand->id,
            ]);

            // Assert - This test should FAIL until we implement the brand query
            $response->assertJson([
                'data' => [
                    'brand' => [
                        'id' => (string) $brand->id,
                        'name_en' => 'Test Brand',
                        'slug' => $brand->slug,
                        'products_count' => 3,
                        'active_products_count' => 3,
                        'has_products' => true,
                        'products' => [
                            [
                                'id' => (string) $products[0]->id,
                            ],
                            [
                                'id' => (string) $products[1]->id,
                            ],
                            [
                                'id' => (string) $products[2]->id,
                            ],
                        ],
                    ],
                ],
            ]);

            expect($response->json('data.brand.products'))->toHaveCount(3);
        });

        it('returns brand by slug', function () {
            // Arrange
            $brand = Brand::factory()->create([
                'slug' => 'test-brand-slug',
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetBrandBySlug($slug: String!) {
                    brandBySlug(slug: $slug) {
                        id
                        slug
                        name
                    }
                }
            ', [
                'slug' => 'test-brand-slug',
            ]);

            // Assert - This test should FAIL until we implement the brandBySlug query
            $response->assertJson([
                'data' => [
                    'brandBySlug' => [
                        'id' => (string) $brand->id,
                        'slug' => 'test-brand-slug',
                    ],
                ],
            ]);
        });

        it('returns null for non-existent brand', function () {
            // Act
            $response = $this->graphQL('
                query GetBrand($id: ID!) {
                    brand(id: $id) {
                        id
                        name
                    }
                }
            ', [
                'id' => '999999',
            ]);

            // Assert - This test should FAIL until we implement proper null handling
            $response->assertJson([
                'data' => [
                    'brand' => null,
                ],
            ]);
        });
    });



    describe('Brand Product Counts', function () {
        it('correctly counts active and inactive products', function () {
            // Arrange
            $brand = Brand::factory()->create();
            $category = Category::factory()->create();

            // Create active products
            Product::factory(3)->create([
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'is_active' => true,
            ]);

            // Create inactive products
            Product::factory(2)->create([
                'brand_id' => $brand->id,
                'category_id' => $category->id,
                'is_active' => false,
            ]);

            // Act
            $response = $this->graphQL('
                query GetBrandProductCounts($id: ID!) {
                    brand(id: $id) {
                        id
                        products_count
                        active_products_count
                        has_products
                    }
                }
            ', [
                'id' => (string) $brand->id,
            ]);

            // Assert - This test should FAIL until we implement product counting
            $response->assertJson([
                'data' => [
                    'brand' => [
                        'products_count' => 5,
                        'active_products_count' => 3,
                        'has_products' => true,
                    ],
                ],
            ]);
        });
    });
});
