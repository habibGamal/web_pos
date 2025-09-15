'use client';

import { ApolloProvider } from '@apollo/client/react';
import { NextIntlClientProvider } from 'next-intl';
import { AuthProvider } from '@/hooks/use-auth';
import apolloClient from '@/lib/apollo-client';

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
          {children}
      </AuthProvider>
    </ApolloProvider>
  );
}
