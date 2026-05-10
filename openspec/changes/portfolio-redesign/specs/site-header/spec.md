## ADDED Requirements

### Requirement: Persistent header with brand and nav

The system SHALL render a persistent top header on the home page containing a brand mark (name + role tagline), an anchor navigation list (Work, About, Stack), and a primary "Let's Talk" CTA pill.

#### Scenario: Visitor loads the home page

- **WHEN** the home page renders
- **THEN** the header displays the brand mark on the left and nav + CTA on the right
- **AND** the header remains visible while the visitor is at the top of the page

#### Scenario: Visitor activates a nav anchor

- **WHEN** the visitor clicks a nav item (Work, About, or Stack)
- **THEN** the page smoothly scrolls to the corresponding section anchor
- **AND** the URL hash updates to `#work`, `#about`, or `#stack`

### Requirement: Active nav state reflects scroll position

The system SHALL indicate which section is currently in view by setting `aria-current="true"` on the matching nav link.

#### Scenario: Visitor scrolls into the Projects section

- **WHEN** the Projects section enters the viewport
- **THEN** the "Work" nav link receives `aria-current="true"`
- **AND** all other nav links lose `aria-current`

### Requirement: CTA opens contact channel

The system SHALL open a `mailto:` link to the configured contact email when the "Let's Talk" CTA is activated.

#### Scenario: Visitor clicks Let's Talk

- **WHEN** the visitor clicks the CTA pill
- **THEN** the browser opens a new mail draft addressed to the contact email from mock data
