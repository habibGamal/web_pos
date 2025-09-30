# Refactor Prompt - analyze & refactor page against best-practices

Goal
- Analyze a given page (code or markup) against the canonical best-practices stored at `.github/docs/best-practices-notes.md`.
- Refactor the code to follow those best-practices.
- Combine and enforce the documentation-search and tool-usage rules from `doc-search.prompt.md`:
    - Use laravel-boost and laravel-boost-guidelines for Laravel-specific guidance before any change.
    - Use shadcn MCP tools for shadcn/ui documentation before UI changes.
    - Use docs-mcp-server (`search_docs` / `list_libraries`) for searching other package docs.
- Persist any discovered or consolidated best-practices into `.github/docs/best-practices-notes.md`.

Example search_docs usage (for the agent)
- Confirm libraries:
    - list_libraries -> ensure "nextjs", "lighthouse", "shadcn", "laravel" exist
- Example queries:
    - { tool: "search_docs", parameters: { library: "nextjs", query: "app router data fetching best practices", limit: 5 } }
    - { tool: "search_docs", parameters: { library: "shadcn", query: "skeleton loading state pattern", limit: 5 } }
    - { tool: "search_docs", parameters: { library: "lighthouse", query: "graphql pagination cursor best practices", limit: 5 } }
