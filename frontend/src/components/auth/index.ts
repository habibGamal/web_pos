// Auth Form Components
// These components provide reusable patterns for authentication forms
// following the best practices established in the project

// Core wrapper and template components
export { AuthFormWrapper } from './auth-form-wrapper';
export { 
  AuthFormTemplate, 
  AuthFormWithHookForm, 
  QuickAuthForm 
} from './auth-form-template';

// Specialized password field components
export { 
  PasswordField, 
  PasswordConfirmationField, 
  CurrentPasswordField 
} from './password-fields';

// Form action components (buttons and links)
export { 
  AuthFormButtons, 
  AuthLink, 
  AuthFormActions 
} from './auth-form-buttons';

// Card components (re-exported for convenience)
export { 
  AuthCard, 
  AuthSuccessCard, 
  AuthErrorCard, 
  AuthStatusCard 
} from './auth-card';

// Example implementations
export { default as ResetPasswordImproved } from './examples/reset-password-improved';
export { default as ConfirmPasswordImproved } from './examples/confirm-password-improved';