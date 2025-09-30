<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Call seeders in the correct order
        $this->call([
            GovSeeder::class,
            AreaSeeder::class,
            // SectionSeeder::class,
            AnnouncementSeeder::class,
            HeroSlideSeeder::class,
            SettingsSeeder::class,
            PolicySettingsSeeder::class,
            UserSeeder::class,
            CategorySeeder::class,
            BrandSeeder::class,
            AttributeSeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
        ]);
    }
}
