<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\Vehicle;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class PartnerManagementController extends Controller
{
    // Get admin dashboard statistics
    public function getStats(Request $request)
    {
        // Determine date range based on 'period' parameter
        $period = $request->input('period', 'month');
        $startDate = $period === 'year' 
            ? Carbon::now()->startOfYear() 
            : Carbon::now()->startOfMonth();
        
        // Get all bookings (total count)
        $totalBookingsCount = Booking::count();
        
        // Optimize: Use DB aggregates instead of fetching all records
        $periodQuery = Booking::where('created_at', '>=', $startDate);
        
        // Clone query for different aggregates to avoid query builder state issues
        $periodRevenue = (clone $periodQuery)->sum('price') ?? 0;
        $periodBookingsCount = (clone $periodQuery)->count();
        $periodCommission = $periodRevenue * 0.10;
        
        // Get unpaid commissions (Total outstanding)
        $unpaidCommissions = Booking::where('commission_paid', false)->sum('price') * 0.10;
        
        // Get top partner (simplified: Most vehicles)
        $topPartner = Partner::withCount('vehicles')
            ->where('is_approved', true)
            ->orderBy('vehicles_count', 'desc')
            ->first();
        
        // Recent bookings (Limit to 10)
        $recentBookings = Booking::orderBy('created_at', 'desc')->take(10)->get();
        
        // Pending approvals
        $pendingPartners = Partner::where('is_approved', false)->count();
        $pendingVehicles = Vehicle::where('is_approved', false)->count();
        
        return response()->json([
            'monthly_revenue' => round($periodRevenue, 2),
            'monthly_commission' => round($periodCommission, 2),
            'unpaid_commissions' => round($unpaidCommissions, 2),
            'total_rides' => $periodBookingsCount,
            'total_bookings' => $totalBookingsCount,
            'total_partners' => Partner::count(),
            'total_vehicles' => Vehicle::count(),
            'pending_partners' => $pendingPartners,
            'pending_vehicles' => $pendingVehicles,
            'top_partner' => $topPartner ? [
                'name' => $topPartner->name,
                'company_name' => $topPartner->company_name,
                'bookings_count' => $topPartner->vehicles_count ?? 0
            ] : null,
            'recent_bookings' => $recentBookings,
        ]);
    }

    // Get all partners
    public function index(Request $request)
    {
        $query = Partner::with(['drivers', 'vehicles']);

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'approved') {
                $query->where('is_approved', true);
            }
        }

        // Limit results to prevent slow response
        $partners = $query->orderBy('created_at', 'desc')->take(50)->get();

        return response()->json($partners);
    }

    // Get single partner
    public function show($id)
    {
        $partner = Partner::with(['drivers', 'vehicles.category'])->findOrFail($id);
        return response()->json($partner);
    }

    // Update partner
    public function update(Request $request, $id)
    {
        $partner = Partner::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'company_name' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'vehicle_type' => 'sometimes|nullable|string',
            'type' => 'sometimes|in:individual,company',
            'is_approved' => 'sometimes|boolean',
        ]);

        $partner->update($validated);

        return response()->json($partner);
    }

    // Approve partner
    public function approve($id)
    {
        $partner = Partner::findOrFail($id);
        $partner->update(['is_approved' => true]);

        return response()->json(['message' => 'Partner approved successfully', 'partner' => $partner]);
    }

    // Delete partner
    public function destroy($id)
    {
        $partner = Partner::findOrFail($id);
        $partner->delete();

        return response()->json(['message' => 'Partner deleted successfully']);
    }

    // Get all vehicles
    public function vehicles(Request $request)
    {
        $query = Vehicle::with(['partner', 'category', 'driver']);

        if ($request->has('status')) {
            if ($request->status === 'pending') {
                $query->where('is_approved', false);
            } elseif ($request->status === 'approved') {
                $query->where('is_approved', true);
            }
        }

        // Limit results
        $vehicles = $query->orderBy('created_at', 'desc')->take(50)->get();

        return response()->json($vehicles);
    }

    public function updatePartner(Request $request, $id)
    {
        $partner = Partner::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'vehicle_type' => 'sometimes|string|max:100',
            'type' => 'sometimes|in:individual,company',
            'company_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_approved' => 'sometimes|boolean',
        ]);

        $partner->update($validated);

        return response()->json([
            'message' => 'Partner updated successfully',
            'partner' => $partner
        ]);
    }

    public function uploadAvatar(Request $request, $id)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg|max:1024',
        ]);

        $partner = Partner::findOrFail($id);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($partner->avatar_url) {
                $oldPath = str_replace('/storage/', 'public/', $partner->avatar_url);
                Storage::delete($oldPath);
            }

            // Store new avatar using public disk
            $path = $request->file('avatar')->store('partners/avatars', 'public');
            $url = Storage::url($path);
            
            // Fix double slash issue if present
            $url = str_replace('/storage//', '/storage/', $url);

            $partner->update(['avatar_url' => $url]);

            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'avatar_url' => $url
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }

    public function deletePartner($id)
    {
        $partner = Partner::findOrFail($id);
        
        // Check if partner has a user account
        $user = User::where('partner_id', $partner->id)->first();
        
        // Delete associated vehicles first
        $partner->vehicles()->delete();
        
        // Delete associated drivers
        $partner->drivers()->delete();
        
        // Delete user account if exists
        if ($user) {
            $user->delete();
        }
        
        // Finally delete partner
        $partner->delete();

        return response()->json([
            'message' => 'Partner and all associated data deleted successfully'
        ]);
    }

    public function approvePartner($id)
    {
        $partner = Partner::findOrFail($id);
        $partner->update(['is_approved' => true]);

        return response()->json([
            'message' => 'Partner approved successfully',
            'partner' => $partner
        ]);
    }

    // Approve vehicle
    public function approveVehicle($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update(['is_approved' => true, 'available' => true]);

        return response()->json(['message' => 'Vehicle approved successfully', 'vehicle' => $vehicle]);
    }

    // Update vehicle
    public function updateVehicle(Request $request, $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'model' => 'sometimes|string|max:255',
            'price_per_km' => 'sometimes|numeric|min:0',
            'is_approved' => 'sometimes|boolean',
            'available' => 'sometimes|boolean',
        ]);

        $vehicle->update($validated);

        return response()->json($vehicle);
    }

    // Delete vehicle
    public function deleteVehicle($id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted successfully']);
    }

    public function uploadVehicleImages(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120',
        ]);

        $vehicle = Vehicle::findOrFail($id);

        $path = $request->file('image')->store('vehicles', 'public');
        $url = Storage::url($path);
        
        // Fix double slash issue if present
        $url = str_replace('/storage//', '/storage/', $url);

        // Update image_url (main image)
        $vehicle->update(['image_url' => $url]);
        
        // Update images array (append)
        $images = $vehicle->images ?? [];
        $images[] = $url;
        $vehicle->update(['images' => $images]);

        return response()->json([
            'message' => 'Vehicle image uploaded successfully',
            'image_url' => $url
        ]);
    }
    
    // Get all bookings
    public function getBookings(Request $request)
    {
        $query = Booking::orderBy('created_at', 'desc');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Limit results
        $bookings = $query->take(50)->get();
        return response()->json($bookings);
    }
    
    // Update booking status
    public function updateBookingStatus(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
        ]);
        
        $booking->update(['status' => $validated['status']]);
        
        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking' => $booking
        ]);
    }

    // Update full booking details
    public function updateBooking(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'phone' => 'sometimes|string|max:20',
            'pickup' => 'sometimes|string|max:255',
            'dropoff' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'time' => 'sometimes|date_format:H:i',
            'passengers' => 'sometimes|integer|min:1',
            'price' => 'sometimes|numeric|min:0',
            'status' => 'sometimes|in:pending,confirmed,completed,cancelled',
        ]);

        $booking->update($validated);

        return response()->json([
            'message' => 'Booking updated successfully',
            'booking' => $booking
        ]);
    }

    // Delete booking
    public function deleteBooking($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully'
        ]);
    }
}
