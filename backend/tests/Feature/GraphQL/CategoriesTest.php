<?php

declare(strict_types=1);

use App\Models\Category;
use App\Models\Product;
use App\Models\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Categories GraphQL Queries', function () {
    describe('Categories Query', function () {
        it('returns all active categories in hierarchical structure', function () {
            // Arrange
            $parentCategory = Category::factory()->create([
                'name_en' => 'Electronics',
                'name_ar' => 'الإلكترونيات',
                'is_active' => true,
                'parent_id' => null,
                'display_order' => 1,
            ]);

            $childCategory = Category::factory()->create([
                'name_en' => 'Smartphones',
                'name_ar' => 'الهواتف الذكية',
                'is_active' => true,
                'parent_id' => $parentCategory->id,
                'display_order' => 1,
            ]);

            $inactiveCategory = Category::factory()->create([
                'is_active' => false,
            ]);

            // Act
            $response = $this->graphQL('
                query GetCategories($is_active: Boolean) {
                    categories(is_active: $is_active) {
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

            // Assert - This test should FAIL until we implement the categories query
            $response->assertJson([
                'data' => [
                    'categories' => [
                        [
                            'id' => (string) $parentCategory->id,
                            'name_en' => 'Electronics',
                            'name_ar' => 'الإلكترونيات',
                            'is_active' => true,
                            'parent_id' => null,
                            'children' => [
                                [
                                    'id' => (string) $childCategory->id,
                                    'parent_id' => (string) $parentCategory->id,
                                ],
                            ],
                        ],
                        [
                            'id' => (string) $childCategory->id,
                            'parent' => [
                                'id' => (string) $parentCategory->id,
                            ],
                        ],
                    ],
                ],
            ]);

            // Should not include inactive category
            $categoryIds = collect($response->json('data.categories'))->pluck('id');
            expect($categoryIds)->not->toContain((string) $inactiveCategory->id);
        });

        it('returns only parent categories when parents_only is true', function () {
            // Arrange
            $parentCategory = Category::factory()->create([
                'is_active' => true,
                'parent_id' => null,
            ]);

            $childCategory = Category::factory()->create([
                'is_active' => true,
                'parent_id' => $parentCategory->id,
            ]);

            // Act
            $response = $this->graphQL('
                query GetParentCategories($parents_only: Boolean) {
                    categories(parents_only: $parents_only) {
                        id
                        parent_id
                    }
                }
            ', [
                'parents_only' => true,
            ]);

            // Assert - This test should FAIL until we implement parent filtering
            $categories = $response->json('data.categories');
            expect($categories)->toHaveCount(1);
            expect($categories[0]['id'])->toBe((string) $parentCategory->id);
            expect($categories[0]['parent_id'])->toBeNull();
        });
    });

    describe('Category Query (Single)', function () {
        it('returns category by ID with products', function () {
            // Arrange
            $category = Category::factory()->create([
                'name_en' => 'Test Category',
                'is_active' => true,
            ]);

            $brand = Brand::factory()->create();

            $products = Product::factory(3)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetCategory($id: ID!) {
                    category(id: $id) {
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
                'id' => (string) $category->id,
            ]);

            // Assert - This test should FAIL until we implement the category query
            $response->assertJson([
                'data' => [
                    'category' => [
                        'id' => (string) $category->id,
                        'name_en' => 'Test Category',
                        'slug' => $category->slug,
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

            expect($response->json('data.category.products'))->toHaveCount(3);
        });

        it('returns category by slug', function () {
            // Arrange
            $category = Category::factory()->create([
                'slug' => 'test-category-slug',
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetCategoryBySlug($slug: String!) {
                    categoryBySlug(slug: $slug) {
                        id
                        slug
                        name
                    }
                }
            ', [
                'slug' => 'test-category-slug',
            ]);

            // Assert - This test should FAIL until we implement the categoryBySlug query
            $response->assertJson([
                'data' => [
                    'categoryBySlug' => [
                        'id' => (string) $category->id,
                        'slug' => 'test-category-slug',
                    ],
                ],
            ]);
        });

        it('returns null for non-existent category', function () {
            // Act
            $response = $this->graphQL('
                query GetCategory($id: ID!) {
                    category(id: $id) {
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
                    'category' => null,
                ],
            ]);
        });
    });



    describe('Category Product Counts', function () {
        it('correctly counts active and inactive products', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            // Create active products
            Product::factory(3)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Create inactive products
            Product::factory(2)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => false,
            ]);

            // Act
            $response = $this->graphQL('
                query GetCategoryProductCounts($id: ID!) {
                    category(id: $id) {
                        id
                        products_count
                        active_products_count
                        has_products
                    }
                }
            ', [
                'id' => (string) $category->id,
            ]);

            // Assert - This test should FAIL until we implement product counting
            $response->assertJson([
                'data' => [
                    'category' => [
                        'products_count' => 5,
                        'active_products_count' => 3,
                        'has_products' => true,
                    ],
                ],
            ]);
        });
    });
});
