"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useRequireAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ConfirmPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, error, clearError } = useRequireAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const reason = searchParams.get('reason') || 'perform this action';

  // Validation schema
  const confirmPasswordSchema = z.object({
    password: z.string().min(1, t('validation.required')),
  });

  type ConfirmPasswordFormData = z.infer<typeof confirmPasswordSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm<ConfirmPasswordFormData>({
    resolver: zodResolver(confirmPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: ConfirmPasswordFormData) => {
    if (isSubmitting || !user?.email) return;
    
    setIsSubmitting(true);
    clearError();

    try {
      // Verify password by attempting to login with current credentials
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          email: user.email,
          password: data.password,
        }),
      });

      if (response.ok) {
        router.replace(redirectTo);
      } else {
        const errorData = await response.json();
        setError('password', {
          type: 'manual',
          message: errorData.message || t('validation.invalidPassword'),
        });
      }
    } catch (error) {
        setError('password', {
        type: 'manual',
        message: t('auth.confirmPasswordExtras.verifyFailed'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            {t('auth.confirmPassword.title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('auth.confirmPassword.subtitle')}
          </CardDescription>
          {user && (
            <p className="text-xs text-gray-500">
              Signed in as: <span className="font-medium">{user.email}</span>
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.confirmPassword.passwordLabel')}</Label>
              <Input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                placeholder={t('auth.confirmPassword.passwordPlaceholder')}
                className={errors.password ? 'border-red-300 focus-visible:ring-red-200' : ''}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('auth.confirmPassword.confirming')}
                  </>
                ) : (
                  t('auth.confirmPassword.confirmButton')
                )}
              </Button>
            </div>
          </form>

          {/* Help Section */}
          <Card className="border-gray-200 bg-gray-50/50">
            <CardContent className="pt-6 text-center">
              <CardTitle className="text-sm font-medium text-gray-900 mb-2">
                {t('auth.confirmPassword.forgotPassword')}
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 mb-3">
                {t('auth.confirmPasswordExtras.forgotInstruction')}
              </CardDescription>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-xs"
              >
                  <a href="/auth/forgot-password">
                  {t('auth.confirmPasswordExtras.resetPasswordLink')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}