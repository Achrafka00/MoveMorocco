<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'name', 'email', 'phone',
        'pickup', 'dropoff', 'date', 'time',
        'passengers', 'vehicle_type', 'message',
        'status', 'price', 'partner_id',
        'commission_amount', 'commission_percentage',
        'commission_paid', 'commission_paid_at'
    ];

    public function partner()
    {
        return $this->belongsTo(\App\Models\Partner::class);
    }
}
