# Data Model: Next.js + GraphQL E-commerce Migration

## Core Entities

### User Authentication
```typescript
interface User {
  id: ID!
  name: String!
  email: String!
  emailVerifiedAt: DateTime
  avatar: String
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Social authentication
  facebookId: String
  googleId: String
  
  // Relationships
  addresses: [Address!]!
  orders: [Order!]!
  cart: Cart
  wishlist: [WishlistItem!]!
  returnOrders: [ReturnOrder!]!
}

interface Address {
  id: ID!
  userId: ID!
  governorate: String!
  area: String!
  addressLine1: String!
  addressLine2: String
  phone: String!
  isDefault: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

### Product Catalog
```typescript
interface Product {
  id: ID!
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  price: Float!
  comparePrice: Float
  sku: String
  stock: Int!
  isActive: Boolean!
  images: [ProductImage!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Relationships
  category: Category!
  brand: Brand
  variants: [ProductVariant!]!
  sections: [Section!]!
  
  // Computed fields
  averageRating: Float
  reviewCount: Int!
  isInStock: Boolean!
  hasVariants: Boolean!
}

interface ProductVariant {
  id: ID!
  productId: ID!
  nameEn: String!
  nameAr: String!
  price: Float!
  stock: Int!
  sku: String
  attributes: JSON! // Color, size, etc.
  isActive: Boolean!
}

interface ProductImage {
  id: ID!
  productId: ID!
  url: String!
  altTextEn: String
  altTextAr: String
  sortOrder: Int!
}

interface Category {
  id: ID!
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  slug: String!
  image: String
  isActive: Boolean!
  sortOrder: Int!
  parentId: ID
  
  // Relationships
  parent: Category
  children: [Category!]!
  products: [Product!]!
}

interface Brand {
  id: ID!
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  logo: String
  isActive: Boolean!
  
  // Relationships
  products: [Product!]!
}

interface Section {
  id: ID!
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  sectionType: SectionType!
  isActive: Boolean!
  sortOrder: Int!
  
  // Relationships
  products: [Product!]!
}

enum SectionType {
  REAL
  RECOMMENDATION
  TRENDING
  NEW_ARRIVALS
}
```

### Shopping Cart
```typescript
interface Cart {
  id: ID!
  userId: ID!
  items: [CartItem!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Computed fields
  totalItems: Int!
  subtotal: Float!
  appliedPromotions: [AppliedPromotion!]!
  total: Float!
}

interface CartItem {
  id: ID!
  cartId: ID!
  productId: ID!
  productVariantId: ID
  quantity: Int!
  price: Float! // Price at time of adding
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Relationships
  product: Product!
  variant: ProductVariant
  
  // Computed fields
  totalPrice: Float!
}

interface WishlistItem {
  id: ID!
  userId: ID!
  productId: ID!
  createdAt: DateTime!
  
  // Relationships
  product: Product!
}
```

### Order Management
```typescript
interface Order {
  id: ID!
  userId: ID!
  orderNumber: String!
  status: OrderStatus!
  paymentStatus: PaymentStatus!
  paymentMethod: PaymentMethod!
  
  // Pricing
  subtotal: Float!
  shippingCost: Float!
  discount: Float!
  total: Float!
  
  // Address
  shippingAddress: JSON! // Snapshot of address at order time
  
  // Tracking
  notes: String
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Relationships
  user: User!
  items: [OrderItem!]!
  returns: [ReturnOrder!]!
  payments: [Payment!]!
  appliedPromotions: [AppliedPromotion!]!
  
  // Computed fields
  canBeCancelled: Boolean!
  canBeReturned: Boolean!
  estimatedDelivery: DateTime
}

interface OrderItem {
  id: ID!
  orderId: ID!
  productId: ID!
  productVariantId: ID
  quantity: Int!
  price: Float! // Price at time of order
  productSnapshot: JSON! // Product details at time of order
  
