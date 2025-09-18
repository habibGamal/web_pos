/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A datetime string with format `Y-m-d H:i:s`, e.g. `2018-05-23 13:43:32`. */
  DateTime: { input: string; output: string; }
};

export type AddToCartInput = {
  /** Product variant ID to add */
  product_variant_id: Scalars['ID']['input'];
  /** Quantity to add */
  quantity: Scalars['Int']['input'];
};

export type AddToWishlistInput = {
  /** Product ID to add to wishlist */
  product_id: Scalars['ID']['input'];
};

export type Address = {
  __typename: 'Address';
  /** Address line 1 */
  address_line_1: Scalars['String']['output'];
  /** Address line 2 */
  address_line_2: Maybe<Scalars['String']['output']>;
  /** City */
  city: Scalars['String']['output'];
  /** Country */
  country: Scalars['String']['output'];
  /** Full name */
  full_name: Scalars['String']['output'];
  /** Phone number */
  phone: Scalars['String']['output'];
  /** Postal code */
  postal_code: Scalars['String']['output'];
  /** State/Province */
  state: Scalars['String']['output'];
};

export type AddressInput = {
  /** Address line 1 */
  address_line_1: Scalars['String']['input'];
  /** Address line 2 */
  address_line_2?: InputMaybe<Scalars['String']['input']>;
  /** City */
  city: Scalars['String']['input'];
  /** Country */
  country: Scalars['String']['input'];
  /** Full name */
  full_name: Scalars['String']['input'];
  /** Phone number */
  phone: Scalars['String']['input'];
  /** Postal code */
  postal_code: Scalars['String']['input'];
  /** State/Province */
  state: Scalars['String']['input'];
};

export type AuthPayload = {
  __typename: 'AuthPayload';
  /** Authentication token */
  access_token: Scalars['String']['output'];
  /** Token expiration in seconds */
  expires_in: Scalars['Int']['output'];
  /** Token type (Bearer) */
  token_type: Scalars['String']['output'];
  /** Authenticated user */
  user: User;
};

/** Brand model base type */
export type Brand = {
  __typename: 'Brand';
  /** Number of active products for this brand */
  active_products_count: Scalars['Int']['output'];
  /** Brand's child brands */
  children: Array<Brand>;
  /** When the brand was created. */
  created_at: Scalars['DateTime']['output'];
  /** Brand description in current locale */
  description: Maybe<Scalars['String']['output']>;
  /** Brand's display image with fallback logic */
  display_image: Maybe<Scalars['String']['output']>;
  /** Brand's display order */
  display_order: Scalars['Int']['output'];
  /** Whether the brand has any products */
  has_products: Scalars['Boolean']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Brand image. */
  image: Maybe<Scalars['String']['output']>;
  /** Brand's image URL with fallback */
  image_url: Maybe<Scalars['String']['output']>;
  /** Whether the brand is active */
  is_active: Scalars['Boolean']['output'];
  /** Brand name in current locale */
  name: Scalars['String']['output'];
  /** Brand name in Arabic. */
  name_ar: Scalars['String']['output'];
  /** Brand name in English. */
  name_en: Scalars['String']['output'];
  /** Brand's parent brand */
  parent: Maybe<Brand>;
  /** Brand's parent ID */
  parent_id: Maybe<Scalars['ID']['output']>;
  /** Brand's products */
  products: Array<Product>;
  /** Number of products for this brand */
  products_count: Scalars['Int']['output'];
  /** Brand slug for URL generation */
  slug: Scalars['String']['output'];
  /** When the brand was last updated. */
  updated_at: Scalars['DateTime']['output'];
  /** Brand's SEO-friendly URL */
  url: Scalars['String']['output'];
};

export type CancelOrderInput = {
  /** Order ID to cancel */
  order_id: Scalars['ID']['input'];
  /** Cancellation reason */
  reason?: InputMaybe<Scalars['String']['input']>;
};

export type Cart = {
  __typename: 'Cart';
  /** When the cart was created */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Whether the cart is empty */
  is_empty: Scalars['Boolean']['output'];
  /** Cart items */
  items: Array<CartItem>;
  /** Cart session ID for guest users */
  session_id: Maybe<Scalars['String']['output']>;
  /** Cart total items count */
  total_items: Scalars['Int']['output'];
  /** Cart total price */
  total_price: Scalars['Float']['output'];
  /** Cart total quantity */
  total_quantity: Scalars['Int']['output'];
  /** When the cart was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Cart owner (if authenticated) */
  user: Maybe<User>;
  /** User ID this cart belongs to */
  user_id: Scalars['ID']['output'];
};

export type CartItem = {
  __typename: 'CartItem';
  /** Cart this item belongs to */
  cart: Cart;
  /** Cart ID this item belongs to */
  cart_id: Scalars['ID']['output'];
  /** When the item was added to cart */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Whether this item is in stock */
  is_available: Scalars['Boolean']['output'];
  /** Product (through variant) */
  product: Product;
  /** Product variant ID */
  product_variant_id: Scalars['ID']['output'];
  /** Quantity of this item in cart */
  quantity: Scalars['Int']['output'];
  /** Total price for this line item */
  total_price: Scalars['Float']['output'];
  /** Price per unit at time of adding to cart */
  unit_price: Scalars['Float']['output'];
  /** When the item was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Product variant */
  variant: ProductVariant;
};

/** Category model base type */
export type Category = {
  __typename: 'Category';
  /** Number of active products in this category */
  active_products_count: Scalars['Int']['output'];
  /** Category's child categories */
  children: Array<Category>;
  /** When the category was created. */
  created_at: Scalars['DateTime']['output'];
  /** Category description in current locale */
  description: Maybe<Scalars['String']['output']>;
  /** Category's display image with fallback logic */
  display_image: Maybe<Scalars['String']['output']>;
  /** Category's display order */
  display_order: Scalars['Int']['output'];
  /** Whether the category has any products */
  has_products: Scalars['Boolean']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Category image. */
  image: Maybe<Scalars['String']['output']>;
  /** Category's image URL with fallback */
  image_url: Maybe<Scalars['String']['output']>;
  /** Whether the category is active */
  is_active: Scalars['Boolean']['output'];
  /** Category name in current locale */
  name: Scalars['String']['output'];
  /** Category name in Arabic. */
  name_ar: Scalars['String']['output'];
  /** Category name in English. */
  name_en: Scalars['String']['output'];
  /** Category's parent category */
  parent: Maybe<Category>;
  /** Category's parent ID */
  parent_id: Maybe<Scalars['ID']['output']>;
  /** Category's products */
  products: Array<Product>;
  /** Number of products in this category */
  products_count: Scalars['Int']['output'];
  /** Category slug for URL generation */
  slug: Scalars['String']['output'];
  /** When the category was last updated. */
  updated_at: Scalars['DateTime']['output'];
  /** Category's SEO-friendly URL */
  url: Scalars['String']['output'];
};

