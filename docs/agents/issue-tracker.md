# Issue tracker: Local Markdown

Issues and specifications for this repository live as Markdown files under `.scratch/`.

## Conventions

- Use one directory per feature: `.scratch/<feature-slug>/`.
- Store the feature specification at `.scratch/<feature-slug>/spec.md`.
- Store implementation tickets individually at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`.
- Append discussion and decision history under a `## Comments` heading in the relevant file.
- Do not publish or mirror these issues to GitHub Issues unless the repository configuration is explicitly changed later.

## Publishing work

When a skill says to publish a specification or ticket, create the corresponding Markdown file under `.scratch/<feature-slug>/`, creating its directories when needed.

## Fetching work

When a skill needs a specification or ticket, read the referenced file under `.scratch/`. The user will normally provide its path or ticket number.

## Wayfinding operations

When a workflow uses a map with child tickets:

- Store the map at `.scratch/<effort>/map.md`.
- Store each child at `.scratch/<effort>/issues/<NN>-<slug>.md`.
- Record the ticket type in a `Type:` line and its state in a `Status:` line.
- Record dependencies with `Blocked by: NN, NN`.
- Claim an available ticket by changing its status to `claimed` before working on it.
- Resolve it by appending an `## Answer` section, changing its status to `resolved`, and recording the decision in the map.
