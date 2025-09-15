# Tasks: Migration from Monolithic Inertia.js App to Next.js Frontend with GraphQL API

**Input**: Design documents from `/specs/001-migration-from-monolithic/`
**Prerequisites**: plan.md (required), research.md, data-model.md, contracts/

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → If not found: ERROR "No implementation plan found"
   → Extract: tech stack, libraries, structure
2. Load optional design documents:
   → data-model.md: Extract entities → model tasks
   → contracts/: Each file → contract test task
   → research.md: Extract decisions → setup tasks
3. Generate tasks by category:
   → Setup: project init, dependencies, linting
   → Tests: contract tests, integration tests
   → Core: models, services, CLI commands
   → Integration: DB, middleware, logging
   → Polish: unit tests, performance, docs
4. Apply task rules:
   → Different files = mark [P] for parallel
   → Same file = sequential (no [P])
   → Tests before implementation (TDD)
5. Number tasks sequentially (T001, T002...)
6. Generate dependency graph
7. Create parallel execution examples
8. Validate task completeness:
   → All contracts have tests?
   → All entities have models?
   → All endpoints implemented?
9. Return: SUCCESS (tasks ready for execution)
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app**: `backend/` for Laravel GraphQL API, `frontend/` for Next.js app
- Paths reflect web application structure from plan.md

## Phase 3.1: Setup & Project Structure
- [x] T001 Create Next.js 15 frontend project structure with TypeScript, Tailwind CSS, and shadcn/ui
- [x] T002 Configure backend GraphQL dependencies (lighthouse-php, laravel-graphql-playground)
- [x] T003 [P] Setup frontend dependencies (Apollo Client, NextAuth.js, React Hook Form, Zod)
- [x] T004 [P] Configure ESLint, Prettier, and TypeScript for frontend
- [x] T005 [P] Configure Laravel Pint and PHPStan for backend
- [x] T006 [P] Setup testing frameworks (Jest + RTL for frontend, Pest for backend)

## Phase 3.2: GraphQL Schema & Contract Tests (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Schema Structure (Refactored into smaller files)
- [x] T007 [P] Create base GraphQL schema in backend/graphql/schema.graphql
- [x] T008 [P] Create authentication types schema in backend/graphql/auth.graphql
- [ ] T009 [P] Create product catalog types schema in backend/graphql/products.graphql
- [ ] T010 [P] Create cart & wishlist types schema in backend/graphql/cart.graphql
- [ ] T011 [P] Create order management types schema in backend/graphql/orders.graphql
- [ ] T012 [P] Create return management types schema in backend/graphql/returns.graphql
- [ ] T013 [P] Create payment types schema in backend/graphql/payments.graphql
- [ ] T014 [P] Create promotion types schema in backend/graphql/promotions.graphql

### Contract Tests for Authentication
- [x] T015 [P] Contract test login mutation in backend/tests/Feature/GraphQL/AuthenticationTest.php
- [x] T016 [P] Contract test register mutation in backend/tests/Feature/GraphQL/RegistrationTest.php
- [x] T017 [P] Contract test social login in backend/tests/Feature/GraphQL/SocialAuthTest.php
- [x] T018 [P] Contract test password reset flow in backend/tests/Feature/GraphQL/PasswordResetTest.php

### Contract Tests for Product Catalog
- [ ] T019 [P] Contract test products query in backend/tests/Feature/GraphQL/ProductsTest.php
- [ ] T020 [P] Contract test categories query in backend/tests/Feature/GraphQL/CategoriesTest.php
- [ ] T021 [P] Contract test brands query in backend/tests/Feature/GraphQL/BrandsTest.php
- [ ] T022 [P] Contract test sections query in backend/tests/Feature/GraphQL/SectionsTest.php
- [ ] T023 [P] Contract test product search in backend/tests/Feature/GraphQL/SearchTest.php

### Contract Tests for Cart & Orders
- [ ] T024 [P] Contract test cart mutations in backend/tests/Feature/GraphQL/CartTest.php
- [ ] T025 [P] Contract test wishlist mutations in backend/tests/Feature/GraphQL/WishlistTest.php
- [ ] T026 [P] Contract test order creation in backend/tests/Feature/GraphQL/OrderCreationTest.php
- [ ] T027 [P] Contract test order management in backend/tests/Feature/GraphQL/OrderManagementTest.php

