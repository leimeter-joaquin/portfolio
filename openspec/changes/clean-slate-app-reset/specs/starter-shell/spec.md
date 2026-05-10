## ADDED Requirements

### Requirement: Homepage renders as a clean-slate shell

The system SHALL render the root route as a minimal Astro starter-like page rather than the current multi-section portfolio.

#### Scenario: Visitor opens the homepage

- **WHEN** a visitor loads `/`
- **THEN** the page shows only the simplified clean-slate shell content
- **AND** the page does not render the legacy portfolio sections for hero, expertise, projects, or contact

### Requirement: Legacy shared site chrome is removed from the active UI

The system SHALL not render the legacy header, footer, or background SVG layers in the clean-slate experience.

#### Scenario: Visitor views the active shell

- **WHEN** the homepage is rendered
- **THEN** no legacy shared chrome components are mounted
- **AND** the live UI behaves like a near-fresh Astro start rather than the previous portfolio site
