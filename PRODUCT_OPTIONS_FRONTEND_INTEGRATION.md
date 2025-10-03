# Product Options Frontend Integration

## Overview
This document describes the frontend integration of the product options feature, enabling customers to select product preferences (like Color, Size, etc.) when viewing products.

## Changes Made

### 1. GraphQL Schema Updates (`backend/graphql/products.graphql`)

#### Added Option Type
```graphql
type Option {
    "Unique identifier"
    id: ID!

    "Option name (localized)"
    name: String! @localized

    "Option name in English"
    name_en: String!

    "Option name in Arabic"
    name_ar: String!

    "Array of possible values"
    values: [String!]!

    "When the option was created"
    created_at: DateTime!

    "When the option was last updated"
    updated_at: DateTime!
}
```

#### Updated Product Type
Added `options` field to Product type:
```graphql
"Product's options"
options: [Option!]! @belongsToMany
```

### 2. Frontend GraphQL Queries (`frontend/src/hooks/use-products.tsx`)

Updated all three product queries to include options:

#### PRODUCTS_QUERY
```graphql
options {
  id
  name
  values
}
```

#### PRODUCT_BY_ID_QUERY
```graphql
options {
  id
  name
  values
}
```

#### PRODUCT_BY_SLUG_QUERY
```graphql
options {
  id
  name
  values
}
```

### 3. Product Detail Page (`frontend/src/app/[locale]/products/[id]/page.tsx`)

#### Added State Management
```tsx
const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
```

#### Added Options Selection UI
After variant selection and before quantity selector:

```tsx
{/* Product Options */}
{product.options && product.options.length > 0 && (
  <div className="space-y-4">
    {product.options.map((option: any) => (
      <div key={option.id} className="space-y-2">
        <Label className="text-base font-medium">
          {option.name}
        </Label>
        <Select
          value={selectedOptions[option.name] || ''}
          onValueChange={(value) => setSelectedOptions(prev => ({
            ...prev,
            [option.name]: value
          }))}
        >
          <SelectTrigger>
            <SelectValue placeholder={`${t('product.select')} ${option.name}`} />
          </SelectTrigger>
          <SelectContent>
            {option.values.map((value: string) => (
              <SelectItem key={value} value={value}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    ))}
  </div>
)}
```

#### Added Options Display in Specifications Tab
Shows all available options with their values as badges:

```tsx
{product.options && product.options.length > 0 && (
  <>
    <div className="py-2">
      <span className="font-semibold text-gray-900">{t('product.availableOptions')}</span>
    </div>
    {product.options.map((option: any) => (
      <div key={option.id} className="flex items-center justify-between py-2 border-b">
        <span className="font-medium">{option.name}</span>
        <div className="flex flex-wrap gap-1 max-w-xs justify-end">
          {option.values.map((value: string, idx: number) => (
            <Badge key={idx} variant="secondary" className="text-xs">
              {value}
            </Badge>
          ))}
        </div>
      </div>
    ))}
  </>
)}
```

## User Experience Flow

### 1. Product Viewing
- Customer navigates to a product detail page
- If the product has options, they are displayed below variant selection
- Each option shows a dropdown with available values

### 2. Option Selection
- Customer selects their preferred option values (e.g., Color: Red, Size: Large)
- Selections are stored in component state
- UI updates to show selected values

### 3. Specifications Tab
- Shows all available options for the product
- Values are displayed as badges for easy scanning
- Helps customers understand all available choices

### 4. Add to Cart (Future Integration)
- Selected options will be passed along with product/variant when adding to cart
- Options will be stored in cart items for order processing

## Data Structure

### Product with Options Example
```json
{
  "id": "1",
  "name": "Classic T-Shirt",
  "options": [
    {
      "id": "1",
      "name": "Color",
      "name_en": "Color",
      "name_ar": "اللون",
      "values": ["Red", "Blue", "Green", "Black", "White"]
    },
    {
      "id": "2",
      "name": "Size",
      "name_en": "Size",
      "name_ar": "الحجم",
      "values": ["Small", "Medium", "Large", "X-Large"]
    }
  ]
}
```

### Selected Options State
```tsx
{
  "Color": "Red",
  "Size": "Large"
}
```

## Next Steps

### Required for Complete Integration:

1. **Cart Integration**
   - Update `addToCart` mutation to accept selected options
   - Store options in cart items table's `options` JSON field
   - Update cart display to show selected options

2. **Order Processing**
   - Ensure selected options flow through to order items
   - Display options in order confirmation and history
   - Include options in order emails and invoices

3. **Validation**
   - Add validation to ensure required options are selected before adding to cart
   - Show error messages for missing option selections
   - Highlight incomplete option selections

4. **Mobile Optimization**
   - Test option selection UI on mobile devices
   - Ensure dropdowns work well on touch devices
   - Optimize layout for smaller screens

5. **Translation Keys**
   - Add missing translation keys:
     - `product.select` - "Select"
     - `product.availableOptions` - "Available Options"
   - Update translation files for Arabic/English

## Testing

### Manual Testing Checklist:
- [ ] Options display correctly on product pages with options
- [ ] Options don't display on products without options
- [ ] Option dropdowns work and update state
- [ ] Selected options are visible in specifications tab
- [ ] Options work alongside variant selection
- [ ] Multiple options can be selected independently
- [ ] GraphQL queries return options correctly
- [ ] Arabic translation displays properly

### Database Verification:
```sql
-- Check products with options
SELECT p.name_en, o.name_en as option_name, o.values
FROM products p
JOIN product_options po ON p.id = po.product_id
JOIN options o ON po.option_id = o.id
WHERE p.id = 1;
```

## Benefits

✅ **Flexibility** - Support any type of product customization
✅ **User-Friendly** - Clean dropdown interface for option selection
✅ **Bilingual** - Full Arabic/English support throughout
✅ **Scalable** - Can handle unlimited options per product
✅ **Visual** - Badge display in specifications for quick overview
✅ **Integrated** - Works seamlessly with existing variant system

## Related Files

### Backend
- `backend/graphql/products.graphql` - GraphQL schema
- `backend/app/Models/Product.php` - Product model with options relationship
- `backend/app/Models/Option.php` - Option model
- `backend/database/migrations/2025_10_01_221600_create_options_table.php`
- `backend/database/migrations/2025_10_01_221641_create_product_options_table.php`

### Frontend
- `frontend/src/hooks/use-products.tsx` - GraphQL queries with options
- `frontend/src/app/[locale]/products/[id]/page.tsx` - Product detail page with option selection
- `frontend/src/gql/graphql.ts` - Generated TypeScript types (auto-generated)

## Screenshots Location
(Add screenshots after deployment showing the options UI)
