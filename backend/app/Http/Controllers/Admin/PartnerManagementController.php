<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Partner;
use App\Models\Vehicle;
use App\Models\User;
use App\Models\Booking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PartnerManagementController extends Controller
{
    // Get admin dashboard statistics
    public function getStats()
    {
        $currentMonth = Carbon::now()->startOfMonth();
        
        // Get all bookings
        $bookings = Booking::all();
        $monthlyBookings = Booking::where('created_at', '>=', $currentMonth)->get();
        
        // Calculate commissions (10% of booking price)
        $totalRevenue = $monthlyBookings->sum('price') ?? 0;
        $commission = $totalRevenue * 0.10;
        
        // Get unpaid commissions
        $unpaidCommissions = Booking::where('commission_paid', false)
            ->sum('price') * 0.10;
        
        // Get top partner (partner with most vehicles for now)
        $topPartner = Partner::withCount('vehicles')
            ->where('is_approved', true)
            ->orderBy('vehicles_count', 'desc')
            ->first();
        
        // Recent bookings
        $recentBookings = Booking::orderBy('created_at', 'desc')->take(10)->get();
        
        // Pending approvals
        $pendingPartners = Partner::where('is_approved', false)->count();
        $pendingVehicles = Vehicle::where('is_approved', false)->count();
        
        return response()->json([
            'monthly_revenue' => round($totalRevenue, 2),
            'monthly_commission' => round($commission, 2),
            'unpaid_commissions' => round($unpaidCommissions, 2),
            'total_rides' => $monthlyBookings->count(),
            'total_bookings' => $bookings->count(),
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

        $partners = $query->orderBy('created_at', 'desc')->get();

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

        $vehicles = $query->orderBy('created_at', 'desc')->get();

        return response()->json($vehicles);
    }

    // Update partner
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
    
    // Get all bookings
    public function getBookings(Request $request)
    {
        $query = Booking::orderBy('created_at', 'desc');
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        $bookings = $query->get();
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
}
