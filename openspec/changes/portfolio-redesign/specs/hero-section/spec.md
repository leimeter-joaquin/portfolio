## ADDED Requirements

### Requirement: Hero displays headline, bio, and meta block

The system SHALL render a Hero section as the first content block on the home page, containing a multi-line display headline with an accent-colored phrase, a paragraph bio, and a meta block listing role, location, email, GitHub, and LinkedIn.

#### Scenario: Visitor opens the home page

- **WHEN** the home page first renders
- **THEN** the Hero section displays the headline "I build the whole system, interface to infrastructure." with the phrase "whole system" rendered in the accent color
- **AND** the bio paragraph is shown below the headline
- **AND** the meta block lists location, email, GitHub, and LinkedIn pulled from mock data

### Requirement: Hero copy reads from mock data

The system SHALL source all Hero text content from the typed mock-data module rather than hardcoding strings inside the component template.

#### Scenario: Mock data is updated

- **WHEN** a developer edits the hero entry in `app/src/data/mock.ts`
- **THEN** the Hero section reflects the change on next build with no component edits required

### Requirement: Hero animates in on mount

The system SHALL play a word-staggered fade-in animation on the headline when the page loads, unless the visitor's environment requests reduced motion.

#### Scenario: Visitor with motion enabled loads the page

- **WHEN** the page mounts and `prefers-reduced-motion: reduce` is not set
- **THEN** the headline words fade and rise into view sequentially

#### Scenario: Visitor with reduced motion loads the page

- **WHEN** the page mounts and `prefers-reduced-motion: reduce` is set
- **THEN** the headline appears immediately with no animation
