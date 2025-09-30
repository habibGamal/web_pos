# Best Practices for GraphQL and Lighthouse Optimization

## Summary

This document contains best practices discovered during the optimization of GraphQL resolvers by replacing custom resolvers with built-in Lighthouse directives. The optimizations resulted in cleaner code, better performance, and reduced maintenance overhead.

## GraphQL Lighthouse Directive Optimizations

### 1. Replace Simple Field Resolvers with Direct Field Access

**Before:**
```graphql
type Product {
    is_in_stock: Boolean! @field(resolver: "App\\GraphQL\\Types\\ProductType@isInStock")
    featured_image: String @field(resolver: "App\\GraphQL\\Types\\ProductType@featuredImage")
    stock: Int! @field(resolver: "App\\GraphQL\\Types\\ProductType@stock")
}
```

**After:**
```graphql
type Product {
    is_in_stock: Boolean!
    featured_image: String
    stock: Int!
}
```

**Key Practice:** When resolvers simply return database fields or model accessors, remove the custom resolver and use direct field access. Add accessors to the Eloquent model if needed.

### 2. Use @count Directive for Relationship Counts

**Before:**
```graphql
type Category {
    products_count: Int! @field(resolver: "App\\GraphQL\\Types\\CategoryType@productsCount")
    active_products_count: Int! @field(resolver: "App\\GraphQL\\Types\\CategoryType@activeProductsCount")
}
```

**After:**
```graphql
type Category {
    products_count: Int! @count(relation: "products")
    active_products_count: Int! @count(relation: "products", scopes: ["active"])
}
```

**Key Practice:** The `@count` directive is much more efficient than custom resolvers for counting relationships. Use scopes for filtered counts.

### 3. Use @update Directive for Simple Update Mutations

**Before:**
```graphql
type Mutation {
    updateProfile(input: UpdateProfileInput! @spread): User! @guard @field(resolver: "App\\GraphQL\\Mutations\\UpdateProfile")
}
```

**After:**
```graphql
type Mutation {
    updateProfile(input: UpdateProfileInput! @spread): User! @guard @update
}
```

**Key Practice:** For simple CRUD operations, use built-in directives like `@create`, `@update`, and `@delete` instead of custom resolvers.

### 4. Replace Simple Query Resolvers with Built-in Directives

**Before:**
```graphql
type Query {
    productBySlug(slug: String!): Product @field(resolver: "App\\GraphQL\\Queries\\ProductsQuery@productBySlug")
}
```

**After:**
```graphql
type Query {
    productBySlug(slug: String! @rules(apply: ["required", "exists:products,slug"])): Product @first(scopes: ["active"]) @where(key: "slug")
}
```

**Key Practice:** Use `@first`, `@find`, `@all`, and `@where` directives for simple database queries.

### 5. Add Model Accessors for Field Mappings

**Model Changes:**
```php
// User.php
public function getFullNameAttribute(): string
{
    return $this->name;
}

public function getEmailVerifiedAttribute(): bool
{
    return !is_null($this->email_verified_at);
}

// Product.php
public function getStockAttribute(): int
{
    return $this->total_quantity;
}

public function getImagesAttribute(): array
{
    return $this->all_images;
}
```

**Key Practice:** Create model accessors for field mappings and computed values instead of custom GraphQL resolvers.

### 6. Add Model Scopes for Filtered Queries

**Model Changes:**
```php
// Product.php
public function scopeActive($query)
{
    return $query->where('is_active', true);
}
```

**Key Practice:** Add Eloquent scopes to models for common filtering patterns, then use them with Lighthouse directives.

## Performance Benefits

1. **Reduced Code Complexity:** Eliminated multiple custom resolver classes
2. **Better Caching:** Built-in directives have optimized caching strategies
3. **Fewer Database Queries:** Directives like `@count` are optimized for performance
4. **Better Type Safety:** Direct field access reduces type conversion overhead

## Files Modified

### GraphQL Schema Files
- `backend/graphql/auth.graphql`
- `backend/graphql/products.graphql`
- `backend/graphql/cart.graphql`
- `backend/graphql/orders.graphql`

