<?php

namespace Database\Seeders;

use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
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

        // Available product variant images
        $availableImages = [
            'product-variants/01K4JQR3RR1TTRNMPQ4W29NSYY.webp',
            'product-variants/01K4JRKPQVRA22Z4K1SD1FT4QW.webp',
            'product-variants/01K4JRKQ7EY24M4FXFW2MMQN08.webp',
            'product-variants/01K4JRPS5PANZKK9NRB7TYBS0K.webp',
            'product-variants/01K4JRPSBY95K73T11DXK36ARS.webp',
        ];

        // Sample product data with attribute combinations
        $productData = [
            [
                'name_en' => 'Classic Cotton T-Shirt',
                'name_ar' => 'قميص قطني كلاسيكي',
                'description_en' => 'A comfortable and stylish cotton t-shirt perfect for everyday wear. Made from 100% premium cotton.',
                'description_ar' => 'قميص قطني مريح وأنيق مثالي للاستخدام اليومي. مصنوع من القطن الفاخر 100%.',
                'price' => 49.99,
                'cost_price' => 25.00,
                'variants' => [
                    ['attributes' => ['Color' => 'blue', 'Size' => 'M'], 'quantity' => 25],
                    ['attributes' => ['Color' => 'black', 'Size' => 'L'], 'quantity' => 20],
                    ['attributes' => ['Color' => 'white', 'Size' => 'S'], 'quantity' => 15],
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
                    ['attributes' => ['Color' => 'blue', 'Size' => 'L'], 'quantity' => 12],
                    ['attributes' => ['Color' => 'black', 'Size' => 'M'], 'quantity' => 18],
                    ['attributes' => ['Color' => 'blue', 'Size' => 'XL'], 'quantity' => 8],
                ],
            ],
            [
                'name_en' => 'Casual Sneakers',
                'name_ar' => 'حذاء رياضي كاجوال',
                'description_en' => 'Comfortable casual sneakers suitable for daily activities. Lightweight and breathable.',
                'description_ar' => 'حذاء رياضي كاجوال مريح مناسب للأنشطة اليومية. خفيف الوزن ومسامي.',
                'price' => 79.99,
                'cost_price' => 40.00,
                'variants' => [
                    ['attributes' => ['Color' => 'white', 'Size' => '42'], 'quantity' => 30],
                    ['attributes' => ['Color' => 'black', 'Size' => '43'], 'quantity' => 25],
                    ['attributes' => ['Color' => 'blue', 'Size' => '41'], 'quantity' => 20],
                ],
            ],
            [
                'name_en' => 'Elegant Dress',
                'name_ar' => 'فستان أنيق',
                'description_en' => 'An elegant dress perfect for special occasions. Made from high-quality fabric.',
                'description_ar' => 'فستان أنيق مثالي للمناسبات الخاصة. مصنوع من قماش عالي الجودة.',
                'price' => 129.99,
                'sale_price' => 99.99,
                'cost_price' => 65.00,
                'variants' => [
                    ['attributes' => ['Color' => 'black', 'Size' => 'S'], 'quantity' => 10],
                    ['attributes' => ['Color' => 'red', 'Size' => 'M'], 'quantity' => 15],
                    ['attributes' => ['Color' => 'blue', 'Size' => 'L'], 'quantity' => 12],
                ],
            ],
            [
                'name_en' => 'Sports Hoodie',
                'name_ar' => 'هودي رياضي',
                'description_en' => 'A cozy sports hoodie perfect for workouts or casual wear. Soft and warm.',
                'description_ar' => 'هودي رياضي مريح مثالي للتمارين أو الاستخدام العادي. ناعم ودافئ.',
                'price' => 59.99,
                'cost_price' => 30.00,
                'variants' => [
                    ['attributes' => ['Color' => 'black', 'Size' => 'XL'], 'quantity' => 22],
                    ['attributes' => ['Color' => 'green', 'Size' => 'L'], 'quantity' => 18],
                    ['attributes' => ['Color' => 'blue', 'Size' => 'M'], 'quantity' => 16],
                ],
            ],
            [
                'name_en' => 'Leather Wallet',
                'name_ar' => 'محفظة جلدية',
                'description_en' => 'A premium leather wallet with multiple compartments. Stylish and functional.',
                'description_ar' => 'محفظة جلدية فاخرة مع عدة أقسام. أنيقة وعملية.',
                'price' => 39.99,
                'cost_price' => 20.00,
                'variants' => [
                    ['attributes' => ['Color' => 'black'], 'quantity' => 35],
                    ['attributes' => ['Color' => 'blue'], 'quantity' => 28],
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
                    ['attributes' => ['Color' => 'black', 'Storage Capacity' => '32GB'], 'quantity' => 15],
                    ['attributes' => ['Color' => 'white', 'Storage Capacity' => '64GB'], 'quantity' => 12],
                    ['attributes' => ['Color' => 'blue', 'Storage Capacity' => '128GB'], 'quantity' => 8],
                ],
            ],
            [
                'name_en' => 'Summer Shorts',
                'name_ar' => 'شورت صيفي',
                'description_en' => 'Light and comfortable summer shorts. Perfect for hot weather.',
                'description_ar' => 'شورت صيفي خفيف ومريح. مثالي للطقس الحار.',
                'price' => 34.99,
                'cost_price' => 18.00,
                'variants' => [
                    ['attributes' => ['Color' => 'blue', 'Size' => 'M'], 'quantity' => 40],
                    ['attributes' => ['Color' => 'black', 'Size' => 'L'], 'quantity' => 35],
                    ['attributes' => ['Color' => 'green', 'Size' => 'S'], 'quantity' => 30],
                ],
            ],
            [
                'name_en' => 'Smart Watch',
                'name_ar' => 'ساعة ذكية',
                'description_en' => 'Advanced smart watch with health monitoring features. Stay connected and healthy.',
                'description_ar' => 'ساعة ذكية متقدمة مع ميزات مراقبة الصحة. ابق متصلاً وبصحة جيدة.',
                'price' => 199.99,
                'cost_price' => 100.00,
                'variants' => [
                    ['attributes' => ['Color' => 'black', 'Storage Capacity' => '64GB'], 'quantity' => 10],
                    ['attributes' => ['Color' => 'white', 'Storage Capacity' => '128GB'], 'quantity' => 8],
                    ['attributes' => ['Color' => 'blue', 'Storage Capacity' => '256GB'], 'quantity' => 6],
                ],
            ],
            [
                'name_en' => 'Backpack',
                'name_ar' => 'حقيبة ظهر',
                'description_en' => 'Spacious and durable backpack for daily use. Multiple compartments for organization.',
                'description_ar' => 'حقيبة ظهر واسعة ومتينة للاستخدام اليومي. أقسام متعددة للتنظيم.',
                'price' => 69.99,
                'sale_price' => 54.99,
                'cost_price' => 35.00,
                'variants' => [
                    ['attributes' => ['Color' => 'blue'], 'quantity' => 20],
                    ['attributes' => ['Color' => 'black'], 'quantity' => 25],
                    ['attributes' => ['Color' => 'green'], 'quantity' => 15],
                ],
            ],
        ];

        // Create products with variants
        foreach ($productData as $index => $data) {
            // Create the product
            $product = Product::create([
                'name_en' => $data['name_en'],
                'name_ar' => $data['name_ar'],
                'slug' => Str::slug($data['name_en']),
                'description_en' => $data['description_en'],
                'description_ar' => $data['description_ar'],
                'price' => $data['price'],
                'sale_price' => $data['sale_price'] ?? null,
                'cost_price' => $data['cost_price'],
                'category_id' => $categories->random()->id,
                'brand_id' => $brands->random()->id,
                'is_active' => true,
                'is_featured' => $index < 3, // Make first 3 products featured
            ]);

            // Create variants for this product
            foreach ($data['variants'] as $variantIndex => $variantData) {
                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => 'SKU-' . strtoupper(Str::random(8)) . '-' . $product->id . '-' . ($variantIndex + 1),
                    'images' => [$availableImages[$index % count($availableImages)]], // Use one image per variant
                    'quantity' => $variantData['quantity'],
                    'price' => null, // Use product price
                    'sale_price' => null, // Use product sale price
                    'is_default' => $variantIndex === 0, // First variant is default
                    'is_active' => true,
                ]);

                // Attach attribute values to the variant
                $attributeValueIds = [];
                foreach ($variantData['attributes'] as $attributeName => $value) {
                    $attribute = match ($attributeName) {
                        'Size' => $sizeAttribute,
                        'Color' => $colorAttribute,
                        'Material' => $materialAttribute,
                        'Storage Capacity' => $capacityAttribute,
                        default => null,
                    };

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

                // Attach attribute values to variant
                $variant->attributeValues()->attach($attributeValueIds);
            }
        }
    }
}
