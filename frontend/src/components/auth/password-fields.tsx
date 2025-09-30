'use client';

import { ReactNode, useState } from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import { PasswordStrengthIndicator } from '@/components/ui/password-strength-indicator';
import { usePasswordStrength } from '@/hooks/use-password-strength';
import { useTranslations } from 'next-intl';

interface PasswordFieldProps {
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  showStrengthIndicator?: boolean;
  showRequirementsOnFocus?: boolean;
  className?: string;
  children?: ReactNode;
  value?: string;
}

/**
 * Enhanced password field component with built-in strength indicator
 * Combines FormField with PasswordStrengthIndicator for consistent password UX
 */
export function PasswordField({
  name,
  register,
  error,
  label,
  placeholder,
  autoComplete = 'new-password',
  required = false,
  showStrengthIndicator = true,
  showRequirementsOnFocus = true,
  className = '',
  children,
  value = '',
}: PasswordFieldProps) {
  const t = useTranslations();
  const [showRequirements, setShowRequirements] = useState(false);
  const passwordStrength = usePasswordStrength(value);

  const defaultLabel = label || t('auth.password.label');
  const defaultPlaceholder = placeholder || t('auth.password.placeholder');

  return (
    <FormField
      name={name}
      label={defaultLabel}
      type="password"
      autoComplete={autoComplete}
      placeholder={defaultPlaceholder}
      register={register}
      error={error}
      required={required}
      className={className}
      onFocus={showRequirementsOnFocus ? () => setShowRequirements(true) : undefined}
      onBlur={showRequirementsOnFocus ? () => setShowRequirements(false) : undefined}
    >
      {showStrengthIndicator && value && (
        <PasswordStrengthIndicator
          password={value}
          strengthResult={passwordStrength}
          showRequirements={showRequirements || !!error}
          showStrengthBar={!!value}
        />
      )}
      {children}
    </FormField>
  );
}

interface PasswordConfirmationFieldProps {
  name?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

/**
 * Password confirmation field component
 * Standardized field for password confirmation with proper accessibility
 */
export function PasswordConfirmationField({
  name = 'password_confirmation',
  register,
  error,
  label,
  placeholder,
  required = true,
  className = '',
}: PasswordConfirmationFieldProps) {
  const t = useTranslations();

  const defaultLabel = label || t('auth.password.confirmLabel');
  const defaultPlaceholder = placeholder || t('auth.password.confirmPlaceholder');

  return (
    <FormField
      name={name}
      label={defaultLabel}
      type="password"
      autoComplete="new-password"
      placeholder={defaultPlaceholder}
      register={register}
      error={error}
      required={required}
      className={className}
    />
  );
}

interface CurrentPasswordFieldProps {
  name?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  label?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Current password field component for authentication verification
 * Optimized for password confirmation and verification flows
 */
export function CurrentPasswordField({
  name = 'current_password',
  register,
  error,
  label,
  placeholder,
  required = true,
  autoFocus = false,
  className = '',
}: CurrentPasswordFieldProps) {
  const t = useTranslations();

  const defaultLabel = label || t('auth.password.currentLabel');
  const defaultPlaceholder = placeholder || t('auth.password.currentPlaceholder');

  return (
    <FormField
      name={name}
      label={defaultLabel}
      type="password"
      autoComplete="current-password"
      placeholder={defaultPlaceholder}
      register={register}
      error={error}
      required={required}
      className={className}
      {...(autoFocus && { autoFocus: true })}
    />
  );
}