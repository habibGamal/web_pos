"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, resendVerification, logout, isLoading, error, clearError } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Get verification parameters from URL
  const verificationId = searchParams.get('id');
  const hash = searchParams.get('hash');
  const expires = searchParams.get('expires');
  const signature = searchParams.get('signature');

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Redirect authenticated and verified users
  useEffect(() => {
    if (user?.email_verified_at) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // Auto-verify if URL contains verification parameters
  useEffect(() => {
    if (verificationId && hash && expires && signature && user) {
      // In a real app, you'd call the verification endpoint here
      console.log('Auto-verifying email with parameters:', {
        verificationId,
        hash,
        expires,
        signature,
      });
    }
  }, [verificationId, hash, expires, signature, user]);

  const handleResendVerification = async () => {
    if (isResending || resendCooldown > 0 || !user?.email) return;

    setIsResending(true);
    setResendSuccess(false);
    clearError();

    try {
      await resendVerification({
        email: user.email,
        callback_url: `${window.location.origin}/auth/verify-email`,
      });
      setResendSuccess(true);
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Resend verification failed:', error);
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.replace('/auth/login');
    return null;
  }

  return (
    <QuickAuthForm
      config={{
        icon: Mail,
        title: t('auth.verifyEmail.title'),
        description: (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {t('auth.verifyEmail.subtitle')}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {user.email}
            </p>
            <p className="text-sm text-gray-600">
              {t('auth.verifyEmail.instruction')}
            </p>
          </div>
        ),
        isStatusForm: true,
      }}
      form={{
        instance: {} as any,
        onSubmit: () => {},
        error,
      }}
      fallback={{
        title: t('auth.verifyEmail.errorBoundary.title'),
        description: t('auth.verifyEmail.errorBoundary.description'),
        buttonText: t('auth.verifyEmail.errorBoundary.retry'),
        buttonHref: '/auth/verify-email',
      }}
    >
      {/* Success message for resend */}
      {resendSuccess && (
        <div className="w-full p-3 bg-green-50 border border-green-200 rounded-md mb-4">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            <p className="text-sm text-green-800">
              {t('auth.verifyEmail.success')}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          onClick={handleResendVerification}
          disabled={isResending || resendCooldown > 0}
          className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t('auth.verifyEmail.resending')}
            </span>
          ) : resendCooldown > 0 ? (
            `Resend in ${resendCooldown}s`
          ) : (
            t('auth.verifyEmail.resendButton')
          )}
        </button>

        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Sign out
        </button>
      </div>

      {/* Help Section */}
      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6 text-center">
          <CardTitle className="text-sm font-medium text-gray-900 mb-2">
            Still having trouble?
          </CardTitle>
          <CardDescription className="text-xs text-gray-600 mb-3">
            Make sure to check your spam folder. If you still don't receive the email, try resending it or contact support.
          </CardDescription>
          <div className="space-y-2">
            <button
              onClick={() => router.replace('/auth/register')}
              className="w-full px-3 py-2 text-xs text-primary hover:text-primary/80 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Use a different email address
            </button>
            <a
              href="/support"
              className="block w-full px-3 py-2 text-xs text-primary hover:text-primary/80 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Contact support
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Debug info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (verificationId || hash) && (
        <Card className="border-gray-200 bg-gray-50/50">
          <CardContent className="pt-6">
            <CardTitle className="text-sm font-medium text-gray-900 mb-2">Debug Info:</CardTitle>
            <div className="text-xs text-gray-600 space-y-1">
              <p>ID: {verificationId}</p>
              <p>Hash: {hash}</p>
              <p>Expires: {expires}</p>
              <p>Signature: {signature}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </QuickAuthForm>
  );
}