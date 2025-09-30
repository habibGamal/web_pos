"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRequireGuest } from '@/hooks/use-auth';
import { usePasswordStrength } from '@/hooks/use-password-strength';
import { useFormServerErrorHandler } from '@/hooks/use-form-server-error-handler';
import { ResetPasswordInput } from '@/gql/graphql';
import { Button } from '@/components/ui/button';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { PasswordField, PasswordConfirmationField } from '@/components/auth/password-fields';
import { AuthFormActions } from '@/components/auth/auth-form-buttons';
import { KeyRound, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ResetPasswordPageImproved() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, error, clearError } = useRequireGuest();
  const { handleServerError } = useFormServerErrorHandler<ResetPasswordFormData>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
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
  
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      password_confirmation: '',
    },
  });

  const { watch } = form;
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
      form.reset();
    } catch (error) {
      handleServerError(error, form.setError);
      console.error('Reset password failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Invalid token/email state
  if (!token || !email) {
    return (
      <QuickAuthForm
        config={{
          icon: AlertTriangle,
          title: "Invalid Reset Link",
          description: "This password reset link is invalid or has expired.",
          isStatusForm: true,
          status: 'error',
        }}
        form={{
          instance: form,
          onSubmit,
          error,
        }}
        fallback={{
          title: t('auth.resetPassword.errorBoundary.title'),
          description: t('auth.resetPassword.errorBoundary.description'),
          buttonText: t('auth.resetPassword.errorBoundary.retry'),
          buttonHref: '/auth/forgot-password',
        }}
      >
        <Button asChild className="w-full">
          <Link href="/auth/forgot-password">
            Request new reset link
          </Link>
        </Button>
      </QuickAuthForm>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <QuickAuthForm
        config={{
          icon: CheckCircle,
          title: "Password Reset Successful",
          description: "Your password has been successfully reset. You can now sign in with your new password.",
          isStatusForm: true,
          status: 'success',
        }}
        form={{
          instance: form,
          onSubmit,
          error,
        }}
        fallback={{
          title: t('auth.resetPassword.errorBoundary.title'),
          description: t('auth.resetPassword.errorBoundary.description'),
          buttonText: t('auth.resetPassword.errorBoundary.retry'),
          buttonHref: '/auth/forgot-password',
        }}
      >
        <Button asChild className="w-full">
          <Link href="/auth/login">
            Sign in to your account
          </Link>
        </Button>
      </QuickAuthForm>
    );
  }

  // Main form state
  return (
    <QuickAuthForm
      config={{
        icon: KeyRound,
        title: t('auth.resetPassword.title'),
        description: t('auth.resetPassword.subtitle'),
      }}
      form={{
        instance: form,
        onSubmit,
        error,
      }}
      fallback={{
        title: t('auth.resetPassword.errorBoundary.title'),
        description: t('auth.resetPassword.errorBoundary.description'),
        buttonText: t('auth.resetPassword.errorBoundary.retry'),
        buttonHref: '/auth/forgot-password',
      }}
    >
      <PasswordField
        name="password"
        register={form.register}
        error={form.formState.errors.password}
        label={t('auth.resetPassword.passwordLabel')}
        placeholder={t('auth.resetPassword.passwordPlaceholder')}
        value={watchPassword}
        required
      />

      <PasswordConfirmationField
        register={form.register}
        error={form.formState.errors.password_confirmation}
        label={t('auth.resetPassword.confirmPasswordLabel')}
        placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
      />

      <AuthFormActions
        submitText={t('auth.resetPassword.resetButton')}
        isSubmitting={isSubmitting}
        loadingText={t('auth.resetPassword.resetting')}
        links={[
          {
            href: '/auth/login',
            text: t('auth.resetPassword.backToLogin'),
            isBackLink: true,
          },
        ]}
      />
    </QuickAuthForm>
  );
}