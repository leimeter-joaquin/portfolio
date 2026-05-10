## ADDED Requirements

### Requirement: Theme toggle switches between light and dark

The system SHALL provide a theme toggle control in the site header that switches the document between light and dark modes by updating `html[data-theme]`.

#### Scenario: Visitor activates the toggle

- **WHEN** the visitor clicks the toggle
- **THEN** `html[data-theme]` flips to the opposite value
- **AND** the toggle label and pressed state update to reflect the new theme

### Requirement: Theme preference persists across visits

The system SHALL persist the visitor's last selected theme to `localStorage` and apply it before first paint on subsequent visits.

#### Scenario: Visitor returns after choosing a theme

- **WHEN** the visitor reloads after selecting a theme
- **THEN** the stored theme is applied during initial bootstrapping before the first paint

### Requirement: Theme transition uses an AnimeJS-driven circular expand

The system SHALL animate the theme change by expanding a colored overlay from the toggle's coordinates outward across the viewport, using AnimeJS to drive the `clip-path` radius.

#### Scenario: Visitor toggles in a motion-enabled environment

- **WHEN** `prefers-reduced-motion: reduce` is not set
- **AND** the visitor clicks the toggle
- **THEN** an overlay element animates a circular `clip-path` from radius 0 at the toggle's center to a radius covering the viewport
- **AND** the overlay's fill matches the incoming theme's canvas color
- **AND** when the animation completes, `html[data-theme]` flips and the overlay resets to radius 0 invisibly

#### Scenario: Visitor toggles with reduced motion

- **WHEN** `prefers-reduced-motion: reduce` is set
- **AND** the visitor clicks the toggle
- **THEN** the theme flips immediately without playing the overlay animation

### Requirement: Toggle is keyboard accessible

The system SHALL make the toggle reachable by keyboard with a visible focus ring and operable via Enter or Space.

#### Scenario: Keyboard user activates the toggle

- **WHEN** the user tabs to the toggle and presses Enter or Space
- **THEN** the theme switches with the same behavior as a click
