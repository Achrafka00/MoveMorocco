<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CitiesSeeder extends Seeder
{
    public function run(): void
    {
        $cities = [
            ['name' => 'Casablanca', 'region' => 'Casablanca-Settat'],
            ['name' => 'Rabat', 'region' => 'Rabat-Salé-Kénitra'],
            ['name' => 'Marrakech', 'region' => 'Marrakech-Safi'],
            ['name' => 'Fes', 'region' => 'Fès-Meknès'],
            ['name' => 'Tangier', 'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['name' => 'Agadir', 'region' => 'Souss-Massa'],
            ['name' => 'Meknes', 'region' => 'Fès-Meknès'],
            ['name' => 'Oujda', 'region' => 'Oriental'],
            ['name' => 'Kenitra', 'region' => 'Rabat-Salé-Kénitra'],
            ['name' => 'Tetouan', 'region' => 'Tanger-Tétouan-Al Hoceïma'],
            ['name' => 'Safi', 'region' => 'Marrakech-Safi'],
            ['name' => 'Essaouira', 'region' => 'Marrakech-Safi'],
        ];

        // Clear existing
        DB::table('cities')->delete();

        foreach ($cities as $city) {
            DB::table('cities')->insert([
                'name' => $city['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        echo "✅ " . count($cities) . " cities seeded successfully!\n";
    }
}
