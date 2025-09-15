# Quickstart Guide: Next.js + GraphQL E-commerce Migration

## Overview
This guide provides step-by-step instructions to validate the successful migration from the monolithic Inertia.js application to the new Next.js 15 frontend with GraphQL API.

## Prerequisites
- Node.js 18+ installed
- PHP 8.4+ with Laravel 11
- Existing Laravel backend running
- Database with existing e-commerce data

## 1. Backend Setup (GraphQL API)

### Install GraphQL Dependencies
```bash
cd backend
composer require pusher/pusher-php-server
composer require lighthouse-php/lighthouse
composer require mll-lab/laravel-graphql-playground
```

### Configure GraphQL Schema
```bash
# Publish GraphQL configuration
php artisan vendor:publish --tag=lighthouse-schema

# Copy our schema
cp ../specs/001-migration-from-monolithic/contracts/schema.graphql graphql/schema.graphql
```

### Generate GraphQL Types
```bash
# Generate TypeScript types from GraphQL schema
php artisan lighthouse:print-schema --write=../frontend/src/types/graphql.ts
```

### Start Backend Server
```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### Verify GraphQL Endpoint
```bash
# Test GraphQL playground
curl http://localhost:8000/graphql-playground

# Test basic query
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ categories { id nameEn nameAr } }"}'
```

## 2. Frontend Setup (Next.js 15)

### Create Next.js Application
```bash
# Create new Next.js 15 app with TypeScript
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias="@/*"

cd frontend
```

### Install Dependencies
```bash
# Core dependencies
npm install @apollo/client graphql
npm install next-auth
npm install @hookform/resolvers react-hook-form zod
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Development dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D @graphql-codegen/cli @graphql-codegen/typescript
npm install -D @graphql-codegen/typescript-operations
npm install -D @graphql-codegen/typescript-react-apollo

# Testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jest-environment-jsdom
```

### Configure shadcn/ui
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install core components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
```

### Configure GraphQL Code Generation
```yaml
# Create codegen.yml
overwrite: true
schema: "http://localhost:8000/graphql"
documents: "src/**/*.{ts,tsx}"
generates:
  src/types/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-apollo"
    config:
      withHooks: true
      withHOC: false
      withComponent: false
```

### Configure Apollo Client
```typescript
// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql',
  credentials: 'include', // Include cookies for session
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'X-Requested-With': 'XMLHttpRequest',
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
```

### Configure Next.js 15 Environment
```bash
# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8000/graphql
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
EOF
```

### Start Frontend Development Server
```bash
npm run dev
```

## 3. Integration Validation

### Test Authentication Flow
```bash
# 1. Navigate to http://localhost:3000/auth/login
# 2. Enter valid credentials from existing Laravel users
# 3. Verify successful authentication
# 4. Check that user session is maintained

# Test with curl
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### Test Product Catalog
```bash
# Test product listing
curl http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products(first: 12) { edges { node { id nameEn nameAr price isInStock } } } }"}'

# Test category browsing
curl http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ categories { id nameEn nameAr products(first: 5) { edges { node { id nameEn } } } } }"}'
```

### Test Cart Functionality
```bash
# Test add to cart (requires authentication)
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"query": "mutation { addToCart(input: { productId: \"1\", quantity: 1 }) { cart { totalItems totalPrice } message } }"}'

# Test cart retrieval
curl http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"query": "{ cart { id totalItems subtotal total items { id quantity product { nameEn } } } }"}'
```

### Test Order Management
```bash
# Test order creation
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"query": "mutation { createOrder(input: { addressId: \"1\", paymentMethod: KASHIER_CREDIT_CARD }) { order { id orderNumber total } message } }"}'

# Test order history
curl http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your-session-token" \
  -d '{"query": "{ orders(first: 10) { edges { node { id orderNumber status total createdAt } } } }"}'
