import { ExtractedError } from './error-extraction';

/**
 * Error reporting configuration
 */
export interface ErrorReportingConfig {
  /** Whether error reporting is enabled */
  enabled: boolean;
  /** Environment (development, staging, production) */
  environment: string;
  /** Application version */
  version?: string;
  /** User ID for context */
  userId?: string;
  /** Additional context to include with all reports */
  globalContext?: Record<string, any>;
}

/**
 * Error reporting service interface
 * This can be implemented with different services (Sentry, LogRocket, etc.)
 */
export interface ErrorReportingService {
  /** Report an error to the service */
  captureError(error: Error, context?: Record<string, any>): void;
  /** Report an extracted error */
  captureExtractedError(extractedError: ExtractedError, originalError?: any, context?: Record<string, any>): void;
  /** Set user context */
  setUser(user: { id: string; email?: string; name?: string }): void;
  /** Add global context */
  setContext(key: string, value: any): void;
}

/**
 * Console-based error reporting (fallback implementation)
 */
class ConsoleErrorReporting implements ErrorReportingService {
  constructor(private config: ErrorReportingConfig) {}

  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    console.error('Error Report:', {
      message: error.message,
      stack: error.stack,
      context,
      globalContext: this.config.globalContext,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      version: this.config.version,
      userId: this.config.userId,
    });
  }

  captureExtractedError(extractedError: ExtractedError, originalError?: any, context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    console.error('Extracted Error Report:', {
      extractedError,
      originalError,
      context,
      globalContext: this.config.globalContext,
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
      version: this.config.version,
      userId: this.config.userId,
    });
  }

  setUser(user: { id: string; email?: string; name?: string }): void {
    this.config.userId = user.id;
    console.log('Error reporting user context set:', user);
  }

  setContext(key: string, value: any): void {
    if (!this.config.globalContext) {
      this.config.globalContext = {};
    }
    this.config.globalContext[key] = value;
  }
}

/**
 * Error reporting manager
 */
class ErrorReporting {
  private service: ErrorReportingService;
  private config: ErrorReportingConfig;

  constructor(config: Partial<ErrorReportingConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'production',
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      ...config,
    };

    // Initialize with console service by default
    this.service = new ConsoleErrorReporting(this.config);
  }

  /**
   * Set a custom error reporting service
   */
  setService(service: ErrorReportingService): void {
    this.service = service;
  }

  /**
   * Report a raw error
   */
  captureError(error: Error, context?: Record<string, any>): void {
    this.service.captureError(error, context);
  }

  /**
   * Report an extracted error
   */
  captureExtractedError(extractedError: ExtractedError, originalError?: any, context?: Record<string, any>): void {
    this.service.captureExtractedError(extractedError, originalError, context);
  }

  /**
   * Set user context for error reporting
   */
  setUser(user: { id: string; email?: string; name?: string }): void {
    this.service.setUser(user);
  }

  /**
   * Add global context
   */
  setContext(key: string, value: any): void {
    this.service.setContext(key, value);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorReportingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Enable/disable error reporting
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
}

/**
 * Default error reporting instance
 */
export const errorReporting = new ErrorReporting();

/**
 * Convenience functions for error reporting
 */
export function reportError(error: Error, context?: Record<string, any>): void {
  errorReporting.captureError(error, context);
}

export function reportExtractedError(extractedError: ExtractedError, originalError?: any, context?: Record<string, any>): void {
  errorReporting.captureExtractedError(extractedError, originalError, context);
}

/**
 * Setup error reporting for the application
 */
export function setupErrorReporting(config: Partial<ErrorReportingConfig> = {}): void {
  errorReporting.updateConfig(config);

  // Global error handler for unhandled errors
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      errorReporting.captureError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      errorReporting.captureError(error, {
        type: 'unhandledrejection',
        reason: event.reason,
      });
    });
  }
}

/**
 * Example Sentry integration (commented out - uncomment when ready to use)
 */
/*
import * as Sentry from '@sentry/nextjs';

class SentryErrorReporting implements ErrorReportingService {
  constructor(private config: ErrorReportingConfig) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: config.environment,
      release: config.version,
      tracesSampleRate: 1.0,
    });
  }

  captureError(error: Error, context?: Record<string, any>): void {
    if (!this.config.enabled) return;
    
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }
      Sentry.captureException(error);
    });
  }

  captureExtractedError(extractedError: ExtractedError, originalError?: any, context?: Record<string, any>): void {
    if (!this.config.enabled) return;

    Sentry.withScope((scope) => {
      scope.setTag('errorType', extractedError.type);
      scope.setLevel('error');
      
      if (extractedError.field) {
        scope.setTag('field', extractedError.field);
      }
      
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value);
        });
      }

      const error = originalError instanceof Error ? originalError : new Error(extractedError.message);
      Sentry.captureException(error);
    });
  }

  setUser(user: { id: string; email?: string; name?: string }): void {
    Sentry.setUser(user);
  }

  setContext(key: string, value: any): void {
    Sentry.setContext(key, value);
  }
}

// To use Sentry, uncomment this:
// errorReporting.setService(new SentryErrorReporting(errorReporting.config));
*/