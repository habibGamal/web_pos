// 'use client';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { Geist, Geist_Mono } from 'next/font/google';
import { ApolloProvider } from '@apollo/client/react';
import '../globals.css';
import { useEffect } from 'react';
import { AuthProvider } from '@/hooks/use-auth';
import apolloClient, { fetchCsrfCookie } from '@/lib/apollo-client';
import { getMessages } from 'next-intl/server';
import Providers from '../providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // useEffect(() => {
    // fetchCsrfCookie();
  // }, []);
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
