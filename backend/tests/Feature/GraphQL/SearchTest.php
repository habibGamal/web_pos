<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Search GraphQL Queries', function () {
    describe('Search Products Query', function () {
        it('searches products by name in English', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $matchingProduct = Product::factory()->create([
                'name_en' => 'iPhone 15 Pro',
                'name_ar' => 'آيفون 15 برو',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $nonMatchingProduct = Product::factory()->create([
                'name_en' => 'Samsung Galaxy',
                'name_ar' => 'سامسونج جالاكسي',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query SearchProducts($query: String!, $first: Int) {
                    searchProducts(query: $query, first: $first) {
                        edges {
                            node {
                                id
                                name_en
                                name_ar
                                name
                            }
                        }
                        pageInfo {
                            hasNextPage
                            hasPreviousPage
                        }
                        totalCount
                    }
                }
            ', [
                'query' => 'iPhone',
                'first' => 10,
            ]);

            // Assert - This test should FAIL until we implement search
            $response->assertJson([
                'data' => [
                    'searchProducts' => [
                        'totalCount' => 1,
                        'edges' => [
                            [
                                'node' => [
                                    'id' => (string) $matchingProduct->id,
                                    'name_en' => 'iPhone 15 Pro',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('searches products by name in Arabic', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $matchingProduct = Product::factory()->create([
                'name_en' => 'iPhone 15 Pro',
                'name_ar' => 'آيفون 15 برو',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $nonMatchingProduct = Product::factory()->create([
                'name_en' => 'Samsung Galaxy',
                'name_ar' => 'سامسونج جالاكسي',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query SearchProducts($query: String!, $first: Int) {
                    searchProducts(query: $query, first: $first) {
                        edges {
                            node {
                                id
                                name_en
                                name_ar
                            }
                        }
                        totalCount
                    }
                }
            ', [
                'query' => 'آيفون',
                'first' => 10,
            ]);

            // Assert - This test should FAIL until we implement Arabic search
            $response->assertJson([
                'data' => [
                    'searchProducts' => [
                        'totalCount' => 1,
                        'edges' => [
                            [
                                'node' => [
                                    'id' => (string) $matchingProduct->id,
                                    'name_ar' => 'آيفون 15 برو',
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('searches products by description', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $matchingProduct = Product::factory()->create([
                'name_en' => 'Test Product',
                'description_en' => 'This is a revolutionary smartphone with advanced features',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $nonMatchingProduct = Product::factory()->create([
                'name_en' => 'Another Product',
                'description_en' => 'This is a simple accessory',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query SearchProducts($query: String!) {
                    searchProducts(query: $query) {
                        edges {
                            node {
                                id
                                name_en
                            }
                        }
                        totalCount
                    }
                }
            ', [
                'query' => 'revolutionary',
            ]);

            // Assert - This test should FAIL until we implement description search
            $response->assertJson([
                'data' => [
                    'searchProducts' => [
                        'totalCount' => 1,
                        'edges' => [
                            [
                                'node' => [
                                    'id' => (string) $matchingProduct->id,
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('searches products with additional filters', function () {
            // Arrange
            $category1 = Category::factory()->create();
            $category2 = Category::factory()->create();
            $brand = Brand::factory()->create();

            $matchingProduct = Product::factory()->create([
                'name_en' => 'iPhone 15 Pro',
                'price' => 999.99,
                'category_id' => $category1->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $filteredOutProduct = Product::factory()->create([
                'name_en' => 'iPhone 15 Basic',
                'price' => 1500.00,
                'category_id' => $category2->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query SearchProductsWithFilters($query: String!, $filters: ProductSearchInput) {
                    searchProducts(query: $query, filters: $filters) {
                        edges {
                            node {
                                id
                                name_en
                                price
                                category {
                                    id
                                }
                            }
                        }
                        totalCount
                    }
                }
            ', [
                'query' => 'iPhone',
                'filters' => [
                    'category_id' => (string) $category1->id,
                    'max_price' => 1200.00,
                ],
            ]);

            // Assert - This test should FAIL until we implement filtered search
            $response->assertJson([
                'data' => [
                    'searchProducts' => [
                        'totalCount' => 1,
                        'edges' => [
                            [
                                'node' => [
                                    'id' => (string) $matchingProduct->id,
                                    'category' => [
                                        'id' => (string) $category1->id,
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });

        it('searches with sorting options', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $cheaperProduct = Product::factory()->create([
                'name_en' => 'iPhone 15 Basic',
                'price' => 699.99,
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $expensiveProduct = Product::factory()->create([
                'name_en' => 'iPhone 15 Pro Max',
                'price' => 1199.99,
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query SearchProductsWithSorting($query: String!, $orderBy: [ProductOrderByClause!]) {
                    searchProducts(query: $query, orderBy: $orderBy) {
                        edges {
                            node {
                                id
                                name_en
                                price
                            }
                        }
                    }
                }
            ', [
                'query' => 'iPhone',
                'orderBy' => [
                    [
                        'column' => 'PRICE',
                        'order' => 'DESC',
                    ],
                ],
            ]);

            // Assert - This test should FAIL until we implement search sorting
            $prices = collect($response->json('data.searchProducts.edges'))
                ->pluck('node.price');

            expect($prices->toArray())->toBe([1199.99, 699.99]);
        });

        it('only searches active products', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $activeProduct = Product::factory()->create([
                'name_en' => 'Active iPhone',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $inactiveProduct = Product::factory()->create([
                'name_en' => 'Inactive iPhone',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => false,
            ]);

            // Act
            $response = $this->graphQL('
                query SearchProducts($query: String!) {
                    searchProducts(query: $query) {
                        edges {
                            node {
                                id
                                name_en
                                is_active
                            }
                        }
                        totalCount
                    }
                }
            ', [
                'query' => 'iPhone',
            ]);

            // Assert - This test should FAIL until we implement active-only search
            $response->assertJson([
                'data' => [
                    'searchProducts' => [
                        'totalCount' => 1,
                        'edges' => [
                            [
                                'node' => [
                                    'id' => (string) $activeProduct->id,
                                    'is_active' => true,
                                ],
                            ],
                        ],
                    ],
                ],
            ]);
        });
    });

    describe('Search Suggestions Query', function () {
        it('returns search suggestions based on product names', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            Product::factory()->create([
                'name_en' => 'iPhone 15 Pro',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            Product::factory()->create([
                'name_en' => 'iPhone 15 Pro Max',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            Product::factory()->create([
                'name_en' => 'iPad Pro',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetSearchSuggestions($query: String!, $limit: Int) {
                    searchSuggestions(query: $query, limit: $limit)
                }
            ', [
                'query' => 'iP',
                'limit' => 5,
            ]);

            // Assert - This test should FAIL until we implement search suggestions
            $suggestions = $response->json('data.searchSuggestions');
            expect($suggestions)->toBeArray();
            expect($suggestions)->toContain('iPhone 15 Pro');
            expect($suggestions)->toContain('iPhone 15 Pro Max');
            expect($suggestions)->toContain('iPad Pro');
        });

        it('limits search suggestions correctly', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            for ($i = 1; $i <= 10; $i++) {
                Product::factory()->create([
                    'name_en' => "iPhone Model {$i}",
                    'category_id' => $category->id,
                    'brand_id' => $brand->id,
                    'is_active' => true,
                ]);
            }

            // Act
            $response = $this->graphQL('
                query GetSearchSuggestions($query: String!, $limit: Int) {
                    searchSuggestions(query: $query, limit: $limit)
                }
            ', [
                'query' => 'iPhone',
                'limit' => 3,
            ]);

            // Assert - This test should FAIL until we implement suggestion limiting
            $suggestions = $response->json('data.searchSuggestions');
            expect($suggestions)->toHaveCount(3);
        });

        it('returns empty array for no matches', function () {
            // Act
            $response = $this->graphQL('
                query GetSearchSuggestions($query: String!) {
                    searchSuggestions(query: $query)
                }
            ', [
                'query' => 'nonexistent',
            ]);

            // Assert - This test should FAIL until we implement empty suggestions
            $response->assertJson([
                'data' => [
                    'searchSuggestions' => [],
                ],
            ]);
        });
    });

    describe('Search Query Validation', function () {
        it('validates minimum query length for search', function () {
            // Act
            $response = $this->graphQL('
                query SearchProducts($query: String!) {
                    searchProducts(query: $query) {
                        totalCount
                    }
                }
            ', [
                'query' => 'a',
            ]);

            // Assert - This test should FAIL until we implement query validation
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [searchProducts].',
                    ],
                ],
            ]);
        });

        it('validates minimum query length for suggestions', function () {
            // Act
            $response = $this->graphQL('
                query GetSearchSuggestions($query: String!) {
                    searchSuggestions(query: $query)
                }
            ', [
                'query' => '',
            ]);

            // Assert - This test should FAIL until we implement query validation
            $response->assertJson([
                'errors' => [
                    [
                        'message' => 'Validation failed for the field [searchSuggestions].',
                    ],
                ],
            ]);
        });
    });
});
