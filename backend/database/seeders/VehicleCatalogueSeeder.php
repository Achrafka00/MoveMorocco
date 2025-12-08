<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleCategory;
use App\Models\Vehicle;
use App\Models\Review;
use App\Models\User;
use App\Models\Partner;

class VehicleCatalogueSeeder extends Seeder
{
    public function run(): void
    {
        // Create Vehicle Categories
        $standard = VehicleCategory::create([
            'name' => 'Standard',
            'description' => 'Comfortable and economical vehicles for everyday travel',
            'price_multiplier' => 1.00
        ]);

        $vip = VehicleCategory::create([
            'name' => 'VIP',
            'description' => 'Luxury vehicles with premium amenities',
            'price_multiplier' => 1.50
        ]);

        $vvip = VehicleCategory::create([
            'name' => 'VVIP',
            'description' => 'Ultra-luxury vehicles for exclusive travel',
            'price_multiplier' => 2.00
        ]);

        // Get existing partners or create new ones with avatars
        Partner::query()->delete();
        
        $partners = [
            [
                'name' => 'Ahmed El Fassi',
                'phone' => '+212700000001',
                'vehicle_type' => 'Premium Sedan',
                'avatar_url' => 'https://i.pravatar.cc/150?img=12',
                'rating' => 4.8,
                'type' => 'individual',
                'is_approved' => true,
            ],
            [
                'name' => 'Youssef Berrada',
                'phone' => '+212700000002',
                'vehicle_type' => 'Luxury Van',
                'avatar_url' => 'https://i.pravatar.cc/150?img=13',
                'rating' => 4.9,
                'type' => 'individual',
                'is_approved' => true,
            ],
            [
                'name' => 'Fatima Zahra',
                'phone' => '+212700000003',
                'vehicle_type' => '4x4 SUV',
                'avatar_url' => 'https://i.pravatar.cc/150?img=45',
                'rating' => 4.7,
                'type' => 'individual',
                'is_approved' => true,
            ],
            [
                'name' => 'Mohammed Alami',
                'phone' => '+212700000004',
                'vehicle_type' => 'Executive',
                'avatar_url' => 'https://i.pravatar.cc/150?img=14',
                'rating' => 4.6,
                'type' => 'individual',
                'is_approved' => true,
            ],
            [
                'name' => 'Karim Benali',
                'phone' => '+212700000005',
                'vehicle_type' => 'Premium',
                'avatar_url' => 'https://i.pravatar.cc/150?img=15',
                'rating' => 4.9,
                'type' => 'individual',
                'is_approved' => true,
            ],
        ];

        $partnerModels = [];
        foreach ($partners as $partnerData) {
            $partnerModels[] = Partner::create($partnerData);
        }

        // Car image URLs
        $carImages = [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800',
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800',
            'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
            'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800',
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800',
            'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800',
            'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800',
            'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800',
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
            'https://images.unsplash.com/photo-1612825173281-9a193378527e?w=800',
            'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
            'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800',
        ];

        $imageIndex = 0;

        // Standard Vehicles
        $standardVehicles = [
            ['name' => 'Toyota Corolla', 'model' => 'Corolla GLI', 'capacity' => 4, 'price' => 5.00],
            ['name' => 'Hyundai Accent', 'model' => 'Accent GLS', 'capacity' => 4, 'price' => 4.50],
            ['name' => 'Dacia Logan', 'model' => 'Logan Prestige', 'capacity' => 5, 'price' => 4.00],
            ['name' => 'Renault Symbol', 'model' => 'Symbol Zen', 'capacity' => 4, 'price' => 4.50],
        ];

        foreach ($standardVehicles as $data) {
            Vehicle::create([
                'partner_id' => $partnerModels[array_rand($partnerModels)]->id,
                'category_id' => $standard->id,
                'name' => $data['name'],
                'model' => $data['model'],
                'year' => rand(2019, 2024),
                'capacity' => $data['capacity'],
                'price_per_km' => $data['price'],
                'image_url' => $carImages[$imageIndex++ % count($carImages)],
                'description' => 'Reliable and comfortable vehicle perfect for city and intercity travel.',
                'available' => true,
                'is_approved' => true,
            ]);
        }

        // VIP Vehicles
        $vipVehicles = [
            ['name' => 'Mercedes-Benz E-Class', 'model' => 'E 220 d', 'capacity' => 4, 'price' => 12.00],
            ['name' => 'BMW 5 Series', 'model' => '520i', 'capacity' => 4, 'price' => 12.50],
            ['name' => 'Audi A6', 'model' => 'A6 Quattro', 'capacity' => 4, 'price' => 13.00],
            ['name' => 'Lexus ES', 'model' => 'ES 300h', 'capacity' => 4, 'price' => 11.50],
        ];

        foreach ($vipVehicles as $data) {
            Vehicle::create([
                'partner_id' => $partnerModels[array_rand($partnerModels)]->id,
                'category_id' => $vip->id,
                'name' => $data['name'],
                'model' => $data['model'],
                'year' => rand(2020, 2024),
                'capacity' => $data['capacity'],
                'price_per_km' => $data['price'],
                'image_url' => $carImages[$imageIndex++ % count($carImages)],
                'description' => 'Premium luxury sedan with advanced comfort features and elegant interior.',
                'available' => true,
                'is_approved' => true,
            ]);
        }

        // VVIP Vehicles
        $vvipVehicles = [
            ['name' => 'Mercedes-Benz S-Class', 'model' => 'S 500', 'capacity' => 4, 'price' => 20.00],
            ['name' => 'BMW 7 Series', 'model' => '750Li', 'capacity' => 4, 'price' => 22.00],
            ['name' => 'Range Rover', 'model' => 'Autobiography', 'capacity' => 5, 'price' => 25.00],
            ['name' => 'Porsche Panamera', 'model' => 'Turbo S', 'capacity' => 4, 'price' => 30.00],
        ];

        foreach ($vvipVehicles as $data) {
            Vehicle::create([
                'partner_id' => $partnerModels[array_rand($partnerModels)]->id,
                'category_id' => $vvip->id,
                'name' => $data['name'],
                'model' => $data['model'],
                'year' => rand(2022, 2024),
                'capacity' => $data['capacity'],
                'price_per_km' => $data['price'],
                'image_url' => $carImages[$imageIndex++ % count($carImages)],
                'description' => 'Ultimate luxury experience with state-of-the-art technology and unparalleled comfort.',
                'available' => true,
                'is_approved' => true,
            ]);
        }

        // Create fake users for reviews
        $user1 = User::firstOrCreate(
            ['email' => 'customer1@example.com'],
            ['name' => 'Hassan Alami', 'password' => bcrypt('password'), 'role' => 'customer']
        );

        $user2 = User::firstOrCreate(
            ['email' => 'customer2@example.com'],
            ['name' => 'Fatima Zahra', 'password' => bcrypt('password'), 'role' => 'customer']
        );

        $user3 = User::firstOrCreate(
            ['email' => 'customer3@example.com'],
            ['name' => 'Mohammed Berrada', 'password' => bcrypt('password'), 'role' => 'customer']
        );

        $users = [$user1, $user2, $user3];

        // Create Reviews
        $vehicles = Vehicle::all();
        $reviewComments = [
            'Excellent service! The driver was professional and the car was spotless.',
            'Very comfortable ride. Highly recommend this vehicle!',
            'Great experience from start to finish. Will book again.',
            'The car was in perfect condition and the journey was smooth.',
            'Outstanding service! The vehicle exceeded my expectations.',
            'Comfortable and luxurious. Perfect for long trips.',
            'Professional driver and immaculate vehicle. 5 stars!',
            'Best transport service in Morocco. Highly recommended.',
            'Smooth ride and excellent customer service.',
            'The vehicle was exactly as described. Very satisfied!',
            'Amazing experience! The car was luxurious and comfortable.',
            'Perfect for business travel. Professional and punctual.',
            'Exceeded expectations in every way. Will use again.',
            'Great value for money. Comfortable and reliable.',
            'The driver was courteous and the car was pristine.',
        ];

        foreach ($vehicles as $vehicle) {
            // Add 2-5 reviews per vehicle
            $reviewCount = rand(2, 5);
            for ($i = 0; $i < $reviewCount; $i++) {
                Review::create([
                    'booking_id' => null,
                    'user_id' => $users[array_rand($users)]->id,
                    'vehicle_id' => $vehicle->id,
                    'rating' => rand(3, 5),
                    'comment' => $reviewComments[array_rand($reviewComments)]
                ]);
            }
        }

        echo "\n✅ Vehicle catalogue seeded successfully!\n";
        echo "   - 3 Categories created\n";
        echo "   - 12 Vehicles created (4 per category)\n";
        echo "   - All vehicles are APPROVED and AVAILABLE\n";
        echo "   - 5 Partners created\n";
        echo "   - Reviews added to all vehicles\n\n";
    }
}
