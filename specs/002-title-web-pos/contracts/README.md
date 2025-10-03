# GraphQL Contracts: Web–POS Communication Service

**Feature**: 002-title-web-pos  
**Date**: 2025-10-02

## Overview
This directory contains all GraphQL schema contracts that define the API interface between frontend and backend. These contracts must be implemented BEFORE any resolver code is written (Test-First Development).

---

## File Structure

```
contracts/
├── README.md                    # This file
├── orders-schema.graphql        # Order status management (frontend + admin queries)
├── products-schema.graphql      # Stock display fields
├── settings-schema.graphql      # Configuration queries (public frontend settings)
└── pos-schema.graphql           # POS system mutations (protected by API key)
```

**Note**: Admin functionality (dead-letter management, settings management, order management) is handled exclusively via **Filament** resources, NOT GraphQL. The GraphQL API serves only:
- Frontend (Next.js customer-facing app)
- POS system (protected mutations with API key guard)

---

## Contract Testing Requirements

All contracts MUST have corresponding contract tests before implementation:

```php
// tests/Contract/GraphQLOrderSchemaTest.php
it('validates order status enum matches schema', function () {
    $schema = file_get_contents(base_path('graphql/orders.graphql'));
    foreach (OrderStatus::cases() as $case) {
        expect($schema)->toContain($case->value);
    }
});

it('validates OrderStatusHistory type exists', function () {
    $result = $this->graphQL('
        query {
            __type(name: "OrderStatusHistory") {
                name
                fields { name type { name } }
            }
        }
    ');
    
    $result->assertJson([
        'data' => [
            '__type' => [
                'name' => 'OrderStatusHistory',
            ],
        ],
    ]);
});
```

---

## Schema Validation

Run before every commit:
```bash
php artisan lighthouse:validate-schema
```

After schema changes, regenerate frontend types:
```bash
cd frontend && npm run codegen
```

---

## Implementation Notes

1. **Use Lighthouse Directives**: Prefer `@rules`, `@can`, `@count`, `@where` over custom resolvers
2. **Localized Fields**: Use `@localized` directive for bilingual fields
3. **Pagination**: Use relay-style pagination for lists (`@paginate`)
4. **Authorization**: Use `@can` directive for permission checks (customer actions)
5. **Validation**: Use `@rules` directive for input validation
6. **POS Authentication**: Use `@guard(with: ["pos"])` for POS-specific mutations
7. **Admin Panel**: Use Filament resources for all admin operations (dead-letter, settings, bulk actions)

---

See individual `.graphql` files for detailed schemas.
