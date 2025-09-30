'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRequireGuest } from '@/hooks/use-auth';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { AuthFormActions } from '@/components/auth/auth-form-buttons';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { KeyRound, Mail, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ForgotPasswordInput } from '@/gql/graphql';

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

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = form;

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
      <QuickAuthForm
        config={{
          icon: Mail,
          title: t('auth.forgotPassword.successTitle'),
          description: (
            <div className='space-y-2'>
              <p>{t('auth.forgotPassword.successMessage')}</p>
              <p className='font-medium text-gray-900'>{email}</p>
              <p>{t('auth.forgotPassword.instruction')}</p>
            </div>
          ),
          isStatusForm: true,
          status: 'success',
        }}
        form={{
          instance: form,
          onSubmit: () => {},
          error,
        }}
        fallback={{
          title: t('auth.forgotPassword.errorBoundary.title'),
          description: t('auth.forgotPassword.errorBoundary.description'),
          buttonText: t('auth.forgotPassword.errorBoundary.retry'),
          buttonHref: '/auth/forgot-password',
        }}
      >
        <button
          onClick={handleBackToForm}
          className="w-full px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Try a different email
        </button>

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
      </QuickAuthForm>
    );
  }

  return (
    <QuickAuthForm
      config={{
        icon: KeyRound,
        title: t('auth.forgotPassword.title'),
        description: t('auth.forgotPassword.instruction'),
      }}
      form={{
        instance: form,
        onSubmit,
        error,
      }}
      fallback={{
        title: t('auth.forgotPassword.errorBoundary.title'),
        description: t('auth.forgotPassword.errorBoundary.description'),
        buttonText: t('auth.forgotPassword.errorBoundary.retry'),
        buttonHref: '/auth/forgot-password',
      }}
    >
      <FormField
        name="email"
        label={t('auth.forgotPassword.emailLabel')}
        type="email"
        placeholder={t('auth.forgotPassword.emailPlaceholder')}
        autoComplete="email"
        register={register}
        error={errors.email}
        required
      />

      <AuthFormActions
        submitText={t('auth.forgotPassword.sendButton')}
        isSubmitting={isSubmitting || isLoading}
        loadingText={t('auth.forgotPassword.sending')}
        links={[
          {
            href: '/auth/login',
            text: t('auth.forgotPassword.backToLogin'),
            isBackLink: true,
          },
        ]}
      />

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
    </QuickAuthForm>
  );
}
