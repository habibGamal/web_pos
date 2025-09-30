import { CombinedGraphQLErrors } from '@apollo/client/errors';

/**
 * Types for different error scenarios
 */
export interface ExtractedError {
  message: string;
  type: ErrorType;
  field?: string;
  code?: string;
  statusCode?: number;
  isValidationError: boolean;
  isNetworkError: boolean;
  isGraphQLError: boolean;
}

export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  GRAPHQL = 'graphql',
  UNKNOWN = 'unknown',
}

/**
 * Configuration for error extraction
 */
export interface ErrorExtractionConfig {
  /** Default message when no specific error can be extracted */
  defaultMessage?: string;
  /** Whether to include debug logging */
  debug?: boolean;
  /** Custom field name transformations */
  fieldTransforms?: Record<string, string>;
  /** Whether to clean technical prefixes from messages */
  cleanMessages?: boolean;
}

const DEFAULT_CONFIG: Required<ErrorExtractionConfig> = {
  defaultMessage: 'An error occurred',
  debug: process.env.NODE_ENV === 'development',
  fieldTransforms: {},
  cleanMessages: true,
};

/**
 * Extracts user-friendly error information from various error types
 * Supports Apollo GraphQL errors, network errors, and validation errors
 */
export class ErrorExtractor {
  private config: Required<ErrorExtractionConfig>;

  constructor(config: ErrorExtractionConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main method to extract error information
   */
  extract(error: any): ExtractedError {
    if (this.config.debug) {
      console.error('Error extraction debug:', {
        error,
        isCombinedGraphQLErrors: CombinedGraphQLErrors.is(error),
        hasGraphQLErrors: !!error.graphQLErrors,
        hasNetworkError: !!error.networkError,
        errorKeys: Object.keys(error || {}),
      });
    }

    // Check Apollo Client 4 CombinedGraphQLErrors first
    if (CombinedGraphQLErrors.is(error)) {
      return this.extractFromCombinedGraphQLErrors(error);
    }

    // Check legacy Apollo Client GraphQL errors
    if (error.graphQLErrors?.length > 0) {
      return this.extractFromLegacyGraphQLErrors(error);
    }

    // Check network errors
    if (error.networkError) {
      return this.extractFromNetworkError(error);
    }

    // Fallback to generic error
    return this.extractFromGenericError(error);
  }

  /**
   * Extract from Apollo Client 4 CombinedGraphQLErrors
   */
  private extractFromCombinedGraphQLErrors(error: any): ExtractedError {
    const graphQLError = error.errors[0];
    return this.processGraphQLError(graphQLError);
  }

  /**
   * Extract from legacy Apollo Client graphQLErrors array
   */
  private extractFromLegacyGraphQLErrors(error: any): ExtractedError {
    const graphQLError = error.graphQLErrors[0];
    return this.processGraphQLError(graphQLError);
  }

  /**
   * Process individual GraphQL error
   */
  private processGraphQLError(graphQLError: any): ExtractedError {
    console.debug('Processing GraphQL error:', graphQLError);
    // Check for Lighthouse validation errors in extensions
    if (graphQLError.extensions?.validation) {
      return this.extractValidationErrors(graphQLError.extensions.validation);
    }

    // Check for authentication errors
    if (this.isAuthenticationError(graphQLError)) {
      return {
        message: 'You need to log in to access this resource',
        type: ErrorType.AUTHENTICATION,
        code: graphQLError.extensions?.code,
        isValidationError: false,
        isNetworkError: false,
        isGraphQLError: true,
      };
    }

    // Check for authorization errors
    if (this.isAuthorizationError(graphQLError)) {
      return {
        message: 'You do not have permission to perform this action',
        type: ErrorType.AUTHORIZATION,
        code: graphQLError.extensions?.code,
        isValidationError: false,
        isNetworkError: false,
        isGraphQLError: true,
      };
    }

    // Regular GraphQL error
    return {
      message: this.cleanMessage(graphQLError.message),
      type: ErrorType.GRAPHQL,
      code: graphQLError.extensions?.code,
      isValidationError: false,
      isNetworkError: false,
      isGraphQLError: true,
    };
  }

  /**
   * Extract validation errors from Lighthouse validation extensions
   */
  private extractValidationErrors(validation: any): ExtractedError {
    const validationErrors = validation as Record<string, string[]>;
    const firstField = Object.keys(validationErrors)[0];
    const fieldErrors = validationErrors[firstField];

    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
      const cleanFieldName = this.cleanFieldName(firstField);
      const fieldError = fieldErrors[0];
      const cleanMessage = this.cleanMessage(fieldError, cleanFieldName);

      return {
        message: cleanMessage,
        type: ErrorType.VALIDATION,
        field: cleanFieldName,
        isValidationError: true,
        isNetworkError: false,
        isGraphQLError: true,
      };
    }

    return {
      message: 'Please check your input and try again',
      type: ErrorType.VALIDATION,
      isValidationError: true,
      isNetworkError: false,
      isGraphQLError: true,
    };
  }

