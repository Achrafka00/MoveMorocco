<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    protected $fillable = [
        'name', 'phone', 'vehicle_type', 'avatar_url', 'rating',
        'type', 'company_name', 'description', 'is_approved'
    ];

    public function drivers()
    {
        return $this->hasMany(\App\Models\PartnerDriver::class);
    }

    public function vehicles()
    {
        return $this->hasMany(\App\Models\Vehicle::class);
    }

    public function user()
    {
        return $this->hasOne(\App\Models\User::class, 'partner_id');
    }
}
