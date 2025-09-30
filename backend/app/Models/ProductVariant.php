<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductVariant extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'sku',
        'images',
        'quantity',
        'price',
        'sale_price',
        'is_default',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'images' => 'array',
            'quantity' => 'integer',
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'is_default' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the product that owns the variant.
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the attribute values for this variant.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'variant_attribute_values', 'variant_id', 'attribute_value_id');
    }

    /**
     * Get the first image or null if no images.
     */
    public function getFeaturedImageAttribute(): ?string
    {
        if (empty($this->images)) {
            return null;
        }

        return is_array($this->images) ? $this->images[0] : null;
    }

    /**
     * Get variant attributes as a formatted string.
     */
    public function getAttributesStringAttribute(): string
    {
        return $this->attributeValues
            ->groupBy('attribute.name')
            ->map(fn ($values, $attributeName) => $attributeName . ': ' . $values->pluck('display_value')->join(', '))
            ->join(' | ');
    }

    /**
     * Check if variant has a specific attribute value.
     */
    public function hasAttributeValue(int $attributeValueId): bool
    {
        return $this->attributeValues()->where('attribute_value_id', $attributeValueId)->exists();
    }

    /**
     * Get attribute value by attribute name.
     */
    public function getVariantAttributeValue(string $attributeName): ?string
    {
        $attributeValue = $this->attributeValues
            ->whereHas('attribute', fn ($q) => $q->where('name_en', $attributeName)->orWhere('name_ar', $attributeName))
            ->first();

        return $attributeValue?->display_value;
    }
}
