'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRequireGuest } from '@/hooks/use-auth';
import type { ForgotPasswordInput } from '@/gql/graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations();
  const { forgotPassword, isLoading, error, clearError } = useRequireGuest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');

  // Validation schema
  const forgotPasswordSchema = z.object({
    email: z.string().email(t('validation.email')),
  });

  type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const forgotPasswordInput: ForgotPasswordInput = {
        email: data.email,
      };

      await forgotPassword(forgotPasswordInput);

      setEmail(data.email);
      setIsSuccess(true);
      reset();
    } catch (error) {
      // Error is handled by the auth hook
      console.error('Forgot password failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToForm = () => {
    setIsSuccess(false);
    setEmail('');
    clearError();
  };

  if (isSuccess) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8'>
        <Card className='w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl'>
          <CardHeader className='text-center'>
            <div className='mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4'>
              <Mail className='w-8 h-8 text-green-600' />
            </div>
            <CardTitle className='text-3xl font-extrabold text-gray-900'>
              {t('auth.forgotPassword.success')}
            </CardTitle>
            <CardDescription className='space-y-2'>
              <p>{t('auth.forgotPassword.success')}</p>
              <p className='font-medium text-gray-900'>{email}</p>
              <p>{t('auth.forgotPassword.instruction')}</p>
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-4'>
            <Button onClick={handleBackToForm} variant='outline' className='w-full'>
              Try a different email
            </Button>

            <div className='text-center'>
              <Link
                href='/auth/login'
                className='text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1'
              >
                <ArrowLeft className='w-4 h-4' />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl'>
        <CardHeader className='space-y-1 text-center'>
          <div className='mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4'>
            <KeyRound className='w-8 h-8 text-primary-foreground' />
          </div>
          <CardTitle className='text-3xl font-extrabold text-gray-900'>
            {t('auth.forgotPassword.title')}
          </CardTitle>
          <CardDescription className='text-gray-600'>
            {t('auth.forgotPassword.instruction')}
          </CardDescription>
        </CardHeader>

        <CardContent className='space-y-6'>
          {error && (
            <Alert variant='destructive'>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>{t('auth.forgotPassword.emailLabel')}</Label>
              <Input
                {...register('email')}
                id='email'
                type='email'
                autoComplete='email'
                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                className={errors.email ? 'border-red-300 focus-visible:ring-red-200' : ''}
              />
              {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
            </div>

            <Button type='submit' disabled={isSubmitting || isLoading} className='w-full'>
              {isSubmitting ? (
                <>
                  <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                  {t('auth.forgotPassword.sending')}
                </>
              ) : (
                t('auth.forgotPassword.sendButton')
              )}
            </Button>
          </form>

          <div className='text-center'>
            <Link
              href='/auth/login'
              className='text-sm text-primary hover:text-primary/80 font-medium transition-colors inline-flex items-center gap-1'
            >
              <ArrowLeft className='w-4 h-4' />
              {t('auth.forgotPassword.backToLogin')}
            </Link>
          </div>

          {/* Help Section */}
          <Card className='border-gray-200 bg-gray-50/50'>
            <CardContent className='pt-6 text-center'>
              <CardTitle className='text-sm font-medium text-gray-900 mb-2'>
                Still having trouble?
              </CardTitle>
              <CardDescription className='text-xs text-gray-600 mb-3'>
                If you don't receive the email within a few minutes, check your spam folder or try
                again.
              </CardDescription>
              <Link
                href='/support'
                className='text-xs text-primary hover:text-primary/80 font-medium transition-colors'
              >
                Contact support
              </Link>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
