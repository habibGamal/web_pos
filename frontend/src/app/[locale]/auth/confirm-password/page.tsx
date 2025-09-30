"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequireAuth } from '@/hooks/use-auth';
import { useFormServerErrorHandler } from '@/hooks/use-form-server-error-handler';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { AuthFormActions } from '@/components/auth/auth-form-buttons';
import { FormField } from '@/components/ui/form-field';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ConfirmPasswordPage() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, changePassword, error, clearError } = useRequireAuth();
  const { handleServerError } = useFormServerErrorHandler<ConfirmPasswordFormData>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const reason = searchParams.get('reason') || 'perform this action';

  // Validation schema
  const confirmPasswordSchema = z.object({
    password: z.string().min(1, t('validation.required')),
  });

  type ConfirmPasswordFormData = z.infer<typeof confirmPasswordSchema>;

  const form = useForm<ConfirmPasswordFormData>({
    resolver: zodResolver(confirmPasswordSchema),
    defaultValues: {
      password: '',
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = form;

  // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: ConfirmPasswordFormData) => {
    if (isSubmitting || !user?.email) return;

    setIsSubmitting(true);
    clearError();

    try {
      // Verify password by attempting to change password to the same password
      // This is a common pattern for password confirmation
      await changePassword({
        current_password: data.password,
        password: data.password,
        password_confirmation: data.password,
      });

      // If successful, redirect to intended destination
      router.replace(redirectTo);

    } catch (error) {
      handleServerError(error, setError);
      console.error('Password confirmation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <QuickAuthForm
      config={{
        icon: ShieldCheck,
        title: t('auth.confirmPassword.title'),
        description: (
          <div className="space-y-2">
            <p className="text-gray-600">{t('auth.confirmPassword.subtitle')}</p>
            {user && (
              <p className="text-xs text-gray-500">
                Signed in as: <span className="font-medium">{user.email}</span>
              </p>
            )}
          </div>
        ),
      }}
      form={{
        instance: form,
        onSubmit,
        error,
      }}
      fallback={{
        title: t('auth.confirmPassword.errorBoundary.title'),
        description: t('auth.confirmPassword.errorBoundary.description'),
        buttonText: t('auth.confirmPassword.errorBoundary.retry'),
        buttonHref: '/auth/confirm-password',
      }}
    >
      <FormField
        name="password"
        label={t('auth.confirmPassword.passwordLabel')}
        type="password"
        autoComplete="current-password"
        placeholder={t('auth.confirmPassword.passwordPlaceholder')}
        register={register}
        error={errors.password}
        required
      />

      <AuthFormActions
        submitText={t('auth.confirmPassword.confirmButton')}
        isSubmitting={isSubmitting}
        loadingText={t('auth.confirmPassword.confirming')}
        showCancel={true}
        cancelText={t('common.cancel')}
        onCancel={handleCancel}
      />

      {/* Help Section */}
      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="pt-6 text-center">
          <CardTitle className="text-sm font-medium text-gray-900 mb-2">
            {t('auth.confirmPassword.forgotPassword')}
          </CardTitle>
          <CardDescription className="text-xs text-gray-600 mb-3">
            {t('auth.confirmPasswordExtras.forgotInstruction')}
          </CardDescription>
          <a
            href="/auth/forgot-password"
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {t('auth.confirmPasswordExtras.resetPasswordLink')}
          </a>
        </CardContent>
      </Card>
    </QuickAuthForm>
  );
}