# Web POS Constitution

<!--
SYNC IMPACT REPORT - Constitution v1.0.0 (Initial Version)
===============================================================
Version Change: INITIAL → 1.0.0
Created: 2025-10-02
Ratified: 2025-10-02

Modified Principles: N/A (Initial version)
Added Sections:
  - Core Principles (I-VII)
  - Development Workflow
  - Quality Standards
  - Governance

Removed Sections: N/A

Templates Requiring Updates:
  - ✅ .specify/templates/plan-template.md - Aligned with TDD and library-first principles
  - ✅ .specify/templates/spec-template.md - Aligned with requirement clarity
  - ✅ .specify/templates/tasks-template.md - Aligned with TDD and test-first approach

Follow-up TODOs:
  - Validate compliance in existing codebase (GraphQL contracts, test coverage)
  - Document exceptions for legacy Inertia.js code during migration
===============================================================
-->

## Core Principles

### I. Documentation-First Development
Every feature begins with clear, stakeholder-friendly specifications that define WHAT and WHY before HOW. Technical implementation details are deferred to planning phase.

**Requirements:**
- Feature specs written for non-technical stakeholders
- No technology choices in requirements documents
- All ambiguities marked with [NEEDS CLARIFICATION]
- Acceptance criteria must be testable and measurable

**Rationale:** Clear requirements prevent scope creep, reduce rework, and ensure alignment between business needs and technical implementation. This principle directly supports the migration from monolithic architecture by ensuring each new feature is properly architected from the start.

### II. Test-First Development (NON-NEGOTIABLE)
Tests are written BEFORE implementation code. All tests must fail initially, proving they test real functionality.

**Requirements:**
- Contract tests written for all API endpoints before implementation
- Integration tests written for all user stories before implementation
- Tests must fail with meaningful error messages before code is written
- Red-Green-Refactor cycle strictly enforced
- No implementation code without corresponding test

**Rationale:** TDD ensures correctness, prevents regression, and serves as executable documentation. For a POS system handling financial transactions, test coverage is critical for data integrity and business continuity.

**Enforcement:** Pull requests without tests for new functionality will be rejected. Existing code without tests is considered technical debt and must be addressed incrementally.

### III. GraphQL Contract-First API Design
All API interactions are defined by GraphQL schema contracts before implementation. Schema is the single source of truth.

**Requirements:**
- GraphQL schema in `/backend/graphql/` defines all API contracts
- Frontend types generated from schema via codegen
- Lighthouse directives preferred over custom resolvers when possible
- Schema changes must be validated before implementation
- All mutations include proper input validation rules

**Rationale:** GraphQL contracts ensure type safety across frontend/backend boundary, enable parallel development, and provide clear API documentation. This principle supports the ongoing migration from Inertia.js to Next.js by providing a stable API layer.

**Best Practices:**
- Use `@count`, `@update`, `@first`, `@where` directives instead of custom resolvers
- Add model accessors for field mappings
- Add Eloquent scopes for filtered queries
- Keep custom resolvers only for complex business logic

### IV. Bilingual-First Design
All user-facing content must support English and Arabic from the start. Translation is not an afterthought.

**Requirements:**
- Database columns use `_en` and `_ar` suffixes for translatable fields
- GraphQL schema includes `@localized` directive for locale-aware fields
- Frontend uses Next.js i18n structure for translations
- Backend uses Laravel's `resources/lang/` structure
- All new features include translations in both languages

**Rationale:** Retrofitting translation support is expensive and error-prone. Building it in from the start ensures consistent user experience and reduces technical debt.

### V. Component Reusability & Consistency
Extract reusable patterns into shared components, hooks, and utilities. Avoid code duplication.

**Requirements:**
- Custom hooks for reusable logic (e.g., `usePasswordStrength`, `useFormServerErrorHandler`)
- Shared UI components using shadcn/ui patterns
- Consistent error handling through centralized utilities
- Form fields follow established patterns (FormField, CheckboxFormField, etc.)
- Development utilities as hooks (e.g., `useRegistrationAutofill`)

**Rationale:** Reusable components reduce code duplication by 70-85%, improve maintainability, ensure consistent user experience, and speed up feature development. This aligns with Laravel Boost guidelines to "check for existing components to reuse before writing a new one."

**Anti-patterns:**
- ❌ Inline complex logic in components
- ❌ Repetitive form field markup
- ❌ Duplicated error handling code
- ❌ Component-level error boundaries (use page-level instead)

### VI. Migration Integrity
During the migration from Inertia.js to Next.js, maintain 100% feature parity and never break existing functionality.

**Requirements:**
- Existing Inertia.js routes remain functional during migration
- GraphQL API must support both old and new frontend
- No database schema changes that break legacy code
- Migration documented in `/specs/001-migration-from-monolithic/`
- Feature parity verified through integration tests

**Rationale:** Business continuity is paramount. The POS system must remain operational throughout the migration. Gradual migration reduces risk and allows for iterative validation.

**Constraints:**
- Legacy Inertia.js code is exempt from new architecture principles until migrated
- All new features MUST use Next.js + GraphQL architecture
- Backend changes must not break Inertia.js pages

### VII. Laravel & Next.js Ecosystem Best Practices
Follow framework-specific conventions and leverage ecosystem tools. Don't reinvent solutions that exist.

