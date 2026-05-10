## ADDED Requirements

### Requirement: Typed mock-data module exposes hero, projects, experience, and contact

The system SHALL provide a TypeScript module at `app/src/data/mock.ts` exporting typed values for hero copy, project list, experience list, and contact details, consumed by section components.

#### Scenario: Section component imports mock data

- **WHEN** a section component imports from `@data/mock`
- **THEN** TypeScript types are enforced for `heroCopy`, `projects`, `experience`, and `contact`
- **AND** the build succeeds with strict type checking

### Requirement: Project entries declare a featured flag and gradient stops

The system SHALL require each project entry to declare a unique `id`, `title`, `summary`, `tags`, optional `href`, optional `featured` flag, and a two-color `gradient` tuple used for the placeholder thumbnail.

#### Scenario: Developer adds a project

- **WHEN** a new project entry is added with the required fields
- **THEN** TypeScript accepts the entry and the Projects section renders it on next build

### Requirement: Backend swap requires no section-component edits

The system SHALL keep section components decoupled from the source of data so a future backend swap only changes the import path or module body.

#### Scenario: Backend integration replaces mock module

- **WHEN** the mock module is replaced by a module exporting the same shapes from a real backend
- **THEN** the section components continue to render correctly with no code changes inside them
