'use client';

import { ApolloProvider } from '@apollo/client/react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/hooks/use-auth';
import apolloClient, { fetchCsrfCookie } from '@/lib/apollo-client';
import { useEffect } from 'react';
import { CartProvider } from '@/hooks/use-cart';
import { WishlistProvider } from '@/hooks/use-wishlist';

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetchCsrfCookie();
  }, []);
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <WishlistProvider>
        <CartProvider>{children}</CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
