## ADDED Requirements

### Requirement: Email can be copied to the clipboard

The hero contact block SHALL provide a control beside the email that copies the address to the clipboard and shows brief confirmation feedback. The email SHALL remain a `mailto:` link.

#### Scenario: Visitor copies the email

- **WHEN** the visitor activates the copy control
- **THEN** the email address is written to the clipboard
- **AND** a brief "Copied" confirmation is shown
