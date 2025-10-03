"use client";
import { useState, useCallback } from 'react';
import { useMutation } from '@apollo/client/react';
import { graphql } from '../gql';
import type { PaymentMethod } from '../gql/graphql';
import { useCart } from './use-cart';
import { useAuth } from './use-auth';

// GraphQL documents
const createOrderDocument = graphql(/* GraphQL */ `
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      user_id
      order_status
      payment_status
      subtotal
      shipping_cost
      discount
      total
      notes
      created_at
      can_be_cancelled
      can_be_returned
      items {
        id
        quantity
        unit_price
        total_price
        options
        product {
          id
          name
          slug
          featured_image
        }
        variant {
          id
          name
          sku
        }
      }
      shipping_address {
        id
        content
        phone
        area {
          id
          name
          shipping_cost
          gov {
            id
            name
          }
        }
      }
    }
  }
`);

interface CreateOrderInput {
  shipping_address_id: number;
  payment_method: PaymentMethod;
  notes?: string;
}

interface UseCheckoutReturn {
  isProcessing: boolean;
  error: string | null;
  createOrder: (input: CreateOrderInput) => Promise<any>;
  clearError: () => void;
}

export function useCheckout(): UseCheckoutReturn {
  const { isAuthenticated } = useAuth();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [createOrderMutation] = useMutation(createOrderDocument);

  const createOrder = useCallback(
    async (input: CreateOrderInput) => {
      if (!isAuthenticated) {
        throw new Error('You must be logged in to create an order');
      }

      setIsProcessing(true);
      setError(null);

      try {
        const { data } = await createOrderMutation({
          variables: { input },
        });

        if (!data?.createOrder) {
          throw new Error('Failed to create order');
        }

        // Clear cart after successful order creation
        await clearCart();

        return data.createOrder;
      } catch (err: any) {
        const message = err.graphQLErrors?.[0]?.message || err.message || 'Failed to create order';
        setError(message);
        throw new Error(message);
      } finally {
        setIsProcessing(false);
      }
    },
    [isAuthenticated, createOrderMutation, clearCart]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    error,
    createOrder,
    clearError,
  };
}