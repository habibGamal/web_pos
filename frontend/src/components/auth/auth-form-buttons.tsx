'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuthFormButtonsProps {
  /** Primary submit button text */
  submitText: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether submit button should be disabled */
  isDisabled?: boolean;
  /** Loading text to show when submitting */
  loadingText?: string;
  /** Show cancel/back button */
  showCancel?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Cancel button click handler */
  onCancel?: () => void;
  /** Cancel button variant */
  cancelVariant?: 'outline' | 'ghost' | 'secondary';
  /** Submit button variant */
  submitVariant?: 'default' | 'destructive' | 'secondary';
  /** Additional CSS classes */
  className?: string;
  /** Custom buttons to render instead of default */
  children?: ReactNode;
}

/**
 * Standardized button group for authentication forms
 * Provides consistent submit/cancel button patterns with loading states
 */
export function AuthFormButtons({
  submitText,
  isSubmitting = false,
  isDisabled = false,
  loadingText,
  showCancel = false,
  cancelText,
  onCancel,
  cancelVariant = 'outline',
  submitVariant = 'default',
  className = '',
  children,
}: AuthFormButtonsProps) {
  const t = useTranslations();

  if (children) {
    return <div className={`space-y-3 ${className}`}>{children}</div>;
  }

  const defaultLoadingText = loadingText || t('common.loading');
  const defaultCancelText = cancelText || t('common.cancel');

  if (showCancel) {
    return (
      <div className={`flex space-x-3 ${className}`}>
        <Button
          type="button"
          onClick={onCancel}
          variant={cancelVariant}
          className="flex-1"
          disabled={isSubmitting}
        >
          {defaultCancelText}
        </Button>
        <Button
          type="submit"
          variant={submitVariant}
          disabled={isSubmitting || isDisabled}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {defaultLoadingText}
            </>
          ) : (
            submitText
          )}
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="submit"
      variant={submitVariant}
      disabled={isSubmitting || isDisabled}
      className={`w-full ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {defaultLoadingText}
        </>
      ) : (
        submitText
      )}
    </Button>
  );
}

interface AuthLinkProps {
  href: string;
  text: string;
  className?: string;
  /** Show as arrow back link */
  isBackLink?: boolean;
}

/**
 * Standardized link component for authentication flows
 * Provides consistent styling for auth page navigation
 */
export function AuthLink({ 
  href, 
  text, 
  className = '', 
  isBackLink = false 
}: AuthLinkProps) {
  const baseClasses = "text-sm text-primary hover:text-primary/80 font-medium transition-colors";
  const backArrow = isBackLink ? "← " : "";
  
  return (
    <a 
      href={href} 
      className={`${baseClasses} ${className}`}
    >
      {backArrow}{text}
    </a>
  );
}

interface AuthFormActionsProps {
  /** Primary submit button text */
  submitText: string;
  /** Whether the form is currently submitting */
  isSubmitting?: boolean;
  /** Whether submit button should be disabled */
  isDisabled?: boolean;
  /** Loading text to show when submitting */
  loadingText?: string;
  /** Show cancel/back button */
  showCancel?: boolean;
  /** Cancel button text */
  cancelText?: string;
  /** Cancel button click handler */
  onCancel?: () => void;
  /** Links to show below buttons */
  links?: Array<{
    href: string;
    text: string;
    isBackLink?: boolean;
  }>;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Complete form actions section with buttons and links
 * Combines AuthFormButtons and AuthLink for full form footer
 */
export function AuthFormActions({
  submitText,
  isSubmitting = false,
  isDisabled = false,
  loadingText,
  showCancel = false,
  cancelText,
  onCancel,
  links = [],
  className = '',
}: AuthFormActionsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <AuthFormButtons
        submitText={submitText}
        isSubmitting={isSubmitting}
        isDisabled={isDisabled}
        loadingText={loadingText}
        showCancel={showCancel}
        cancelText={cancelText}
        onCancel={onCancel}
      />
      
      {links.length > 0 && (
        <div className="text-center space-y-2">
          {links.map((link, index) => (
            <div key={index}>
              <AuthLink
                href={link.href}
                text={link.text}
                isBackLink={link.isBackLink}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}