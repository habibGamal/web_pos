<?php

namespace App\Models;

use App\Enums\AttributeType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Attribute extends Model
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
        'type',
        'description_en',
        'description_ar',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => AttributeType::class,
            'sort_order' => 'integer',
        ];
    }

    /**
     * Get the attribute values for this attribute.
     */
    public function values(): HasMany
    {
        return $this->hasMany(AttributeValue::class)->orderBy('sort_order');
    }

    /**
     * Get the name in the current locale.
     */
    public function getNameAttribute(): string
    {
        $locale = app()->getLocale();

        return $this->{"name_{$locale}"} ?? $this->name_en;
    }

    /**
     * Get the description in the current locale.
     */
    public function getDescriptionAttribute(): ?string
    {
        $locale = app()->getLocale();

        return $this->{"description_{$locale}"} ?? $this->description_en;
    }

    /**
     * Scope to order by sort order.
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('name_en');
    }
}
