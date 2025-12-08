<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleType extends Model
{
    protected $fillable = ['name', 'name_ar', 'capacity', 'base_price_per_km', 'min_price'];
}
