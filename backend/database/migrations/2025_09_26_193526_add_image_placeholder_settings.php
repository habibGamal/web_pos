<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $settings = [
            [
                'key' => 'product_placeholder_image',
                'group' => 'images',
                'type' => 'image',
                'value' => '',
                'label_en' => 'Product Placeholder Image',
                'label_ar' => 'صورة منتج افتراضية',
                'description_en' => 'Default placeholder image for products when no image is available',
                'description_ar' => 'الصورة الافتراضية للمنتجات عند عدم وجود صورة',
                'is_required' => false,
                'display_order' => 1,
            ],
            [
                'key' => 'brand_placeholder_image',
                'group' => 'images',
                'type' => 'image',
                'value' => '',
                'label_en' => 'Brand Placeholder Image',
                'label_ar' => 'صورة علامة تجارية افتراضية',
                'description_en' => 'Default placeholder image for brands when no logo is available',
                'description_ar' => 'الصورة الافتراضية للعلامات التجارية عند عدم وجود شعار',
                'is_required' => false,
                'display_order' => 2,
            ],
            [
                'key' => 'category_placeholder_image',
                'group' => 'images',
                'type' => 'image',
                'value' => '',
                'label_en' => 'Category Placeholder Image',
                'label_ar' => 'صورة فئة افتراضية',
                'description_en' => 'Default placeholder image for categories when no image is available',
                'description_ar' => 'الصورة الافتراضية للفئات عند عدم وجود صورة',
                'is_required' => false,
                'display_order' => 3,
            ],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->insert(array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('settings')->whereIn('key', [
            'product_placeholder_image',
            'brand_placeholder_image',
            'category_placeholder_image',
        ])->delete();
    }
};
