<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\PriceEstimatorController;
use App\Http\Controllers\PriceCalculatorController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\PartnerController;
use App\Http\Controllers\Admin\PartnerManagementController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Price calculator (public)
Route::get('/cities', [PriceCalculatorController::class, 'getCities']);
Route::post('/calculate-price', [PriceCalculatorController::class, 'calculate']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Partner routes (protected)
    Route::prefix('partner')->group(function () {
        Route::post('/profile', [PartnerController::class, 'createProfile']);
        Route::get('/profile', [PartnerController::class, 'profile']);
        Route::put('/profile', [PartnerController::class, 'updateProfile']);
        Route::post('/upload-avatar', [PartnerController::class, 'uploadAvatar']);
        
        // Drivers management
        Route::get('/drivers', [PartnerController::class, 'getDrivers']);
        Route::post('/drivers', [PartnerController::class, 'addDriver']);
        Route::put('/drivers/{id}', [PartnerController::class, 'updateDriver']);
        Route::delete('/drivers/{id}', [PartnerController::class, 'deleteDriver']);
        Route::post('/drivers/{id}/upload-avatar', [PartnerController::class, 'uploadDriverAvatar']);
        
        // Vehicles management
        Route::get('/vehicles', [PartnerController::class, 'getVehicles']);
        Route::post('/vehicles', [PartnerController::class, 'addVehicle']);
        Route::put('/vehicles/{id}', [PartnerController::class, 'updateVehicle']);
        Route::delete('/vehicles/{id}', [PartnerController::class, 'deleteVehicle']);
        Route::post('/vehicles/{id}/upload-images', [PartnerController::class, 'uploadVehicleImages']);
    });

    // Admin Routes
    Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
        // Dashboard Stats
        Route::get('/stats', [PartnerManagementController::class, 'getStats']);
        
        // Partner Management
        Route::get('/partners', [PartnerManagementController::class, 'index']);
        Route::get('/partners/{id}', [PartnerManagementController::class, 'show']);
        Route::put('/partners/{id}', [PartnerManagementController::class, 'updatePartner']);
        Route::delete('/partners/{id}', [PartnerManagementController::class, 'deletePartner']);
        Route::post('/partners/{id}/upload-avatar', [PartnerManagementController::class, 'uploadAvatar']);
        Route::post('/partners/{id}/approve', [PartnerManagementController::class, 'approvePartner']);
        
        // Vehicle Management
        Route::get('/vehicles', [PartnerManagementController::class, 'vehicles']);
        Route::post('/vehicles/{id}/approve', [PartnerManagementController::class, 'approveVehicle']);
        Route::put('/vehicles/{id}', [PartnerManagementController::class, 'updateVehicle']);
        Route::delete('/vehicles/{id}', [PartnerManagementController::class, 'deleteVehicle']);
        Route::post('/vehicles/{id}/upload-images', [PartnerManagementController::class, 'uploadVehicleImages']);
        
        // Booking Management
        Route::get('/bookings', [PartnerManagementController::class, 'getBookings']);
        Route::put('/bookings/{id}/status', [PartnerManagementController::class, 'updateBookingStatus']);
        Route::put('/bookings/{id}', [PartnerManagementController::class, 'updateBooking']);
        Route::delete('/bookings/{id}', [PartnerManagementController::class, 'deleteBooking']);
    });
});

Route::get('/bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);
Route::put('/bookings/{id}', [BookingController::class, 'update']);

Route::get('/cities', [PriceEstimatorController::class, 'getCities']);
Route::get('/vehicle-types', [PriceEstimatorController::class, 'getVehicleTypes']);
Route::post('/estimate-price', [PriceEstimatorController::class, 'estimatePrice']);

// Vehicle Catalogue
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/{id}', [VehicleController::class, 'show']);
Route::get('/vehicle-categories', [VehicleController::class, 'categories']);

// Analytics & Admin
Route::get('/analytics/dashboard', [AnalyticsController::class, 'getDashboardStats']);
Route::post('/bookings/{id}/mark-commission-paid', [AnalyticsController::class, 'markCommissionPaid']);
Route::get('/partners', function() { return \App\Models\Partner::all(); });
Route::post('/partners', function(\Illuminate\Http\Request $request) {
    $validated = $request->validate([
        'name' => 'required|string',
        'phone' => 'required|string',
        'vehicle_type' => 'nullable|string'
    ]);
    return \App\Models\Partner::create($validated);
});
