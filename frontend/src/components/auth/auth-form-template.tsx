'use client';

import { ReactNode } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { AuthCard, AuthStatusCard } from '@/components/auth/auth-card';
import { AuthFormWrapper } from '@/components/auth/auth-form-wrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LucideIcon } from 'lucide-react';

interface BaseAuthFormProps {
  /** Form icon */
  icon: LucideIcon;
  /** Form title */
  title: string;
  /** Form description */
  description?: ReactNode;
  /** Form submit handler */
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Form children (fields and buttons) */
  children: ReactNode;
  /** Error message to display */
  error?: string | null;
  /** Whether this is a status form (success/error state) */
  isStatusForm?: boolean;
  /** Status type for status forms */
  status?: 'default' | 'success' | 'error';
  /** Additional CSS classes */
  className?: string;
  /** Error boundary fallback props */
  fallback?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonHref?: string;
  };
}

/**
 * Complete authentication form template with error boundary and consistent structure
 * Handles both regular forms and status display forms
 */
export function AuthFormTemplate({
  icon,
  title,
  description,
  onSubmit,
  children,
  error,
  isStatusForm = false,
  status = 'default',
  className = '',
  fallback,
}: BaseAuthFormProps) {
  const CardComponent = isStatusForm ? AuthStatusCard : AuthCard;

  return (
    <AuthFormWrapper
      fallbackTitle={fallback?.title}
      fallbackDescription={fallback?.description}
      fallbackButtonText={fallback?.buttonText}
      fallbackButtonHref={fallback?.buttonHref}
      className={className}
    >
      <CardComponent
        icon={icon}
        title={title}
        description={description}
        {...(isStatusForm && { status })}
      >
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isStatusForm ? (
          children
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {children}
          </form>
        )}
      </CardComponent>
    </AuthFormWrapper>
  );
}

interface AuthFormTemplateProps extends Omit<BaseAuthFormProps, 'onSubmit'> {
  /** React Hook Form instance */
  form: UseFormReturn<any>;
  /** Form submit handler that receives form data */
  onSubmit: (data: any) => void | Promise<void>;
}

/**
 * Authentication form template with React Hook Form integration
 * Provides automatic form submission handling with validation
 */
export function AuthFormWithHookForm({
  form,
  onSubmit,
  ...props
}: AuthFormTemplateProps) {
  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <AuthFormTemplate
      {...props}
      onSubmit={handleSubmit}
    />
  );
}

interface QuickAuthFormProps {
  /** Form configuration */
  config: {
    icon: LucideIcon;
    title: string;
    description?: ReactNode;
    isStatusForm?: boolean;
    status?: 'default' | 'success' | 'error';
  };
  /** Form instance and handlers */
  form: {
    instance: UseFormReturn<any>;
    onSubmit: (data: any) => void | Promise<void>;
    error?: string | null;
  };
  /** Form content */
  children: ReactNode;
  /** Error boundary fallback configuration */
  fallback?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonHref?: string;
  };
  /** Additional CSS classes */
  className?: string;
}

/**
 * Quick authentication form setup with minimal configuration
 * Perfect for rapid form development with all best practices included
 */
export function QuickAuthForm({
  config,
  form,
  children,
  fallback,
  className = '',
}: QuickAuthFormProps) {
  return (
    <AuthFormWithHookForm
      icon={config.icon}
      title={config.title}
      description={config.description}
      isStatusForm={config.isStatusForm}
      status={config.status}
      form={form.instance}
      onSubmit={form.onSubmit}
      error={form.error}
      fallback={fallback}
      className={className}
    >
      {children}
    </AuthFormWithHookForm>
  );
}