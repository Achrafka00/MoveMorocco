<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\City;
use App\Models\VehicleType;

class PriceEstimatorSeeder extends Seeder
{
    public function run(): void
    {
        // Popular Moroccan Cities
        $cities = [
            ['name' => 'Casablanca', 'name_ar' => 'الدار البيضاء', 'latitude' => 33.5731, 'longitude' => -7.5898],
            ['name' => 'Marrakech', 'name_ar' => 'مراكش', 'latitude' => 31.6295, 'longitude' => -7.9811],
            ['name' => 'Rabat', 'name_ar' => 'الرباط', 'latitude' => 34.0209, 'longitude' => -6.8416],
            ['name' => 'Fes', 'name_ar' => 'فاس', 'latitude' => 34.0331, 'longitude' => -5.0003],
            ['name' => 'Tangier', 'name_ar' => 'طنجة', 'latitude' => 35.7595, 'longitude' => -5.8340],
            ['name' => 'Agadir', 'name_ar' => 'أكادير', 'latitude' => 30.4278, 'longitude' => -9.5981],
            ['name' => 'Meknes', 'name_ar' => 'مكناس', 'latitude' => 33.8935, 'longitude' => -5.5473],
            ['name' => 'Essaouira', 'name_ar' => 'الصويرة', 'latitude' => 31.5085, 'longitude' => -9.7595],
            ['name' => 'Ch

efchaouen', 'name_ar' => 'شفشاون', 'latitude' => 35.1688, 'longitude' => -5.2636],
            ['name' => 'Ouarzazate', 'name_ar' => 'ورزازات', 'latitude' => 30.9335, 'longitude' => -6.9370],
        ];

        foreach ($cities as $city) {
            City::create($city);
        }

        // Vehicle Types with Pricing (MAD per km)
        $vehicleTypes = [
            ['name' => 'Economy Car', 'name_ar' => 'سيارة اقتصادية', 'capacity' => 4, 'base_price_per_km' => 5.0, 'min_price' => 150],
            ['name' => 'Luxury Van', 'name_ar' => 'شاحنة فاخرة', 'capacity' => 7, 'base_price_per_km' => 8.0, 'min_price' => 250],
            ['name' => 'Minibus', 'name_ar' => 'حافلة صغيرة', 'capacity' => 15, 'base_price_per_km' => 12.0, 'min_price' => 400],
            ['name' => '4x4 SUV', 'name_ar' => 'سيارة دفع رباعي', 'capacity' => 5, 'base_price_per_km' => 10.0, 'min_price' => 300],
        ];

        foreach ($vehicleTypes as $type) {
            VehicleType::create($type);
        }
    }
}
