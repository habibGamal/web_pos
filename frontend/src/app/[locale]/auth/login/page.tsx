'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Lock, Facebook, Chrome } from 'lucide-react';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { CurrentPasswordField } from '@/components/auth/password-fields';
import { AuthFormActions } from '@/components/auth/auth-form-buttons';
import { FormField, CheckboxFormField } from '@/components/ui/form-field';
import { useRequireGuest } from '@/hooks/use-auth';
import { useFormServerErrorHandler } from '@/hooks/use-form-server-error-handler';
import { useTranslations } from 'next-intl';
import type { LoginInput } from '@/gql/graphql';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading, error, clearError } = useRequireGuest();
  const { handleServerError } = useFormServerErrorHandler<LoginFormData>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations();

  // Validation schema with proper translations
  const loginSchema = z.object({
    email: z.string().min(1, t('validation.required')).email(t('validation.email')),
    password: z.string().min(8, t('validation.invalidPassword')),
    remember: z.boolean().optional(),
  });

  type LoginFormData = z.infer<typeof loginSchema>;

  // Get redirect URL from query params with fallback
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    setError,
  } = form;

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
    } catch (submitError) {
      // Use centralized error handler for validation errors
      handleServerError(submitError, setError);

      // Log for debugging
      console.error('Login failed:', submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle social login (placeholder for future implementation)
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    // TODO: Implement social login
    console.log(`Social login with ${provider} - not implemented yet`);
  };

  return (
    <QuickAuthForm
      config={{
        icon: Lock,
        title: t('auth.login.title'),
        description: (
          <>
            {t('auth.login.noAccount')}{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
            >
              {t('auth.login.signUp')}
            </Link>
          </>
        ),
      }}
      form={{
        instance: form,
        onSubmit,
        error,
      }}
      fallback={{
        title: t('auth.login.errorBoundary.title'),
        description: t('auth.login.errorBoundary.description'),
        buttonText: t('auth.login.errorBoundary.retry'),
        buttonHref: '/auth/login',
      }}
    >
      {/* Social Login Options */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center rtl:flex-row-reverse"
          onClick={() => handleSocialLogin('google')}
          aria-label={`${t('auth.login.continueWith')} Google`}
        >
          <Chrome className="h-4 w-4 rtl:ml-2 ltr:mr-2" aria-hidden="true" />
          {t('auth.login.google')}
        </button>
        <button
          type="button"
          className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center rtl:flex-row-reverse"
          onClick={() => handleSocialLogin('facebook')}
          aria-label={`${t('auth.login.continueWith')} Facebook`}
        >
          <Facebook className="h-4 w-4 rtl:ml-2 ltr:mr-2" aria-hidden="true" />
          {t('auth.login.facebook')}
        </button>
      </div>

      <div className="relative">
        <Separator className="my-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-white px-2 text-sm text-gray-500">
            {t('auth.login.continueWith')}
          </span>
        </div>
      </div>

      {/* Email Field */}
      <FormField
        name="email"
        label={t('auth.login.email')}
        type="email"
        placeholder={t('auth.login.email')}
        autoComplete="email"
        register={register}
        error={errors.email}
        required
      />

      {/* Password Field */}
      <CurrentPasswordField
        register={register}
        error={errors.password}
        label={t('auth.login.password')}
        placeholder={t('auth.login.password')}
      />

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <CheckboxFormField
          name="remember"
          label={t('auth.login.rememberMe')}
          checked={watch('remember') ?? false}
          onCheckedChange={(checked) => setValue('remember', Boolean(checked))}
        />

        <Link
          href="/auth/forgot-password"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
        >
          {t('auth.login.forgotPassword')}
        </Link>
      </div>

      <AuthFormActions
        submitText={t('auth.login.signIn')}
        isSubmitting={isSubmitting || isLoading}
        loadingText={t('auth.login.signingIn')}
        links={[
          {
            href: '/auth/forgot-password',
            text: t('auth.login.forgotPassword'),
          },
        ]}
      />

      {/* Support Link */}
      <div className="text-center pt-4">
        <Link
          href="/support"
          className="text-xs text-gray-500 hover:text-primary transition-colors underline-offset-4 hover:underline"
        >
          {t('auth.login.support')}
        </Link>
      </div>
    </QuickAuthForm>
  );
}
