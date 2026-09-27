# Domain documentation

This repository uses a single-context domain documentation layout.

## Before exploring or changing the codebase

- Read `CONTEXT.md` at the repository root when it exists.
- Read the relevant architecture decision records under `docs/adr/` when they exist.
- If these files do not exist yet, proceed without treating their absence as an error. Domain-modeling workflows create them when terminology and decisions are actually resolved.

## Expected structure

```text
/
|-- CONTEXT.md
|-- docs/
|   `-- adr/
`-- src/
```

## Use the established vocabulary

Use domain terms as defined in `CONTEXT.md` in specifications, ticket titles, tests, interfaces, and implementation proposals. Avoid introducing synonyms for concepts that already have an agreed name.

If a necessary concept is missing, treat that as a domain-modeling question rather than silently inventing permanent terminology.

## Respect architecture decisions

If proposed work contradicts an existing ADR, identify the conflict explicitly. Do not silently override an accepted decision.
