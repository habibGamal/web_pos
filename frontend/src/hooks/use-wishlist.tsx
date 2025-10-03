"use client";
import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { graphql } from '../gql';
import type {
  Wishlist,
  AddToWishlistInput,
  RemoveFromWishlistInput,
} from '../gql/graphql';
import { useAuth } from './use-auth';

// GraphQL documents
const getWishlistDocument = graphql(/* GraphQL */ `
  query GetWishlist {
    wishlist {
      id
      user_id
      product_id
      created_at
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
        category {
          id
          name
        }
        brand {
          id
          name
        }
        default_variant {
          id
          name
          sku
          price
          sale_price
          quantity
          is_active
          is_default
        }
      }
    }
  }
`);

const getWishlistCountDocument = graphql(/* GraphQL */ `
  query GetWishlistCount {
    wishlistCount
  }
`);

const addToWishlistDocument = graphql(/* GraphQL */ `
  mutation AddToWishlist($input: AddToWishlistInput!) {
    addToWishlist(input: $input) {
      id
      user_id
      product_id
      created_at
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
        category {
          id
          name
        }
        brand {
          id
          name
        }
        default_variant {
          id
          name
          sku
          price
          sale_price
          quantity
          is_active
          is_default
        }
      }
    }
  }
`);

const removeFromWishlistDocument = graphql(/* GraphQL */ `
  mutation RemoveFromWishlist($input: RemoveFromWishlistInput!) {
    removeFromWishlist(input: $input)
  }
`);

const moveWishlistToCartDocument = graphql(/* GraphQL */ `
  mutation MoveWishlistToCart(
    $product_id: ID!
    $quantity: Int!
  ) {
    moveWishlistToCart(
      product_id: $product_id
      quantity: $quantity
    ) {
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

// Wishlist context type
interface WishlistContextType {
  wishlistItems: Wishlist[];
  wishlistCount: number;
  isLoading: boolean;
  error: string | null;
  addToWishlist: (input: AddToWishlistInput) => Promise<Wishlist>;
  removeFromWishlist: (input: RemoveFromWishlistInput) => Promise<boolean>;
  moveToCart: (productId: string, quantity?: number) => Promise<any>;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
  clearError: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

// Wishlist Provider Component
interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const { isAuthenticated } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Queries and mutations
  const {
    data: wishlistData,
    loading: isLoadingWishlist,
    refetch: refetchWishlist,
    error: wishlistQueryError,
  } = useQuery(getWishlistDocument, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: countData,
    loading: isLoadingCount,
    refetch: refetchCount,
    error: countQueryError,
  } = useQuery(getWishlistCountDocument, {
    skip: !isAuthenticated,
    errorPolicy: 'all',
  });

  const [addToWishlistMutation] = useMutation(addToWishlistDocument, {
    refetchQueries: [
      { query: getWishlistDocument },
      { query: getWishlistCountDocument },
    ],
    awaitRefetchQueries: true,
  });

  const [removeFromWishlistMutation] = useMutation(removeFromWishlistDocument, {
    refetchQueries: [
      { query: getWishlistDocument },
      { query: getWishlistCountDocument },
    ],
    awaitRefetchQueries: true,
  });

  const [moveWishlistToCartMutation] = useMutation(moveWishlistToCartDocument, {
    refetchQueries: [
      { query: getWishlistDocument },
      { query: getWishlistCountDocument },
    ],
    awaitRefetchQueries: true,
  });

  // Process wishlist data
  const wishlistItems = (wishlistData?.wishlist || []) as Wishlist[];
  const wishlistCount = countData?.wishlistCount || 0;
  const isLoading = isLoadingWishlist || isLoadingCount;

  // Helper function to handle errors
  const handleError = useCallback((error: any): never => {
    const message = error.graphQLErrors?.[0]?.message || error.message || 'An error occurred';
    setError(message);
    throw new Error(message);
  }, []);

  // Clear errors when query errors change
  useEffect(() => {
    if (wishlistQueryError) {
      setError(wishlistQueryError.message);
    } else if (countQueryError) {
      setError(countQueryError.message);
    }
  }, [wishlistQueryError, countQueryError]);

  // Wishlist operations
  const addToWishlist = useCallback(
    async (input: AddToWishlistInput): Promise<Wishlist> => {
      try {
        setError(null);
        const { data } = await addToWishlistMutation({ variables: { input } });
        if (!data?.addToWishlist) throw new Error('Failed to add item to wishlist');
        
        return data.addToWishlist as Wishlist;
      } catch (error) {
        return handleError(error);
      }
    },
    [addToWishlistMutation, handleError]
  );

  const removeFromWishlist = useCallback(
    async (input: RemoveFromWishlistInput): Promise<boolean> => {
      try {
        setError(null);
        const { data } = await removeFromWishlistMutation({ variables: { input } });
        return data?.removeFromWishlist ?? false;
      } catch (error) {
        return handleError(error);
      }
    },
    [removeFromWishlistMutation, handleError]
  );

  const moveToCart = useCallback(
    async (productId: string, quantity: number = 1) => {
      try {
        setError(null);
        const { data } = await moveWishlistToCartMutation({
          variables: {
            product_id: productId,
            quantity,
          },
        });
        if (!data?.moveWishlistToCart) throw new Error('Failed to move item to cart');
        
        return data.moveWishlistToCart;
      } catch (error) {
        return handleError(error);
      }
    },
    [moveWishlistToCartMutation, handleError]
  );

  // Utility functions
  const isInWishlist = useCallback(
    (productId: string): boolean => {
      return wishlistItems.some(item => item.product_id === productId);
    },
    [wishlistItems]
  );

  const toggleWishlist = useCallback(
    async (productId: string): Promise<boolean> => {
      if (isInWishlist(productId)) {
        await removeFromWishlist({ product_id: productId });
        return false;
      } else {
        await addToWishlist({ product_id: productId });
        return true;
      }
    },
    [isInWishlist, addToWishlist, removeFromWishlist]
  );

  const refreshWishlist = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      if (isAuthenticated) {
        await Promise.all([refetchWishlist(), refetchCount()]);
      }
    } catch (error) {
      console.error('Failed to refresh wishlist:', error);
    }
  }, [isAuthenticated, refetchWishlist, refetchCount]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const contextValue: WishlistContextType = {
    wishlistItems,
    wishlistCount,
    isLoading,
    error,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist,
    toggleWishlist,
    refreshWishlist,
    clearError,
  };

  return <WishlistContext.Provider value={contextValue}>{children}</WishlistContext.Provider>;
}

// Wishlist Hook
export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

// Additional hooks for specific use cases
export function useWishlistActions() {
  const { 
    addToWishlist, 
    removeFromWishlist, 
    moveToCart, 
    toggleWishlist 
  } = useWishlist();

  return {
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    toggleWishlist,
  };
}

export function useWishlistStatus(productId: string) {
  const { isInWishlist, isLoading } = useWishlist();
  
  return {
    isInWishlist: isInWishlist(productId),
    isLoading,
  };
}

// Hook for wishlist summary
export function useWishlistSummary() {
  const { wishlistCount, isLoading } = useWishlist();
  
  return {
    count: wishlistCount,
    isLoading,
  };
}