```

## 4. End-to-End User Journey Validation

### Complete Purchase Flow
1. **Browse Products**
   - Navigate to http://localhost:3000
   - Verify product sections load correctly
   - Test category and brand filtering
   - Test search functionality

2. **User Authentication**
   - Navigate to /auth/login
   - Test email/password login
   - Test social login (Facebook/Google)
   - Verify session persistence

3. **Shopping Cart**
   - Add products to cart from product pages
   - Navigate to /cart
   - Test quantity updates
   - Test item removal
   - Apply promotional codes

4. **Checkout Process**
   - Navigate to /checkout
   - Select shipping address
   - Choose payment method
   - Place order

5. **Order Management**
   - Navigate to /orders
   - View order details
   - Test order cancellation
   - Create return request

6. **Profile Management**
   - Navigate to /profile
   - Update profile information
   - Manage addresses
   - Change password

### Performance Validation
```bash
# Test initial page load speed
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000

# Test GraphQL query performance
time curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ products(first: 50) { edges { node { id nameEn price category { nameEn } } } } }"}'
```

### SEO Validation
```bash
# Test meta tags generation
curl -s http://localhost:3000 | grep -E '<title>|<meta.*description|<meta.*og:'

# Test product page SEO
curl -s http://localhost:3000/products/1 | grep -E '<title>|<meta.*description|<meta.*og:'

# Test structured data
curl -s http://localhost:3000/products/1 | grep 'application/ld+json'
```

## 5. Internationalization Testing

### Test Language Switching
```bash
# Test Arabic content
curl -H "Accept-Language: ar" http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ categories { id nameAr } }"}'

# Test English content
curl -H "Accept-Language: en" http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ categories { id nameEn } }"}'
```

### Test RTL Layout
1. Navigate to http://localhost:3000?lang=ar
2. Verify RTL layout rendering
3. Test navigation in Arabic
4. Verify all UI components render correctly

## 6. Mobile Responsiveness Testing

### Test Responsive Design
1. Open DevTools and toggle device toolbar
2. Test common breakpoints:
   - Mobile: 375px width
   - Tablet: 768px width
   - Desktop: 1024px+ width
3. Verify all pages render correctly on each breakpoint
4. Test touch interactions on mobile

## 7. Error Handling Validation

### Test Error Scenarios
```bash
# Test GraphQL error handling
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ nonExistentField }"}'

# Test authentication errors
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ cart { id } }"}'

# Test network errors
# Stop backend server and test frontend graceful degradation
```

## Success Criteria Checklist

### Functional Requirements
- [ ] All 23 pages render correctly
- [ ] User authentication works (email/password + social)
- [ ] Product catalog browsing functions
- [ ] Shopping cart operations work
- [ ] Checkout process completes successfully
- [ ] Order management features function
- [ ] Return request system works
- [ ] Payment integration functions
- [ ] Profile management works
- [ ] Bilingual content displays correctly

### Performance Requirements
- [ ] Initial page load < 200ms
- [ ] GraphQL queries < 100ms
- [ ] SEO meta tags generated correctly
- [ ] Structured data present

### Technical Requirements
- [ ] GraphQL API responds correctly
- [ ] Authentication sessions maintained
- [ ] Error handling works gracefully
- [ ] Mobile responsive design functions
- [ ] Internationalization works

### Integration Requirements
- [ ] Backend session compatibility maintained
- [ ] Payment gateway integration works
- [ ] Admin notifications function
- [ ] Real-time cart updates work

## Troubleshooting

### Common Issues

**GraphQL Connection Issues**
```bash
# Check backend GraphQL endpoint
curl http://localhost:8000/graphql-playground

# Verify CORS configuration
curl -H "Origin: http://localhost:3000" -v http://localhost:8000/graphql
```

**Authentication Issues**
```bash
# Check session configuration
php artisan config:show session

# Verify CSRF token handling
curl -c cookies.txt http://localhost:8000/sanctum/csrf-cookie
```

**Build Issues**
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate GraphQL types
npm run codegen

# Check TypeScript compilation
npx tsc --noEmit
```

This quickstart guide ensures that all critical functionality is validated during the migration process, providing confidence that the new Next.js frontend maintains complete feature parity with the existing Inertia.js application.