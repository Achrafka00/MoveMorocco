<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\City;

class CityDistancesSeeder extends Seeder
{
    public function run(): void
    {
        // Distance matrix in kilometers (approximate real distances)
        $distances = [
            // From Casablanca
            ['Casablanca', 'Rabat', 87],
            ['Casablanca', 'Marrakech', 240],
            ['Casablanca', 'Fes', 300],
            ['Casablanca', 'Tangier', 340],
            ['Casablanca', 'Agadir', 500],
            ['Casablanca', 'Meknes', 250],
            ['Casablanca', 'Oujda', 600],
            ['Casablanca', 'Kenitra', 120],
            ['Casablanca', 'Tetouan', 370],
            ['Casablanca', 'Safi', 200],
            ['Casablanca', 'Essaouira', 360],
            
            // From Rabat
            ['Rabat', 'Marrakech', 330],
            ['Rabat', 'Fes', 210],
            ['Rabat', 'Tangier', 250],
            ['Rabat', 'Agadir', 580],
            ['Rabat', 'Meknes', 140],
            ['Rabat', 'Oujda', 510],
            ['Rabat', 'Kenitra', 40],
            ['Rabat', 'Tetouan', 280],
            ['Rabat', 'Safi', 280],
            
            // From Marrakech
            ['Marrakech', 'Fes', 530],
            ['Marrakech', 'Tangier', 580],
            ['Marrakech', 'Agadir', 260],
            ['Marrakech', 'Meknes', 480],
            ['Marrakech', 'Essaouira', 190],
            ['Marrakech', 'Safi', 160],
            
            // From Fes
            ['Fes', 'Tangier', 300],
            ['Fes', 'Meknes', 60],
            ['Fes', 'Oujda', 320],
            ['Fes', 'Tetouan', 230],
            
            // From Tangier
            ['Tangier', 'Tetouan', 60],
            ['Tangier', 'Meknes', 250],
            ['Tangier', 'Agadir', 820],
            
            // From Agadir
            ['Agadir', 'Essaouira', 170],
            ['Agadir', 'Safi', 300],
        ];

        DB::table('city_distances')->truncate();

        foreach ($distances as $distance) {
            $origin = City::where('name', $distance[0])->first();
            $destination = City::where('name', $distance[1])->first();

            if ($origin && $destination) {
                // Insert both directions
                DB::table('city_distances')->insert([
                    'origin_city_id' => $origin->id,
                    'destination_city_id' => $destination->id,
                    'distance_km' => $distance[2],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('city_distances')->insert([
                    'origin_city_id' => $destination->id,
                    'destination_city_id' => $origin->id,
                    'distance_km' => $distance[2],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        echo "✅ City distances seeded successfully!\n";
        echo "   Total routes: " . (count($distances) * 2) . " (bidirectional)\n";
    }
}
