<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\City;
use App\Models\VehicleType;

class PriceEstimatorController extends Controller
{
    public function getCities()
    {
        return City::all(['id', 'name', 'name_ar']);
    }

    public function getVehicleTypes()
    {
        return VehicleType::all();
    }

    public function estimatePrice(Request $request)
    {
        $validated = $request->validate([
            'from_city_id' => 'required|exists:cities,id',
            'to_city_id' => 'required|exists:cities,id',
            'vehicle_type_id' => 'required|exists:vehicle_types,id',
            'passengers' => 'required|integer|min:1',
        ]);

        $fromCity = City::find($validated['from_city_id']);
        $toCity = City::find($validated['to_city_id']);
        $vehicleType = VehicleType::find($validated['vehicle_type_id']);

        // Calculate distance using Haversine formula
        $distance = $this->calculateDistance(
            $fromCity->latitude,
            $fromCity->longitude,
            $toCity->latitude,
            $toCity->longitude
        );

        // Calculate base price
        $basePrice = $distance * $vehicleType->base_price_per_km;
        
        // Apply minimum price
        $finalPrice = max($basePrice, $vehicleType->min_price);

        // Add passenger surcharge if needed (for capacity)
        $passengerMultiplier = 1.0;
        if ($validated['passengers'] > $vehicleType->capacity) {
            $passengerMultiplier = 1.3; // 30% surcharge if exceeding capacity
        }

        $finalPrice = $finalPrice * $passengerMultiplier;

        // Return price range (±10%)
        $minPrice = round($finalPrice * 0.9);
        $maxPrice = round($finalPrice * 1.1);

        return response()->json([
            'distance_km' => round($distance, 1),
            'estimated_price' => [
                'min' => $minPrice,
                'max' => $maxPrice,
                'currency' => 'MAD'
            ],
            'vehicle_type' => $vehicleType->name,
            'route' => $fromCity->name . ' → ' . $toCity->name
        ]);
    }

    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
