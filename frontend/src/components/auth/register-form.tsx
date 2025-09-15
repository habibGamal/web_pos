"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import type { RegisterInput } from '@/gql/graphql';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check } from 'lucide-react';
import { useRequireGuest } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';


export function RegisterForm() {
  const t = useTranslations();
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useRequireGuest();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  // Validation schema with translations
  const registerSchema = z.object({
    name: z.string().min(2, t('validation.required')),
    email: z.string().email(t('validation.email')),
    password: z.string()
      .min(8, t('validation.invalidPassword'))
      .regex(/[A-Z]/, t('auth.register.passwordStrength.uppercase'))
      .regex(/[a-z]/, t('auth.register.passwordStrength.lowercase'))
      .regex(/[0-9]/, t('auth.register.passwordStrength.number')),
    password_confirmation: z.string(),
    terms: z.boolean().refine(val => val === true, {
      message: t('validation.termsRequired'),
    }),
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('validation.passwordMismatch'),
    path: ["password_confirmation"],
  });

  type RegisterFormData = z.infer<typeof registerSchema>;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      terms: false,
    },
  });

  const watchPassword = watch('password');

  // Clear errors when component mounts
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
      
      // Redirect to email verification or dashboard
      router.replace('/auth/verify-email');
    } catch (error) {
      // Error is handled by the auth hook
      console.error('Registration failed:', error);
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

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t('auth.register.nameLabel')}</Label>
          <Input
            {...register('name')}
            id="name"
            type="text"
            autoComplete="name"
            placeholder={t('auth.register.namePlaceholder')}
            className={errors.name ? 'border-red-300 focus-visible:ring-red-200' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.register.emailLabel')}</Label>
          <Input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t('auth.register.emailPlaceholder')}
            className={errors.email ? 'border-red-300 focus-visible:ring-red-200' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.register.passwordLabel')}</Label>
          <Input
            {...register('password')}
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.register.passwordPlaceholder')}
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
          <Label htmlFor="password_confirmation">{t('auth.register.confirmPasswordLabel')}</Label>
          <Input
            {...register('password_confirmation')}
            id="password_confirmation"
            type="password"
            autoComplete="new-password"
            placeholder={t('auth.register.confirmPasswordPlaceholder')}
            className={errors.password_confirmation ? 'border-red-300 focus-visible:ring-red-200' : ''}
          />
          {errors.password_confirmation && (
            <p className="text-sm text-red-600">{errors.password_confirmation.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={watch('terms')}
            onCheckedChange={(checked) => setValue('terms', Boolean(checked))}
          />
          <Label htmlFor="terms" className="text-sm text-gray-900">
            {t('auth.register.termsAccept')}{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80">
              {t('auth.register.termsLink')}
            </Link>{' '}
            {t('common.and')}{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80">
              {t('auth.register.privacyLink')}
            </Link>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-sm text-red-600">{errors.terms.message}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t('auth.register.creatingAccount')}
            </>
          ) : (
            t('auth.register.createAccountButton')
          )}
        </Button>
      </form>
    </>
  );
}