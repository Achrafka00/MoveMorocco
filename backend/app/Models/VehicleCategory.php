<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleCategory extends Model
{
    protected $fillable = ['name', 'description', 'price_multiplier'];

    public function vehicles()
    {
        return $this->hasMany(\App\Models\Vehicle::class, 'category_id');
    }
}
