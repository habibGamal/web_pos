'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { LoginInput } from '@/gql/graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Lock, Facebook, Chrome } from 'lucide-react';
import { useRequireGuest } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useRequireGuest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  // Validation schema with translations
  const loginSchema = z.object({
    email: z.string().email(t('validation.email')),
    password: z.string().min(8, t('validation.invalidPassword')),
    remember: z.boolean().optional(),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const loginInput: LoginInput = {
        email: data.email,
        password: data.password,
        remember: data.remember,
      };

      await login(loginInput);

      // Redirect on successful login
      router.replace(redirectTo);
    } catch (error) {
      // Error is handled by the auth hook
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className='w-full max-w-md bg-white/95 backdrop-blur-sm border-white/20 shadow-xl'>
      <CardHeader className='space-y-1 text-center'>
        <div className='mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4'>
          <Lock className='w-8 h-8 text-primary-foreground' />
        </div>
        <CardTitle className='text-3xl font-extrabold text-gray-900'>
          {t('auth.login.title')}
        </CardTitle>
        <CardDescription className='text-gray-600'>
          {t('auth.login.noAccount')}{' '}
          <Link
            href='/auth/register'
            className='font-medium text-primary hover:text-primary/80 transition-colors'
          >
            {t('auth.login.signUp')}
          </Link>
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Social Login Options */}
        <div className='grid grid-cols-2 gap-3'>
          <Button
            type='button'
            variant='outline'
            className='w-full border-gray-300 hover:bg-gray-50 flex items-center rtl:flex-row-reverse'
          >
            <Chrome className='h-4 w-4 rtl:ml-2 ltr:mr-2' />
            {t('auth.login.google')}
          </Button>
          <Button
            type='button'
            variant='outline'
            className='w-full border-gray-300 hover:bg-gray-50 flex items-center rtl:flex-row-reverse'
          >
            <Facebook className='h-4 w-4 rtl:ml-2 ltr:mr-2' />
            {t('auth.login.facebook')}
          </Button>
        </div>

        <div className='relative'>
          <Separator className='my-4' />
          <div className='absolute inset-0 flex items-center justify-center'>
            <span className='bg-white px-2 text-sm text-gray-500'>
              {t('auth.login.continueWith')}
            </span>
          </div>
        </div>

        {error && (
          <Alert variant='destructive'>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>{t('auth.login.email')}</Label>
            <Input
              {...register('email')}
              id='email'
              type='email'
              autoComplete='email'
              placeholder={t('auth.login.email')}
              className={errors.email ? 'border-red-300 focus-visible:ring-red-200' : ''}
            />
            {errors.email && <p className='text-sm text-red-600'>{errors.email.message}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>{t('auth.login.password')}</Label>
            <Input
              {...register('password')}
              id='password'
              type='password'
              autoComplete='current-password'
              placeholder={t('auth.login.password')}
              className={errors.password ? 'border-red-300 focus-visible:ring-red-200' : ''}
            />
            {errors.password && <p className='text-sm text-red-600'>{errors.password.message}</p>}
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 rtl:space-x-reverse'>
              <Checkbox
                id='remember'
                checked={watch('remember')}
                onCheckedChange={(checked) => setValue('remember', Boolean(checked))}
              />
              <Label htmlFor='remember' className='text-sm font-normal text-gray-900'>
                {t('auth.login.rememberMe')}
              </Label>
            </div>

            <Link
              href='/auth/forgot-password'
              className='text-sm font-medium text-primary hover:text-primary/80 transition-colors rtl:mr-auto ltr:ml-auto'
            >
              {t('auth.login.forgotPassword')}
            </Link>
          </div>

          <Button type='submit' disabled={isSubmitting || isLoading} className='w-full'>
            {isSubmitting ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin rtl:ml-2 ltr:mr-2' />
                {t('auth.login.signingIn')}
              </>
            ) : (
              t('auth.login.signIn')
            )}
          </Button>
        </form>

        {/* Support Link */}
        <div className='text-center pt-4'>
          <Link
            href='/support'
            className='text-xs text-gray-500 hover:text-primary transition-colors'
          >
            {t('auth.login.support')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
