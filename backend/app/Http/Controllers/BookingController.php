<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Booking;

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
