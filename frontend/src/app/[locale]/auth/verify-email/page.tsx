"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function VerifyEmailPage() {
  return <VerifyEmailForm />;
}

function VerifyEmailForm() {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            {t('auth.verifyEmail.title')}
          </CardTitle>
          <CardDescription className="space-y-2">
            <p className="text-sm text-gray-600">
              {t('auth.verifyEmail.subtitle')}
            </p>
            <p className="text-sm font-medium text-gray-900">
              {user.email}
            </p>
            <p className="text-sm text-gray-600">
              {t('auth.verifyEmail.instruction')}
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Success message for resend */}
          {resendSuccess && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t('auth.verifyEmail.success')}
              </AlertDescription>
            </Alert>
          )}

          {/* Error message */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Button
              onClick={handleResendVerification}
              disabled={isResending || resendCooldown > 0}
              className="w-full"
            >
              {isResending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('auth.verifyEmail.resending')}
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                t('auth.verifyEmail.resendButton')
              )}
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              Sign out
            </Button>
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
                <Button
                  onClick={() => router.replace('/auth/register')}
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full"
                >
                  Use a different email address
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs w-full"
                >
                  <a href="/support">
                    Contact support
                  </a>
                </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}