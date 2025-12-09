<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Partner;
use App\Models\Vehicle;
use App\Models\Booking;
use App\Models\VehicleCategory;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AdminDashboardDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Categories Exist
        $categories = VehicleCategory::all();
        if ($categories->isEmpty()) {
            $this->call(VehicleCatalogueSeeder::class);
            $categories = VehicleCategory::all();
        }

        // 2. Create Additional Partners (Companies and Individuals)
        $partners = [];
        $partnerNames = [
            ['Youssef Benali', 'Benali Transport', 'company'],
            ['Amina Tazi', null, 'individual'],
            ['Karim Oudghiri', 'Oudghiri Voyages', 'company'],
            ['Omar El Fassi', null, 'individual'],
            ['Leila Amrani', 'Amrani Tours', 'company'],
            ['Hassan Idrissi', null, 'individual'],
            ['Nadia Chraibi', 'Chraibi Cars', 'company'],
            ['Driss Mansouri', null, 'individual'],
        ];

        foreach ($partnerNames as $idx => $pData) {
            $partner = Partner::create([
                'name' => $pData[0],
                'phone' => '+212 6' . rand(10, 99) . ' ' . rand(100, 999) . ' ' . rand(100, 999),
                'vehicle_type' => $idx % 2 == 0 ? 'SUV' : 'Van',
                'type' => $pData[2],
                'company_name' => $pData[1],
                'description' => 'Experienced transport provider in Morocco.',
                'is_approved' => $idx < 6, // Some are approved, some pending
            ]);
            
            // Create associated User account
            $email = strtolower(str_replace(' ', '.', $pData[0])) . '@example.com';
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                User::create([
                    'name' => $partner->name,
                    'email' => $email,
                    'password' => Hash::make('password'),
                    'role' => 'partner',
                    'partner_id' => $partner->id,
                ]);
            }

            $partners[] = $partner;
        }

        // 3. Create Vehicles
        $vehicleModels = ['Toyota Prado', 'Mercedes Vito', 'Hyundai H1', 'Dacia Dokker', 'Range Rover Sport', 'Fiat Ducato'];
        
        foreach ($partners as $partner) {
            $numVehicles = rand(1, 4);
            for ($i = 0; $i < $numVehicles; $i++) {
                try {
                    Vehicle::create([
                        'name' => $partner->name . "'s " . $vehicleModels[array_rand($vehicleModels)],
                        'model' => $vehicleModels[array_rand($vehicleModels)],
                        'year' => rand(2018, 2024),
                        'capacity' => rand(4, 9),
                        'price_per_km' => rand(5, 15),
                        'partner_id' => $partner->id,
                        'category_id' => $categories->random()->id,
                        'is_approved' => $partner->is_approved && (rand(0, 10) > 2),
                        'available' => true,
                        'image_url' => 'https://placehold.co/600x400?text=Vehicle+' . ($i+1),
                    ]);
                } catch (\Exception $e) {
                    // Ignore vehicle creation errors (usually mapping issues)
                }
            }
        }

        // 4. Create Bookings (Past and Future)
        $routes = [
            ['Marrakech', 'Casablanca', 240],
            ['Agadir', 'Essaouira', 175],
            ['Tanger', 'Chefchaouen', 110],
            ['Fes', 'Meknes', 65],
            ['Rabat', 'Casablanca', 90],
            ['Marrakech', 'Ouarzazate', 200],
        ];

        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        
        // Generate bookings for the last 12 months
        for ($i = 0; $i < 50; $i++) {
            $route = $routes[array_rand($routes)];
            $price = $route[2] * rand(4, 8); // Rough price calc
            $date = Carbon::now()->subDays(rand(1, 365))->addDays(rand(0, 30)); // Spread across year
            
            $status = $statuses[array_rand($statuses)];
            if ($date->isFuture()) $status = ($status == 'completed') ? 'confirmed' : $status;

            try {
                Booking::create([
                    'name' => 'Customer ' . ($i + 1),
                    'email' => 'customer' . ($i + 1) . '@example.com',
                    'phone' => '+212 600 ' . rand(100000, 999999),
                    'pickup' => $route[0],
                    'dropoff' => $route[1],
                    'date' => $date->format('Y-m-d'),
                    'time' => rand(8, 20) . ':00',
                    'passengers' => rand(1, 6),
                    'vehicleType' => rand(1, 10), // Random vehicle ID
                    'message' => rand(0, 1) ? 'Extra luggage' : null,
                    'status' => $status,
                    'price' => $price,
                    'created_at' => $date, // To match chart logic
                    'updated_at' => $date,
                    'commission_paid' => (rand(0, 1) && $status == 'completed'),
                ]);
            } catch (\Exception $e) {
                // Ignore booking creation errors
            }
        }

        echo "\n✅ Admin Dashboard Demo Data Seeded (with skips on error)!\n";
    }
}
