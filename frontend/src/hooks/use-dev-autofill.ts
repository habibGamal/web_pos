import { useCallback } from 'react';
import type { UseFormSetValue, FieldValues, Path } from 'react-hook-form';

/**
 * Configuration for autofill data generation
 */
export interface AutofillConfig {
  /** Custom data generators for specific fields */
  generators?: Record<string, () => any>;
  /** Whether to validate fields after autofill */
  shouldValidate?: boolean;
  /** Whether to mark fields as dirty after autofill */
  shouldDirty?: boolean;
  /** Whether to mark fields as touched after autofill */
  shouldTouch?: boolean;
}

/**
 * Hook for development autofill functionality
 * Only works in development environment
 */
export function useDevAutofill<TFieldValues extends FieldValues = FieldValues>(
  setValue: UseFormSetValue<TFieldValues>,
  config: AutofillConfig = {}
) {
  const {
    generators = {},
    shouldValidate = true,
    shouldDirty = true,
    shouldTouch = true,
  } = config;

  // Helper functions for fake data generation
  const randomInt = useCallback((max: number) => Math.floor(Math.random() * max), []);

  const generateName = useCallback(() => {
    const firstNames = ['Alex', 'Sam', 'Maya', 'Omar', 'Lina', 'Noah', 'Sara', 'Yusuf'];
    const lastNames = ['Smith', 'Haddad', 'Khan', 'Garcia', 'Ali', 'Nguyen', 'Hossain', 'Park'];
    return `${firstNames[randomInt(firstNames.length)]} ${lastNames[randomInt(lastNames.length)]}`;
  }, [randomInt]);

  const generateEmail = useCallback(
    (name?: string) => {
      if (name) {
        const normalized = name
          .toLowerCase()
          .replace(/\s+/g, '.')
          .replace(/[^a-z.]/g, '');
        return `${normalized}${randomInt(999)}@example.test`;
      }
      return `user${randomInt(9999)}@example.test`;
    },
    [randomInt]
  );

  const generatePassword = useCallback(() => {
    // Ensure password meets common requirements: min 8, uppercase, lowercase, number, special
    const uppers = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowers = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const specials = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const pick = (s: string) => s.charAt(randomInt(s.length));

    // Guarantee required character types
    const guaranteed = [pick(uppers), pick(lowers), pick(nums), pick(specials)];
    // Fill the rest with random characters to reach length 12
    const rest = Array.from({ length: 8 }, () => pick(uppers + lowers + nums)).join('');
    return (guaranteed.join('') + rest).slice(0, 12);
  }, [randomInt]);

  const generatePhone = useCallback(() => {
    const areaCodes = ['123', '456', '789', '555'];
    const areaCode = areaCodes[randomInt(areaCodes.length)];
    const exchange = String(randomInt(900) + 100);
    const number = String(randomInt(9000) + 1000);
    return `${areaCode}-${exchange}-${number}`;
  }, [randomInt]);

  /**
   * Default field generators
   */
  const defaultGenerators = useCallback((): Record<string, () => any> => ({
    name: generateName,
    email: () => generateEmail(),
    password: generatePassword,
    password_confirmation: generatePassword, // Will be overridden with actual password
    phone: generatePhone,
    firstName: () => generateName().split(' ')[0],
    lastName: () => generateName().split(' ')[1],
    terms: () => true,
    newsletter: () => Math.random() > 0.5,
    age: () => randomInt(50) + 18,
    ...generators,
  }), [generateName, generateEmail, generatePassword, generatePhone, generators]);

  /**
   * Autofill form with fake data
   * @param fieldMappings - Optional mapping of form fields to fill
   * @param customData - Optional custom data to use instead of generated data
   */
  const autofillForm = useCallback(
    (fieldMappings?: Record<string, keyof TFieldValues>, customData?: Partial<TFieldValues>) => {
      // Only work in development
      if (process.env.NODE_ENV !== 'development') {
        console.warn('Autofill is only available in development mode');
        return;
      }

      const fieldGenerators = defaultGenerators();
      const generatedData: Record<string, any> = {};

      // Generate base data
      if (fieldMappings) {
        Object.entries(fieldMappings).forEach(([generatorKey, fieldKey]) => {
          const generator = fieldGenerators[generatorKey];
          if (generator) {
            generatedData[fieldKey as string] = generator();
          }
        });
      } else {
        // Try to auto-match common field names
        Object.keys(fieldGenerators).forEach((key) => {
          generatedData[key] = fieldGenerators[key]();
        });
      }

      // Handle password confirmation specially
      if (generatedData.password && ('password_confirmation' in generatedData || fieldMappings?.password_confirmation)) {
        const confirmationField = fieldMappings?.password_confirmation || 'password_confirmation';
        generatedData[confirmationField as string] = generatedData.password;
      }

      // Override with custom data
      const finalData = { ...generatedData, ...customData };

      // Set form values
      Object.entries(finalData).forEach(([key, value]) => {
        setValue(key as Path<TFieldValues>, value, {
          shouldValidate,
          shouldDirty,
          shouldTouch,
        });
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('Form autofilled with:', finalData);
      }
    },
    [setValue, defaultGenerators, shouldValidate, shouldDirty, shouldTouch]
  );

  /**
   * Autofill specific field
   */
  const autofillField = useCallback(
    (fieldName: Path<TFieldValues>, generatorKey?: string) => {
      if (process.env.NODE_ENV !== 'development') return;

      const fieldGenerators = defaultGenerators();
      const generator = fieldGenerators[generatorKey || (fieldName as string)];
      
      if (generator) {
        const value = generator();
        setValue(fieldName, value, {
          shouldValidate,
          shouldDirty,
          shouldTouch,
        });
      }
    },
    [setValue, defaultGenerators, shouldValidate, shouldDirty, shouldTouch]
  );

  // Only return functions in development
  if (process.env.NODE_ENV !== 'development') {
    return {
      autofillForm: () => {},
      autofillField: () => {},
      isDevMode: false,
    };
  }

  return {
    autofillForm,
    autofillField,
    isDevMode: true,
  };
}

/**
 * Pre-configured autofill for registration forms
 */
export function useRegistrationAutofill<TFieldValues extends FieldValues = FieldValues>(
  setValue: UseFormSetValue<TFieldValues>
) {
  return useDevAutofill(setValue, {
    shouldValidate: true,
    shouldDirty: true,
    shouldTouch: true,
  });
}

/**
 * Pre-configured autofill for profile forms
 */
export function useProfileAutofill<TFieldValues extends FieldValues = FieldValues>(
  setValue: UseFormSetValue<TFieldValues>
) {
  return useDevAutofill(setValue, {
    generators: {
      // Profile-specific generators can be added here
      bio: () => 'This is a sample bio generated for testing purposes.',
      company: () => ['Acme Corp', 'Tech Solutions', 'Global Industries', 'Startup Inc.'][Math.floor(Math.random() * 4)],
    },
    shouldValidate: true,
    shouldDirty: true,
    shouldTouch: false, // Don't mark as touched for profile forms
  });
}