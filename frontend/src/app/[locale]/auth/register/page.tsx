'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { UserPlus } from 'lucide-react';
import { QuickAuthForm } from '@/components/auth/auth-form-template';
import { PasswordField, PasswordConfirmationField } from '@/components/auth/password-fields';
import { AuthFormActions } from '@/components/auth/auth-form-buttons';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';
import { FormField, CheckboxFormField } from '@/components/ui/form-field';
import { useRequireGuest } from '@/hooks/use-auth';
import { useFormServerErrorHandler } from '@/hooks/use-form-server-error-handler';
import { useRegistrationAutofill } from '@/hooks/use-dev-autofill';
import { useTranslations } from 'next-intl';
import type { RegisterInput } from '@/gql/graphql';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useRequireGuest();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form server error handling
  const { handleServerError } = useFormServerErrorHandler<RegisterFormData>();

  // Validation schema with translations
  const registerSchema = z
    .object({
      name: z.string().min(2, t('validation.required')),
      email: z.string().email(t('validation.email')),
      password: z
        .string()
        .min(8, t('validation.invalidPassword'))
        .regex(/[A-Z]/, t('auth.register.passwordStrength.uppercase'))
        .regex(/[a-z]/, t('auth.register.passwordStrength.lowercase'))
        .regex(/[0-9]/, t('auth.register.passwordStrength.number')),
      password_confirmation: z.string(),
      terms: z.boolean().refine((val) => val === true, {
        message: t('validation.termsRequired'),
      }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: t('validation.passwordMismatch'),
      path: ['password_confirmation'],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      terms: false,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
  } = form;

  const watchPassword = watch('password');

  // Development autofill
  const { autofillForm, isDevMode } = useRegistrationAutofill(setValue); // Clear errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const onSubmit = async (data: RegisterFormData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    clearError();

    try {
      const registerInput: RegisterInput = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      await registerUser(registerInput);

      // Success - redirect to email verification
      router.replace('/auth/verify-email');
    } catch (error: any) {
      // Use the extracted error handling hook
      handleServerError(error, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <QuickAuthForm
      config={{
        icon: UserPlus,
        title: t('auth.register.title'),
        description: (
          <>
            {t('common.or')}{' '}
            <Link
              href='/auth/login'
              className='font-medium text-primary hover:text-primary/80 transition-colors'
            >
              {t('auth.register.subtitle')}
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
        title: t('auth.register.errorBoundary.title'),
        description: t('auth.register.errorBoundary.description'),
        buttonText: t('auth.register.errorBoundary.retry'),
        buttonHref: '/auth/login',
      }}
    >
      {/* Social Login Options */}
      <SocialLoginButtons />

      <div className='relative'>
        <Separator className='my-4' />
        <div className='absolute inset-0 flex items-center justify-center'>
          {/* <span className="bg-white px-2 text-sm text-gray-500">{dict.auth.register.continueWith}</span> */}
        </div>
      </div>

      {/* Name Field */}
      <FormField
        name='name'
        label={t('auth.register.nameLabel')}
        type='text'
        placeholder={t('auth.register.namePlaceholder')}
        autoComplete='name'
        register={register}
        error={errors.name}
        required
      />

      {/* Email Field */}
      <FormField
        name='email'
        label={t('auth.register.emailLabel')}
        type='email'
        placeholder={t('auth.register.emailPlaceholder')}
        autoComplete='email'
        register={register}
        error={errors.email}
        required
      />

      {/* Password Field with Strength Indicator */}
      <PasswordField
        name='password'
        register={register}
        error={errors.password}
        label={t('auth.register.passwordLabel')}
        placeholder={t('auth.register.passwordPlaceholder')}
        value={watchPassword}
        showRequirementsOnFocus={true}
        required
      />

      {/* Password Confirmation Field */}
      <PasswordConfirmationField
        register={register}
        error={errors.password_confirmation}
        label={t('auth.register.confirmPasswordLabel')}
        placeholder={t('auth.register.confirmPasswordPlaceholder')}
      />

      {/* Terms Checkbox */}
      <CheckboxFormField
        name='terms'
        label={t('auth.register.termsAccept')}
        checked={watch('terms')}
        onCheckedChange={(checked) => setValue('terms', Boolean(checked))}
        error={errors.terms}
        description={
          <>
            <Link href='/terms' className='text-primary hover:text-primary/80'>
              {t('auth.register.termsLink')}
            </Link>{' '}
            {t('common.and')}{' '}
            <Link href='/privacy' className='text-primary hover:text-primary/80'>
              {t('auth.register.privacyLink')}
            </Link>
          </>
        }
      />

      {/* Development Autofill Button */}
      {isDevMode && (
        <div className='space-y-2'>
          <p className='text-xs text-gray-500'>{(window as any).pushToken}</p>
          <button
            type='button'
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50'
            onClick={() => autofillForm()}
          >
            Auto Fill Form (Dev Only)
          </button>
        </div>
      )}

      <AuthFormActions
        submitText={t('auth.register.createAccountButton')}
        isSubmitting={isSubmitting || isLoading}
        loadingText={t('auth.register.creatingAccount')}
        links={[
          {
            href: '/auth/login',
            text: t('auth.register.backToLogin'),
            isBackLink: true,
          },
        ]}
      />
    </QuickAuthForm>
  );
}
