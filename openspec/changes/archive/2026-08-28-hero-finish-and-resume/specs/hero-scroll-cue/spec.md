## ADDED Requirements

### Requirement: Hero shows a scroll-down cue

The hero SHALL display an accessible scroll-down indicator at its bottom that links to the Projects section (`#work`). The indicator's looping animation SHALL be disabled when `prefers-reduced-motion: reduce` is set. The indicator SHALL have an accessible label.

#### Scenario: Visitor with motion enabled

- **WHEN** the hero renders and reduced motion is not requested
- **THEN** a scroll-down indicator animates at the bottom of the hero
- **AND** activating it scrolls to the Projects section

#### Scenario: Visitor with reduced motion

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** the indicator is shown without looping animation
