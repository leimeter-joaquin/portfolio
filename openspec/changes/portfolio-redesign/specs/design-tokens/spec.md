## ADDED Requirements

### Requirement: Shared SCSS tokens define color, type, space, and radii

The system SHALL declare design tokens for color, type scale, spacing, radii, and shadow in a single SCSS partial at `app/src/css/_tokens.scss`, consumed by `globals.scss`.

#### Scenario: Developer adjusts a color token

- **WHEN** a developer updates a value in the color token map
- **THEN** the change propagates to every component that consumes the token via CSS custom property

### Requirement: Tokens are surfaced as CSS custom properties per theme

The system SHALL emit tokens as CSS custom properties under `:root` (dark default) and `html[data-theme="light"]`, so theme switching changes only custom-property values without recompiling SCSS.

#### Scenario: Theme flips at runtime

- **WHEN** `html[data-theme]` is changed at runtime
- **THEN** all components reading `var(--color-*)` reflect the new theme's values immediately

### Requirement: Component SCSS reads tokens via custom properties

The system SHALL forbid hardcoded color hex values in component SCSS; component styles MUST consume `var(--color-*)`, `var(--text-*)`, `var(--space-*)`, `var(--radius-*)`, or `var(--shadow-*)` for theme-aware values.

#### Scenario: Reviewer audits a component

- **WHEN** a component scoped style block is reviewed
- **THEN** all theme-sensitive values (color, surface, accent) reference custom properties rather than literal hex