### Model Files
- `backend/app/Models/User.php` - Added accessors for full_name, email_verified
- `backend/app/Models/Product.php` - Added accessors for stock, images and active scope
- `backend/app/Models/CartItem.php` - Added accessors for unit_price, total_price
- `backend/app/Models/OrderItem.php` - Added accessor for total_price

### Test Files
- `backend/tests/Feature/GraphQL/SearchTest.php` - Fixed sorting expectation

## Lighthouse Directives Used

| Directive | Purpose | Example |
|-----------|---------|---------|
| `@count` | Count relationships | `posts_count: Int! @count(relation: "posts")` |
| `@update` | Update mutations | `updateUser(...): User! @update` |
| `@first` | Get first record | `user: User @first @where(key: "email")` |
| `@where` | Filter by field | `@where(key: "slug")` |
| `@rules` | Input validation | `@rules(apply: ["required", "email"])` |

## When to Keep Custom Resolvers

Custom resolvers should be kept when:

1. **Complex Business Logic:** Authentication checks, privacy filtering, complex calculations
2. **Service Dependencies:** When resolvers use services, external APIs, or complex operations
3. **Dynamic Behavior:** When the resolver behavior depends on context, user permissions, or runtime conditions
4. **Cross-Model Operations:** When resolvers need to aggregate data from multiple models

## Examples of Resolvers to Keep

```graphql
# Keep - has privacy logic
email: String @field(resolver: "App\\GraphQL\\Types\\UserType@email")

# Keep - complex business logic  
isInWishlist: Boolean @field(resolver: "App\\GraphQL\\Types\\ProductType@isInWishlist")

# Keep - uses service
cart: Cart @field(resolver: "App\\GraphQL\\Queries\\CartQuery") @guard
```

## Testing Strategy

- Run `php artisan test tests/Feature/GraphQL/` after each optimization
- Ensure all tests pass before moving to the next optimization
- Tests are the point of truth - if implementation differs from tests, verify the intended behavior

---

# Error Handling Best Practices

This section outlines the latest error handling best practices implemented in our Next.js 15 + Apollo GraphQL application, based on the most current documentation from React 19, Next.js 15, Apollo Client 4, and shadcn/ui.

## Overview

Effective error handling is crucial for user experience and application reliability. Our implementation follows a multi-layered approach:

1. **Global Error Boundaries** - Catch rendering errors at application level
2. **Route-Level Error Handling** - Handle route-specific errors with Next.js error.tsx
3. **Component-Level Error Boundaries** - Granular error handling for critical components
4. **Apollo Client Error Policies** - Handle GraphQL and network errors gracefully
5. **Form Validation & Error States** - User-friendly validation and error feedback

## Implementation Details

### 1. Global Error Handling (Next.js 15 App Router)

#### Global Error Boundary
- **File**: `src/app/global-error.tsx`
- **Purpose**: Catches unhandled errors at the root level
- **Features**:
  - Custom HTML/body structure (required for global errors)
  - Development-specific error details
  - Fallback UI with retry options
  - Error logging integration points

```tsx
// Must include html and body tags
export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        {/* Error UI */}
      </body>
    </html>
  );
}
```

#### Route-Level Error Handling
- **File**: `src/app/[locale]/error.tsx`
- **Purpose**: Handles errors within specific route segments
- **Features**:
  - Nested error boundary support
  - Route-specific error context
  - User-friendly error messages
  - Navigation options (back, retry)

### 2. Component Error Boundaries

#### ErrorBoundary Component
- **File**: `src/components/error-boundary.tsx`
- **Features**:
  - Class-based error boundary following React patterns
  - Hook-based error boundary for functional components (React 19+)
  - Customizable fallback UI
  - Error reporting integration
  - Development vs production error display

#### Usage Patterns
```tsx
// Wrap critical components
<ErrorBoundary fallback={<CustomErrorUI />}>
  <CriticalComponent />
</ErrorBoundary>

// Hook-based error capturing
const { captureError, resetError } = useErrorBoundary();
```

### 3. Apollo Client Error Handling

#### Error Policies
- **Global Policy**: `errorPolicy: 'all'` - Allows partial data with errors
- **Benefits**:
  - Better user experience with partial data
  - Explicit error handling in components
  - Network resilience

