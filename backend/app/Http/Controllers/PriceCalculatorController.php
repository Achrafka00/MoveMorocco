<?php

namespace App\Http\Controllers;

use App\Models\City;
use App\Models\CityDistance;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class PriceCalculatorController extends Controller
{
    // Calculate price between two cities for a specific vehicle
    public function calculate(Request $request)
    {
        $validated = $request->validate([
            'origin_city_id' => 'required|exists:cities,id',
            'destination_city_id' => 'required|exists:cities,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'category_id' => 'nullable|exists:vehicle_categories,id',
        ]);

        $originCity = City::find($validated['origin_city_id']);
        $destinationCity = City::find($validated['destination_city_id']);

        // Get distance
        $distance = CityDistance::getDistance(
            $validated['origin_city_id'],
            $validated['destination_city_id']
        );

        if (!$distance) {
            return response()->json([
                'error' => 'No route found between these cities'
            ], 404);
        }

        // Calculate price
        $pricePerKm = 3.5; // Default price per km in MAD

        if (isset($validated['vehicle_id'])) {
            $vehicle = Vehicle::find($validated['vehicle_id']);
            $pricePerKm = $vehicle->price_per_km ?? 3.5;
        } elseif (isset($validated['category_id'])) {
            // Get average price for category
            $avgPrice = Vehicle::where('category_id', $validated['category_id'])
                ->where('is_approved', true)
                ->avg('price_per_km');
            $pricePerKm = $avgPrice ?? 3.5;
        }

        $totalPrice = $distance * $pricePerKm;

        return response()->json([
            'origin' => $originCity->name,
            'destination' => $destinationCity->name,
            'distance_km' => $distance,
            'price_per_km' => round($pricePerKm, 2),
            'total_price' => round($totalPrice, 2),
            'currency' => 'MAD',
        ]);
    }

    // Get all cities
    public function getCities()
    {
        $cities = City::orderBy('name')->get();
        return response()->json($cities);
    }
}
