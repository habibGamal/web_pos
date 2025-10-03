# Product Options Implementation

## Overview
Implemented a complete product options system that allows products to have customizable options (like Color, Size, Flavor, etc.) that customers can choose when ordering.

## Database Schema

### `options` Table
- `id` - Primary key
- `name_en` - Option name in English (e.g., "Color")
- `name_ar` - Option name in Arabic (e.g., "اللون")
- `values` - JSON array of possible values (e.g., `["Red", "Blue", "Green"]`)
- `created_at`, `updated_at` - Timestamps

### `product_options` Pivot Table
- `id` - Primary key
- `product_id` - Foreign key to products
- `option_id` - Foreign key to options
- `created_at`, `updated_at` - Timestamps
- Unique constraint on `(product_id, option_id)`

## Models

### Option Model (`app/Models/Option.php`)
- **Fillable**: `name_en`, `name_ar`, `values`
- **Casts**: `values` as `array`
- **Relationships**: 
  - `products()` - BelongsToMany relationship with Product model

### Product Model Updates (`app/Models/Product.php`)
- **New Relationship**: `options()` - BelongsToMany relationship with Option model

## Filament Resources

### OptionResource (`app/Filament/Resources/OptionResource.php`)
Complete CRUD interface for managing options:

#### Features:
- **Form Fields**:
  - Name (English & Arabic)
  - TagsInput for values (add values and press Enter)
  
- **Table Columns**:
  - Name (localized)
  - Values (displayed as badges)
  - Products count (shows how many products use this option)
  - Timestamps
  
- **Actions**:
  - Edit, Delete actions
  - Bulk delete action

- **Navigation**:
  - Icon: `heroicon-o-adjustments-horizontal`
  - Group: "المنتجات" (Products)
  - Sort order: 3

### ProductResource Updates (`app/Filament/Resources/ProductResource.php`)

#### New Features:

1. **Options Tab** - Added new tab in product form:
   - Multi-select dropdown to choose options for the product
   - Supports creating new options inline
   - Helper text to guide users
   - Preloaded and searchable

2. **Bulk Action: Apply Options** - New bulk action to apply options to multiple products:
   - Select multiple products
   - Choose options to apply
   - Uses `syncWithoutDetaching()` to add options without removing existing ones
   - Requires confirmation
   - Deselects records after completion

## Usage Examples

### Creating Options
```php
$colorOption = Option::create([
    'name_en' => 'Color',
    'name_ar' => 'اللون',
    'values' => ['Red', 'Blue', 'Green', 'Black', 'White']
]);
```

### Attaching Options to Products
```php
$product = Product::find(1);
$product->options()->attach([1, 2]); // Attach option IDs 1 and 2
```

### Retrieving Product Options
```php
$product = Product::with('options')->find(1);
foreach ($product->options as $option) {
    echo $option->name_en . ': ' . implode(', ', $option->values);
}
```

### Using Options in Orders
When a customer orders a product with options, store their selected values in the `order_items` table's `options` JSON field:

```json
{
  "Color": "Red",
  "Size": "Large"
}
```

## Migrations
- `2025_10_01_221600_create_options_table.php`
- `2025_10_01_221641_create_product_options_table.php`

## Factory
- `OptionFactory` - Creates sample options (Color, Size, Flavor, Material) with realistic values

## How It Works

1. **Admin creates options** in the Options resource (e.g., Color with values: Red, Blue, Green)
2. **Admin assigns options to products** either:
   - Through the product edit form's "Options" tab
   - Using the bulk action to apply options to multiple products at once
3. **Customer views product** and sees available options with their values
4. **Customer selects preferences** (e.g., Color: Red, Size: Large)
5. **Order is created** with selected options stored in `order_items.options` JSON field

## Benefits

- ✅ Flexible - supports any type of option (Color, Size, Material, etc.)
- ✅ Reusable - same option can be applied to multiple products
- ✅ Bilingual - full Arabic/English support
- ✅ User-friendly - TagsInput for easy value management
- ✅ Efficient - bulk operations for applying options to many products
- ✅ Consistent - follows existing application patterns and conventions

## Next Steps

To fully integrate this feature:

1. **Frontend Implementation**: Add option selection UI in product detail pages
2. **Cart Integration**: Store selected options when adding to cart
3. **Order Processing**: Ensure selected options are saved with order items
4. **GraphQL API**: Add options field to Product type and mutations for cart
5. **Validation**: Add validation rules for option selection during checkout
