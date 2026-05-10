## ADDED Requirements

### Requirement: Projects section lists shipped work

The system SHALL render a "Things I've shipped" section that displays one featured project card and a row of two secondary project cards, with a header link to "All projects".

#### Scenario: Visitor scrolls to Projects

- **WHEN** the Projects section enters the viewport
- **THEN** the section header reads "Things I've shipped"
- **AND** one full-width featured card and two equal-width secondary cards are displayed
- **AND** an "All projects" link is rendered in the section header

### Requirement: Project cards show thumbnail, title, summary, and tags

The system SHALL render each project card with a thumbnail area, a title, a one-line summary, and a list of tag chips.

#### Scenario: Card renders for a project entry

- **WHEN** a project entry from mock data is passed to the card component
- **THEN** the card displays the project's title, summary, and tags
- **AND** the thumbnail area renders a CSS gradient defined by the project's `gradient` field

### Requirement: Project list reads from mock data

The system SHALL source the project list from the mock-data module, with the featured card being the first entry whose `featured` flag is true.

#### Scenario: Mock data has one featured and two non-featured projects

- **WHEN** the Projects section renders
- **THEN** the featured project occupies the wide top card
- **AND** the next two non-featured projects fill the secondary row in their declared order

### Requirement: Project cards lift on hover

The system SHALL apply a subtle elevation effect when a project card is hovered, using CSS transitions.

#### Scenario: Visitor hovers a card

- **WHEN** the pointer enters a project card
- **THEN** the card translates upward by a small amount and the shadow strengthens
- **AND** the effect reverses smoothly when the pointer leaves
