import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo?: any;
  }
}

// Configure Pusher
if (typeof window !== 'undefined') {
  window.Pusher = Pusher;
}

let echoInstance: any = null;

export function createEchoInstance(token?: string): any {
  if (echoInstance) {
    return echoInstance;
  }

  const authHeaders: Record<string, string> = {
    'X-Requested-With': 'XMLHttpRequest',
  };

  if (!token) {
    token = localStorage.getItem('auth_token') ?? undefined;
  }

  if (token) {
    authHeaders.Authorization = `Bearer ${token}`;
  }
  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
    wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
    wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '8080'),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/broadcasting/auth`,
    auth: {
      headers: authHeaders,
    },
  });

  if (typeof window !== 'undefined') {
    window.Echo = echoInstance;
  }

  return echoInstance;
}

export function getEchoInstance(): any {
  return echoInstance;
}

export function resetEchoInstance(): void {
  if (echoInstance) {
    echoInstance.disconnect();
    echoInstance = null;
    if (typeof window !== 'undefined') {
      window.Echo = undefined;
    }
  }
}

// Create a default instance for backward compatibility
const echo = createEchoInstance();
export default echo;