### Contract Tests for Returns & Payments
- [ ] T028 [P] Contract test return order creation in backend/tests/Feature/GraphQL/ReturnOrderTest.php
- [ ] T029 [P] Contract test payment initiation in backend/tests/Feature/GraphQL/PaymentTest.php
- [ ] T030 [P] Contract test promotions in backend/tests/Feature/GraphQL/PromotionsTest.php

### Integration Tests for User Journeys
- [x] T031 [P] Integration test complete auth flow in backend/tests/Feature/Integration/AuthFlowTest.php
- [ ] T032 [P] Integration test shopping journey in backend/tests/Feature/Integration/ShoppingJourneyTest.php
- [ ] T033 [P] Integration test checkout process in backend/tests/Feature/Integration/CheckoutFlowTest.php
- [ ] T034 [P] Integration test return process in backend/tests/Feature/Integration/ReturnFlowTest.php

## Phase 3.3: Backend GraphQL Implementation (ONLY after tests are failing)

### GraphQL Types and Scalars
- [ ] T035 [P] Implement base scalars and interfaces in backend/app/GraphQL/Scalars/
- [x] T036 [P] Implement User type and resolvers in backend/app/GraphQL/Types/UserType.php
- [ ] T037 [P] Implement Product types in backend/app/GraphQL/Types/ProductType.php
- [ ] T038 [P] Implement Category types in backend/app/GraphQL/Types/CategoryType.php
- [ ] T039 [P] Implement Order types in backend/app/GraphQL/Types/OrderType.php
- [ ] T040 [P] Implement Cart types in backend/app/GraphQL/Types/CartType.php

### Authentication Resolvers
- [x] T041 [P] Implement login mutation in backend/app/GraphQL/Mutations/Auth/LoginMutation.php
- [x] T042 [P] Implement register mutation in backend/app/GraphQL/Mutations/Auth/RegisterMutation.php
- [x] T043 [P] Implement social auth in backend/app/GraphQL/Mutations/Auth/SocialLoginMutation.php
- [x] T044 [P] Implement password reset in backend/app/GraphQL/Mutations/Auth/PasswordResetMutation.php

### Product Catalog Resolvers
- [ ] T045 [P] Implement products query in backend/app/GraphQL/Queries/ProductsQuery.php
- [ ] T046 [P] Implement categories query in backend/app/GraphQL/Queries/CategoriesQuery.php
- [ ] T047 [P] Implement brands query in backend/app/GraphQL/Queries/BrandsQuery.php
- [ ] T048 [P] Implement sections query in backend/app/GraphQL/Queries/SectionsQuery.php
- [ ] T049 [P] Implement search query in backend/app/GraphQL/Queries/SearchQuery.php

### Cart & Wishlist Resolvers
- [ ] T050 [P] Implement cart mutations in backend/app/GraphQL/Mutations/Cart/CartMutations.php
- [ ] T051 [P] Implement wishlist mutations in backend/app/GraphQL/Mutations/Wishlist/WishlistMutations.php
- [ ] T052 Implement cart query resolver in backend/app/GraphQL/Queries/CartQuery.php

### Order Management Resolvers  
- [ ] T053 [P] Implement order creation mutation in backend/app/GraphQL/Mutations/Orders/CreateOrderMutation.php
- [ ] T054 [P] Implement order queries in backend/app/GraphQL/Queries/OrdersQuery.php
- [ ] T055 [P] Implement order cancellation in backend/app/GraphQL/Mutations/Orders/CancelOrderMutation.php

### Return & Payment Resolvers
- [ ] T056 [P] Implement return order mutations in backend/app/GraphQL/Mutations/Returns/ReturnOrderMutations.php
- [ ] T057 [P] Implement payment initiation in backend/app/GraphQL/Mutations/Payments/InitiatePaymentMutation.php
- [ ] T058 [P] Implement promotion mutations in backend/app/GraphQL/Mutations/Promotions/PromotionMutations.php

## Phase 3.4: Frontend Next.js Implementation

### Core Setup & Configuration
- [x] T059 Configure Apollo Client in frontend/src/lib/apollo-client.ts
- [ ] T060 Configure NextAuth.js in frontend/src/lib/auth.ts
- [ ] T061 [P] Setup internationalization in frontend/src/lib/i18n.ts
- [ ] T062 [P] Configure Tailwind CSS and shadcn/ui theme in frontend/src/lib/utils.ts