export type ChangePasswordInput = {
  /** Current password */
  current_password: Scalars['String']['input'];
  /** New password */
  password: Scalars['String']['input'];
  /** Password confirmation */
  password_confirmation: Scalars['String']['input'];
};

export type CreateOrderInput = {
  /** Billing address (optional, defaults to shipping) */
  billing_address?: InputMaybe<AddressInput>;
  /** Whether billing address same as shipping */
  billing_same_as_shipping?: InputMaybe<Scalars['Boolean']['input']>;
  /** Order notes */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Payment method */
  payment_method: PaymentMethod;
  /** Shipping address */
  shipping_address: AddressInput;
};

export type CreateReturnInput = {
  /** Items to return */
  items: Array<ReturnItemInput>;
  /** Order ID to return items from */
  order_id: Scalars['ID']['input'];
  /** Return reason */
  reason: ReturnReason;
};

export type EmailVerificationPayload = {
  __typename: 'EmailVerificationPayload';
  /** Success message */
  message: Scalars['String']['output'];
  /** Whether email was successfully verified */
  verified: Scalars['Boolean']['output'];
};

export type ForgotPasswordInput = {
  /** Callback URL for password reset (frontend URL) */
  callback_url?: InputMaybe<Scalars['String']['input']>;
  /** User's email address */
  email: Scalars['String']['input'];
};

