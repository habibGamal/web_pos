<?php

namespace App\Models;

use App\Enums\ProductType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Scout\Searchable;

class Product extends Model
{
    use HasFactory, Searchable;

    /**
     * TNTSearch configuration.
     */
    // public $asYouType = true;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name_en',
        'name_ar',
        'slug',
        'description_en',
        'description_ar',
        'type',
        'parent_id',
        'sku',
        'price',
        'sale_price',
        'cost_price',
        'quantity',
        'images',
        'category_id',
        'brand_id',
        'is_active',
        'is_featured',
        'is_default',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => ProductType::class,
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'quantity' => 'integer',
            'images' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'is_default' => 'boolean',
        ];
    }

    protected $appends = [
        'featured_image',
    ];

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        $this->load(['brand', 'category']);

        $array = [
            'id' => $this->id,
            'name_en' => $this->name_en,
            'name_ar' => $this->normalizeArabic($this->name_ar),
            'description_en' => $this->description_en,
            'description_ar' => $this->description_ar,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'type' => $this->type->value,
            'brand_name_en' => $this->brand?->name_en,
            'brand_name_ar' => $this->brand?->name_ar,
            'category_name_en' => $this->category?->name_en,
            'category_name_ar' => $this->category?->name_ar,
        ];

        return $array;
    }

    /**
     * Normalize Arabic letters for search consistency.
     *
     * @param  string|null  $text
     * @return string|null
     */
    protected function normalizeArabic($text)
    {
        if (! $text) {
            return $text;
        }
        $text = trim($text);
        $text = mb_strtolower($text, 'UTF-8');
        // Normalize common Arabic letter variations
        $search = [
            'أ', 'إ', 'آ', 'ى', 'ئ', 'ؤ', 'ة', 'ٱ', 'ء',
        ];
        $replace = [
            'ا', 'ا', 'ا', 'ي', 'ي', 'و', 'ه', 'ا', '',
        ];

        return str_replace($search, $replace, $text);
    }

    /**
     * Get the brand that owns the product.
     */
    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Get the category that owns the product.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the parent product (for variants).
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    /**
     * Get the child variants (for configurable products).
     */
    public function variants(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id')->where('type', ProductType::VARIANT);
    }

    /**
     * Get the order items for this product.
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the wishlist items for this product.
     */
    public function wishlists()
    {
        return $this->hasMany(WishlistItem::class);
    }

    /**
     * Get the attribute values for this product.
     */
    public function attributeValues(): BelongsToMany
    {
        return $this->belongsToMany(AttributeValue::class, 'product_attribute_values', 'product_id', 'attribute_value_id');
    }

    /**
     * Get the bundle items (for bundle products).
     */
    public function bundleItems(): HasMany
    {
        return $this->hasMany(BundleItem::class, 'bundle_id');
    }

    /**
     * Get the products in this bundle (for bundle products).
     */
    public function bundleProducts(): BelongsToMany
    {
        return $this->belongsToMany(self::class, 'bundle_items', 'bundle_id', 'product_id')->withPivot('quantity');
    }

    /**
     * Check if the product is in the wishlist of the given user.
     *
     * @param  int|null  $userId
     * @return bool
     */
    public function getIsInWishlistAttribute($userId = null)
    {
        if (! $userId && ! auth()->check()) {
            return false;
        }

        $userId = $userId ?? auth()->id();

        return $this->wishlists()->where('user_id', $userId)->exists();
    }

    /**
     * Get the sections for the product.
     */
    public function sections()
    {
        return $this->belongsToMany(Section::class, 'section_product')
            ->withTimestamps();
    }

    /**
     * Get the default variant for configurable products.
     */
    public function defaultVariant()
    {
        if ($this->type !== ProductType::CONFIGURABLE) {
            return;
        }

        return $this->variants()
            ->where('is_default', true)
            ->where('is_active', true)
            ->first() ?: $this->variants()->where('is_active', true)->first();
    }

    /**
     * Get the total quantity across all variants for configurable products.
     */
    public function getTotalQuantityAttribute(): int
    {
        if ($this->type === ProductType::CONFIGURABLE) {
            return $this->variants->sum('quantity');
        }

        return $this->quantity;
    }

    /**
     * Get the featured image.
     */
    public function getFeaturedImageAttribute()
    {
        if (empty($this->images)) {
            return;
        }

        return is_array($this->images) ? $this->images[0] : null;
    }

    /**
     * Check if the product has stock.
     */
    public function getIsInStockAttribute(): bool
    {
        if ($this->type === ProductType::CONFIGURABLE) {
            return $this->variants->where('quantity', '>', 0)->count() > 0;
        }

        return $this->quantity > 0;
    }

    /**
     * Get stock attribute (alias for total_quantity).
     */
    public function getStockAttribute(): int
    {
        return $this->total_quantity;
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
     * Check if product has a specific attribute value.
     */
    public function hasAttributeValue(int $attributeValueId): bool
    {
        return $this->attributeValues()->where('attribute_value_id', $attributeValueId)->exists();
    }

    /**
     * Get attribute value by attribute name.
     */
    public function getProductAttributeValue(string $attributeName): ?string
    {
        $attributeValue = $this->attributeValues
            ->whereHas('attribute', fn ($q) => $q->where('name_en', $attributeName)->orWhere('name_ar', $attributeName))
            ->first();

        return $attributeValue?->display_value;
    }

    /**
     * Scope to get only active products.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get products by type.
     */
    public function scopeByType($query, ProductType $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get only parent products (simple, configurable, bundle).
     */
    public function scopeParents($query)
    {
        return $query->whereIn('type', [ProductType::SIMPLE, ProductType::CONFIGURABLE, ProductType::BUNDLE]);
    }

    /**
     * Scope to get only variants.
     */
    public function scopeVariants($query)
    {
        return $query->where('type', ProductType::VARIANT);
    }

    public function scopeForCards()
    {
        return $this->where('is_active', true)
            ->with([
                'brand' => function ($query) {
                    $query->select('id', 'name_en', 'name_ar', 'slug', 'image');
                },
            ]);
    }
}