**Requirements:**
- **Laravel**: Use Artisan commands for file generation, Eloquent for database, Pest for testing
- **Next.js**: Use App Router, server components where appropriate, proper data fetching patterns
- **GraphQL**: Use Lighthouse directives, proper error handling, Apollo Client best practices
- **UI**: Use shadcn/ui components, Tailwind CSS utilities, responsive design patterns
- **Testing**: Pest for backend, Jest for frontend, integration tests for critical paths

**Rationale:** Framework conventions reduce cognitive load, improve team velocity, and ensure long-term maintainability. Leveraging ecosystem tools (Laravel Boost, shadcn MCP, docs-mcp-server) provides version-specific guidance and reduces errors.

**Tool Usage:**
- Always use `docs-mcp-server` for library documentation before implementation
- Always use `laravel-boost` tools for Laravel-specific operations
- Always use `shadcn` MCP tools for UI component documentation
- Run `vendor/bin/pint --dirty` before finalizing PHP changes
- Run `npm run codegen` after GraphQL schema changes

## Development Workflow

### Feature Development Process
1. **Specification** (`/spec` command):
   - Create feature spec in `/specs/###-feature-name/spec.md`
   - Define user scenarios and acceptance criteria
   - Mark all ambiguities with [NEEDS CLARIFICATION]
   - No technical implementation details

2. **Planning** (`/plan` command):
   - Research technologies and patterns in `research.md`
   - Design data model in `data-model.md`
   - Define GraphQL contracts in `/contracts/`
   - Create quickstart guide in `quickstart.md`
   - Update agent context file (`.github/copilot-instructions.md` for Copilot)

3. **Task Generation** (`/tasks` command):
   - Generate ordered task list in `tasks.md`
   - Contract tests first, then implementation
   - Mark parallel tasks with [P]
   - Include exact file paths

4. **Implementation**:
   - Follow TDD: Write test → See it fail → Implement → See it pass → Refactor
   - Run tests after each task completion
   - Commit after each completed task
   - Update translations for both English and Arabic

5. **Validation**:
   - Run full test suite: `php artisan test`
   - Validate GraphQL schema: `php artisan lighthouse:validate-schema`
   - Regenerate frontend types: `npm run codegen`
   - Run Pint formatter: `vendor/bin/pint --dirty`
   - Execute quickstart.md scenarios

### Branch Strategy
- Feature branches: `###-feature-name` (e.g., `001-migration-from-monolithic`)
- Commits reference task IDs where applicable
- Pull requests require passing tests and schema validation

## Quality Standards

### Testing Requirements
- **Unit Tests**: Core business logic, utilities, model methods
- **Integration Tests**: API endpoints, user flows, critical paths
- **Contract Tests**: GraphQL schema compliance, input validation
- **Coverage**: Aim for 80%+ on new code, but 100% on critical financial transactions

### Code Quality
- **PHP**: Laravel Pint for formatting, PHPStan for static analysis, explicit type hints
- **TypeScript**: ESLint for linting, strict mode enabled, proper type definitions
- **Performance**: Database queries optimized (eager loading, proper indexes), API responses <500ms for critical operations
- **Accessibility**: WCAG 2.1 AA compliance for UI components, proper ARIA attributes

### Error Handling
- **Structured Errors**: Use centralized error extraction (`error-extraction.ts` for frontend)
- **User-Friendly Messages**: No raw technical errors shown to users
- **Error Boundaries**: Page-level boundaries for React components
- **Logging**: All errors logged with context for debugging
- **Apollo Client**: Use `errorPolicy: 'all'` for partial data handling

### Security
- **Authentication**: Laravel Sanctum for API tokens
- **Authorization**: Policies for model access, guards for routes
- **Input Validation**: Laravel Form Requests for backend, Zod schemas for frontend
- **CSRF Protection**: Enabled for state-changing operations
- **SQL Injection**: Use Eloquent query builder, parameterized queries only

## Governance

### Constitution Authority
This constitution supersedes conflicting guidance from:
- Individual developer preferences
- Outdated documentation
- Legacy code patterns (except where migration exemptions apply)

### Amendment Process
1. Propose change with clear rationale
2. Document impact on existing code and templates
3. Require approval from project maintainers
4. Update version number according to semantic versioning:
   - **MAJOR**: Breaking changes to governance or principle removal
   - **MINOR**: New principles or material expansions
   - **PATCH**: Clarifications, wording improvements, typo fixes
5. Propagate changes to all Specify templates
6. Update agent context files as needed

### Compliance Review
- All pull requests must verify constitutional compliance
- Complexity deviations must be justified in plan.md
- Agent context files updated incrementally (O(1) operation, keep under 150 lines)
- Quarterly audits to identify and address technical debt

### Complexity Justification
When deviating from simplicity principles (e.g., adding new abstraction layers), document:
- What simpler approach was considered
- Why it's insufficient for the use case
- What specific problem the complexity solves

### Runtime Guidance
For operational development guidance beyond constitutional principles, refer to:
- `.github/copilot-instructions.md` for AI agent context
- `.github/docs/best-practices-notes.md` for GraphQL, error handling, and component architecture
- `.github/docs/testing-notes.md` for test patterns and solutions
- `.specify/templates/` for feature development workflow

**Version**: 1.0.0 | **Ratified**: 2025-10-02 | **Last Amended**: 2025-10-02