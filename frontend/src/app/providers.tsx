'use client';

import { ApolloProvider } from '@apollo/client/react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/hooks/use-auth';
import apolloClient, { fetchCsrfCookie } from '@/lib/apollo-client';
import { useEffect } from 'react';
import { CartProvider } from '@/hooks/use-cart';
import { WishlistProvider } from '@/hooks/use-wishlist';
import { useInitializeRealTimeNotifications } from '@/hooks/use-realtime-notifications';
import { Toaster } from '@/components/ui/sonner';

function NotificationInitializer() {
  useInitializeRealTimeNotifications();
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetchCsrfCookie();
  }, []);
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <NotificationInitializer />
            {children}
            <Toaster position="top-right" />
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