  /**
   * Extract from network errors
   */
  private extractFromNetworkError(error: any): ExtractedError {
    const networkError = error.networkError;
    const statusCode = networkError.statusCode;

    // Handle validation errors from network response (422)
    if (statusCode === 422) {
      const validationErrors = networkError.result?.errors as Record<string, string[]>;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const firstField = Object.keys(validationErrors)[0];
        const message = validationErrors[firstField][0];
        return {
          message: this.cleanMessage(message, firstField),
          type: ErrorType.VALIDATION,
          field: firstField,
          statusCode,
          isValidationError: true,
          isNetworkError: true,
          isGraphQLError: false,
        };
      }
      return {
        message: 'Please check your input and try again',
        type: ErrorType.VALIDATION,
        statusCode,
        isValidationError: true,
        isNetworkError: true,
        isGraphQLError: false,
      };
    }

    // Handle server errors (5xx)
    if (statusCode >= 500) {
      return {
        message: 'Server error. Please try again later',
        type: ErrorType.SERVER,
        statusCode,
        isValidationError: false,
        isNetworkError: true,
        isGraphQLError: false,
      };
    }

    // Handle authentication errors (401)
    if (statusCode === 401) {
      return {
        message: 'You need to log in to access this resource',
        type: ErrorType.AUTHENTICATION,
        statusCode,
        isValidationError: false,
        isNetworkError: true,
        isGraphQLError: false,
      };
    }

    // Handle authorization errors (403)
    if (statusCode === 403) {
      return {
        message: 'You do not have permission to perform this action',
        type: ErrorType.AUTHORIZATION,
        statusCode,
        isValidationError: false,
        isNetworkError: true,
        isGraphQLError: false,
      };
    }

    // Generic network error
    return {
      message: networkError.message || 'Network error occurred',
      type: ErrorType.NETWORK,
      statusCode,
      isValidationError: false,
      isNetworkError: true,
      isGraphQLError: false,
    };
  }

  /**
   * Extract from generic errors
   */
  private extractFromGenericError(error: any): ExtractedError {
    return {
      message: error?.message || this.config.defaultMessage,
      type: ErrorType.UNKNOWN,
      isValidationError: false,
      isNetworkError: false,
      isGraphQLError: false,
    };
  }

  /**
   * Check if error is authentication related
   */
  private isAuthenticationError(graphQLError: any): boolean {
    return (
      graphQLError.extensions?.code === 'UNAUTHENTICATED' ||
      graphQLError.message.includes('Unauthenticated') ||
      graphQLError.message.includes('authentication')
    );
  }

  /**
   * Check if error is authorization related
   */
  private isAuthorizationError(graphQLError: any): boolean {
    return (
      graphQLError.extensions?.code === 'FORBIDDEN' ||
      graphQLError.extensions?.code === 'UNAUTHORIZED' ||
      graphQLError.message.includes('Forbidden') ||
      graphQLError.message.includes('permission')
    );
  }

  /**
   * Clean field names by removing technical prefixes
   */
  private cleanFieldName(fieldName: string): string {
    // Apply custom field transforms first
    if (this.config.fieldTransforms[fieldName]) {
      return this.config.fieldTransforms[fieldName];
    }

    // Remove common prefixes
    return fieldName
      .replace(/^input\./, '')
      .replace(/_/g, ' ')
      .toLowerCase();
  }

  /**
   * Clean error messages by removing technical prefixes and improving readability
   */
  private cleanMessage(message: string, fieldName?: string): string {
    if (!this.config.cleanMessages) {
      return message;
    }

    let cleanedMessage = message
      // Remove 'input.' prefixes
      .replace(/input\./g, '')
      // Replace generic 'This field' with specific field name
      .replace(/This field/, fieldName ? `The ${fieldName} field` : 'This field')
      // Capitalize first letter
      .replace(/^./, (str) => str.toUpperCase());

    return cleanedMessage;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorExtractionConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Default error extractor instance
 */
export const errorExtractor = new ErrorExtractor();

/**
 * Convenience function for quick error extraction
 */
export function extractError(error: any, config?: ErrorExtractionConfig): ExtractedError {
  if (config) {
    const extractor = new ErrorExtractor(config);
    return extractor.extract(error);
  }
  return errorExtractor.extract(error);
}

/**
 * Hook for using error extraction in React components
 */
export function useErrorExtraction(config?: ErrorExtractionConfig) {
  const extractor = new ErrorExtractor(config);
  
  return {
    extractError: (error: any) => extractor.extract(error),
    updateConfig: (newConfig: Partial<ErrorExtractionConfig>) => extractor.updateConfig(newConfig),
  };
}