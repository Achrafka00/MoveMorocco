<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CityDistance extends Model
{
    protected $fillable = [
        'origin_city_id',
        'destination_city_id',
        'distance_km',
    ];

    public function originCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'origin_city_id');
    }

    public function destinationCity(): BelongsTo
    {
        return $this->belongsTo(City::class, 'destination_city_id');
    }

    // Get distance between two cities
    public static function getDistance(int $originId, int $destinationId): ?int
    {
        $distance = self::where('origin_city_id', $originId)
            ->where('destination_city_id', $destinationId)
            ->first();

        return $distance ? $distance->distance_km : null;
    }
}
