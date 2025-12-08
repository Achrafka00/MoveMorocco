<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerDriver extends Model
{
    protected $fillable = [
        'partner_id', 'name', 'avatar_url', 'phone',
        'license_number', 'rating', 'is_active'
    ];

    public function partner()
    {
        return $this->belongsTo(\App\Models\Partner::class);
    }

    public function vehicles()
    {
        return $this->hasMany(\App\Models\Vehicle::class, 'driver_id');
    }
}
