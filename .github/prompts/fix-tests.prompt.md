run the tests using the filter provided
use --stop-on-failure to stop at the first failure
figure out why the tests are failing and fix them
- use laravel-boost and laravel-boost-guidelines for Laravel specific guidelines before any action and searching laravel docs
- use docs-mcp-server ( #search_docs ) for searching documentation of other packages like lighthouse or any other package mentioned in the code

most of the tests are failing because of similar reasons, so when you notice a pattern, fix it and add notes in .github/docs/testing-notes.md file for future reference (treat it like a memory)
alsoe refer to the same file for getting help on fixing common issues


iteratively run the tests and fix the issues until all tests pass in the same procedure