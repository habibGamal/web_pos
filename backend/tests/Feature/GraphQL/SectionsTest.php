<?php

declare(strict_types=1);

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\Section;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Sections GraphQL Queries', function () {
    describe('Sections Query', function () {
        it('returns all active sections sorted by sort_order', function () {
            // Arrange
            $section1 = Section::factory()->create([
                'title_en' => 'Featured Products',
                'title_ar' => 'المنتجات المميزة',
                'active' => true,
                'sort_order' => 2,
                'section_type' => 'REAL',
            ]);

            $section2 = Section::factory()->create([
                'title_en' => 'New Arrivals',
                'title_ar' => 'الوافدات الجديدة',
                'active' => true,
                'sort_order' => 1,
                'section_type' => 'NEW_ARRIVALS',
            ]);

            $inactiveSection = Section::factory()->create([
                'active' => false,
            ]);

            // Act
            $response = $this->graphQL('
                query GetSections($active: Boolean) {
                    sections(active: $active) {
                        id
                        title_en
                        title_ar
                        title
                        active
                        sort_order
                        section_type
                        products_count
                        active_products_count
                        has_products
                    }
                }
            ', [
                'active' => true,
            ]);

            // Assert - This test should FAIL until we implement the sections query
            $response->assertJson([
                'data' => [
                    'sections' => [
                        [
                            'id' => (string) $section2->id,
                            'title_en' => 'New Arrivals',
                            'title_ar' => 'الوافدات الجديدة',
                            'active' => true,
                            'sort_order' => 1,
                            'section_type' => 'NEW_ARRIVALS',
                        ],
                        [
                            'id' => (string) $section1->id,
                            'title_en' => 'Featured Products',
                            'title_ar' => 'المنتجات المميزة',
                            'active' => true,
                            'sort_order' => 2,
                            'section_type' => 'REAL',
                        ],
                    ],
                ],
            ]);

            // Should not include inactive section
            $sectionIds = collect($response->json('data.sections'))->pluck('id');
            expect($sectionIds)->not->toContain((string) $inactiveSection->id);
        });
    });

    describe('Section Query (Single)', function () {
        it('returns section by ID with products', function () {
            // Arrange
            $section = Section::factory()->create([
                'title_en' => 'Test Section',
                'active' => true,
            ]);

            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            $products = Product::factory(3)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Attach products to section
            $section->products()->attach($products->pluck('id'));

            // Act
            $response = $this->graphQL('
                query GetSection($id: ID!) {
                    section(id: $id) {
                        id
                        title_en
                        title
                        active
                        section_type
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
                'id' => (string) $section->id,
            ]);

            // Assert - This test should FAIL until we implement the section query
            $response->assertJson([
                'data' => [
                    'section' => [
                        'id' => (string) $section->id,
                        'title_en' => 'Test Section',
                        'active' => true,
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

            expect($response->json('data.section.products'))->toHaveCount(3);
        });

        it('returns null for non-existent section', function () {
            // Act
            $response = $this->graphQL('
                query GetSection($id: ID!) {
                    section(id: $id) {
                        id
                        title
                    }
                }
            ', [
                'id' => '999999',
            ]);

            // Assert - This test should FAIL until we implement proper null handling
            $response->assertJson([
                'data' => [
                    'section' => null,
                ],
            ]);
        });
    });

    describe('Section Product Counts', function () {
        it('correctly counts active and inactive products', function () {
            // Arrange
            $section = Section::factory()->create();
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();

            // Create active products
            $activeProducts = Product::factory(3)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => true,
            ]);

            // Create inactive products
            $inactiveProducts = Product::factory(2)->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'is_active' => false,
            ]);

            // Attach all products to section
            $section->products()->attach($activeProducts->pluck('id'));
            $section->products()->attach($inactiveProducts->pluck('id'));

            // Act
            $response = $this->graphQL('
                query GetSectionProductCounts($id: ID!) {
                    section(id: $id) {
                        id
                        products_count
                        active_products_count
                        has_products
                    }
                }
            ', [
                'id' => (string) $section->id,
            ]);

            // Assert - This test should FAIL until we implement product counting
            $response->assertJson([
                'data' => [
                    'section' => [
                        'products_count' => 5,
                        'active_products_count' => 3,
                        'has_products' => true,
                    ],
                ],
            ]);
        });
    });

    describe('Section Types', function () {
        it('supports all section types', function () {
            // Arrange - create active sections to ensure they're returned by the GraphQL query
            $realSection = Section::factory()->create(['section_type' => 'REAL', 'active' => true]);
            $recommendationSection = Section::factory()->create(['section_type' => 'RECOMMENDATION', 'active' => true]);
            $trendingSection = Section::factory()->create(['section_type' => 'TRENDING', 'active' => true]);
            $newArrivalsSection = Section::factory()->create(['section_type' => 'NEW_ARRIVALS', 'active' => true]);

            // Act
            $response = $this->graphQL('
                query GetSectionsWithTypes {
                    sections {
                        id
                        section_type
                    }
                }
            ');

            // Assert - This test should FAIL until we implement section types
            $sections = collect($response->json('data.sections'));

            $sectionTypes = $sections->pluck('section_type');
            expect($sectionTypes)->toContain('REAL');
            expect($sectionTypes)->toContain('RECOMMENDATION');
            expect($sectionTypes)->toContain('TRENDING');
            expect($sectionTypes)->toContain('NEW_ARRIVALS');
        });
    });
});
