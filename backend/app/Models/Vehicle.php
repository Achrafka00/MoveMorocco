<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'partner_id', 'category_id', 'name', 'model', 'year',
        'capacity', 'price_per_km', 'image_url', 'description', 'available',
        'driver_id', 'images', 'is_approved'
    ];

    protected $casts = [
        'images' => 'array',
        'is_approved' => 'boolean',
        'available' => 'boolean',
    ];

    public function partner()
    {
        return $this->belongsTo(\App\Models\Partner::class);
    }

    public function driver()
    {
        return $this->belongsTo(\App\Models\PartnerDriver::class, 'driver_id');
    }

    public function category()
    {
        return $this->belongsTo(\App\Models\VehicleCategory::class);
    }

    public function reviews()
    {
        return $this->hasMany(\App\Models\Review::class);
    }

    public function averageRating()
    {
        return $this->reviews()->avg('rating');
    }
}
