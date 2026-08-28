## ADDED Requirements

### Requirement: Experience collection holds the career timeline

The system SHALL provide an `experience` content collection, one markdown file per role, with `company`, `role`, `dateStart`, `dateEnd` (nullable for current), optional `location`, and `summary`. The build SHALL validate each entry and emit them as an `experience` array in `index.json`.

#### Scenario: Experience entries are built

- **WHEN** `npm run build:content` runs
- **THEN** `dist/index.json` includes an `experience` array, one item per file under `experience/`
- **AND** each item validates against the experience schema

#### Scenario: Current role has no end date

- **WHEN** a role is ongoing
- **THEN** its `dateEnd` is `null` and the app renders it as "Present"
