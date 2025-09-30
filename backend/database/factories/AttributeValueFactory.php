<?php

namespace Database\Factories;

use App\Models\Attribute;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AttributeValue>
 */
class AttributeValueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $values = [
            ['S', 'Small', 'صغير'],
            ['M', 'Medium', 'متوسط'],
            ['L', 'Large', 'كبير'],
            ['XL', 'Extra Large', 'كبير جداً'],
            ['red', 'Red', 'أحمر'],
            ['blue', 'Blue', 'أزرق'],
            ['green', 'Green', 'أخضر'],
            ['black', 'Black', 'أسود'],
            ['white', 'White', 'أبيض'],
        ];

        $value = $this->faker->randomElement($values);

        return [
            'attribute_id' => Attribute::factory(),
            'value' => $value[0],
            'value_en' => $value[1],
            'value_ar' => $value[2],
            'color_code' => null,
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    /**
     * Indicate that the attribute value is for a color attribute.
     */
    public function color(): static
    {
        return $this->state(fn (array $attributes) => [
            'color_code' => $this->faker->hexColor(),
        ]);
    }

    /**
     * Indicate that the attribute value is for a size attribute.
     */
    public function size(): static
    {
        $sizes = [
            ['XS', 'Extra Small', 'صغير جداً'],
            ['S', 'Small', 'صغير'],
            ['M', 'Medium', 'متوسط'],
            ['L', 'Large', 'كبير'],
            ['XL', 'Extra Large', 'كبير جداً'],
            ['XXL', 'Double Extra Large', 'كبير جداً جداً'],
        ];

        $size = $this->faker->randomElement($sizes);

        return $this->state(fn (array $attributes) => [
            'value' => $size[0],
            'value_en' => $size[1],
            'value_ar' => $size[2],
        ]);
    }

    /**
     * Indicate that the attribute value is for a material attribute.
     */
    public function material(): static
    {
        $materials = [
            ['cotton', 'Cotton', 'قطن'],
            ['polyester', 'Polyester', 'بوليستر'],
            ['wool', 'Wool', 'صوف'],
            ['silk', 'Silk', 'حرير'],
            ['leather', 'Leather', 'جلد'],
        ];

        $material = $this->faker->randomElement($materials);

        return $this->state(fn (array $attributes) => [
            'value' => $material[0],
            'value_en' => $material[1],
            'value_ar' => $material[2],
        ]);
    }
}
