'use client';

import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { WishlistProvider } from '@/hooks/use-wishlist';
import apolloClient, { fetchCsrfCookie } from '@/lib/apollo-client';
import { ApolloProvider } from '@apollo/client/react';
import { useEffect } from 'react';
import Initializers from './initializers';


export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetchCsrfCookie();
  }, []);

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <Initializers>{children}</Initializers>
            <Toaster position='top-right' />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