export type LoginInput = {
  /** User's email address */
  email: Scalars['String']['input'];
  /** User's password */
  password: Scalars['String']['input'];
  /** Remember me flag */
  remember?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Mutation = {
  __typename: 'Mutation';
  /** Add product variant to cart */
  addToCart: CartItem;
  /** Add product to wishlist */
  addToWishlist: Wishlist;
  /** Cancel an order */
  cancelOrder: Order;
  /** Cancel return request */
  cancelReturn: ReturnOrder;
  /** Change password for authenticated user */
  changePassword: SuccessPayload;
  /** Clear all items from cart */
  clearCart: Scalars['Boolean']['output'];
  /** Create new order from cart */
  createOrder: Order;
  /** Create return request */
  createReturn: ReturnOrder;
  /** Delete user account */
  deleteAccount: SuccessPayload;
  /** Request password reset */
  forgotPassword: PasswordResetPayload;
  /** Login with email and password */
  login: AuthPayload;
  /** Logout the authenticated user */
  logout: SuccessPayload;
  /** Move item from wishlist to cart */
  moveWishlistToCart: CartItem;
  /** Refresh authentication token */
  refreshToken: AuthPayload;
  /** Register a new user account */
  register: AuthPayload;
  /** Remove item from cart */
  removeFromCart: Scalars['Boolean']['output'];
  /** Remove product from wishlist */
  removeFromWishlist: Scalars['Boolean']['output'];
  /** Resend email verification */
  resendVerification: SuccessPayload;
  /** Reset password with token */
  resetPassword: SuccessPayload;
  /** Login with social provider */
  socialLogin: AuthPayload;
  /** Update cart item quantity */
  updateCartItem: Maybe<CartItem>;
  /** Update user profile */
  updateProfile: User;
  /** Verify email address */
  verifyEmail: EmailVerificationPayload;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationAddToWishlistArgs = {
  input: AddToWishlistInput;
};


export type MutationCancelOrderArgs = {
  input: CancelOrderInput;
};


export type MutationCancelReturnArgs = {
  return_id: Scalars['ID']['input'];
};


export type MutationChangePasswordArgs = {
  input: ChangePasswordInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateReturnArgs = {
  input: CreateReturnInput;
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMoveWishlistToCartArgs = {
  product_id: Scalars['ID']['input'];
  product_variant_id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationRegisterArgs = {
  input: RegisterInput;
};


export type MutationRemoveFromCartArgs = {
  input: RemoveFromCartInput;
};


export type MutationRemoveFromWishlistArgs = {
  input: RemoveFromWishlistInput;
};


export type MutationResendVerificationArgs = {
  input: ResendVerificationInput;
};


export type MutationResetPasswordArgs = {
  input: ResetPasswordInput;
};


export type MutationSocialLoginArgs = {
  input: SocialLoginInput;
};


export type MutationUpdateCartItemArgs = {
  input: UpdateCartItemInput;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationVerifyEmailArgs = {
  input: VerifyEmailInput;
};

export type Order = {
  __typename: 'Order';
  /** Billing address */
  billing_address: Address;
  /** Whether the order can be cancelled */
  can_be_cancelled: Scalars['Boolean']['output'];
  /** Whether the order can be returned */
  can_be_returned: Scalars['Boolean']['output'];
  /** When the order was placed */
  created_at: Scalars['DateTime']['output'];
  /** Currency code */
  currency: Scalars['String']['output'];
  /** Actual delivery date */
  delivered_at: Maybe<Scalars['DateTime']['output']>;
  /** Discount amount */
  discount_amount: Scalars['Float']['output'];
  /** Estimated delivery date */
  estimated_delivery_date: Maybe<Scalars['DateTime']['output']>;
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Order items */
  items: Array<OrderItem>;
  /** Order notes */
  notes: Maybe<Scalars['String']['output']>;
  /** Order number (user-facing) */
  order_number: Scalars['String']['output'];
  /** Payment status */
  payment_status: PaymentStatus;
  /** Payment transactions */
  payments: Array<Payment>;
  /** Returns for this order */
  returns: Array<ReturnOrder>;
  /** Shipping address */
  shipping_address: Address;
  /** Shipping cost */
  shipping_cost: Scalars['Float']['output'];
  /** Order status */
  status: OrderStatus;
  /** Order status history */
  statusHistory: Array<OrderStatusHistory>;
  /** Subtotal before taxes and discounts */
  subtotal: Scalars['Float']['output'];
  /** Tax amount */
  tax_amount: Scalars['Float']['output'];
  /** Total order amount */
  total_amount: Scalars['Float']['output'];
  /** Order tracking information */
  tracking_number: Maybe<Scalars['String']['output']>;
  /** When the order was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Order owner */
  user: User;
  /** User ID this order belongs to */
  user_id: Scalars['ID']['output'];
};

/** Allows ordering a list of records. */
export type OrderByClause = {
  /** The column that is used for ordering. */
  column: Scalars['String']['input'];
  /** The direction that is used for ordering. */
  order: SortOrder;
};

/** Aggregate functions when ordering by a relation without specifying a column. */
export type OrderByRelationAggregateFunction =
  /** Amount of items. */
  | 'COUNT';

/** Aggregate functions when ordering by a relation that may specify a column. */
export type OrderByRelationWithColumnAggregateFunction =
  /** Average. */
  | 'AVG'
  /** Amount of items. */
  | 'COUNT'
  /** Maximum. */
  | 'MAX'
  /** Minimum. */
  | 'MIN'
  /** Sum. */
  | 'SUM';

export type OrderItem = {
  __typename: 'OrderItem';
  /** When the item was added to order */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Order this item belongs to */
  order: Order;
  /** Order ID this item belongs to */
  order_id: Scalars['ID']['output'];
  /** Product this order item belongs to */
  product: Product;
  /** Quantity ordered */
  quantity: Scalars['Int']['output'];
  /** Return items for this order item */
  returnItems: Array<ReturnItem>;
  /** Quantity that can still be returned */
  returnable_quantity: Scalars['Int']['output'];
  /** Total price for this line item */
  total_price: Scalars['Float']['output'];
  /** Unit price at time of order */
  unit_price: Scalars['Float']['output'];
  /** When the item was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Product variant (current state) */
  variant: Maybe<ProductVariant>;
  /** Product variant details at time of order */
  variant_details: Maybe<Scalars['String']['output']>;
  /** Product variant ID */
  variant_id: Scalars['ID']['output'];
};

/** A paginated list of Order items. */
export type OrderPaginator = {
  __typename: 'OrderPaginator';
  /** A list of Order items. */
  data: Array<Order>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type OrderStatus =
  /** Order has been cancelled */
  | 'CANCELLED'
  /** Order confirmed and being prepared */
  | 'CONFIRMED'
  /** Order has been delivered */
  | 'DELIVERED'
  /** Order placed but not yet confirmed */
  | 'PENDING'
  /** Order is being processed */
  | 'PROCESSING'
  /** Order has been refunded */
  | 'REFUNDED'
  /** Order has been shipped */
  | 'SHIPPED';

export type OrderStatusHistory = {
  __typename: 'OrderStatusHistory';
  /** User who made the change */
  changedBy: Maybe<User>;
  /** User who made the change (admin) */
  changed_by_user_id: Maybe<Scalars['ID']['output']>;
  /** When the status was changed */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** New status */
  new_status: OrderStatus;
  /** Status change reason/notes */
  notes: Maybe<Scalars['String']['output']>;
  /** Order this history belongs to */
  order: Order;
  /** Order ID */
  order_id: Scalars['ID']['output'];
  /** Previous status */
  previous_status: Maybe<OrderStatus>;
};

/** Information about pagination using a fully featured paginator. */
export type PaginatorInfo = {
  __typename: 'PaginatorInfo';
  /** Number of items in the current page. */
  count: Scalars['Int']['output'];
  /** Index of the current page. */
  currentPage: Scalars['Int']['output'];
  /** Index of the first item in the current page. */
  firstItem: Maybe<Scalars['Int']['output']>;
  /** Are there more pages after this one? */
  hasMorePages: Scalars['Boolean']['output'];
  /** Index of the last item in the current page. */
  lastItem: Maybe<Scalars['Int']['output']>;
  /** Index of the last available page. */
  lastPage: Scalars['Int']['output'];
  /** Number of items per page. */
  perPage: Scalars['Int']['output'];
  /** Number of total available items. */
  total: Scalars['Int']['output'];
};

export type PasswordResetPayload = {
  __typename: 'PasswordResetPayload';
  /** Success message */
  message: Scalars['String']['output'];
  /** Reset token (only for testing environments) */
  reset_token: Maybe<Scalars['String']['output']>;
};

export type Payment = {
  __typename: 'Payment';
  /** Payment amount */
  amount: Scalars['Float']['output'];
  /** When the payment was initiated */
  created_at: Scalars['DateTime']['output'];
  /** Payment currency */
  currency: Scalars['String']['output'];
  /** Payment gateway (Kashier, etc.) */
  gateway: Scalars['String']['output'];
  /** Payment gateway response */
  gateway_response: Maybe<Scalars['String']['output']>;
  /** Payment gateway transaction ID */
  gateway_transaction_id: Maybe<Scalars['String']['output']>;
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Order this payment belongs to */
  order: Order;
  /** Order ID this payment belongs to */
  order_id: Scalars['ID']['output'];
  /** Payment method */
  payment_method: PaymentMethod;
  /** Payment status */
  status: PaymentStatus;
  /** When the payment was last updated */
  updated_at: Scalars['DateTime']['output'];
};

export type PaymentMethod =
  /** Bank Transfer */
  | 'BANK_TRANSFER'
  /** Credit/Debit Card */
  | 'CARD'
  /** Cash on Delivery */
  | 'COD'
  /** Digital Wallet */
  | 'WALLET';

export type PaymentStatus =
  /** Payment was cancelled */
  | 'CANCELLED'
  /** Payment failed */
  | 'FAILED'
  /** Payment was successful */
  | 'PAID'
  /** Partial refund processed */
  | 'PARTIALLY_REFUNDED'
  /** Payment is pending */
  | 'PENDING'
  /** Payment was refunded */
  | 'REFUNDED';

/** Product model base type */
export type Product = {
  __typename: 'Product';
  /** Product brand. */
  brand: Brand;
  /** Product category. */
  category: Category;
  /** Product's cost price (admin only) */
  cost_price: Maybe<Scalars['Float']['output']>;
  /** When the product was created. */
  created_at: Scalars['DateTime']['output'];
  /** Product's default variant */
  default_variant: Maybe<ProductVariant>;
  /** Product's description in current locale */
  description: Maybe<Scalars['String']['output']>;
  /** Product's discount percentage (if on sale) */
  discount_percentage: Maybe<Scalars['Float']['output']>;
  /** Product's effective price (considers sale price) */
  effective_price: Scalars['Float']['output'];
  /** Product's featured image URL */
  featured_image: Maybe<Scalars['String']['output']>;
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Product's image gallery URLs */
  images: Array<Scalars['String']['output']>;
  /** Whether the product is active. */
  is_active: Scalars['Boolean']['output'];
  /** Whether the product is featured */
  is_featured: Scalars['Boolean']['output'];
  /** Whether the product is in stock */
  is_in_stock: Scalars['Boolean']['output'];
  /** Whether the user has this product in wishlist */
  is_in_wishlist: Maybe<Scalars['Boolean']['output']>;
  /** Whether the product is on sale */
  is_on_sale: Scalars['Boolean']['output'];
  /** Product's name in current locale */
  name: Scalars['String']['output'];
  /** Product name in Arabic. */
  name_ar: Scalars['String']['output'];
  /** Product name in English. */
  name_en: Scalars['String']['output'];
  /** Product price. */
  price: Scalars['Float']['output'];
  /** Product's sale price (if on sale) */
  sale_price: Maybe<Scalars['Float']['output']>;
  /** Product's sections */
  sections: Array<Section>;
  /** Product slug for URL generation. */
  slug: Scalars['String']['output'];
  /** Product's total stock across all variants */
  stock: Scalars['Int']['output'];
  /** When the product was last updated. */
  updated_at: Scalars['DateTime']['output'];
  /** Product's SEO-friendly URL */
  url: Scalars['String']['output'];
  /** Product's variants */
  variants: Array<ProductVariant>;
};

export type ProductOrderByClause = {
  /** Field to order by */
  column: ProductOrderByColumn;
  /** Sort order direction */
  order: SortOrder;
};

export type ProductOrderByColumn =
  | 'CREATED_AT'
  | 'ID'
  | 'IS_FEATURED'
  | 'NAME_AR'
  | 'NAME_EN'
  | 'PRICE'
  | 'SALE_PRICE'
  | 'UPDATED_AT';

/** A paginated list of Product items. */
export type ProductPaginator = {
  __typename: 'ProductPaginator';
  /** A list of Product items. */
  data: Array<Product>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type ProductSearchInput = {
  /** Filter by brand ID */
  brand_id?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by category ID */
  category_id?: InputMaybe<Scalars['ID']['input']>;
  /** Filter by in stock products only */
  in_stock_only?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by featured products only */
  is_featured?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter by products on sale only */
  is_on_sale?: InputMaybe<Scalars['Boolean']['input']>;
  /** Maximum price filter */
  max_price?: InputMaybe<Scalars['Float']['input']>;
  /** Minimum price filter */
  min_price?: InputMaybe<Scalars['Float']['input']>;
  /** Search query string */
  query?: InputMaybe<Scalars['String']['input']>;
};

export type ProductVariant = {
  __typename: 'ProductVariant';
  /** Additional variant attributes (JSON string) */
  additional_attributes: Maybe<Scalars['String']['output']>;
  /** Variant attributes combined (computed) */
  attributes: Scalars['String']['output'];
  /** Variant capacity attribute */
  capacity: Maybe<Scalars['String']['output']>;
  /** Variant color attribute */
  color: Maybe<Scalars['String']['output']>;
  /** When the variant was created */
  created_at: Scalars['DateTime']['output'];
  /** Variant's effective price (with fallback) */
  effective_price: Scalars['Float']['output'];
  /** Variant's featured image URL */
  featured_image: Maybe<Scalars['String']['output']>;
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Variant images array */
  images: Array<Scalars['String']['output']>;
  /** Whether the variant is active */
  is_active: Scalars['Boolean']['output'];
  /** Whether this is the default variant */
  is_default: Scalars['Boolean']['output'];
  /** Whether the variant is in stock */
  is_in_stock: Scalars['Boolean']['output'];
  /** Variant display name based on attributes */
  name: Scalars['String']['output'];
  /** Variant price (nullable - uses product price if not set) */
  price: Maybe<Scalars['Float']['output']>;
  /** Parent product */
  product: Product;
  /** Product ID this variant belongs to */
  product_id: Scalars['ID']['output'];
  /** Variant stock quantity */
  quantity: Scalars['Int']['output'];
  /** Variant sale price (nullable) */
  sale_price: Maybe<Scalars['Float']['output']>;
  /** Variant size attribute */
  size: Maybe<Scalars['String']['output']>;
  /** Variant SKU */
  sku: Scalars['String']['output'];
  /** When the variant was last updated */
  updated_at: Scalars['DateTime']['output'];
};

/** Indicates what fields are available at the top level of a query operation. */
export type Query = {
  __typename: 'Query';
  /** Get a single brand by ID */
  brand: Maybe<Brand>;
  /** Get a single brand by slug */
  brandBySlug: Maybe<Brand>;
  /** Get all brands in hierarchical structure */
  brands: Array<Brand>;
  /** Get current user's cart */
  cart: Maybe<Cart>;
  /** Get all categories in hierarchical structure */
  categories: Array<Category>;
  /** Get a single category by ID */
  category: Maybe<Category>;
  /** Get a single category by slug */
  categoryBySlug: Maybe<Category>;
  /** Check if email is available for registration */
  checkEmailAvailability: Scalars['Boolean']['output'];
  /** Get current authenticated user */
  me: Maybe<User>;
  /** Get single order by ID */
  order: Maybe<Order>;
  /** Get user's orders with pagination */
  orders: OrderPaginator;
  /** Get a single product by ID */
  product: Maybe<Product>;
  /** Get a single product by slug */
  productBySlug: Maybe<Product>;
  /** Get all products with filtering and pagination */
  products: ProductPaginator;
  /** Get single return by ID */
  returnOrder: Maybe<ReturnOrder>;
  /** Get user's returns with pagination */
  returns: ReturnOrderPaginator;
  /** Search products with text-based search */
  searchProducts: ProductPaginator;
  /** Get search suggestions based on query */
  searchSuggestions: Array<Scalars['String']['output']>;
  /** Get a single section by ID */
  section: Maybe<Section>;
  /** Get all sections */
  sections: Array<Section>;
  /** Find a single user by an identifying attribute. */
  user: Maybe<User>;
  /** List multiple users. */
  users: UserPaginator;
  /** Get current user's wishlist items */
  wishlist: Array<Wishlist>;
  /** Get wishlist items count for current user */
  wishlistCount: Scalars['Int']['output'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryBrandArgs = {
  id: Scalars['ID']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryBrandBySlugArgs = {
  slug: Scalars['String']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryBrandsArgs = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryCategoriesArgs = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryCategoryBySlugArgs = {
  slug: Scalars['String']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryCheckEmailAvailabilityArgs = {
  email: Scalars['String']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryOrdersArgs = {
  date_from?: InputMaybe<Scalars['DateTime']['input']>;
  date_to?: InputMaybe<Scalars['DateTime']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<OrderStatus>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryProductBySlugArgs = {
  slug: Scalars['String']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryProductsArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<ProductOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<ProductSearchInput>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryReturnOrderArgs = {
  id: Scalars['ID']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryReturnsArgs = {
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ReturnStatus>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QuerySearchProductsArgs = {
  filters?: InputMaybe<ProductSearchInput>;
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<ProductOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QuerySearchSuggestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QuerySectionArgs = {
  id: Scalars['ID']['input'];
};


/** Indicates what fields are available at the top level of a query operation. */
export type QuerySectionsArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Indicates what fields are available at the top level of a query operation. */
export type QueryUsersArgs = {
  first?: Scalars['Int']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type RegisterInput = {
  /** User's email address */
  email: Scalars['String']['input'];
  /** User's preferred language */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** User's full name */
  name: Scalars['String']['input'];
  /** User's password */
  password: Scalars['String']['input'];
  /** Password confirmation */
  password_confirmation: Scalars['String']['input'];
  /** User's phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type RemoveFromCartInput = {
  /** Cart item ID to remove */
  cart_item_id: Scalars['ID']['input'];
};

export type RemoveFromWishlistInput = {
  /** Product ID to remove from wishlist */
  product_id: Scalars['ID']['input'];
};

export type ResendVerificationInput = {
  /** Callback URL for email verification (frontend URL) */
  callback_url?: InputMaybe<Scalars['String']['input']>;
  /** User's email address */
  email: Scalars['String']['input'];
};

export type ResetPasswordInput = {
  /** User's email address */
  email: Scalars['String']['input'];
  /** New password */
  password: Scalars['String']['input'];
  /** Password confirmation */
  password_confirmation: Scalars['String']['input'];
  /** Password reset token */
  token: Scalars['String']['input'];
};

export type ReturnItem = {
  __typename: 'ReturnItem';
  /** When the item was added to return */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Original order item */
  orderItem: OrderItem;
  /** Original order item ID */
  order_item_id: Scalars['ID']['output'];
  /** Quantity being returned */
  quantity: Scalars['Int']['output'];
  /** Return order this item belongs to */
  returnOrder: ReturnOrder;
  /** Return order ID */
  return_order_id: Scalars['ID']['output'];
  /** Total price for this return item */
  subtotal: Scalars['Float']['output'];
  /** Unit price at time of return */
  unit_price: Scalars['Float']['output'];
};

export type ReturnItemInput = {
  /** Order item ID */
  order_item_id: Scalars['ID']['input'];
  /** Quantity to return */
  quantity: Scalars['Int']['input'];
};

export type ReturnOrder = {
  __typename: 'ReturnOrder';
  /** When the return was approved */
  approved_at: Maybe<Scalars['DateTime']['output']>;
  /** When the return was requested */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Additional return notes */
  notes: Maybe<Scalars['String']['output']>;
  /** Original order */
  order: Order;
  /** Original order ID */
  order_id: Scalars['ID']['output'];
  /** Return reason */
  reason: ReturnReason;
  /** Refund amount */
  refund_amount: Scalars['Float']['output'];
  /** When the refund was processed */
  refunded_at: Maybe<Scalars['DateTime']['output']>;
  /** Return items */
  returnItems: Array<ReturnItem>;
  /** Return number (user-facing) */
  return_number: Scalars['String']['output'];
  /** Return status */
  status: ReturnStatus;
  /** Return status history */
  statusHistory: Array<ReturnStatusHistory>;
  /** When the return was last updated */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of ReturnOrder items. */
export type ReturnOrderPaginator = {
  __typename: 'ReturnOrderPaginator';
  /** A list of ReturnOrder items. */
  data: Array<ReturnOrder>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type ReturnReason =
  /** Changed mind */
  | 'CHANGED_MIND'
  /** Item damaged during shipping */
  | 'DAMAGED'
  /** Product was defective */
  | 'DEFECTIVE'
  /** Item not as described */
  | 'NOT_AS_DESCRIBED'
  /** Other reason */
  | 'OTHER'
  /** Size/fit issues */
  | 'SIZE_FIT'
  /** Wrong item received */
  | 'WRONG_ITEM';

export type ReturnStatus =
  /** Return approved by admin */
  | 'APPROVED'
  /** Return cancelled */
  | 'CANCELLED'
  /** Items received for return */
  | 'RECEIVED'
  /** Return processed and refund issued */
  | 'REFUNDED'
  /** Return rejected by admin */
  | 'REJECTED'
  /** Return requested by customer */
  | 'REQUESTED';

export type ReturnStatusHistory = {
  __typename: 'ReturnStatusHistory';
  /** User who made the change */
  changedBy: Maybe<User>;
  /** User who made the change */
  changed_by_user_id: Maybe<Scalars['ID']['output']>;
  /** When the status was changed */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** New status */
  new_status: ReturnStatus;
  /** Status change notes */
  notes: Maybe<Scalars['String']['output']>;
  /** Previous status */
  previous_status: Maybe<ReturnStatus>;
  /** Return order this history belongs to */
  returnOrder: ReturnOrder;
  /** Return order ID */
  return_order_id: Scalars['ID']['output'];
};

export type Section = {
  __typename: 'Section';
  /** Whether the section is active */
  active: Scalars['Boolean']['output'];
  /** Number of active products in this section */
  active_products_count: Scalars['Int']['output'];
  /** When the section was created */
  created_at: Scalars['DateTime']['output'];
  /** Whether the section has any products */
  has_products: Scalars['Boolean']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Section's products */
  products: Array<Product>;
  /** Number of products in this section */
  products_count: Scalars['Int']['output'];
  /** Section type (REAL, RECOMMENDATION, etc.) */
  section_type: SectionType;
  /** Section's sort order */
  sort_order: Scalars['Int']['output'];
  /** Section title in current locale */
  title: Scalars['String']['output'];
  /** Section title in Arabic */
  title_ar: Scalars['String']['output'];
  /** Section title in English */
  title_en: Scalars['String']['output'];
  /** When the section was last updated */
  updated_at: Scalars['DateTime']['output'];
};

export type SectionType =
  /** New arrivals section */
  | 'NEW_ARRIVALS'
  /** Real section with manually selected products */
  | 'REAL'
  /** Recommendation section with algorithmic products */
  | 'RECOMMENDATION'
  /** Trending products section */
  | 'TRENDING';

export type SocialLoginInput = {
  /** Provider access token */
  access_token: Scalars['String']['input'];
  /** User's preferred language */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** Social provider (google, facebook, apple) */
  provider: Scalars['String']['input'];
  /** Provider user ID (optional, will be fetched if not provided) */
  provider_id?: InputMaybe<Scalars['String']['input']>;
};

export type SocialProvider = {
  __typename: 'SocialProvider';
  /** Provider name (google, facebook, apple) */
  provider: Scalars['String']['output'];
  /** Provider user ID */
  provider_id: Scalars['String']['output'];
};

/** Directions for ordering a list of records. */
export type SortOrder =
  /** Sort records in ascending order. */
  | 'ASC'
  /** Sort records in descending order. */
  | 'DESC';

export type SuccessPayload = {
  __typename: 'SuccessPayload';
  /** Success message */
  message: Scalars['String']['output'];
  /** Operation success status */
  success: Scalars['Boolean']['output'];
};

/** Specify if you want to include or exclude trashed results from a query. */
export type Trashed =
  /** Only return trashed results. */
  | 'ONLY'
  /** Return both trashed and non-trashed results. */
  | 'WITH'
  /** Only return non-trashed results. */
  | 'WITHOUT';

export type UpdateCartItemInput = {
  /** Cart item ID to update */
  cart_item_id: Scalars['ID']['input'];
  /** New quantity (0 to remove item) */
  quantity: Scalars['Int']['input'];
};

export type UpdateProfileInput = {
  /** User's profile image */
  avatar?: InputMaybe<Scalars['String']['input']>;
  /** User's preferred language */
  locale?: InputMaybe<Scalars['String']['input']>;
  /** User's full name */
  name?: InputMaybe<Scalars['String']['input']>;
  /** User's phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
};

/** Account of a person who uses this application. */
export type User = {
  __typename: 'User';
  /** User's profile image URL with fallback to default avatar */
  avatar: Maybe<Scalars['String']['output']>;
  /** Whether the user can access admin panel */
  can_access_admin: Scalars['Boolean']['output'];
  /** When the account was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique email address (privacy controlled). */
  email: Maybe<Scalars['String']['output']>;
  /** Whether the user has completed email verification */
  email_verified: Scalars['Boolean']['output'];
  /** When the email was verified. */
  email_verified_at: Maybe<Scalars['DateTime']['output']>;
  /** User's Facebook ID (only visible to self) */
  facebook_id: Maybe<Scalars['String']['output']>;
  /** User's full name (alias for name field) */
  full_name: Scalars['String']['output'];
  /** User's Google ID (only visible to self) */
  google_id: Maybe<Scalars['String']['output']>;
  /** Whether the user has any social login accounts */
  has_social_accounts: Scalars['Boolean']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** User's initials for avatar generation */
  initials: Scalars['String']['output'];
  /** Whether the user is an admin */
  is_admin: Scalars['Boolean']['output'];
  /** Whether the user has completed email verification (alias) */
  is_email_verified: Scalars['Boolean']['output'];
  /** User's linked social providers (only visible to self) */
  linked_providers: Array<SocialProvider>;
  /** User's preferred language/locale */
  locale: Scalars['String']['output'];
  /** Non-unique name. */
  name: Scalars['String']['output'];
  /** User's phone number */
  phone: Maybe<Scalars['String']['output']>;
  /** When the account was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** A paginated list of User items. */
export type UserPaginator = {
  __typename: 'UserPaginator';
  /** A list of User items. */
  data: Array<User>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

export type VerifyEmailInput = {
  /** User's email address */
  email: Scalars['String']['input'];
  /** Verification token */
  token: Scalars['String']['input'];
};

export type Wishlist = {
  __typename: 'Wishlist';
  /** When the item was added to wishlist */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Product in wishlist */
  product: Product;
  /** Product ID in wishlist */
  product_id: Scalars['ID']['output'];
  /** User who owns this wishlist */
  user: User;
  /** User ID this wishlist belongs to */
  user_id: Scalars['ID']['output'];
};

export type UserFieldsFragment = { __typename: 'User', id: string, name: string, email: string | null, email_verified: boolean, phone: string | null, locale: string, is_admin: boolean, avatar: string | null, full_name: string, initials: string, has_social_accounts: boolean, linked_providers: Array<{ __typename: 'SocialProvider', provider: string, provider_id: string }> } & { ' $fragmentName'?: 'UserFieldsFragment' };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { me: (
    { __typename: 'User' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ) | null };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { login: { __typename: 'AuthPayload', access_token: string, token_type: string, expires_in: number, user: (
      { __typename: 'User' }
      & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
    ) } };

export type RegisterMutationVariables = Exact<{
  input: RegisterInput;
}>;


export type RegisterMutation = { register: { __typename: 'AuthPayload', access_token: string, token_type: string, expires_in: number, user: (
      { __typename: 'User' }
      & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
    ) } };

export type SocialLoginMutationVariables = Exact<{
  input: SocialLoginInput;
}>;


export type SocialLoginMutation = { socialLogin: { __typename: 'AuthPayload', access_token: string, token_type: string, expires_in: number, user: (
      { __typename: 'User' }
      & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
    ) } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { logout: { __typename: 'SuccessPayload', success: boolean, message: string } };

export type ForgotPasswordMutationVariables = Exact<{
  input: ForgotPasswordInput;
}>;


export type ForgotPasswordMutation = { forgotPassword: { __typename: 'PasswordResetPayload', message: string } };

export type ResetPasswordMutationVariables = Exact<{
  input: ResetPasswordInput;
}>;


export type ResetPasswordMutation = { resetPassword: { __typename: 'SuccessPayload', success: boolean, message: string } };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { changePassword: { __typename: 'SuccessPayload', success: boolean, message: string } };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileInput;
}>;


export type UpdateProfileMutation = { updateProfile: (
    { __typename: 'User' }
    & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
  ) };

export type VerifyEmailMutationVariables = Exact<{
  input: VerifyEmailInput;
}>;


export type VerifyEmailMutation = { verifyEmail: { __typename: 'EmailVerificationPayload', message: string, verified: boolean } };

export type ResendVerificationMutationVariables = Exact<{
  input: ResendVerificationInput;
}>;


export type ResendVerificationMutation = { resendVerification: { __typename: 'SuccessPayload', success: boolean, message: string } };

export type DeleteAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteAccountMutation = { deleteAccount: { __typename: 'SuccessPayload', success: boolean, message: string } };

export type RefreshTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshTokenMutation = { refreshToken: { __typename: 'AuthPayload', access_token: string, token_type: string, expires_in: number, user: (
      { __typename: 'User' }
      & { ' $fragmentRefs'?: { 'UserFieldsFragment': UserFieldsFragment } }
    ) } };

export type CheckEmailAvailabilityQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type CheckEmailAvailabilityQuery = { checkEmailAvailability: boolean };

export type BrandsQueryVariables = Exact<{
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type BrandsQuery = { brands: Array<{ __typename: 'Brand', id: string, name: string, slug: string, description: string | null, display_image: string | null, display_order: number, is_active: boolean, url: string, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Brand', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Brand', id: string, name: string, slug: string, active_products_count: number }> }> };

export type BrandByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type BrandByIdQuery = { brand: { __typename: 'Brand', id: string, name: string, slug: string, description: string | null, display_image: string | null, display_order: number, is_active: boolean, url: string, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Brand', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Brand', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type BrandBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type BrandBySlugQuery = { brandBySlug: { __typename: 'Brand', id: string, name: string, slug: string, description: string | null, display_image: string | null, display_order: number, is_active: boolean, url: string, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Brand', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Brand', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type GetCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartQuery = { cart: { __typename: 'Cart', id: string, user_id: string, session_id: string | null, total_price: number, total_items: number, total_quantity: number, is_empty: boolean, created_at: string, updated_at: string, items: Array<{ __typename: 'CartItem', id: string, cart_id: string, product_variant_id: string, quantity: number, unit_price: number, total_price: number, is_available: boolean, created_at: string, updated_at: string, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, sale_price: number | null, quantity: number, is_active: boolean, is_default: boolean, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null } }, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } }> } | null };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { addToCart: { __typename: 'CartItem', id: string, cart_id: string, product_variant_id: string, quantity: number, unit_price: number, total_price: number, is_available: boolean, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, sale_price: number | null, quantity: number, is_active: boolean, is_default: boolean, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null } }, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } } };

export type UpdateCartItemMutationVariables = Exact<{
  input: UpdateCartItemInput;
}>;


export type UpdateCartItemMutation = { updateCartItem: { __typename: 'CartItem', id: string, cart_id: string, product_variant_id: string, quantity: number, unit_price: number, total_price: number, is_available: boolean, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, sale_price: number | null, quantity: number, is_active: boolean, is_default: boolean }, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } } | null };

export type RemoveFromCartMutationVariables = Exact<{
  input: RemoveFromCartInput;
}>;


export type RemoveFromCartMutation = { removeFromCart: boolean };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { clearCart: boolean };

export type CategoriesQueryVariables = Exact<{
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type CategoriesQuery = { categories: Array<{ __typename: 'Category', id: string, name: string, slug: string, description: string | null, display_image: string | null, display_order: number, is_active: boolean, url: string, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Category', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Category', id: string, name: string, slug: string, active_products_count: number }> }> };

export type CategoryByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CategoryByIdQuery = { category: { __typename: 'Category', id: string, name: string, slug: string, description: string | null, display_image: string | null, display_order: number, is_active: boolean, url: string, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Category', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Category', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type CategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type CategoryBySlugQuery = { categoryBySlug: { __typename: 'Category', id: string, name: string, slug: string, description: string | null, display_image: string | null, display_order: number, is_active: boolean, url: string, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Category', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Category', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type NavigationDataQueryVariables = Exact<{ [key: string]: never; }>;


export type NavigationDataQuery = { brands: Array<{ __typename: 'Brand', id: string, name: string, slug: string, display_image: string | null, display_order: number, is_active: boolean, active_products_count: number }>, categories: Array<{ __typename: 'Category', id: string, name: string, slug: string, display_image: string | null, display_order: number, is_active: boolean, active_products_count: number }> };

export type ProductsQueryVariables = Exact<{
  search?: InputMaybe<ProductSearchInput>;
  orderBy?: InputMaybe<Array<ProductOrderByClause> | ProductOrderByClause>;
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductsQuery = { products: { __typename: 'ProductPaginator', data: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, description: string | null, category: { __typename: 'Category', id: string, name: string }, brand: { __typename: 'Brand', id: string, name: string }, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, effective_price: number, quantity: number, is_active: boolean, is_default: boolean } | null }>, paginatorInfo: { __typename: 'PaginatorInfo', count: number, currentPage: number, firstItem: number | null, hasMorePages: boolean, lastItem: number | null, lastPage: number, perPage: number, total: number } } };

export type ProductByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProductByIdQuery = { product: { __typename: 'Product', id: string, name: string, slug: string, description: string | null, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, images: Array<string>, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string }, variants: Array<{ __typename: 'ProductVariant', id: string, name: string, price: number | null, effective_price: number, is_in_stock: boolean, quantity: number, attributes: string }>, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, effective_price: number, quantity: number, is_active: boolean, is_default: boolean } | null } | null };

export type ProductBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProductBySlugQuery = { productBySlug: { __typename: 'Product', id: string, name: string, slug: string, description: string | null, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, images: Array<string>, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string }, variants: Array<{ __typename: 'ProductVariant', id: string, name: string, price: number | null, effective_price: number, is_in_stock: boolean, quantity: number, attributes: string }>, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, effective_price: number, quantity: number, is_active: boolean, is_default: boolean } | null } | null };

export type SectionsQueryVariables = Exact<{
  active?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SectionsQuery = { sections: Array<{ __typename: 'Section', id: string, title: string, title_en: string, title_ar: string, active: boolean, sort_order: number, section_type: SectionType, created_at: string, updated_at: string, products_count: number, active_products_count: number, has_products: boolean, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, description: string | null, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string } }> }> };

export type SectionByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SectionByIdQuery = { section: { __typename: 'Section', id: string, title: string, title_en: string, title_ar: string, active: boolean, sort_order: number, section_type: SectionType, created_at: string, updated_at: string, products_count: number, active_products_count: number, has_products: boolean, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, description: string | null, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string } }> } | null };

export type GetWishlistQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWishlistQuery = { wishlist: Array<{ __typename: 'Wishlist', id: string, user_id: string, product_id: string, created_at: string, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean, category: { __typename: 'Category', id: string, name: string }, brand: { __typename: 'Brand', id: string, name: string }, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, sale_price: number | null, quantity: number, is_active: boolean, is_default: boolean } | null } }> };

export type GetWishlistCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetWishlistCountQuery = { wishlistCount: number };

export type AddToWishlistMutationVariables = Exact<{
  input: AddToWishlistInput;
}>;


export type AddToWishlistMutation = { addToWishlist: { __typename: 'Wishlist', id: string, user_id: string, product_id: string, created_at: string, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean, category: { __typename: 'Category', id: string, name: string }, brand: { __typename: 'Brand', id: string, name: string }, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, sale_price: number | null, quantity: number, is_active: boolean, is_default: boolean } | null } } };

export type RemoveFromWishlistMutationVariables = Exact<{
  input: RemoveFromWishlistInput;
}>;


export type RemoveFromWishlistMutation = { removeFromWishlist: boolean };

export type MoveWishlistToCartMutationVariables = Exact<{
  product_id: Scalars['ID']['input'];
  product_variant_id: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
}>;


export type MoveWishlistToCartMutation = { moveWishlistToCart: { __typename: 'CartItem', id: string, cart_id: string, product_variant_id: string, quantity: number, unit_price: number, total_price: number, is_available: boolean, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, sale_price: number | null, quantity: number, is_active: boolean, is_default: boolean }, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } } };

export const UserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const SocialLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SocialLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SocialLoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"socialLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<SocialLoginMutation, SocialLoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ForgotPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"verified"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResendVerificationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResendVerificationMutation, ResendVerificationMutationVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"is_admin"}},{"kind":"Field","name":{"kind":"Name","value":"avatar"}},{"kind":"Field","name":{"kind":"Name","value":"full_name"}},{"kind":"Field","name":{"kind":"Name","value":"initials"}},{"kind":"Field","name":{"kind":"Name","value":"has_social_accounts"}},{"kind":"Field","name":{"kind":"Name","value":"linked_providers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provider"}},{"kind":"Field","name":{"kind":"Name","value":"provider_id"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const CheckEmailAvailabilityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckEmailAvailability"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkEmailAvailability"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<CheckEmailAvailabilityQuery, CheckEmailAvailabilityQueryVariables>;
export const BrandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Brands"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}}]}}]}}]} as unknown as DocumentNode<BrandsQuery, BrandsQueryVariables>;
export const BrandByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<BrandByIdQuery, BrandByIdQueryVariables>;
export const BrandBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brandBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<BrandBySlugQuery, BrandBySlugQueryVariables>;
export const GetCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"session_id"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_items"}},{"kind":"Field","name":{"kind":"Name","value":"total_quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_empty"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCartQuery, GetCartQueryVariables>;
export const AddToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]} as unknown as DocumentNode<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCartItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveFromCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFromCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveFromCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFromCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const ClearCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearCart"}}]}}]} as unknown as DocumentNode<ClearCartMutation, ClearCartMutationVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const CategoryByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<CategoryByIdQuery, CategoryByIdQueryVariables>;
export const CategoryBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<CategoryBySlugQuery, CategoryBySlugQueryVariables>;
export const NavigationDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NavigationData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"display_image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}}]}}]} as unknown as DocumentNode<NavigationDataQuery, NavigationDataQueryVariables>;
export const ProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Products"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSearchInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOrderByClause"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const ProductByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]}}]} as unknown as DocumentNode<ProductByIdQuery, ProductByIdQueryVariables>;
export const ProductBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"attributes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]}}]} as unknown as DocumentNode<ProductBySlugQuery, ProductBySlugQueryVariables>;
export const SectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sections"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"active"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"title_en"}},{"kind":"Field","name":{"kind":"Name","value":"title_ar"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"section_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SectionsQuery, SectionsQueryVariables>;
export const SectionByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SectionById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"section"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"title_en"}},{"kind":"Field","name":{"kind":"Name","value":"title_ar"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"section_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SectionByIdQuery, SectionByIdQueryVariables>;
export const GetWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWishlist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetWishlistQuery, GetWishlistQueryVariables>;
export const GetWishlistCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWishlistCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlistCount"}}]}}]} as unknown as DocumentNode<GetWishlistCountQuery, GetWishlistCountQueryVariables>;
export const AddToWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToWishlistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddToWishlistMutation, AddToWishlistMutationVariables>;
export const RemoveFromWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFromWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveFromWishlistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFromWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveFromWishlistMutation, RemoveFromWishlistMutationVariables>;
export const MoveWishlistToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveWishlistToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_variant_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveWishlistToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"product_variant_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_variant_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_variant_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]} as unknown as DocumentNode<MoveWishlistToCartMutation, MoveWishlistToCartMutationVariables>;