### Shared Types & Hooks
- [ ] T063 Generate TypeScript types from GraphQL schema in frontend/src/types/graphql.ts
- [x] T064 [P] Create authentication hooks in frontend/src/hooks/use-auth.ts
- [ ] T065 [P] Create cart management hooks in frontend/src/hooks/use-cart.ts
- [ ] T066 [P] Create wishlist hooks in frontend/src/hooks/use-wishlist.ts

### Authentication Pages
- [x] T067 [P] Implement login page in frontend/src/app/auth/login/page.tsx
- [x] T068 [P] Implement register page in frontend/src/app/auth/register/page.tsx
- [x] T069 [P] Implement forgot password page in frontend/src/app/auth/forgot-password/page.tsx
- [x] T070 [P] Implement reset password page in frontend/src/app/auth/reset-password/page.tsx
- [x] T071 [P] Implement email verification page in frontend/src/app/auth/verify-email/page.tsx
- [x] T072 [P] Implement password confirmation page in frontend/src/app/auth/confirm-password/page.tsx

### Core E-commerce Pages
- [ ] T073 Implement homepage with sections in frontend/src/app/page.tsx
- [ ] T074 [P] Implement product listing page in frontend/src/app/products/page.tsx
- [ ] T075 [P] Implement product detail page in frontend/src/app/products/[id]/page.tsx
- [ ] T076 [P] Implement category pages in frontend/src/app/categories/[slug]/page.tsx
- [ ] T077 [P] Implement brand pages in frontend/src/app/brands/page.tsx
- [ ] T078 [P] Implement section pages in frontend/src/app/sections/[id]/page.tsx

### Shopping & Checkout Pages
- [ ] T079 [P] Implement cart page in frontend/src/app/cart/page.tsx
- [ ] T080 [P] Implement wishlist page in frontend/src/app/wishlist/page.tsx
- [ ] T081 Implement checkout page in frontend/src/app/checkout/page.tsx
- [ ] T082 [P] Implement search results page in frontend/src/app/search/page.tsx

### Order Management Pages
- [ ] T083 [P] Implement orders list page in frontend/src/app/orders/page.tsx
- [ ] T084 [P] Implement order detail page in frontend/src/app/orders/[id]/page.tsx
- [ ] T085 [P] Implement returns list page in frontend/src/app/returns/page.tsx
- [ ] T086 [P] Implement create return page in frontend/src/app/returns/create/[orderId]/page.tsx
- [ ] T087 [P] Implement return detail page in frontend/src/app/returns/[id]/page.tsx

### Profile & Static Pages
- [ ] T088 [P] Implement profile page in frontend/src/app/profile/page.tsx
- [ ] T089 [P] Implement contact page in frontend/src/app/contact/page.tsx
- [ ] T090 [P] Implement privacy policy page in frontend/src/app/privacy/page.tsx
- [ ] T091 [P] Implement terms page in frontend/src/app/terms/page.tsx
- [ ] T092 [P] Implement returns policy page in frontend/src/app/returns-policy/page.tsx
- [ ] T093 [P] Implement Facebook data deletion page in frontend/src/app/facebook-data-deletion/page.tsx

### Payment Processing
- [ ] T094 Implement Kashier payment page in frontend/src/app/payments/[orderId]/page.tsx

### Shared Components
- [ ] T095 [P] Create navigation component in frontend/src/components/navigation.tsx
- [ ] T096 [P] Create product card component in frontend/src/components/product-card.tsx
- [ ] T097 [P] Create cart item component in frontend/src/components/cart-item.tsx
- [ ] T098 [P] Create order summary component in frontend/src/components/order-summary.tsx
- [ ] T099 [P] Create address form component in frontend/src/components/address-form.tsx
- [ ] T100 [P] Create loading skeletons in frontend/src/components/skeletons/

## Phase 3.5: Integration & Middleware
- [ ] T101 Configure GraphQL authentication middleware in backend/app/GraphQL/Middleware/
- [ ] T102 Setup CORS for frontend-backend communication in backend/config/cors.php
- [ ] T103 Configure session sharing between domains in backend/config/session.php
- [ ] T104 Implement GraphQL error handling in backend/app/GraphQL/ErrorHandler.php
- [ ] T105 Setup request/response logging for GraphQL in backend/app/GraphQL/Middleware/LoggingMiddleware.php