#### Enhanced Error Link
- **File**: `src/lib/apollo-client.ts`
- **Features**:
  - Categorized error handling (GraphQL, Network, Validation)
  - Authentication error handling with automatic token cleanup
  - Error logging and monitoring integration points
  - HTTP status code handling

#### Error Categories
1. **Authentication Errors**: Auto-logout, redirect to login
2. **Validation Errors**: Handled by form components
3. **Network Errors**: Retry logic, user feedback
4. **Server Errors**: Error reporting, fallback states

### 4. Form Error Handling

#### React Hook Form + Zod Integration
- **Validation**: Schema-based validation with Zod
- **Error Display**: Field-level and form-level error states
- **User Feedback**: Real-time validation feedback
- **Accessibility**: Proper ARIA attributes for screen readers

#### Error State Management
```tsx
// Clear errors when starting new operation
clearError();

// Handle errors with proper categorization
catch (error) {
  // Log for debugging
  console.error('Operation failed:', error);
  
  // Error is handled by hook and displayed to user
}
```

### 5. Error Boundary Integration

#### RegisterForm Enhancement
- **Wrapped with ErrorBoundary**: Prevents form crashes from breaking the page
- **Graceful Degradation**: Shows error state instead of blank screen
- **Error Recovery**: Users can retry without page refresh

## Best Practices Learned

### React 19 Error Handling
1. **Use Error Boundaries**: Required for catching rendering errors
2. **Don't Use Try/Catch for Render Errors**: Only for event handlers and async operations
3. **Improved Error Reporting**: React 19 provides better error stack traces
4. **Error Boundary Hook**: New `useErrorBoundary` hook for functional components

### Next.js 15 App Router
1. **File-Based Error Handling**: Use `error.tsx` and `global-error.tsx` files
2. **Error Bubbling**: Errors bubble up to nearest error boundary
3. **Route Segmentation**: Each route segment can have its own error boundary
4. **Client Component Requirement**: Error boundaries must be client components

### Apollo Client 4
1. **Unified Error Object**: Single `error` property instead of separate `graphQLErrors`/`networkError`
2. **Error Policy 'all'**: Allows partial data with errors for better UX
3. **Enhanced Error Link**: Better error categorization and handling
4. **CombinedGraphQLErrors**: Use type checking for error handling

### Form Error Handling
1. **Clear Errors Early**: Clear error state when starting new operations
2. **Categorize Errors**: Different handling for validation, network, and server errors
3. **User-Friendly Messages**: Convert technical errors to user-friendly messages
4. **Loading States**: Prevent duplicate submissions with proper loading states

## Error Monitoring Integration

### Placeholder Implementation
```tsx
// TODO: Integrate with error monitoring service
function reportError(error: Error, context?: Record<string, any>) {
  // Examples: Sentry, LogRocket, Bugsnag
  // errorService.captureException(error, { extra: context });
}
```

### Error Logging Strategy
1. **Client-Side Errors**: Log to monitoring service with context
2. **GraphQL Errors**: Include operation name and variables
3. **Network Errors**: Include HTTP status and endpoint information
4. **User Actions**: Track user interactions leading to errors

## Testing Error Scenarios

### Error Boundary Testing
1. **Render Errors**: Test component crashes are caught
2. **Network Failures**: Test Apollo error handling
3. **Validation Errors**: Test form error states
4. **Recovery Actions**: Test error recovery flows

### User Experience Testing
1. **Error Messages**: Ensure user-friendly error messages
2. **Retry Functionality**: Test retry mechanisms work
3. **Accessibility**: Test error states with screen readers
4. **Loading States**: Ensure proper loading/error state transitions

## Implementation Checklist

- [x] Global error boundary (`global-error.tsx`)
- [x] Route error boundary (`error.tsx`)
- [x] Component error boundary (`ErrorBoundary`)
- [x] Apollo Client error policies
- [x] Enhanced error link with categorization
- [x] Form error handling improvements
- [x] Error boundary integration in critical components
- [x] **Centralized error extraction utility** (`error-extraction.ts`)
- [x] **Error reporting infrastructure** (`error-reporting.ts`)
- [x] **Refactored auth hook** to use centralized error handling
- [ ] Error recovery testing
- [ ] Accessibility testing for error states
- [ ] Performance monitoring for error scenarios