  // Relationships
  order: Order!
  product: Product
  variant: ProductVariant
  
  // Computed fields
  totalPrice: Float!
}

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

enum PaymentMethod {
  KASHIER_CREDIT_CARD
  CASH_ON_DELIVERY
}
```

### Returns Management
```typescript
interface ReturnOrder {
  id: ID!
  orderId: ID!
  userId: ID!
  returnNumber: String!
  status: ReturnOrderStatus!
  reason: String!
  description: String
  totalRefundAmount: Float!
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Relationships
  order: Order!
  user: User!
  items: [ReturnOrderItem!]!
  
  // Computed fields
  canBeModified: Boolean!
}

interface ReturnOrderItem {
  id: ID!
  returnOrderId: ID!
  orderItemId: ID!
  quantity: Int!
  reason: String!
  refundAmount: Float!
  
  // Relationships
  returnOrder: ReturnOrder!
  orderItem: OrderItem!
}

enum ReturnOrderStatus {
  PENDING
  APPROVED
  REJECTED
  PROCESSING
  COMPLETED
  CANCELLED
}
```

### Payments
```typescript
interface Payment {
  id: ID!
  orderId: ID!
  amount: Float!
  method: PaymentMethod!
  status: PaymentStatus!
  transactionId: String
  gatewayResponse: JSON
  createdAt: DateTime!
  updatedAt: DateTime!
  
  // Relationships
  order: Order!
}
```

### Promotions
```typescript
interface Promotion {
  id: ID!
  code: String!
  nameEn: String!
  nameAr: String!
  descriptionEn: String
  descriptionAr: String
  type: PromotionType!
  discountValue: Float!
  minimumAmount: Float
  usageLimit: Int
  usageCount: Int!
  isActive: Boolean!
  startsAt: DateTime!
  expiresAt: DateTime!
  
  // Relationships
  appliedPromotions: [AppliedPromotion!]!
}

interface AppliedPromotion {
  id: ID!
  promotionId: ID!
  orderId: ID
  cartId: ID
  discountAmount: Float!
  appliedAt: DateTime!
  
  // Relationships
  promotion: Promotion!
  order: Order
  cart: Cart
}

enum PromotionType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
}
```

## Validation Rules

### User Registration
- Email: required, valid email format, unique
- Name: required, min 2 chars, max 100 chars
- Password: required, min 8 chars, must contain letter and number

### Product Management
- Names: required for both languages
- Price: required, positive number
- Stock: required, non-negative integer
- SKU: unique when provided

### Cart Operations
- Quantity: required, positive integer, not exceed stock
- Product: must be active and in stock
- User: must be authenticated

### Order Placement
- Cart: must not be empty
- Address: required, valid address format
- Payment method: required, supported method
- Total: must match calculated total

### Return Requests
- Order: must be delivered, within return window
- Items: must be from the order, valid quantities
- Reason: required, valid reason code

## State Transitions

### Order Status Flow
```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓
CANCELLED  CANCELLED
```

### Payment Status Flow
```
PENDING → PROCESSING → COMPLETED
    ↓         ↓           ↓
 FAILED   FAILED    REFUNDED/PARTIALLY_REFUNDED
```

### Return Status Flow
```
PENDING → APPROVED → PROCESSING → COMPLETED
    ↓         ↓
REJECTED  CANCELLED
```

## GraphQL Schema Considerations

### Pagination
- Use cursor-based pagination for performance
- Default page size: 12 for products, 10 for orders
- Maximum page size: 50

### Authentication Context
- User context available in all authenticated resolvers
- Session validation on each GraphQL request
- Rate limiting per user and IP

### Caching Strategy
- Product catalog: Cache for 1 hour
- User cart: Cache for 5 minutes
- Order data: Cache for 30 minutes
- Static content: Cache for 24 hours

### Error Handling
- Standardized error codes and messages
- Bilingual error messages
- Detailed validation errors
- Security-conscious error responses