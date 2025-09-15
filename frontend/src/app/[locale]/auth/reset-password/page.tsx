"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRequireGuest } from '@/hooks/use-auth';
import { ResetPasswordInput } from '@/gql/graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, KeyRound, CheckCircle, AlertTriangle, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}

function ResetPasswordForm() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, isLoading, error, clearError } = useRequireGuest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  
  // Get token and email from URL parameters
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Validation schema
  const resetPasswordSchema = z.object({
    password: z.string()
      .min(8, t('validation.invalidPassword'))
      .regex(/[A-Z]/, t('auth.register.passwordStrength.uppercase'))
      .regex(/[a-z]/, t('auth.register.passwordStrength.lowercase'))
      .regex(/[0-9]/, t('auth.register.passwordStrength.number')),
    password_confirmation: z.string(),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('validation.passwordMismatch'),
    path: ["password_confirmation"],
  });

  type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
  });

  const watchPassword = watch('password');

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if token or email is missing
  useEffect(() => {
    if (!token || !email) {
      router.replace('/auth/forgot-password');
    }
  }, [token, email, router]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (isSubmitting || !token || !email) return;
    
    setIsSubmitting(true);
    clearError();

    try {
      const resetPasswordInput: ResetPasswordInput = {
        email,
        token,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      await resetPassword(resetPasswordInput);
      
      setIsSuccess(true);
      reset();
    } catch (error) {
      // Error is handled by the auth hook
      console.error('Reset password failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(watchPassword || '');

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-900">
              Invalid Reset Link
            </CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">
                Request new reset link
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl text-center">
          <CardHeader>
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-gray-900">
              Password Reset Successful
            </CardTitle>
            <CardDescription>
              Your password has been successfully reset. You can now sign in with your new password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/auth/login">
                Sign in to your account
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <KeyRound className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-extrabold text-gray-900">
            {t('auth.resetPassword.title')}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {t('auth.resetPassword.subtitle')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.resetPassword.passwordLabel')}</Label>
              <Input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.resetPassword.passwordPlaceholder')}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
                className={errors.password ? 'border-red-300 focus-visible:ring-red-200' : ''}
              />
              
              {/* Password Strength Indicator */}
              {watchPassword && (
                <div className="mt-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 w-full rounded ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {t('auth.register.passwordStrength.requirements')} {
                      passwordStrength <= 2 ? t('auth.register.passwordStrength.weak') :
                      passwordStrength <= 3 ? t('auth.register.passwordStrength.medium') : 
                      t('auth.register.passwordStrength.strong')
                    }
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              {(showPasswordRequirements || errors.password) && (
                <Card className="mt-2 p-3 bg-gray-50 border-gray-200">
                  <p className="text-xs font-medium text-gray-700 mb-2">{t('auth.register.passwordStrength.requirements')}</p>
                  <ul className="text-xs space-y-1">
                    <li className={`flex items-center ${
                      (watchPassword?.length || 0) >= 8 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <Check className="w-3 h-3 mr-1" />
                      {t('auth.register.passwordStrength.minLength')}
                    </li>
                    <li className={`flex items-center ${
                      /[A-Z]/.test(watchPassword || '') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <Check className="w-3 h-3 mr-1" />
                      {t('auth.register.passwordStrength.uppercase')}
                    </li>
                    <li className={`flex items-center ${
                      /[a-z]/.test(watchPassword || '') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <Check className="w-3 h-3 mr-1" />
                      {t('auth.register.passwordStrength.lowercase')}
                    </li>
                    <li className={`flex items-center ${
                      /[0-9]/.test(watchPassword || '') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      <Check className="w-3 h-3 mr-1" />
                      {t('auth.register.passwordStrength.number')}
                    </li>
                  </ul>
                </Card>
              )}

              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">{t('auth.resetPassword.confirmPasswordLabel')}</Label>
              <Input
                {...register('password_confirmation')}
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                className={errors.password_confirmation ? 'border-red-300 focus-visible:ring-red-200' : ''}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600">{errors.password_confirmation.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('auth.resetPassword.resetting')}
                </>
              ) : (
                t('auth.resetPassword.resetButton')
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/auth/login"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              ← {t('auth.resetPassword.backToLogin')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}