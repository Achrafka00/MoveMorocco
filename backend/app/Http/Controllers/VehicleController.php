<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\VehicleCategory;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::with(['category', 'partner']);

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        $vehicles = $query->get();

        $vehicles = $vehicles->map(function ($vehicle) {
            return [
                'id' => $vehicle->id,
                'name' => $vehicle->name,
                'model' => $vehicle->model,
                'year' => $vehicle->year,
                'capacity' => $vehicle->capacity,
                'price_per_km' => $vehicle->price_per_km,
                'image_url' => $vehicle->image_url,
                'description' => $vehicle->description,
                'available' => $vehicle->available,
                'is_approved' => $vehicle->is_approved,
                'category' => $vehicle->category,
                'partner' => $vehicle->partner,
                'average_rating' => round($vehicle->reviews()->avg('rating') ?? 4.5, 1),
                'reviews_count' => $vehicle->reviews()->count(),
                'reviews' => $vehicle->reviews()->with('user')->latest()->take(3)->get()->map(function ($review) {
                    return [
                        'id' => $review->id,
                        'user_name' => $review->user->name ?? 'Anonymous',
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'created_at' => $review->created_at->format('M d, Y'),
                    ];
                }),
            ];
        });
        return response()->json($vehicles);
    }

    public function show($id)
    {
        $vehicle = Vehicle::with(['category', 'partner', 'reviews.user'])
            ->findOrFail($id);

        return response()->json([
            'id' => $vehicle->id,
            'name' => $vehicle->name,
            'model' => $vehicle->model,
            'year' => $vehicle->year,
            'capacity' => $vehicle->capacity,
            'price_per_km' => $vehicle->price_per_km,
            'image_url' => $vehicle->image_url,
            'description' => $vehicle->description,
            'category' => $vehicle->category,
            'partner' => $vehicle->partner,
            'average_rating' => round($vehicle->averageRating(), 1),
            'reviews_count' => $vehicle->reviews->count(),
            'reviews' => $vehicle->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user_name' => $review->user->name,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->format('M d, Y')
                ];
            })
        ]);
    }

    public function categories()
    {
        return VehicleCategory::all();
    }
}
