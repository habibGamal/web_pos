<?php

namespace Database\Factories;

use App\Enums\AttributeType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Attribute>
 */
class AttributeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $names = [
            ['Size', 'الحجم'],
            ['Color', 'اللون'],
            ['Material', 'المادة'],
            ['Brand', 'العلامة التجارية'],
            ['Weight', 'الوزن'],
            ['Capacity', 'السعة'],
        ];

        $name = $this->faker->randomElement($names);

        return [
            'name_en' => $name[0],
            'name_ar' => $name[1],
            'type' => $this->faker->randomElement(AttributeType::cases()),
            'description_en' => $this->faker->optional()->sentence(),
            'description_ar' => $this->faker->optional()->sentence(),
            'sort_order' => $this->faker->numberBetween(1, 100),
        ];
    }

    /**
     * Indicate that the attribute is of type SELECT.
     */
    public function select(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AttributeType::SELECT,
        ]);
    }

    /**
     * Indicate that the attribute is of type COLOR.
     */
    public function color(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AttributeType::COLOR,
        ]);
    }

    /**
     * Indicate that the attribute is of type TEXT.
     */
    public function text(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AttributeType::TEXT,
        ]);
    }

    /**
     * Indicate that the attribute is of type NUMBER.
     */
    public function number(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AttributeType::NUMBER,
        ]);
    }

    /**
     * Indicate that the attribute is of type BOOLEAN.
     */
    public function boolean(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => AttributeType::BOOLEAN,
        ]);
    }
}
