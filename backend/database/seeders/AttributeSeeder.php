<?php

namespace Database\Seeders;

use App\Enums\AttributeType;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Database\Seeder;

class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Size attribute
        $sizeAttribute = Attribute::create([
            'name_en' => 'Size',
            'name_ar' => 'الحجم',
            'type' => AttributeType::SELECT,
            'description_en' => 'Product size options',
            'description_ar' => 'خيارات حجم المنتج',
            'sort_order' => 1,
        ]);

        $sizeValues = [
            ['value' => 'XS', 'value_en' => 'Extra Small', 'value_ar' => 'صغير جداً', 'sort_order' => 1],
            ['value' => 'S', 'value_en' => 'Small', 'value_ar' => 'صغير', 'sort_order' => 2],
            ['value' => 'M', 'value_en' => 'Medium', 'value_ar' => 'متوسط', 'sort_order' => 3],
            ['value' => 'L', 'value_en' => 'Large', 'value_ar' => 'كبير', 'sort_order' => 4],
            ['value' => 'XL', 'value_en' => 'Extra Large', 'value_ar' => 'كبير جداً', 'sort_order' => 5],
            ['value' => 'XXL', 'value_en' => 'Double Extra Large', 'value_ar' => 'كبير جداً جداً', 'sort_order' => 6],
        ];

        foreach ($sizeValues as $valueData) {
            AttributeValue::create(array_merge($valueData, ['attribute_id' => $sizeAttribute->id]));
        }

        // Create Color attribute
        $colorAttribute = Attribute::create([
            'name_en' => 'Color',
            'name_ar' => 'اللون',
            'type' => AttributeType::COLOR,
            'description_en' => 'Product color options',
            'description_ar' => 'خيارات لون المنتج',
            'sort_order' => 2,
        ]);

        $colorValues = [
            ['value' => 'red', 'value_en' => 'Red', 'value_ar' => 'أحمر', 'color_code' => '#FF0000', 'sort_order' => 1],
            ['value' => 'blue', 'value_en' => 'Blue', 'value_ar' => 'أزرق', 'color_code' => '#0000FF', 'sort_order' => 2],
            ['value' => 'green', 'value_en' => 'Green', 'value_ar' => 'أخضر', 'color_code' => '#00FF00', 'sort_order' => 3],
            ['value' => 'black', 'value_en' => 'Black', 'value_ar' => 'أسود', 'color_code' => '#000000', 'sort_order' => 4],
            ['value' => 'white', 'value_en' => 'White', 'value_ar' => 'أبيض', 'color_code' => '#FFFFFF', 'sort_order' => 5],
            ['value' => 'yellow', 'value_en' => 'Yellow', 'value_ar' => 'أصفر', 'color_code' => '#FFFF00', 'sort_order' => 6],
        ];

        foreach ($colorValues as $valueData) {
            AttributeValue::create(array_merge($valueData, ['attribute_id' => $colorAttribute->id]));
        }

        // Create Material attribute
        $materialAttribute = Attribute::create([
            'name_en' => 'Material',
            'name_ar' => 'المادة',
            'type' => AttributeType::SELECT,
            'description_en' => 'Product material options',
            'description_ar' => 'خيارات مادة المنتج',
            'sort_order' => 3,
        ]);

        $materialValues = [
            ['value' => 'cotton', 'value_en' => 'Cotton', 'value_ar' => 'قطن', 'sort_order' => 1],
            ['value' => 'polyester', 'value_en' => 'Polyester', 'value_ar' => 'بوليستر', 'sort_order' => 2],
            ['value' => 'wool', 'value_en' => 'Wool', 'value_ar' => 'صوف', 'sort_order' => 3],
            ['value' => 'silk', 'value_en' => 'Silk', 'value_ar' => 'حرير', 'sort_order' => 4],
            ['value' => 'leather', 'value_en' => 'Leather', 'value_ar' => 'جلد', 'sort_order' => 5],
        ];

        foreach ($materialValues as $valueData) {
            AttributeValue::create(array_merge($valueData, ['attribute_id' => $materialAttribute->id]));
        }

        // Create Capacity attribute for electronics
        $capacityAttribute = Attribute::create([
            'name_en' => 'Storage Capacity',
            'name_ar' => 'سعة التخزين',
            'type' => AttributeType::SELECT,
            'description_en' => 'Storage capacity options',
            'description_ar' => 'خيارات سعة التخزين',
            'sort_order' => 4,
        ]);

        $capacityValues = [
            ['value' => '16GB', 'value_en' => '16 GB', 'value_ar' => '16 جيجا', 'sort_order' => 1],
            ['value' => '32GB', 'value_en' => '32 GB', 'value_ar' => '32 جيجا', 'sort_order' => 2],
            ['value' => '64GB', 'value_en' => '64 GB', 'value_ar' => '64 جيجا', 'sort_order' => 3],
            ['value' => '128GB', 'value_en' => '128 GB', 'value_ar' => '128 جيجا', 'sort_order' => 4],
            ['value' => '256GB', 'value_en' => '256 GB', 'value_ar' => '256 جيجا', 'sort_order' => 5],
            ['value' => '512GB', 'value_en' => '512 GB', 'value_ar' => '512 جيجا', 'sort_order' => 6],
            ['value' => '1TB', 'value_en' => '1 TB', 'value_ar' => '1 تيرا', 'sort_order' => 7],
        ];

        foreach ($capacityValues as $valueData) {
            AttributeValue::create(array_merge($valueData, ['attribute_id' => $capacityAttribute->id]));
        }
    }
}
