<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Booking;
use App\Models\Partner;
use App\Models\Vehicle;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function getDashboardStats()
    {
        $now = Carbon::now();
        $thisMonth = $now->startOfMonth();

        // Total earnings this month
        $totalEarnings = Booking::where('created_at', '>=', $thisMonth)
            ->whereNotNull('commission_amount')
            ->sum('commission_amount');

        // Number of rides this month
        $totalRides = Booking::where('created_at', '>=', $thisMonth)->count();

        // Top partner this month
        $topPartner = Booking::select('partner_id')
            ->selectRaw('COUNT(*) as ride_count')
            ->where('created_at', '>=', $thisMonth)
            ->whereNotNull('partner_id')
            ->groupBy('partner_id')
            ->orderByDesc('ride_count')
            ->with('partner')
            ->first();

        // Unpaid commissions
        $unpaidCommissions = Booking::where('commission_paid', false)
            ->whereNotNull('commission_amount')
            ->sum('commission_amount');

        $unpaidBookingsCount = Booking::where('commission_paid', false)
            ->whereNotNull('commission_amount')
            ->count();

        // Recent bookings
        $recentBookings = Booking::with('partner')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json([
            'total_earnings_this_month' => round($totalEarnings, 2),
            'total_rides_this_month' => $totalRides,
            'top_partner' => $topPartner ? [
                'name' => $topPartner->partner->name ?? 'N/A',
                'ride_count' => $topPartner->ride_count
            ] : null,
            'unpaid_commissions' => [
                'amount' => round($unpaidCommissions, 2),
                'count' => $unpaidBookingsCount
            ],
            'recent_bookings' => $recentBookings
        ]);
    }

    public function markCommissionPaid(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);
        
        $booking->update([
            'commission_paid' => true,
            'commission_paid_at' => now()
        ]);

        return response()->json(['message' => 'Commission marked as paid']);
    }
}
