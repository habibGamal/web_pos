"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequireAuth } from '@/hooks/use-auth';
import { useFormServerErrorHandler } from '@/hooks/use-form-server-error-handler';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { CurrentPasswordField } from '@/components/auth/password-fields';
import { AuthFormActions } from '@/components/auth/auth-form-buttons';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ConfirmPasswordPageImproved() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, changePassword, error, clearError } = useRequireAuth();
  const { handleServerError } = useFormServerErrorHandler<ConfirmPasswordFormData>();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get('redirect') || '/dashboard';

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
      await changePassword({
        current_password: data.password,
        password: data.password,
        password_confirmation: data.password,
      });
      
      // If successful, redirect to intended destination
      router.replace(redirectTo);
      
    } catch (error) {
      handleServerError(error, form.setError);
      console.error('Password confirmation failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const formDescription = (
    <div className="space-y-2">
      <p className="text-gray-600">{t('auth.confirmPassword.subtitle')}</p>
      {user && (
        <p className="text-xs text-gray-500">
          Signed in as: <span className="font-medium">{user.email}</span>
        </p>
      )}
    </div>
  );

  return (
    <QuickAuthForm
      config={{
        icon: ShieldCheck,
        title: t('auth.confirmPassword.title'),
        description: formDescription,
      }}
      form={{
        instance: form,
        onSubmit,
        error,
      }}
      fallback={{
        title: t('auth.confirmPassword.errorBoundary.title'),
        description: t('auth.confirmPassword.errorBoundary.description'),
        buttonText: t('common.goBack'),
        buttonHref: '/dashboard',
      }}
    >
      <CurrentPasswordField
        register={form.register}
        error={form.formState.errors.password}
        label={t('auth.confirmPassword.passwordLabel')}
        placeholder={t('auth.confirmPassword.passwordPlaceholder')}
        autoFocus
      />

      <AuthFormActions
        submitText={t('auth.confirmPassword.confirmButton')}
        isSubmitting={isSubmitting}
        loadingText={t('auth.confirmPassword.confirming')}
        showCancel
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
    </QuickAuthForm>
  );
}