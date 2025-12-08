<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = ['booking_id', 'user_id', 'vehicle_id', 'rating', 'comment'];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(\App\Models\Vehicle::class);
    }

    public function booking()
    {
        return $this->belongsTo(\App\Models\Booking::class);
    }
}
