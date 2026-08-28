## MODIFIED Requirements

### Requirement: Hero bio renders statically

The hero bio SHALL render as static text on load. The prior character-by-character typewrite animation SHALL be removed. The headline word-staggered entrance animation SHALL be retained, including its `prefers-reduced-motion` fallback.

#### Scenario: Visitor loads the page

- **WHEN** the home page mounts
- **THEN** the bio paragraph is fully visible immediately with no typing effect
- **AND** the headline words still fade and rise into view sequentially when motion is enabled

#### Scenario: Visitor with reduced motion loads the page

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** both the headline and bio appear immediately with no animation
