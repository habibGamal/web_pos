# Prompt: Clean up GraphQL schema -> replace unnecessary resolvers with Lighthouse directives / model attributes

Objective
- Replace custom resolver wiring in /contracts/schema.graphql with equivalent Lighthouse directives (or direct model attribute fields) when possible.
- Use docs-mcp-server to discover the correct Lighthouse directives and Laravel guidance.
- Run GraphQL tests and fix regressions. Keep changes small, test-driven, and reversible.
