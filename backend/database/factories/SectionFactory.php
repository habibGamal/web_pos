<?php

namespace Database\Factories;

use App\Enums\SectionType;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\Factory;

class SectionFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Section::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title_en' => $this->faker->words(3, true),
            'title_ar' => $this->faker->words(3, true),
            'active' => $this->faker->boolean(80),
            'sort_order' => $this->faker->numberBetween(0, 100),
            'section_type' => $this->faker->randomElement([
                SectionType::REAL,
                SectionType::RECOMMENDATION,
                SectionType::TRENDING,
                SectionType::NEW_ARRIVALS,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * Configure the factory to create a REAL section.
     */
    public function real(): static
    {
        return $this->state(function () {
            return [
                'section_type' => SectionType::REAL,
            ];
        });
    }

    /**
     * Configure the factory to create a RECOMMENDATION section.
     */
    public function recommendation(): static
    {
        return $this->state(function () {
            return [
                'section_type' => SectionType::RECOMMENDATION,
            ];
        });
    }

    /**
     * Configure the factory to create a TRENDING section.
     */
    public function trending(): static
    {
        return $this->state(function () {
            return [
                'section_type' => SectionType::TRENDING,
            ];
        });
    }

    /**
     * Configure the factory to create a NEW_ARRIVALS section.
     */
    public function newArrivals(): static
    {
        return $this->state(function () {
            return [
                'section_type' => SectionType::NEW_ARRIVALS,
            ];
        });
    }
}