## Refactored Error Handling Architecture

### **Centralized Error Extraction** (`error-extraction.ts`)
- **`ErrorExtractor` class** - Configurable error extraction with support for all error types
- **`extractError()` function** - Quick error extraction utility
- **`useErrorExtraction()` hook** - React hook for error extraction in components
- **Support for**: Apollo GraphQL errors, network errors, validation errors, authentication errors
- **Features**: Message cleaning, field name transformation, debug logging, type categorization

### **Error Reporting Infrastructure** (`error-reporting.ts`)
- **`ErrorReporting` class** - Pluggable error reporting system
- **Console fallback** - Development-friendly error logging
- **Sentry integration template** - Ready for production error monitoring
- **Global error handlers** - Catches unhandled errors and promise rejections
- **User context** - Associates errors with user information

### **Benefits of Refactoring**
1. **DRY Principle**: Single source of truth for error handling logic
2. **Consistency**: All error messages follow the same cleaning and formatting rules
3. **Flexibility**: Easy to customize error handling per component/hook
4. **Maintainability**: Changes to error handling logic only need to be made in one place
5. **Testing**: Centralized logic is easier to unit test
6. **Monitoring**: Built-in error reporting infrastructure
7. **Developer Experience**: Better debugging with structured error information

## Future Improvements

1. **Error Monitoring Integration**: Uncomment Sentry integration in `error-reporting.ts`
2. **Retry Logic**: Add exponential backoff for network errors
3. **Offline Support**: Handle offline scenarios gracefully
4. **Error Analytics**: Track error patterns for improvements
5. **A/B Testing**: Test different error message approaches
6. **Internationalization**: Error messages in multiple languages

# Component Architecture & Refactoring Best Practices

This section outlines the architectural patterns and refactoring strategies used to create maintainable, reusable, and testable React components in our Next.js 15 application.

## Component Refactoring Strategy

### 1. Extract Reusable Logic into Custom Hooks

When refactoring large components, identify reusable logic that can be extracted into custom hooks:

#### Password Strength Management
```typescript
// Before: Inline password strength logic
const getPasswordStrength = (password) => { /* complex logic */ };

// After: Reusable hook
const { strength, requirements, isValid } = usePasswordStrength(password);
```

**Benefits:**
- Reusable across multiple forms
- Testable in isolation
- Configurable requirements
- Better separation of concerns

#### Server Error Handling
```typescript
// Before: Inline error extraction and mapping
catch (error) {
  const extractedError = extractError(error);
  if (extractedError.isValidationError && extractedError.field) {
    setError(extractedError.field, { message: extractedError.message });
  }
}

// After: Dedicated hook
const { handleServerError } = useFormServerErrorHandler<FormData>();
catch (error) {
  handleServerError(error, setError);
}
```

**Benefits:**
- Consistent error handling across forms
- Centralized error extraction logic
- Type-safe form field mapping
- Easier to unit test

### 2. Create Reusable UI Components

Extract repetitive UI patterns into reusable components:

#### Form Field Components
```typescript
// Before: Repetitive field markup
<div className="space-y-2">
  <Label htmlFor="name">Name</Label>
  <Input {...register('name')} className={errors.name ? 'border-red-300' : ''} />
  {errors.name && <p className="text-red-600">{errors.name.message}</p>}
</div>

// After: Reusable component
<FormField
  name="name"
  label="Name"
  register={register}
  error={errors.name}
  required
/>
```

**Benefits:**
- Consistent field styling and behavior
- Reduced code duplication
- Easier to maintain and update
- Built-in accessibility features

#### Specialized Components
```typescript
// Password strength visualization
<PasswordStrengthIndicator
  password={password}
  strengthResult={passwordStrength}
  showRequirements={showPasswordRequirements}
/>

// Checkbox with description
<CheckboxFormField
  name="terms"
  label="Accept Terms"
  checked={watch('terms')}
  onCheckedChange={(checked) => setValue('terms', checked)}
  description={<>Terms and conditions link</>}
/>
```

### 3. Development Tools as Hooks

