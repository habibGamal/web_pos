'use client';

import { ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthCard, AuthStatusCard } from '@/components/auth/auth-card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface AuthFormWrapperProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackButtonText?: string;
  fallbackButtonHref?: string;
  className?: string;
}

/**
 * Wrapper component for authentication forms that provides:
 * - Error boundary protection
 * - Consistent error fallback UI
 * - Proper accessibility structure
 */
export function AuthFormWrapper({
  children,
  fallbackTitle,
  fallbackDescription,
  fallbackButtonText,
  fallbackButtonHref = '/auth/login',
  className = '',
}: AuthFormWrapperProps) {
  return (
    <ErrorBoundary 
      fallback={
        <AuthFormErrorFallback
          title={fallbackTitle}
          description={fallbackDescription}
          buttonText={fallbackButtonText}
          buttonHref={fallbackButtonHref}
        />
      }
    >
      <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
        {children}
      </div>
    </ErrorBoundary>
  );
}

interface AuthFormErrorFallbackProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
}

function AuthFormErrorFallback({
  title,
  description,
  buttonText,
  buttonHref = '/auth/login',
}: AuthFormErrorFallbackProps) {
  const t = useTranslations();

  return (
    <AuthStatusCard
      icon={AlertTriangle}
      title={title || t('auth.error.boundary.title')}
      description={description || t('auth.error.boundary.description')}
      status="error"
    >
      <Button asChild className="w-full">
        <Link href={buttonHref}>
          {buttonText || t('auth.error.boundary.button')}
        </Link>
      </Button>
    </AuthStatusCard>
  );
}