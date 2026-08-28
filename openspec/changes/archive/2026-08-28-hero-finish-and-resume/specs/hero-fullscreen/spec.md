## ADDED Requirements

### Requirement: Hero fills the viewport

The hero section SHALL occupy at least the full viewport height below the sticky header, with its content vertically centered, using small/dynamic viewport units so mobile browser chrome does not clip it. The existing 900px responsive layout breakpoint SHALL be preserved.

#### Scenario: Visitor opens the home page on desktop

- **WHEN** the home page first renders
- **THEN** the hero spans the viewport height below the header
- **AND** the hero content is vertically centered

#### Scenario: Visitor opens the home page on mobile

- **WHEN** the page renders on a mobile viewport with dynamic browser chrome
- **THEN** the hero height tracks the visible viewport without being clipped
