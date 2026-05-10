## ADDED Requirements

### Requirement: The app no longer depends on the legacy Gorko styling stack

The application SHALL build without the Gorko package, the Sass-based legacy stylesheet tree, or imports that depend on `src/css/**`.

#### Scenario: Developer installs and builds the app

- **WHEN** dependencies are installed and the Astro app is built
- **THEN** the build succeeds without `gorko` or `sass`
- **AND** no active source file imports the removed legacy stylesheet modules

### Requirement: The reset prunes unused legacy UI files and assets

The application SHALL remove legacy components, routes, and assets that are only present to support the old portfolio implementation.

#### Scenario: Developer inspects the cleaned project

- **WHEN** the reset is complete
- **THEN** obsolete section components, ornamental shared components, and unused media assets from the legacy portfolio are removed

### Requirement: Preserved future modules remain available

The application SHALL preserve `src/components/AIChat.vue`, Vue integration support, and the `animejs` dependency after the reset.

#### Scenario: Developer inspects preserved foundations

- **WHEN** the reset is complete
- **THEN** `AIChat.vue` still exists unchanged in the source tree
- **AND** `vue`, `@astrojs/vue`, and `animejs` remain available in the project configuration
