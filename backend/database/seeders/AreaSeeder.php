<?php

namespace Database\Seeders;

use App\Models\Area;
use App\Models\Gov;
use Illuminate\Database\Seeder;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cairo areas
        $cairoAreas = [
            ['name_en' => 'Maadi', 'name_ar' => 'المعادي', 'shipping_cost' => 25.00],
            ['name_en' => 'Nasr City', 'name_ar' => 'مدينة نصر', 'shipping_cost' => 20.00],
            ['name_en' => 'Heliopolis', 'name_ar' => 'مصر الجديدة', 'shipping_cost' => 22.00],
            ['name_en' => 'Downtown', 'name_ar' => 'وسط البلد', 'shipping_cost' => 18.00],
        ];

        // Alexandria areas
        $alexAreas = [
            ['name_en' => 'Montazah', 'name_ar' => 'المنتزه', 'shipping_cost' => 35.00],
            ['name_en' => 'Sidi Gaber', 'name_ar' => 'سيدي جابر', 'shipping_cost' => 30.00],
            ['name_en' => 'Agami', 'name_ar' => 'العجمي', 'shipping_cost' => 40.00],
        ];

        // Giza areas
        $gizaAreas = [
            ['name_en' => 'Dokki', 'name_ar' => 'الدقي', 'shipping_cost' => 20.00],
            ['name_en' => 'Mohandessin', 'name_ar' => 'المهندسين', 'shipping_cost' => 18.00],
            ['name_en' => 'Sheikh Zayed', 'name_ar' => 'الشيخ زايد', 'shipping_cost' => 45.00],
        ];

        $govs = Gov::all();

        foreach ($govs as $gov) {
            $areas = [];
            switch ($gov->name_en) {
                case 'Cairo':
                    $areas = $cairoAreas;
                    break;
                case 'Alexandria':
                    $areas = $alexAreas;
                    break;
                case 'Giza':
                    $areas = $gizaAreas;
                    break;
                default:
                    // For other govs, generate some default areas
                    $areas = [
                        ['name_en' => 'City Center', 'name_ar' => 'وسط المدينة', 'shipping_cost' => 25.00],
                        ['name_en' => 'East District', 'name_ar' => 'الحي الشرقي', 'shipping_cost' => 30.00],
                        ['name_en' => 'West District', 'name_ar' => 'الحي الغربي', 'shipping_cost' => 35.00],
                    ];
            }

            foreach ($areas as $area) {
                Area::create([
                    'name_en' => $area['name_en'],
                    'name_ar' => $area['name_ar'],
                    'gov_id' => $gov->id,
                    'shipping_cost' => $area['shipping_cost'],
                ]);
            }
        }
    }
}
