# Implementation Plan: Migration from Monolithic Inertia.js App to Next.js Frontend with GraphQL API

**Branch**: `001-migration-from-monolithic` | **Date**: September 14, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-migration-from-monolithic/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Migration from existing Laravel + Inertia.js monolithic e-commerce application to a modern Next.js 15+ frontend with App Router that communicates with the Laravel backend via GraphQL API. The primary requirement is maintaining exact feature parity across 23 pages while modernizing the frontend architecture for better SEO, performance, and developer experience using shadcn/ui components and latest React patterns.

## Technical Context
**Language/Version**: TypeScript 5+ with Next.js 15+ (App Router), PHP 8.4+ Laravel 11  
**Primary Dependencies**: Next.js 15, React 19, shadcn/ui, Tailwind CSS 3, GraphQL (lighthouse-php), Apollo Client, Laravel 11, Inertia.js (legacy)  
**Storage**: Existing Laravel backend with PostgreSQL/MySQL, session-based authentication  
**Testing**: Jest + React Testing Library (frontend), Pest + Feature tests (backend)  
**Target Platform**: Web application (desktop, tablet, mobile responsive)  
**Project Type**: web (frontend + backend separation)  
**Performance Goals**: <200ms initial page load, <100ms navigation, better SEO than current SPA  
**Constraints**: Must maintain 100% feature parity, bilingual support (AR/EN), existing payment integration (Kashier), session compatibility  
**Scale/Scope**: 23 pages, e-commerce functionality, authenticated users, real-time cart updates

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 2 (frontend: Next.js app, backend: GraphQL API layer)
- Using framework directly? (Next.js App Router, Apollo Client, Laravel Lighthouse)
- Single data model? (shared TypeScript types between frontend/backend)
- Avoiding patterns? (no unnecessary abstractions, direct Apollo hooks usage)

**Architecture**:
- EVERY feature as library? (GraphQL resolvers as services, React components as libraries)
- Libraries listed: 
  - GraphQL API layer (authentication, cart, orders, products, payments)
  - Next.js 15 component library (shadcn/ui based)
  - Shared types library (TypeScript interfaces)
- CLI per library: (Laravel Artisan commands, Next.js scripts)
- Library docs: GraphQL schema documentation, component storybook

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? (GraphQL schema tests → implementation)
- Git commits show tests before implementation? (contract tests first)
- Order: Contract→Integration→E2E→Unit strictly followed
- Real dependencies used? (actual GraphQL endpoints, real Laravel backend)
- Integration tests for: GraphQL resolvers, authentication flow, payment integration
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? (Laravel logs, Next.js server logs)
- Frontend logs → backend? (error reporting via GraphQL)
- Error context sufficient? (GraphQL error handling, React error boundaries)

**Versioning**:
- Version number assigned? (1.0.0 for initial migration)
- BUILD increments on every change? (semantic versioning)
- Breaking changes handled? (GraphQL schema versioning, gradual migration)

## Project Structure

### Documentation (this feature)
```
specs/001-migration-from-monolithic/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 2: Web application (frontend + backend detected)
backend/                 # Existing Laravel app
├── app/
│   ├── GraphQL/         # New GraphQL layer
│   │   ├── Mutations/
│   │   ├── Queries/
│   │   └── Types/
│   ├── Models/          # Existing models
│   ├── Services/        # Existing services
│   └── Http/           # Existing controllers (legacy)
├── graphql/
│   └── schema.graphql   # GraphQL schema definition
└── tests/
    ├── Feature/         # GraphQL integration tests
    └── Unit/           # GraphQL resolver tests

frontend/               # New Next.js application
├── src/
│   ├── app/            # Next.js 15 App Router
│   ├── components/     # shadcn/ui components
│   ├── lib/           # GraphQL client, utils
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript interfaces
├── public/
└── tests/
    ├── __tests__/     # Component tests
    └── e2e/          # End-to-end tests
```

**Structure Decision**: Option 2 (Web application) - Separate frontend/backend with GraphQL communication

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - GraphQL implementation patterns with Laravel Lighthouse
   - Next.js 14 App Router authentication strategies with external backend
   - Session sharing between Next.js and Laravel domains
   - Real-time features implementation (cart updates, notifications)
   - Payment gateway integration patterns with separated frontend
   - Bilingual content management in Next.js
   - SEO optimization strategies for e-commerce with App Router

2. **Generate and dispatch research agents**:
   ```
   Task: "Research Laravel Lighthouse GraphQL best practices for e-commerce"
   Task: "Research Next.js 15 App Router authentication with external backend"
   Task: "Research session sharing between Next.js and Laravel applications"
   Task: "Research real-time cart updates with GraphQL subscriptions vs polling"
   Task: "Research Kashier payment gateway integration with separated frontend"
   Task: "Research Next.js internationalization for Arabic/English content"
   Task: "Research Next.js 15 App Router SEO optimization for e-commerce"
   Task: "Research shadcn/ui best practices for complex e-commerce flows"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]  
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all technical approach decisions resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - User, Product, Category, Brand, Section entities
   - Cart, CartItem, Order, OrderItem entities  
   - Address, Payment, Return entities
   - Validation rules from existing Laravel models
   - GraphQL type definitions

2. **Generate API contracts** from functional requirements:
   - Authentication mutations (login, register, logout, socialAuth)
   - Product queries (products, categories, brands, sections, search)
   - Cart mutations (add, update, remove, clear)
   - Order mutations (create, cancel) and queries (list, show)
   - Return mutations (create) and queries (list, show)
   - Payment mutations (initiate, confirm) and queries (status)
   - Profile mutations (update, changePassword) and queries (show)
   - Output GraphQL schema to `/contracts/schema.graphql`

3. **Generate contract tests** from contracts:
   - GraphQL schema validation tests
   - Resolver contract tests for each query/mutation
   - Authentication flow integration tests
   - Tests must fail (no GraphQL implementation yet)

4. **Extract test scenarios** from user stories:
   - Complete user journey from browsing to checkout
   - Authentication flows including social login
   - Cart persistence across sessions
   - Order management and return processes
   - Bilingual content switching

5. **Update agent file incrementally** (O(1) operation):
   - Run `/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
   - Add GraphQL, Next.js 15, shadcn/ui context
   - Update with migration-specific patterns
   - Keep under 150 lines for token efficiency

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, .github/copilot-instructions.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Backend tasks: GraphQL schema → resolver tests [P] → resolver implementation
- Frontend tasks: Component tests [P] → page implementation → integration
- Each GraphQL resolver → contract test task [P]
- Each Next.js page → component test task [P]
- Each user flow → end-to-end test task

**Ordering Strategy**:
- TDD order: Schema → tests → resolvers → frontend consumption
- Dependency order: Authentication → products → cart → checkout → orders
- Mark [P] for parallel execution (independent resolvers/components)
- Sequential for dependent flows (auth before protected routes)

**Estimated Output**: 35-45 numbered, ordered tasks in tasks.md covering:
- GraphQL API implementation (15-20 tasks)
- Next.js 15 frontend implementation (15-20 tasks)  
- Integration and testing (5-10 tasks)

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None identified | - | - |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*