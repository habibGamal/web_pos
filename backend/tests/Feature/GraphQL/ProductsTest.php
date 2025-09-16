<?php

declare(strict_types=1);

use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Products GraphQL Queries', function () {
    describe('Products Query', function () {
        it('returns paginated list of active products', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $products = Product::factory(5)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProducts($first: Int) {
                    products(first: $first) {
                        data {
                            id
                            name_en
                            name_ar
                            name
                            price
                            effective_price
                            is_in_stock
                            featured_image
                            url
                            category {
                                id
                                name
                            }
                            brand {
                                id
                                name
                            }
                        }
                        paginatorInfo {
                            hasMorePages
                            currentPage
                            total
                            count
                            perPage
                        }
                    }
                }
            ', [
                'first' => 10,
            ]);

            // Assert - This test should FAIL until we implement the products query
            $response->assertJson([
                'data' => [
                    'products' => [
                        'paginatorInfo' => [
                            'total' => 5,
                            'hasMorePages' => false,
                        ],
                    ],
                ],
            ]);

            expect($response->json('data.products.data'))->toHaveCount(5);
        });

        it('filters products by category', function () {
            // Arrange
            $category1 = Category::factory()->create();
            $category2 = Category::factory()->create();
            $brand = Brand::factory()->create();

            $productsInCategory1 = Product::factory(3)->create([
                'category_id' => $category1->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            $productsInCategory2 = Product::factory(2)->create([
                'category_id' => $category2->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProductsByCategory($search: ProductSearchInput) {
                    products(search: $search) {
                        data {
                            id
                            category {
                                id
                            }
                        }
                        paginatorInfo {
                            total
                        }
                    }
                }
            ', [
                'search' => [
                    'category_id' => (string) $category1->id,
                ],
            ]);

            // Assert - This test should FAIL until we implement filtering
            $response->assertJson([
                'data' => [
                    'products' => [
                        'paginatorInfo' => [
                            'total' => 3,
                        ],
                    ],
                ],
            ]);

            $returnedCategoryIds = collect($response->json('data.products.data'))
                ->pluck('category.id')
                ->unique();

            expect($returnedCategoryIds)->toHaveCount(1)
                ->and($returnedCategoryIds->first())->toBe((string) $category1->id);
        });

        it('filters products by brand', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand1 = Brand::factory()->create();
            $brand2 = Brand::factory()->create();

            $productsForBrand1 = Product::factory(3)->create([
                'category_id' => $category->id,
                'brand_id' => $brand1->id,
                'is_active' => true,
            ]);

            $productsForBrand2 = Product::factory(2)->create([
                'category_id' => $category->id,
                'brand_id' => $brand2->id,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProductsByBrand($search: ProductSearchInput) {
                    products(search: $search) {
                        data {
                            id
                            brand {
                                id
                            }
                        }
                        paginatorInfo {
                            total
                        }
                    }
                }
            ', [
                'search' => [
                    'brand_id' => (string) $brand1->id,
                ],
            ]);

            // Assert - This test should FAIL until we implement filtering
            $response->assertJson([
                'data' => [
                    'products' => [
                        'paginatorInfo' => [
                            'total' => 3,
                        ],
                    ],
                ],
            ]);

            $returnedBrandIds = collect($response->json('data.products.data'))
                ->pluck('brand.id')
                ->unique();

            expect($returnedBrandIds)->toHaveCount(1)
                ->and($returnedBrandIds->first())->toBe((string) $brand1->id);
        });

        it('filters products by price range', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'price' => 50.00,
                'is_active' => true,
            ]);

            Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'price' => 150.00,
                'is_active' => true,
            ]);

            Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'price' => 250.00,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProductsByPriceRange($search: ProductSearchInput) {
                    products(search: $search) {
                        data {
                            id
                            price
                        }
                        paginatorInfo {
                            total
                        }
                    }
                }
            ', [
                'search' => [
                    'min_price' => 100.00,
                    'max_price' => 200.00,
                ],
            ]);

            // Assert - This test should FAIL until we implement price filtering
            $response->assertJson([
                'data' => [
                    'products' => [
                        'paginatorInfo' => [
                            'total' => 1,
                        ],
                    ],
                ],
            ]);

            $returnedPrice = $response->json('data.products.data.0.price');
            expect($returnedPrice)->toBe(150);
        });
    });

    describe('Product Query (Single)', function () {
        it('returns product by ID with full details', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $product = Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
                'sale_price' => 80.00,
                'price' => 100.00,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProduct($id: ID!) {
                    product(id: $id) {
                        id
                        name_en
                        name_ar
                        name
                        description
                        price
                        sale_price
                        effective_price
                        discount_percentage
                        is_on_sale
                        is_in_stock
                        is_featured
                        featured_image
                        images
                        url
                        slug
                        category {
                            id
                            name
                            url
                        }
                        brand {
                            id
                            name
                            url
                        }
                        variants {
                            id
                            name
                            price
                            is_in_stock
                        }
                        sections {
                            id
                            title
                        }
                    }
                }
            ', [
                'id' => (string) $product->id,
            ]);

            // Assert - This test should FAIL until we implement the product query
            $response->assertJson([
                'data' => [
                    'product' => [
                        'id' => (string) $product->id,
                        'name_en' => $product->name_en,
                        'name_ar' => $product->name_ar,
                        'price' => 100.0,
                        'sale_price' => 80.0,
                        'effective_price' => 80.0,
                        'discount_percentage' => 20.0,
                        'is_on_sale' => true,
                        'slug' => $product->slug,
                        'category' => [
                            'id' => (string) $category->id,
                        ],
                        'brand' => [
                            'id' => (string) $brand->id,
                        ],
                    ],
                ],
            ]);
        });

        it('returns product by slug', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $product = Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'slug' => 'test-product-slug',
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProductBySlug($slug: String!) {
                    productBySlug(slug: $slug) {
                        id
                        slug
                        name
                    }
                }
            ', [
                'slug' => 'test-product-slug',
            ]);

            // Assert - This test should FAIL until we implement the productBySlug query
            $response->assertJson([
                'data' => [
                    'productBySlug' => [
                        'id' => (string) $product->id,
                        'slug' => 'test-product-slug',
                    ],
                ],
            ]);
        });

        it('returns null for non-existent product', function () {
            // Act
            $response = $this->graphQL('
                query GetProduct($id: ID!) {
                    product(id: $id) {
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
                    'product' => null,
                ],
            ]);
        });
    });

    describe('Product Sorting', function () {
        it('sorts products by price ascending', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $product1 = Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'price' => 100.00,
                'is_active' => true,
            ]);

            $product2 = Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'price' => 50.00,
                'is_active' => true,
            ]);

            $product3 = Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'price' => 75.00,
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProductsSorted($orderBy: [ProductOrderByClause!]) {
                    products(orderBy: $orderBy) {
                        data {
                            id
                            price
                        }
                    }
                }
            ', [
                'orderBy' => [
                    [
                        'column' => 'PRICE',
                        'order' => 'ASC',
                    ],
                ],
            ]);

            // Assert - This test should FAIL until we implement sorting
            $prices = collect($response->json('data.products.data'))
                ->pluck('price');

            expect($prices->toArray())->toBe([50, 75, 100]);
        });

        it('sorts products by name descending', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'name_en' => 'Alpha Product',
                'is_active' => true,
            ]);

            Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'name_en' => 'Zeta Product',
                'is_active' => true,
            ]);

            Product::factory()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'name_en' => 'Beta Product',
                'is_active' => true,
            ]);

            // Act
            $response = $this->graphQL('
                query GetProductsSorted($orderBy: [ProductOrderByClause!]) {
                    products(orderBy: $orderBy) {
                        data {
                            id
                            name_en
                        }
                    }
                }
            ', [
                'orderBy' => [
                    [
                        'column' => 'NAME_EN',
                        'order' => 'DESC',
                    ],
                ],
            ]);

            // Assert - This test should FAIL until we implement sorting
            $names = collect($response->json('data.products.data'))
                ->pluck('name_en');

            expect($names->toArray())->toBe(['Zeta Product', 'Beta Product', 'Alpha Product']);
        });
    });
});
