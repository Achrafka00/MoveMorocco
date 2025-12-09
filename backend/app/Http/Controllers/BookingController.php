<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Booking;
use App\Models\Vehicle;

class BookingController extends Controller
{
    public function index()
    {
        return Booking::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone_number' => 'required|string|max:20',
            'pickup_date' => 'required|date',
            'pickup_time' => 'nullable|string',
            'pickup_location' => 'required|string|max:255',
            'dropoff_location' => 'required|string|max:255',
            'passengers' => 'required|integer|min:1',
            'vehicle_id' => 'required|exists:vehicles,id',
            'message' => 'nullable|string',
        ]);

        // Create booking with mapped field names
        // Calculate estimated price based on vehicle type
        $basePrice = 500; // Default fallback
        
        if ($request->has('vehicle_id')) {
             $vehicle = Vehicle::find($validated['vehicle_id']);
             if ($vehicle) {
                 $vehicleType = $vehicle->category ? $vehicle->category->name : 'Standard';
                 $basePrice = $vehicle->price_per_km * 10; // Assume 10km avg if no distance (rough estimate for now)
             }
        } elseif ($request->has('vehicle_type')) {
             // Fallback if vehicle_id not passed but vehicle_type string is
             $basePrice = match(strtolower($request->vehicle_type)) {
                'luxury van' => 1500,
                'minibus' => 1200,
                '4x4' => 1000,
                'luxury car' => 800,
                default => 500
            };
        }

        // Add random variance for realism (±10%)
        $estimatedPrice = $basePrice * (rand(90, 110) / 100);

        $booking = Booking::create([
            'name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone_number'],
            'date' => $validated['pickup_date'],
            'time' => $validated['pickup_time'] ?? null,
            'pickup' => $validated['pickup_location'],
            'dropoff' => $validated['dropoff_location'],
            'passengers' => $validated['passengers'],
            'vehicleType' => $validated['vehicle_id'], // Store vehicle_id here
            'message' => $validated['message'] ?? '',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|string|in:pending,confirmed,completed,cancelled',
            'price' => 'nullable|numeric',
        ]);

        $booking->update($validated);

        return response()->json($booking);
    }
}
