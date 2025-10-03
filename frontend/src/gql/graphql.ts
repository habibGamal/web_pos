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
  /** A datetime string in ISO 8601 format in UTC with nanoseconds `YYYY-MM-DDTHH:mm:ss.SSSSSSZ`, e.g. `2020-04-20T16:20:04.000000Z`. */
  DateTime: { input: string; output: string; }
};

export type AddToCartInput = {
  /** Selected product options as JSON string (e.g., '{"Color":"Red","Size":"Large"}') */
  options?: InputMaybe<Scalars['String']['input']>;
  /** Product ID to add (can be a parent product or variant) */
  product_id: Scalars['ID']['input'];
  /** Quantity to add */
  quantity: Scalars['Int']['input'];
};

export type AddToWishlistInput = {
  /** Product ID to add to wishlist */
  product_id: Scalars['ID']['input'];
};

export type Address = {
  __typename: 'Address';
  /** Area the address belongs to */
  area: Maybe<Area>;
  /** Area ID */
  area_id: Maybe<Scalars['ID']['output']>;
  /** Full address content */
  content: Scalars['String']['output'];
  /** When the address was created */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Orders using this address as shipping address */
  orders: Array<Order>;
  /** Phone number for this address */
  phone: Scalars['String']['output'];
  /** When the address was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** User who owns this address */
  user: User;
  /** Owner user ID */
  user_id: Scalars['ID']['output'];
};

export type AddressInput = {
  /** Area ID (references areas table) */
  area_id: Scalars['ID']['input'];
  /** Full address content */
  content: Scalars['String']['input'];
  /** Phone number for this address */
  phone: Scalars['String']['input'];
};

export type Area = {
  __typename: 'Area';
  /** When the area was created */
  created_at: Scalars['DateTime']['output'];
  /** Governorate this area belongs to */
  gov: Gov;
  /** Governorate ID */
  gov_id: Scalars['ID']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Name */
  name: Scalars['String']['output'];
  /** Shipping cost */
  shipping_cost: Scalars['Float']['output'];
  /** When the area was last updated */
  updated_at: Scalars['DateTime']['output'];
};

export type Attribute = {
  __typename: 'Attribute';
  /** When the attribute was created */
  created_at: Scalars['DateTime']['output'];
  /** Attribute description in current locale */
  description: Maybe<Scalars['String']['output']>;
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Attribute name in current locale */
  name: Scalars['String']['output'];
  /** Sort order */
  sort_order: Scalars['Int']['output'];
  /** Attribute input type */
  type: AttributeInputType;
  /** When the attribute was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Attribute values */
  values: Array<AttributeValue>;
};

export type AttributeInputType =
  /** Boolean checkbox */
  | 'BOOLEAN'
  /** Color picker */
  | 'COLOR'
  /** Number input */
  | 'NUMBER'
  /** Select dropdown */
  | 'SELECT'
  /** Text input */
  | 'TEXT';

