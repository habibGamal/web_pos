"use client";
import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '../gql';
import type {
  Cart,
  CartItem,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
} from '../gql/graphql';
import { useAuth } from './use-auth';

// GraphQL documents
const getCartDocument = graphql(/* GraphQL */ `
  query GetCart {
    cart {
      id
      user_id
      session_id
      total_price
      total_items
      total_quantity
      is_empty
      created_at
      updated_at
      items {
        id
        cart_id
        product_id
        quantity
        options
        unit_price
        total_price
        is_available
        created_at
        updated_at
        product {
          id
          name
          slug
          price
          sale_price
          effective_price
          featured_image
          is_active
          is_in_stock
        }
      }
    }
  }
`);

const addToCartDocument = graphql(/* GraphQL */ `
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      cart_id
      product_id
      quantity
      options
      unit_price
      total_price
      is_available
      product {
        id
        name
        slug
        price
        sale_price
        effective_price
        featured_image
        is_active
        is_in_stock
      }
    }
  }
`);

const updateCartItemDocument = graphql(/* GraphQL */ `
  mutation UpdateCartItem($input: UpdateCartItemInput!) {
    updateCartItem(input: $input) {
      id
      cart_id
      product_id
      quantity
      options
      unit_price
      total_price
      is_available
      product {
        id
        name
        slug
        price
        sale_price
        effective_price
        featured_image
        is_active
        is_in_stock
      }
    }
  }
`);

const removeFromCartDocument = graphql(/* GraphQL */ `
  mutation RemoveFromCart($input: RemoveFromCartInput!) {
    removeFromCart(input: $input)
  }
`);

const clearCartDocument = graphql(/* GraphQL */ `
  mutation ClearCart {
    clearCart
  }
`);