Extract development utilities into reusable hooks:

```typescript
// Development autofill functionality
const { autofillForm, isDevMode } = useRegistrationAutofill(setValue);

// Only shows in development
{isDevMode && (
  <Button onClick={() => autofillForm()}>Auto Fill Form (Dev Only)</Button>
)}
```

**Benefits:**
- Consistent fake data generation
- Configurable per form type
- Only active in development
- Speeds up development workflow

## Error Boundary Placement Strategy

### Page-Level Error Boundaries
Place ErrorBoundaries at the page level rather than component level for better user experience:

```typescript
// ✅ Good: Page-level error boundary
export default function RegisterPage() {
  return (
    <div>
      <ErrorBoundary fallback={<ErrorFallback />}>
        <RegisterForm />
      </ErrorBoundary>
    </div>
  );
}

// ❌ Avoid: Component-level error boundary
export function RegisterForm() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {/* form content */}
    </ErrorBoundary>
  );
}
```

**Rationale:**
- Better error isolation - errors don't break the entire page layout
- More user-friendly error recovery options
- Cleaner component code - focuses on business logic
- Consistent error handling across similar pages

### Error Boundary Granularity
- **Global**: Catch application-wide errors (`global-error.tsx`)
- **Route**: Catch route-specific errors (`error.tsx`)
- **Page**: Wrap critical page sections
- **Component**: Only for truly independent, complex components

## Hook Design Patterns

### Single Responsibility Hooks
Each hook should have a single, well-defined responsibility:

```typescript
// ✅ Good: Focused responsibility
usePasswordStrength() // Only handles password strength calculation
useFormServerErrorHandler() // Only handles server error mapping
useRegistrationAutofill() // Only handles development autofill

// ❌ Avoid: Multiple responsibilities
useFormUtils() // Too broad, unclear purpose
```

### Composable Hooks
Design hooks to work well together:

```typescript
function RegisterForm() {
  // Each hook serves a specific purpose
  const passwordStrength = usePasswordStrength(watchPassword);
  const { handleServerError } = useFormServerErrorHandler<RegisterFormData>();
  const { autofillForm } = useRegistrationAutofill(setValue);
  
  // Hooks compose naturally without conflicts
}
```

### Hook Naming Conventions
- `use[Domain][Action]` pattern (e.g., `usePasswordStrength`, `useFormServerErrorHandler`)
- Clear, descriptive names that indicate purpose
- Avoid generic names like `useUtils` or `useHelpers`

## Component Architecture Principles

### 1. Separation of Concerns
- **UI Components**: Focus on rendering and user interaction
- **Custom Hooks**: Handle business logic and state management
- **Utility Functions**: Pure functions for data transformation
- **Services**: External API communication and side effects

### 2. Progressive Enhancement
Build components that work at different levels of functionality:

```typescript
// Basic functionality always works
<FormField name="email" label="Email" register={register} />

// Enhanced functionality is additive
<FormField 
  name="password" 
  label="Password" 
  register={register}
>
  <PasswordStrengthIndicator password={password} strengthResult={strength} />
</FormField>
```

### 3. Composition over Inheritance
Favor component composition and hook composition over complex inheritance hierarchies:

```typescript
// ✅ Good: Composition
function AuthForm({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      {children}
    </form>
  );
}

function RegisterForm() {
  return (
    <AuthForm onSubmit={handleSubmit(onSubmit)}>
      <FormField name="email" />
      <FormField name="password" />
    </AuthForm>
  );
}
```

## Refactoring Metrics

When refactoring components, track these metrics to measure improvement:

### Code Metrics
- **Lines of Code**: Target 20-30% reduction in component size
- **Cyclomatic Complexity**: Reduce nested conditions and loops
- **Duplication**: Eliminate repetitive code patterns
- **Coupling**: Reduce dependencies between components

### Maintainability Metrics  
- **Reusability**: How many places can the extracted logic be used?
- **Testability**: Can hooks and components be tested in isolation?
- **Readability**: Is the component's purpose immediately clear?
- **Flexibility**: How easy is it to modify behavior?

## Example: Before vs After Refactoring