export type AttributeValue = {
  __typename: 'AttributeValue';
  /** Parent attribute */
  attribute: Attribute;
  /** Attribute ID this value belongs to */
  attribute_id: Scalars['ID']['output'];
  /** Color code for color attributes */
  color_code: Maybe<Scalars['String']['output']>;
  /** When the value was created */
  created_at: Scalars['DateTime']['output'];
  /** Display value (localized) - for frontend display */
  display_value: Scalars['String']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Sort order */
  sort_order: Scalars['Int']['output'];
  /** When the value was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Value identifier */
  value: Scalars['String']['output'];
  /** Product variants using this value */
  variants: Array<Product>;
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

export type Brand = {
  __typename: 'Brand';
  /** Number of active products for this brand */
  active_products_count: Scalars['Int']['output'];
  /** Brand's child brands */
  children: Array<Brand>;
  /** When the brand was created. */
  created_at: Scalars['DateTime']['output'];
  /** Brand's display order */
  display_order: Scalars['Int']['output'];
  /** Whether the brand has any products */
  has_products: Scalars['Boolean']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Brand's display image with fallback logic */
  image: Maybe<Scalars['String']['output']>;
  /** Whether the brand is active */
  is_active: Scalars['Boolean']['output'];
  /** Brand name in current locale */
  name: Scalars['String']['output'];
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
  /** Selected product options (e.g., {Color: Red, Size: Large}) */
  options: Maybe<Scalars['String']['output']>;
  /** Product (can be a parent product or variant) */
  product: Product;
  /** Product ID (can be a parent product or variant) */
  product_id: Scalars['ID']['output'];
  /** Quantity of this item in cart */
  quantity: Scalars['Int']['output'];
  /** Total price for this line item */
  total_price: Scalars['Float']['output'];
  /** Price per unit at time of adding to cart */
  unit_price: Scalars['Float']['output'];
  /** When the item was last updated */
  updated_at: Scalars['DateTime']['output'];
};

export type Category = {
  __typename: 'Category';
  /** Number of active products in this category */
  active_products_count: Scalars['Int']['output'];
  /** Category's child categories */
  children: Array<Category>;
  /** When the category was created. */
  created_at: Scalars['DateTime']['output'];
  /** Category's display order */
  display_order: Scalars['Int']['output'];
  /** Whether the category has any products */
  has_products: Scalars['Boolean']['output'];
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Category's display image with fallback logic */
  image: Maybe<Scalars['String']['output']>;
  /** Whether the category is active */
  is_active: Scalars['Boolean']['output'];
  /** Category name in current locale */
  name: Scalars['String']['output'];
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
  /** Order notes */
  notes?: InputMaybe<Scalars['String']['input']>;
  /** Payment method */
  payment_method: PaymentMethod;
  /** Shipping address */
  shipping_address_id: Scalars['Int']['input'];
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

export type Gov = {
  __typename: 'Gov';
  /** Areas belonging to this governorate */
  areas: Array<Area>;
  /** When the governorate was created */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Name */
  name: Scalars['String']['output'];
  /** When the governorate was last updated */
  updated_at: Scalars['DateTime']['output'];
};

export type GroupedAttribute = {
  __typename: 'GroupedAttribute';
  /** Attribute information */
  attribute: Attribute;
  /** Values for this attribute (localized display values) */
  values: Array<Scalars['String']['output']>;
};

export type LoginInput = {
  /** User's email address */
  email: Scalars['String']['input'];
  /** Expo push notification token */
  expo_push_token?: InputMaybe<Scalars['String']['input']>;
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
  /** Create new address */
  createAddress: Address;
  /** Create new order from cart */
  createOrder: Order;
  /** Create return request */
  createReturn: ReturnOrder;
  /** Delete user account */
  deleteAccount: SuccessPayload;
  /** Delete address */
  deleteAddress: Scalars['Boolean']['output'];
  /** Delete a notification. */
  deleteNotification: Scalars['Boolean']['output'];
  /** Request password reset */
  forgotPassword: PasswordResetPayload;
  /** Login with email and password */
  login: AuthPayload;
  /** Logout the authenticated user */
  logout: SuccessPayload;
  /** Mark all notifications as read. */
  markAllNotificationsAsRead: Scalars['Boolean']['output'];
  /** Mark a notification as read. */
  markNotificationAsRead: Scalars['Boolean']['output'];
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
  /** Send a notification to a user. */
  sendNotification: Scalars['Boolean']['output'];
  /** Login with social provider */
  socialLogin: AuthPayload;
  /** Update existing address */
  updateAddress: Address;
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


export type MutationCreateAddressArgs = {
  input: AddressInput;
};


export type MutationCreateOrderArgs = {
  input: CreateOrderInput;
};


export type MutationCreateReturnArgs = {
  input: CreateReturnInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  input: ForgotPasswordInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationMoveWishlistToCartArgs = {
  product_id: Scalars['ID']['input'];
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


export type MutationSendNotificationArgs = {
  notification: NotificationInput;
  user_id: Scalars['ID']['input'];
};


export type MutationSocialLoginArgs = {
  input: SocialLoginInput;
};


export type MutationUpdateAddressArgs = {
  id: Scalars['ID']['input'];
  input: AddressInput;
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

/** Notification model base type */
export type Notification = {
  __typename: 'Notification';
  /** When the notification was created. */
  created_at: Scalars['DateTime']['output'];
  /** Notification data as JSON string. */
  data: Scalars['String']['output'];
  /** Unique notification ID. */
  id: Scalars['ID']['output'];
  /** When the notification was read. */
  read_at: Maybe<Scalars['DateTime']['output']>;
  /** Notification type (class name). */
  type: Scalars['String']['output'];
  /** When the notification was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

/** Notification input for sending notifications */
export type NotificationInput = {
  /** Action label for the notification. */
  action_label?: InputMaybe<Scalars['String']['input']>;
  /** Action URL for the notification. */
  action_url?: InputMaybe<Scalars['String']['input']>;
  /** Notification message. */
  message: Scalars['String']['input'];
  /** Additional metadata as JSON string. */
  metadata?: InputMaybe<Scalars['String']['input']>;
  /** Notification title. */
  title: Scalars['String']['input'];
  /** Notification type (info, success, warning, error). */
  type?: InputMaybe<NotificationType>;
};

/** A paginated list of Notification items. */
export type NotificationPaginator = {
  __typename: 'NotificationPaginator';
  /** A list of Notification items. */
  data: Array<Notification>;
  /** Pagination information about the list of items. */
  paginatorInfo: PaginatorInfo;
};

/** Notification type enum */
export type NotificationType =
  | 'ERROR'
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING';

export type Option = {
  __typename: 'Option';
  /** When the option was created */
  created_at: Scalars['DateTime']['output'];
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Option name (localized) */
  name: Scalars['String']['output'];
  /** Option name in Arabic */
  name_ar: Scalars['String']['output'];
  /** Option name in English */
  name_en: Scalars['String']['output'];
  /** When the option was last updated */
  updated_at: Scalars['DateTime']['output'];
  /** Array of possible values */
  values: Array<Scalars['String']['output']>;
};

export type Order = {
  __typename: 'Order';
  /** Whether the order can be cancelled */
  can_be_cancelled: Scalars['Boolean']['output'];
  /** Whether the order can be returned */
  can_be_returned: Scalars['Boolean']['output'];
  /** When the order was placed */
  created_at: Scalars['DateTime']['output'];
  /** Actual delivery date */
  delivered_at: Maybe<Scalars['DateTime']['output']>;
  /** Discount amount */
  discount: Scalars['Float']['output'];
  /** Estimated delivery date */
  estimated_delivery_date: Maybe<Scalars['DateTime']['output']>;
  /** Unique identifier */
  id: Scalars['ID']['output'];
  /** Order items */
  items: Array<OrderItem>;
  /** Order notes */
  notes: Maybe<Scalars['String']['output']>;
  /** Order status */
  order_status: OrderStatus;
  /** Payment status */
  payment_status: PaymentStatus;
  /** Returns for this order */
  returns: Array<ReturnOrder>;
  /** Shipping address */
  shipping_address: Address;
  /** Shipping cost */
  shipping_cost: Scalars['Float']['output'];
  /** Subtotal before taxes and discounts */
  subtotal: Scalars['Float']['output'];
  /** Total order amount */
  total: Scalars['Float']['output'];
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
  /** Selected product options at time of order (e.g., {Color: Red, Size: Large}) */
  options: Maybe<Scalars['String']['output']>;
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

export type PaymentMethod =
  /** Cash on Delivery / الدفع عند الاستلام */
  | 'CASH_ON_DELIVERY'
  /** Credit Card / بطاقة ائتمانية */
  | 'CREDIT_CARD'
  /** Wallet / المحفظة الإلكترونية */
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

export type Product = {
  __typename: 'Product';
  /** Product brand. */
  brand: Brand;
  /** Product category. */
  category: Category;
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
  /** Product's options */
  options: Array<Option>;
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
  /** Variant's attribute values */
  attribute_values: Array<AttributeValue>;
  /** Variant attributes as formatted string */
  attributes_string: Maybe<Scalars['String']['output']>;
  /** When the variant was created */
  created_at: Scalars['DateTime']['output'];
  /** Variant's effective price (with fallback to parent) */
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
  /** Parent product */
  parent: Product;
  /** Parent product ID this variant belongs to */
  parent_id: Scalars['ID']['output'];
  /** Variant price (nullable - uses parent product price if not set) */
  price: Maybe<Scalars['Float']['output']>;
  /** Variant stock quantity */
  quantity: Scalars['Int']['output'];
  /** Variant sale price (nullable) */
  sale_price: Maybe<Scalars['Float']['output']>;
  /** Variant SKU */
  sku: Scalars['String']['output'];
  /** When the variant was last updated */
  updated_at: Scalars['DateTime']['output'];
};

export type Query = {
  __typename: 'Query';
  /** Get areas by governorate ID */
  areas: Array<Area>;
  /** Get a single attribute by ID */
  attribute: Maybe<Attribute>;
  /** Get a single attribute value by ID */
  attributeValue: Maybe<AttributeValue>;
  /** Get all attribute values */
  attributeValues: Array<AttributeValue>;
  /** Get all attributes */
  attributes: Array<Attribute>;
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
  /** Get all governorates with their areas */
  governorates: Array<Gov>;
  /** Get current authenticated user */
  me: Maybe<User>;
  /** Get user's notifications with pagination. */
  notifications: NotificationPaginator;
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
  /** Get count of unread notifications. */
  unreadNotificationsCount: Scalars['Int']['output'];
  /** Get current user's wishlist items */
  wishlist: Array<Wishlist>;
  /** Get wishlist items count for current user */
  wishlistCount: Scalars['Int']['output'];
};


export type QueryAreasArgs = {
  gov_id: Scalars['ID']['input'];
};


export type QueryAttributeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAttributeValueArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAttributeValuesArgs = {
  attribute_id?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryBrandArgs = {
  id: Scalars['ID']['input'];
};


export type QueryBrandBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryBrandsArgs = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCategoriesArgs = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryCategoryBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryNotificationsArgs = {
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  unread_only?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrdersArgs = {
  date_from?: InputMaybe<Scalars['DateTime']['input']>;
  date_to?: InputMaybe<Scalars['DateTime']['input']>;
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<OrderStatus>;
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductBySlugArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<ProductOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<ProductSearchInput>;
};


export type QueryReturnOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryReturnsArgs = {
  first?: Scalars['Int']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<ReturnStatus>;
};


export type QuerySearchProductsArgs = {
  filters?: InputMaybe<ProductSearchInput>;
  first?: Scalars['Int']['input'];
  orderBy?: InputMaybe<Array<ProductOrderByClause>>;
  page?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchSuggestionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySectionArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySectionsArgs = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
};

export type RegisterInput = {
  /** User's email address */
  email: Scalars['String']['input'];
  /** Expo push notification token */
  expo_push_token?: InputMaybe<Scalars['String']['input']>;
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
  /** Expo push notification token */
  expo_push_token?: InputMaybe<Scalars['String']['input']>;
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

export type User = {
  __typename: 'User';
  /** User's addresses */
  addresses: Array<Address>;
  /** When the account was created. */
  created_at: Scalars['DateTime']['output'];
  /** Unique email address (privacy controlled). */
  email: Scalars['String']['output'];
  /** Whether the user has completed email verification */
  email_verified: Scalars['Boolean']['output'];
  /** When the email was verified. */
  email_verified_at: Maybe<Scalars['DateTime']['output']>;
  /** User's Facebook ID */
  facebook_id: Maybe<Scalars['String']['output']>;
  /** User's Google ID */
  google_id: Maybe<Scalars['String']['output']>;
  /** Unique primary key. */
  id: Scalars['ID']['output'];
  /** Whether the user has completed email verification (alias) */
  is_email_verified: Scalars['Boolean']['output'];
  /** User's preferred language/locale */
  locale: Scalars['String']['output'];
  /** Non-unique name. */
  name: Scalars['String']['output'];
  /** User's phone number */
  phone: Maybe<Scalars['String']['output']>;
  /** When the account was last updated. */
  updated_at: Scalars['DateTime']['output'];
};

export type VariantAttributeGroup = {
  __typename: 'VariantAttributeGroup';
  /** Attribute information */
  attribute: Attribute;
  /** Values for this attribute (localized display values) */
  values: Array<Scalars['String']['output']>;
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

export type GetUserWithAddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserWithAddressesQuery = { me: { __typename: 'User', id: string, name: string, email: string, addresses: Array<{ __typename: 'Address', id: string, content: string, phone: string, area_id: string | null, user_id: string, created_at: string, updated_at: string, area: { __typename: 'Area', id: string, name: string, shipping_cost: number, gov_id: string, gov: { __typename: 'Gov', id: string, name: string } } | null }> } | null };

export type GetGovernoratesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetGovernoratesQuery = { governorates: Array<{ __typename: 'Gov', id: string, name: string, areas: Array<{ __typename: 'Area', id: string, name: string, shipping_cost: number }> }> };

export type GetAreasQueryVariables = Exact<{
  gov_id: Scalars['ID']['input'];
}>;


export type GetAreasQuery = { areas: Array<{ __typename: 'Area', id: string, name: string, shipping_cost: number, gov_id: string }> };

export type CreateAddressMutationVariables = Exact<{
  input: AddressInput;
}>;


export type CreateAddressMutation = { createAddress: { __typename: 'Address', id: string, content: string, phone: string, area_id: string | null, user_id: string, created_at: string, updated_at: string, area: { __typename: 'Area', id: string, name: string, shipping_cost: number, gov_id: string, gov: { __typename: 'Gov', id: string, name: string } } | null } };

export type UpdateAddressMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: AddressInput;
}>;


export type UpdateAddressMutation = { updateAddress: { __typename: 'Address', id: string, content: string, phone: string, area_id: string | null, user_id: string, created_at: string, updated_at: string, area: { __typename: 'Area', id: string, name: string, shipping_cost: number, gov_id: string, gov: { __typename: 'Gov', id: string, name: string } } | null } };

export type DeleteAddressMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteAddressMutation = { deleteAddress: boolean };

export type UserFieldsFragment = { __typename: 'User', id: string, name: string, email: string, email_verified: boolean, is_email_verified: boolean, phone: string | null, locale: string, google_id: string | null, facebook_id: string | null, email_verified_at: string | null, created_at: string, updated_at: string } & { ' $fragmentName'?: 'UserFieldsFragment' };

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

export type BrandsQueryVariables = Exact<{
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  parents_only?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type BrandsQuery = { brands: Array<{ __typename: 'Brand', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Brand', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Brand', id: string, name: string, slug: string, active_products_count: number }> }> };

export type BrandByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type BrandByIdQuery = { brand: { __typename: 'Brand', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Brand', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Brand', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type BrandBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type BrandBySlugQuery = { brandBySlug: { __typename: 'Brand', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Brand', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Brand', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type GetCartQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCartQuery = { cart: { __typename: 'Cart', id: string, user_id: string, session_id: string | null, total_price: number, total_items: number, total_quantity: number, is_empty: boolean, created_at: string, updated_at: string, items: Array<{ __typename: 'CartItem', id: string, cart_id: string, product_id: string, quantity: number, options: string | null, unit_price: number, total_price: number, is_available: boolean, created_at: string, updated_at: string, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } }> } | null };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { addToCart: { __typename: 'CartItem', id: string, cart_id: string, product_id: string, quantity: number, options: string | null, unit_price: number, total_price: number, is_available: boolean, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } } };

export type UpdateCartItemMutationVariables = Exact<{
  input: UpdateCartItemInput;
}>;


export type UpdateCartItemMutation = { updateCartItem: { __typename: 'CartItem', id: string, cart_id: string, product_id: string, quantity: number, options: string | null, unit_price: number, total_price: number, is_available: boolean, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } } | null };

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


export type CategoriesQuery = { categories: Array<{ __typename: 'Category', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Category', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Category', id: string, name: string, slug: string, active_products_count: number }> }> };

export type CategoryByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type CategoryByIdQuery = { category: { __typename: 'Category', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Category', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Category', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type CategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type CategoryBySlugQuery = { categoryBySlug: { __typename: 'Category', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, products_count: number, active_products_count: number, has_products: boolean, parent_id: string | null, parent: { __typename: 'Category', id: string, name: string, slug: string } | null, children: Array<{ __typename: 'Category', id: string, name: string, slug: string, active_products_count: number }>, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null }> } | null };

export type CreateOrderMutationVariables = Exact<{
  input: CreateOrderInput;
}>;


export type CreateOrderMutation = { createOrder: { __typename: 'Order', id: string, user_id: string, order_status: OrderStatus, payment_status: PaymentStatus, subtotal: number, shipping_cost: number, discount: number, total: number, notes: string | null, created_at: string, can_be_cancelled: boolean, can_be_returned: boolean, items: Array<{ __typename: 'OrderItem', id: string, quantity: number, unit_price: number, total_price: number, options: string | null, product: { __typename: 'Product', id: string, name: string, slug: string, featured_image: string | null }, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string } | null }>, shipping_address: { __typename: 'Address', id: string, content: string, phone: string, area: { __typename: 'Area', id: string, name: string, shipping_cost: number, gov: { __typename: 'Gov', id: string, name: string } } | null } } };

export type NavigationDataQueryVariables = Exact<{ [key: string]: never; }>;


export type NavigationDataQuery = { brands: Array<{ __typename: 'Brand', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, active_products_count: number }>, categories: Array<{ __typename: 'Category', id: string, name: string, slug: string, image: string | null, display_order: number, is_active: boolean, active_products_count: number }> };

export type OrdersQueryVariables = Exact<{
  status?: InputMaybe<OrderStatus>;
  date_from?: InputMaybe<Scalars['DateTime']['input']>;
  date_to?: InputMaybe<Scalars['DateTime']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrdersQuery = { orders: { __typename: 'OrderPaginator', data: Array<{ __typename: 'Order', id: string, user_id: string, order_status: OrderStatus, payment_status: PaymentStatus, subtotal: number, shipping_cost: number, discount: number, total: number, notes: string | null, created_at: string, updated_at: string, can_be_cancelled: boolean, can_be_returned: boolean, tracking_number: string | null, estimated_delivery_date: string | null, delivered_at: string | null, items: Array<{ __typename: 'OrderItem', id: string, quantity: number, unit_price: number, total_price: number, options: string | null, variant_details: string | null, returnable_quantity: number, product: { __typename: 'Product', id: string, name: string, slug: string, featured_image: string | null }, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string } | null }>, shipping_address: { __typename: 'Address', id: string, content: string, phone: string, area: { __typename: 'Area', id: string, name: string, shipping_cost: number, gov: { __typename: 'Gov', id: string, name: string } } | null } }>, paginatorInfo: { __typename: 'PaginatorInfo', count: number, currentPage: number, firstItem: number | null, hasMorePages: boolean, lastItem: number | null, lastPage: number, perPage: number, total: number } } };

export type OrderByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type OrderByIdQuery = { order: { __typename: 'Order', id: string, user_id: string, order_status: OrderStatus, payment_status: PaymentStatus, subtotal: number, shipping_cost: number, discount: number, total: number, notes: string | null, created_at: string, updated_at: string, can_be_cancelled: boolean, can_be_returned: boolean, tracking_number: string | null, estimated_delivery_date: string | null, delivered_at: string | null, items: Array<{ __typename: 'OrderItem', id: string, quantity: number, unit_price: number, total_price: number, options: string | null, variant_details: string | null, returnable_quantity: number, product: { __typename: 'Product', id: string, name: string, slug: string, featured_image: string | null }, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string } | null }>, shipping_address: { __typename: 'Address', id: string, content: string, phone: string, area: { __typename: 'Area', id: string, name: string, shipping_cost: number, gov: { __typename: 'Gov', id: string, name: string } } | null }, returns: Array<{ __typename: 'ReturnOrder', id: string, return_number: string, status: ReturnStatus, reason: ReturnReason, notes: string | null, refund_amount: number, created_at: string, approved_at: string | null, refunded_at: string | null }> } | null };

export type ReturnsQueryVariables = Exact<{
  status?: InputMaybe<ReturnStatus>;
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ReturnsQuery = { returns: { __typename: 'ReturnOrderPaginator', data: Array<{ __typename: 'ReturnOrder', id: string, return_number: string, order_id: string, status: ReturnStatus, reason: ReturnReason, notes: string | null, refund_amount: number, created_at: string, updated_at: string, approved_at: string | null, refunded_at: string | null, order: { __typename: 'Order', id: string, order_status: OrderStatus, created_at: string }, returnItems: Array<{ __typename: 'ReturnItem', id: string, quantity: number, unit_price: number, subtotal: number, orderItem: { __typename: 'OrderItem', id: string, product: { __typename: 'Product', id: string, name: string, slug: string, featured_image: string | null }, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string } | null } }> }>, paginatorInfo: { __typename: 'PaginatorInfo', count: number, currentPage: number, firstItem: number | null, hasMorePages: boolean, lastItem: number | null, lastPage: number, perPage: number, total: number } } };

export type ReturnByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ReturnByIdQuery = { returnOrder: { __typename: 'ReturnOrder', id: string, return_number: string, order_id: string, status: ReturnStatus, reason: ReturnReason, notes: string | null, refund_amount: number, created_at: string, updated_at: string, approved_at: string | null, refunded_at: string | null, order: { __typename: 'Order', id: string, order_status: OrderStatus, created_at: string, total: number }, returnItems: Array<{ __typename: 'ReturnItem', id: string, quantity: number, unit_price: number, subtotal: number, orderItem: { __typename: 'OrderItem', id: string, quantity: number, unit_price: number, product: { __typename: 'Product', id: string, name: string, slug: string, featured_image: string | null }, variant: { __typename: 'ProductVariant', id: string, name: string, sku: string } | null } }>, statusHistory: Array<{ __typename: 'ReturnStatusHistory', id: string, previous_status: ReturnStatus | null, new_status: ReturnStatus, notes: string | null, created_at: string, changedBy: { __typename: 'User', id: string, name: string } | null }> } | null };

export type ProductsQueryVariables = Exact<{
  search?: InputMaybe<ProductSearchInput>;
  orderBy?: InputMaybe<Array<ProductOrderByClause> | ProductOrderByClause>;
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductsQuery = { products: { __typename: 'ProductPaginator', data: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, description: string | null, category: { __typename: 'Category', id: string, name: string }, brand: { __typename: 'Brand', id: string, name: string }, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, effective_price: number, quantity: number, is_active: boolean, is_default: boolean } | null, options: Array<{ __typename: 'Option', id: string, name: string, values: Array<string> }> }>, paginatorInfo: { __typename: 'PaginatorInfo', count: number, currentPage: number, firstItem: number | null, hasMorePages: boolean, lastItem: number | null, lastPage: number, perPage: number, total: number } } };

export type ProductByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type ProductByIdQuery = { product: { __typename: 'Product', id: string, name: string, slug: string, description: string | null, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, images: Array<string>, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string }, variants: Array<{ __typename: 'ProductVariant', id: string, name: string, price: number | null, effective_price: number, is_in_stock: boolean, quantity: number, attributes_string: string | null, attribute_values: Array<{ __typename: 'AttributeValue', id: string, value: string, color_code: string | null, attribute: { __typename: 'Attribute', id: string, name: string, type: AttributeInputType } }> }>, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, effective_price: number, quantity: number, is_active: boolean, is_default: boolean } | null, options: Array<{ __typename: 'Option', id: string, name: string, values: Array<string> }> } | null };

export type ProductBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type ProductBySlugQuery = { productBySlug: { __typename: 'Product', id: string, name: string, slug: string, description: string | null, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, images: Array<string>, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string }, variants: Array<{ __typename: 'ProductVariant', id: string, name: string, price: number | null, effective_price: number, is_in_stock: boolean, quantity: number, attributes_string: string | null, attribute_values: Array<{ __typename: 'AttributeValue', id: string, value: string, color_code: string | null, attribute: { __typename: 'Attribute', id: string, name: string, type: AttributeInputType } }> }>, default_variant: { __typename: 'ProductVariant', id: string, name: string, sku: string, price: number | null, effective_price: number, quantity: number, is_active: boolean, is_default: boolean } | null, options: Array<{ __typename: 'Option', id: string, name: string, values: Array<string> }> } | null };

export type SectionsQueryVariables = Exact<{
  active?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type SectionsQuery = { sections: Array<{ __typename: 'Section', id: string, title: string, active: boolean, sort_order: number, section_type: SectionType, created_at: string, updated_at: string, products_count: number, active_products_count: number, has_products: boolean, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, description: string | null, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string } }> }> };

export type SectionByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SectionByIdQuery = { section: { __typename: 'Section', id: string, title: string, active: boolean, sort_order: number, section_type: SectionType, created_at: string, updated_at: string, products_count: number, active_products_count: number, has_products: boolean, products: Array<{ __typename: 'Product', id: string, name: string, slug: string, price: number, effective_price: number, discount_percentage: number | null, is_featured: boolean, is_on_sale: boolean, is_in_stock: boolean, featured_image: string | null, description: string | null, category: { __typename: 'Category', id: string, name: string, slug: string }, brand: { __typename: 'Brand', id: string, name: string, slug: string } }> } | null };

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
  quantity: Scalars['Int']['input'];
}>;


export type MoveWishlistToCartMutation = { moveWishlistToCart: { __typename: 'CartItem', id: string, cart_id: string, product_id: string, quantity: number, options: string | null, unit_price: number, total_price: number, is_available: boolean, product: { __typename: 'Product', id: string, name: string, slug: string, price: number, sale_price: number | null, effective_price: number, featured_image: string | null, is_active: boolean, is_in_stock: boolean } } };

export type GetNotificationsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  unread_only?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetNotificationsQuery = { notifications: { __typename: 'NotificationPaginator', data: Array<{ __typename: 'Notification', id: string, type: string, data: string, read_at: string | null, created_at: string, updated_at: string }>, paginatorInfo: { __typename: 'PaginatorInfo', count: number, currentPage: number, firstItem: number | null, hasMorePages: boolean, lastItem: number | null, lastPage: number, perPage: number, total: number } } };

export type GetUnreadNotificationsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnreadNotificationsCountQuery = { unreadNotificationsCount: number };

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationAsReadMutation = { markNotificationAsRead: boolean };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { markAllNotificationsAsRead: boolean };

export type DeleteNotificationMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteNotificationMutation = { deleteNotification: boolean };

export type SendNotificationMutationVariables = Exact<{
  user_id: Scalars['ID']['input'];
  notification: NotificationInput;
}>;


export type SendNotificationMutation = { sendNotification: boolean };

export const UserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UserFieldsFragment, unknown>;
export const GetUserWithAddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserWithAddresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"area_id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov_id"}},{"kind":"Field","name":{"kind":"Name","value":"gov"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetUserWithAddressesQuery, GetUserWithAddressesQueryVariables>;
export const GetGovernoratesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetGovernorates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"governorates"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"areas"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}}]}}]}}]}}]} as unknown as DocumentNode<GetGovernoratesQuery, GetGovernoratesQueryVariables>;
export const GetAreasDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAreas"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"gov_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"areas"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"gov_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"gov_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov_id"}}]}}]}}]} as unknown as DocumentNode<GetAreasQuery, GetAreasQueryVariables>;
export const CreateAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"area_id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov_id"}},{"kind":"Field","name":{"kind":"Name","value":"gov"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateAddressMutation, CreateAddressMutationVariables>;
export const UpdateAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"area_id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov_id"}},{"kind":"Field","name":{"kind":"Name","value":"gov"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<UpdateAddressMutation, UpdateAddressMutationVariables>;
export const DeleteAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAddressMutation, DeleteAddressMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const SocialLoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SocialLogin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SocialLoginInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"socialLogin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<SocialLoginMutation, SocialLoginMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ForgotPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResetPasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const VerifyEmailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"VerifyEmail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"VerifyEmailInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"verifyEmail"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"verified"}}]}}]}}]} as unknown as DocumentNode<VerifyEmailMutation, VerifyEmailMutationVariables>;
export const ResendVerificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResendVerification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ResendVerificationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resendVerification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<ResendVerificationMutation, ResendVerificationMutationVariables>;
export const DeleteAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"success"}},{"kind":"Field","name":{"kind":"Name","value":"message"}}]}}]}}]} as unknown as DocumentNode<DeleteAccountMutation, DeleteAccountMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"access_token"}},{"kind":"Field","name":{"kind":"Name","value":"token_type"}},{"kind":"Field","name":{"kind":"Name","value":"expires_in"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"is_email_verified"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"locale"}},{"kind":"Field","name":{"kind":"Name","value":"google_id"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_id"}},{"kind":"Field","name":{"kind":"Name","value":"email_verified_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const BrandsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Brands"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}}]}}]}}]} as unknown as DocumentNode<BrandsQuery, BrandsQueryVariables>;
export const BrandByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brand"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<BrandByIdQuery, BrandByIdQueryVariables>;
export const BrandBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BrandBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brandBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<BrandBySlugQuery, BrandBySlugQueryVariables>;
export const GetCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"session_id"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_items"}},{"kind":"Field","name":{"kind":"Name","value":"total_quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_empty"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetCartQuery, GetCartQueryVariables>;
export const AddToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]} as unknown as DocumentNode<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCartItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveFromCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFromCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveFromCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFromCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const ClearCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearCart"}}]}}]} as unknown as DocumentNode<ClearCartMutation, ClearCartMutationVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parents_only"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const CategoryByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<CategoryByIdQuery, CategoryByIdQueryVariables>;
export const CategoryBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"parent_id"}},{"kind":"Field","name":{"kind":"Name","value":"parent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}}]}}]}}]} as unknown as DocumentNode<CategoryBySlugQuery, CategoryBySlugQueryVariables>;
export const CreateOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"order_status"}},{"kind":"Field","name":{"kind":"Name","value":"payment_status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"can_be_cancelled"}},{"kind":"Field","name":{"kind":"Name","value":"can_be_returned"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<CreateOrderMutation, CreateOrderMutationVariables>;
export const NavigationDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NavigationData"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"brands"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"BooleanValue","value":true}},{"kind":"Argument","name":{"kind":"Name","value":"parents_only"},"value":{"kind":"BooleanValue","value":true}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"display_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}}]}}]}}]} as unknown as DocumentNode<NavigationDataQuery, NavigationDataQueryVariables>;
export const OrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Orders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date_from"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"date_to"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"DateTime"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"date_from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date_from"}}},{"kind":"Argument","name":{"kind":"Name","value":"date_to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"date_to"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"order_status"}},{"kind":"Field","name":{"kind":"Name","value":"payment_status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"can_be_cancelled"}},{"kind":"Field","name":{"kind":"Name","value":"can_be_returned"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_number"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_delivery_date"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"variant_details"}},{"kind":"Field","name":{"kind":"Name","value":"returnable_quantity"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<OrdersQuery, OrdersQueryVariables>;
export const OrderByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrderById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"order_status"}},{"kind":"Field","name":{"kind":"Name","value":"payment_status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"can_be_cancelled"}},{"kind":"Field","name":{"kind":"Name","value":"can_be_returned"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_number"}},{"kind":"Field","name":{"kind":"Name","value":"estimated_delivery_date"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"variant_details"}},{"kind":"Field","name":{"kind":"Name","value":"returnable_quantity"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"area"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_cost"}},{"kind":"Field","name":{"kind":"Name","value":"gov"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"returns"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"return_number"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"refund_amount"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}}]}}]}}]}}]} as unknown as DocumentNode<OrderByIdQuery, OrderByIdQueryVariables>;
export const ReturnsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Returns"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ReturnStatus"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returns"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"return_number"}},{"kind":"Field","name":{"kind":"Name","value":"order_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"refund_amount"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order_status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"returnItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<ReturnsQuery, ReturnsQueryVariables>;
export const ReturnByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReturnById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"returnOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"return_number"}},{"kind":"Field","name":{"kind":"Name","value":"order_id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"refund_amount"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"order_status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}},{"kind":"Field","name":{"kind":"Name","value":"returnItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"orderItem"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusHistory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"previous_status"}},{"kind":"Field","name":{"kind":"Name","value":"new_status"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"changedBy"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ReturnByIdQuery, ReturnByIdQueryVariables>;
export const ProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Products"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductSearchInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOrderByClause"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const ProductByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"attributes_string"}},{"kind":"Field","name":{"kind":"Name","value":"attribute_values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]}}]} as unknown as DocumentNode<ProductByIdQuery, ProductByIdQueryVariables>;
export const ProductBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"images"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"variants"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"attributes_string"}},{"kind":"Field","name":{"kind":"Name","value":"attribute_values"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"attribute"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"values"}}]}}]}}]}}]} as unknown as DocumentNode<ProductBySlugQuery, ProductBySlugQueryVariables>;
export const SectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"active"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sections"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"active"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"section_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SectionsQuery, SectionsQueryVariables>;
export const SectionByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SectionById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"section"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"section_type"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"products_count"}},{"kind":"Field","name":{"kind":"Name","value":"active_products_count"}},{"kind":"Field","name":{"kind":"Name","value":"has_products"}},{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount_percentage"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_on_sale"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]}}]} as unknown as DocumentNode<SectionByIdQuery, SectionByIdQueryVariables>;
export const GetWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWishlist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]}}]}}]} as unknown as DocumentNode<GetWishlistQuery, GetWishlistQueryVariables>;
export const GetWishlistCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetWishlistCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlistCount"}}]}}]} as unknown as DocumentNode<GetWishlistCountQuery, GetWishlistCountQueryVariables>;
export const AddToWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToWishlistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"brand"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"default_variant"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]}}]}}]}}]} as unknown as DocumentNode<AddToWishlistMutation, AddToWishlistMutationVariables>;
export const RemoveFromWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveFromWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoveFromWishlistInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeFromWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RemoveFromWishlistMutation, RemoveFromWishlistMutationVariables>;
export const MoveWishlistToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveWishlistToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveWishlistToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"cart_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total_price"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"sale_price"}},{"kind":"Field","name":{"kind":"Name","value":"effective_price"}},{"kind":"Field","name":{"kind":"Name","value":"featured_image"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_in_stock"}}]}}]}}]}}]} as unknown as DocumentNode<MoveWishlistToCartMutation, MoveWishlistToCartMutationVariables>;
export const GetNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"10"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"1"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unread_only"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"unread_only"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unread_only"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"read_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"paginatorInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"currentPage"}},{"kind":"Field","name":{"kind":"Name","value":"firstItem"}},{"kind":"Field","name":{"kind":"Name","value":"hasMorePages"}},{"kind":"Field","name":{"kind":"Name","value":"lastItem"}},{"kind":"Field","name":{"kind":"Name","value":"lastPage"}},{"kind":"Field","name":{"kind":"Name","value":"perPage"}},{"kind":"Field","name":{"kind":"Name","value":"total"}}]}}]}}]}}]} as unknown as DocumentNode<GetNotificationsQuery, GetNotificationsQueryVariables>;
export const GetUnreadNotificationsCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnreadNotificationsCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationsCount"}}]}}]} as unknown as DocumentNode<GetUnreadNotificationsCountQuery, GetUnreadNotificationsCountQueryVariables>;
export const MarkNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const DeleteNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteNotificationMutation, DeleteNotificationMutationVariables>;
export const SendNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"notification"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"NotificationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"user_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"notification"},"value":{"kind":"Variable","name":{"kind":"Name","value":"notification"}}}]}]}}]} as unknown as DocumentNode<SendNotificationMutation, SendNotificationMutationVariables>;