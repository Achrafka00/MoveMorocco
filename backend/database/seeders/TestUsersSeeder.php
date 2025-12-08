<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Partner;
use Illuminate\Support\Facades\Hash;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin User
        $adminUser = User::create([
            'name' => 'Admin User',
            'email' => 'admin@movemorocco.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Partner User 1 (Individual Driver)
        $partner1 = Partner::create([
            'name' => 'Mohammed El Amrani',
            'phone' => '+212 600 111 111',
            'vehicle_type' => 'Sedan',
            'type' => 'individual',
            'description' => 'Professional driver with 10 years experience',
            'is_approved' => true,
            'avatar_url' => 'https://i.pravatar.cc/150?img=12',
            'rating' => 4.8,
        ]);

        $partnerUser1 = User::create([
            'name' => 'Mohammed El Amrani',
            'email' => 'partner@movemorocco.com',
            'password' => Hash::make('password'),
            'role' => 'partner',
            'partner_id' => $partner1->id,
        ]);

        // Partner User 2 (Company)
        $partner2 = Partner::create([
            'name' => 'Fatima Zahra',
            'phone' => '+212 600 222 222',
            'vehicle_type' => 'SUV',
            'type' => 'company',
            'company_name' => 'Atlas Transport Agency',
            'description' => 'Premium transport company serving all of Morocco',
            'is_approved' => true,
            'avatar_url' => 'https://i.pravatar.cc/150?img=45',
            'rating' => 4.9,
        ]);

        $partnerUser2 = User::create([
            'name' => 'Fatima Zahra',
            'email' => 'company@movemorocco.com',
            'password' => Hash::make('password'),
            'role' => 'partner',
            'partner_id' => $partner2->id,
        ]);

        // Customer User
        $customerUser = User::create([
            'name' => 'John Doe',
            'email' => 'customer@movemorocco.com',
            'password' => Hash::make('password'),
            'role' => 'customer',
        ]);

        echo "\n✅ Test users created successfully!\n";
        echo "\n📋 LOGIN CREDENTIALS:\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "🔐 ADMIN:\n";
        echo "   Email: admin@movemorocco.com\n";
        echo "   Password: password\n";
        echo "\n🚗 PARTNER (Individual Driver):\n";
        echo "   Email: partner@movemorocco.com\n";
        echo "   Password: password\n";
        echo "\n🏢 PARTNER (Company):\n";
        echo "   Email: company@movemorocco.com\n";
        echo "   Password: password\n";
        echo "\n👤 CUSTOMER:\n";
        echo "   Email: customer@movemorocco.com\n";
        echo "   Password: password\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
    }
}