## Phase 3.6: Payment Integration
- [ ] T106 Configure Kashier payment webhook handling in backend/routes/api.php
- [ ] T107 Implement payment status updates via GraphQL subscriptions (optional)
- [ ] T108 Test payment flow integration between frontend and Kashier

## Phase 3.7: Testing & Quality Assurance
- [ ] T109 [P] Frontend component tests in frontend/src/__tests__/components/
- [ ] T110 [P] Frontend page tests in frontend/src/__tests__/pages/
- [ ] T111 [P] Frontend hook tests in frontend/src/__tests__/hooks/
- [ ] T112 [P] Backend unit tests for GraphQL resolvers in backend/tests/Unit/GraphQL/
- [ ] T113 [P] Backend service layer tests in backend/tests/Unit/Services/
- [ ] T114 End-to-end tests for critical user journeys in frontend/e2e/
- [ ] T115 Performance tests for GraphQL queries (<100ms target)
- [ ] T116 SEO tests for Next.js pages (meta tags, structured data)

## Phase 3.8: Deployment & Documentation
- [ ] T117 [P] Configure Docker setup for development environment
- [ ] T118 [P] Setup CI/CD pipeline for automated testing
- [ ] T119 [P] Create deployment scripts for staging and production
- [ ] T120 [P] Generate GraphQL API documentation
- [ ] T121 [P] Create component storybook for frontend
- [ ] T122 [P] Update README with migration guide
- [ ] T123 Run complete quickstart validation from quickstart.md

## Dependencies

### Critical Path Dependencies
- **Setup** (T001-T006) blocks everything else
- **Schema Definition** (T007-T014) blocks all GraphQL work
- **Contract Tests** (T015-T034) must pass before any implementation
- **GraphQL Types** (T035-T040) block resolver implementation
- **Apollo Client Setup** (T059) blocks all frontend GraphQL usage
- **Authentication** (T041-T044, T067-T072) blocks protected features
- **Cart System** (T050-T052, T079) blocks checkout implementation

### AI-Optimized Context Groups

**Context Group 1: Project Foundation & Setup**
```
Complete development environment setup with all tooling and dependencies
Tasks: T001, T002, T003, T004, T005, T006
Context: Project initialization, dependency management, linting configuration
AI Focus: Infrastructure and tooling setup across both frontend and backend
```

**Context Group 2: Authentication Domain (Schema + Tests + Implementation)**
```
Complete authentication system from schema to frontend implementation
Tasks: T008, T015, T016, T017, T018, T031, T036, T041, T042, T043, T044, T067, T068, T069, T070, T071, T072
Context: User authentication, registration, password reset, social login, session management
AI Focus: End-to-end authentication system with security considerations
```

**Context Group 3: Product Catalog Domain (Schema + Tests + Implementation)**
```
Complete product browsing and catalog system
Tasks: T009, T019, T020, T021, T022, T023, T037, T038, T045, T046, T047, T048, T049, T074, T075, T076, T077, T078, T082
Context: Products, categories, brands, sections, search functionality
AI Focus: E-commerce catalog with complex filtering and search capabilities
```

**Context Group 4: Shopping Experience Domain (Cart + Wishlist)**
```
Complete shopping cart and wishlist functionality
Tasks: T010, T024, T025, T032, T040, T050, T051, T052, T065, T066, T079, T080, T097
Context: Cart management, wishlist, quantity updates, persistence
AI Focus: State management and real-time shopping experience
```

**Context Group 5: Order & Payment Domain (Schema + Tests + Implementation)**
```
Complete order processing and payment integration
Tasks: T011, T013, T026, T027, T029, T033, T039, T053, T054, T055, T057, T058, T081, T083, T084, T094, T106, T107, T108
Context: Order creation, payment processing, Kashier integration, order management
AI Focus: E-commerce transaction processing with payment gateway integration
```

**Context Group 6: Returns & Customer Service Domain**
```
Complete return order system and customer service features
Tasks: T012, T028, T034, T056, T085, T086, T087
Context: Return requests, refund processing, customer service workflows
AI Focus: Post-purchase customer experience and reverse logistics
```

**Context Group 7: Core Infrastructure & Shared Components**
```
Base GraphQL setup, shared types, and reusable components
Tasks: T007, T035, T059, T060, T061, T062, T063, T064, T073, T095, T096, T098, T099, T100
Context: GraphQL foundation, Apollo Client, shared TypeScript types, UI components
AI Focus: Core architecture and reusable building blocks
```

