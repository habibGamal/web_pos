<?php

namespace Database\Seeders;

use App\Enums\ProductType;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all categories and brands
        $categories = Category::all();
        $brands = Brand::all();

        // Get attributes and their values
        $sizeAttribute = Attribute::where('name_en', 'Size')->first();
        $colorAttribute = Attribute::where('name_en', 'Color')->first();
        $materialAttribute = Attribute::where('name_en', 'Material')->first();
        $capacityAttribute = Attribute::where('name_en', 'Storage Capacity')->first();

        // Available product images
        $availableImages = [
            'products/01K4JQR3RR1TTRNMPQ4W29NSYY.webp',
            'products/01K4JRKPQVRA22Z4K1SD1FT4QW.webp',
            'products/01K4JRKQ7EY24M4FXFW2MMQN08.webp',
            'products/01K4JRPS5PANZKK9NRB7TYBS0K.webp',
            'products/01K4JRPSBY95K73T11DXK36ARS.webp',
        ];

        // Sample configurable product data with variants
        $configurableProductData = [
            [
                'name_en' => 'Classic Cotton T-Shirt',
                'name_ar' => 'قميص قطني كلاسيكي',
                'description_en' => 'A comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% premium cotton.',
                'description_ar' => 'قميص قطني مريح وأنيق مثالي للاستخدام اليومي. مصنوع من القطن الفاخر 100%.',
                'price' => 49.99,
                'cost_price' => 25.00,
                'variants' => [
                    ['attributes' => ['Color' => 'blue', 'Size' => 'M'], 'quantity' => 25, 'is_default' => true],
                    ['attributes' => ['Color' => 'black', 'Size' => 'L'], 'quantity' => 20, 'is_default' => false],
                    ['attributes' => ['Color' => 'white', 'Size' => 'S'], 'quantity' => 15, 'is_default' => false],
                ],
            ],
            [
                'name_en' => 'Denim Jacket',
                'name_ar' => 'جاكيت جينز',
                'description_en' => 'A trendy denim jacket that pairs well with any outfit. Durable and fashionable.',
                'description_ar' => 'جاكيت جينز عصري يتماشى مع أي ملبس. متين وأنيق.',
                'price' => 89.99,
                'sale_price' => 69.99,
                'cost_price' => 45.00,
                'variants' => [
                    ['attributes' => ['Color' => 'blue', 'Size' => 'L'], 'quantity' => 12, 'is_default' => true],
                    ['attributes' => ['Color' => 'black', 'Size' => 'M'], 'quantity' => 18, 'is_default' => false],
                    ['attributes' => ['Color' => 'blue', 'Size' => 'XL'], 'quantity' => 8, 'is_default' => false],
                ],
            ],
            [
                'name_en' => 'Wireless Headphones',
                'name_ar' => 'سماعات لاسلكية',
                'description_en' => 'High-quality wireless headphones with noise cancellation. Perfect for music lovers.',
                'description_ar' => 'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء. مثالية لعشاق الموسيقى.',
                'price' => 149.99,
                'sale_price' => 119.99,
                'cost_price' => 75.00,
                'variants' => [
                    ['attributes' => ['Color' => 'black', 'Storage Capacity' => '32GB'], 'quantity' => 15, 'is_default' => true],
                    ['attributes' => ['Color' => 'white', 'Storage Capacity' => '64GB'], 'quantity' => 12, 'is_default' => false],
                    ['attributes' => ['Color' => 'blue', 'Storage Capacity' => '128GB'], 'quantity' => 8, 'is_default' => false],
                ],
            ],
        ];

        // Sample simple product data
        $simpleProductData = [
            [
                'name_en' => 'Leather Wallet',
                'name_ar' => 'محفظة جلدية',
                'description_en' => 'A premium leather wallet with multiple compartments. Stylish and functional.',
                'description_ar' => 'محفظة جلدية فاخرة مع عدة أقسام. أنيقة وعملية.',
                'price' => 39.99,
                'cost_price' => 20.00,
                'quantity' => 50,
                'attributes' => ['Color' => 'black'],
            ],
            [
                'name_en' => 'Backpack',
                'name_ar' => 'حقيبة ظهر',
                'description_en' => 'Spacious and durable backpack for daily use. Multiple compartments for organization.',
                'description_ar' => 'حقيبة ظهر واسعة ومتينة للاستخدام اليومي. أقسام متعددة للتنظيم.',
                'price' => 69.99,
                'sale_price' => 54.99,
                'cost_price' => 35.00,
                'quantity' => 30,
                'attributes' => ['Color' => 'blue'],
            ],
        ];

        // Sample bundle product data
        $bundleProductData = [
            [
                'name_en' => 'Summer Essentials Bundle',
                'name_ar' => 'حزمة أساسيات الصيف',
                'description_en' => 'Complete summer package with t-shirt, shorts and sunglasses at a great price.',
                'description_ar' => 'حزمة صيف كاملة مع قميص وشورت ونظارة شمسية بسعر رائع.',
                'price' => 89.99,
                'sale_price' => 69.99,
                'cost_price' => 45.00,
                'quantity' => 15,
            ],
        ];

        // Create configurable products with variants
        foreach ($configurableProductData as $index => $data) {
            // Create the configurable product (parent)
            $configurableProduct = Product::create([
                'name_en' => $data['name_en'],
                'name_ar' => $data['name_ar'],
                'slug' => Str::slug($data['name_en']),
                'description_en' => $data['description_en'],
                'description_ar' => $data['description_ar'],
                'type' => ProductType::CONFIGURABLE,
                'parent_id' => null,
                'sku' => null,
                'price' => $data['price'],
                'sale_price' => $data['sale_price'] ?? null,
                'cost_price' => $data['cost_price'],
                'quantity' => 0, // Configurable products don't have direct quantity
                'images' => null, // Configurable products use variant images
                'category_id' => $categories->random()->id,
                'brand_id' => $brands->random()->id,
                'is_active' => true,
                'is_featured' => $index < 2,
                'is_default' => false,
            ]);

            // Create variants for this configurable product
            foreach ($data['variants'] as $variantIndex => $variantData) {
                $variant = Product::create([
                    'name_en' => $data['name_en'],
                    'name_ar' => $data['name_ar'],
                    'slug' => Str::slug($data['name_en'] . '-variant-' . ($variantIndex + 1)),
                    'description_en' => $data['description_en'],
                    'description_ar' => $data['description_ar'],
                    'type' => ProductType::VARIANT,
                    'parent_id' => $configurableProduct->id,
                    'sku' => 'SKU-' . strtoupper(Str::random(8)) . '-' . $configurableProduct->id . '-' . ($variantIndex + 1),
                    'price' => $data['price'],
                    'sale_price' => $data['sale_price'] ?? null,
                    'cost_price' => $data['cost_price'],
                    'quantity' => $variantData['quantity'],
                    'images' => [$availableImages[$index % count($availableImages)]],
                    'category_id' => $configurableProduct->category_id,
                    'brand_id' => $configurableProduct->brand_id,
                    'is_active' => true,
                    'is_featured' => false,
                    'is_default' => $variantData['is_default'],
                ]);

                // Attach attribute values to the variant
                $this->attachAttributeValues($variant, $variantData['attributes'], [
                    'Size' => $sizeAttribute,
                    'Color' => $colorAttribute,
                    'Material' => $materialAttribute,
                    'Storage Capacity' => $capacityAttribute,
                ]);
            }
        }

        // Create simple products
        foreach ($simpleProductData as $index => $data) {
            $simpleProduct = Product::create([
                'name_en' => $data['name_en'],
                'name_ar' => $data['name_ar'],
                'slug' => Str::slug($data['name_en']),
                'description_en' => $data['description_en'],
                'description_ar' => $data['description_ar'],
                'type' => ProductType::SIMPLE,
                'parent_id' => null,
                'sku' => 'SKU-' . strtoupper(Str::random(8)),
                'price' => $data['price'],
                'sale_price' => $data['sale_price'] ?? null,
                'cost_price' => $data['cost_price'],
                'quantity' => $data['quantity'],
                'images' => [$availableImages[($index + 3) % count($availableImages)]],
                'category_id' => $categories->random()->id,
                'brand_id' => $brands->random()->id,
                'is_active' => true,
                'is_featured' => false,
                'is_default' => false,
            ]);

            // Attach attribute values to simple product
            $this->attachAttributeValues($simpleProduct, $data['attributes'], [
                'Size' => $sizeAttribute,
                'Color' => $colorAttribute,
                'Material' => $materialAttribute,
                'Storage Capacity' => $capacityAttribute,
            ]);
        }

        // Create bundle products
        foreach ($bundleProductData as $index => $data) {
            $bundleProduct = Product::create([
                'name_en' => $data['name_en'],
                'name_ar' => $data['name_ar'],
                'slug' => Str::slug($data['name_en']),
                'description_en' => $data['description_en'],
                'description_ar' => $data['description_ar'],
                'type' => ProductType::BUNDLE,
                'parent_id' => null,
                'sku' => 'BUNDLE-' . strtoupper(Str::random(8)),
                'price' => $data['price'],
                'sale_price' => $data['sale_price'] ?? null,
                'cost_price' => $data['cost_price'],
                'quantity' => $data['quantity'],
                'images' => [$availableImages[0]], // Use first image for bundle
                'category_id' => $categories->random()->id,
                'brand_id' => $brands->random()->id,
                'is_active' => true,
                'is_featured' => true,
                'is_default' => false,
            ]);

            // Add some simple products to the bundle
            $simpleProducts = Product::where('type', ProductType::SIMPLE)->take(3)->get();
            foreach ($simpleProducts as $product) {
                $bundleProduct->bundleItems()->create([
                    'product_id' => $product->id,
                    'quantity' => rand(1, 2),
                ]);
            }
        }
    }

    /**
     * Attach attribute values to a product.
     */
    private function attachAttributeValues(Product $product, array $attributes, array $attributeMap): void
    {
        $attributeValueIds = [];

        foreach ($attributes as $attributeName => $value) {
            $attribute = $attributeMap[$attributeName] ?? null;

            if ($attribute) {
                $attributeValue = AttributeValue::where('attribute_id', $attribute->id)
                    ->where(function ($query) use ($value) {
                        $query->where('value', $value)
                            ->orWhere('value_en', $value)
                            ->orWhere('value_ar', $value);
                    })
                    ->first();

                if ($attributeValue) {
                    $attributeValueIds[] = $attributeValue->id;
                }
            }
        }

        // Attach attribute values to product
        if (! empty($attributeValueIds)) {
            $product->attributeValues()->attach($attributeValueIds);
        }
    }
}
