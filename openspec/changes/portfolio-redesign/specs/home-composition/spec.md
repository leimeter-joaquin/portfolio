## ADDED Requirements

### Requirement: Home page composes section components in declared order

The system SHALL render `app/src/pages/index.astro` as a composition of `Header`, `Hero`, `Projects`, `Experience`, and `Footer` components in that vertical order.

#### Scenario: Visitor loads the home page

- **WHEN** the home page renders
- **THEN** the DOM order is Header → Hero → Projects → Experience → Footer
- **AND** each section is wrapped in a `<section>` element with a stable `id` matching its anchor

### Requirement: Page replaces the prior clean-slate placeholder

The system SHALL fully remove the placeholder home panel introduced by the clean-slate change and replace it with the composed section layout.

#### Scenario: Build runs after this change ships

- **WHEN** the production build runs
- **THEN** no markup or styles from the prior `home__panel` placeholder are emitted
- **AND** the home page renders only the composed sections

### Requirement: AIChat.vue stays dormant

The system SHALL leave `app/src/components/AIChat.vue` unmounted and unreferenced from the home page composition during this change.

#### Scenario: Home page audit

- **WHEN** the home page DOM is inspected
- **THEN** no instance of `AIChat.vue` is mounted or imported by the page or its components