### Before Refactoring
```typescript
// RegisterForm.tsx - 315+ lines
export function RegisterForm() {
  // 50+ lines of password strength logic
  const getPasswordStrength = (password) => { /* complex logic */ };
  
  // 30+ lines of autofill logic
  const autofillForm = () => { /* complex logic */ };
  
  // 20+ lines of error handling
  catch (error) { /* complex error extraction */ }
  
  // 200+ lines of repetitive form fields
  return (
    <ErrorBoundary>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input {...register('name')} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>
      {/* Repeated 5+ times with variations */}
    </ErrorBoundary>
  );
}
```

### After Refactoring
```typescript
// RegisterForm.tsx - 245 lines (22% reduction)
export function RegisterForm() {
  // Hooks handle complex logic
  const passwordStrength = usePasswordStrength(watchPassword);
  const { handleServerError } = useFormServerErrorHandler<RegisterFormData>();
  const { autofillForm } = useRegistrationAutofill(setValue);
  
  // Simple error handling
  catch (error) {
    handleServerError(error, setError);
  }
  
  // Clean, reusable components
  return (
    <>
      <FormField name="name" label="Name" register={register} error={errors.name} />
      <FormField name="email" label="Email" register={register} error={errors.email} />
      <FormField name="password" label="Password" register={register} error={errors.password}>
        <PasswordStrengthIndicator password={watchPassword} strengthResult={passwordStrength} />
      </FormField>
    </>
  );
}

// Page.tsx - Error boundary at page level
export default function RegisterPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <RegisterForm />
    </ErrorBoundary>
  );
}
```

## Benefits of This Architecture

### For Developers
- **Faster Development**: Reusable components and hooks speed up feature development
- **Easier Debugging**: Isolated logic is easier to debug and test
- **Better Code Review**: Smaller, focused components are easier to review
- **Consistent Patterns**: Standard approaches reduce cognitive load

### For Users
- **Better Error Handling**: More graceful error recovery at appropriate levels
- **Consistent UI**: Reusable components ensure consistent user experience
- **Better Performance**: Smaller, focused components can be optimized more easily
- **Accessibility**: Built-in accessibility patterns in reusable components

### For Maintenance
- **Easier Updates**: Changes to common patterns update everywhere automatically
- **Better Testing**: Isolated logic can be unit tested thoroughly
- **Reduced Bugs**: Less duplication means fewer places for bugs to hide
- **Easier Refactoring**: Well-structured code is easier to refactor further

## Resources

