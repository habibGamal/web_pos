<?php

use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\App;
use Tests\Utilities\GraphQLTestHelpers;

uses(RefreshDatabase::class, GraphQLTestHelpers::class);

describe('@localized directive', function () {
    it('resolves product name to English when locale is set to en', function () {
        // Create test data
        $category = Category::factory()->create(['name_en' => 'Electronics', 'name_ar' => 'إلكترونيات']);
        $brand = Brand::factory()->create(['name_en' => 'Samsung', 'name_ar' => 'سامسونج']);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name_en' => 'Smartphone EN',
            'name_ar' => 'هاتف ذكي',
            'description_en' => 'English description',
            'description_ar' => 'وصف بالعربية',
        ]);

        // Set locale to English
        App::setLocale('en');

        $query = '
            query {
                product(id: ' . $product->id . ') {
                    name
                    description
                }
            }
        ';

        $response = $this->graphQL($query);

        $response->assertJson([
            'data' => [
                'product' => [
                    'name' => 'Smartphone EN',
                    'description' => 'English description',
                ],
            ],
        ]);
    });

    it('resolves product name to Arabic when locale is set to ar', function () {
        // Create test data
        $category = Category::factory()->create(['name_en' => 'Electronics', 'name_ar' => 'إلكترونيات']);
        $brand = Brand::factory()->create(['name_en' => 'Samsung', 'name_ar' => 'سامسونج']);
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'brand_id' => $brand->id,
            'name_en' => 'Smartphone EN',
            'name_ar' => 'هاتف ذكي',
            'description_en' => 'English description',
            'description_ar' => 'وصف بالعربية',
        ]);

        // Set locale to Arabic
        App::setLocale('ar');

        $query = '
            query {
                product(id: ' . $product->id . ') {
                    name
                    description
                }
            }
        ';

        $response = $this->graphQL($query);

        $response->assertJson([
            'data' => [
                'product' => [
                    'name' => 'هاتف ذكي',
                    'description' => 'وصف بالعربية',
                ],
            ],
        ]);
    });
});
