## ADDED Requirements

### Requirement: Footer renders below all sections

The system SHALL render a Footer at the bottom of the home page containing copyright text and links to GitHub and LinkedIn.

#### Scenario: Visitor reaches the bottom of the page

- **WHEN** the visitor scrolls past the Experience section
- **THEN** a footer is visible with copyright text and social links
- **AND** the social links target the URLs from the contact mock data

### Requirement: Copyright year is current

The system SHALL render the current four-digit year in the footer copyright string at build time.

#### Scenario: Site is built in any given year

- **WHEN** the site is built
- **THEN** the footer copyright shows the four-digit year matching the build's current year
