'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error to monitoring service
  console.error('Global error:', error);
  
  // TODO: Log to error reporting service
  // logErrorToService(error, { digest: error.digest, global: true });

  return (
    <html>
      <body className="bg-background text-foreground">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Application Error</h1>
              <p className="text-muted-foreground">
                We're experiencing technical difficulties. Our team has been notified and is working on a fix.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-left">
                <p className="text-sm font-mono text-destructive">
                  <strong>Error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    <strong>Digest:</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button onClick={reset}>
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}