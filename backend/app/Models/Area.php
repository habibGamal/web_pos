<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Area extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name_en',
        'name_ar',
        'gov_id',
        'shipping_cost',
    ];

    /**
     * Get the governorate that owns the area.
     */
    public function gov(): BelongsTo
    {
        return $this->belongsTo(Gov::class);
    }

    /**
     * Get the addresses for the area.
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}