**Context Group 8: Content & Static Pages**
```
Static content pages and informational content
Tasks: T014, T030, T088, T089, T090, T091, T092, T093
Context: Static pages, legal content, user profiles, promotions
AI Focus: Content management and informational pages
```

**Context Group 9: Integration & Middleware**
```
Cross-system integration and middleware configuration
Tasks: T101, T102, T103, T104, T105
Context: CORS, session sharing, authentication middleware, error handling
AI Focus: System integration and cross-cutting concerns
```

**Context Group 10: Quality Assurance & Testing**
```
Comprehensive testing across all layers
Tasks: T109, T110, T111, T112, T113, T114, T115, T116
Context: Component testing, integration testing, performance testing, SEO validation
AI Focus: Quality assurance and validation strategies
```

**Context Group 11: Deployment & Documentation**
```
Production readiness and documentation
Tasks: T117, T118, T119, T120, T121, T122, T123
Context: DevOps, CI/CD, documentation, deployment automation
AI Focus: Production deployment and developer experience
```

## AI Context Optimization Example
```
# Context Group 2 (Authentication Domain) - Single AI session:
1. "Create authentication types schema in backend/graphql/auth.graphql"
2. "Contract test login mutation in backend/tests/Feature/GraphQL/AuthenticationTest.php"
3. "Contract test register mutation in backend/tests/Feature/GraphQL/RegistrationTest.php"
4. "Contract test social login in backend/tests/Feature/GraphQL/SocialAuthTest.php"
5. "Contract test password reset flow in backend/tests/Feature/GraphQL/PasswordResetTest.php"
6. "Integration test complete auth flow in backend/tests/Feature/Integration/AuthFlowTest.php"
7. "Implement User type and resolvers in backend/app/GraphQL/Types/UserType.php"
8. "Implement login mutation in backend/app/GraphQL/Mutations/Auth/LoginMutation.php"
9. "Implement register mutation in backend/app/GraphQL/Mutations/Auth/RegisterMutation.php"
10. "Implement social auth in backend/app/GraphQL/Mutations/Auth/SocialLoginMutation.php"
11. "Implement password reset in backend/app/GraphQL/Mutations/Auth/PasswordResetMutation.php"
12. "Implement login page in frontend/src/app/auth/login/page.tsx"
13. "Implement register page in frontend/src/app/auth/register/page.tsx"
14. "Implement forgot password page in frontend/src/app/auth/forgot-password/page.tsx"
15. "Implement reset password page in frontend/src/app/auth/reset-password/page.tsx"
16. "Implement email verification page in frontend/src/app/auth/verify-email/page.tsx"
17. "Implement password confirmation page in frontend/src/app/auth/confirm-password/page.tsx"

Benefits: AI maintains context of authentication patterns, security considerations, error handling, and user experience flows throughout the entire domain implementation.
```

## Notes
- [P] tasks = different files, no dependencies, can run in parallel
- Verify all contract tests fail before implementing resolvers (TDD)
- Commit after completing each phase
- Run quickstart.md validation after each major milestone
- Schema files should import into main schema.graphql using #import directive
- All GraphQL resolvers must have corresponding tests
- Frontend pages must include proper SEO metadata and loading states
- Maintain 100% feature parity with existing Inertia.js pages

## Task Generation Rules Applied

1. **From Contracts**: Large schema.graphql refactored into 8 smaller schema files (T007-T014)
2. **From Data Model**: 6 core entity types → 6 GraphQL type implementations (T035-T040)
3. **From User Stories**: 23 frontend pages mapped to implementation tasks (T067-T094)
4. **From Quickstart**: Critical user journeys → integration tests (T031-T034)
5. **TDD Ordering**: All tests (T015-T034) before any implementation (T035+)
6. **Parallel Safety**: Tasks marked [P] operate on different files with no shared dependencies

## Validation Checklist
*GATE: Checked before task execution*

- [x] All GraphQL schema parts have corresponding tests
- [x] All entities have model/type implementation tasks  
- [x] All tests come before implementation (TDD enforced)
- [x] Parallel tasks operate on independent files
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] 23 frontend pages match specification requirements
- [x] Critical user journeys covered by integration tests