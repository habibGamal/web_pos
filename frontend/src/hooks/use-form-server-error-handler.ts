import { useCallback } from 'react';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { extractError } from '@/lib/error-extraction';

/**
 * Hook for handling server errors in forms
 * Provides a simple way to extract server errors and map them to form fields
 */
export function useFormServerErrorHandler<TFieldValues extends FieldValues = FieldValues>() {
  /**
   * Handle server errors and map validation errors to form fields
   * @param error - The error object from the server/GraphQL
   * @param setError - React Hook Form's setError function
   * @param onGenericError - Optional callback for handling non-validation errors
   */
  const handleServerError = useCallback(
    (
      error: any,
      setError: UseFormSetError<TFieldValues>,
      onGenericError?: (error: { message: string; type: string }) => void
    ) => {
      const extractedError = extractError(error);

      if (extractedError.isValidationError && extractedError.field) {
        // Map server validation errors to form fields
        const fieldName = extractedError.field as Path<TFieldValues>;
        setError(fieldName, {
          type: 'server',
          message: extractedError.message,
        });
      } else if (onGenericError) {
        // Handle non-validation errors (network, server, etc.)
        onGenericError({
          message: extractedError.message,
          type: extractedError.type,
        });
      }

      // Log for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Form error handled:', {
          originalError: error,
          extractedError,
          isValidationError: extractedError.isValidationError,
          field: extractedError.field,
        });
      }
    },
    []
  );

  return {
    handleServerError,
  };
}
