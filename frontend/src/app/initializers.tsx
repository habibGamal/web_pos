'use client';
import { useRealTimeNotifications } from '@/hooks/use-realtime-notifications';
import { configureEcho, echoIsConfigured } from '@laravel/echo-react';
import React, { useEffect } from 'react';

export default function Initializers({ children }: { children: React.ReactNode }) {
  console.log('⚙️ Running Initializers...');
  console.log('🔧 Echo configured:', echoIsConfigured());
  !echoIsConfigured()
    ? configureEcho({
        broadcaster: 'reverb',
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
        wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: localStorage.getItem('auth_token')
              ? `Bearer ${localStorage.getItem('auth_token')}`
              : '',
          },
        },
      })
    : null;
  // @ts-ignore
  localStorage.setItem('push_token', window.pushToken || '');
  useRealTimeNotifications();
  return <>{children}</>;
}
