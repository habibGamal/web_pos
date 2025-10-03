<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Option>
 */
class OptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $options = [
            [
                'name_en' => 'Color',
                'name_ar' => 'اللون',
                'values' => ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'],
            ],
            [
                'name_en' => 'Size',
                'name_ar' => 'الحجم',
                'values' => ['Small', 'Medium', 'Large', 'X-Large'],
            ],
            [
                'name_en' => 'Flavor',
                'name_ar' => 'الطعم',
                'values' => ['Vanilla', 'Chocolate', 'Strawberry', 'Mint'],
            ],
            [
                'name_en' => 'Material',
                'name_ar' => 'المادة',
                'values' => ['Cotton', 'Polyester', 'Silk', 'Wool', 'Leather'],
            ],
        ];

        $option = fake()->randomElement($options);

        return [
            'name_en' => $option['name_en'],
            'name_ar' => $option['name_ar'],
            'values' => $option['values'],
        ];
    }
}
