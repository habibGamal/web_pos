import { useMemo } from 'react';

export interface PasswordRequirement {
  id: string;
  test: (password: string) => boolean;
  translationKey: string;
}

export interface PasswordStrengthResult {
  strength: number;
  requirements: PasswordRequirement[];
  isValid: boolean;
  strengthLabel: 'weak' | 'medium' | 'strong';
  strengthColor: 'red' | 'yellow' | 'green';
}

/**
 * Hook for calculating password strength and requirements validation
 * Can be customized with different requirements for different use cases
 */
export function usePasswordStrength(
  password: string = '',
  customRequirements?: PasswordRequirement[]
): PasswordStrengthResult {
  const defaultRequirements: PasswordRequirement[] = [
    {
      id: 'minLength',
      test: (pwd) => pwd.length >= 8,
      translationKey: 'auth.register.passwordStrength.minLength',
    },
    {
      id: 'uppercase',
      test: (pwd) => /[A-Z]/.test(pwd),
      translationKey: 'auth.register.passwordStrength.uppercase',
    },
    {
      id: 'lowercase',
      test: (pwd) => /[a-z]/.test(pwd),
      translationKey: 'auth.register.passwordStrength.lowercase',
    },
    {
      id: 'number',
      test: (pwd) => /[0-9]/.test(pwd),
      translationKey: 'auth.register.passwordStrength.number',
    },
    {
      id: 'special',
      test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
      translationKey: 'auth.register.passwordStrength.special',
    },
  ];

  const requirements = customRequirements || defaultRequirements;

  const result = useMemo((): PasswordStrengthResult => {
    // Calculate how many requirements are met
    const metRequirements = requirements.filter((req) => req.test(password));
    const strength = metRequirements.length;
    const maxStrength = requirements.length;

    // Determine strength label and color
    let strengthLabel: 'weak' | 'medium' | 'strong';
    let strengthColor: 'red' | 'yellow' | 'green';

    if (strength <= Math.floor(maxStrength * 0.4)) {
      strengthLabel = 'weak';
      strengthColor = 'red';
    } else if (strength <= Math.floor(maxStrength * 0.7)) {
      strengthLabel = 'medium';
      strengthColor = 'yellow';
    } else {
      strengthLabel = 'strong';
      strengthColor = 'green';
    }

    // Password is valid if all requirements are met
    const isValid = strength === maxStrength;

    return {
      strength,
      requirements: requirements.map((req) => ({
        ...req,
        passed: req.test(password),
      })) as any,
      isValid,
      strengthLabel,
      strengthColor,
    };
  }, [password, requirements]);

  return result;
}

/**
 * Simple password strength calculation without requirements
 * Useful for basic strength meters
 */
export function useSimplePasswordStrength(password: string = '') {
  return useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  }, [password]);
}