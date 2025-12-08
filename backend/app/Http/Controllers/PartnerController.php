<?php

namespace App\Http\Controllers;

use App\Models\Partner;
use App\Models\Vehicle;
use App\Models\PartnerDriver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PartnerController extends Controller
{
    // Create partner profile (for new partner registration)
    public function createProfile(Request $request)
    {
        $user = $request->user();
        
        // Check if partner profile already exists
        if ($user->partner_id) {
            return response()->json(['message' => 'Partner profile already exists'], 400);
        }

        $validated = $request->validate([
            'phone' => 'required|string|max:20',
            'vehicle_type' => 'nullable|string|max:100',
            'type' => 'required|in:individual,company',
            'company_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        // Create partner
        $partner = Partner::create([
            'name' => $user->name,
            'phone' => $validated['phone'],
            'vehicle_type' => $validated['vehicle_type'] ?? null,
            'type' => $validated['type'],
            'company_name' => $validated['company_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_approved' => false, // Pending approval
        ]);

        // Link user to partner
        $user->update(['partner_id' => $partner->id]);

        return response()->json([
            'message' => 'Partner profile created successfully. Waiting for admin approval.',
            'partner' => $partner
        ], 201);
    }

    // Get partner profile
    public function profile(Request $request)
    {
        $user = $request->user();
        
        if (!$user->partner_id) {
            return response()->json(['message' => 'Partner profile not found'], 404);
        }

        $partner = Partner::with(['drivers', 'vehicles'])->find($user->partner_id);

        if (!$partner) {
            return response()->json(['message' => 'Partner profile not found'], 404);
        }

        return response()->json($partner);
    }

    // Update partner profile
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $partner = Partner::findOrFail($user->partner_id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'company_name' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'vehicle_type' => 'sometimes|nullable|string',
        ]);

        $partner->update($validated);

        return response()->json($partner);
    }

    // Upload partner avatar
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB
        ]);

        $user = $request->user();
        $partner = Partner::findOrFail($user->partner_id);

        if ($partner->avatar_url && Storage::disk('public')->exists($partner->avatar_url)) {
            Storage::disk('public')->delete($partner->avatar_url);
        }

        $path = $request->file('avatar')->store('partners/avatars', 'public');
        $partner->update(['avatar_url' => Storage::url($path)]);

        return response()->json(['avatar_url' => $partner->avatar_url]);
    }

    // Get partner drivers
    public function getDrivers(Request $request)
    {
        $user = $request->user();
        $drivers = PartnerDriver::where('partner_id', $user->partner_id)->get();

        return response()->json($drivers);
    }

    // Add a new driver
    public function addDriver(Request $request)
    {
        $user = $request->user();
        $partner = Partner::findOrFail($user->partner_id);

        if ($partner->type !== 'company') {
            return response()->json(['error' => 'Only companies can add drivers'], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'license_number' => 'nullable|string|max:50',
        ]);

        $driver = PartnerDriver::create([
            'partner_id' => $user->partner_id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'license_number' => $validated['license_number'] ?? null,
        ]);

        return response()->json($driver, 201);
    }

    // Update driver
    public function updateDriver(Request $request, $id)
    {
        $user = $request->user();
        $driver = PartnerDriver::where('partner_id', $user->partner_id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'license_number' => 'sometimes|nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
        ]);

        $driver->update($validated);

        return response()->json($driver);
    }

    // Delete driver
    public function deleteDriver(Request $request, $id)
    {
        $user = $request->user();
        $driver = PartnerDriver::where('partner_id', $user->partner_id)->findOrFail($id);
        $driver->delete();

        return response()->json(['message' => 'Driver deleted successfully']);
    }

    // Upload driver avatar
    public function uploadDriverAvatar(Request $request, $id)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $user = $request->user();
        $driver = PartnerDriver::where('partner_id', $user->partner_id)->findOrFail($id);

        if ($driver->avatar_url && Storage::disk('public')->exists($driver->avatar_url)) {
            Storage::disk('public')->delete($driver->avatar_url);
        }

        $path = $request->file('avatar')->store('drivers/avatars', 'public');
        $driver->update(['avatar_url' => Storage::url($path)]);

        return response()->json(['avatar_url' => $driver->avatar_url]);
    }

    // Get partner vehicles
    public function getVehicles(Request $request)
    {
        $user = $request->user();
        $vehicles = Vehicle::with(['category', 'driver'])
            ->where('partner_id', $user->partner_id)
            ->get();

        return response()->json($vehicles);
    }

    // Add a new vehicle
    public function addVehicle(Request $request)
    {
        $partner = auth()->user()->partner;
        
        if (!$partner) {
            return response()->json(['message' => 'Partner profile not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:2000|max:' . (date('Y') + 1),
            'capacity' => 'required|integer|min:1|max:50',
            'price_per_km' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'category_id' => [
                'required',
                'exists:vehicle_categories,id',
                function ($attribute, $value, $fail) use ($request) {
                    $year = $request->input('year');
                    $category = \App\Models\VehicleCategory::find($value);
                    
                    // Business Rule: Vehicles older than 2024 can only be Standard
                    if ($year < 2024 && $category && $category->name !== 'Standard') {
                        $fail('Vehicles manufactured before 2024 can only be added to the Standard category. Please select Standard or update the vehicle year.');
                    }
                },
            ],
            'driver_id' => 'nullable|exists:partner_drivers,id',
        ]);

        $vehicle = Vehicle::create([
            'partner_id' => $partner->id,
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'model' => $validated['model'],
            'year' => $validated['year'],
            'capacity' => $validated['capacity'],
            'price_per_km' => $validated['price_per_km'],
            'description' => $validated['description'] ?? '',
            'driver_id' => $validated['driver_id'] ?? null,
            'available' => true,
            'is_approved' => false, // Pending approval
        ]);

        return response()->json([
            'message' => 'Vehicle added successfully. Waiting for admin approval.',
            'vehicle' => $vehicle->load(['category', 'driver'])
        ], 201);
    }

    // Update vehicle
    public function updateVehicle(Request $request, $id)
    {
        $user = $request->user();
        $vehicle = Vehicle::where('partner_id', $user->partner_id)->findOrFail($id);

        $validated = $request->validate([
            'category_id' => 'sometimes|exists:vehicle_categories,id',
            'name' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'year' => 'sometimes|integer|min:1900|max:' . (date('Y') + 1),
            'capacity' => 'sometimes|integer|min:1|max:50',
            'price_per_km' => 'sometimes|numeric|min:0',
            'description' => 'sometimes|nullable|string',
            'driver_id' => 'sometimes|nullable|exists:partner_drivers,id',
        ]);

        $vehicle->update($validated);

        return response()->json($vehicle);
    }

    // Delete vehicle
    public function deleteVehicle(Request $request, $id)
    {
        $user = $request->user();
        $vehicle = Vehicle::where('partner_id', $user->partner_id)->findOrFail($id);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted successfully']);
    }

    // Upload vehicle images
    public function uploadVehicleImages(Request $request, $id)
    {
        $request->validate([
            'images' => 'required|array|max:5',
            'images.*' => 'image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $user = $request->user();
        $vehicle = Vehicle::where('partner_id', $user->partner_id)->findOrFail($id);

        $imagePaths = [];
        foreach ($request->file('images') as $image) {
            $path = $image->store('vehicles', 'public');
            $imagePaths[] = Storage::url($path);
        }

        $existingImages = $vehicle->images ?? [];
        $allImages = array_merge($existingImages, $imagePaths);

        $vehicle->update(['images' => $allImages, 'image_url' => $imagePaths[0] ?? $vehicle->image_url]);

        return response()->json(['images' => $allImages]);
    }
}