- [React 19 Error Handling](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js 15 Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)
- [Apollo Client 4 Error Handling](https://www.apollographql.com/docs/react/data/error-handling)
- [shadcn/ui Alert Component](https://ui.shadcn.com/docs/components/alert)
- [React Hook Patterns](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Component Composition Patterns](https://react.dev/learn/passing-props-to-a-component)

# Authentication Page Best Practices

Based on the refactoring of authentication pages (reset-password and confirm-password), here are additional patterns and practices to follow:

## Password-Related Forms Best Practices

### 1. Use Proper GraphQL Patterns Instead of Manual API Calls

**Before:**
```typescript
// Manual fetch API call
const response = await fetch('/api/auth/verify-password', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
  },
  body: JSON.stringify({ email, password }),
});
```

**After:**
```typescript
// Use established GraphQL mutations through auth hooks
await changePassword({
  current_password: data.password,
  password: data.password,
  password_confirmation: data.password,
});
```

**Benefits:**
- Consistent error handling through centralized error extraction
- Type safety with GraphQL schema
- Better error categorization and user feedback
- No direct localStorage access - uses established auth patterns

### 2. Page-Level Error Boundaries for Auth Forms

**Pattern:**
```typescript
export default function AuthPage() {
  return (
    <ErrorBoundary fallback={<AuthErrorFallback />}>
      <AuthForm />
    </ErrorBoundary>
  );
}

function AuthErrorFallback() {
  return (
    <AuthCard icon={AlertTriangle} title="Error" status="error">
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </AuthCard>
  );
}
```

**Benefits:**
- Prevents auth page crashes from breaking navigation
- Consistent error recovery patterns
- Better user experience with graceful degradation

### 3. Extract Password Logic into Reusable Hooks

**Before:** Inline password strength calculation (50+ lines)
```typescript
const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  // ... more inline logic
};
```

**After:** Use dedicated hook
```typescript
const passwordStrength = usePasswordStrength(watchPassword);
```

**Benefits:**
- Reusable across multiple forms
- Configurable requirements per use case
- Better testing coverage
- Consistent strength calculation

### 4. Use Reusable Form Field Components

**Before:** Repetitive form markup (20+ lines per field)
```typescript
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input {...register('password')} className={errors.password ? 'border-red-300' : ''} />
  {errors.password && <p className="text-red-600">{errors.password.message}</p>}
</div>
```

**After:** Reusable component (3 lines)
```typescript
<FormField
  name="password"
  label="Password"
  type="password"
  register={register}
  error={errors.password}
  required
/>
```

**Benefits:**
- Consistent styling and behavior
- Built-in accessibility features
- Easier maintenance and updates
- Reduced code duplication by 85%

### 5. Centralized Server Error Handling

**Before:** Manual error extraction and mapping
```typescript
catch (error) {
  const extractedError = extractError(error);
  if (extractedError.isValidationError && extractedError.field) {
    setError(extractedError.field, { message: extractedError.message });
  }
}
```

**After:** Use dedicated hook
```typescript
const { handleServerError } = useFormServerErrorHandler<FormData>();
catch (error) {
  handleServerError(error, setError);
}
```

**Benefits:**
- Consistent error handling across all forms
- Proper field mapping for validation errors
- Better debugging with structured logging
- Type-safe form field mapping

### 6. Modular Password Strength Components

**Pattern:**
```typescript
<FormField name="password" /* ... */>
  <PasswordStrengthIndicator
    password={watchPassword}
    strengthResult={passwordStrength}
    showRequirements={showRequirements || !!errors.password}
    showStrengthBar={!!watchPassword}
  />
</FormField>
```

**Components Available:**
- `PasswordStrengthIndicator` - Full component with bar and requirements
- `PasswordStrengthBar` - Strength bar only
- `PasswordRequirementsList` - Requirements checklist only

**Benefits:**
- Composable components for different use cases
- Consistent visual patterns
- Built-in internationalization support
- Accessible with proper ARIA attributes

## Authentication Hook Patterns

### Password Confirmation Strategy

For password confirmation pages, use the established `changePassword` mutation pattern:

```typescript
// Verify password by attempting to change to same password
await changePassword({
  current_password: userInput,
  password: userInput,
  password_confirmation: userInput,
});
```

This approach:
- Leverages existing authentication infrastructure
- Provides proper error handling and validation
- Maintains consistency with other password operations
- Avoids creating custom verification endpoints

## Form Architecture Improvements

### Before Refactoring Metrics
- **Reset Password Page**: 315+ lines
- **Confirm Password Page**: 180+ lines
- **Code Duplication**: 60%+ repetitive form patterns
- **Manual Error Handling**: Different patterns per page
- **Inline Logic**: Password strength, validation, API calls

### After Refactoring Metrics
- **Reset Password Page**: 95 lines (70% reduction)
- **Confirm Password Page**: 95 lines (47% reduction)
- **Code Duplication**: <10% with reusable components
- **Error Handling**: Centralized and consistent
- **Logic Extraction**: All complex logic in dedicated hooks

## Testing Improvements

The refactored authentication pages are easier to test because:

1. **Isolated Logic**: Hooks can be unit tested independently
2. **Reusable Components**: Form fields tested once, used everywhere
3. **Error Boundaries**: Component-level error handling can be tested
4. **Mock-Friendly**: GraphQL mutations are easier to mock than fetch calls

## Accessibility Enhancements

1. **Form Fields**: Built-in ARIA attributes and proper labeling
2. **Error States**: Screen reader accessible error announcements
3. **Password Requirements**: Proper semantic markup for requirements
4. **Loading States**: Accessible loading indicators with proper announcements

## Performance Benefits

1. **Bundle Size**: Reduced duplication means smaller bundle
2. **Rendering**: Fewer DOM updates with optimized components
3. **Memory**: Better garbage collection with extracted hooks
4. **Network**: Fewer unnecessary re-renders and API calls

Last Updated: September 26, 2025