// Cart context type
interface CartContextType {
  cart: Cart | null;
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  totalQuantity: number;
  totalPrice: number;
  isEmpty: boolean;
  addToCart: (input: AddToCartInput) => Promise<CartItem>;
  updateCartItem: (input: UpdateCartItemInput) => Promise<CartItem | null>;
  removeFromCart: (input: RemoveFromCartInput) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  incrementQuantity: (cartItemId: string) => Promise<void>;
  decrementQuantity: (cartItemId: string) => Promise<void>;
  getCartItemByProduct: (productId: string, options?: Record<string, string>) => CartItem | null;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Queries and mutations
  const {
    data: cartData,
    loading: isLoading,
    refetch: refetchCart,
    error: queryError,
  } = useQuery(getCartDocument, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const [addToCartMutation] = useMutation(addToCartDocument, {
    refetchQueries: [{ query: getCartDocument }],
    awaitRefetchQueries: true,
  });

  const [updateCartItemMutation] = useMutation(updateCartItemDocument, {
    refetchQueries: [{ query: getCartDocument }],
    awaitRefetchQueries: true,
  });

  const [removeFromCartMutation] = useMutation(removeFromCartDocument, {
    refetchQueries: [{ query: getCartDocument }],
    awaitRefetchQueries: true,
  });

  const [clearCartMutation] = useMutation(clearCartDocument, {
    refetchQueries: [{ query: getCartDocument }],
    awaitRefetchQueries: true,
  });

  // Process cart data
  const cart = cartData?.cart as Cart | null;
  const cartItems = (cartData?.cart?.items || []) as CartItem[];

  // Computed values
  const totalItems = cart?.total_items || 0;
  const totalQuantity = cart?.total_quantity || 0;
  const totalPrice = cart?.total_price || 0;
  const isEmpty = cart?.is_empty ?? true;

  // Helper function to handle errors
  const handleError = useCallback((error: any): never => {
    const message = error.graphQLErrors?.[0]?.message || error.message || 'An error occurred';
    setError(message);
    throw new Error(message);
  }, []);

  // Clear errors when query error changes
  useEffect(() => {
    if (queryError) {
      setError(queryError.message);
    }
  }, [queryError]);

  // Cart operations
  const addToCart = useCallback(
    async (input: AddToCartInput): Promise<CartItem> => {
      try {
        setError(null);
        const { data } = await addToCartMutation({ variables: { input } });
        if (!data?.addToCart) throw new Error('Failed to add item to cart');
        
        return data.addToCart as CartItem;
      } catch (error) {
        return handleError(error);
      }
    },
    [addToCartMutation, handleError]
  );

  const updateCartItem = useCallback(
    async (input: UpdateCartItemInput): Promise<CartItem | null> => {
      try {
        setError(null);
        const { data } = await updateCartItemMutation({ variables: { input } });
        
        // Item might be null if quantity was set to 0 (item removed)
        return (data?.updateCartItem as CartItem) || null;
      } catch (error) {
        return handleError(error);
      }
    },
    [updateCartItemMutation, handleError]
  );

  const removeFromCart = useCallback(
    async (input: RemoveFromCartInput): Promise<boolean> => {
      try {
        setError(null);
        const { data } = await removeFromCartMutation({ variables: { input } });
        return data?.removeFromCart ?? false;
      } catch (error) {
        return handleError(error);
      }
    },
    [removeFromCartMutation, handleError]
  );

  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const { data } = await clearCartMutation();
      return data?.clearCart ?? false;
    } catch (error) {
      return handleError(error);
    }
  }, [clearCartMutation, handleError]);

  // Convenience methods
  const incrementQuantity = useCallback(
    async (cartItemId: string): Promise<void> => {
      const item = cartItems.find((item: any) => item.id === cartItemId);
      if (!item) return;

      await updateCartItem({
        cart_item_id: cartItemId,
        quantity: item.quantity + 1,
      });
    },
    [cartItems, updateCartItem]
  );

  const decrementQuantity = useCallback(
    async (cartItemId: string): Promise<void> => {
      const item = cartItems.find((item: any) => item.id === cartItemId);
      if (!item) return;

      const newQuantity = Math.max(0, item.quantity - 1);
      await updateCartItem({
        cart_item_id: cartItemId,
        quantity: newQuantity,
      });
    },
    [cartItems, updateCartItem]
  );

  const getCartItemByProduct = useCallback(
    (productId: string, options?: Record<string, string>): CartItem | null => {
      return cartItems.find((item: any) => {
        if (item.product_id !== productId) return false;
        
        // Compare options
        const itemOptions = item.options ? JSON.parse(item.options) : null;
        if (!options && !itemOptions) return true;
        if (!options || !itemOptions) return false;
        
        return JSON.stringify(itemOptions) === JSON.stringify(options);
      }) || null;
    },
    [cartItems]
  );

  const refreshCart = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      if (isAuthenticated) {
        await refetchCart();
      }
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    }
  }, [isAuthenticated, refetchCart]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const contextValue: CartContextType = {
    cart,
    cartItems,
    isLoading,
    error,
    totalItems,
    totalQuantity,
    totalPrice,
    isEmpty,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
    getCartItemByProduct,
    refreshCart,
    clearError,
  };

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

// Cart Hook
export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Additional hooks for specific use cases
export function useCartActions() {
  const { 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    incrementQuantity, 
    decrementQuantity 
  } = useCart();

  return {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  };
}

export function useCartSummary() {
  const { 
    totalItems, 
    totalQuantity, 
    totalPrice, 
    isEmpty 
  } = useCart();

  return {
    totalItems,
    totalQuantity,
    totalPrice,
    isEmpty,
  };
}

// Hook for checking if a product is in cart with specific options
export function useCartItemByProduct(productId: string, options?: Record<string, string>) {
  const { getCartItemByProduct } = useCart();
  return getCartItemByProduct(productId, options);
}

// Hook for quick add to cart with quantity management
export function useQuickCartActions() {
  const { addToCart, getCartItemByProduct, updateCartItem } = useCart();

  const addOrUpdateCart = useCallback(
    async (productId: string, quantity: number = 1, options?: Record<string, string>) => {
      const existingItem = getCartItemByProduct(productId, options);
      
      if (existingItem) {
        return await updateCartItem({
          cart_item_id: existingItem.id,
          quantity: existingItem.quantity + quantity,
        });
      } else {
        return await addToCart({
          product_id: productId,
          quantity,
          options: options ? JSON.stringify(options) : undefined,
        });
      }
    },
    [addToCart, getCartItemByProduct, updateCartItem]
  );

  return { addOrUpdateCart };
}