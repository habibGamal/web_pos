'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import type { PasswordStrengthResult } from '@/hooks/use-password-strength';

interface PasswordStrengthIndicatorProps {
  password: string;
  strengthResult: PasswordStrengthResult;
  showRequirements?: boolean;
  showStrengthBar?: boolean;
  className?: string;
}

/**
 * Reusable password strength indicator component
 * Shows strength bar and/or requirements list
 */
export function PasswordStrengthIndicator({
  password,
  strengthResult,
  showRequirements = true,
  showStrengthBar = true,
  className = '',
}: PasswordStrengthIndicatorProps) {
  const t = useTranslations();

  if (!password) return null;

  const { strength, requirements, strengthLabel, strengthColor } = strengthResult;
  const maxStrength = requirements.length;

  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      {showStrengthBar && (
        <div className="mb-2">
          <div className="flex space-x-1">
            {Array.from({ length: maxStrength }, (_, index) => (
              <div
                key={index}
                className={`h-1 w-full rounded ${
                  index < strength
                    ? strengthColor === 'red'
                      ? 'bg-red-500'
                      : strengthColor === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {t('auth.register.passwordStrength.requirements')}{' '}
            {strengthLabel === 'weak'
              ? t('auth.register.passwordStrength.weak')
              : strengthLabel === 'medium'
                ? t('auth.register.passwordStrength.medium')
                : t('auth.register.passwordStrength.strong')}
          </p>
        </div>
      )}

      {/* Requirements List */}
      {showRequirements && (
        <Card className="p-3 bg-gray-50 border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">
            {t('auth.register.passwordStrength.requirements')}
          </p>
          <ul className="text-xs space-y-1">
            {requirements.map((requirement: any) => (
              <li
                key={requirement.id}
                className={`flex items-center ${
                  requirement.passed ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                <Check className="w-3 h-3 mr-1" />
                {t(requirement.translationKey)}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

/**
 * Simplified strength bar only component
 */
export function PasswordStrengthBar({
  password,
  strengthResult,
  className = '',
}: {
  password: string;
  strengthResult: PasswordStrengthResult;
  className?: string;
}) {
  return (
    <PasswordStrengthIndicator
      password={password}
      strengthResult={strengthResult}
      showRequirements={false}
      showStrengthBar={true}
      className={className}
    />
  );
}

/**
 * Requirements list only component
 */
export function PasswordRequirementsList({
  password,
  strengthResult,
  className = '',
}: {
  password: string;
  strengthResult: PasswordStrengthResult;
  className?: string;
}) {
  return (
    <PasswordStrengthIndicator
      password={password}
      strengthResult={strengthResult}
      showRequirements={true}
      showStrengthBar={false}
      className={className}
    />
  );
}