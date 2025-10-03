<?php

declare(strict_types=1);

use App\Enums\AttributeType;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('Attributes GraphQL Queries', function () {
    describe('Attributes Query', function () {
        it('returns all attributes ordered by sort_order', function () {
            // Arrange
            $attributes = collect([
                Attribute::factory()->create([
                    'name_en' => 'Size',
                    'name_ar' => 'الحجم',
                    'type' => AttributeType::SELECT,
                    'sort_order' => 2,
                ]),
                Attribute::factory()->create([
                    'name_en' => 'Color',
                    'name_ar' => 'اللون',
                    'type' => AttributeType::COLOR,
                    'sort_order' => 1,
                ]),
            ]);

            // Act
            $response = $this->graphQL('
                query GetAttributes {
                    attributes {
                        id
                        name_en
                        name_ar
                        name
                        type
                        description_en
                        description_ar
                        description
                        sort_order
                    }
                }
            ');

            // Assert
            $response->assertOk();
            $data = $response->json('data.attributes');

            expect($data)->toBeArray();
            expect(count($data))->toBe(2);
            expect($data[0]['name_en'])->toBe('Color'); // Should be first due to sort_order
            expect($data[1]['name_en'])->toBe('Size');
            expect($data[0]['type'])->toBe('COLOR');
            expect($data[1]['type'])->toBe('SELECT');
        });

        it('returns attribute with localized name based on current locale', function () {
            // Arrange
            app()->setLocale('ar');
            $attribute = Attribute::factory()->create([
                'name_en' => 'Size',
                'name_ar' => 'الحجم',
                'type' => AttributeType::SELECT,
            ]);

            // Act
            $response = $this->graphQL('
                query GetAttributes {
                    attributes {
                        id
                        name
                        name_en
                        name_ar
                    }
                }
            ');

            // Assert
            $response->assertOk();
            $data = $response->json('data.attributes.0');

            expect($data['name'])->toBe('الحجم'); // Should return Arabic name
            expect($data['name_en'])->toBe('Size');
            expect($data['name_ar'])->toBe('الحجم');
        });
    });

    describe('Attribute Query', function () {
        it('returns a single attribute by ID', function () {
            // Arrange
            $attribute = Attribute::factory()->create([
                'name_en' => 'Color',
                'name_ar' => 'اللون',
                'type' => AttributeType::COLOR,
            ]);

            // Act
            $response = $this->graphQL('
                query GetAttribute($id: ID!) {
                    attribute(id: $id) {
                        id
                        name_en
                        name_ar
                        type
                    }
                }
            ', [
                'id' => $attribute->id,
            ]);

            // Assert
            $response->assertOk();
            $data = $response->json('data.attribute');

            expect($data['id'])->toBe((string) $attribute->id);
            expect($data['name_en'])->toBe('Color');
            expect($data['type'])->toBe('COLOR');
        });
    });

    describe('AttributeValues Query', function () {
        it('returns all attribute values ordered by sort_order', function () {
            // Arrange
            $attribute = Attribute::factory()->create([
                'name_en' => 'Size',
                'type' => AttributeType::SELECT,
            ]);

            $values = collect([
                AttributeValue::factory()->create([
                    'attribute_id' => $attribute->id,
                    'value' => 'L',
                    'value_en' => 'Large',
                    'value_ar' => 'كبير',
                    'sort_order' => 2,
                ]),
                AttributeValue::factory()->create([
                    'attribute_id' => $attribute->id,
                    'value' => 'S',
                    'value_en' => 'Small',
                    'value_ar' => 'صغير',
                    'sort_order' => 1,
                ]),
            ]);

            // Act
            $response = $this->graphQL('
                query GetAttributeValues {
                    attributeValues {
                        id
                        value
                        value_en
                        value_ar
                        display_value
                        sort_order
                        attribute {
                            id
                            name_en
                        }
                    }
                }
            ');

            // Assert
            $response->assertOk();
            $data = $response->json('data.attributeValues');

            expect($data)->toHaveCount(2);
            expect($data[0]['value'])->toBe('S'); // Should be first due to sort_order
            expect($data[1]['value'])->toBe('L');
        });

        it('filters attribute values by attribute_id', function () {
            // Arrange
            $sizeAttribute = Attribute::factory()->create(['name_en' => 'Size']);
            $colorAttribute = Attribute::factory()->create(['name_en' => 'Color']);

            AttributeValue::factory()->create([
                'attribute_id' => $sizeAttribute->id,
                'value' => 'M',
            ]);
            AttributeValue::factory()->create([
                'attribute_id' => $colorAttribute->id,
                'value' => 'Red',
            ]);

            // Act
            $response = $this->graphQL('
                query GetAttributeValues($attributeId: ID) {
                    attributeValues(attribute_id: $attributeId) {
                        id
                        value
                        attribute {
                            name_en
                        }
                    }
                }
            ', [
                'attributeId' => $sizeAttribute->id,
            ]);

            // Assert
            $response->assertOk();
            $data = $response->json('data.attributeValues');

            expect($data)->toHaveCount(1);
            expect($data[0]['value'])->toBe('M');
            expect($data[0]['attribute']['name_en'])->toBe('Size');
        });
    });

    describe('Product Variants with Attributes', function () {
        it('returns product variant with attribute values', function () {
            // Arrange
            $category = Category::factory()->create();
            $brand = Brand::factory()->create();
            $product = Product::factory()->configurable()->create([
                'category_id' => $category->id,
                'brand_id' => $brand->id,
            ]);

            // Create attributes
            $sizeAttribute = Attribute::factory()->create([
                'name_en' => 'Size',
                'type' => AttributeType::SELECT,
            ]);
            $colorAttribute = Attribute::factory()->create([
                'name_en' => 'Color',
                'type' => AttributeType::COLOR,
            ]);

            // Create attribute values
            $sizeValue = AttributeValue::factory()->create([
                'attribute_id' => $sizeAttribute->id,
                'value' => 'M',
                'value_en' => 'Medium',
                'value_ar' => 'متوسط',
            ]);
            $colorValue = AttributeValue::factory()->create([
                'attribute_id' => $colorAttribute->id,
                'value' => 'red',
                'value_en' => 'Red',
                'value_ar' => 'أحمر',
                'color_code' => '#FF0000',
            ]);

            // Create variant and attach attributes
            $variant = Product::factory()->variant($product)->create([
                'sku' => 'TEST-VARIANT-001',
            ]);
            $variant->attributeValues()->attach([$sizeValue->id, $colorValue->id]);

            // Act
            $response = $this->graphQL('
                query GetProduct($id: ID!) {
                    product(id: $id) {
                        id
                        variants {
                            id
                            sku
                            attributes_string
                            grouped_attributes {
                                attribute {
                                    id
                                    name_en
                                    type
                                }
                                values
                            }
                            attribute_values {
                                id
                                value
                                display_value
                                color_code
                                attribute {
                                    id
                                    name_en
                                    type
                                }
                            }
                        }
                    }
                }
            ', [
                'id' => $product->id,
            ]);

            // Assert
            $response->assertOk();
            $data = $response->json('data.product.variants.0');

            expect($data['sku'])->toBe('TEST-VARIANT-001');
            expect($data['attribute_values'])->toHaveCount(2);
            expect($data['grouped_attributes'])->toHaveCount(2);

            // Check that color value has color_code
            $colorAttributeValue = collect($data['attribute_values'])
                ->firstWhere('attribute.name_en', 'Color');
            expect($colorAttributeValue['color_code'])->toBe('#FF0000');
        });

        it('returns attributes_string for variant with attributes', function () {
            // Arrange
            app()->setLocale('en'); // Set to English for this test

            $product = Product::factory()->configurable()->create();
            $attribute = Attribute::factory()->create([
                'name_en' => 'Size',
                'name_ar' => 'الحجم',
            ]);
            $attributeValue = AttributeValue::factory()->create([
                'attribute_id' => $attribute->id,
                'value' => 'L',
                'value_en' => 'Large',
                'value_ar' => 'كبير',
            ]);

            $variant = Product::factory()->variant($product)->create();
            $variant->attributeValues()->attach($attributeValue->id);

            // Act
            $response = $this->graphQL('
                query GetProduct($id: ID!) {
                    product(id: $id) {
                        variants {
                            attributes_string
                        }
                    }
                }
            ', [
                'id' => $product->id,
            ]);

            // Assert
            $response->assertOk();
            $attributesString = $response->json('data.product.variants.0.attributes_string');

            expect($attributesString)->toContain('Size');
            expect($attributesString)->toContain('Large');
        });
    });
});
