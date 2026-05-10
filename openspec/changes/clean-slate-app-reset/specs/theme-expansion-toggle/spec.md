## ADDED Requirements

### Requirement: Visitors can still switch between light and dark themes

The system SHALL provide a theme toggle in the clean-slate shell that switches between light and dark modes.

#### Scenario: Visitor toggles the theme

- **WHEN** the visitor activates the theme control
- **THEN** the document theme changes between light and dark
- **AND** the active theme state is reflected immediately in the shell

### Requirement: Theme preference persists across visits

The system SHALL store the visitor's last selected theme and apply it before first paint on later visits.

#### Scenario: Visitor reloads after choosing a theme

- **WHEN** the visitor has previously selected a theme
- **THEN** the stored theme is applied during initial page bootstrapping

### Requirement: Expanding transition behavior is preserved

The system SHALL preserve the expanding light/dark transition effect when the theme is toggled, with graceful fallback if the supporting browser API is unavailable.

#### Scenario: Visitor toggles theme in a supported browser

- **WHEN** the browser supports the required transition API
- **THEN** the theme change plays the expanding transition effect

#### Scenario: Visitor toggles theme in an unsupported browser

- **WHEN** the browser does not support the transition API
- **THEN** the theme still changes successfully without throwing errors
